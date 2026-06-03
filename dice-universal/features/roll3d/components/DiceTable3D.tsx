// dice-universal/features/roll3d/components/DiceTable3D.tsx

import { useEffect, useRef } from "react";
import { View } from "react-native";
import { GLView, type ExpoWebGLRenderingContext } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";

import { createDiceMesh } from "../renderer/DiceMeshFactory";
import type { Roll3DDieInstance } from "../types";

type DiceTable3DProps = {
  height?: number;
  diceInstances?: Roll3DDieInstance[];
  rollRequestId?: number;
};

type DiceDropState = {
  startedAt: number;

  startPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;

  startRotation: THREE.Euler;
  targetRotation: THREE.Euler;

  spinTurns: THREE.Vector3;
};

type DiceSceneItem = {
  id: string;
  mesh: THREE.Group;
  shadow: THREE.Mesh;
  drop: DiceDropState | null;
};

/**
 * Scène cible :
 * le smartphone est une ouverture vue du dessus.
 * La table est le fond du téléphone.
 * Les dés tombent dans cette "boîte/table" intérieure.
 */
const TABLE_SURFACE_Y = -1.15;

const TABLE_WIDTH = 4.8;
const TABLE_DEPTH = 6.9;
const TABLE_WALL_HEIGHT = 0.34;
const TABLE_WALL_THICKNESS = 0.12;

const DROP_DURATION_MS = 860;

const DROP_START_Y = 3.2;
const DROP_START_SCALE = 1.18;
const DROP_TARGET_SCALE = 1;

const TARGET_X_RANGE = 1.35;
const TARGET_Z_RANGE = 1.95;

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

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
  const geometry = new THREE.CircleGeometry(0.72, 36);
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
  shadow.scale.set(0.8, 0.8, 0.8);

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

  const opacity = lerp(0.04, 0.26, progress);
  const scale = lerp(0.38, 0.92, progress);

  material.opacity = opacity;
  shadow.scale.set(scale, scale * 0.72, scale);
}

export function DiceTable3D({
  height = 320,
  diceInstances = [],
  rollRequestId = 0,
}: DiceTable3DProps) {
  const animationFrameRef = useRef<number | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const diceItemsRef = useRef<Map<string, DiceSceneItem>>(new Map());

  function createDropStateForMesh(mesh: THREE.Group): DiceDropState {
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
      startedAt: Date.now(),
      startPosition,
      targetPosition,
      startRotation,
      targetRotation,
      spinTurns: new THREE.Vector3(
        randomBetween(0.65, 1.15),
        randomBetween(0.85, 1.35),
        randomBetween(0.35, 0.85),
      ),
    };
  }

  function addDiceInstanceToScene(
    scene: THREE.Scene,
    instance: Roll3DDieInstance,
    animate = true,
  ) {
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
      mesh.scale.setScalar(DROP_START_SCALE);

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
      drop: animate ? dropState : null,
    });
  }

  useEffect(() => {
    return () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      for (const item of diceItemsRef.current.values()) {
        disposeObject3D(item.mesh);
        disposeObject3D(item.shadow);
      }

      diceItemsRef.current.clear();
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
      }
    }

    for (const instance of diceInstances) {
      addDiceInstanceToScene(scene, instance, true);
    }
  }, [diceInstances]);

  useEffect(() => {
    if (rollRequestId <= 0) return;

    for (const item of diceItemsRef.current.values()) {
      const dropState = createDropStateForMesh(item.mesh);

      item.mesh.position.copy(dropState.startPosition);
      item.mesh.rotation.copy(dropState.startRotation);
      item.mesh.scale.setScalar(DROP_START_SCALE);

      updateContactShadow({
        shadow: item.shadow,
        dice: item.mesh,
        progress: 0,
        visible: false,
      });

      item.drop = dropState;
    }
  }, [rollRequestId]);

  function handleContextCreate(gl: ExpoWebGLRenderingContext) {
    const { drawingBufferWidth: width, drawingBufferHeight: bufferHeight } = gl;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050713");

    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      34,
      width / bufferHeight,
      0.1,
      100,
    );

    camera.position.set(0, 6.8, 0.18);
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
      for (const item of diceItemsRef.current.values()) {
        const { mesh, shadow, drop } = item;

        if (drop) {
          const rawProgress = (Date.now() - drop.startedAt) / DROP_DURATION_MS;
          const progress = clamp01(rawProgress);

          const fallProgress = easeInOutCubic(progress);
          const lateralProgress = easeOutCubic(progress);

          mesh.position.x = lerp(
            drop.startPosition.x,
            drop.targetPosition.x,
            lateralProgress,
          );

          mesh.position.z = lerp(
            drop.startPosition.z,
            drop.targetPosition.z,
            lateralProgress,
          );

          const impactProgress = clamp01((progress - 0.84) / 0.16);

          const bounce =
            progress > 0.84
              ? Math.sin((1 - impactProgress) * Math.PI) *
                0.07 *
                (1 - impactProgress)
              : 0;

          mesh.position.y =
            lerp(drop.startPosition.y, drop.targetPosition.y, fallProgress) +
            bounce;

          mesh.scale.setScalar(
            lerp(DROP_START_SCALE, DROP_TARGET_SCALE, fallProgress),
          );

          const spinAmount =
            Math.sin(progress * Math.PI) * (1 - progress * 0.35);
          const rotationProgress = easeOutCubic(progress);

          mesh.rotation.x =
            lerp(
              drop.startRotation.x,
              drop.targetRotation.x,
              rotationProgress,
            ) +
            drop.spinTurns.x * Math.PI * 2 * spinAmount;

          mesh.rotation.y =
            lerp(
              drop.startRotation.y,
              drop.targetRotation.y,
              rotationProgress,
            ) +
            drop.spinTurns.y * Math.PI * 2 * spinAmount;

          mesh.rotation.z =
            lerp(
              drop.startRotation.z,
              drop.targetRotation.z,
              rotationProgress,
            ) +
            drop.spinTurns.z * Math.PI * 2 * spinAmount;

          updateContactShadow({
            shadow,
            dice: mesh,
            progress: fallProgress,
            visible: progress > 0.18,
          });

          if (progress >= 1) {
            mesh.position.copy(drop.targetPosition);
            mesh.rotation.copy(drop.targetRotation);
            mesh.scale.setScalar(DROP_TARGET_SCALE);

            updateContactShadow({
              shadow,
              dice: mesh,
              progress: 1,
              visible: true,
            });

            item.drop = null;
          }
        } else {
          updateContactShadow({
            shadow,
            dice: mesh,
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
        borderRadius: 28,
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
