// dice-universal/features/roll/components/PreparedRollEditSheet.tsx

import { useMemo, type ReactNode } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import type { QuickBehaviorPickerOption } from "../hooks/useQuickDieBehaviorPicker";

import { PremiumBottomSheet } from "../../../components/premium";
import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

export type PreparedRollEditDie = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  ruleLabel?: string | null;
};

type PreparedRollEditMode = "dice" | "behavior_picker" | "behavior_config";

type BehaviorDefinition = {
  key: RuleBehaviorKey;
  label: string;
  description?: string;
  defaultScope?: "entry" | "group" | "both";
};

type BehaviorPickerData = {
  targetDieIndex: number | null;
  targetDieSides: number | null;
  behaviors: QuickBehaviorPickerOption[];
  getDefinition: (behaviorKey: RuleBehaviorKey) => BehaviorDefinition | null;
  onSelectBehavior: (option: QuickBehaviorPickerOption) => void;
  onBack: () => void;
};

type PreparedRollEditSheetProps = {
  visible: boolean;
  title?: string;
  mode?: PreparedRollEditMode;
  nameValue?: string;
  onChangeNameValue?: (value: string) => void;
  dice: PreparedRollEditDie[];
  behaviorPickerData?: BehaviorPickerData;
  behaviorConfigPanel?: ReactNode;
  onClose: () => void;
  onBackFromBehaviorConfig?: () => void;
  onAdjustDieQty: (index: number, delta: number) => void;
  onAdjustDieModifier: (index: number, delta: number) => void;
  onToggleDieSign: (index: number) => void;
  onRemoveDie: (index: number) => void;
  onConfigureDieBehavior?: (index: number) => void;
  onClearDieBehavior?: (index: number) => void;
};

function formatModifier(modifier?: number) {
  const safeModifier = Number.isFinite(modifier) ? Number(modifier) : 0;

  if (safeModifier === 0) return "";

  return ` ${safeModifier > 0 ? "+" : "-"} ${Math.abs(safeModifier)}`;
}

function formatDieLabel(die: PreparedRollEditDie) {
  const sign = die.sign === -1 ? "- " : "";
  return `${sign}${die.qty}d${die.sides}${formatModifier(die.modifier)}`;
}

function getDieIcon(sides: number) {
  if (sides === 4) return "△";
  if (sides === 6) return "□";
  if (sides === 8) return "◇";
  if (sides === 10) return "⬟";
  if (sides === 12) return "⬢";
  if (sides === 20) return "✦";
  if (sides === 100) return "%";
  return "◈";
}

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

function getDiceSummary(dice: PreparedRollEditDie[]) {
  if (dice.length === 0) return "Aucun dé";

  return dice.map(formatDieLabel).join(" + ");
}

function getTotalDiceCount(dice: PreparedRollEditDie[]) {
  return dice.reduce((total, die) => total + Math.max(0, die.qty), 0);
}

function SheetPillButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "danger" | "accent";
}) {
  const premium = usePremiumTheme();

  const isDanger = variant === "danger";
  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 36,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: isDanger
          ? "rgba(239, 111, 145, 0.38)"
          : isAccent
            ? premium.colors.border.accent
            : premium.colors.border.subtle,
        borderRadius: premium.radius.pill,
        backgroundColor: isDanger
          ? premium.colors.state.failureSoft
          : isAccent
            ? premium.colors.accent.soft
            : pressed
              ? premium.colors.surface.pressed
              : premium.colors.surface.subtle,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      <Text
        numberOfLines={1}
        style={{
          color: isDanger
            ? premium.colors.state.failure
            : isAccent
              ? premium.colors.accent.primary
              : premium.colors.text.secondary,
          fontSize: 12,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function QuantityButton({
  label,
  onPress,
  tone = "default",
}: {
  label: string;
  onPress: () => void;
  tone?: "default" | "accent";
}) {
  const premium = usePremiumTheme();

  const isAccent = tone === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderWidth: 1,
        borderColor: isAccent
          ? premium.colors.border.accent
          : premium.colors.border.subtle,
        borderRadius: premium.radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isAccent
          ? premium.colors.accent.soft
          : pressed
            ? premium.colors.surface.pressed
            : premium.colors.surface.subtle,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <Text
        style={{
          color: isAccent
            ? premium.colors.accent.primary
            : premium.colors.text.primary,
          fontSize: 18,
          fontWeight: "900",
          lineHeight: 21,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        flex: 1,
        minHeight: 50,
        borderWidth: 1,
        borderColor: premium.colors.border.subtle,
        borderRadius: premium.radius.lg,
        backgroundColor: premium.colors.surface.subtle,
        paddingVertical: 9,
        paddingHorizontal: 11,
        justifyContent: "center",
        gap: 3,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: premium.colors.text.muted,
          fontSize: premium.typography.tiny,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
      >
        {label}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: premium.colors.text.primary,
          fontSize: 14,
          fontWeight: "900",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function PreparedDieRow({
  die,
  index,
  onAdjustDieQty,
  onAdjustDieModifier,
  onToggleDieSign,
  onRemoveDie,
  onConfigureDieBehavior,
  onClearDieBehavior,
}: {
  die: PreparedRollEditDie;
  index: number;
  onAdjustDieQty: (index: number, delta: number) => void;
  onAdjustDieModifier: (index: number, delta: number) => void;
  onToggleDieSign: (index: number) => void;
  onRemoveDie: (index: number) => void;
  onConfigureDieBehavior?: (index: number) => void;
  onClearDieBehavior?: (index: number) => void;
}) {
  const premium = usePremiumTheme();
  const hasBehavior = !!die.ruleLabel && die.ruleLabel !== "Somme simple";
  const modifier = die.modifier ?? 0;
  const isNegative = die.sign === -1;

  const signColor = isNegative
    ? premium.colors.state.failure
    : premium.colors.state.success;

  const modifierColor =
    modifier === 0
      ? premium.colors.text.secondary
      : modifier > 0
        ? premium.colors.accent.primary
        : premium.colors.state.failure;

  return (
    <View
      style={{
        borderRadius: premium.radius.xl,
        borderWidth: 1,
        borderColor: hasBehavior
          ? premium.colors.border.accent
          : premium.colors.border.subtle,
        backgroundColor: premium.colors.surface.elevated,
        padding: premium.spacing.md,
        gap: premium.spacing.sm,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -54,
          top: -70,
          width: 150,
          height: 150,
          borderRadius: 999,
          backgroundColor: hasBehavior
            ? premium.colors.accent.soft
            : premium.colors.surface.subtle,
          opacity: hasBehavior ? 0.65 : 0.52,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: premium.spacing.sm,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: premium.radius.lg,
            borderWidth: 1,
            borderColor: hasBehavior
              ? premium.colors.border.accent
              : premium.colors.border.subtle,
            backgroundColor: hasBehavior
              ? premium.colors.accent.soft
              : premium.colors.surface.subtle,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: hasBehavior
                ? premium.colors.accent.primary
                : premium.colors.text.primary,
              fontSize: 23,
              fontWeight: "900",
              lineHeight: 27,
            }}
          >
            {getDieIcon(die.sides)}
          </Text>
        </View>

        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: premium.colors.text.primary,
              fontSize: 18,
              fontWeight: "900",
              letterSpacing: -0.25,
              lineHeight: 22,
            }}
          >
            {formatDieLabel(die)}
          </Text>

          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: hasBehavior
                ? premium.colors.accent.primary
                : premium.colors.text.secondary,
              fontSize: 12,
              fontWeight: "800",
              lineHeight: 15,
            }}
          >
            {die.ruleLabel || "Somme simple"}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: premium.spacing.xs,
            alignItems: "center",
          }}
        >
          <QuantityButton label="−" onPress={() => onAdjustDieQty(index, -1)} />
          <QuantityButton
            label="+"
            tone="accent"
            onPress={() => onAdjustDieQty(index, 1)}
          />
        </View>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: premium.colors.border.subtle,
          opacity: 0.72,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          gap: premium.spacing.sm,
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: premium.radius.lg,
            borderWidth: 1,
            borderColor: premium.colors.border.subtle,
            backgroundColor: premium.colors.surface.subtle,
            padding: premium.spacing.sm,
            gap: 6,
          }}
        >
          <Text
            style={{
              color: premium.colors.text.muted,
              fontSize: premium.typography.tiny,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.7,
            }}
          >
            Signe
          </Text>

          <Pressable
            onPress={() => onToggleDieSign(index)}
            style={({ pressed }) => ({
              minHeight: 36,
              borderRadius: premium.radius.pill,
              borderWidth: 1,
              borderColor: isNegative
                ? "rgba(239, 111, 145, 0.38)"
                : "rgba(114, 220, 178, 0.34)",
              backgroundColor: isNegative
                ? premium.colors.state.failureSoft
                : "rgba(114, 220, 178, 0.1)",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.84 : 1,
              transform: [
                { scale: pressed ? premium.animation.pressScale : 1 },
              ],
            })}
          >
            <Text
              style={{
                color: signColor,
                fontSize: 12,
                fontWeight: "900",
              }}
            >
              {isNegative ? "Malus −" : "Bonus +"}
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            flex: 1,
            borderRadius: premium.radius.lg,
            borderWidth: 1,
            borderColor: premium.colors.border.subtle,
            backgroundColor: premium.colors.surface.subtle,
            padding: premium.spacing.sm,
            gap: 6,
          }}
        >
          <Text
            style={{
              color: premium.colors.text.muted,
              fontSize: premium.typography.tiny,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.7,
            }}
          >
            Modificateur
          </Text>

          <View
            style={{
              minHeight: 36,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: premium.spacing.xs,
            }}
          >
            <QuantityButton
              label="−"
              onPress={() => onAdjustDieModifier(index, -1)}
            />

            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                textAlign: "center",
                color: modifierColor,
                fontSize: 15,
                fontWeight: "900",
              }}
            >
              {modifier > 0 ? `+${modifier}` : `${modifier}`}
            </Text>

            <QuantityButton
              label="+"
              tone="accent"
              onPress={() => onAdjustDieModifier(index, 1)}
            />
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: premium.spacing.sm,
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        {onConfigureDieBehavior ? (
          <SheetPillButton
            label={hasBehavior ? "Changer comportement" : "Comportement"}
            onPress={() => onConfigureDieBehavior(index)}
            variant="accent"
          />
        ) : null}

        {hasBehavior && onClearDieBehavior ? (
          <SheetPillButton
            label="Somme simple"
            onPress={() => onClearDieBehavior(index)}
          />
        ) : null}

        <SheetPillButton
          label="Retirer"
          onPress={() => onRemoveDie(index)}
          variant="danger"
        />
      </View>
    </View>
  );
}

function SheetStepIndicator({ mode }: { mode: PreparedRollEditMode }) {
  const premium = usePremiumTheme();

  const steps: Array<{
    id: PreparedRollEditMode;
    label: string;
  }> = [
      { id: "dice", label: "Dés" },
      { id: "behavior_picker", label: "Comportement" },
      { id: "behavior_config", label: "Configuration" },
    ];

  return (
    <View
      style={{
        flexDirection: "row",
        gap: premium.spacing.xs,
      }}
    >
      {steps.map((step) => {
        const active = step.id === mode;

        return (
          <View
            key={step.id}
            style={{
              flex: 1,
              minHeight: 30,
              borderRadius: premium.radius.pill,
              borderWidth: 1,
              borderColor: active
                ? premium.colors.border.accent
                : premium.colors.border.subtle,
              backgroundColor: active
                ? premium.colors.accent.soft
                : premium.colors.surface.subtle,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 8,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: active
                  ? premium.colors.accent.primary
                  : premium.colors.text.muted,
                fontSize: 10,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.55,
              }}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function PreparedBehaviorPickerPanel({ data }: { data: BehaviorPickerData }) {
  const premium = usePremiumTheme();

  return (
    <View style={{ gap: premium.spacing.md }}>
      <View
        style={{
          borderRadius: premium.radius.xl,
          borderWidth: 1,
          borderColor: premium.colors.border.accent,
          backgroundColor: premium.colors.accent.soft,
          padding: premium.spacing.md,
          gap: premium.spacing.xs,
        }}
      >
        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: premium.typography.tiny,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Comportement du dé
        </Text>

        <Text
          style={{
            color: premium.colors.text.primary,
            fontSize: 18,
            fontWeight: "900",
          }}
        >
          Configurer d{data.targetDieSides ?? "?"}
        </Text>

        <Text
          style={{
            color: premium.colors.text.secondary,
            fontSize: 12,
            lineHeight: 17,
            fontWeight: "700",
          }}
        >
          Choisis comment cette ligne de dés doit être interprétée au moment du
          lancer.
        </Text>
      </View>

      <Pressable
        onPress={data.onBack}
        style={({ pressed }) => ({
          alignSelf: "flex-start",
          minHeight: 36,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor: premium.colors.border.subtle,
          backgroundColor: pressed
            ? premium.colors.surface.pressed
            : premium.colors.surface.subtle,
          opacity: pressed ? 0.84 : 1,
          transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
        })}
      >
        <Text
          style={{
            color: premium.colors.text.secondary,
            fontSize: 12,
            fontWeight: "900",
          }}
        >
          ← Retour aux dés
        </Text>
      </Pressable>

      {data.behaviors.length === 0 ? (
        <View
          style={{
            borderRadius: premium.radius.lg,
            borderWidth: 1,
            borderColor: premium.colors.border.subtle,
            backgroundColor: premium.colors.surface.subtle,
            padding: premium.spacing.md,
          }}
        >
          <Text
            style={{
              color: premium.colors.text.secondary,
              fontSize: 13,
              lineHeight: 18,
              fontWeight: "700",
            }}
          >
            Aucun comportement compatible avec ce dé.
          </Text>
        </View>
      ) : null}

      {data.behaviors.map((behavior) => {
        const definition = data.getDefinition(behavior.behaviorKey);
        if (!definition) return null;

        const label = behavior.label ?? definition.label;
        const description = behavior.description ?? definition.description;

        return (
          <Pressable
            key={behavior.optionId}
            onPress={() => data.onSelectBehavior(behavior)}
            disabled={!behavior.enabled}
            style={({ pressed }) => ({
              borderRadius: premium.radius.xl,
              borderWidth: 1,
              borderColor: behavior.enabled
                ? premium.colors.border.subtle
                : premium.colors.border.subtle,
              backgroundColor: pressed
                ? premium.colors.surface.pressed
                : premium.colors.surface.elevated,
              padding: premium.spacing.md,
              opacity: behavior.enabled ? (pressed ? 0.86 : 1) : 0.45,
              transform: [
                {
                  scale:
                    pressed && behavior.enabled
                      ? premium.animation.pressScale
                      : 1,
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
                backgroundColor: behavior.enabled
                  ? premium.colors.accent.soft
                  : premium.colors.surface.subtle,
                opacity: behavior.enabled ? 0.56 : 0.36,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: premium.spacing.sm,
              }}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: premium.radius.lg,
                  borderWidth: 1,
                  borderColor: behavior.enabled
                    ? premium.colors.border.accent
                    : premium.colors.border.subtle,
                  backgroundColor: behavior.enabled
                    ? premium.colors.accent.soft
                    : premium.colors.surface.subtle,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: behavior.enabled
                      ? premium.colors.accent.primary
                      : premium.colors.text.muted,
                    fontSize: 19,
                    fontWeight: "900",
                  }}
                >
                  {getBehaviorIcon(behavior.behaviorKey)}
                </Text>
              </View>

              <View style={{ flex: 1, gap: premium.spacing.xs }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: premium.spacing.sm,
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
                      borderRadius: premium.radius.pill,
                      borderWidth: 1,
                      borderColor: premium.colors.border.subtle,
                      backgroundColor: premium.colors.surface.subtle,
                    }}
                  >
                    <Text
                      style={{
                        color: premium.colors.text.muted,
                        fontSize: 9,
                        fontWeight: "900",
                        textTransform: "uppercase",
                      }}
                    >
                      {getScopeLabel(definition.defaultScope)}
                    </Text>
                  </View>
                </View>

                {description ? (
                  <Text
                    style={{
                      color: premium.colors.text.secondary,
                      fontSize: 12,
                      lineHeight: 17,
                      fontWeight: "700",
                    }}
                  >
                    {description}
                  </Text>
                ) : null}

                {!behavior.enabled ? (
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
      })}
    </View>
  );
}

export function PreparedRollEditSheet({
  visible,
  title = "Modifier le jet",
  mode = "dice",
  nameValue = "",
  onChangeNameValue,
  dice,
  behaviorPickerData,
  behaviorConfigPanel,
  onClose,
  onBackFromBehaviorConfig,
  onAdjustDieQty,
  onAdjustDieModifier,
  onRemoveDie,
  onToggleDieSign,
  onConfigureDieBehavior,
  onClearDieBehavior,
}: PreparedRollEditSheetProps) {
  const premium = usePremiumTheme();

  const diceSummary = useMemo(() => getDiceSummary(dice), [dice]);
  const totalDiceCount = useMemo(() => getTotalDiceCount(dice), [dice]);

  const subtitle =
    mode === "behavior_picker"
      ? "Choisis le comportement appliqué à cette ligne de dés."
      : mode === "behavior_config"
        ? "Ajuste les paramètres du comportement sélectionné."
        : "Ajuste chaque ligne sans reconstruire tout le jet.";

  return (
    <PremiumBottomSheet
      visible={visible}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      maxHeight="88%"
      footer={
        mode === "behavior_picker" && behaviorPickerData ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: premium.spacing.sm,
            }}
          >
            <Pressable
              onPress={behaviorPickerData.onBack}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 48,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: premium.colors.border.subtle,
                backgroundColor: pressed
                  ? premium.colors.surface.pressed
                  : premium.colors.surface.subtle,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.86 : 1,
                transform: [
                  {
                    scale: pressed ? premium.animation.pressScale : 1,
                  },
                ],
              })}
            >
              <Text
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                Retour aux dés
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 48,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: premium.colors.border.accent,
                backgroundColor: pressed
                  ? premium.colors.surface.pressed
                  : premium.colors.accent.soft,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.86 : 1,
                transform: [
                  {
                    scale: pressed ? premium.animation.pressScale : 1,
                  },
                ],
              })}
            >
              <Text
                style={{
                  color: premium.colors.accent.primary,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                Terminé
              </Text>
            </Pressable>
          </View>
        ) : mode === "behavior_config" && onBackFromBehaviorConfig ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: premium.spacing.sm,
            }}
          >
            <Pressable
              onPress={onBackFromBehaviorConfig}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 48,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: premium.colors.border.subtle,
                backgroundColor: pressed
                  ? premium.colors.surface.pressed
                  : premium.colors.surface.subtle,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.86 : 1,
                transform: [
                  {
                    scale: pressed ? premium.animation.pressScale : 1,
                  },
                ],
              })}
            >
              <Text
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                Retour
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 48,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: premium.colors.border.accent,
                backgroundColor: pressed
                  ? premium.colors.surface.pressed
                  : premium.colors.accent.soft,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.86 : 1,
                transform: [
                  {
                    scale: pressed ? premium.animation.pressScale : 1,
                  },
                ],
              })}
            >
              <Text
                style={{
                  color: premium.colors.accent.primary,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                Terminé
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              minHeight: 48,
              borderRadius: premium.radius.pill,
              borderWidth: 1,
              borderColor: premium.colors.border.accent,
              backgroundColor: pressed
                ? premium.colors.surface.pressed
                : premium.colors.accent.soft,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.86 : 1,
              transform: [
                {
                  scale: pressed ? premium.animation.pressScale : 1,
                },
              ],
            })}
          >
            <Text
              style={{
                color: premium.colors.accent.primary,
                fontSize: 15,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Terminé
            </Text>
          </Pressable>
        )
      }
    >
      <View style={{ gap: premium.spacing.md }}>
        <SheetStepIndicator mode={mode} />
        {mode === "dice" && onChangeNameValue ? (
          <View
            style={{
              borderRadius: premium.radius.lg,
              borderWidth: 1,
              borderColor: premium.colors.border.subtle,
              backgroundColor: premium.colors.surface.subtle,
              padding: premium.spacing.md,
              gap: premium.spacing.sm,
            }}
          >
            <Text
              style={{
                color: premium.colors.text.muted,
                fontSize: premium.typography.tiny,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Nom du jet
            </Text>

            <TextInput
              value={nameValue}
              onChangeText={onChangeNameValue}
              placeholder="Nom du jet"
              placeholderTextColor={premium.colors.text.muted}
              selectionColor={premium.colors.accent.primary}
              style={{
                minHeight: 48,
                color: premium.colors.text.primary,
                backgroundColor: premium.colors.background.primary,
                borderWidth: 1,
                borderColor: premium.colors.border.subtle,
                borderRadius: premium.radius.lg,
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontSize: 16,
                fontWeight: "800",
              }}
            />
          </View>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            gap: premium.spacing.sm,
          }}
        >
          <SummaryStat label="Composition" value={diceSummary} />
          <SummaryStat label="Total dés" value={`${totalDiceCount}`} />
        </View>

        <View
          style={{
            gap: premium.spacing.sm,
          }}
        >
          {mode === "behavior_picker" && behaviorPickerData ? (
            <PreparedBehaviorPickerPanel data={behaviorPickerData} />
          ) : mode === "behavior_config" ? (
            behaviorConfigPanel ?? (
              <View
                style={{
                  borderRadius: premium.radius.lg,
                  borderWidth: 1,
                  borderColor: premium.colors.border.accent,
                  backgroundColor: premium.colors.accent.soft,
                  padding: premium.spacing.md,
                  gap: premium.spacing.sm,
                }}
              >
                <Text
                  style={{
                    color: premium.colors.text.primary,
                    fontSize: 16,
                    fontWeight: "900",
                  }}
                >
                  Aucun panneau de configuration disponible.
                </Text>

                <Text
                  style={{
                    color: premium.colors.text.secondary,
                    fontSize: 13,
                    lineHeight: 18,
                    fontWeight: "700",
                  }}
                >
                  Aucun éditeur n’est disponible pour ce comportement.
                </Text>
              </View>
            )
          ) : dice.length === 0 ? (
            <View
              style={{
                borderRadius: premium.radius.lg,
                borderWidth: 1,
                borderColor: premium.colors.border.subtle,
                backgroundColor: premium.colors.surface.subtle,
                padding: premium.spacing.md,
                gap: premium.spacing.xs,
              }}
            >
              <Text
                style={{
                  color: premium.colors.text.primary,
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                Aucun dé à modifier
              </Text>

              <Text
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 13,
                  lineHeight: 18,
                  fontWeight: "700",
                }}
              >
                Ajoute d’abord un dé libre depuis l’écran Jet.
              </Text>
            </View>
          ) : (
            dice.map((die, index) => (
              <PreparedDieRow
                key={`prepared-die-${index}-${die.sides}-${die.qty}`}
                die={die}
                index={index}
                onAdjustDieQty={onAdjustDieQty}
                onAdjustDieModifier={onAdjustDieModifier}
                onToggleDieSign={onToggleDieSign}
                onRemoveDie={onRemoveDie}
                onConfigureDieBehavior={onConfigureDieBehavior}
                onClearDieBehavior={onClearDieBehavior}
              />
            ))
          )}
        </View>
      </View>
    </PremiumBottomSheet>
  );
}
