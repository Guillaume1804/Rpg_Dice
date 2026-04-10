export type RuleFamilyKey =
  | "single_check"
  | "success_pool"
  | "banded_sum"
  | "highest_of_pool"
  | "table_lookup";

export type RuleFamilyDefinition = {
  key: RuleFamilyKey;
  label: string;
  description: string;
};

export const RULE_FAMILIES: RuleFamilyDefinition[] = [
  {
    key: "single_check",
    label: "Jet simple",
    description:
      "Un seul résultat est comparé à un seuil. Pratique pour les d20, d100, tests directs.",
  },
  {
    key: "success_pool",
    label: "Pool de succès",
    description:
      "Plusieurs dés sont lancés et on compte le nombre de réussites.",
  },
  {
    key: "banded_sum",
    label: "Somme par paliers",
    description:
      "On additionne les dés puis on associe le total à un résultat par intervalle.",
  },
  {
    key: "highest_of_pool",
    label: "Meilleur dé",
    description:
      "On lance plusieurs dés et on garde uniquement le meilleur résultat.",
  },
  {
    key: "table_lookup",
    label: "Table d’intervalles",
    description:
      "Une valeur unique renvoie un résultat selon une plage chiffrée.",
  },
];

export function getRuleFamilyLabel(kind: string): string {
  return RULE_FAMILIES.find((family) => family.key === kind)?.label ?? kind;
}