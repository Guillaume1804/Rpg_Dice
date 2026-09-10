import * as CANNON from "cannon-es";

import { ROLL3D_TABLE } from "../config/Roll3DTableConfig";
import {
  getRoll3DDieConvexGeometryData,
  ROLL3D_DIE_SCALE,
  type Roll3DPhysicalDieSides,
} from "../geometry/Roll3DDieGeometry";
import type { Roll3DDieInstance, Roll3DDieSides } from "../types";
import type {
  Roll3DPhysicsAddDieOptions,
  Roll3DPhysicsDieSnapshot,
  Roll3DPhysicsLaunchMode,
  Roll3DPhysicsProfile,
  Roll3DPhysicsTransform,
  Roll3DPhysicsVector3,
} from "./Roll3DPhysicsTypes";

/**
 * Le d6 visuel mesure 1.18 unité locale de côté.
 * Cette demi-extension utilise exactement la même échelle que le mesh Three.js.
 */
const D6_HALF_EXTENT = (1.18 * ROLL3D_DIE_SCALE) / 2;

/**
 * Physics V2 baseline.
 *
 * Ces valeurs sont volontairement explicites et peu nombreuses.
 * Elles constituent un point de départ mesurable, pas une calibration finale.
 */
const PHYSICS_TIME_STEP = 1 / 60;
const PHYSICS_MAX_SUB_STEPS = 3;
const PHYSICS_MAX_FRAME_DELTA = 0.05;

const SOLVER_ITERATIONS = 12;
const SOLVER_TOLERANCE = 0.001;

const CONTACT_EQUATION_STIFFNESS = 1e8;
const CONTACT_EQUATION_RELAXATION = 4;
const FRICTION_EQUATION_STIFFNESS = 1e8;
const FRICTION_EQUATION_RELAXATION = 4;

/**
 * On conserve provisoirement les coefficients matériaux issus du dernier état
 * testé. La V2 change d'abord les fondations : géométrie de table, solveur,
 * contacts, interpolation et lifecycle des corps.
 *
 * Ils seront calibrés ensuite dans le Physics Lab, une variable à la fois.
 */
const FLOOR_FRICTION = 0.42;
const FLOOR_RESTITUTION = 0.16;
const WALL_FRICTION = 0.22;
const WALL_RESTITUTION = 0.48;
const DICE_FRICTION = 0.62;
const DICE_RESTITUTION = 0.1;

const DIE_LINEAR_DAMPING = 0.045;
const DIE_ANGULAR_DAMPING = 0.065;
const DIE_SLEEP_SPEED_LIMIT = 0.1;
const DIE_SLEEP_TIME_LIMIT = 0.8;

const FLOOR_ID = "roll-3d-physics-floor";

const WALL_IDS = {
  left: "roll-3d-physics-wall-left",
  right: "roll-3d-physics-wall-right",
  top: "roll-3d-physics-wall-top",
  bottom: "roll-3d-physics-wall-bottom",
} as const;

function createCannonVec3(vector: Roll3DPhysicsVector3) {
  return new CANNON.Vec3(vector.x, vector.y, vector.z);
}

function createCannonQuaternion(
  transform: Roll3DPhysicsTransform["quaternion"],
) {
  return new CANNON.Quaternion(
    transform.x,
    transform.y,
    transform.z,
    transform.w,
  );
}

/**
 * Transform physique autoritaire du body.
 *
 * À utiliser lorsqu'on veut réinjecter un état Cannon dans une nouvelle
 * simulation ou raisonner sur la position physique exacte.
 */
function toPhysicsTransform(body: CANNON.Body): Roll3DPhysicsTransform {
  return {
    position: {
      x: body.position.x,
      y: body.position.y,
      z: body.position.z,
    },
    quaternion: {
      x: body.quaternion.x,
      y: body.quaternion.y,
      z: body.quaternion.z,
      w: body.quaternion.w,
    },
  };
}

/**
 * Transform destiné au renderer Three.js.
 *
 * Quand World.step(fixedStep, delta, maxSubSteps) est utilisé, Cannon calcule
 * des transforms interpolés entre deux états physiques. Les exploiter évite
 * de rendre directement les marches discrètes du timestep 60 Hz.
 */
function toRenderTransform(body: CANNON.Body): Roll3DPhysicsTransform {
  const position = body.interpolatedPosition ?? body.position;
  const quaternion = body.interpolatedQuaternion ?? body.quaternion;

  return {
    position: {
      x: position.x,
      y: position.y,
      z: position.z,
    },
    quaternion: {
      x: quaternion.x,
      y: quaternion.y,
      z: quaternion.z,
      w: quaternion.w,
    },
  };
}

function createConvexDieShape(
  sides: Roll3DPhysicalDieSides,
): CANNON.ConvexPolyhedron {
  const geometry = getRoll3DDieConvexGeometryData(sides);

  return new CANNON.ConvexPolyhedron({
    vertices: geometry.vertices.map(
      (vertex) => new CANNON.Vec3(vertex.x, vertex.y, vertex.z),
    ),
    faces: geometry.faces.map((face) => [...face]),
  });
}

function createDieShape(sides: Roll3DDieSides): CANNON.Shape {
  /**
   * Le d6 est exactement cubique.
   * CANNON.Box est plus simple et numériquement plus stable qu'un convex
   * polyhedron équivalent.
   */
  if (sides === 6) {
    return new CANNON.Box(
      new CANNON.Vec3(D6_HALF_EXTENT, D6_HALF_EXTENT, D6_HALF_EXTENT),
    );
  }

  /**
   * D100 provisoire jusqu'à sa refonte dédiée.
   */
  if (sides === 100) {
    return new CANNON.Box(new CANNON.Vec3(0.42, 0.22, 0.23));
  }

  return createConvexDieShape(sides);
}

function createInitialVelocity(
  mode: Roll3DPhysicsLaunchMode,
  position: Roll3DPhysicsVector3,
) {
  if (mode === "resting") {
    return new CANNON.Vec3(0, 0, 0);
  }

  if (mode === "surface_roll") {
    /**
     * Le lancer automatique vise maintenant une zone sûre de la table
     * au lieu de choisir une direction totalement aléatoire.
     *
     * Le but n'est pas de forcer une trajectoire précise :
     * on donne simplement au dé une direction générale cohérente avec
     * l'espace disponible autour de lui.
     */
    const safeHalfWidth = ROLL3D_TABLE.width / 2 - 0.85;
    const safeHalfDepth = ROLL3D_TABLE.depth / 2 - 0.95;

    /**
     * Cible volontairement aléatoire à l'intérieur de la table.
     *
     * Un dé proche du bord sera donc naturellement dirigé vers l'intérieur,
     * tandis qu'un dé proche du centre conservera davantage de variété.
     */
    const targetX = (Math.random() * 2 - 1) * safeHalfWidth * 0.72;

    const targetZ = (Math.random() * 2 - 1) * safeHalfDepth * 0.72;

    let directionX = targetX - position.x;
    let directionZ = targetZ - position.z;

    const directionLength = Math.sqrt(
      directionX * directionX + directionZ * directionZ,
    );

    /**
     * Cas extrêmement improbable où la cible tombe presque exactement
     * sur la position actuelle.
     */
    if (directionLength < 0.001) {
      const fallbackAngle = Math.random() * Math.PI * 2;

      directionX = Math.cos(fallbackAngle);
      directionZ = Math.sin(fallbackAngle);
    } else {
      directionX /= directionLength;
      directionZ /= directionLength;
    }

    /**
     * Petite dispersion angulaire pour éviter que tous les dés convergent
     * mécaniquement vers la même zone.
     */
    const dispersionAngle = (Math.random() - 0.5) * 0.5;

    const cos = Math.cos(dispersionAngle);
    const sin = Math.sin(dispersionAngle);

    const dispersedDirectionX = directionX * cos - directionZ * sin;

    const dispersedDirectionZ = directionX * sin + directionZ * cos;

    /**
     * La plage historique 9–14 était disproportionnée par rapport
     * aux dimensions réelles 5.8 × 8.4 de la table.
     *
     * Cette première baseline reste énergique mais réduit fortement
     * les traversées complètes de plateau en une fraction de seconde.
     */
    const strength = 9 + Math.random() * 5;

    return new CANNON.Vec3(
      dispersedDirectionX * strength,
      0.16 + Math.random() * 0.16,
      dispersedDirectionZ * strength,
    );
  }

  if (mode === "gesture_throw") {
    return new CANNON.Vec3(0, 1.8, -4.5);
  }

  return new CANNON.Vec3(
    (Math.random() - 0.5) * 0.42,
    -5.4 - Math.random() * 1.4,
    (Math.random() - 0.5) * 0.42,
  );
}

function createInitialAngularVelocity(mode: Roll3DPhysicsLaunchMode) {
  if (mode === "resting") {
    return new CANNON.Vec3(0, 0, 0);
  }

  if (mode === "surface_roll") {
    return new CANNON.Vec3(
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 18,
    );
  }

  if (mode === "gesture_throw") {
    return new CANNON.Vec3(
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 28,
      (Math.random() - 0.5) * 22,
    );
  }

  return new CANNON.Vec3(
    (Math.random() - 0.5) * 5.5,
    (Math.random() - 0.5) * 6.5,
    (Math.random() - 0.5) * 5.5,
  );
}

function applyContactQuality(
  contactMaterial: CANNON.ContactMaterial,
): CANNON.ContactMaterial {
  contactMaterial.contactEquationStiffness = CONTACT_EQUATION_STIFFNESS;
  contactMaterial.contactEquationRelaxation = CONTACT_EQUATION_RELAXATION;
  contactMaterial.frictionEquationStiffness = FRICTION_EQUATION_STIFFNESS;
  contactMaterial.frictionEquationRelaxation = FRICTION_EQUATION_RELAXATION;

  return contactMaterial;
}

/**
 * Monde physique Roll3D — Physics V2 baseline.
 *
 * Responsabilités :
 * - isoler cannon-es ;
 * - gérer gravité, solveur, contacts, sol, murs et corps de dés ;
 * - fournir à Three.js des snapshots interpolés ;
 * - conserver une simulation physique brute, sans correction d'orientation.
 *
 * Important :
 * - Cannon sert à la simulation/rendu physique ;
 * - le résultat JDR officiel reste hors de ce fichier ;
 * - aucun nudge, teleport ou sleep forcé n'est effectué ici.
 */
export class Roll3DPhysicsWorld {
  private readonly world: CANNON.World;

  private readonly diceSnapshots = new Map<string, Roll3DPhysicsDieSnapshot>();
  private readonly staticBodies = new Map<string, CANNON.Body>();
  private readonly diceBodies = new Map<string, CANNON.Body>();

  private readonly floorMaterial = new CANNON.Material("roll3d-floor");
  private readonly wallMaterial = new CANNON.Material("roll3d-wall");
  private readonly diceMaterial = new CANNON.Material("roll3d-dice");

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });

    /**
     * Le solveur est maintenant explicite : les futures mesures seront donc
     * reproductibles et ne dépendront plus silencieusement des defaults.
     */
    const solver = new CANNON.GSSolver();
    solver.iterations = SOLVER_ITERATIONS;
    solver.tolerance = SOLVER_TOLERANCE;
    this.world.solver = solver;

    this.world.allowSleep = true;

    /**
     * Physics V2 repart sans friction reduction. Cette optimisation change la
     * manière dont les contacts tangents sont agrégés et avait produit un
     * glissement artificiel dans nos essais. Elle pourra être benchmarkée plus
     * tard dans le Physics Lab au lieu d'être activée par défaut.
     */
    this.world.narrowphase.enableFrictionReduction = false;

    this.world.defaultContactMaterial.friction = 0.3;
    this.world.defaultContactMaterial.restitution = 0;
    this.world.defaultContactMaterial.contactEquationStiffness =
      CONTACT_EQUATION_STIFFNESS;
    this.world.defaultContactMaterial.contactEquationRelaxation =
      CONTACT_EQUATION_RELAXATION;
    this.world.defaultContactMaterial.frictionEquationStiffness =
      FRICTION_EQUATION_STIFFNESS;
    this.world.defaultContactMaterial.frictionEquationRelaxation =
      FRICTION_EQUATION_RELAXATION;

    const diceFloorContact = applyContactQuality(
      new CANNON.ContactMaterial(this.diceMaterial, this.floorMaterial, {
        friction: FLOOR_FRICTION,
        restitution: FLOOR_RESTITUTION,
      }),
    );

    const diceWallContact = applyContactQuality(
      new CANNON.ContactMaterial(this.diceMaterial, this.wallMaterial, {
        friction: WALL_FRICTION,
        restitution: WALL_RESTITUTION,
      }),
    );

    const diceDiceContact = applyContactQuality(
      new CANNON.ContactMaterial(this.diceMaterial, this.diceMaterial, {
        friction: DICE_FRICTION,
        restitution: DICE_RESTITUTION,
      }),
    );

    this.world.addContactMaterial(diceFloorContact);
    this.world.addContactMaterial(diceWallContact);
    this.world.addContactMaterial(diceDiceContact);

    if (__DEV__) {
      this.world.doProfiling = true;
    }

    this.createStaticTableBodies();
  }

  reset() {
    for (const body of this.diceBodies.values()) {
      this.world.removeBody(body);
    }

    this.diceBodies.clear();
    this.diceSnapshots.clear();

    /**
     * Le sol et les murs restent dans le monde : ils appartiennent à la table.
     */
  }

  addDie(
    instance: Roll3DDieInstance,
    transform: Roll3DPhysicsTransform,
    options: Roll3DPhysicsAddDieOptions = {},
  ) {
    this.removeDie(instance.id);

    const launchMode = options.launchMode ?? "drop";

    const body = new CANNON.Body({
      mass: this.getDieMass(instance.sides),
      material: this.diceMaterial,
      position: createCannonVec3(transform.position),
      quaternion: createCannonQuaternion(transform.quaternion),
      shape: createDieShape(instance.sides),
      linearDamping: DIE_LINEAR_DAMPING,
      angularDamping: DIE_ANGULAR_DAMPING,
      allowSleep: true,
      sleepSpeedLimit: DIE_SLEEP_SPEED_LIMIT,
      sleepTimeLimit: DIE_SLEEP_TIME_LIMIT,
    });

    const initialVelocity = options.linearVelocity
      ? createCannonVec3(options.linearVelocity)
      : createInitialVelocity(launchMode, transform.position);

    const initialAngularVelocity = options.angularVelocity
      ? createCannonVec3(options.angularVelocity)
      : createInitialAngularVelocity(launchMode);

    body.velocity.copy(initialVelocity);
    body.angularVelocity.copy(initialAngularVelocity);

    /**
     * Les corps resting restent dynamiques : ils peuvent donc être percutés et
     * déplacés naturellement par un dé lancé.
     */
    body.wakeUp();

    this.world.addBody(body);
    this.diceBodies.set(instance.id, body);

    this.diceSnapshots.set(instance.id, {
      id: instance.id,
      transform: toPhysicsTransform(body),
      sleeping: body.sleepState === CANNON.Body.SLEEPING,
    });
  }

  removeDie(id: string) {
    const body = this.diceBodies.get(id);

    if (body) {
      this.world.removeBody(body);
      this.diceBodies.delete(id);
    }

    this.diceSnapshots.delete(id);
  }

  clearDice() {
    for (const body of this.diceBodies.values()) {
      this.world.removeBody(body);
    }

    this.diceBodies.clear();
    this.diceSnapshots.clear();
  }

  step(deltaSeconds: number) {
    /**
     * Un freeze JS/React Native ponctuel ne doit pas injecter brutalement une
     * énorme durée dans la simulation.
     */
    const safeDeltaSeconds = Math.min(
      Math.max(deltaSeconds, 0),
      PHYSICS_MAX_FRAME_DELTA,
    );

    this.world.step(PHYSICS_TIME_STEP, safeDeltaSeconds, PHYSICS_MAX_SUB_STEPS);

    this.updateSnapshotsFromBodies();
  }

  getDiceSnapshots() {
    return Array.from(this.diceSnapshots.values());
  }

  /**
   * Prépare l'intégration du futur Physics Lab sans exposer directement
   * l'instance Cannon au reste de l'application.
   */
  getProfile(): Roll3DPhysicsProfile {
    if (!this.world.doProfiling) {
      return {
        solveMs: 0,
        broadphaseMs: 0,
        narrowphaseMs: 0,
        integrateMs: 0,
      };
    }

    return {
      solveMs: this.world.profile.solve,
      broadphaseMs: this.world.profile.broadphase,
      narrowphaseMs: this.world.profile.narrowphase,
      integrateMs: this.world.profile.integrate,
    };
  }

  private updateSnapshotsFromBodies() {
    for (const [id, body] of this.diceBodies.entries()) {
      this.diceSnapshots.set(id, {
        id,
        transform:
          body.sleepState === CANNON.Body.SLEEPING
            ? toPhysicsTransform(body)
            : toRenderTransform(body),
        sleeping: body.sleepState === CANNON.Body.SLEEPING,
      });
    }
  }

  private getDieMass(sides: Roll3DDieSides) {
    /**
     * Baseline conservée avant l'étape "masse par volume".
     */
    if (sides === 100) {
      return 1.25;
    }

    if (sides === 4) {
      return 0.75;
    }

    return 1;
  }

  private createStaticTableBodies() {
    const { surfaceY, width, depth, wallHeight, wallThickness } = ROLL3D_TABLE;

    this.addStaticBody({
      id: FLOOR_ID,
      position: new CANNON.Vec3(0, surfaceY - 0.03, 0),
      shape: new CANNON.Box(new CANNON.Vec3(width / 2, 0.03, depth / 2)),
      material: this.floorMaterial,
    });

    this.addStaticBody({
      id: WALL_IDS.left,
      position: new CANNON.Vec3(-width / 2, surfaceY + wallHeight / 2, 0),
      shape: new CANNON.Box(
        new CANNON.Vec3(wallThickness / 2, wallHeight / 2, depth / 2),
      ),
      material: this.wallMaterial,
    });

    this.addStaticBody({
      id: WALL_IDS.right,
      position: new CANNON.Vec3(width / 2, surfaceY + wallHeight / 2, 0),
      shape: new CANNON.Box(
        new CANNON.Vec3(wallThickness / 2, wallHeight / 2, depth / 2),
      ),
      material: this.wallMaterial,
    });

    this.addStaticBody({
      id: WALL_IDS.top,
      position: new CANNON.Vec3(0, surfaceY + wallHeight / 2, -depth / 2),
      shape: new CANNON.Box(
        new CANNON.Vec3(width / 2, wallHeight / 2, wallThickness / 2),
      ),
      material: this.wallMaterial,
    });

    this.addStaticBody({
      id: WALL_IDS.bottom,
      position: new CANNON.Vec3(0, surfaceY + wallHeight / 2, depth / 2),
      shape: new CANNON.Box(
        new CANNON.Vec3(width / 2, wallHeight / 2, wallThickness / 2),
      ),
      material: this.wallMaterial,
    });
  }

  private addStaticBody(params: {
    id: string;
    position: CANNON.Vec3;
    shape: CANNON.Shape;
    material: CANNON.Material;
  }) {
    const { id, position, shape, material } = params;

    if (this.staticBodies.has(id)) {
      return;
    }

    const body = new CANNON.Body({
      mass: 0,
      material,
      position,
      shape,
    });

    body.type = CANNON.Body.STATIC;

    this.world.addBody(body);
    this.staticBodies.set(id, body);
  }
}
