// dice-universal/features/roll3d/physics/Roll3DPhysicsWorld.ts

import type {
  Roll3DPhysicsDieSnapshot,
  Roll3DPhysicsTransform,
} from "./Roll3DPhysicsTypes";
import type { Roll3DDieInstance } from "../types";

/**
 * Interface cible du futur monde physique Roll3D.
 *
 * Pour l’instant, cette classe est un squelette volontairement neutre.
 * Elle permettra ensuite de brancher cannon-es sans polluer DiceTable3D.
 */
export class Roll3DPhysicsWorld {
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

  step(_deltaSeconds: number) {
    /**
     * Phase 2.0B/2.0C :
     * ici on appellera world.step(...) de cannon-es.
     */
  }

  getDiceSnapshots() {
    return Array.from(this.diceSnapshots.values());
  }
}
