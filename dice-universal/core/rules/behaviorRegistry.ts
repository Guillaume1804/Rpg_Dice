// dice-universal/core/rules/behaviorRegistry.ts

export type RuleBehaviorKey =
  | "sum_total"
  | "single_check"
  | "success_pool"
  | "table_lookup"
  | "banded_sum"
  | "highest_of_pool"
  | "lowest_of_pool"
  | "keep_highest_n"
  | "keep_lowest_n"
  | "drop_highest_n"
  | "drop_lowest_n"
  | "threshold_degrees"
  | "custom_pipeline";

export type RuleBehaviorVerticalSlice =
  | "sum"
  | "single_check"
  | "threshold_degrees"
  | "success_pool"
  | "keep_drop"
  | "table_ranges"
  | "custom_pipeline";

export type RuleBehaviorProductStatus =
  | "v1_core"
  | "v1_advanced"
  | "technical_variant";

type BaseBehaviorField = {
  key: string;
  paramsKey?: string;
  label: string;
};

export type RuleBehaviorField =
  | (BaseBehaviorField & {
      type: "text" | "number";
      defaultValue: string;
      placeholder?: string;
    })
  | (BaseBehaviorField & {
      type: "select";
      defaultValue: string;
      options: { value: string; label: string }[];
    })
  | (BaseBehaviorField & {
      type: "ranges";
      paramsKey: "ranges" | "bands";
      defaultValue: { min: string; max: string; label: string }[];
    });

export type RuleBehaviorRegistryItem = {
  key: RuleBehaviorKey;
  label: string;
  description: string;
  kind: string;
  defaultScope: "entry" | "group" | "both";
  allowedScopes: ("entry" | "group" | "both")[];
  supportedSides: number[] | null;
  fields: RuleBehaviorField[];

  /**
   * Permet de garder des comportements techniques dans le moteur
   * sans forcément les afficher dans les choix utilisateur simples.
   */
  visibleInQuickPicker?: boolean;

  /**
   * Permet de regrouper plusieurs comportements techniques
   * sous une logique UX plus simple.
   */
  uxFamily?: "default" | "table_ranges" | "keep_drop" | "advanced";
};
export const RULE_BEHAVIORS: RuleBehaviorRegistryItem[] = [
  {
    key: "sum_total",
    label: "Somme simple",
    description: "Additionne les dés et les modificateurs.",
    kind: "sum",
    defaultScope: "entry",
    allowedScopes: ["entry", "group", "both"],
    supportedSides: null,
    visibleInQuickPicker: true,
    uxFamily: "default",
    fields: [],
  },
  {
    key: "single_check",
    label: "Test avec seuil",
    description: "Compare un résultat à un seuil de réussite.",
    kind: "single_check",
    defaultScope: "entry",
    allowedScopes: ["entry", "group", "both"],
    supportedSides: null,
    visibleInQuickPicker: true,
    fields: [
      {
        key: "compare",
        paramsKey: "compare",
        label: "Type de comparaison",
        type: "select",
        defaultValue: "gte",
        options: [
          { value: "gte", label: "≥ seuil" },
          { value: "lte", label: "≤ seuil" },
        ],
      },
      {
        key: "successThreshold",
        paramsKey: "success_threshold",
        label: "Seuil de réussite",
        type: "number",
        defaultValue: "",
        placeholder: "Ex: 15",
      },
      {
        key: "critSuccessFaces",
        paramsKey: "crit_success_faces",
        label: "Faces de réussite critique",
        type: "text",
        defaultValue: "20",
        placeholder: "Ex: 20",
      },
      {
        key: "critFailureFaces",
        paramsKey: "crit_failure_faces",
        label: "Faces d’échec critique",
        type: "text",
        defaultValue: "1",
        placeholder: "Ex: 1",
      },
    ],
  },
  {
    key: "threshold_degrees",
    label: "Seuil avec degrés",
    description:
      "Compare un jet à un seuil, calcule une marge/degrés et gère les critiques par plages.",
    kind: "threshold_degrees",
    defaultScope: "entry",
    allowedScopes: ["entry", "group", "both"],
    supportedSides: [100],
    visibleInQuickPicker: true,
    fields: [
      {
        key: "compare",
        paramsKey: "compare",
        label: "Type de comparaison",
        type: "select",
        defaultValue: "lte",
        options: [
          { value: "lte", label: "Réussir en dessous ou égal" },
          { value: "gte", label: "Réussir au-dessus ou égal" },
        ],
      },
      {
        key: "targetValue",
        paramsKey: "target_value",
        label: "Seuil / valeur cible",
        type: "number",
        defaultValue: "65",
        placeholder: "Ex: 65",
      },
      {
        key: "degreeStep",
        paramsKey: "degree_step",
        label: "Taille d’un degré",
        type: "number",
        defaultValue: "10",
        placeholder: "Ex: 10",
      },
      {
        key: "critSuccessMin",
        paramsKey: "crit_success_min",
        label: "Critique réussite minimum",
        type: "number",
        defaultValue: "1",
        placeholder: "Ex: 1",
      },
      {
        key: "critSuccessMax",
        paramsKey: "crit_success_max",
        label: "Critique réussite maximum",
        type: "number",
        defaultValue: "5",
        placeholder: "Ex: 5",
      },
      {
        key: "critFailureMin",
        paramsKey: "crit_failure_min",
        label: "Critique échec minimum",
        type: "number",
        defaultValue: "95",
        placeholder: "Ex: 95",
      },
      {
        key: "critFailureMax",
        paramsKey: "crit_failure_max",
        label: "Critique échec maximum",
        type: "number",
        defaultValue: "100",
        placeholder: "Ex: 100",
      },
    ],
  },
  {
    key: "custom_pipeline",
    label: "Pipeline personnalisé",
    description:
      "Construit une règle avancée en combinant relances, explosions, conservation, retrait, comptage et seuil.",
    kind: "pipeline",
    defaultScope: "entry",
    allowedScopes: ["entry", "group", "both"],
    supportedSides: null,
    visibleInQuickPicker: true,
    uxFamily: "advanced",
    fields: [],
  },
  {
    key: "success_pool",
    label: "Pool de succès",
    description: "Compte les dés qui atteignent un seuil.",
    kind: "success_pool",
    defaultScope: "group",
    allowedScopes: ["group", "both"],
    supportedSides: null,
    visibleInQuickPicker: true,
    fields: [
      {
        key: "successAtOrAbove",
        paramsKey: "success_at_or_above",
        label: "Succès à partir de",
        type: "number",
        defaultValue: "5",
        placeholder: "Ex: 5",
      },
      {
        key: "failFaces",
        paramsKey: "fail_faces",
        label: "Faces d’échec spécial",
        type: "text",
        defaultValue: "1",
        placeholder: "Ex: 1 ou 1,2",
      },
      {
        key: "glitchRule",
        paramsKey: "glitch_rule",
        label: "Règle de complication",
        type: "select",
        defaultValue: "special_failures_gt_successes",
        options: [
          { value: "none", label: "Aucune" },
          {
            value: "any_special_failure",
            label: "Dès qu’il y a une face spéciale",
          },
          {
            value: "special_failures_gt_successes",
            label: "Faces spéciales > succès",
          },
          {
            value: "special_failures_gte_successes",
            label: "Faces spéciales ≥ succès",
          },
          {
            value: "special_failures_gt_half_dice",
            label: "Faces spéciales > moitié des dés",
          },
          {
            value: "special_failures_gte_half_dice",
            label: "Faces spéciales ≥ moitié des dés",
          },
          {
            value: "special_failures_gt_half_successes",
            label: "Faces spéciales > moitié des succès",
          },
          {
            value: "special_failures_gte_half_successes",
            label: "Faces spéciales ≥ moitié des succès",
          },
        ],
      },
      {
        key: "criticalFailureRule",
        paramsKey: "critical_failure_rule",
        label: "Règle d’échec critique",
        type: "select",
        defaultValue: "complication_and_zero_successes",
        options: [
          { value: "none", label: "Aucune" },
          { value: "zero_successes", label: "Aucun succès" },
          {
            value: "all_special_failures",
            label: "Tous les dés sont des échecs spéciaux",
          },
          {
            value: "special_failures_gt_successes",
            label: "Faces spéciales > succès",
          },
          {
            value: "special_failures_gte_successes",
            label: "Faces spéciales ≥ succès",
          },
          {
            value: "complication_and_zero_successes",
            label: "Complication + aucun succès",
          },
          { value: "complication_and_failure", label: "Complication + échec" },
        ],
      },
      {
        key: "criticalSuccessRule",
        paramsKey: "critical_success_rule",
        label: "Règle de réussite critique",
        type: "select",
        defaultValue: "none",
        options: [
          { value: "none", label: "Aucune" },
          {
            value: "successes_gte_threshold",
            label: "Succès ≥ seuil critique",
          },
          {
            value: "all_dice_successes",
            label: "Tous les dés sont des succès",
          },
          {
            value: "all_dice_max_faces",
            label: "Tous les dés sont au maximum",
          },
          { value: "any_max_face", label: "Au moins une face maximale" },
          {
            value: "any_critical_face",
            label: "Au moins une face critique choisie",
          },
        ],
      },
      {
        key: "criticalSuccessThreshold",
        paramsKey: "critical_success_threshold",
        label: "Seuil de réussite critique",
        type: "number",
        defaultValue: "",
        placeholder: "Ex: 5",
      },
      {
        key: "criticalSuccessFaces",
        paramsKey: "critical_success_faces",
        label: "Faces de réussite critique",
        type: "text",
        defaultValue: "",
        placeholder: "Ex: 6 ou 10",
      },
    ],
  },
  {
    key: "table_lookup",
    label: "Table / Paliers",
    description:
      "Associe une plage de valeurs à un résultat : table aléatoire, localisation, réussite partielle, palier narratif.",
    kind: "table_lookup",
    defaultScope: "entry",
    allowedScopes: ["entry", "group", "both"],
    supportedSides: null,
    visibleInQuickPicker: true,
    uxFamily: "table_ranges",
    fields: [
      {
        key: "ranges",
        paramsKey: "ranges",
        label: "Plages de résultats",
        type: "ranges",
        defaultValue: [
          { min: "1", max: "3", label: "Bas" },
          { min: "4", max: "6", label: "Moyen" },
          { min: "7", max: "10", label: "Haut" },
        ],
      },
    ],
  },
  {
    key: "banded_sum",
    label: "Résultat par paliers",
    description: "Interprète une somme selon des plages.",
    kind: "banded_sum",
    defaultScope: "group",
    allowedScopes: ["group", "both"],
    supportedSides: null,
    visibleInQuickPicker: false,
    uxFamily: "table_ranges",
    fields: [
      {
        key: "ranges",
        paramsKey: "bands",
        label: "Plages de résultats",
        type: "ranges",
        defaultValue: [
          { min: "1", max: "3", label: "Bas" },
          { min: "4", max: "6", label: "Moyen" },
          { min: "7", max: "10", label: "Haut" },
        ],
      },
    ],
  },
  {
    key: "highest_of_pool",
    label: "Meilleur dé",
    description: "Lance plusieurs dés et conserve le meilleur résultat.",
    kind: "highest_of_pool",
    defaultScope: "group",
    allowedScopes: ["group", "both"],
    supportedSides: null,
    visibleInQuickPicker: false,
    uxFamily: "keep_drop",
    fields: [
      {
        key: "compare",
        paramsKey: "compare",
        label: "Type de comparaison",
        type: "select",
        defaultValue: "gte",
        options: [
          { value: "gte", label: "≥ seuil" },
          { value: "lte", label: "≤ seuil" },
        ],
      },
      {
        key: "successThreshold",
        paramsKey: "success_threshold",
        label: "Seuil de réussite",
        type: "number",
        defaultValue: "",
        placeholder: "Ex: 15",
      },
      {
        key: "critSuccessFaces",
        paramsKey: "crit_success_faces",
        label: "Faces de réussite critique",
        type: "text",
        defaultValue: "",
        placeholder: "Ex: 20",
      },
      {
        key: "critFailureFaces",
        paramsKey: "crit_failure_faces",
        label: "Faces d’échec critique",
        type: "text",
        defaultValue: "",
        placeholder: "Ex: 1",
      },
    ],
  },
  {
    key: "lowest_of_pool",
    label: "Pire dé",
    description: "Lance plusieurs dés et conserve le plus faible résultat.",
    kind: "lowest_of_pool",
    defaultScope: "group",
    allowedScopes: ["group", "both"],
    supportedSides: null,
    visibleInQuickPicker: false,
    uxFamily: "keep_drop",
    fields: [
      {
        key: "compare",
        paramsKey: "compare",
        label: "Type de comparaison",
        type: "select",
        defaultValue: "lte",
        options: [
          { value: "gte", label: "≥ seuil" },
          { value: "lte", label: "≤ seuil" },
        ],
      },
      {
        key: "successThreshold",
        paramsKey: "success_threshold",
        label: "Seuil de réussite",
        type: "number",
        defaultValue: "",
        placeholder: "Ex: 8",
      },
      {
        key: "critSuccessFaces",
        paramsKey: "crit_success_faces",
        label: "Faces de réussite critique",
        type: "text",
        defaultValue: "",
        placeholder: "Ex: 1",
      },
      {
        key: "critFailureFaces",
        paramsKey: "crit_failure_faces",
        label: "Faces d’échec critique",
        type: "text",
        defaultValue: "",
        placeholder: "Ex: 20",
      },
    ],
  },
  {
    key: "keep_highest_n",
    label: "Garder les meilleurs dés",
    description: "Lance plusieurs dés et garde les plus hauts.",
    kind: "keep_highest_n",
    defaultScope: "group",
    allowedScopes: ["group", "both"],
    supportedSides: null,
    visibleInQuickPicker: false,
    uxFamily: "keep_drop",
    fields: [
      {
        key: "keepCount",
        paramsKey: "keep",
        label: "Nombre de dés à garder",
        type: "number",
        defaultValue: "2",
      },
      {
        key: "resultMode",
        paramsKey: "result_mode",
        label: "Mode de résultat",
        type: "select",
        defaultValue: "sum",
        options: [
          { value: "sum", label: "Somme" },
          { value: "values", label: "Liste de valeurs" },
        ],
      },
    ],
  },
  {
    key: "keep_lowest_n",
    label: "Garder les plus faibles dés",
    description: "Lance plusieurs dés et garde les plus bas.",
    kind: "keep_lowest_n",
    defaultScope: "group",
    allowedScopes: ["group", "both"],
    supportedSides: null,
    visibleInQuickPicker: false,
    uxFamily: "keep_drop",
    fields: [
      {
        key: "keepCount",
        paramsKey: "keep",
        label: "Nombre de dés à garder",
        type: "number",
        defaultValue: "2",
      },
      {
        key: "resultMode",
        paramsKey: "result_mode",
        label: "Mode de résultat",
        type: "select",
        defaultValue: "sum",
        options: [
          { value: "sum", label: "Somme" },
          { value: "values", label: "Liste de valeurs" },
        ],
      },
    ],
  },
  {
    key: "drop_highest_n",
    label: "Retirer les meilleurs dés",
    description: "Ignore les dés les plus hauts.",
    kind: "drop_highest_n",
    defaultScope: "group",
    allowedScopes: ["group", "both"],
    supportedSides: null,
    visibleInQuickPicker: false,
    uxFamily: "keep_drop",
    fields: [
      {
        key: "dropCount",
        paramsKey: "drop",
        label: "Nombre de dés à retirer",
        type: "number",
        defaultValue: "1",
      },
      {
        key: "resultMode",
        paramsKey: "result_mode",
        label: "Mode de résultat",
        type: "select",
        defaultValue: "sum",
        options: [
          { value: "sum", label: "Somme" },
          { value: "values", label: "Liste de valeurs" },
        ],
      },
    ],
  },
  {
    key: "drop_lowest_n",
    label: "Retirer les plus faibles dés",
    description: "Ignore les dés les plus bas.",
    kind: "drop_lowest_n",
    defaultScope: "group",
    allowedScopes: ["group", "both"],
    supportedSides: null,
    visibleInQuickPicker: false,
    uxFamily: "keep_drop",
    fields: [
      {
        key: "dropCount",
        paramsKey: "drop",
        label: "Nombre de dés à retirer",
        type: "number",
        defaultValue: "1",
      },
      {
        key: "resultMode",
        paramsKey: "result_mode",
        label: "Mode de résultat",
        type: "select",
        defaultValue: "sum",
        options: [
          { value: "sum", label: "Somme" },
          { value: "values", label: "Liste de valeurs" },
        ],
      },
    ],
  },
];

export const RULE_BEHAVIOR_VERTICAL_SLICE_ORDER: RuleBehaviorVerticalSlice[] = [
  "sum",
  "single_check",
  "threshold_degrees",
  "success_pool",
  "keep_drop",
  "table_ranges",
  "custom_pipeline",
];

export function getRuleBehaviorVerticalSlice(
  key: RuleBehaviorKey,
): RuleBehaviorVerticalSlice {
  switch (key) {
    case "sum_total":
      return "sum";

    case "single_check":
      return "single_check";

    case "threshold_degrees":
      return "threshold_degrees";

    case "success_pool":
      return "success_pool";

    case "highest_of_pool":
    case "lowest_of_pool":
    case "keep_highest_n":
    case "keep_lowest_n":
    case "drop_highest_n":
    case "drop_lowest_n":
      return "keep_drop";

    case "table_lookup":
    case "banded_sum":
      return "table_ranges";

    case "custom_pipeline":
      return "custom_pipeline";

    default:
      return "custom_pipeline";
  }
}

export function getRuleBehaviorProductStatus(
  key: RuleBehaviorKey,
): RuleBehaviorProductStatus {
  switch (key) {
    case "sum_total":
    case "single_check":
    case "threshold_degrees":
    case "success_pool":
    case "table_lookup":
    case "banded_sum":
      return "v1_core";

    case "keep_highest_n":
    case "keep_lowest_n":
    case "drop_highest_n":
    case "drop_lowest_n":
      return "v1_core";

    case "highest_of_pool":
    case "lowest_of_pool":
      return "technical_variant";

    case "custom_pipeline":
      return "v1_advanced";

    default:
      return "v1_advanced";
  }
}

export function getRuleBehaviorVerticalSliceLabel(
  slice: RuleBehaviorVerticalSlice,
) {
  switch (slice) {
    case "sum":
      return "Somme simple";

    case "single_check":
      return "Test avec seuil";

    case "threshold_degrees":
      return "Seuil avec degrés";

    case "success_pool":
      return "Pool de succès";

    case "keep_drop":
      return "Garder / retirer des dés";

    case "table_ranges":
      return "Table / Paliers";

    case "custom_pipeline":
      return "Pipeline personnalisé";

    default:
      return "Comportement";
  }
}

export function getRuleBehaviorsByVerticalSlice(
  slice: RuleBehaviorVerticalSlice,
) {
  return RULE_BEHAVIORS.filter(
    (behavior) => getRuleBehaviorVerticalSlice(behavior.key) === slice,
  );
}

export function getVisibleRuleBehaviorsByVerticalSlice(
  slice: RuleBehaviorVerticalSlice,
) {
  return getRuleBehaviorsByVerticalSlice(slice).filter(
    (behavior) => behavior.visibleInQuickPicker !== false,
  );
}

export function getCoreRuleBehaviors() {
  return RULE_BEHAVIORS.filter(
    (behavior) => getRuleBehaviorProductStatus(behavior.key) === "v1_core",
  );
}

export function getAdvancedRuleBehaviors() {
  return RULE_BEHAVIORS.filter(
    (behavior) => getRuleBehaviorProductStatus(behavior.key) === "v1_advanced",
  );
}

export function getTechnicalVariantRuleBehaviors() {
  return RULE_BEHAVIORS.filter(
    (behavior) =>
      getRuleBehaviorProductStatus(behavior.key) === "technical_variant",
  );
}

export function getRuleBehaviorDefinition(key: RuleBehaviorKey) {
  return RULE_BEHAVIORS.find((behavior) => behavior.key === key) ?? null;
}
