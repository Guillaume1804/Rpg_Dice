export type ActionBehaviorType =
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

export type ActionBehaviorDefinition = {
  key: ActionBehaviorType;
  label: string;
  description: string;
};

export const ACTION_BEHAVIOR_CATALOG: ActionBehaviorDefinition[] = [
  {
    key: "single_check",
    label: "Test simple",
    description:
      "Un seul résultat est comparé à un seuil, avec éventuellement critiques et échecs critiques.",
  },
  {
    key: "table_lookup",
    label: "Table de résultat",
    description:
      "Une valeur unique renvoie un résultat selon des plages définies.",
  },
  {
    key: "success_pool",
    label: "Pool de succès",
    description:
      "Plusieurs dés sont lancés et on compte le nombre de réussites.",
  },
  {
    key: "sum_total",
    label: "Somme totale",
    description:
      "Tous les dés sont additionnés pour produire un total simple.",
  },
  {
    key: "highest_of_pool",
    label: "Meilleur dé",
    description:
      "Plusieurs dés sont lancés et seul le meilleur résultat est conservé.",
  },
  {
    key: "lowest_of_pool",
    label: "Pire dé",
    description:
      "Plusieurs dés sont lancés et seul le plus faible résultat est conservé.",
  },
  {
    key: "keep_highest_n",
    label: "Garder les meilleurs dés",
    description:
      "Plusieurs dés sont lancés, puis seuls les meilleurs résultats sont conservés.",
  },
  {
    key: "keep_lowest_n",
    label: "Garder les pires dés",
    description:
      "Plusieurs dés sont lancés, puis seuls les plus faibles résultats sont conservés.",
  },
  {
    key: "drop_highest_n",
    label: "Retirer les meilleurs dés",
    description:
      "Plusieurs dés sont lancés, puis les meilleurs résultats sont retirés avant lecture.",
  },
  {
    key: "drop_lowest_n",
    label: "Retirer les pires dés",
    description:
      "Plusieurs dés sont lancés, puis les plus faibles résultats sont retirés avant lecture.",
  },
  {
    key: "banded_sum",
    label: "Somme par paliers",
    description:
      "Les dés sont additionnés puis le total est interprété selon des intervalles.",
  },
];