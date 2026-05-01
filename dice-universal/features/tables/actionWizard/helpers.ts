// dice-universal\features\tables\actionWizard\helpers.ts

import type { RuleScope } from "../../../data/repositories/rulesRepo";
import type { ActionWizardDraft, ActionWizardStep } from "./types";
import type { PipelineParams, PipelineStep } from "../../../core/rules/types";
import { buildRuleFromBehavior } from "../../../core/rules/buildRuleFromBehavior";

export type BuiltActionRulePayload = {
  name: string;
  kind: string;

  behavior_key: string | null;
  category: string | null;

  params_json: string;
  ui_schema_json: string | null;

  supported_sides_json: string;
  scope: RuleScope;
  usage_kind: "system_template" | "user_template" | "generated";
};

function parseNumberList(value: string): number[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);
}

function parseOptionalPositiveInt(value: string): number | null {
  const text = value.trim();
  if (!text) return null;

  const n = Number(text);
  if (!Number.isFinite(n) || n <= 0) return null;

  return Math.floor(n);
}

function buildPipelineParamsFromDraft(
  draft: ActionWizardDraft,
): PipelineParams {
  const steps: PipelineStep[] = [];

  const rerollFaces = parseNumberList(draft.pipelineRerollFaces);
  if (rerollFaces.length > 0) {
    steps.push({
      op: "reroll",
      faces: rerollFaces,
      once: draft.pipelineRerollOnce,
    });
  }

  const explodeFaces = parseNumberList(draft.pipelineExplodeFaces);
  if (explodeFaces.length > 0) {
    steps.push({
      op: "explode",
      faces: explodeFaces,
    });
  }

  const keepHighest = parseOptionalPositiveInt(draft.pipelineKeepHighest);
  if (keepHighest != null) {
    steps.push({
      op: "keep_highest",
      n: keepHighest,
    });
  }

  const keepLowest = parseOptionalPositiveInt(draft.pipelineKeepLowest);
  if (keepLowest != null) {
    steps.push({
      op: "keep_lowest",
      n: keepLowest,
    });
  }

  const dropHighest = parseOptionalPositiveInt(draft.pipelineDropHighest);
  if (dropHighest != null) {
    steps.push({
      op: "drop_highest",
      n: dropHighest,
    });
  }

  const dropLowest = parseOptionalPositiveInt(draft.pipelineDropLowest);
  if (dropLowest != null) {
    steps.push({
      op: "drop_lowest",
      n: dropLowest,
    });
  }

  const countSuccessAtOrAbove = parseOptionalPositiveInt(
    draft.pipelineCountSuccessAtOrAbove,
  );
  if (countSuccessAtOrAbove != null) {
    steps.push({
      op: "count_successes",
      at_or_above: countSuccessAtOrAbove,
    });
  }

  const countEqualFaces = parseNumberList(draft.pipelineCountEqualFaces);
  if (countEqualFaces.length > 0) {
    steps.push({
      op: "count_equal",
      faces: countEqualFaces,
    });
  }

  const countRangeMin = Number(draft.pipelineCountRangeMin);
  const countRangeMax = Number(draft.pipelineCountRangeMax);

  if (
    draft.pipelineCountRangeMin.trim() !== "" &&
    draft.pipelineCountRangeMax.trim() !== "" &&
    Number.isFinite(countRangeMin) &&
    Number.isFinite(countRangeMax)
  ) {
    steps.push({
      op: "count_range",
      min: countRangeMin,
      max: countRangeMax,
    });
  }

  const successThreshold =
    draft.pipelineSuccessThreshold.trim() === ""
      ? null
      : Number(draft.pipelineSuccessThreshold);

  return {
    steps,
    output: draft.pipelineOutput,
    success_threshold:
      successThreshold != null && Number.isFinite(successThreshold)
        ? successThreshold
        : undefined,
    compare: draft.pipelineCompare,
    crit_success_faces: parseNumberList(draft.pipelineCritSuccessFaces),
    crit_failure_faces: parseNumberList(draft.pipelineCritFailureFaces),
  };
}

export function validateActionWizardStep(
  step: ActionWizardStep,
  draft: ActionWizardDraft,
): string | null {
  if (step === "name") {
    if (!draft.name.trim()) {
      return "Le nom de l’action est obligatoire.";
    }
    return null;
  }

  if (step === "type") {
    if (!draft.behaviorType) {
      return "Choisis un type d’action.";
    }
    if (draft.behaviorType === "custom_pipeline") {
      if (
        draft.pipelineKeepHighest.trim() !== "" &&
        !Number.isFinite(Number(draft.pipelineKeepHighest))
      ) {
        return "Le nombre de dés à garder doit être un nombre valide.";
      }

      if (
        draft.pipelineKeepLowest.trim() !== "" &&
        !Number.isFinite(Number(draft.pipelineKeepLowest))
      ) {
        return "Le nombre de dés à garder doit être un nombre valide.";
      }

      if (
        draft.pipelineDropHighest.trim() !== "" &&
        !Number.isFinite(Number(draft.pipelineDropHighest))
      ) {
        return "Le nombre de dés à retirer doit être un nombre valide.";
      }

      if (
        draft.pipelineDropLowest.trim() !== "" &&
        !Number.isFinite(Number(draft.pipelineDropLowest))
      ) {
        return "Le nombre de dés à retirer doit être un nombre valide.";
      }

      if (
        draft.pipelineCountSuccessAtOrAbove.trim() !== "" &&
        !Number.isFinite(Number(draft.pipelineCountSuccessAtOrAbove))
      ) {
        return "Le seuil de succès doit être un nombre valide.";
      }

      if (
        draft.pipelineSuccessThreshold.trim() !== "" &&
        !Number.isFinite(Number(draft.pipelineSuccessThreshold))
      ) {
        return "Le seuil final doit être un nombre valide.";
      }

      if (
        draft.pipelineCountRangeMin.trim() !== "" &&
        !Number.isFinite(Number(draft.pipelineCountRangeMin))
      ) {
        return "Le minimum de plage doit être un nombre valide.";
      }

      if (
        draft.pipelineCountRangeMax.trim() !== "" &&
        !Number.isFinite(Number(draft.pipelineCountRangeMax))
      ) {
        return "Le maximum de plage doit être un nombre valide.";
      }

      return null;
    }
    return null;
  }

  if (step === "dice") {
    if (!draft.dice || draft.dice.length === 0) {
      return "Ajoute au moins un dé.";
    }

    for (const die of draft.dice) {
      if (!die.sides || die.sides <= 0) {
        return "Chaque dé doit avoir un nombre de faces valide.";
      }

      if (!Number.isFinite(die.qty) || die.qty <= 0) {
        return "La quantité doit être supérieure à 0.";
      }

      if (!Number.isFinite(die.modifier)) {
        return "Le modificateur est invalide.";
      }
    }

    return null;
  }

  if (step === "behavior") {
    if (!draft.behaviorType) {
      return "Choisis un type d’action.";
    }

    if (
      draft.behaviorType === "single_check" ||
      draft.behaviorType === "highest_of_pool" ||
      draft.behaviorType === "lowest_of_pool"
    ) {
      if (
        draft.successThreshold.trim() !== "" &&
        !Number.isFinite(Number(draft.successThreshold))
      ) {
        return "Le seuil doit être un nombre valide.";
      }

      return null;
    }

    if (draft.behaviorType === "threshold_degrees") {
      if (!Number.isFinite(Number(draft.targetValue))) {
        return "Le seuil / valeur cible doit être un nombre valide.";
      }

      if (
        !Number.isFinite(Number(draft.degreeStep)) ||
        Number(draft.degreeStep) <= 0
      ) {
        return "La taille d’un degré doit être supérieure à 0.";
      }

      for (const value of [
        draft.critSuccessMin,
        draft.critSuccessMax,
        draft.critFailureMin,
        draft.critFailureMax,
      ]) {
        if (value.trim() !== "" && !Number.isFinite(Number(value))) {
          return "Les bornes de critique doivent être des nombres valides.";
        }
      }

      return null;
    }

    if (draft.behaviorType === "success_pool") {
      if (!Number.isFinite(Number(draft.successAtOrAbove))) {
        return "Le seuil de réussite du pool doit être un nombre valide.";
      }

      return null;
    }

    if (
      draft.behaviorType === "keep_highest_n" ||
      draft.behaviorType === "keep_lowest_n"
    ) {
      const keepCount = Number(draft.keepCount);
      if (!Number.isFinite(keepCount) || keepCount <= 0) {
        return "Le nombre de dés à garder doit être supérieur à 0.";
      }

      if (keepCount > draft.die.qty) {
        return "Tu ne peux pas garder plus de dés que tu n’en lances.";
      }

      return null;
    }

    if (
      draft.behaviorType === "drop_highest_n" ||
      draft.behaviorType === "drop_lowest_n"
    ) {
      const dropCount = Number(draft.dropCount);
      if (!Number.isFinite(dropCount) || dropCount <= 0) {
        return "Le nombre de dés à retirer doit être supérieur à 0.";
      }

      if (dropCount >= draft.die.qty) {
        return "Tu dois conserver au moins un dé après retrait.";
      }

      return null;
    }

    if (
      draft.behaviorType === "banded_sum" ||
      draft.behaviorType === "table_lookup"
    ) {
      const hasValidRange = draft.ranges.some(
        (row) =>
          Number.isFinite(Number(row.min)) &&
          Number.isFinite(Number(row.max)) &&
          row.label.trim().length > 0,
      );

      if (!hasValidRange) {
        return "Ajoute au moins une plage valide.";
      }

      return null;
    }

    if (draft.behaviorType === "sum_total") {
      return null;
    }
  }

  if (step === "rule_choice") {
    return null; // toujours valide
  }

  return null;
}

export function buildRulePayloadFromActionWizard(
  draft: ActionWizardDraft,
): BuiltActionRulePayload {
  if (!draft.behaviorType) {
    throw new Error("Type d’action manquant.");
  }

  if (!draft.name.trim()) {
    throw new Error("Le nom de l’action est obligatoire.");
  }

  if (!draft.dice || draft.dice.length === 0) {
    throw new Error("Au moins un dé est requis.");
  }

  const firstDie = draft.dice.find((die) => die.sides != null && die.sides > 0);

  if (!firstDie?.sides) {
    throw new Error("Au moins un dé valide est requis.");
  }

  if (draft.behaviorType === "custom_pipeline") {
    const pipelineParams = buildPipelineParamsFromDraft(draft);

    return {
      name: `${draft.name.trim()} — règle`,
      kind: "pipeline",
      behavior_key: "custom_pipeline",
      category: "group",
      params_json: JSON.stringify(pipelineParams),
      ui_schema_json: JSON.stringify({
        behavior_key: "custom_pipeline",
        category: "group",
        fields: [],
      }),
      supported_sides_json: JSON.stringify([firstDie.sides]),
      scope: "group",
      usage_kind: "generated",
    };
  }

  return buildRuleFromBehavior({
    actionName: draft.name,
    behaviorKey: draft.behaviorType,
    sides: firstDie.sides,
    compare: draft.compare,
    successThreshold: draft.successThreshold,
    critSuccessFaces: draft.critSuccessFaces,
    critFailureFaces: draft.critFailureFaces,
    targetValue: draft.targetValue,
    degreeStep: draft.degreeStep,
    critSuccessMin: draft.critSuccessMin,
    critSuccessMax: draft.critSuccessMax,
    critFailureMin: draft.critFailureMin,
    critFailureMax: draft.critFailureMax,
    successAtOrAbove: draft.successAtOrAbove,
    failFaces: draft.failFaces,
    glitchRule: draft.glitchRule,
    ranges: draft.ranges,
    keepCount: draft.keepCount,
    dropCount: draft.dropCount,
    resultMode: draft.resultMode,
  });
}

export function buildActionWizardSummary(draft: ActionWizardDraft): string {
  const dieLabel =
    draft.dice && draft.dice.length > 0
      ? draft.dice
          .map(
            (die) =>
              `${die.qty}d${die.sides}${
                die.modifier !== 0
                  ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}`
                  : ""
              }${die.sign === -1 ? " (-)" : ""}`,
          )
          .join(" + ")
      : "aucun dé";

  if (draft.behaviorType === "single_check") {
    return `${draft.name} • ${dieLabel} • test simple`;
  }

  if (draft.behaviorType === "threshold_degrees") {
    return `${draft.name} • ${dieLabel} • seuil ${draft.targetValue} avec degrés`;
  }

  if (draft.behaviorType === "success_pool") {
    return `${draft.name} • ${dieLabel} • pool de succès`;
  }

  if (draft.behaviorType === "sum_total") {
    return `${draft.name} • ${dieLabel} • somme totale`;
  }

  if (draft.behaviorType === "banded_sum") {
    return `${draft.name} • ${dieLabel} • somme par paliers`;
  }

  if (draft.behaviorType === "highest_of_pool") {
    return `${draft.name} • ${dieLabel} • meilleur dé`;
  }

  if (draft.behaviorType === "lowest_of_pool") {
    return `${draft.name} • ${dieLabel} • pire dé`;
  }

  if (draft.behaviorType === "keep_highest_n") {
    return `${draft.name} • ${dieLabel} • garder ${draft.keepCount} meilleurs`;
  }

  if (draft.behaviorType === "keep_lowest_n") {
    return `${draft.name} • ${dieLabel} • garder ${draft.keepCount} pires`;
  }

  if (draft.behaviorType === "drop_highest_n") {
    return `${draft.name} • ${dieLabel} • retirer ${draft.dropCount} meilleurs`;
  }

  if (draft.behaviorType === "drop_lowest_n") {
    return `${draft.name} • ${dieLabel} • retirer ${draft.dropCount} pires`;
  }

  if (draft.behaviorType === "table_lookup") {
    return `${draft.name} • ${dieLabel} • table d’intervalles`;
  }

  if (draft.behaviorType === "custom_pipeline") {
    return `${draft.name} • ${dieLabel} • pipeline personnalisé`;
  }

  return draft.name || "Nouvelle action";
}
