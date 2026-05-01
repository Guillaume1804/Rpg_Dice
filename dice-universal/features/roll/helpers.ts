// dice-universal\features\roll\helpers.ts

import type { RuleRow } from "../../data/repositories/rulesRepo";

export function getRuleName(rule: any | null) {
  return rule?.name ?? "Somme (par défaut)";
}

export function getRuleNameFromId(
  ruleId: string | null | undefined,
  availableRules: RuleRow[],
) {
  if (!ruleId) return "Somme (par défaut)";
  return (
    availableRules.find((r) => r.id === ruleId)?.name ?? "Règle introuvable"
  );
}

export function getSignLabel(sign?: number) {
  return (sign ?? 1) === -1 ? "-" : "+";
}

export function formatRuleResult(res: any): string {
  if (!res) return "";

  if (res.kind === "sum") {
    return `Somme = ${res.total}`;
  }

  if (res.kind === "pipeline") {
    const outcome =
      res?.meta?.outcome != null
        ? ` — ${formatOutcomeLabel(res.meta.outcome)}`
        : "";

    if (res.final == null) {
      return `Pipeline${outcome}`;
    }

    return `Pipeline = ${res.final}${outcome}`;
  }

  if (res.kind === "single_check") {
    if (res.outcome === "crit_success") return "Réussite critique";
    if (res.outcome === "crit_failure") return "Échec critique";
    if (res.threshold == null) return "Résultat";
    return res.outcome === "success" ? "Réussite" : "Échec";
  }

  if (res.kind === "success_pool") {
    const label =
      res.outcome === "crit_glitch"
        ? "Échec critique"
        : res.outcome === "glitch"
          ? "Complication"
          : res.outcome === "success"
            ? "Réussite"
            : "Échec";

    return `${label} — succès: ${res.successes} / échecs spéciaux: ${res.fail_count}`;
  }

  if (res.kind === "banded_sum") {
    return `${res.label} — total: ${res.total}`;
  }

  if (res.kind === "highest_of_pool") {
    if (res.outcome === "crit_success") return "Réussite critique";
    if (res.outcome === "crit_failure") return "Échec critique";
    if (res.threshold == null) return "Résultat";
    return res.outcome === "success" ? "Réussite" : "Échec";
  }

  if (res.kind === "table_lookup") {
    return res.label;
  }

  if (res.kind === "threshold_degrees") {
    const label =
      res.outcome === "crit_success"
        ? "Réussite critique"
        : res.outcome === "crit_failure"
          ? "Échec critique"
          : res.outcome === "success"
            ? "Réussite"
            : "Échec";

    return `${label} — ${res.degrees} degré${res.degrees > 1 ? "s" : ""} — marge: ${res.margin}`;
  }

  if (res.kind === "unknown") {
    return res.message;
  }

  return "";
}

function formatOutcomeLabel(outcome: string): string {
  if (outcome === "crit_success") return "Réussite critique";
  if (outcome === "crit_failure") return "Échec critique";
  if (outcome === "success") return "Réussite";
  if (outcome === "failure") return "Échec";
  if (outcome === "glitch") return "Complication";
  if (outcome === "crit_glitch") return "Échec critique";
  return outcome;
}

export function getPipelineDisplayLines(res: any): string[] {
  if (!res || res.kind !== "pipeline") return [];

  const steps = Array.isArray(res.meta?.steps) ? res.meta.steps : [];
  const lines: string[] = [];

  lines.push(`Jets initiaux : ${formatValueListForDisplay(res.values)}`);

  const rerolls = steps.filter((step: any) => step.op === "reroll_one");
  if (rerolls.length > 0) {
    lines.push("Relances :");
    for (const step of rerolls) {
      lines.push(`• ${step.from} → ${step.to}`);
    }
  }

  const explosions = steps.filter((step: any) => step.op === "explode_one");
  if (explosions.length > 0) {
    lines.push("Explosions :");
    for (const step of explosions) {
      lines.push(`• ${step.trigger} → +${step.extra}`);
    }
  }

  const keepOrDropSteps = steps.filter((step: any) =>
    ["keep_highest", "keep_lowest", "drop_highest", "drop_lowest"].includes(
      step.op,
    ),
  );

  for (const step of keepOrDropSteps) {
    if (Array.isArray(step.kept)) {
      lines.push(`${formatPipelineStepLabel(step.op)} : ${formatValueListForDisplay(step.kept)}`);
    }
  }

  const countSuccessStep = steps.find(
    (step: any) => step.op === "count_successes",
  );
  if (countSuccessStep) {
    lines.push(
      `Succès ≥ ${countSuccessStep.at_or_above} : ${countSuccessStep.successes}`,
    );
  }

  const countEqualStep = steps.find((step: any) => step.op === "count_equal");
  if (countEqualStep) {
    lines.push(`Faces comptées : ${countEqualStep.count}`);
  }

  const countRangeStep = steps.find((step: any) => step.op === "count_range");
  if (countRangeStep) {
    lines.push(
      `Valeurs entre ${countRangeStep.min} et ${countRangeStep.max} : ${countRangeStep.count}`,
    );
  }

  if (Array.isArray(res.kept)) {
    lines.push(`Valeurs finales : ${formatValueListForDisplay(res.kept)}`);
  }

  if (res.meta?.outcome) {
    lines.push(`Résultat : ${formatOutcomeLabel(res.meta.outcome)}`);
  }

  if (res.final != null) {
    lines.push(`Final : ${res.final}`);
  }

  return lines;
}

function formatValueListForDisplay(values: any): string {
  if (!Array.isArray(values) || values.length === 0) return "—";
  return values.join(" + ");
}

function formatPipelineStepLabel(op: string): string {
  if (op === "keep_highest") return "Dés les plus hauts gardés";
  if (op === "keep_lowest") return "Dés les plus faibles gardés";
  if (op === "drop_highest") return "Après retrait des plus hauts";
  if (op === "drop_lowest") return "Après retrait des plus faibles";
  return op;
}