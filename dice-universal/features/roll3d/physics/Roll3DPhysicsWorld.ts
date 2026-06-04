// dice-universal/features/roll3d/physics/Roll3DPhysicsWorld.ts

import * as CANNON from "cannon-es";

import type {
  Roll3DPhysicsDieSnapshot,
  Roll3DPhysicsTransform,
} from "./Roll3DPhysicsTypes";
import type { Roll3DDieInstance } from "../types";

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

/**
 * Monde physique Roll3D.
 *
 * Rôle :
 * - isoler cannon-es
 * - gérer gravité, sol, murs et futurs corps de dés
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

    this.world.defaultContactMaterial.friction = 0.46;
    this.world.defaultContactMaterial.restitution = 0.28;

    const diceTableContact = new CANNON.ContactMaterial(
      this.diceMaterial,
      this.tableMaterial,
      {
        friction: 0.52,
        restitution: 0.32,
      },
    );

    this.world.addContactMaterial(diceTableContact);

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

  addDie(instance: Roll3DDieInstance, transform: Roll3DPhysicsTransform) {
    /**
     * Phase 2.0D :
     * ici on créera un vrai CANNON.Body dynamique pour le dé.
     *
     * Pour l’instant, on conserve seulement le snapshot afin de ne pas
     * casser l’interface existante.
     */
    this.diceSnapshots.set(instance.id, {
      id: instance.id,
      transform,
      sleeping: false,
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
  }

  getDiceSnapshots() {
    return Array.from(this.diceSnapshots.values());
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
