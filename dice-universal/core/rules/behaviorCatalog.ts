//ANCHOR -  BEHAVIOR CATALOG

export type RuleBehaviorScope = "entry" | "group" | "both";

export type RuleBehaviorKey =
  | "single_check"
  | "table_lookup"
  | "success_pool"
  | "sum_total"
  | "highest_of_pool"
  | "lowest_of_pool"
  | "keep_highest_n"
  | "keep_lowest_n"
  | "drop_highest_n"
  | "drop_lowest_n"
  | "banded_sum";

export type RuleBehaviorCategory =
  | "check"
  | "lookup"
  | "pool"
  | "sum"
  | "selection";

export type RuleBehaviorEngineKind =
  | "single_check"
  | "table_lookup"
  | "success_pool"
  | "sum"
  | "highest_of_pool"
  | "lowest_of_pool"
  | "keep_highest_n"
  | "keep_lowest_n"
  | "drop_highest_n"
  | "drop_lowest_n"
  | "banded_sum"
  | "pipeline";

export type RuleBehaviorFieldType = "number" | "select" | "boolean" | "ranges";

export type RuleBehaviorFieldDefinition = {
  key: string;
  label: string;
  type: RuleBehaviorFieldType;
  description?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | string | boolean;
  options?: {
    value: string;
    label: string;
  }[];
};
export type RuleBehaviorDefinition = {
  key: RuleBehaviorKey;
  label: string;
  description: string;
  category: RuleBehaviorCategory;
  scope: RuleBehaviorScope;
  supportedSides: number[];
  engineKind: RuleBehaviorEngineKind;

  /**
   * Le comportement peut être proposé dans le wizard de création d’action.
   */
  supportsActionWizard: boolean;

  /**
   * Le comportement peut être proposé dans le quick roll / jet rapide.
   */
  supportsQuickRoll: boolean;

  /**
   * Le comportement peut être proposé dans un jet libre contextualisé à un profil.
   */
  supportsProfileFreeRoll: boolean;

  /**
   * Permet de piloter une future UI dynamique de paramétrage.
   */
  fields: RuleBehaviorFieldDefinition[];
};

export const RULE_BEHAVIOR_CATALOG: RuleBehaviorDefinition[] = [
  {
    key: "single_check",
    label: "Test simple",
    description:
      "Un seul résultat est comparé à un seuil, avec éventuellement critiques et échecs critiques.",
    category: "check",
    scope: "entry",
    supportedSides: [20, 100],
    engineKind: "single_check",
    supportsActionWizard: true,
    supportsQuickRoll: true,
    supportsProfileFreeRoll: true,
    fields: [
      {
        key: "compare",
        label: "Comparaison",
        type: "select",
        required: true,
        defaultValue: "gte",
        options: [
          { value: "gte", label: "Supérieur ou égal" },
          { value: "lte", label: "Inférieur ou égal" },
        ],
      },
      {
        key: "success_threshold",
        label: "Seuil de réussite",
        type: "number",
        required: false,
        min: 1,
        max: 100,
      },
    ],
  },
  {
    key: "table_lookup",
    label: "Table de résultat",
    description:
      "Une valeur unique renvoie un résultat selon des plages définies.",
    category: "lookup",
    scope: "entry",
    supportedSides: [6, 20, 100],
    engineKind: "table_lookup",
    supportsActionWizard: true,
    supportsQuickRoll: true,
    supportsProfileFreeRoll: true,
    fields: [
      {
        key: "ranges",
        label: "Plages de résultats",
        type: "ranges",
        required: true,
      },
    ],
  },
  {
    key: "success_pool",
    label: "Pool de succès",
    description:
      "Plusieurs dés sont lancés et on compte le nombre de réussites.",
    category: "pool",
    scope: "group",
    supportedSides: [6, 8, 10, 12],
    engineKind: "success_pool",
    supportsActionWizard: true,
    supportsQuickRoll: true,
    supportsProfileFreeRoll: true,
    fields: [
      {
        key: "success_at_or_above",
        label: "Succès à partir de",
        type: "number",
        required: true,
        min: 1,
        max: 100,
      },
    ],
  },
  {
    key: "sum_total",
    label: "Somme totale",
    description: "Tous les dés sont additionnés pour produire un total simple.",
    category: "sum",
    scope: "entry",
    supportedSides: [],
    engineKind: "sum",
    supportsActionWizard: true,
    supportsQuickRoll: true,
    supportsProfileFreeRoll: true,
    fields: [],
  },
  {
    key: "highest_of_pool",
    label: "Meilleur dé",
    description:
      "Plusieurs dés sont lancés et seul le meilleur résultat est conservé.",
    category: "selection",
    scope: "entry",
    supportedSides: [6, 8, 10, 12, 20],
    engineKind: "highest_of_pool",
    supportsActionWizard: true,
    supportsQuickRoll: true,
    supportsProfileFreeRoll: true,
    fields: [
      {
        key: "success_threshold",
        label: "Seuil de réussite",
        type: "number",
        required: false,
        min: 1,
        max: 100,
      },
    ],
  },
  {
    key: "lowest_of_pool",
    label: "Pire dé",
    description:
      "Plusieurs dés sont lancés et seul le plus faible résultat est conservé.",
    category: "selection",
    scope: "entry",
    supportedSides: [6, 8, 10, 12, 20],
    engineKind: "lowest_of_pool",
    supportsActionWizard: true,
    supportsQuickRoll: true,
    supportsProfileFreeRoll: true,
    fields: [
      {
        key: "success_threshold",
        label: "Seuil de réussite",
        type: "number",
        required: false,
        min: 1,
        max: 100,
      },
    ],
  },
  {
    key: "keep_highest_n",
    label: "Garder les meilleurs dés",
    description:
      "Plusieurs dés sont lancés, puis seuls les meilleurs résultats sont conservés.",
    category: "selection",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    engineKind: "keep_highest_n",
    supportsActionWizard: true,
    supportsQuickRoll: true,
    supportsProfileFreeRoll: true,
    fields: [
      {
        key: "n",
        label: "Nombre de dés à garder",
        type: "number",
        required: true,
        min: 1,
        max: 20,
        defaultValue: 1,
      },
    ],
  },
  {
    key: "keep_lowest_n",
    label: "Garder les pires dés",
    description:
      "Plusieurs dés sont lancés, puis seuls les plus faibles résultats sont conservés.",
    category: "selection",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    engineKind: "keep_lowest_n",
    supportsActionWizard: true,
    supportsQuickRoll: true,
    supportsProfileFreeRoll: true,
    fields: [
      {
        key: "n",
        label: "Nombre de dés à garder",
        type: "number",
        required: true,
        min: 1,
        max: 20,
        defaultValue: 1,
      },
    ],
  },
  {
    key: "drop_highest_n",
    label: "Retirer les meilleurs dés",
    description:
      "Plusieurs dés sont lancés, puis les meilleurs résultats sont retirés avant lecture.",
    category: "selection",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    engineKind: "drop_highest_n",
    supportsActionWizard: true,
    supportsQuickRoll: true,
    supportsProfileFreeRoll: true,
    fields: [
      {
        key: "n",
        label: "Nombre de dés à retirer",
        type: "number",
        required: true,
        min: 1,
        max: 20,
        defaultValue: 1,
      },
    ],
  },
  {
    key: "drop_lowest_n",
    label: "Retirer les pires dés",
    description:
      "Plusieurs dés sont lancés, puis les plus faibles résultats sont retirés avant lecture.",
    category: "selection",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    engineKind: "drop_lowest_n",
    supportsActionWizard: true,
    supportsQuickRoll: true,
    supportsProfileFreeRoll: true,
    fields: [
      {
        key: "n",
        label: "Nombre de dés à retirer",
        type: "number",
        required: true,
        min: 1,
        max: 20,
        defaultValue: 1,
      },
    ],
  },
  {
    key: "banded_sum",
    label: "Somme par paliers",
    description:
      "Les dés sont additionnés puis le total est interprété selon des intervalles.",
    category: "sum",
    scope: "entry",
    supportedSides: [6],
    engineKind: "banded_sum",
    supportsActionWizard: true,
    supportsQuickRoll: true,
    supportsProfileFreeRoll: true,
    fields: [
      {
        key: "bands",
        label: "Paliers",
        type: "ranges",
        required: true,
      },
    ],
  },
];

export function getRuleBehaviorByKey(
  key: RuleBehaviorKey | string | null | undefined,
): RuleBehaviorDefinition | null {
  if (!key) return null;
  return RULE_BEHAVIOR_CATALOG.find((behavior) => behavior.key === key) ?? null;
}

export function getRuleBehaviorsByScope(
  scope: "entry" | "group",
): RuleBehaviorDefinition[] {
  return RULE_BEHAVIOR_CATALOG.filter(
    (behavior) => behavior.scope === scope || behavior.scope === "both",
  );
}

export function getQuickRollBehaviors(): RuleBehaviorDefinition[] {
  return RULE_BEHAVIOR_CATALOG.filter((behavior) => behavior.supportsQuickRoll);
}

export function getActionWizardBehaviors(): RuleBehaviorDefinition[] {
  return RULE_BEHAVIOR_CATALOG.filter(
    (behavior) => behavior.supportsActionWizard,
  );
}

export function getProfileFreeRollBehaviors(): RuleBehaviorDefinition[] {
  return RULE_BEHAVIOR_CATALOG.filter(
    (behavior) => behavior.supportsProfileFreeRoll,
  );
}
