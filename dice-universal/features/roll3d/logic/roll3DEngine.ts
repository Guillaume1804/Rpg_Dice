// dice-universal/features/roll3d/logic/roll3DEngine.ts

import { rollGroup } from "../../../core/roll/roll";
import { evaluateRule } from "../../../core/rules/evaluate";

import type {
  Roll3DDraft,
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

function groupDiceByRollEntry(diceInstances: Roll3DDieInstance[]) {
  const groups = new Map<string, Roll3DDieInstance[]>();

  for (const instance of diceInstances) {
    const current = groups.get(instance.rollEntryId) ?? [];
    current.push(instance);
    groups.set(instance.rollEntryId, current);
  }

  return Array.from(groups.entries()).map(([rollEntryId, instances]) => ({
    rollEntryId,
    instances,
  }));
}

export function buildOfficialRoll3DSummary(
  draft: Roll3DDraft,
): Roll3DRollSummary {
  const entryGroups = groupDiceByRollEntry(draft.dice);

  const officialResult = rollGroup({
    groupId: createRoll3DId("roll-3d-group"),
    label: "Jet Roll3D",
    entries: entryGroups.map(({ rollEntryId, instances }) => {
      const first = instances[0];

      return {
        entryId: rollEntryId,
        sides: first?.sides ?? 20,
        qty: instances.length,
        modifier: instances.reduce(
          (sum, instance) => sum + instance.modifier,
          0,
        ),
        sign: first?.sign ?? 1,
        rule: first?.behavior?.rule ?? null,
      };
    }),
    groupRule: draft.groupBehavior?.rule ?? null,
    evaluateRule,
  });

  const dice: Roll3DDieResult[] = [];

  officialResult.entries.forEach((entry) => {
    const entryGroup = entryGroups.find(
      (group) => group.rollEntryId === entry.entryId,
    );

    const instances = entryGroup?.instances ?? [];

    entry.natural_values.forEach((value, index) => {
      const instance = instances[index];

      if (!instance) {
        return;
      }

      const visualModifier = index === 0 ? entry.modifier : 0;
      const visualTotal = value * (entry.sign === -1 ? -1 : 1) + visualModifier;

      dice.push(
        toRoll3DDieResult({
          instance,
          value,
          sign: entry.sign === -1 ? -1 : 1,
          modifier: visualModifier,
          total: visualTotal,
        }),
      );
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
