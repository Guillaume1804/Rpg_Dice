import { Pressable, Text, View } from "react-native";
import {
  RULE_BEHAVIORS,
  type RuleBehaviorKey,
} from "../../../../core/rules/behaviorRegistry";
import type { ActionBehaviorVariant } from "../types";

type ActionBehaviorOption = {
  optionId: string;
  behaviorKey: RuleBehaviorKey;
  label: string;
  description: string;
  variant: ActionBehaviorVariant;
};

type Props = {
  value: RuleBehaviorKey | null;
  variant: ActionBehaviorVariant;
  onSelect: (value: RuleBehaviorKey, variant?: ActionBehaviorVariant) => void;
};

function getVisibleActionBehaviorOptions(): ActionBehaviorOption[] {
  const visibleBehaviors = RULE_BEHAVIORS.filter((behavior) => {
    if (behavior.visibleInQuickPicker !== true) return false;
    return true;
  }).map<ActionBehaviorOption>((behavior) => ({
    optionId: behavior.key,
    behaviorKey: behavior.key,
    label: behavior.label,
    description: behavior.description,
    variant: "default",
  }));

  const customPipelineIndex = visibleBehaviors.findIndex(
    (behavior) => behavior.behaviorKey === "custom_pipeline",
  );

  const keepDropOption: ActionBehaviorOption = {
    optionId: "keep_drop_pipeline",
    behaviorKey: "custom_pipeline",
    label: "Garder / Retirer des dés",
    description:
      "Garde ou retire les meilleurs ou les plus faibles dés, puis calcule le résultat.",
    variant: "keep_drop",
  };

  if (customPipelineIndex >= 0) {
    return [
      ...visibleBehaviors.slice(0, customPipelineIndex),
      keepDropOption,
      ...visibleBehaviors.slice(customPipelineIndex),
    ];
  }

  return [...visibleBehaviors, keepDropOption];
}

export function ActionWizardStepType({ value, variant, onSelect }: Props) {
  const options = getVisibleActionBehaviorOptions();

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>Type d’action</Text>

      <Text style={{ opacity: 0.72 }}>
        Choisis la manière principale dont cette action doit lire son jet.
      </Text>

      <View style={{ gap: 10 }}>
        {options.map((option) => {
          const selected =
            value === option.behaviorKey && variant === option.variant;

          return (
            <Pressable
              key={option.optionId}
              onPress={() => onSelect(option.behaviorKey, option.variant)}
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