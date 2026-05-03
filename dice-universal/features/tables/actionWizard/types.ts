// dice-universal\features\tables\actionWizard\types.ts

import type { RuleBehaviorKey as ActionBehaviorType } from "../../../core/rules/behaviorRegistry";

export type ActionResultMode = "sum" | "values";

export type PipelineOutputMode =
  | "sum"
  | "values"
  | "successes"
  | "count_equal"
  | "count_range"
  | "first_value";

export type ActionDieDraft = {
  sides: number | null;
  qty: number;
  modifier: number;
  sign: 1 | -1;
};

export type ActionRangeDraft = {
  min: string;
  max: string;
  label: string;
};

export type ActionWizardDraft = {
  name: string;
  behaviorType: ActionBehaviorType | null;

  /**
   * Compat temporaire avec l'ancien wizard.
   * On garde `die` pour éviter de casser tous les composants d’un coup.
   * La vraie source pour les actions composées devient `dice`.
   */
  die: ActionDieDraft;
  dice: ActionDieDraft[];

  compare: "gte" | "lte";
  successThreshold: string;
  critSuccessFaces: string;
  critFailureFaces: string;

  targetValue: string;
  degreeStep: string;
  critSuccessMin: string;
  critSuccessMax: string;
  critFailureMin: string;
  critFailureMax: string;

  successAtOrAbove: string;
  failFaces: string;
  glitchRule: "ones_gt_successes" | "ones_gte_successes" | "none";

  selectedRuleId: string | null;

  ranges: ActionRangeDraft[];

  keepCount: string;
  dropCount: string;
  resultMode: ActionResultMode;

  pipelineRerollFaces: string;
  pipelineRerollOnce: boolean;
  pipelineMaxRerollsPerDie: string;

  pipelineExplodeFaces: string;
  pipelineMaxExplosionsPerDie: string;

  pipelineKeepHighest: string;
  pipelineKeepLowest: string;
  pipelineDropHighest: string;
  pipelineDropLowest: string;

  pipelineCountSuccessAtOrAbove: string;
  pipelineCountEqualFaces: string;
  pipelineCountRangeMin: string;
  pipelineCountRangeMax: string;

  pipelineOutput: PipelineOutputMode;
  pipelineSuccessThreshold: string;
  pipelineCompare: "gte" | "lte";
  pipelineCritSuccessFaces: string;
  pipelineCritFailureFaces: string;

  pipelineComplicationFaces: string;
  pipelineComplicationRule:
    | "none"
    | "any"
    | "gt_successes"
    | "gte_successes"
    | "zero_successes";

  creationMode: "auto" | "advanced";
};

export type ActionWizardStep =
  | "name"
  | "type"
  | "dice"
  | "rule_choice"
  | "behavior"
  | "summary";
