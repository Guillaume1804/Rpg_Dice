// dice-universal/features/roll3d/logic/roll3DActionDraft.ts

import type {
  GroupDieRow,
  GroupRow,
} from "../../../data/repositories/groupsRepo";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import type {
  Roll3DDieBehaviorRef,
  Roll3DDieSides,
  Roll3DDieSign,
  Roll3DDieSource,
} from "../types";
import {
  createRoll3DDraftFromDice,
  type CreateRoll3DDieInput,
} from "./roll3DDraft";

export type Roll3DActionEntryDraftInput = {
  dice: CreateRoll3DDieInput[];
  groupBehavior: Roll3DDieBehaviorRef | null;
};

function toRoll3DDieSides(value: number): Roll3DDieSides | null {
  if (
    value === 4 ||
    value === 6 ||
    value === 8 ||
    value === 10 ||
    value === 12 ||
    value === 20 ||
    value === 100
  ) {
    return value;
  }

  return null;
}

function toRoll3DDieSign(value?: number | null): Roll3DDieSign {
  return value === -1 ? -1 : 1;
}

function createRoll3DBehaviorRefFromRule(
  rule: RuleRow | null | undefined,
): Roll3DDieBehaviorRef | null {
  if (!rule) {
    return null;
  }

  return {
    id: rule.id,
    label: rule.name,
    kind: rule.kind,
    rule: {
      id: rule.id,
      name: rule.name,
      kind: rule.kind,
      params_json: rule.params_json,
    },
  };
}

export function createRoll3DDiceInputsFromSavedActionEntry(params: {
  group: GroupRow;
  die: GroupDieRow;
  rulesMap: Record<string, RuleRow>;
  source?: Roll3DDieSource;
}): Roll3DActionEntryDraftInput {
  const { group, die, rulesMap, source = "action" } = params;

  const sides = toRoll3DDieSides(die.sides);

  if (!sides) {
    return {
      dice: [],
      groupBehavior: null,
    };
  }

  const qty = Math.max(1, Math.floor(die.qty ?? 1));
  const sign = toRoll3DDieSign(die.sign);
  const modifier = Number.isFinite(die.modifier ?? 0) ? (die.modifier ?? 0) : 0;

  const behavior = createRoll3DBehaviorRefFromRule(
    die.rule_id ? rulesMap[die.rule_id] : null,
  );

  const rollEntryId = `${group.id}-die-${die.id}-${Date.now()}`;

  const diceInputs: CreateRoll3DDieInput[] = [];

  for (let index = 0; index < qty; index += 1) {
    diceInputs.push({
      rollEntryId,
      sides,
      sign,
      modifier: index === 0 ? modifier : 0,
      source,
      behavior,
    });
  }

  const groupBehavior = createRoll3DBehaviorRefFromRule(
    group.rule_id ? rulesMap[group.rule_id] : null,
  );

  return {
    dice: diceInputs,
    groupBehavior,
  };
}

export function createRoll3DDraftFromSavedAction(params: {
  group: GroupRow;
  dice: GroupDieRow[];
  rulesMap: Record<string, RuleRow>;
  source?: Roll3DDieSource;
}) {
  const { group, dice, rulesMap, source = "action" } = params;

  const diceInputs: CreateRoll3DDieInput[] = [];

  for (const die of dice) {
    const entryDraft = createRoll3DDiceInputsFromSavedActionEntry({
      group,
      die,
      rulesMap,
      source,
    });

    diceInputs.push(...entryDraft.dice);
  }

  const groupBehavior = createRoll3DBehaviorRefFromRule(
    group.rule_id ? rulesMap[group.rule_id] : null,
  );

  return createRoll3DDraftFromDice(diceInputs, {
    groupBehavior,
  });
}
