// dice-universal/features/roll3d/presentation/roll3DResultPresentation.ts

import type { Roll3DRollSummary } from "../types";

type OfficialEntry = Roll3DRollSummary["officialResult"]["entries"][number];

export type Roll3DResultTone =
  | "neutral"
  | "success"
  | "failure"
  | "criticalSuccess"
  | "criticalFailure"
  | "complication";

export type Roll3DResultEvent =
  | "sum"
  | "modifier"
  | "success"
  | "failure"
  | "critical_success"
  | "critical_failure"
  | "complication"
  | "success_pool"
  | "degrees"
  | "keep_drop"
  | "pipeline"
  | "table_lookup"
  | "group_behavior";

export type Roll3DResultPresentationSection = {
  id: string;
  title: string;
  subtitle?: string;
  tone: Roll3DResultTone;
  lines: string[];
  chips: string[];
};

export type Roll3DResultPresentation = {
  title: string;
  subtitle: string;
  mainValue: string;
  mainLabel: string;
  tone: Roll3DResultTone;
  events: Roll3DResultEvent[];
  summaryLines: string[];
  sections: Roll3DResultPresentationSection[];
};

function formatCompare(compare?: string) {
  return compare === "lte" ? "≤" : "≥";
}

function formatNumberArray(values: number[] | undefined | null) {
  if (!Array.isArray(values) || values.length === 0) {
    return "—";
  }

  return values.join(", ");
}

function formatMaybeArray(value: number | number[] | null | undefined) {
  if (Array.isArray(value)) {
    return formatNumberArray(value);
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "—";
}

function getOutcomeFromEval(evalResult: any | null | undefined): string | null {
  if (!evalResult) return null;

  if (typeof evalResult.outcome === "string") {
    return evalResult.outcome;
  }

  if (typeof evalResult.meta?.outcome === "string") {
    return evalResult.meta.outcome;
  }

  return null;
}

function getPrimaryEvalResult(result: Roll3DRollSummary) {
  if (result.officialResult.group_eval_result) {
    return result.officialResult.group_eval_result;
  }

  const entryWithOutcome = result.officialResult.entries.find((entry) =>
    getOutcomeFromEval(entry.eval_result),
  );

  if (entryWithOutcome?.eval_result) {
    return entryWithOutcome.eval_result;
  }

  return result.officialResult.entries.find((entry) => entry.eval_result)
    ?.eval_result;
}

function getToneFromOutcome(
  outcome: string | null | undefined,
): Roll3DResultTone {
  switch (outcome) {
    case "crit_success":
      return "criticalSuccess";

    case "success":
      return "success";

    case "failure":
      return "failure";

    case "crit_failure":
    case "crit_glitch":
      return "criticalFailure";

    case "glitch":
      return "complication";

    default:
      return "neutral";
  }
}

function getTitleFromTone(tone: Roll3DResultTone) {
  switch (tone) {
    case "criticalSuccess":
      return "Réussite critique";

    case "success":
      return "Réussite";

    case "failure":
      return "Échec";

    case "criticalFailure":
      return "Échec critique";

    case "complication":
      return "Complication";

    case "neutral":
    default:
      return "Résultat";
  }
}

function getMainLabel(result: Roll3DRollSummary, primaryEvalResult: any) {
  if (primaryEvalResult?.kind === "success_pool") {
    return "succès";
  }

  if (
    primaryEvalResult?.kind === "pipeline" &&
    typeof primaryEvalResult.meta?.successes === "number"
  ) {
    return "succès";
  }

  if (primaryEvalResult?.kind === "threshold_degrees") {
    return primaryEvalResult.degrees > 1 ? "degrés" : "degré";
  }

  if (primaryEvalResult?.kind === "table_lookup") {
    return "table";
  }

  if (result.officialResult.group_eval_result) {
    return "résultat";
  }

  return "total";
}

function getMainValue(result: Roll3DRollSummary, primaryEvalResult: any) {
  if (primaryEvalResult?.kind === "success_pool") {
    return String(primaryEvalResult.successes);
  }

  if (
    primaryEvalResult?.kind === "pipeline" &&
    typeof primaryEvalResult.meta?.successes === "number"
  ) {
    return String(primaryEvalResult.meta.successes);
  }

  if (primaryEvalResult?.kind === "threshold_degrees") {
    return String(primaryEvalResult.degrees);
  }

  if (primaryEvalResult?.kind === "table_lookup") {
    return String(primaryEvalResult.label ?? result.total);
  }

  if (
    primaryEvalResult?.kind === "pipeline" &&
    primaryEvalResult.meta?.lookup?.label
  ) {
    return String(primaryEvalResult.meta.lookup.label);
  }

  return String(result.total);
}

function collectEventsFromEval(
  evalResult: any | null | undefined,
): Roll3DResultEvent[] {
  const events = new Set<Roll3DResultEvent>();

  if (!evalResult) {
    return [];
  }

  const outcome = getOutcomeFromEval(evalResult);

  if (outcome === "success") events.add("success");
  if (outcome === "failure") events.add("failure");
  if (outcome === "crit_success") events.add("critical_success");
  if (outcome === "crit_failure" || outcome === "crit_glitch") {
    events.add("critical_failure");
  }
  if (outcome === "glitch" || outcome === "crit_glitch") {
    events.add("complication");
  }

  if (evalResult.kind === "success_pool") events.add("success_pool");
  if (evalResult.kind === "threshold_degrees") events.add("degrees");
  if (evalResult.kind === "pipeline") events.add("pipeline");
  if (evalResult.kind === "table_lookup") events.add("table_lookup");

  if (
    evalResult.kind === "keep_highest_n" ||
    evalResult.kind === "keep_lowest_n" ||
    evalResult.kind === "drop_highest_n" ||
    evalResult.kind === "drop_lowest_n"
  ) {
    events.add("keep_drop");
  }

  if (evalResult.kind === "pipeline" && evalResult.meta?.degrees) {
    events.add("degrees");
  }

  if (evalResult.kind === "pipeline" && evalResult.meta?.complication) {
    events.add("complication");
  }

  return Array.from(events);
}

function formatEvalLines(evalResult: any | null | undefined): string[] {
  if (!evalResult) return [];

  if (evalResult.kind === "sum") {
    return [`Total : ${evalResult.total}`];
  }

  if (evalResult.kind === "single_check") {
    const threshold =
      evalResult.threshold == null
        ? "sans seuil"
        : `${formatCompare(evalResult.compare)} ${evalResult.threshold}`;

    return [
      `Jet naturel : ${evalResult.natural}`,
      `Final : ${evalResult.final}`,
      `Seuil : ${threshold}`,
    ];
  }

  if (evalResult.kind === "threshold_degrees") {
    return [
      `Jet : ${evalResult.roll}`,
      `Final : ${evalResult.final}`,
      `Cible : ${formatCompare(evalResult.compare)} ${evalResult.target}`,
      `Marge : ${evalResult.margin}`,
      `Degrés : ${evalResult.degrees}`,
    ];
  }

  if (evalResult.kind === "success_pool") {
    const lines = [
      `Succès : ${evalResult.successes}`,
      `Échecs spéciaux : ${evalResult.fail_count}`,
      `Dés lancés : ${evalResult.dice_count}`,
      `Seuil : ${evalResult.success_at_or_above}+`,
    ];

    if (evalResult.complication) lines.push("Complication détectée");
    if (evalResult.critical_success) lines.push("Réussite critique détectée");
    if (evalResult.critical_failure) lines.push("Échec critique détecté");

    return lines;
  }

  if (evalResult.kind === "table_lookup") {
    return [`Valeur : ${evalResult.value}`, `Résultat : ${evalResult.label}`];
  }

  if (evalResult.kind === "banded_sum") {
    return [`Total : ${evalResult.total}`, `Palier : ${evalResult.label}`];
  }

  if (
    evalResult.kind === "highest_of_pool" ||
    evalResult.kind === "lowest_of_pool"
  ) {
    const label =
      evalResult.kind === "highest_of_pool" ? "Meilleur dé" : "Pire dé";

    const threshold =
      evalResult.threshold == null
        ? "sans seuil"
        : `${formatCompare(evalResult.compare)} ${evalResult.threshold}`;

    return [
      `${label} : ${evalResult.kept}`,
      `Dés : ${formatNumberArray(evalResult.natural_values)}`,
      `Final : ${evalResult.final}`,
      `Seuil : ${threshold}`,
    ];
  }

  if (evalResult.kind === "keep_highest_n") {
    return [
      `Dés : ${formatNumberArray(evalResult.natural_values)}`,
      `Gardés : ${formatNumberArray(evalResult.kept)}`,
      `Final : ${formatMaybeArray(evalResult.final)}`,
    ];
  }

  if (evalResult.kind === "keep_lowest_n") {
    return [
      `Dés : ${formatNumberArray(evalResult.natural_values)}`,
      `Gardés : ${formatNumberArray(evalResult.kept)}`,
      `Final : ${formatMaybeArray(evalResult.final)}`,
    ];
  }

  if (evalResult.kind === "drop_highest_n") {
    return [
      `Dés : ${formatNumberArray(evalResult.natural_values)}`,
      `Restants : ${formatNumberArray(evalResult.remaining)}`,
      `Final : ${formatMaybeArray(evalResult.final)}`,
    ];
  }

  if (evalResult.kind === "drop_lowest_n") {
    return [
      `Dés : ${formatNumberArray(evalResult.natural_values)}`,
      `Restants : ${formatNumberArray(evalResult.remaining)}`,
      `Final : ${formatMaybeArray(evalResult.final)}`,
    ];
  }

  if (evalResult.kind === "pipeline") {
    const lines = [
      `Dés : ${formatNumberArray(evalResult.values)}`,
      `Gardés : ${formatNumberArray(evalResult.kept)}`,
      `Final : ${formatMaybeArray(evalResult.final)}`,
    ];

    if (typeof evalResult.meta?.successes === "number") {
      lines.push(`Succès : ${evalResult.meta.successes}`);
    }

    if (typeof evalResult.meta?.complications === "number") {
      lines.push(`Complications : ${evalResult.meta.complications}`);
    }

    if (typeof evalResult.meta?.count_equal === "number") {
      lines.push(`Comptage faces : ${evalResult.meta.count_equal}`);
    }

    if (typeof evalResult.meta?.count_range === "number") {
      lines.push(`Comptage plage : ${evalResult.meta.count_range}`);
    }

    if (evalResult.meta?.lookup?.label) {
      lines.push(`Palier : ${evalResult.meta.lookup.label}`);
    }

    if (evalResult.meta?.degrees) {
      lines.push(`Degrés : ${evalResult.meta.degrees.degrees}`);
      lines.push(`Marge : ${evalResult.meta.degrees.margin}`);
    }

    if (evalResult.meta?.complication) {
      lines.push("Complication détectée");
    }

    if (evalResult.meta?.critical_success) {
      lines.push("Réussite critique détectée");
    }

    if (evalResult.meta?.critical_failure) {
      lines.push("Échec critique détecté");
    }

    return lines;
  }

  if (evalResult.kind === "unknown") {
    return [evalResult.message ?? "Règle inconnue"];
  }

  return [];
}

function getEntryTitle(entry: OfficialEntry) {
  const signPrefix = entry.sign < 0 ? "-" : "";
  const modifierLabel =
    entry.modifier !== 0
      ? ` ${entry.modifier > 0 ? "+" : "-"} ${Math.abs(entry.modifier)}`
      : "";

  return `${signPrefix}${entry.qty}d${entry.sides}${modifierLabel}`;
}

function buildEntryChips(entry: OfficialEntry) {
  const chips = [`Dés : ${formatNumberArray(entry.natural_values)}`];

  if (entry.base_total !== entry.total_with_modifier) {
    chips.push(`Base : ${entry.base_total}`);
    chips.push(`Modifié : ${entry.total_with_modifier}`);
  }

  chips.push(`Final : ${entry.final_total}`);

  return chips;
}

function buildSubtitle(result: Roll3DRollSummary) {
  if (result.officialResult.group_eval_result) {
    return "Moteur officiel · comportement de groupe";
  }

  if (result.officialResult.entries.some((entry) => entry.eval_result)) {
    return "Moteur officiel · comportements";
  }

  if (result.modifierTotal !== 0) {
    return "Moteur officiel · modificateurs";
  }

  return "Moteur officiel · somme";
}

export function buildRoll3DResultPresentation(
  result: Roll3DRollSummary,
): Roll3DResultPresentation {
  const primaryEvalResult = getPrimaryEvalResult(result);
  const primaryOutcome = getOutcomeFromEval(primaryEvalResult);
  const tone = getToneFromOutcome(primaryOutcome);

  const events = new Set<Roll3DResultEvent>();

  if (result.modifierTotal !== 0) {
    events.add("modifier");
  }

  if (result.officialResult.group_eval_result) {
    events.add("group_behavior");
  }

  if (!primaryEvalResult) {
    events.add("sum");
  }

  for (const event of collectEventsFromEval(primaryEvalResult)) {
    events.add(event);
  }

  for (const entry of result.officialResult.entries) {
    for (const event of collectEventsFromEval(entry.eval_result)) {
      events.add(event);
    }
  }

  const summaryLines = formatEvalLines(primaryEvalResult);

  const groupSection =
    result.officialResult.group_eval_result != null
      ? {
          id: "group-behavior",
          title: "Comportement de groupe",
          subtitle: result.officialResult.group_rule?.name ?? undefined,
          tone: getToneFromOutcome(
            getOutcomeFromEval(result.officialResult.group_eval_result),
          ),
          lines: formatEvalLines(result.officialResult.group_eval_result),
          chips: [],
        }
      : null;

  const entrySections = result.officialResult.entries.map((entry) => {
    const entryOutcome = getOutcomeFromEval(entry.eval_result);

    return {
      id: entry.entryId,
      title: getEntryTitle(entry),
      subtitle: entry.rule?.name ?? "Somme simple",
      tone: getToneFromOutcome(entryOutcome),
      lines: formatEvalLines(entry.eval_result),
      chips: buildEntryChips(entry),
    };
  });

  return {
    title: getTitleFromTone(tone),
    subtitle: buildSubtitle(result),
    mainValue: getMainValue(result, primaryEvalResult),
    mainLabel: getMainLabel(result, primaryEvalResult),
    tone,
    events: Array.from(events),
    summaryLines,
    sections: groupSection ? [groupSection, ...entrySections] : entrySections,
  };
}
