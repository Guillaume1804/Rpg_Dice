import type { ActionBehaviorType } from "./behaviorCatalog";
import type { ActionWizardDraft } from "./types";

function defaultRanges() {
  return [
    { min: "1", max: "3", label: "Bas" },
    { min: "4", max: "6", label: "Moyen" },
    { min: "7", max: "10", label: "Haut" },
  ];
}

export function getDefaultDieForBehavior(
  behaviorType: ActionBehaviorType | null,
) {
  switch (behaviorType) {
    case "single_check":
      return { sides: 20, qty: 1, modifier: 0, sign: 1 as const };

    case "table_lookup":
      return { sides: 100, qty: 1, modifier: 0, sign: 1 as const };

    case "success_pool":
      return { sides: 6, qty: 5, modifier: 0, sign: 1 as const };

    case "sum_total":
      return { sides: 6, qty: 2, modifier: 0, sign: 1 as const };

    case "banded_sum":
      return { sides: 6, qty: 2, modifier: 0, sign: 1 as const };

    case "highest_of_pool":
      return { sides: 6, qty: 4, modifier: 0, sign: 1 as const };

    case "lowest_of_pool":
      return { sides: 6, qty: 4, modifier: 0, sign: 1 as const };

    case "keep_highest_n":
      return { sides: 6, qty: 5, modifier: 0, sign: 1 as const };

    case "keep_lowest_n":
      return { sides: 6, qty: 5, modifier: 0, sign: 1 as const };

    case "drop_highest_n":
      return { sides: 6, qty: 5, modifier: 0, sign: 1 as const };

    case "drop_lowest_n":
      return { sides: 6, qty: 5, modifier: 0, sign: 1 as const };

    default:
      return { sides: null, qty: 1, modifier: 0, sign: 1 as const };
  }
}

export function createDefaultActionWizardDraft(): ActionWizardDraft {
  return {
    name: "",
    behaviorType: null,

    die: {
      sides: null,
      qty: 1,
      modifier: 0,
      sign: 1,
    },

    compare: "gte",
    successThreshold: "",
    critSuccessFaces: "",
    critFailureFaces: "",

    successAtOrAbove: "5",
    failFaces: "1",
    glitchRule: "ones_gt_successes",

    selectedRuleId: null,
    creationMode: "auto",

    ranges: defaultRanges(),

    keepCount: "3",
    dropCount: "1",
    resultMode: "sum",

  };
}
