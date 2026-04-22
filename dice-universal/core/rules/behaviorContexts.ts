import type { RuleBehaviorKey } from "./behaviorCatalog";

export type BehaviorContextKey =
  | "quick_roll"
  | "action_wizard"
  | "rules_screen";

export type BehaviorContextConfig = {
  enabled: boolean;
  defaultValues?: Record<string, unknown>;
};

export type BehaviorContextDefinition = {
  behaviorKey: RuleBehaviorKey;
  contexts: Record<BehaviorContextKey, BehaviorContextConfig>;
};

export const BEHAVIOR_CONTEXTS: BehaviorContextDefinition[] = [
  {
    behaviorKey: "sum_total",
    contexts: {
      quick_roll: { enabled: true },
      action_wizard: { enabled: true },
      rules_screen: { enabled: true },
    },
  },

  {
    behaviorKey: "single_check",
    contexts: {
      quick_roll: {
        enabled: true,
        defaultValues: {
          compare: "gte",
          successThreshold: "",
          critSuccessFaces: "",
          critFailureFaces: "",
        },
      },
      action_wizard: { enabled: true },
      rules_screen: { enabled: true },
    },
  },

  {
    behaviorKey: "success_pool",
    contexts: {
      quick_roll: {
        enabled: true,
        defaultValues: {
          successAtOrAbove: "5",
          failFaces: "1",
          glitchRule: "ones_gt_successes",
        },
      },
      action_wizard: { enabled: true },
      rules_screen: { enabled: true },
    },
  },

  {
    behaviorKey: "banded_sum",
    contexts: {
      quick_roll: {
        enabled: true,
        defaultValues: {
          ranges: [
            { min: "1", max: "3", label: "Bas" },
            { min: "4", max: "6", label: "Moyen" },
            { min: "7", max: "10", label: "Haut" },
          ],
        },
      },
      action_wizard: { enabled: true },
      rules_screen: { enabled: true },
    },
  },

  {
    behaviorKey: "highest_of_pool",
    contexts: {
      quick_roll: {
        enabled: true,
        defaultValues: {
          compare: "gte",
          successThreshold: "",
        },
      },
      action_wizard: { enabled: true },
      rules_screen: { enabled: true },
    },
  },

  {
    behaviorKey: "lowest_of_pool",
    contexts: {
      quick_roll: {
        enabled: true,
        defaultValues: {
          compare: "lte",
          successThreshold: "",
        },
      },
      action_wizard: { enabled: true },
      rules_screen: { enabled: true },
    },
  },

  {
    behaviorKey: "keep_highest_n",
    contexts: {
      quick_roll: {
        enabled: true,
        defaultValues: {
          keepCount: "2",
          resultMode: "sum",
        },
      },
      action_wizard: { enabled: true },
      rules_screen: { enabled: true },
    },
  },

  {
    behaviorKey: "keep_lowest_n",
    contexts: {
      quick_roll: {
        enabled: true,
        defaultValues: {
          keepCount: "2",
          resultMode: "sum",
        },
      },
      action_wizard: { enabled: true },
      rules_screen: { enabled: true },
    },
  },

  {
    behaviorKey: "drop_highest_n",
    contexts: {
      quick_roll: {
        enabled: true,
        defaultValues: {
          dropCount: "1",
          resultMode: "sum",
        },
      },
      action_wizard: { enabled: true },
      rules_screen: { enabled: true },
    },
  },

  {
    behaviorKey: "drop_lowest_n",
    contexts: {
      quick_roll: {
        enabled: true,
        defaultValues: {
          dropCount: "1",
          resultMode: "sum",
        },
      },
      action_wizard: { enabled: true },
      rules_screen: { enabled: true },
    },
  },

  {
    behaviorKey: "table_lookup",
    contexts: {
      quick_roll: {
        enabled: true,
        defaultValues: {
          ranges: [
            { min: "1", max: "3", label: "Bas" },
            { min: "4", max: "6", label: "Moyen" },
            { min: "7", max: "10", label: "Haut" },
          ],
        },
      },
      action_wizard: { enabled: true },
      rules_screen: { enabled: true },
    },
  },
];
