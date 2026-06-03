// dice-universal/features/roll3d/logic/roll3DRandom.ts

import type {
  Roll3DDieInstance,
  Roll3DDieResult,
  Roll3DDieSides,
  Roll3DRollSummary,
} from "../types";

export function createRoll3DId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function roll3DDieValue(sides: Roll3DDieSides) {
  return Math.floor(Math.random() * sides) + 1;
}

export function buildRoll3DSummary(
  diceInstances: Roll3DDieInstance[],
): Roll3DRollSummary {
  const dice: Roll3DDieResult[] = diceInstances.map((instance) => ({
    id: instance.id,
    sides: instance.sides,
    value: roll3DDieValue(instance.sides),
  }));

  return {
    id: createRoll3DId("roll-3d-result"),
    createdAt: Date.now(),
    dice,
    total: dice.reduce((sum, die) => sum + die.value, 0),
  };
}
