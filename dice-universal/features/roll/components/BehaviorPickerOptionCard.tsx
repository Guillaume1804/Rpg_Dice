import { Pressable, Text, View } from "react-native";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

type BehaviorScope = "entry" | "group" | "both";

type Props = {
  behaviorKey: RuleBehaviorKey;
  label: string;
  description?: string;
  scope?: BehaviorScope;
  disabled?: boolean;
  onPress: () => void;
};

export function getBehaviorIcon(behaviorKey: RuleBehaviorKey) {
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
  if (behaviorKey === "threshold_degrees") return "◇";
  return "◈";
}

export function getScopeLabel(scope?: BehaviorScope) {
  if (scope === "entry") return "Dé";
  if (scope === "group") return "Groupe";
  if (scope === "both") return "Mixte";
  return "Libre";
}

export function BehaviorPickerOptionCard({
  behaviorKey,
  label,
  description,
  scope,
  disabled,
  onPress,
}: Props) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        borderRadius: premium.radius.xl,
        borderWidth: 1,
        borderColor: disabled
          ? premium.colors.border.subtle
          : premium.colors.border.accent,
        backgroundColor: pressed
          ? premium.colors.surface.pressed
          : premium.colors.surface.elevated,
        padding: premium.spacing.md,
        opacity: disabled ? 0.45 : pressed ? 0.86 : 1,
        transform: [
          {
            scale: pressed && !disabled ? premium.animation.pressScale : 1,
          },
        ],
        gap: premium.spacing.sm,
        overflow: "hidden",
      })}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -52,
          top: -64,
          width: 144,
          height: 144,
          borderRadius: 999,
          backgroundColor: disabled
            ? premium.colors.surface.subtle
            : premium.colors.accent.soft,
          opacity: disabled ? 0.36 : 0.54,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          gap: premium.spacing.sm,
          alignItems: "flex-start",
        }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: premium.radius.lg,
            borderWidth: 1,
            borderColor: disabled
              ? premium.colors.border.subtle
              : premium.colors.border.accent,
            backgroundColor: disabled
              ? premium.colors.surface.subtle
              : premium.colors.accent.soft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: disabled
                ? premium.colors.text.muted
                : premium.colors.accent.primary,
              fontSize: 20,
              fontWeight: "900",
            }}
          >
            {getBehaviorIcon(behaviorKey)}
          </Text>
        </View>

        <View style={{ flex: 1, gap: premium.spacing.xs }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: premium.spacing.sm,
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                flex: 1,
                color: premium.colors.text.primary,
                fontSize: 15,
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
                borderColor: premium.colors.border.subtle,
                borderRadius: premium.radius.pill,
                backgroundColor: premium.colors.surface.subtle,
              }}
            >
              <Text
                style={{
                  color: premium.colors.text.muted,
                  fontSize: premium.typography.tiny,
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
                color: premium.colors.text.secondary,
                lineHeight: 18,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {description}
            </Text>
          ) : null}

          {disabled ? (
            <Text
              style={{
                color: premium.colors.text.muted,
                fontSize: 11,
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
