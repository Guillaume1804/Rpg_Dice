// dice-universal/features/rules/ruleWizard/types.ts

import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";

export type RuleWizardStep = "name" | "scope" | "dice" | "behavior" | "summary";

export type RuleWizardScope = "entry" | "group" | "both";

export type PipelineOutputMode =
  | "sum"
  | "values"
  | "successes"
  | "count_equal"
  | "count_range"
  | "first_value";

export type RuleWizardDraft = {
  name: string;
  scope: RuleWizardScope;
  behaviorKey: RuleBehaviorKey | null;
  supportedSidesText: string;

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
  glitchRule: string;

  keepCount: string;
  dropCount: string;
  resultMode: string;

  pipelineRerollFaces: string;
  pipelineRerollOnce: boolean;
  pipelineExplodeFaces: string;
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

  ranges: { min: string; max: string; label: string }[];
};
