export type QuickRulePresetDefinition = {
  key: string;
  label: string;
  description?: string;
  supportedSides?: number[];
  buildRule: (sides: number) => {
    name: string;
    kind: string;
    params: Record<string, unknown>;
  };
};

export const QUICK_RULE_PRESETS: QuickRulePresetDefinition[] = [
  {
    key: "d20_critical",
    label: "D20 critique",
    description: "Critique sur la face max, échec critique sur 1.",
    supportedSides: [20],
    buildRule: (sides) => ({
      name: `Temp D${sides} critique`,
      kind: "d20",
      params: {
        critSuccess: sides,
        critFailure: 1,
        successThreshold: null,
      },
    }),
  },
  {
    key: "d20_threshold",
    label: "D20 seuil",
    description: "Réussite au-dessus d’un seuil, avec critique et échec critique.",
    supportedSides: [20],
    buildRule: (sides) => ({
      name: `Temp D${sides} seuil 10+`,
      kind: "d20",
      params: {
        critSuccess: sides,
        critFailure: 1,
        successThreshold: 10,
      },
    }),
  },
  {
    key: "pool_success",
    label: "Pool de succès",
    description: "Compte les succès au-dessus d’un seuil.",
    supportedSides: [6, 8, 10, 12],
    buildRule: (sides) => ({
      name: `Temp D${sides} pool`,
      kind: "pool",
      params: {
        successAtOrAbove: Math.max(4, Math.ceil(sides * 0.66)),
        critFailureFace: 1,
        glitchRule: "ones_gt_successes",
      },
    }),
  },
  {
    key: "range_table",
    label: "Table d’intervalles",
    description: "Retourne un label selon la plage obtenue.",
    supportedSides: [6, 20, 100],
    buildRule: (sides) => ({
      name: `Temp D${sides} intervalle`,
      kind: "table_lookup",
      params: {
        rows: [
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
      },
    }),
  },
];