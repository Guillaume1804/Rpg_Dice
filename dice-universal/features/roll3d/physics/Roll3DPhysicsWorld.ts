// dice-universal/features/roll3d/physics/Roll3DPhysicsWorld.ts

import * as CANNON from "cannon-es";

import type {
  Roll3DPhysicsDieSnapshot,
  Roll3DPhysicsTransform,
} from "./Roll3DPhysicsTypes";
import type { Roll3DDieInstance, Roll3DDieSides } from "../types";

const PHYSICS_TIME_STEP = 1 / 60;
const PHYSICS_MAX_SUB_STEPS = 3;

const TABLE_SURFACE_Y = -1.15;

const TABLE_WIDTH = 4.8;
const TABLE_DEPTH = 6.9;
const TABLE_WALL_HEIGHT = 0.34;
const TABLE_WALL_THICKNESS = 0.12;

const FLOOR_ID = "roll-3d-physics-floor";

const WALL_IDS = {
  left: "roll-3d-physics-wall-left",
  right: "roll-3d-physics-wall-right",
  top: "roll-3d-physics-wall-top",
  bottom: "roll-3d-physics-wall-bottom",
} as const;

type Roll3DPhysicsLaunchMode = "drop" | "surface_roll";

type Roll3DPhysicsAddDieOptions = {
  launchMode?: Roll3DPhysicsLaunchMode;
};

function createCannonVec3(transform: Roll3DPhysicsTransform["position"]) {
  return new CANNON.Vec3(transform.x, transform.y, transform.z);
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
 * Approximation temporaire des formes de collision.
 *
 * Les meshes visuels restent précis côté Three.js.
 * Côté physique, on commence avec des volumes simples et stables.
 *
 * Plus tard, on pourra remplacer certains dés par des convex polyhedrons
 * plus proches de leur vraie géométrie.
 */
function createDieShape(sides: Roll3DDieSides): CANNON.Shape {
  switch (sides) {
    case 4:
      return new CANNON.Box(new CANNON.Vec3(0.29, 0.29, 0.29));

    case 6:
      return new CANNON.Box(new CANNON.Vec3(0.34, 0.34, 0.34));

    case 8:
      return new CANNON.Box(new CANNON.Vec3(0.33, 0.33, 0.33));

    case 10:
      return new CANNON.Box(new CANNON.Vec3(0.32, 0.41, 0.32));

    case 12:
      return new CANNON.Box(new CANNON.Vec3(0.34, 0.34, 0.34));

    case 20:
      return new CANNON.Box(new CANNON.Vec3(0.34, 0.34, 0.34));

    case 100:
      return new CANNON.Box(new CANNON.Vec3(0.62, 0.33, 0.34));

    default:
      return new CANNON.Box(new CANNON.Vec3(0.34, 0.34, 0.34));
  }
}

function createInitialVelocity(mode: Roll3DPhysicsLaunchMode) {
  if (mode === "surface_roll") {
    const angle = Math.random() * Math.PI * 2;
    const strength = 2.35 + Math.random() * 1.15;

    return new CANNON.Vec3(
      Math.cos(angle) * strength,
      0.12 + Math.random() * 0.18,
      Math.sin(angle) * strength,
    );
  }

  return new CANNON.Vec3(
    (Math.random() - 0.5) * 0.38,
    -1.45 - Math.random() * 0.45,
    (Math.random() - 0.5) * 0.38,
  );
}

function createInitialAngularVelocity(mode: Roll3DPhysicsLaunchMode) {
  if (mode === "surface_roll") {
    return new CANNON.Vec3(
      (Math.random() - 0.5) * 11,
      (Math.random() - 0.5) * 13,
      (Math.random() - 0.5) * 11,
    );
  }

  return new CANNON.Vec3(
    (Math.random() - 0.5) * 3.2,
    (Math.random() - 0.5) * 3.8,
    (Math.random() - 0.5) * 3.2,
  );
}

/**
 * Monde physique Roll3D.
 *
 * Rôle :
 * - isoler cannon-es
 * - gérer gravité, sol, murs et corps de dés
 * - fournir des snapshots exploitables par Three.js
 *
 * Important :
 * le moteur physique sert au rendu.
 * Le résultat officiel reste calculé par le moteur Dice Universal.
 */
export class Roll3DPhysicsWorld {
  private readonly world: CANNON.World;

  private readonly diceSnapshots = new Map<string, Roll3DPhysicsDieSnapshot>();
  private readonly staticBodies = new Map<string, CANNON.Body>();
  private readonly diceBodies = new Map<string, CANNON.Body>();

  private readonly tableMaterial = new CANNON.Material("roll3d-table");
  private readonly diceMaterial = new CANNON.Material("roll3d-dice");

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });

    this.world.allowSleep = true;

    this.world.defaultContactMaterial.friction = 0.68;
    this.world.defaultContactMaterial.restitution = 0.12;

    const diceTableContact = new CANNON.ContactMaterial(
      this.diceMaterial,
      this.tableMaterial,
      {
        friction: 0.74,
        restitution: 0.14,
      },
    );

    const diceDiceContact = new CANNON.ContactMaterial(
      this.diceMaterial,
      this.diceMaterial,
      {
        friction: 0.62,
        restitution: 0.1,
      },
    );

    this.world.addContactMaterial(diceTableContact);
    this.world.addContactMaterial(diceDiceContact);

    this.createStaticTableBodies();
  }

  reset() {
    for (const body of this.diceBodies.values()) {
      this.world.removeBody(body);
    }

    this.diceBodies.clear();
    this.diceSnapshots.clear();

    /**
     * On conserve sol + murs : ils appartiennent à la table physique.
     */
  }

  addDie(
    instance: Roll3DDieInstance,
    transform: Roll3DPhysicsTransform,
    options: Roll3DPhysicsAddDieOptions = {},
  ) {
    /**
     * Si un corps existe déjà pour ce dé, on le remplace proprement.
     */
    this.removeDie(instance.id);

    const launchMode = options.launchMode ?? "drop";

    const body = new CANNON.Body({
      mass: this.getDieMass(instance.sides),
      material: this.diceMaterial,
      position: createCannonVec3(transform.position),
      quaternion: createCannonQuaternion(transform.quaternion),
      shape: createDieShape(instance.sides),
      linearDamping: 0.42,
      angularDamping: 0.48,
      allowSleep: true,
      sleepSpeedLimit: 0.18,
      sleepTimeLimit: 0.28,
    });

    body.velocity.copy(createInitialVelocity(launchMode));
    body.angularVelocity.copy(createInitialAngularVelocity(launchMode));
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
    this.world.step(PHYSICS_TIME_STEP, deltaSeconds, PHYSICS_MAX_SUB_STEPS);
    this.updateSnapshotsFromBodies();
  }

  getDiceSnapshots() {
    return Array.from(this.diceSnapshots.values());
  }

  private updateSnapshotsFromBodies() {
    for (const [id, body] of this.diceBodies.entries()) {
      this.diceSnapshots.set(id, {
        id,
        transform: toPhysicsTransform(body),
        sleeping: body.sleepState === CANNON.Body.SLEEPING,
      });
    }
  }

  private getDieMass(sides: Roll3DDieSides) {
    if (sides === 100) {
      return 1.25;
    }

    if (sides === 4) {
      return 0.75;
    }

    return 1;
  }

  private createStaticTableBodies() {
    this.addStaticBody({
      id: FLOOR_ID,
      position: new CANNON.Vec3(0, TABLE_SURFACE_Y - 0.03, 0),
      shape: new CANNON.Box(
        new CANNON.Vec3(TABLE_WIDTH / 2, 0.03, TABLE_DEPTH / 2),
      ),
    });

    this.addStaticBody({
      id: WALL_IDS.left,
      position: new CANNON.Vec3(
        -TABLE_WIDTH / 2,
        TABLE_SURFACE_Y + TABLE_WALL_HEIGHT / 2,
        0,
      ),
      shape: new CANNON.Box(
        new CANNON.Vec3(
          TABLE_WALL_THICKNESS / 2,
          TABLE_WALL_HEIGHT / 2,
          TABLE_DEPTH / 2,
        ),
      ),
    });

    this.addStaticBody({
      id: WALL_IDS.right,
      position: new CANNON.Vec3(
        TABLE_WIDTH / 2,
        TABLE_SURFACE_Y + TABLE_WALL_HEIGHT / 2,
        0,
      ),
      shape: new CANNON.Box(
        new CANNON.Vec3(
          TABLE_WALL_THICKNESS / 2,
          TABLE_WALL_HEIGHT / 2,
          TABLE_DEPTH / 2,
        ),
      ),
    });

    this.addStaticBody({
      id: WALL_IDS.top,
      position: new CANNON.Vec3(
        0,
        TABLE_SURFACE_Y + TABLE_WALL_HEIGHT / 2,
        -TABLE_DEPTH / 2,
      ),
      shape: new CANNON.Box(
        new CANNON.Vec3(
          TABLE_WIDTH / 2,
          TABLE_WALL_HEIGHT / 2,
          TABLE_WALL_THICKNESS / 2,
        ),
      ),
    });

    this.addStaticBody({
      id: WALL_IDS.bottom,
      position: new CANNON.Vec3(
        0,
        TABLE_SURFACE_Y + TABLE_WALL_HEIGHT / 2,
        TABLE_DEPTH / 2,
      ),
      shape: new CANNON.Box(
        new CANNON.Vec3(
          TABLE_WIDTH / 2,
          TABLE_WALL_HEIGHT / 2,
          TABLE_WALL_THICKNESS / 2,
        ),
      ),
    });
  }

  private addStaticBody(params: {
    id: string;
    position: CANNON.Vec3;
    shape: CANNON.Shape;
  }) {
    const { id, position, shape } = params;

    if (this.staticBodies.has(id)) {
      return;
    }

    const body = new CANNON.Body({
      mass: 0,
      material: this.tableMaterial,
      position,
      shape,
    });

    body.type = CANNON.Body.STATIC;

    this.world.addBody(body);
    this.staticBodies.set(id, body);
  }
}
