// dice-universal\features\rules\guidedBehavior\types.ts

import type { RuleScope } from "../../../data/repositories/rulesRepo";

export type GuidedBehaviorIntent =
  | "sum"
  | "check"
  | "degrees"
  | "success_pool"
  | "keep_drop"
  | "table"
  | "advanced";

export type GuidedBehaviorApplicationMode =
  | "auto"
  | "single_entry"
  | "whole_roll";

export type GuidedBehaviorDiceCompatibility =
  | "all"
  | {
    sides: number[];
  };

export type GuidedBehaviorCompareMode = "gte" | "lte";

export type GuidedBehaviorResultMode = "sum" | "values";

export type GuidedBehaviorReadingMode =
  | "sum"
  | "single_check"
  | "threshold_degrees"
  | "success_pool"
  | "table_lookup";

export type GuidedBehaviorKeepDropMode =
  | "none"
  | "keep_highest"
  | "keep_lowest"
  | "drop_highest"
  | "drop_lowest";

export type GuidedBehaviorComplicationRule =
  | "none"
  | "any_special_failure"
  | "special_failures_gt_successes"
  | "special_failures_gte_successes"
  | "special_failures_gt_half_dice"
  | "special_failures_gte_half_dice";

export type GuidedBehaviorCriticalFailureRule =
  | "none"
  | "zero_successes"
  | "all_special_failures"
  | "special_failures_gt_successes"
  | "special_failures_gte_successes"
  | "complication_and_zero_successes"
  | "complication_and_failure";

export type GuidedBehaviorCriticalSuccessRule =
  | "none"
  | "successes_gte_threshold"
  | "all_dice_successes"
  | "all_dice_max_faces"
  | "any_max_face"
  | "any_critical_face"
  | "explosion_chain_critical";

export type GuidedBehaviorPrimaryOutput =
  | "total"
  | "outcome"
  | "successes"
  | "degrees"
  | "table_label"
  | "kept_values"
  | "pipeline_final";

export type GuidedBehaviorDraft = {
  name: string;
  description: string;

  /**
   * Intention utilisateur principale.
   * Sert à guider le parcours et les valeurs par défaut.
   */
  intent: GuidedBehaviorIntent;

  /**
   * Compatibilité de dés côté utilisateur.
   * "all" = tous les dés.
   */
  diceCompatibility: GuidedBehaviorDiceCompatibility;

  /**
   * Choix UX utilisateur.
   * On évite d’exposer directement "entry/group/both" au départ.
   */
  applicationMode: GuidedBehaviorApplicationMode;

  /**
   * Scope technique calculé ou confirmé.
   */
  resolvedScope: RuleScope;

  transforms: {
    reroll: {
      enabled: boolean;
      faces: string;
      once: boolean;
      maxRerollsPerDie: string;
    };

    explode: {
      enabled: boolean;
      faces: string;
      maxExplosionsPerDie: string;
    };

    keepDrop: {
      mode: GuidedBehaviorKeepDropMode;
      count: string;
      resultMode: GuidedBehaviorResultMode;
    };
  };

  reading: {
    mode: GuidedBehaviorReadingMode;

    compare: GuidedBehaviorCompareMode;
    successThreshold: string;

    targetValue: string;
    degreeStep: string;

    successAtOrAbove: string;
    failFaces: string;

    tableRanges: {
      min: string;
      max: string;
      label: string;
    }[];
  };

  events: {
    criticalSuccess: {
      enabled: boolean;
      rule: GuidedBehaviorCriticalSuccessRule;
      threshold: string;
      faces: string;
      min: string;
      max: string;
    };

    criticalFailure: {
      enabled: boolean;
      rule: GuidedBehaviorCriticalFailureRule;
      faces: string;
      min: string;
      max: string;
    };

    complication: {
      enabled: boolean;
      faces: string;
      rule: GuidedBehaviorComplicationRule;
    };
  };

  output: {
    primary: GuidedBehaviorPrimaryOutput;
  };
};

export const DEFAULT_GUIDED_BEHAVIOR_DRAFT: GuidedBehaviorDraft = {
  name: "",
  description: "",

  intent: "sum",

  diceCompatibility: "all",

  applicationMode: "auto",
  resolvedScope: "entry",

  transforms: {
    reroll: {
      enabled: false,
      faces: "1",
      once: true,
      maxRerollsPerDie: "",
    },

    explode: {
      enabled: false,
      faces: "",
      maxExplosionsPerDie: "",
    },

    keepDrop: {
      mode: "none",
      count: "1",
      resultMode: "sum",
    },
  },

  reading: {
    mode: "sum",

    compare: "gte",
    successThreshold: "",

    targetValue: "50",
    degreeStep: "10",

    successAtOrAbove: "5",
    failFaces: "1",

    tableRanges: [
      { min: "1", max: "3", label: "Bas" },
      { min: "4", max: "6", label: "Moyen" },
      { min: "7", max: "10", label: "Haut" },
    ],
  },

  events: {
    criticalSuccess: {
      enabled: false,
      rule: "none",
      threshold: "",
      faces: "",
      min: "",
      max: "",
    },

    criticalFailure: {
      enabled: false,
      rule: "none",
      faces: "",
      min: "",
      max: "",
    },

    complication: {
      enabled: false,
      faces: "1",
      rule: "none",
    },
  },

  output: {
    primary: "total",
  },
};
