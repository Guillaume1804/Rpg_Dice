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
        placeholder: "Ex: 1",
      },
      {
        key: "glitchRule",
        paramsKey: "glitch_rule",
        label: "Règle de complication",
        type: "select",
        defaultValue: "ones_gt_successes",
        options: [
          { value: "none", label: "Aucune" },
          { value: "ones_gt_successes", label: "1 > succès" },
          { value: "ones_gte_successes", label: "1 ≥ succès" },
        ],
      },
    ],
  },
  {
    key: "table_lookup",
    label: "Table de résultats",
    description: "Associe une plage de valeurs à un résultat texte.",
    kind: "table_lookup",
    defaultScope: "entry",
    allowedScopes: ["entry", "group", "both"],
    supportedSides: null,
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

export function getRuleBehaviorDefinition(key: RuleBehaviorKey) {
  return RULE_BEHAVIORS.find((behavior) => behavior.key === key) ?? null;
}
