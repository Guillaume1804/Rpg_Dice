// dice-universal/features/roll/components/QuickDieBehaviorPickerModal.tsx

import { View, Text, Pressable, ScrollView } from "react-native";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import type { QuickBehaviorPickerOption } from "../hooks/useQuickDieBehaviorPicker";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

type BehaviorDefinition = {
  key: RuleBehaviorKey;
  label: string;
  description?: string;
  defaultScope?: "entry" | "group" | "both";
};

type Props = {
  visible: boolean;
  editingDieSides: number | null;
  behaviors: QuickBehaviorPickerOption[];
  getDefinition: (behaviorKey: RuleBehaviorKey) => BehaviorDefinition | null;
  onSelectBehavior: (option: QuickBehaviorPickerOption) => void;
  onClose: () => void;
};

function BehaviorOptionCard({
  label,
  description,
  disabled,
  onPress,
}: {
  label: string;
  description?: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { theme, styles } = useArcaneTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        ...styles.cardSoft,
        gap: theme.spacing.xs,
        borderColor: theme.colors.border,
        backgroundColor: pressed
          ? theme.colors.surfaceSoft
          : theme.colors.surfaceAlt,
        opacity: disabled ? 0.45 : pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>

      {description ? (
        <Text
          style={{
            color: theme.colors.textMuted,
            lineHeight: 19,
          }}
        >
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function QuickDieBehaviorPickerModal({
  visible,
  editingDieSides,
  behaviors,
  getDefinition,
  onSelectBehavior,
  onClose,
}: Props) {
  const { theme, styles } = useArcaneTheme();
  
  if (!visible || editingDieSides === null) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.64)",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <View
        style={{
          ...styles.card,
          gap: theme.spacing.md,
          borderColor: theme.colors.accent,
          maxHeight: "88%",
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={styles.sectionTitle}>
            Configurer d{editingDieSides}
          </Text>

          <Text style={styles.muted}>
            Choisis le comportement à appliquer à ce jet rapide.
          </Text>
        </View>

        <ScrollView
          style={{ maxHeight: 420 }}
          contentContainerStyle={{ gap: theme.spacing.sm }}
          showsVerticalScrollIndicator
        >
          {behaviors.map((behavior) => {
            const def = getDefinition(behavior.behaviorKey);
            if (!def) return null;

            const label = behavior.label ?? def.label;
            const description = behavior.description ?? def.description;

            return (
              <BehaviorOptionCard
                key={behavior.optionId}
                label={label}
                description={description}
                disabled={!behavior.enabled}
                onPress={() => onSelectBehavior(behavior)}
              />
            );
          })}

          {behaviors.length === 0 ? (
            <View style={styles.cardSoft}>
              <Text style={styles.muted}>
                Aucun comportement compatible avec ce dé.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <Pressable
          onPress={onClose}
          style={({ pressed }) => ({
            alignSelf: "flex-end",
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.pill,
            backgroundColor: pressed
              ? theme.colors.surfaceSoft
              : theme.colors.surfaceAlt,
            opacity: pressed ? 0.84 : 1,
          })}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontWeight: "900",
            }}
          >
            Annuler
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
