// dice-universal/features/roll3d/components/DiceTable3D.tsx

import { useCallback, useEffect, useRef } from "react";
import { View } from "react-native";
import { GLView, type ExpoWebGLRenderingContext } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";

import { createDiceMesh } from "../renderer/DiceMeshFactory";
import { Roll3DPhysicsWorld } from "../physics/Roll3DPhysicsWorld";
import type { Roll3DDieInstance } from "../types";
import type { Roll3DPhysicsTransform } from "../physics/Roll3DPhysicsTypes";

type DiceTable3DProps = {
  height?: number;
  diceInstances?: Roll3DDieInstance[];
  rollRequestId?: number;
  skipRollRequestId?: number;
  onPhysicsRollSettled?: () => void;
};

type DiceDropState = {
  startPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;

  startRotation: THREE.Euler;
  targetRotation: THREE.Euler;
};

type DiceSceneItem = {
  id: string;
  mesh: THREE.Group;
  shadow: THREE.Mesh;
  physicsActive: boolean;
};

type DiceVisualTransform = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
};

/**
 * Scène cible :
 * le smartphone est une ouverture vue du dessus.
 * La table est le fond du téléphone.
 * Les dés tombent dans cette "boîte/table" intérieure.
 */
const TABLE_SURFACE_Y = -1.15;

const TABLE_WIDTH = 5.8;
const TABLE_DEPTH = 8.4;
const TABLE_WALL_HEIGHT = 0.46;
const TABLE_WALL_THICKNESS = 0.12;

const DROP_START_Y = 3.2;
const DROP_TARGET_SCALE = 0.4;

const TARGET_X_RANGE = 1.45;
const TARGET_Z_RANGE = 2.25;

function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;

    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    const material = mesh.material;

    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else if (material) {
      material.dispose();
    }
  });
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createRandomRotation() {
  return new THREE.Euler(
    randomBetween(-0.35, 0.35),
    randomBetween(-0.45, 0.45),
    randomBetween(-0.22, 0.22),
  );
}

function createRandomTargetXZ() {
  return {
    x: randomBetween(-TARGET_X_RANGE, TARGET_X_RANGE),
    z: randomBetween(-TARGET_Z_RANGE, TARGET_Z_RANGE),
  };
}

/**
 * Départ presque au-dessus de la position finale.
 * Ça donne une chute droite vue du dessus.
 */
function createDropStartPosition(targetX: number, targetZ: number) {
  return new THREE.Vector3(targetX * 0.15, DROP_START_Y, targetZ * 0.15);
}

/**
 * Calcule la bonne hauteur finale pour que le dé repose sur la table,
 * peu importe sa forme : d4, d6, d10, d100...
 */
function computeRestingPosition(params: {
  dice: THREE.Group;
  x: number;
  z: number;
  rotation: THREE.Euler;
  scale: number;
}) {
  const { dice, x, z, rotation, scale } = params;

  dice.position.set(x, 0, z);
  dice.rotation.copy(rotation);
  dice.scale.setScalar(scale);
  dice.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(dice);
  const bottomY = box.min.y;

  return new THREE.Vector3(x, TABLE_SURFACE_Y - bottomY, z);
}

function toPhysicsTransform(mesh: THREE.Object3D): Roll3DPhysicsTransform {
  mesh.updateMatrixWorld(true);

  return {
    position: {
      x: mesh.position.x,
      y: mesh.position.y,
      z: mesh.position.z,
    },
    quaternion: {
      x: mesh.quaternion.x,
      y: mesh.quaternion.y,
      z: mesh.quaternion.z,
      w: mesh.quaternion.w,
    },
  };
}

function applyPhysicsTransform(
  mesh: THREE.Object3D,
  transform: Roll3DPhysicsTransform,
) {
  mesh.position.set(
    transform.position.x,
    transform.position.y,
    transform.position.z,
  );

  mesh.quaternion.set(
    transform.quaternion.x,
    transform.quaternion.y,
    transform.quaternion.z,
    transform.quaternion.w,
  );
}

function createInteriorTable() {
  const group = new THREE.Group();
  group.name = "top-down-phone-dice-tray";

  const floorGeometry = new THREE.PlaneGeometry(TABLE_WIDTH, TABLE_DEPTH);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: "#070A12",
    roughness: 0.96,
    metalness: 0.03,
  });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.name = "phone-tray-floor";
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = TABLE_SURFACE_Y;
  group.add(floor);

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: "#101522",
    roughness: 0.82,
    metalness: 0.16,
    emissive: "#040711",
    emissiveIntensity: 0.14,
  });

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(TABLE_WALL_THICKNESS, TABLE_WALL_HEIGHT, TABLE_DEPTH),
    wallMaterial,
  );
  leftWall.name = "phone-tray-left-wall";
  leftWall.position.set(
    -TABLE_WIDTH / 2,
    TABLE_SURFACE_Y + TABLE_WALL_HEIGHT / 2,
    0,
  );
  group.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(TABLE_WALL_THICKNESS, TABLE_WALL_HEIGHT, TABLE_DEPTH),
    wallMaterial,
  );
  rightWall.name = "phone-tray-right-wall";
  rightWall.position.set(
    TABLE_WIDTH / 2,
    TABLE_SURFACE_Y + TABLE_WALL_HEIGHT / 2,
    0,
  );
  group.add(rightWall);

  const topWall = new THREE.Mesh(
    new THREE.BoxGeometry(TABLE_WIDTH, TABLE_WALL_HEIGHT, TABLE_WALL_THICKNESS),
    wallMaterial,
  );
  topWall.name = "phone-tray-top-wall";
  topWall.position.set(
    0,
    TABLE_SURFACE_Y + TABLE_WALL_HEIGHT / 2,
    -TABLE_DEPTH / 2,
  );
  group.add(topWall);

  const bottomWall = new THREE.Mesh(
    new THREE.BoxGeometry(TABLE_WIDTH, TABLE_WALL_HEIGHT, TABLE_WALL_THICKNESS),
    wallMaterial,
  );
  bottomWall.name = "phone-tray-bottom-wall";
  bottomWall.position.set(
    0,
    TABLE_SURFACE_Y + TABLE_WALL_HEIGHT / 2,
    TABLE_DEPTH / 2,
  );
  group.add(bottomWall);

  const borderGeometry = new THREE.EdgesGeometry(
    new THREE.BoxGeometry(TABLE_WIDTH, 0.04, TABLE_DEPTH),
  );

  const borderMaterial = new THREE.LineBasicMaterial({
    color: "#E8C878",
    transparent: true,
    opacity: 0.22,
  });

  const border = new THREE.LineSegments(borderGeometry, borderMaterial);
  border.name = "phone-tray-subtle-border";
  border.position.set(0, TABLE_SURFACE_Y + 0.03, 0);
  group.add(border);

  return group;
}

function createContactShadow() {
  const geometry = new THREE.CircleGeometry(0.4, 36);
  const material = new THREE.MeshBasicMaterial({
    color: "#000000",
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
  });

  const shadow = new THREE.Mesh(geometry, material);
  shadow.name = "dice-contact-shadow";
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, TABLE_SURFACE_Y + 0.006, 0);
  shadow.scale.set(0.48, 0.48, 0.48);

  return shadow;
}

function updateContactShadow(params: {
  shadow: THREE.Mesh;
  dice: THREE.Group;
  progress: number;
  visible: boolean;
}) {
  const { shadow, dice, progress, visible } = params;

  const material = shadow.material as THREE.MeshBasicMaterial;

  shadow.visible = visible;

  if (!visible) {
    material.opacity = 0;
    return;
  }

  shadow.position.x = dice.position.x;
  shadow.position.z = dice.position.z;
  shadow.position.y = TABLE_SURFACE_Y + 0.006;

  const opacity = lerp(0.035, 0.22, progress);
  const scale = lerp(0.2, 0.48, progress);

  material.opacity = opacity;
  shadow.scale.set(scale, scale * 0.72, scale);
}

export function DiceTable3D({
  height = 320,
  diceInstances = [],
  rollRequestId = 0,
  skipRollRequestId = 0,
  onPhysicsRollSettled,
}: DiceTable3DProps) {
  const animationFrameRef = useRef<number | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const diceItemsRef = useRef<Map<string, DiceSceneItem>>(new Map());

  const physicsWorldRef = useRef<Roll3DPhysicsWorld | null>(null);
  const lastFrameAtRef = useRef<number | null>(null);
  const physicsActiveRef = useRef(false);
  const physicsRollModeRef = useRef<"idle" | "adding" | "rolling">("idle");
  const physicsSettledNotifiedRef = useRef(false);
  const settleDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const onPhysicsRollSettledRef = useRef(onPhysicsRollSettled);
  const activePhysicsRollIdRef = useRef(0);
  const lastHandledRollRequestIdRef = useRef(0);
  const lastHandledSkipRollRequestIdRef = useRef(0);
  const skipTransitionFrameRef = useRef<number | null>(null);

  useEffect(() => {
    onPhysicsRollSettledRef.current = onPhysicsRollSettled;
  }, [onPhysicsRollSettled]);

  const createDropStateForMesh = useCallback(
    (mesh: THREE.Group): DiceDropState => {
      const targetXZ = createRandomTargetXZ();
      const targetRotation = createRandomRotation();

      const targetPosition = computeRestingPosition({
        dice: mesh,
        x: targetXZ.x,
        z: targetXZ.z,
        rotation: targetRotation,
        scale: DROP_TARGET_SCALE,
      });

      const startPosition = createDropStartPosition(
        targetPosition.x,
        targetPosition.z,
      );

      const startRotation = new THREE.Euler(
        randomBetween(-Math.PI, Math.PI),
        randomBetween(-Math.PI, Math.PI),
        randomBetween(-Math.PI, Math.PI),
      );

      return {
        startPosition,
        targetPosition,
        startRotation,
        targetRotation,
      };
    },
    [],
  );

  const addDiceInstanceToScene = useCallback(
    (scene: THREE.Scene, instance: Roll3DDieInstance, animate = true) => {
      if (diceItemsRef.current.has(instance.id)) return;

      const mesh = createDiceMesh({
        sides: instance.sides,
        skinId: "graphite_default",
      });

      const shadow = createContactShadow();

      const dropState = createDropStateForMesh(mesh);

      if (animate) {
        mesh.position.copy(dropState.startPosition);
        mesh.rotation.copy(dropState.startRotation);
        mesh.scale.setScalar(DROP_TARGET_SCALE);

        updateContactShadow({
          shadow,
          dice: mesh,
          progress: 0,
          visible: false,
        });
      } else {
        mesh.position.copy(dropState.targetPosition);
        mesh.rotation.copy(dropState.targetRotation);
        mesh.scale.setScalar(DROP_TARGET_SCALE);

        updateContactShadow({
          shadow,
          dice: mesh,
          progress: 1,
          visible: true,
        });
      }

      scene.add(shadow);
      scene.add(mesh);

      diceItemsRef.current.set(instance.id, {
        id: instance.id,
        mesh,
        shadow,
        physicsActive: animate,
      });

      if (animate) {
        const physicsWorld = physicsWorldRef.current;

        if (physicsWorld) {
          physicsWorld.addDie(instance, toPhysicsTransform(mesh), {
            launchMode: "drop",
          });

          physicsActiveRef.current = true;
          physicsRollModeRef.current = "adding";
          lastFrameAtRef.current = Date.now();
        }
      }
    },
    [createDropStateForMesh],
  );

  const startPhysicsRoll = useCallback(() => {
    const physicsWorld = physicsWorldRef.current;
    if (!physicsWorld) return;

    const currentRollId = activePhysicsRollIdRef.current + 1;
    activePhysicsRollIdRef.current = currentRollId;

    physicsWorld.clearDice();

    physicsSettledNotifiedRef.current = false;

    if (settleDelayTimeoutRef.current != null) {
      clearTimeout(settleDelayTimeoutRef.current);
      settleDelayTimeoutRef.current = null;
    }

    for (const instance of diceInstances) {
      const item = diceItemsRef.current.get(instance.id);
      if (!item) continue;

      /**
       * 2.0H :
       * Le lancer repart depuis la position actuelle du dé sur la table.
       * On ne le replace plus en hauteur.
       */
      item.physicsActive = true;

      item.mesh.scale.setScalar(DROP_TARGET_SCALE);
      item.mesh.updateMatrixWorld(true);

      updateContactShadow({
        shadow: item.shadow,
        dice: item.mesh,
        progress: 1,
        visible: true,
      });

      physicsWorld.addDie(instance, toPhysicsTransform(item.mesh), {
        launchMode: "surface_roll",
      });
    }

    physicsActiveRef.current = true;
    physicsRollModeRef.current = "rolling";
    lastFrameAtRef.current = Date.now();
  }, [diceInstances]);

  const applyPhysicsSnapshotsToMeshes = useCallback(() => {
    const physicsWorld = physicsWorldRef.current;
    if (!physicsWorld) return false;

    const snapshots = physicsWorld.getDiceSnapshots();
    let allSleeping = snapshots.length > 0;

    for (const snapshot of snapshots) {
      const item = diceItemsRef.current.get(snapshot.id);
      if (!item) continue;

      applyPhysicsTransform(item.mesh, snapshot.transform);

      updateContactShadow({
        shadow: item.shadow,
        dice: item.mesh,
        progress: 1,
        visible: true,
      });

      if (!snapshot.sleeping) {
        allSleeping = false;
      }
    }

    return allSleeping;
  }, []);

  const captureCurrentDiceTransforms = useCallback(() => {
    const transforms = new Map<string, DiceVisualTransform>();

    for (const [id, item] of diceItemsRef.current.entries()) {
      transforms.set(id, {
        position: item.mesh.position.clone(),
        quaternion: item.mesh.quaternion.clone(),
      });
    }

    return transforms;
  }, []);

  const createCinematicSettleTransforms = useCallback(() => {
    const transforms = new Map<string, DiceVisualTransform>();
    const items = Array.from(diceItemsRef.current.entries());

    const diceCount = items.length;

    if (diceCount === 0) {
      return transforms;
    }

    /**
     * Zone sûre légèrement rentrée dans les murs.
     * On évite de placer les dés trop près des bordures.
     */
    const safeX = TABLE_WIDTH / 2 - 0.58;
    const safeZ = TABLE_DEPTH / 2 - 0.72;

    /**
     * Grille souple :
     * elle permet d'éviter les gros chevauchements quand il y a beaucoup de dés.
     * Ce n'est pas une grille visible parfaite, car on ajoute du jitter.
     */
    const columns = Math.max(
      1,
      Math.ceil(Math.sqrt(diceCount * (TABLE_WIDTH / TABLE_DEPTH))),
    );

    const rows = Math.max(1, Math.ceil(diceCount / columns));

    const spacingX = columns <= 1 ? 0 : (safeX * 2) / (columns - 1);
    const spacingZ = rows <= 1 ? 0 : (safeZ * 2) / (rows - 1);

    /**
     * On trie les dés selon leur position actuelle pour que la transition
     * soit lisible et évite de traverser toute la table dans tous les sens.
     */
    const sortedItems = [...items].sort((a, b) => {
      const meshA = a[1].mesh;
      const meshB = b[1].mesh;

      if (Math.abs(meshA.position.z - meshB.position.z) > 0.2) {
        return meshA.position.z - meshB.position.z;
      }

      return meshA.position.x - meshB.position.x;
    });

    sortedItems.forEach(([id, item], index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);

      const baseX = columns <= 1 ? 0 : -safeX + column * spacingX;
      const baseZ = rows <= 1 ? 0 : -safeZ + row * spacingZ;

      /**
       * Petit décalage pour éviter l'effet trop rangé.
       * Plus il y a de dés, plus le jitter est faible.
       */
      const jitterScale =
        diceCount >= 36 ? 0.08 : diceCount >= 18 ? 0.12 : 0.18;

      const targetX = clamp(
        baseX + randomBetween(-jitterScale, jitterScale),
        -safeX,
        safeX,
      );

      const targetZ = clamp(
        baseZ + randomBetween(-jitterScale, jitterScale),
        -safeZ,
        safeZ,
      );

      const finalRotation = createRandomRotation();
      const finalQuaternion = new THREE.Quaternion().setFromEuler(
        finalRotation,
      );

      /**
       * On calcule une hauteur de repos correcte sans laisser le mesh muté.
       */
      const originalPosition = item.mesh.position.clone();
      const originalQuaternion = item.mesh.quaternion.clone();
      const originalScale = item.mesh.scale.clone();

      item.mesh.position.set(targetX, 0, targetZ);
      item.mesh.quaternion.copy(finalQuaternion);
      item.mesh.scale.setScalar(DROP_TARGET_SCALE);
      item.mesh.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(item.mesh);
      const finalY = TABLE_SURFACE_Y - box.min.y;

      item.mesh.position.copy(originalPosition);
      item.mesh.quaternion.copy(originalQuaternion);
      item.mesh.scale.copy(originalScale);
      item.mesh.updateMatrixWorld(true);

      transforms.set(id, {
        position: new THREE.Vector3(targetX, finalY, targetZ),
        quaternion: finalQuaternion,
      });
    });

    return transforms;
  }, []);

  const animateDiceToFinalTransforms = useCallback(
    (
      startTransforms: Map<string, DiceVisualTransform>,
      finalTransforms: Map<string, DiceVisualTransform>,
      onComplete: () => void,
    ) => {
      if (skipTransitionFrameRef.current != null) {
        cancelAnimationFrame(skipTransitionFrameRef.current);
        skipTransitionFrameRef.current = null;
      }

      const startedAt = Date.now();
      const diceCount = finalTransforms.size;
      const durationMs = diceCount >= 24 ? 420 : diceCount >= 12 ? 380 : 320;

      const animate = () => {
        const progress = clamp01((Date.now() - startedAt) / durationMs);
        const easedProgress = easeOutCubic(progress);

        for (const [id, finalTransform] of finalTransforms.entries()) {
          const item = diceItemsRef.current.get(id);
          const startTransform = startTransforms.get(id);

          if (!item || !startTransform) continue;

          item.mesh.position.lerpVectors(
            startTransform.position,
            finalTransform.position,
            easedProgress,
          );

          item.mesh.quaternion
            .copy(startTransform.quaternion)
            .slerp(finalTransform.quaternion, easedProgress);

          updateContactShadow({
            shadow: item.shadow,
            dice: item.mesh,
            progress: 1,
            visible: true,
          });
        }

        if (progress < 1) {
          skipTransitionFrameRef.current = requestAnimationFrame(animate);
          return;
        }

        skipTransitionFrameRef.current = null;

        for (const [id, finalTransform] of finalTransforms.entries()) {
          const item = diceItemsRef.current.get(id);
          if (!item) continue;

          item.mesh.position.copy(finalTransform.position);
          item.mesh.quaternion.copy(finalTransform.quaternion);

          updateContactShadow({
            shadow: item.shadow,
            dice: item.mesh,
            progress: 1,
            visible: true,
          });
        }

        onComplete();
      };

      animate();
    },
    [],
  );

  const fastForwardPhysicsRollToRest = useCallback(() => {
    const physicsWorld = physicsWorldRef.current;

    if (!physicsWorld || physicsRollModeRef.current !== "rolling") {
      return;
    }

    activePhysicsRollIdRef.current += 1;

    if (settleDelayTimeoutRef.current != null) {
      clearTimeout(settleDelayTimeoutRef.current);
      settleDelayTimeoutRef.current = null;
    }

    if (skipTransitionFrameRef.current != null) {
      cancelAnimationFrame(skipTransitionFrameRef.current);
      skipTransitionFrameRef.current = null;
    }

    /**
     * Stratégie pérenne :
     * le tap ne tente plus de finir toute la physique.
     * Il déclenche une transition cinématique stable, beaucoup plus fluide
     * avec un grand nombre de dés.
     */
    const startTransforms = captureCurrentDiceTransforms();
    const finalTransforms = createCinematicSettleTransforms();

    physicsActiveRef.current = false;
    physicsRollModeRef.current = "idle";
    physicsSettledNotifiedRef.current = true;
    lastFrameAtRef.current = Date.now();

    for (const item of diceItemsRef.current.values()) {
      item.physicsActive = false;
    }

    physicsWorld.clearDice();

    animateDiceToFinalTransforms(startTransforms, finalTransforms, () => {
      onPhysicsRollSettledRef.current?.();
    });
  }, [
    animateDiceToFinalTransforms,
    captureCurrentDiceTransforms,
    createCinematicSettleTransforms,
  ]);

  useEffect(() => {
    const diceItems = diceItemsRef.current;

    return () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (skipTransitionFrameRef.current != null) {
        cancelAnimationFrame(skipTransitionFrameRef.current);
        skipTransitionFrameRef.current = null;
      }

      if (settleDelayTimeoutRef.current != null) {
        clearTimeout(settleDelayTimeoutRef.current);
        settleDelayTimeoutRef.current = null;
      }

      physicsWorldRef.current?.reset();

      for (const item of diceItems.values()) {
        disposeObject3D(item.mesh);
        disposeObject3D(item.shadow);
      }

      diceItems.clear();
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const nextIds = new Set(diceInstances.map((instance) => instance.id));

    for (const [id, item] of diceItemsRef.current.entries()) {
      if (!nextIds.has(id)) {
        scene.remove(item.mesh);
        scene.remove(item.shadow);

        disposeObject3D(item.mesh);
        disposeObject3D(item.shadow);

        diceItemsRef.current.delete(id);
        physicsWorldRef.current?.removeDie(id);
      }
    }

    for (const instance of diceInstances) {
      addDiceInstanceToScene(scene, instance, true);
    }

    if (diceInstances.length === 0) {
      activePhysicsRollIdRef.current += 1;
      physicsWorldRef.current?.clearDice();
      physicsActiveRef.current = false;
      physicsRollModeRef.current = "idle";

      if (settleDelayTimeoutRef.current != null) {
        clearTimeout(settleDelayTimeoutRef.current);
        settleDelayTimeoutRef.current = null;
      }
    }
  }, [diceInstances, addDiceInstanceToScene]);

  useEffect(() => {
    if (rollRequestId <= 0) return;

    if (lastHandledRollRequestIdRef.current === rollRequestId) {
      return;
    }

    lastHandledRollRequestIdRef.current = rollRequestId;
    startPhysicsRoll();
  }, [rollRequestId, startPhysicsRoll]);

  useEffect(() => {
    if (skipRollRequestId <= 0) return;

    if (lastHandledSkipRollRequestIdRef.current === skipRollRequestId) {
      return;
    }

    lastHandledSkipRollRequestIdRef.current = skipRollRequestId;
    fastForwardPhysicsRollToRest();
  }, [skipRollRequestId, fastForwardPhysicsRollToRest]);

  function handleContextCreate(gl: ExpoWebGLRenderingContext) {
    const { drawingBufferWidth: width, drawingBufferHeight: bufferHeight } = gl;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050713");

    sceneRef.current = scene;
    physicsWorldRef.current = new Roll3DPhysicsWorld();

    const cameraFov = 42;
    const cameraAspect = width / bufferHeight;

    /**
     * On cadre surtout la largeur pour que les murs latéraux restent visibles,
     * puis on accepte que la profondeur dépasse légèrement visuellement.
     * Les murs physiques restent plus hauts et plus grands pour empêcher les dés
     * de sortir de la table.
     */
    const widthMargin = 1.06;
    const depthMargin = 0.82;

    const camera = new THREE.PerspectiveCamera(
      cameraFov,
      cameraAspect,
      0.1,
      100,
    );

    const fovRadians = THREE.MathUtils.degToRad(cameraFov);

    const distanceForWidth =
      (TABLE_WIDTH * widthMargin) /
      (2 * Math.tan(fovRadians / 2) * cameraAspect);

    const distanceForDepth =
      (TABLE_DEPTH * depthMargin) / (2 * Math.tan(fovRadians / 2));

    const cameraDistance = Math.max(distanceForWidth, distanceForDepth * 0.88);

    camera.position.set(0, TABLE_SURFACE_Y + cameraDistance, 0.22);
    camera.lookAt(0, TABLE_SURFACE_Y, 0);

    const renderer = new Renderer({ gl });
    renderer.setSize(width, bufferHeight);
    renderer.setClearColor("#050713");

    const ambientLight = new THREE.AmbientLight("#F1D28A", 0.38);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight("#FFFFFF", 1.35);
    keyLight.position.set(2.2, 5.8, 2.6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight("#7C5CFF", 0.75);
    rimLight.position.set(-3.2, 3.8, -2.8);
    scene.add(rimLight);

    const table = createInteriorTable();
    scene.add(table);

    /**
     * Si des dés existent déjà côté React au moment où GLView se monte,
     * on les ajoute sans animation initiale pour éviter un double drop au chargement.
     */
    for (const instance of diceInstances) {
      addDiceInstanceToScene(scene, instance, false);
    }

    const render = () => {
      const now = Date.now();
      const previousFrameAt = lastFrameAtRef.current ?? now;
      const deltaSeconds = Math.min(0.04, (now - previousFrameAt) / 1000);

      lastFrameAtRef.current = now;

      const physicsWorld = physicsWorldRef.current;

      if (physicsWorld && physicsActiveRef.current) {
        physicsWorld.step(deltaSeconds);

        const allSleeping = applyPhysicsSnapshotsToMeshes();

        if (allSleeping) {
          const completedMode = physicsRollModeRef.current;

          physicsActiveRef.current = false;
          physicsRollModeRef.current = "idle";

          for (const item of diceItemsRef.current.values()) {
            item.physicsActive = false;
          }

          if (
            completedMode === "rolling" &&
            !physicsSettledNotifiedRef.current
          ) {
            physicsSettledNotifiedRef.current = true;

            const settledRollId = activePhysicsRollIdRef.current;

            settleDelayTimeoutRef.current = setTimeout(() => {
              settleDelayTimeoutRef.current = null;

              if (activePhysicsRollIdRef.current !== settledRollId) {
                return;
              }

              onPhysicsRollSettledRef.current?.();
            }, 700);
          }
        }
      } else {
        for (const item of diceItemsRef.current.values()) {
          updateContactShadow({
            shadow: item.shadow,
            dice: item.mesh,
            progress: 1,
            visible: true,
          });
        }
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  }

  return (
    <View
      style={{
        height,
        width: "100%",
        borderRadius: 0,
        overflow: "hidden",
        backgroundColor: "#050713",
      }}
    >
      <GLView
        style={{
          flex: 1,
        }}
        onContextCreate={handleContextCreate}
      />
    </View>
  );
}
