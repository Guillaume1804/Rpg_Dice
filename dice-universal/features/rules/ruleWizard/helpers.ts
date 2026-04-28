import type { RuleWizardDraft, RuleWizardStep } from "./types";
import { RULE_BEHAVIORS } from "../../../core/rules/behaviorRegistry";

function parseNumberList(value: string): number[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);
}

function parseSupportedSides(value: string): number[] {
  if (value.trim().toLowerCase() === "all") return [];
  return parseNumberList(value).filter((side) => side > 0);
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
  return (
    RULE_BEHAVIORS.find((behavior) => behavior.key === behaviorKey) ?? null
  );
}

function getDraftValue(draft: RuleWizardDraft, key: string): unknown {
  return draft[key as keyof RuleWizardDraft];
}

export function validateRuleWizardStep(
  step: RuleWizardStep,
  draft: RuleWizardDraft,
): string | null {
  const behavior = getBehaviorDefinition(draft.behaviorKey);

  if (step === "name" && !draft.name.trim()) {
    return "Le nom de la règle est obligatoire.";
  }

  if (step === "behavior" && !behavior) {
    return "Choisis un comportement de règle.";
  }

  if (step === "dice") {
    const sides = parseSupportedSides(draft.supportedSidesText);
    const isAll = draft.supportedSidesText.trim().toLowerCase() === "all";

    if (!isAll && sides.length === 0) {
      return "Indique au moins un type de dé, par exemple 20 ou 6,10,100.";
    }

    if (behavior?.supportedSides && !isAll) {
      const invalidSide = sides.find(
        (side) => !behavior.supportedSides?.includes(side),
      );

      if (invalidSide) {
        return `Le d${invalidSide} n’est pas compatible avec ce comportement.`;
      }
    }
  }

  if (step === "scope" && behavior) {
    if (!behavior.allowedScopes.includes(draft.scope)) {
      return "Cette portée n’est pas compatible avec ce comportement.";
    }
  }

  if (step === "behavior" && behavior) {
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
          (field.key === "keepCount" || field.key === "dropCount") &&
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

  const supportedSides = parseSupportedSides(draft.supportedSidesText);
  const supported_sides_json =
    draft.supportedSidesText.trim().toLowerCase() === "all"
      ? null
      : JSON.stringify(supportedSides);

  const params: Record<string, unknown> = {};

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
