// dice-universal/features/tables/actionWizard/steps/ActionWizardStepType.tsx

import { Pressable, Text, View } from "react-native";
import {
  RULE_BEHAVIOR_VERTICAL_SLICE_ORDER,
  getRuleBehaviorVerticalSlice,
  getRuleBehaviorVerticalSliceLabel,
  getVisibleRuleBehaviorsByVerticalSlice,
  type RuleBehaviorKey,
} from "../../../../core/rules/behaviorRegistry";
import type { ActionBehaviorVariant } from "../types";

import { useArcaneTheme } from "../../../../theme/ArcaneThemeProvider";

type ActionBehaviorOption = {
  optionId: string;
  behaviorKey: RuleBehaviorKey;
  label: string;
  description: string;
  variant: ActionBehaviorVariant;
  categoryLabel: string;
};

type Props = {
  value: RuleBehaviorKey | null;
  variant: ActionBehaviorVariant;
  onSelect: (value: RuleBehaviorKey, variant?: ActionBehaviorVariant) => void;
};

function getVisibleActionBehaviorOptions(): ActionBehaviorOption[] {
  const options: ActionBehaviorOption[] = [];

  for (const slice of RULE_BEHAVIOR_VERTICAL_SLICE_ORDER) {
    const categoryLabel = getRuleBehaviorVerticalSliceLabel(slice);

    if (slice === "keep_drop") {
      options.push({
        optionId: "keep_drop_pipeline",
        behaviorKey: "custom_pipeline",
        label: "Garder / retirer des dés",
        description:
          "Garde ou retire les meilleurs ou les plus faibles dés, puis calcule le résultat.",
        variant: "keep_drop",
        categoryLabel,
      });

      continue;
    }

    const visibleBehaviors = getVisibleRuleBehaviorsByVerticalSlice(slice);

    for (const behavior of visibleBehaviors) {
      options.push({
        optionId: behavior.key,
        behaviorKey: behavior.key,
        label: behavior.label,
        description: behavior.description,
        variant: "default",
        categoryLabel: getRuleBehaviorVerticalSliceLabel(
          getRuleBehaviorVerticalSlice(behavior.key),
        ),
      });
    }
  }

  return options;
}

function BehaviorCard({
  label,
  description,
  categoryLabel,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  categoryLabel: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme, styles } = useArcaneTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...styles.cardSoft,
        gap: theme.spacing.xs,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        backgroundColor: selected
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Text
        style={{
          color: selected ? theme.colors.accent : theme.colors.textSubtle,
          fontSize: theme.typography.tiny,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {categoryLabel}
      </Text>

      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: theme.colors.textMuted,
          lineHeight: 19,
        }}
      >
        {description}
      </Text>

      {selected ? (
        <Text
          style={{
            color: theme.colors.accent,
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
  const { theme, styles } = useArcaneTheme();
  const options = getVisibleActionBehaviorOptions();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={styles.sectionTitle}>Type d’action</Text>

        <Text style={styles.muted}>
          Choisis la manière principale dont cette action doit interpréter le
          résultat du jet.
        </Text>
      </View>

      <View style={{ gap: theme.spacing.sm }}>
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
              categoryLabel={option.categoryLabel}
            />
          );
        })}
      </View>
    </View>
  );
}
