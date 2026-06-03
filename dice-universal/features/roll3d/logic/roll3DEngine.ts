// dice-universal/features/roll3d/logic/roll3DEngine.ts

import { rollGroup } from "../../../core/roll/roll";
import { evaluateRule } from "../../../core/rules/evaluate";

import type {
  Roll3DDieInstance,
  Roll3DDieResult,
  Roll3DRollSummary,
} from "../types";
import { createRoll3DId } from "./roll3DRandom";

function toRoll3DDieResult(params: {
  instance: Roll3DDieInstance;
  value: number;
  sign: 1 | -1;
  modifier: number;
  total: number;
}): Roll3DDieResult {
  const { instance, value, sign, modifier, total } = params;

  return {
    id: instance.id,
    sides: instance.sides,
    value,
    sign,
    modifier,
    total,
  };
}

export function buildOfficialRoll3DSummary(
  diceInstances: Roll3DDieInstance[],
): Roll3DRollSummary {
  const officialResult = rollGroup({
    groupId: createRoll3DId("roll-3d-group"),
    label: "Jet Roll3D",
    entries: diceInstances.map((instance) => ({
      entryId: instance.id,
      sides: instance.sides,
      qty: 1,
      modifier: instance.modifier,
      sign: instance.sign,
      rule: null,
    })),
    groupRule: null,
    evaluateRule,
  });

  const dice: Roll3DDieResult[] = officialResult.entries.map((entry, index) => {
    const instance = diceInstances[index];

    if (!instance) {
      return {
        id: entry.entryId,
        sides: entry.sides as Roll3DDieResult["sides"],
        value: entry.natural_values[0] ?? 0,
        sign: entry.sign === -1 ? -1 : 1,
        modifier: entry.modifier,
        total: entry.final_total,
      };
    }

    return toRoll3DDieResult({
      instance,
      value: entry.natural_values[0] ?? 0,
      sign: entry.sign === -1 ? -1 : 1,
      modifier: entry.modifier,
      total: entry.final_total,
    });
  });

  return {
    id: createRoll3DId("roll-3d-result"),
    createdAt: Date.now(),
    dice,
    rawTotal: officialResult.entries.reduce(
      (sum, entry) => sum + entry.base_total,
      0,
    ),
    modifierTotal: officialResult.entries.reduce(
      (sum, entry) => sum + entry.modifier,
      0,
    ),
    total: officialResult.total,
    officialResult,
  };
}
