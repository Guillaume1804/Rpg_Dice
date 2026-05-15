// dice-universal/features/roll/components/QuickDieBehaviorPickerModal.tsx

import { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import type { QuickBehaviorPickerOption } from "../hooks/useQuickDieBehaviorPicker";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

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

function getBehaviorIcon(behaviorKey: RuleBehaviorKey) {
  if (behaviorKey === "single_check") return "🎯";
  if (behaviorKey === "success_pool") return "✦";
  if (behaviorKey === "sum_total") return "Σ";
  if (behaviorKey === "banded_sum") return "▤";
  if (behaviorKey === "table_lookup") return "📜";
  if (behaviorKey === "highest_of_pool") return "⬆";
  if (behaviorKey === "lowest_of_pool") return "⬇";
  if (behaviorKey === "keep_highest_n") return "◆";
  if (behaviorKey === "keep_lowest_n") return "◇";
  if (behaviorKey === "drop_highest_n") return "✂";
  if (behaviorKey === "drop_lowest_n") return "⌄";
  if (behaviorKey === "custom_pipeline") return "⚙";
  return "◈";
}

function getScopeLabel(scope?: "entry" | "group" | "both") {
  if (scope === "entry") return "Dé";
  if (scope === "group") return "Groupe";
  if (scope === "both") return "Mixte";
  return "Libre";
}

function BehaviorOptionCard({
  behaviorKey,
  label,
  description,
  scope,
  disabled,
  onPress,
}: {
  behaviorKey: RuleBehaviorKey;
  label: string;
  description?: string;
  scope?: "entry" | "group" | "both";
  disabled?: boolean;
  onPress: () => void;
}) {
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        ...styles.cardSoft,
        gap: theme.spacing.sm,
        borderColor: disabled
          ? theme.colors.borderSoft
          : rollTheme.cockpit.border,
        backgroundColor: pressed
          ? theme.colors.surfaceSoft
          : rollTheme.cockpit.panelAlt,
        opacity: disabled ? 0.45 : pressed ? 0.86 : 1,
        transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.sm,
          alignItems: "flex-start",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: disabled
              ? theme.colors.borderSoft
              : theme.colors.accent,
            backgroundColor: disabled
              ? theme.colors.surfaceSoft
              : theme.colors.accentSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: disabled ? theme.colors.textSubtle : theme.colors.accent,
              fontSize: 20,
              fontWeight: "900",
            }}
          >
            {getBehaviorIcon(behaviorKey)}
          </Text>
        </View>

        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: theme.spacing.sm,
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                flex: 1,
                color: theme.colors.text,
                fontSize: 16,
                fontWeight: "900",
              }}
            >
              {label}
            </Text>

            <View
              style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderWidth: 1,
                borderColor: theme.colors.borderSoft,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.surfaceAlt,
              }}
            >
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: theme.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                }}
              >
                {getScopeLabel(scope)}
              </Text>
            </View>
          </View>

          {description ? (
            <Text
              style={{
                color: theme.colors.textMuted,
                lineHeight: 19,
                fontWeight: "600",
              }}
            >
              {description}
            </Text>
          ) : null}

          {disabled ? (
            <Text
              style={{
                color: theme.colors.textSubtle,
                fontSize: theme.typography.small,
                fontWeight: "800",
              }}
            >
              Non compatible avec ce dé.
            </Text>
          ) : null}
        </View>
      </View>
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
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  if (!visible || editingDieSides === null) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.68)",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <View
        style={{
          ...styles.card,
          gap: theme.spacing.md,
          borderColor: theme.colors.accent,
          backgroundColor: rollTheme.cockpit.panel,
          borderRadius: rollTheme.layout.cockpitRadius,
          maxHeight: "88%",
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -58,
            right: -54,
            width: 150,
            height: 150,
            borderRadius: 999,
            backgroundColor: rollTheme.cockpit.glow,
            opacity: 0.18,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: -72,
            left: -62,
            width: 160,
            height: 160,
            borderRadius: 999,
            backgroundColor: rollTheme.cockpit.magicGlow,
            opacity: 0.12,
          }}
        />

        <View style={{ gap: theme.spacing.xs }}>
          <Text
            style={{
              color: theme.colors.textSubtle,
              fontSize: theme.typography.tiny,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.9,
            }}
          >
            ✦ Comportement du dé
          </Text>

          <Text style={styles.sectionTitle}>Configurer d{editingDieSides}</Text>

          <Text
            style={{
              color: theme.colors.textMuted,
              lineHeight: 20,
              fontWeight: "600",
            }}
          >
            Choisis comment ce dé doit être interprété au moment du lancer.
          </Text>
        </View>

        <ScrollView
          style={{ maxHeight: 440 }}
          contentContainerStyle={{
            gap: theme.spacing.sm,
            paddingBottom: theme.spacing.sm,
          }}
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
                behaviorKey={behavior.behaviorKey}
                label={label}
                description={description}
                scope={def.defaultScope}
                disabled={!behavior.enabled}
                onPress={() => onSelectBehavior(behavior)}
              />
            );
          })}

          {behaviors.length === 0 ? (
            <View
              style={{
                ...styles.cardSoft,
                backgroundColor: rollTheme.cockpit.panelAlt,
                borderColor: rollTheme.cockpit.borderSoft,
              }}
            >
              <Text style={styles.muted}>
                Aucun comportement compatible avec ce dé.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: theme.spacing.sm,
          }}
        >
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              paddingVertical: 10,
              paddingHorizontal: 15,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.pill,
              backgroundColor: pressed
                ? theme.colors.surfaceSoft
                : theme.colors.surfaceAlt,
              opacity: pressed ? 0.84 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
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
    </View>
  );
}
