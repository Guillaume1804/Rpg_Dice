import type { ActionBehaviorType } from "./behaviorCatalog";

export type ActionResultMode = "sum" | "values";

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

  die: ActionDieDraft;

  compare: "gte" | "lte";
  successThreshold: string;
  critSuccessFaces: string;
  critFailureFaces: string;

  successAtOrAbove: string;
  failFaces: string;
  glitchRule: "ones_gt_successes" | "ones_gte_successes" | "none";

  selectedRuleId: string | null;

  ranges: ActionRangeDraft[];

  keepCount: string;
  dropCount: string;
  resultMode: ActionResultMode;
};

export type ActionWizardStep =
  | "name"
  | "type"
  | "dice"
  | "rule_choice"
  | "behavior"
  | "summary";
