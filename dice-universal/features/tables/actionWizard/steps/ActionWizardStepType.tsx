import { Pressable, Text, View } from "react-native";
import type { ActionBehaviorType } from "../types";

type Props = {
  value: ActionBehaviorType | null;
  onSelect: (value: ActionBehaviorType) => void;
};

const OPTIONS: {
  key: ActionBehaviorType;
  title: string;
  description: string;
}[] = [
  {
    key: "single_check",
    title: "Jet simple",
    description:
      "Un résultat unique, souvent utilisé pour un d20 ou un d100.",
  },
  {
    key: "success_pool",
    title: "Pool de succès",
    description:
      "On lance plusieurs dés et on compte les réussites.",
  },
  {
    key: "banded_sum",
    title: "Somme par paliers",
    description:
      "On additionne les dés puis on lit le total par intervalle.",
  },
  {
    key: "highest_of_pool",
    title: "Meilleur dé",
    description:
      "On lance plusieurs dés et on garde le meilleur résultat.",
  },
  {
    key: "table_lookup",
    title: "Table d’intervalles",
    description:
      "Un résultat renvoie un label selon une plage définie.",
  },
];

export function ActionWizardStepType({
  value,
  onSelect,
}: Props) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>
        Type d’action
      </Text>

      <Text style={{ opacity: 0.72 }}>
        Choisis le comportement principal de cette action.
      </Text>

      <View style={{ gap: 10 }}>
        {OPTIONS.map((option) => {
          const selected = value === option.key;

          return (
            <Pressable
              key={option.key}
              onPress={() => onSelect(option.key)}
              style={{
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                opacity: selected ? 1 : 0.8,
              }}
            >
              <Text style={{ fontWeight: "800", fontSize: 16 }}>
                {option.title}
              </Text>

              <Text style={{ marginTop: 4, opacity: 0.72 }}>
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}