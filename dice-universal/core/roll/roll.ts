// core/roll/roll.ts

export type RollDie = {
  value: number;
};

export type RollRuleRef = {
  id: string;
  name: string;
  kind: string;
  params_json: string;
};

export type RollEntryInput = {
  entryId: string;
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number; // +1 / -1
  rule?: RollRuleRef | null;
};

export type GroupRuleInput = {
  id: string;
  name: string;
  kind: string;
  params_json: string;
} | null;

export type EntryRollResult = {
  entryId: string;
  sides: number;
  qty: number;
  modifier: number;
  sign: number;

  rule: RollRuleRef | null;

  dice: RollDie[];
  natural_values: number[];
  signed_values: number[];

  base_total: number;
  total_with_modifier: number;

  eval_result: any | null;
  final_total: number;
};

export type GroupRollResult = {
  groupId: string;
  label: string;

  group_rule: GroupRuleInput;
  group_eval_result: any | null;

  entries: EntryRollResult[];

  entries_total: number;
  total: number;
};

type EvaluateRuleFn = (
  kind: string,
  params_json: string,
  ctx: {
    values: number[];
    sides: number;
    modifier?: number;
    sign?: number;
  }
) => any;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function extractNumericFinalFromEval(res: any): number | null {
  if (!res) return null;

  if (res.kind === "sum" && typeof res.total === "number") return res.total;
  if (res.kind === "d20" && typeof res.final === "number") return res.final;
  if (res.kind === "pipeline" && typeof res.final === "number") return res.final;

  return null;
}

export function rollGroup(params: {
  groupId: string;
  label: string;
  entries: RollEntryInput[];
  groupRule?: GroupRuleInput;
  evaluateRule: EvaluateRuleFn;
}): GroupRollResult {
  const entryResults: EntryRollResult[] = params.entries.map((entry) => {
    const qty = Math.max(0, entry.qty || 0);
    const sides = Math.max(1, entry.sides || 1);
    const sign = entry.sign === -1 ? -1 : 1;
    const modifier = Number.isFinite(entry.modifier) ? Number(entry.modifier) : 0;

    const dice: RollDie[] = [];
    for (let i = 0; i < qty; i++) {
      dice.push({ value: randInt(1, sides) });
    }

    const natural_values = dice.map((d) => d.value);
    const signed_values = natural_values.map((v) => v * sign);

    const base_total = signed_values.reduce((acc, v) => acc + v, 0);
    const total_with_modifier = base_total + modifier;

    let eval_result: any | null = null;
    let final_total = total_with_modifier;

    if (entry.rule) {
      eval_result = params.evaluateRule(entry.rule.kind, entry.rule.params_json, {
        values: natural_values,
        sides,
        modifier,
        sign,
      });

      const numericFromRule = extractNumericFinalFromEval(eval_result);
      if (numericFromRule != null) {
        final_total = numericFromRule;
      }
    }

    return {
      entryId: entry.entryId,
      sides,
      qty,
      modifier,
      sign,
      rule: entry.rule ?? null,
      dice,
      natural_values,
      signed_values,
      base_total,
      total_with_modifier,
      eval_result,
      final_total,
    };
  });

  const entries_total = entryResults.reduce((acc, e) => acc + e.final_total, 0);

  let group_eval_result: any | null = null;
  let total = entries_total;

  if (params.groupRule) {
    group_eval_result = params.evaluateRule(
      params.groupRule.kind,
      params.groupRule.params_json,
      {
        values: entryResults.map((e) => e.final_total),
        sides: 0,
        modifier: 0,
        sign: 1,
      }
    );

    const numericFromGroupRule = extractNumericFinalFromEval(group_eval_result);
    if (numericFromGroupRule != null) {
      total = numericFromGroupRule;
    }
  }

  return {
    groupId: params.groupId,
    label: params.label,
    group_rule: params.groupRule ?? null,
    group_eval_result,
    entries: entryResults,
    entries_total,
    total,
  };
}