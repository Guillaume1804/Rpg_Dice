// dice-universal\features\tables\actionWizard\types.ts

import type { RuleBehaviorKey as ActionBehaviorType } from "../../../core/rules/behaviorRegistry";

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

  successAtOrAbove: string;
  failFaces: string;
  glitchRule: "ones_gt_successes" | "ones_gte_successes" | "none";

  selectedRuleId: string | null;

  ranges: ActionRangeDraft[];

  keepCount: string;
  dropCount: string;
  resultMode: ActionResultMode;

  creationMode: "auto" | "advanced";
};

export type ActionWizardStep =
  | "name"
  | "type"
  | "dice"
  | "rule_choice"
  | "behavior"
  | "summary";
