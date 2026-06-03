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
  const dice: Roll3DDieResult[] = diceInstances.map((instance) => {
    const value = roll3DDieValue(instance.sides);
    const signedValue = value * instance.sign;
    const modifier = instance.modifier * instance.sign;

    return {
      id: instance.id,
      sides: instance.sides,
      value,
      sign: instance.sign,
      modifier: instance.modifier,
      total: signedValue + modifier,
    };
  });

  return {
    id: createRoll3DId("roll-3d-result"),
    createdAt: Date.now(),
    dice,
    rawTotal: dice.reduce((sum, die) => sum + die.value * die.sign, 0),
    modifierTotal: dice.reduce((sum, die) => sum + die.modifier * die.sign, 0),
    total: dice.reduce((sum, die) => sum + die.total, 0),
  };
}
