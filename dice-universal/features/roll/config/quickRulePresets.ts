import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";

export type QuickRulePresetScope = "entry" | "group";

export type QuickRulePresetDefinition = {
  key: string;
  label: string;
  description?: string;
  scope: QuickRulePresetScope;
  supportedSides?: number[];
  behaviorKey: RuleBehaviorKey;
  requiresConfig?: boolean;
  defaultValues?: Record<string, unknown>;
};

export const QUICK_RULE_PRESETS: QuickRulePresetDefinition[] = [
  {
    key: "single_check",
    label: "Test simple",
    description: "Un jet simple, avec seuil et critiques configurables.",
    scope: "entry",
    supportedSides: [20, 100],
    behaviorKey: "single_check",
    requiresConfig: true,
    defaultValues: {
      compare: "gte",
      successThreshold: "",
      critSuccessFaces: "",
      critFailureFaces: "",
    },
  },
  {
    key: "success_pool",
    label: "Pool de succès",
    description: "Lance plusieurs dés et compte les réussites.",
    scope: "group",
    supportedSides: [6, 8, 10, 12],
    behaviorKey: "success_pool",
    requiresConfig: true,
    defaultValues: {
      successAtOrAbove: "5",
      failFaces: "1",
      glitchRule: "ones_gt_successes",
    },
  },
  {
    key: "sum_total",
    label: "Somme totale",
    description: "Additionne simplement les dés.",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    behaviorKey: "sum_total",
    requiresConfig: false,
  },
  {
    key: "banded_sum",
    label: "Somme par paliers",
    description: "Additionne les dés puis lit un résultat par plage.",
    scope: "entry",
    supportedSides: [6, 8, 10, 12, 20, 100],
    behaviorKey: "banded_sum",
    requiresConfig: true,
    defaultValues: {
      ranges: [
        { min: "1", max: "3", label: "Bas" },
        { min: "4", max: "6", label: "Moyen" },
        { min: "7", max: "10", label: "Haut" },
      ],
    },
  },
  {
    key: "highest_of_pool",
    label: "Garder le meilleur",
    description: "Ne conserve que le meilleur résultat.",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    behaviorKey: "highest_of_pool",
    requiresConfig: true,
    defaultValues: {
      compare: "gte",
      successThreshold: "",
      critSuccessFaces: "",
      critFailureFaces: "",
    },
  },
  {
    key: "lowest_of_pool",
    label: "Garder le pire",
    description: "Ne conserve que le plus faible résultat.",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    behaviorKey: "lowest_of_pool",
    requiresConfig: true,
    defaultValues: {
      compare: "lte",
      successThreshold: "",
      critSuccessFaces: "",
      critFailureFaces: "",
    },
  },
  {
    key: "keep_highest_n",
    label: "Garder les meilleurs",
    description: "Conserve les meilleurs dés selon la quantité choisie.",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    behaviorKey: "keep_highest_n",
    requiresConfig: true,
    defaultValues: {
      keepCount: "2",
      resultMode: "sum",
    },
  },
  {
    key: "keep_lowest_n",
    label: "Garder les pires",
    description: "Conserve les plus faibles dés selon la quantité choisie.",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    behaviorKey: "keep_lowest_n",
    requiresConfig: true,
    defaultValues: {
      keepCount: "2",
      resultMode: "sum",
    },
  },
  {
    key: "drop_highest_n",
    label: "Retirer les meilleurs",
    description: "Retire les meilleurs dés selon la quantité choisie.",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    behaviorKey: "drop_highest_n",
    requiresConfig: true,
    defaultValues: {
      dropCount: "1",
      resultMode: "sum",
    },
  },
  {
    key: "drop_lowest_n",
    label: "Retirer les pires",
    description: "Retire les plus faibles dés selon la quantité choisie.",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    behaviorKey: "drop_lowest_n",
    requiresConfig: true,
    defaultValues: {
      dropCount: "1",
      resultMode: "sum",
    },
  },
  {
    key: "table_lookup",
    label: "Table de résultats",
    description: "Retourne un résultat selon une plage.",
    scope: "entry",
    supportedSides: [6, 20, 100],
    behaviorKey: "table_lookup",
    requiresConfig: true,
    defaultValues: {
      ranges: [
        { min: "1", max: "3", label: "Bas" },
        { min: "4", max: "6", label: "Moyen" },
        { min: "7", max: "10", label: "Haut" },
      ],
    },
  },
];
