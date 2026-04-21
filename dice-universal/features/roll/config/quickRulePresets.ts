import {
  getRuleBehaviorByKey,
  type RuleBehaviorKey,
} from "../../../core/rules/behaviorCatalog";
import { buildRuleFromBehavior } from "../../../core/rules/buildRuleFromBehavior";

export type QuickRulePresetScope = "entry" | "group";

export type QuickRulePresetDefinition = {
  key: string;
  behaviorKey: RuleBehaviorKey;
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

function requireBehaviorLabel(
  behaviorKey: RuleBehaviorKey,
  fallback: string,
): string {
  return getRuleBehaviorByKey(behaviorKey)?.label ?? fallback;
}

export const QUICK_RULE_PRESETS: QuickRulePresetDefinition[] = [
  {
    key: "single_check_critical",
    behaviorKey: "single_check",
    label: "Jet avec critique",
    description:
      "Un jet simple avec critique sur la face max et échec critique sur 1.",
    scope: "entry",
    supportedSides: [20],
    buildRule: (sides) => {
      const built = buildRuleFromBehavior({
        actionName: `Jet D${sides} critique`,
        behaviorKey: "single_check",
        sides,
        compare: "gte",
        successThreshold: "",
        critSuccessFaces: String(sides),
        critFailureFaces: "1",
      });

      return {
        name: built.name,
        kind: built.kind,
        params: JSON.parse(built.params_json),
      };
    },
  },
  {
    key: "single_check_threshold_high",
    behaviorKey: "single_check",
    label: "Jet à seuil haut",
    description:
      "Réussite si le résultat final atteint ou dépasse un seuil.",
    scope: "entry",
    supportedSides: [20, 100],
    buildRule: (sides) => {
      const built = buildRuleFromBehavior({
        actionName: `Jet D${sides} seuil haut`,
        behaviorKey: "single_check",
        sides,
        compare: "gte",
        successThreshold: String(Math.max(2, Math.ceil(sides / 2))),
        critSuccessFaces: String(sides),
        critFailureFaces: "1",
      });

      return {
        name: built.name,
        kind: built.kind,
        params: JSON.parse(built.params_json),
      };
    },
  },
  {
    key: "single_check_threshold_low",
    behaviorKey: "single_check",
    label: "Jet à seuil bas",
    description:
      "Réussite si le résultat final est inférieur ou égal au seuil.",
    scope: "entry",
    supportedSides: [20, 100],
    buildRule: (sides) => {
      const built = buildRuleFromBehavior({
        actionName: `Jet D${sides} seuil bas`,
        behaviorKey: "single_check",
        sides,
        compare: "lte",
        successThreshold: String(Math.max(2, Math.ceil(sides / 2))),
        critSuccessFaces: "1",
        critFailureFaces: String(sides),
      });

      return {
        name: built.name,
        kind: built.kind,
        params: JSON.parse(built.params_json),
      };
    },
  },
  {
    key: "success_pool",
    behaviorKey: "success_pool",
    label: requireBehaviorLabel("success_pool", "Pool de succès"),
    description: "Lance plusieurs dés et compte les succès selon un seuil.",
    scope: "group",
    supportedSides: [6, 8, 10, 12],
    buildRule: (sides) => {
      const built = buildRuleFromBehavior({
        actionName: `Pool D${sides}`,
        behaviorKey: "success_pool",
        sides,
        successAtOrAbove: String(Math.max(4, Math.ceil(sides * 0.66))),
        failFaces: "1",
        glitchRule: "ones_gt_successes",
      });

      return {
        name: built.name,
        kind: built.kind,
        params: JSON.parse(built.params_json),
      };
    },
  },
  {
    key: "banded_sum",
    behaviorKey: "banded_sum",
    label: requireBehaviorLabel("banded_sum", "Somme par paliers"),
    description:
      "Additionne les dés puis associe le total à un résultat par intervalle.",
    scope: "entry",
    supportedSides: [6],
    buildRule: (sides) => {
      const built = buildRuleFromBehavior({
        actionName: `Somme D${sides} à résultats`,
        behaviorKey: "banded_sum",
        sides,
        ranges: [
          { min: "2", max: "6", label: "Échec" },
          { min: "7", max: "9", label: "Réussite partielle" },
          { min: "10", max: "12", label: "Réussite" },
        ],
      });

      return {
        name: built.name,
        kind: built.kind,
        params: JSON.parse(built.params_json),
      };
    },
  },
  {
    key: "highest_of_pool",
    behaviorKey: "highest_of_pool",
    label: requireBehaviorLabel("highest_of_pool", "Meilleur dé"),
    description:
      "Lance plusieurs dés, garde le meilleur résultat, puis applique seuil et critiques.",
    scope: "entry",
    supportedSides: [6, 8, 10, 12, 20],
    buildRule: (sides) => {
      const built = buildRuleFromBehavior({
        actionName: `Meilleur D${sides}`,
        behaviorKey: "highest_of_pool",
        sides,
        compare: "gte",
        successThreshold: String(Math.max(2, Math.ceil(sides * 0.7))),
        critSuccessFaces: String(sides),
        critFailureFaces: "1",
      });

      return {
        name: built.name,
        kind: built.kind,
        params: JSON.parse(built.params_json),
      };
    },
  },
  {
    key: "lowest_of_pool",
    behaviorKey: "lowest_of_pool",
    label: requireBehaviorLabel("lowest_of_pool", "Pire dé"),
    description:
      "Lance plusieurs dés, garde le plus faible résultat, puis applique seuil et critiques.",
    scope: "entry",
    supportedSides: [6, 8, 10, 12, 20],
    buildRule: (sides) => {
      const built = buildRuleFromBehavior({
        actionName: `Pire D${sides}`,
        behaviorKey: "lowest_of_pool",
        sides,
        compare: "lte",
        successThreshold: String(Math.max(2, Math.ceil(sides * 0.3))),
        critSuccessFaces: "1",
        critFailureFaces: String(sides),
      });

      return {
        name: built.name,
        kind: built.kind,
        params: JSON.parse(built.params_json),
      };
    },
  },
  {
    key: "keep_highest_2",
    behaviorKey: "keep_highest_n",
    label: "Garder les 2 meilleurs",
    description:
      "Lance plusieurs dés et conserve les 2 meilleurs résultats.",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    buildRule: (sides) => {
      const built = buildRuleFromBehavior({
        actionName: `Garder 2 meilleurs D${sides}`,
        behaviorKey: "keep_highest_n",
        sides,
        keepCount: "2",
        resultMode: "sum",
      });

      return {
        name: built.name,
        kind: built.kind,
        params: JSON.parse(built.params_json),
      };
    },
  },
  {
    key: "keep_lowest_2",
    behaviorKey: "keep_lowest_n",
    label: "Garder les 2 pires",
    description:
      "Lance plusieurs dés et conserve les 2 plus faibles résultats.",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    buildRule: (sides) => {
      const built = buildRuleFromBehavior({
        actionName: `Garder 2 pires D${sides}`,
        behaviorKey: "keep_lowest_n",
        sides,
        keepCount: "2",
        resultMode: "sum",
      });

      return {
        name: built.name,
        kind: built.kind,
        params: JSON.parse(built.params_json),
      };
    },
  },
  {
    key: "drop_highest_1",
    behaviorKey: "drop_highest_n",
    label: "Retirer le meilleur",
    description:
      "Lance plusieurs dés et retire le meilleur résultat avant lecture.",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    buildRule: (sides) => {
      const built = buildRuleFromBehavior({
        actionName: `Retirer meilleur D${sides}`,
        behaviorKey: "drop_highest_n",
        sides,
        dropCount: "1",
        resultMode: "sum",
      });

      return {
        name: built.name,
        kind: built.kind,
        params: JSON.parse(built.params_json),
      };
    },
  },
  {
    key: "drop_lowest_1",
    behaviorKey: "drop_lowest_n",
    label: "Retirer le pire",
    description:
      "Lance plusieurs dés et retire le plus faible résultat avant lecture.",
    scope: "entry",
    supportedSides: [4, 6, 8, 10, 12, 20, 100],
    buildRule: (sides) => {
      const built = buildRuleFromBehavior({
        actionName: `Retirer pire D${sides}`,
        behaviorKey: "drop_lowest_n",
        sides,
        dropCount: "1",
        resultMode: "sum",
      });

      return {
        name: built.name,
        kind: built.kind,
        params: JSON.parse(built.params_json),
      };
    },
  },
  {
    key: "range_table",
    behaviorKey: "table_lookup",
    label: "Table de résultats",
    description: "Retourne un résultat selon l’intervalle obtenu.",
    scope: "entry",
    supportedSides: [6, 20, 100],
    buildRule: (sides) => {
      const built = buildRuleFromBehavior({
        actionName: `Table D${sides}`,
        behaviorKey: "table_lookup",
        sides,
        ranges: [
          { min: "1", max: String(Math.ceil(sides / 3)), label: "Bas" },
          {
            min: String(Math.ceil(sides / 3) + 1),
            max: String(Math.ceil((sides * 2) / 3)),
            label: "Moyen",
          },
          {
            min: String(Math.ceil((sides * 2) / 3) + 1),
            max: String(sides),
            label: "Haut",
          },
        ],
      });

      return {
        name: built.name,
        kind: built.kind,
        params: JSON.parse(built.params_json),
      };
    },
  },
];