import type { RuleScope } from "../../../data/repositories/rulesRepo";
import type {
  ActionBehaviorType,
  ActionWizardDraft,
  ActionWizardStep,
} from "./types";

export type BuiltActionRulePayload = {
  name: string;
  kind: string;
  params_json: string;
  supported_sides_json: string;
  scope: RuleScope;
};

function parseNumberList(value: string): number[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((n) => Number.isFinite(n));
}

export function validateActionWizardStep(
  step: ActionWizardStep,
  draft: ActionWizardDraft,
): string | null {
  if (step === "name") {
    if (!draft.name.trim()) return "Le nom de l’action est obligatoire.";
    return null;
  }

  if (step === "type") {
    if (!draft.behaviorType) return "Choisis un type d’action.";
    return null;
  }

  if (step === "dice") {
    if (!draft.die.sides || draft.die.sides <= 0) {
      return "Le type de dé est obligatoire.";
    }
    if (!Number.isFinite(draft.die.qty) || draft.die.qty <= 0) {
      return "La quantité doit être supérieure à 0.";
    }
    if (!Number.isFinite(draft.die.modifier)) {
      return "Le modificateur est invalide.";
    }
    return null;
  }

  if (step === "behavior") {
    if (!draft.behaviorType) return "Choisis un type d’action.";

    if (
      draft.behaviorType === "single_check" ||
      draft.behaviorType === "highest_of_pool"
    ) {
      if (
        draft.successThreshold.trim() !== "" &&
        !Number.isFinite(Number(draft.successThreshold))
      ) {
        return "Le seuil doit être un nombre valide.";
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
    }

    return null;
  }

  return null;
}

export function buildRulePayloadFromActionWizard(
  draft: ActionWizardDraft,
): BuiltActionRulePayload {
  if (!draft.behaviorType) {
    throw new Error("Type d’action manquant.");
  }

  const sides =
    draft.die.sides && Number.isFinite(draft.die.sides)
      ? [draft.die.sides]
      : [];

  const supported_sides_json = JSON.stringify(sides);

  if (draft.behaviorType === "single_check") {
    const threshold =
      draft.successThreshold.trim() === ""
        ? null
        : Number(draft.successThreshold);

    return {
      name: `${draft.name.trim()} — règle`,
      kind: "single_check",
      params_json: JSON.stringify({
        compare: draft.compare,
        success_threshold: threshold,
        crit_success_faces: parseNumberList(draft.critSuccessFaces),
        crit_failure_faces: parseNumberList(draft.critFailureFaces),
      }),
      supported_sides_json,
      scope: "entry",
    };
  }

  if (draft.behaviorType === "success_pool") {
    return {
      name: `${draft.name.trim()} — règle`,
      kind: "success_pool",
      params_json: JSON.stringify({
        success_at_or_above: Number(draft.successAtOrAbove),
        fail_faces: parseNumberList(draft.failFaces),
        glitch_rule: draft.glitchRule,
      }),
      supported_sides_json,
      scope: "group",
    };
  }

  if (draft.behaviorType === "banded_sum") {
    return {
      name: `${draft.name.trim()} — règle`,
      kind: "banded_sum",
      params_json: JSON.stringify({
        bands: draft.ranges
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
          ),
        defaultLabel: "—",
      }),
      supported_sides_json,
      scope: "entry",
    };
  }

  if (draft.behaviorType === "highest_of_pool") {
    const threshold =
      draft.successThreshold.trim() === ""
        ? null
        : Number(draft.successThreshold);

    return {
      name: `${draft.name.trim()} — règle`,
      kind: "highest_of_pool",
      params_json: JSON.stringify({
        compare: draft.compare,
        success_threshold: threshold,
        crit_success_faces: parseNumberList(draft.critSuccessFaces),
        crit_failure_faces: parseNumberList(draft.critFailureFaces),
      }),
      supported_sides_json,
      scope: "entry",
    };
  }

  return {
    name: `${draft.name.trim()} — règle`,
    kind: "table_lookup",
    params_json: JSON.stringify({
      ranges: draft.ranges
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
        ),
      defaultLabel: "—",
    }),
    supported_sides_json,
    scope: "entry",
  };
}

export function buildActionWizardSummary(draft: ActionWizardDraft): string {
  const dieLabel = draft.die.sides
    ? `${draft.die.qty}d${draft.die.sides}`
    : "dé non défini";

  if (draft.behaviorType === "single_check") {
    return `${draft.name} • ${dieLabel} • test ${
      draft.compare === "gte" ? "à seuil haut" : "à seuil bas"
    }`;
  }

  if (draft.behaviorType === "success_pool") {
    return `${draft.name} • ${dieLabel} • pool de succès`;
  }

  if (draft.behaviorType === "banded_sum") {
    return `${draft.name} • ${dieLabel} • somme par paliers`;
  }

  if (draft.behaviorType === "highest_of_pool") {
    return `${draft.name} • ${dieLabel} • meilleur dé`;
  }

  if (draft.behaviorType === "table_lookup") {
    return `${draft.name} • ${dieLabel} • table d’intervalles`;
  }

  return draft.name || "Nouvelle action";
}