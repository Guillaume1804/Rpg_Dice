export type QuickRulePresetScope = "entry" | "group";

export type QuickRulePresetDefinition = {
  key: string;
  label: string;
  description?: string;
  scope: QuickRulePresetScope;
  supportedSides?: number[];
  buildRule: (sides: number) => {
    name: string;
    kind: string;
    params: Record<string, unknown>;
  };
};

/**
 * Presets UX du jet rapide.
 *
 * - scope "entry" : la règle s’applique à une entrée de dé
 * - scope "group" : la règle s’applique à l’ensemble du groupe de dés
 *
 * Le moteur reste la source de vérité via kind + params_json.
 * Cette couche sert uniquement à exposer des presets compréhensibles en UX.
 */

export const QUICK_RULE_PRESETS: QuickRulePresetDefinition[] = [
  {
    key: "single_check_critical",
    label: "Critique naturel",
    description: "Critique sur la face max, échec critique sur 1.",
    scope: "entry",
    supportedSides: [20],
    buildRule: (sides) => ({
      name: `Temp D${sides} critique`,
      kind: "single_check",
      params: {
        compare: "gte",
        success_threshold: null,
        crit_success_faces: [sides],
        crit_failure_faces: [1],
      },
    }),
  },
  {
    key: "single_check_threshold_high",
    label: "Seuil haut",
    description: "Réussite si le résultat final atteint ou dépasse un seuil.",
    scope: "entry",
    supportedSides: [20, 100],
    buildRule: (sides) => ({
      name: `Temp D${sides} seuil haut`,
      kind: "single_check",
      params: {
        compare: "gte",
        success_threshold: Math.max(2, Math.ceil(sides / 2)),
        crit_success_faces: [sides],
        crit_failure_faces: [1],
      },
    }),
  },
  {
    key: "single_check_threshold_low",
    label: "Seuil bas",
    description: "Réussite si le résultat final est inférieur ou égal au seuil.",
    scope: "entry",
    supportedSides: [20, 100],
    buildRule: (sides) => ({
      name: `Temp D${sides} seuil bas`,
      kind: "single_check",
      params: {
        compare: "lte",
        success_threshold: Math.max(2, Math.ceil(sides / 2)),
        crit_success_faces: [1],
        crit_failure_faces: [sides],
      },
    }),
  },
  {
    key: "success_pool",
    label: "Pool de succès",
    description: "Compte les succès au-dessus d’un seuil, avec gestion des faces d’échec.",
    scope: "group",
    supportedSides: [6, 8, 10, 12],
    buildRule: (sides) => ({
      name: `Temp D${sides} pool`,
      kind: "success_pool",
      params: {
        success_at_or_above: Math.max(4, Math.ceil(sides * 0.66)),
        fail_faces: [1],
        glitch_rule: "ones_gt_successes",
      },
    }),
  },
  {
    key: "banded_sum",
    label: "Somme à bandes",
    description: "Additionne les dés puis retourne un résultat par intervalle.",
    scope: "entry",
    supportedSides: [6],
    buildRule: (sides) => ({
      name: `Temp ${2}d${sides} somme à bandes`,
      kind: "banded_sum",
      params: {
        bands: [
          { min: 2, max: 6, label: "Échec" },
          { min: 7, max: 9, label: "Réussite partielle" },
          { min: 10, max: 12, label: "Réussite" },
        ],
        defaultLabel: "—",
      },
    }),
  },
  {
    key: "highest_of_pool",
    label: "Meilleur dé",
    description: "Garde le meilleur résultat du pool, avec seuil et critiques.",
    scope: "entry",
    supportedSides: [6, 8, 10, 12, 20],
    buildRule: (sides) => ({
      name: `Temp meilleur d${sides}`,
      kind: "highest_of_pool",
      params: {
        compare: "gte",
        success_threshold: Math.max(2, Math.ceil(sides * 0.7)),
        crit_success_faces: [sides],
        crit_failure_faces: [1],
      },
    }),
  },
  {
    key: "range_table",
    label: "Table d’intervalles",
    description: "Retourne un label selon la plage obtenue.",
    scope: "entry",
    supportedSides: [6, 20, 100],
    buildRule: (sides) => ({
      name: `Temp D${sides} intervalle`,
      kind: "table_lookup",
      params: {
        ranges: [
          { min: 1, max: Math.ceil(sides / 3), label: "Bas" },
          {
            min: Math.ceil(sides / 3) + 1,
            max: Math.ceil((sides * 2) / 3),
            label: "Moyen",
          },
          {
            min: Math.ceil((sides * 2) / 3) + 1,
            max: sides,
            label: "Haut",
          },
        ],
        defaultLabel: "—",
      },
    }),
  },
];