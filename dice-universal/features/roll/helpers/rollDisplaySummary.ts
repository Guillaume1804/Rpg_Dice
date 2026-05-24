export type DraftTempRuleSummary = {
  id: string;
  name: string;
  kind: string;
  behavior_key?: string | null;
  category?: string | null;
  params_json: string;
};

export type DraftDieSummary = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
  rule_temp?: DraftTempRuleSummary | null;
};

export type DraftGroupSummary = {
  id: string;
  name: string;
  rule_id?: string | null;
  rule_temp?: DraftTempRuleSummary | null;
  dice: DraftDieSummary[];
};

export type SavedActionDieSummary = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
};

export type SavedActionGroupSummary = {
  rule_id?: string | null;
};

export type RuleNameMap = Record<
  string,
  {
    name: string;
  }
>;

export function formatSignedModifier(modifier?: number) {
  const safeModifier = Number.isFinite(modifier) ? Number(modifier) : 0;

  if (safeModifier === 0) return "";

  return ` ${safeModifier > 0 ? "+" : "-"} ${Math.abs(safeModifier)}`;
}

export function formatDraftDieLabel(die: DraftDieSummary) {
  const sign = die.sign === -1 ? "- " : "";
  return `${sign}${die.qty}d${die.sides}${formatSignedModifier(die.modifier)}`;
}

function safeParseJsonObject(value?: string | null): Record<string, any> {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function formatNumberList(values: unknown) {
  if (!Array.isArray(values) || values.length === 0) return null;

  return values
    .filter((value) => typeof value === "number" && Number.isFinite(value))
    .join(", ");
}

export function getRuleSummaryFromTempRule(
  rule: DraftTempRuleSummary | null | undefined,
) {
  if (!rule) return null;

  const params = safeParseJsonObject(rule.params_json);
  const behaviorKey = rule.behavior_key;

  if (behaviorKey === "single_check" || rule.kind === "single_check") {
    const parts = ["Test avec seuil"];

    const threshold = params.success_threshold;
    const compare = params.compare === "lte" ? "≤" : "≥";

    if (typeof threshold === "number") {
      parts.push(`Réussite ${compare} ${threshold}`);
    }

    const critSuccess = formatNumberList(params.crit_success_faces);
    if (critSuccess) parts.push(`Critique ${critSuccess}`);

    const critFailure = formatNumberList(params.crit_failure_faces);
    if (critFailure) parts.push(`Échec critique ${critFailure}`);

    return parts.join(" · ");
  }

  if (
    behaviorKey === "threshold_degrees" ||
    rule.kind === "threshold_degrees"
  ) {
    const parts = ["Seuil avec degrés"];

    const target = params.target_value;
    const compare = params.compare === "gte" ? "≥" : "≤";

    if (typeof target === "number") {
      parts.push(`Réussite ${compare} ${target}`);
    }

    if (typeof params.degree_step === "number") {
      parts.push(`Degré ${params.degree_step}`);
    }

    return parts.join(" · ");
  }

  if (behaviorKey === "success_pool" || rule.kind === "success_pool") {
    const parts = ["Pool de succès"];

    if (typeof params.success_at_or_above === "number") {
      parts.push(`Succès ≥ ${params.success_at_or_above}`);
    }

    const failFaces = formatNumberList(params.fail_faces);
    if (failFaces) parts.push(`Faces spéciales ${failFaces}`);

    if (params.glitch_rule === "any_special_failure") {
      parts.push("complication si face spéciale");
    }

    if (params.glitch_rule === "special_failures_gt_successes") {
      parts.push("complication si faces spéciales > succès");
    }

    if (params.glitch_rule === "special_failures_gte_successes") {
      parts.push("complication si faces spéciales ≥ succès");
    }

    if (params.glitch_rule === "special_failures_gt_half_dice") {
      parts.push("complication si faces spéciales > moitié des dés");
    }

    if (params.glitch_rule === "special_failures_gte_half_dice") {
      parts.push("complication si faces spéciales ≥ moitié des dés");
    }

    if (params.critical_failure_rule === "complication_and_zero_successes") {
      parts.push("critique si complication + 0 succès");
    }

    if (params.critical_failure_rule === "all_special_failures") {
      parts.push("critique si tous les dés sont spéciaux");
    }

    if (params.critical_success_rule === "successes_gte_threshold") {
      parts.push(`critique si succès ≥ ${params.critical_success_threshold}`);
    }

    if (params.critical_success_rule === "all_dice_successes") {
      parts.push("critique si tous les dés réussissent");
    }

    if (params.critical_success_rule === "all_dice_max_faces") {
      parts.push("critique si tous les dés sont au maximum");
    }

    if (params.critical_success_rule === "any_max_face") {
      parts.push("critique si face maximale");
    }

    return parts.join(" · ");
  }

  if (behaviorKey === "table_lookup" || rule.kind === "table_lookup") {
    return "Table / Paliers";
  }

  if (behaviorKey === "banded_sum" || rule.kind === "banded_sum") {
    return "Résultat par paliers";
  }

  if (behaviorKey === "custom_pipeline" || rule.kind === "pipeline") {
    const parts: string[] = [];
    const steps = Array.isArray(params.steps) ? params.steps : [];

    for (const step of steps) {
      if (!step || typeof step !== "object") continue;

      if (step.op === "reroll") {
        const faces = formatNumberList(step.faces);
        parts.push(faces ? `Relance ${faces}` : "Relance");
      }

      if (step.op === "explode") {
        const faces = formatNumberList(step.faces);
        parts.push(faces ? `Explosion ${faces}` : "Explosion");
      }

      if (step.op === "keep_highest") parts.push(`Garde ${step.n} meilleurs`);
      if (step.op === "keep_lowest") parts.push(`Garde ${step.n} plus faibles`);
      if (step.op === "drop_highest") parts.push(`Retire ${step.n} meilleurs`);
      if (step.op === "drop_lowest")
        parts.push(`Retire ${step.n} plus faibles`);

      if (step.op === "count_successes") {
        parts.push(`Succès ≥ ${step.at_or_above}`);
      }

      if (step.op === "count_equal") {
        const faces = formatNumberList(step.faces);
        parts.push(faces ? `Compte ${faces}` : "Compte faces exactes");
      }

      if (step.op === "count_range") {
        parts.push(`Compte ${step.min}-${step.max}`);
      }
    }

    const output = params.output;

    if (output === "sum") parts.push("Somme");
    if (output === "values") parts.push("Valeurs");
    if (output === "successes") parts.push("Succès");
    if (output === "count_equal") parts.push("Faces exactes");
    if (output === "count_range") parts.push("Plage");
    if (output === "first_value") parts.push("Première valeur");

    const critSuccess = formatNumberList(params.crit_success_faces);
    if (critSuccess) parts.push(`Critique ${critSuccess}`);

    const critFailure = formatNumberList(params.crit_failure_faces);
    if (critFailure) parts.push(`Échec critique ${critFailure}`);

    const complicationFaces = formatNumberList(params.complication_faces);
    if (complicationFaces) parts.push(`Complication ${complicationFaces}`);

    if (params.complication_rule === "gt_half_dice") {
      parts.push("complication > moitié des dés");
    }

    if (params.complication_rule === "gte_half_dice") {
      parts.push("complication ≥ moitié des dés");
    }

    if (params.complication_rule === "gt_half_successes") {
      parts.push("complication > moitié des succès");
    }

    if (params.complication_rule === "gte_half_successes") {
      parts.push("complication ≥ moitié des succès");
    }

    if (params.critical_failure_rule === "complication_and_zero_successes") {
      parts.push("critique si complication + 0 succès");
    }

    if (params.critical_failure_rule === "complication_and_failed_threshold") {
      parts.push("critique si complication + seuil raté");
    }

    if (params.critical_failure_rule === "all_complication_faces") {
      parts.push("critique si toutes les faces sont spéciales");
    }

    if (params.critical_success_rule === "successes_gte_threshold") {
      parts.push(`critique si succès ≥ ${params.critical_success_threshold}`);
    }

    if (params.critical_success_rule === "all_dice_successes") {
      parts.push("critique si tous les dés réussissent");
    }

    if (params.critical_success_rule === "all_dice_max_faces") {
      parts.push("critique si tous les dés sont au maximum");
    }

    if (params.critical_success_rule === "any_max_face") {
      parts.push("critique si face maximale");
    }

    const pipelineCriticalFaces = formatNumberList(
      params.critical_success_faces,
    );

    if (
      params.critical_success_rule === "any_critical_face" &&
      pipelineCriticalFaces
    ) {
      parts.push(`critique sur ${pipelineCriticalFaces}`);
    }

    return parts.length > 0 ? parts.join(" · ") : "Pipeline personnalisé";
  }

  return rule.name;
}

export function getRuleSummaryFromRuleId(
  ruleId: string | null | undefined,
  rulesMap: RuleNameMap,
) {
  if (!ruleId) return null;

  return rulesMap[ruleId]?.name ?? null;
}

export function getDraftGroupBehaviorSummary(
  group: DraftGroupSummary | null,
  rulesMap: RuleNameMap,
) {
  if (!group) return null;

  const groupRuleSummary =
    getRuleSummaryFromTempRule(group.rule_temp) ??
    getRuleSummaryFromRuleId(group.rule_id, rulesMap);

  if (groupRuleSummary) return groupRuleSummary;

  const firstDieWithRule = group.dice.find(
    (die) => die.rule_temp || die.rule_id,
  );

  if (!firstDieWithRule) return null;

  return (
    getRuleSummaryFromTempRule(firstDieWithRule.rule_temp) ??
    getRuleSummaryFromRuleId(firstDieWithRule.rule_id, rulesMap)
  );
}

export function formatDraftGroupDiceLabel(
  group: DraftGroupSummary | null,
  rulesMap: RuleNameMap,
) {
  if (!group || group.dice.length === 0) return null;

  const diceLabel = group.dice.map(formatDraftDieLabel).join(" + ");
  const behaviorSummary = getDraftGroupBehaviorSummary(group, rulesMap);

  return behaviorSummary ? `${diceLabel} · ${behaviorSummary}` : diceLabel;
}

export function formatSavedActionDiceLabel(dice: SavedActionDieSummary[]) {
  if (dice.length === 0) return "Aucun dé";

  return dice
    .map((die) => {
      const sign = die.sign === -1 ? "- " : "";
      return `${sign}${die.qty}d${die.sides}${formatSignedModifier(
        die.modifier,
      )}`;
    })
    .join(" + ");
}

export function getSavedActionBehaviorLabel(params: {
  group: SavedActionGroupSummary;
  dice: SavedActionDieSummary[];
  rulesMap: RuleNameMap;
}) {
  if (params.group.rule_id && params.rulesMap[params.group.rule_id]) {
    return params.rulesMap[params.group.rule_id].name;
  }

  const firstDieRuleId = params.dice.find((die) => die.rule_id)?.rule_id;

  if (firstDieRuleId && params.rulesMap[firstDieRuleId]) {
    return params.rulesMap[firstDieRuleId].name;
  }

  return "Somme simple";
}

export function formatSavedActionDetail(params: {
  group: SavedActionGroupSummary;
  dice: SavedActionDieSummary[];
  rulesMap: RuleNameMap;
}) {
  const diceLabel = formatSavedActionDiceLabel(params.dice);
  const behaviorLabel = getSavedActionBehaviorLabel(params);

  return `${diceLabel} · ${behaviorLabel}`;
}
