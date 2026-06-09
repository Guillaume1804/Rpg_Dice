// dice-universal/features/roll3d/logic/roll3DActionDraft.ts

import type {
  GroupDieRow,
  GroupRow,
} from "../../../data/repositories/groupsRepo";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import type {
  Roll3DActionEntryAdjustment,
  Roll3DBehaviorParamsOverride,
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

function formatTechnicalEntryLabel(params: {
  sign: Roll3DDieSign;
  qty: number;
  sides: Roll3DDieSides;
  modifier: number;
}) {
  const { sign, qty, sides, modifier } = params;

  const signPrefix = sign === -1 ? "- " : "";
  const modifierLabel =
    modifier > 0
      ? ` + ${modifier}`
      : modifier < 0
        ? ` - ${Math.abs(modifier)}`
        : "";

  return `${signPrefix}${qty}d${sides}${modifierLabel}`;
}

function safeParseBehaviorParams(paramsJson: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(paramsJson || "{}");

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return {};
  } catch {
    return {};
  }
}

function hasBehaviorParamsOverride(
  override: Roll3DBehaviorParamsOverride | undefined,
) {
  return !!override && Object.keys(override).length > 0;
}

function mergeRoll3DBehaviorRefWithParamsOverride(
  behavior: Roll3DDieBehaviorRef | null,
  override: Roll3DBehaviorParamsOverride | undefined,
): Roll3DDieBehaviorRef | null {
  if (!behavior || !hasBehaviorParamsOverride(override)) {
    return behavior;
  }

  const baseParams = safeParseBehaviorParams(behavior.rule.params_json);
  const nextParams = {
    ...baseParams,
    ...override,
  };

  return {
    ...behavior,
    rule: {
      ...behavior.rule,
      params_json: JSON.stringify(nextParams),
    },
  };
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

export function createRoll3DActionEntryAdjustmentFromSavedActionEntry(params: {
  group: GroupRow;
  die: GroupDieRow;
  rulesMap: Record<string, RuleRow>;
}): Roll3DActionEntryAdjustment | null {
  const { group, die, rulesMap } = params;

  const sides = toRoll3DDieSides(die.sides);

  if (!sides) {
    return null;
  }

  const qty = Math.max(1, Math.floor(die.qty ?? 1));
  const sign = toRoll3DDieSign(die.sign);
  const modifier = Number.isFinite(die.modifier ?? 0) ? (die.modifier ?? 0) : 0;

  const behavior = createRoll3DBehaviorRefFromRule(
    die.rule_id ? rulesMap[die.rule_id] : null,
  );

  const groupBehavior = createRoll3DBehaviorRefFromRule(
    group.rule_id ? rulesMap[group.rule_id] : null,
  );

  const technicalLabel = formatTechnicalEntryLabel({
    sign,
    qty,
    sides,
    modifier,
  });

  const customLabel =
    typeof die.label === "string" && die.label.trim().length > 0
      ? die.label.trim()
      : null;

  const behaviorParamsTarget = behavior
    ? "entry"
    : groupBehavior
      ? "group"
      : null;

  return {
    actionId: group.id,
    entryId: die.id,
    actionName: group.name,
    entryLabel: customLabel ?? technicalLabel,
    technicalLabel,
    detail: behavior?.label ?? groupBehavior?.label ?? "Somme simple",
    sides,
    qty,
    modifier,
    sign,
    behavior,
    groupBehavior,
    behaviorParamsTarget,
    behaviorParamsOverride: {},
    valueSources: [],
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

export function createRoll3DDiceInputsFromActionEntryAdjustment(params: {
  adjustment: Roll3DActionEntryAdjustment;
  source?: Roll3DDieSource;
}): Roll3DActionEntryDraftInput {
  const { adjustment, source = "action" } = params;

  const qty = Math.max(1, Math.floor(adjustment.qty));
  const rollEntryId = `${adjustment.actionId}-entry-${adjustment.entryId}-${Date.now()}`;

  const behavior =
    adjustment.behaviorParamsTarget === "entry"
      ? mergeRoll3DBehaviorRefWithParamsOverride(
          adjustment.behavior,
          adjustment.behaviorParamsOverride,
        )
      : adjustment.behavior;

  const groupBehavior =
    adjustment.behaviorParamsTarget === "group"
      ? mergeRoll3DBehaviorRefWithParamsOverride(
          adjustment.groupBehavior,
          adjustment.behaviorParamsOverride,
        )
      : adjustment.groupBehavior;

  const diceInputs: CreateRoll3DDieInput[] = [];

  for (let index = 0; index < qty; index += 1) {
    diceInputs.push({
      rollEntryId,
      sides: adjustment.sides,
      sign: adjustment.sign,
      modifier: index === 0 ? adjustment.modifier : 0,
      source,
      behavior,
      valueSources: adjustment.valueSources ?? [],
    });
  }

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
