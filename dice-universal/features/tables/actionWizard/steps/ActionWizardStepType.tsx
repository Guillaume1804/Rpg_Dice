// dice-universal/features/tables/actionWizard/steps/ActionWizardStepType.tsx

import { Pressable, Text, View } from "react-native";
import {
  RULE_BEHAVIORS,
  type RuleBehaviorKey,
} from "../../../../core/rules/behaviorRegistry";

type Props = {
  value: RuleBehaviorKey | null;
  onSelect: (value: RuleBehaviorKey) => void;
};

export function ActionWizardStepType({ value, onSelect }: Props) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>Type d’action</Text>

      <Text style={{ opacity: 0.72 }}>
        Choisis la manière principale dont cette action doit lire son jet.
      </Text>

      <View style={{ gap: 10 }}>
        {RULE_BEHAVIORS.map((option) => {
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
                {option.label}
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
