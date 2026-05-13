// dice-universal/features/tables/actionWizard/steps/ActionWizardStepType.tsx

import { Pressable, Text, View } from "react-native";
import {
  RULE_BEHAVIORS,
  type RuleBehaviorKey,
} from "../../../../core/rules/behaviorRegistry";
import type { ActionBehaviorVariant } from "../types";

import { arcane } from "../../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../../theme/arcaneStyles";

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

function BehaviorCard({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.xs,
        borderColor: selected ? arcane.colors.accent : arcane.colors.border,
        backgroundColor: selected
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontSize: 16,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: arcane.colors.textMuted,
          lineHeight: 19,
        }}
      >
        {description}
      </Text>

      {selected ? (
        <Text
          style={{
            color: arcane.colors.accent,
            fontWeight: "900",
            marginTop: 2,
          }}
        >
          Sélectionné
        </Text>
      ) : null}
    </Pressable>
  );
}

export function ActionWizardStepType({ value, variant, onSelect }: Props) {
  const options = getVisibleActionBehaviorOptions();

  return (
    <View style={{ gap: arcane.spacing.md }}>
      <View style={{ gap: arcane.spacing.xs }}>
        <Text style={arcaneStyles.sectionTitle}>Type d’action</Text>

        <Text style={arcaneStyles.muted}>
          Choisis la manière principale dont cette action doit interpréter le
          résultat du jet.
        </Text>
      </View>

      <View style={{ gap: arcane.spacing.sm }}>
        {options.map((option) => {
          const selected =
            value === option.behaviorKey && variant === option.variant;

          return (
            <BehaviorCard
              key={option.optionId}
              label={option.label}
              description={option.description}
              selected={selected}
              onPress={() => onSelect(option.behaviorKey, option.variant)}
            />
          );
        })}
      </View>
    </View>
  );
}
