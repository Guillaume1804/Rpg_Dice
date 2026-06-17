// dice-universal\features\rules\ruleWizard\helpers.ts

import type { RuleWizardDraft, RuleWizardStep } from "./types";
import { getRuleBehaviorDefinition } from "../../../core/rules/behaviorRegistry";

import type { PipelineParams, PipelineStep } from "../../../core/rules/types";

function parseNumberList(value: string): number[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);
}

function isValidNumberList(value: string): boolean {
  const text = value.trim();
  if (!text) return true;

  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .every((item) => Number.isFinite(Number(item)));
}

function parseSupportedSides(value: string): number[] {
  if (value.trim().toLowerCase() === "all") return [];
  return parseNumberList(value).filter((side) => side > 0);
}

function formatSupportedSides(sides: number[]) {
  return sides.map((side) => `d${side}`).join(", ");
}

function getEffectiveSupportedSides(
  draft: RuleWizardDraft,
  behavior: NonNullable<ReturnType<typeof getBehaviorDefinition>>,
) {
  const text = draft.supportedSidesText.trim().toLowerCase();

  if (behavior.supportedSides && behavior.supportedSides.length > 0) {
    return behavior.supportedSides;
  }

  if (text === "all") {
    return [];
  }

  return parseSupportedSides(draft.supportedSidesText);
}

function parseRanges(draft: RuleWizardDraft) {
  return draft.ranges
    .map((row) => ({
      min: Number(row.min),
      max: Number(row.max),
      label: row.label.trim(),
    }))
    .filter(
      (row) =>
        Number.isFinite(row.min) &&
        Number.isFinite(row.max) &&
        row.label.length > 0,
    );
}

function getBehaviorDefinition(behaviorKey: RuleWizardDraft["behaviorKey"]) {
  if (!behaviorKey) return null;
  return getRuleBehaviorDefinition(behaviorKey) ?? null;
}

function getDraftValue(draft: RuleWizardDraft, key: string): unknown {
  return draft[key as keyof RuleWizardDraft];
}

function parseOptionalPositiveInt(value: string): number | null {
  const text = value.trim();
  if (!text) return null;

  const n = Number(text);
  if (!Number.isFinite(n) || n <= 0) return null;

  return Math.floor(n);
}

function buildPipelineParamsFromDraft(draft: RuleWizardDraft): PipelineParams {
  const steps: PipelineStep[] = [];

  const rerollFaces = parseNumberList(draft.pipelineRerollFaces);
  if (rerollFaces.length > 0) {
    const maxRerollsPerDie = parseOptionalPositiveInt(
      draft.pipelineMaxRerollsPerDie,
    );

    steps.push({
      op: "reroll",
      faces: rerollFaces,
      once: draft.pipelineRerollOnce,
      ...(maxRerollsPerDie != null ? { max_rerolls: maxRerollsPerDie } : {}),
    });
  }

  const explodeFaces = parseNumberList(draft.pipelineExplodeFaces);
  if (explodeFaces.length > 0) {
    const maxExplosionsPerDie = parseOptionalPositiveInt(
      draft.pipelineMaxExplosionsPerDie,
    );

    steps.push({
      op: "explode",
      faces: explodeFaces,
      ...(maxExplosionsPerDie != null
        ? { max_explosions: maxExplosionsPerDie }
        : {}),
    });
  }

  const keepHighest = parseOptionalPositiveInt(draft.pipelineKeepHighest);
  if (keepHighest != null) {
    steps.push({ op: "keep_highest", n: keepHighest });
  }

  const keepLowest = parseOptionalPositiveInt(draft.pipelineKeepLowest);
  if (keepLowest != null) {
    steps.push({ op: "keep_lowest", n: keepLowest });
  }

  const dropHighest = parseOptionalPositiveInt(draft.pipelineDropHighest);
  if (dropHighest != null) {
    steps.push({ op: "drop_highest", n: dropHighest });
  }

  const dropLowest = parseOptionalPositiveInt(draft.pipelineDropLowest);
  if (dropLowest != null) {
    steps.push({ op: "drop_lowest", n: dropLowest });
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
    complication_faces: parseNumberList(draft.pipelineComplicationFaces),
    complication_rule: draft.pipelineComplicationRule,
  };
}

export function validateRuleWizardStep(
  step: RuleWizardStep,
  draft: RuleWizardDraft,
): string | null {
  const behavior = getBehaviorDefinition(draft.behaviorKey);

  if (step === "name" && !draft.name.trim()) {
    return "Le nom du comportement est obligatoire.";
  }

  if (step === "behavior" && !behavior) {
    return "Choisis un type de comportement.";
  }

  if (step === "dice") {
    if (!behavior) {
      return "Choisis d’abord un type de comportement.";
    }

    const text = draft.supportedSidesText.trim().toLowerCase();
    const isAll = text === "all";
    const sides = parseSupportedSides(draft.supportedSidesText);

    if (behavior.supportedSides && behavior.supportedSides.length > 0) {
      if (isAll) {
        return `${behavior.label} est limité à ${formatSupportedSides(
          behavior.supportedSides,
        )}. Remplace “all” par ${behavior.supportedSides.join(", ")}.`;
      }

      const invalidSide = sides.find(
        (side) => !behavior.supportedSides?.includes(side),
      );

      if (invalidSide) {
        return `Le d${invalidSide} n’est pas compatible avec ${behavior.label}. Dés autorisés : ${formatSupportedSides(
          behavior.supportedSides,
        )}.`;
      }

      if (sides.length === 0) {
        return `Indique au moins un dé compatible : ${formatSupportedSides(
          behavior.supportedSides,
        )}.`;
      }

      return null;
    }

    if (!isAll && sides.length === 0) {
      return "Indique au moins un type de dé, par exemple 20 ou 6,10,100, ou laisse “all” pour tous les dés.";
    }
  }

  if (step === "scope" && behavior) {
    if (!behavior.allowedScopes.includes(draft.scope)) {
      return "Cette portée n’est pas compatible avec ce comportement.";
    }
  }

  if (step === "behavior" && behavior) {
    if (draft.behaviorKey === "custom_pipeline") {
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

      if (
        draft.pipelineMaxRerollsPerDie.trim() !== "" &&
        !Number.isFinite(Number(draft.pipelineMaxRerollsPerDie))
      ) {
        return "Le nombre maximum de relances par dé doit être un nombre valide.";
      }

      if (
        draft.pipelineMaxRerollsPerDie.trim() !== "" &&
        Number(draft.pipelineMaxRerollsPerDie) <= 0
      ) {
        return "Le nombre maximum de relances par dé doit être supérieur à 0.";
      }

      if (
        draft.pipelineMaxExplosionsPerDie.trim() !== "" &&
        !Number.isFinite(Number(draft.pipelineMaxExplosionsPerDie))
      ) {
        return "Le nombre maximum d’explosions par dé doit être un nombre valide.";
      }

      if (
        draft.pipelineMaxExplosionsPerDie.trim() !== "" &&
        Number(draft.pipelineMaxExplosionsPerDie) <= 0
      ) {
        return "Le nombre maximum d’explosions par dé doit être supérieur à 0.";
      }

      if (
        draft.pipelineComplicationRule !== "none" &&
        draft.pipelineComplicationRule !== "any" &&
        draft.pipelineComplicationRule !== "gte_successes" &&
        draft.pipelineComplicationRule !== "gt_successes" &&
        draft.pipelineComplicationRule !== "zero_successes"
      ) {
        return "La règle de complication du pipeline est invalide.";
      }

      if (!isValidNumberList(draft.pipelineRerollFaces)) {
        return "Les faces à relancer doivent être une liste de nombres valide.";
      }

      if (!isValidNumberList(draft.pipelineExplodeFaces)) {
        return "Les faces d’explosion doivent être une liste de nombres valide.";
      }

      if (!isValidNumberList(draft.pipelineCountEqualFaces)) {
        return "Les faces exactes à compter doivent être une liste de nombres valide.";
      }

      if (!isValidNumberList(draft.pipelineCritSuccessFaces)) {
        return "Les faces de réussite critique doivent être une liste de nombres valide.";
      }

      if (!isValidNumberList(draft.pipelineCritFailureFaces)) {
        return "Les faces d’échec critique doivent être une liste de nombres valide.";
      }

      if (!isValidNumberList(draft.pipelineComplicationFaces)) {
        return "Les faces de complication doivent être une liste de nombres valide.";
      }

      return null;
    }
    for (const field of behavior.fields) {
      if (field.type === "ranges") {
        if (parseRanges(draft).length === 0) {
          return "Ajoute au moins une plage valide.";
        }

        continue;
      }

      const rawValue = getDraftValue(draft, field.key);
      const textValue = String(rawValue ?? "").trim();

      if (field.type === "number") {
        if (textValue === "") {
          if (field.defaultValue.trim() === "") continue;
          return `${field.label} doit être renseigné.`;
        }

        if (!Number.isFinite(Number(textValue))) {
          return `${field.label} doit être un nombre valide.`;
        }

        if (
          (field.key === "keepCount" ||
            field.key === "dropCount" ||
            field.key === "degreeStep") &&
          Number(textValue) <= 0
        ) {
          return `${field.label} doit être supérieur à 0.`;
        }
      }
    }
  }

  return null;
}

export function buildRulePayloadFromRuleWizard(draft: RuleWizardDraft) {
  const behavior = getBehaviorDefinition(draft.behaviorKey);

  if (!draft.behaviorKey || !behavior) {
    throw new Error("Comportement manquant.");
  }

  const supportedSides = getEffectiveSupportedSides(draft, behavior);
  const supported_sides_json =
    supportedSides.length === 0 ? null : JSON.stringify(supportedSides);

  const params: Record<string, unknown> = {};

  if (draft.behaviorKey === "custom_pipeline") {
    return {
      name: draft.name.trim(),
      kind: "pipeline",
      scope: draft.scope,
      supported_sides_json,
      params_json: JSON.stringify(buildPipelineParamsFromDraft(draft)),
    };
  }

  for (const field of behavior.fields) {
    const paramsKey = field.paramsKey ?? field.key;

    if (field.type === "ranges") {
      params[paramsKey] = parseRanges(draft);
      continue;
    }

    const rawValue = getDraftValue(draft, field.key);

    if (field.type === "number") {
      const textValue = String(rawValue ?? "").trim();
      params[paramsKey] = textValue === "" ? null : Number(textValue);
      continue;
    }

    if (
      field.key === "critSuccessFaces" ||
      field.key === "critFailureFaces" ||
      field.key === "failFaces"
    ) {
      params[paramsKey] = parseNumberList(String(rawValue ?? ""));
      continue;
    }

    params[paramsKey] = rawValue;
  }

  if (draft.behaviorKey === "table_lookup") {
    params.defaultLabel = "Normal";
  }

  if (draft.behaviorKey === "banded_sum") {
    params.defaultLabel = "—";
  }

  return {
    name: draft.name.trim(),
    kind: behavior.kind,
    scope: draft.scope,
    supported_sides_json,
    params_json: JSON.stringify(params),
  };
}
