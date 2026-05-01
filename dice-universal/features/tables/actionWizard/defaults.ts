// dice-universal\features\tables\actionWizard\defaults.ts

import type { RuleBehaviorKey as ActionBehaviorType } from "../../../core/rules/behaviorRegistry";
import type { ActionDieDraft, ActionWizardDraft } from "./types";

function defaultRanges() {
  return [
    { min: "1", max: "3", label: "Bas" },
    { min: "4", max: "6", label: "Moyen" },
    { min: "7", max: "10", label: "Haut" },
  ];
}

export function createDieDraft(
  partial?: Partial<ActionDieDraft>,
): ActionDieDraft {
  return {
    sides: partial?.sides ?? null,
    qty: partial?.qty ?? 1,
    modifier: partial?.modifier ?? 0,
    sign: partial?.sign ?? 1,
  };
}

export function getDefaultDiceForBehavior(
  behaviorType: ActionBehaviorType | null,
): ActionDieDraft[] {
  switch (behaviorType) {
    case "single_check":
      return [createDieDraft({ sides: 20, qty: 1 })];

    case "threshold_degrees":
      return [createDieDraft({ sides: 100, qty: 1 })];

    case "table_lookup":
      return [createDieDraft({ sides: 100, qty: 1 })];

    case "success_pool":
      return [createDieDraft({ sides: 6, qty: 5 })];

    case "sum_total":
      return [createDieDraft({ sides: 6, qty: 2 })];

    case "banded_sum":
      return [createDieDraft({ sides: 6, qty: 2 })];

    case "highest_of_pool":
    case "lowest_of_pool":
    case "keep_highest_n":
    case "keep_lowest_n":
    case "drop_highest_n":
    case "drop_lowest_n":
      return [createDieDraft({ sides: 6, qty: 5 })];
    case "custom_pipeline":
      return [createDieDraft({ sides: 6, qty: 3 })];
    default:
      return [createDieDraft()];
  }
}

export function getDefaultDieForBehavior(
  behaviorType: ActionBehaviorType | null,
): ActionDieDraft {
  return getDefaultDiceForBehavior(behaviorType)[0] ?? createDieDraft();
}

export function createDefaultActionWizardDraft(): ActionWizardDraft {
  const dice = getDefaultDiceForBehavior(null);

  return {
    name: "",
    behaviorType: null,

    die: dice[0],
    dice,

    compare: "gte",
    successThreshold: "",
    critSuccessFaces: "",
    critFailureFaces: "",

    targetValue: "65",
    degreeStep: "10",
    critSuccessMin: "1",
    critSuccessMax: "5",
    critFailureMin: "95",
    critFailureMax: "100",

    successAtOrAbove: "5",
    failFaces: "1",
    glitchRule: "ones_gt_successes",

    selectedRuleId: null,
    creationMode: "auto",

    ranges: defaultRanges(),

    keepCount: "3",
    dropCount: "1",
    resultMode: "sum",

    pipelineRerollFaces: "",
    pipelineRerollOnce: true,
    pipelineExplodeFaces: "",
    pipelineKeepHighest: "",
    pipelineKeepLowest: "",
    pipelineDropHighest: "",
    pipelineDropLowest: "",
    pipelineCountSuccessAtOrAbove: "",
    pipelineCountEqualFaces: "",
    pipelineCountRangeMin: "",
    pipelineCountRangeMax: "",
    pipelineOutput: "sum",
    pipelineSuccessThreshold: "",
    pipelineCompare: "gte",
    pipelineCritSuccessFaces: "",
    pipelineCritFailureFaces: "",
  };
}
