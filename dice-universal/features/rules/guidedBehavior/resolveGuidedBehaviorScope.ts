import type { RuleScope } from "../../../data/repositories/rulesRepo";
import type {
  GuidedBehaviorApplicationMode,
  GuidedBehaviorDraft,
} from "./types";

function scopeFromApplicationMode(
  applicationMode: GuidedBehaviorApplicationMode,
): RuleScope | null {
  switch (applicationMode) {
    case "single_entry":
      return "entry";
    case "whole_roll":
      return "group";
    case "auto":
    default:
      return null;
  }
}

export function resolveGuidedBehaviorScope(
  draft: GuidedBehaviorDraft,
): RuleScope {
  const explicitScope = scopeFromApplicationMode(draft.applicationMode);

  if (explicitScope) {
    return explicitScope;
  }

  if (draft.intent === "success_pool") {
    return "group";
  }

  if (draft.reading.mode === "success_pool") {
    return "group";
  }

  if (
    draft.reading.mode === "table_lookup" &&
    draft.output.primary === "table_label"
  ) {
    return "group";
  }

  if (draft.transforms.keepDrop.mode !== "none") {
    return "entry";
  }

  if (draft.transforms.reroll.enabled || draft.transforms.explode.enabled) {
    return "entry";
  }

  return "entry";
}

export function getGuidedBehaviorApplicationLabel(
  applicationMode: GuidedBehaviorApplicationMode,
) {
  switch (applicationMode) {
    case "single_entry":
      return "Une ligne de dés";
    case "whole_roll":
      return "Tout le jet";
    case "auto":
    default:
      return "Automatique";
  }
}

export function getRuleScopeUserLabel(scope: RuleScope) {
  if (scope === "entry") return "Une ligne de dés";
  if (scope === "group") return "Tout le jet";
  return "Entrée ou groupe";
}
