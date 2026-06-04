// dice-universal/features/roll3d/physics/Roll3DPhysicsWorld.ts

import type {
  Roll3DPhysicsDieSnapshot,
  Roll3DPhysicsTransform,
} from "./Roll3DPhysicsTypes";
import type { Roll3DDieInstance } from "../types";

import * as CANNON from "cannon-es";

/**
 * Interface cible du futur monde physique Roll3D.
 *
 * Pour l’instant, cette classe est un squelette volontairement neutre.
 * Elle permettra ensuite de brancher cannon-es sans polluer DiceTable3D.
 */
export class Roll3DPhysicsWorld {
  private readonly world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0),
  });

  private readonly diceSnapshots = new Map<string, Roll3DPhysicsDieSnapshot>();

  reset() {
    this.diceSnapshots.clear();
  }

  addDie(instance: Roll3DDieInstance, transform: Roll3DPhysicsTransform) {
    this.diceSnapshots.set(instance.id, {
      id: instance.id,
      transform,
      sleeping: false,
    });
  }

  removeDie(id: string) {
    this.diceSnapshots.delete(id);
  }

  clearDice() {
    this.diceSnapshots.clear();
  }

  step(deltaSeconds: number) {
    this.world.step(1 / 60, deltaSeconds, 3);
  }

  getDiceSnapshots() {
    return Array.from(this.diceSnapshots.values());
  }
}
