// dice-universal/features/roll/components/PreparedRollEditSheet.tsx

import { useMemo, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import type { QuickBehaviorPickerOption } from "../hooks/useQuickDieBehaviorPicker";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

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
  const { theme } = useArcaneTheme();

  const borderColor =
    variant === "danger"
      ? "rgba(255, 92, 122, 0.78)"
      : variant === "accent"
        ? "rgba(217, 160, 55, 0.78)"
        : "rgba(145, 113, 255, 0.22)";

  const backgroundColor =
    variant === "danger"
      ? "rgba(255, 92, 122, 0.1)"
      : variant === "accent"
        ? "rgba(217, 160, 55, 0.13)"
        : "rgba(32, 41, 88, 0.52)";

  const textColor =
    variant === "danger"
      ? theme.colors.failure
      : variant === "accent"
        ? theme.colors.accent
        : theme.colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 34,
        paddingVertical: 7,
        paddingHorizontal: 11,
        borderWidth: 1,
        borderColor,
        borderRadius: theme.radius.pill,
        backgroundColor,
        opacity: pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      <Text
        numberOfLines={1}
        style={{
          color: textColor,
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
}: {
  label: string;
  onPress: () => void;
}) {
  const { theme } = useArcaneTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 34,
        height: 34,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.24)",
        borderRadius: theme.radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: pressed
          ? "rgba(32, 41, 88, 0.76)"
          : "rgba(18, 23, 58, 0.74)",
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
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
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        flex: 1,
        minHeight: 48,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.18)",
        borderRadius: 16,
        backgroundColor: "rgba(18, 23, 58, 0.56)",
        paddingVertical: 8,
        paddingHorizontal: 10,
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: theme.colors.textSubtle,
          fontSize: 9,
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
          color: theme.colors.text,
          fontSize: 15,
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
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);
  const hasBehavior = !!die.ruleLabel && die.ruleLabel !== "Somme simple";

  return (
    <View
      style={{
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.2)",
        backgroundColor: "rgba(18, 23, 58, 0.68)",
        padding: 11,
        gap: 10,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -46,
          top: -60,
          width: 138,
          height: 138,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.magicGlow,
          opacity: 0.09,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 17,
            borderWidth: 1,
            borderColor: "rgba(217, 160, 55, 0.78)",
            backgroundColor: "rgba(217, 160, 55, 0.13)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: theme.colors.accent,
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
              color: theme.colors.text,
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
              color: theme.colors.textMuted,
              fontSize: 12,
              fontWeight: "700",
              lineHeight: 15,
            }}
          >
            {die.ruleLabel || "Somme simple"}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 7,
            alignItems: "center",
          }}
        >
          <QuantityButton label="−" onPress={() => onAdjustDieQty(index, -1)} />

          <QuantityButton label="+" onPress={() => onAdjustDieQty(index, 1)} />
        </View>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "rgba(145, 113, 255, 0.14)",
        }}
      />

      <View
        style={{
          gap: 9,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <View style={{ gap: 3 }}>
            <Text
              style={{
                color: theme.colors.textSubtle,
                fontSize: 9,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}
            >
              Signe de la ligne
            </Text>

            <Text
              style={{
                color:
                  die.sign === -1 ? theme.colors.failure : theme.colors.success,
                fontSize: 15,
                fontWeight: "900",
              }}
            >
              {die.sign === -1 ? "Malus (-)" : "Bonus (+)"}
            </Text>
          </View>

          <Pressable
            onPress={() => onToggleDieSign(index)}
            style={({ pressed }) => ({
              minHeight: 34,
              paddingVertical: 7,
              paddingHorizontal: 11,
              borderWidth: 1,
              borderColor:
                die.sign === -1
                  ? "rgba(255, 92, 122, 0.78)"
                  : "rgba(80, 220, 160, 0.68)",
              borderRadius: theme.radius.pill,
              backgroundColor:
                die.sign === -1
                  ? "rgba(255, 92, 122, 0.1)"
                  : "rgba(80, 220, 160, 0.1)",
              opacity: pressed ? 0.82 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <Text
              style={{
                color:
                  die.sign === -1 ? theme.colors.failure : theme.colors.success,
                fontSize: 12,
                fontWeight: "900",
              }}
            >
              Basculer + / -
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <View style={{ gap: 3 }}>
            <Text
              style={{
                color: theme.colors.textSubtle,
                fontSize: 9,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}
            >
              Modificateur
            </Text>

            <Text
              style={{
                color:
                  (die.modifier ?? 0) === 0
                    ? theme.colors.textMuted
                    : (die.modifier ?? 0) > 0
                      ? theme.colors.accent
                      : theme.colors.failure,
                fontSize: 15,
                fontWeight: "900",
              }}
            >
              {(die.modifier ?? 0) > 0
                ? `+${die.modifier}`
                : `${die.modifier ?? 0}`}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 7,
              alignItems: "center",
            }}
          >
            <QuantityButton
              label="−"
              onPress={() => onAdjustDieModifier(index, -1)}
            />

            <QuantityButton
              label="+"
              onPress={() => onAdjustDieModifier(index, 1)}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 8,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {onConfigureDieBehavior ? (
            <SheetPillButton
              label="Comportement"
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
    </View>
  );
}

function PreparedBehaviorPickerPanel({ data }: { data: BehaviorPickerData }) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  return (
    <View style={{ gap: 10 }}>
      <View
        style={{
          borderRadius: 22,
          borderWidth: 1,
          borderColor: "rgba(217, 160, 55, 0.34)",
          backgroundColor: "rgba(217, 160, 55, 0.08)",
          padding: 12,
          gap: 5,
        }}
      >
        <Text
          style={{
            color: theme.colors.textSubtle,
            fontSize: 10,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          ✦ Comportement du dé
        </Text>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: "900",
          }}
        >
          Configurer d{data.targetDieSides ?? "?"}
        </Text>

        <Text
          style={{
            color: theme.colors.textMuted,
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
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: "rgba(145, 113, 255, 0.24)",
          backgroundColor: pressed
            ? "rgba(32, 41, 88, 0.78)"
            : "rgba(18, 23, 58, 0.72)",
          opacity: pressed ? 0.84 : 1,
        })}
      >
        <Text
          style={{
            color: theme.colors.textMuted,
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
            borderRadius: 22,
            borderWidth: 1,
            borderColor: "rgba(145, 113, 255, 0.2)",
            backgroundColor: "rgba(18, 23, 58, 0.66)",
            padding: 14,
          }}
        >
          <Text
            style={{
              color: theme.colors.textMuted,
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
              borderRadius: 22,
              borderWidth: 1,
              borderColor: behavior.enabled
                ? "rgba(145, 113, 255, 0.26)"
                : "rgba(145, 113, 255, 0.12)",
              backgroundColor: pressed
                ? "rgba(32, 41, 88, 0.82)"
                : "rgba(18, 23, 58, 0.68)",
              padding: 12,
              opacity: behavior.enabled ? (pressed ? 0.86 : 1) : 0.45,
              transform: [{ scale: pressed && behavior.enabled ? 0.985 : 1 }],
              gap: 8,
              overflow: "hidden",
            })}
          >
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                right: -48,
                top: -58,
                width: 136,
                height: 136,
                borderRadius: 999,
                backgroundColor: rollTheme.cockpit.magicGlow,
                opacity: 0.08,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: behavior.enabled
                    ? "rgba(217, 160, 55, 0.72)"
                    : "rgba(145, 113, 255, 0.16)",
                  backgroundColor: behavior.enabled
                    ? "rgba(217, 160, 55, 0.12)"
                    : "rgba(32, 41, 88, 0.42)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: behavior.enabled
                      ? theme.colors.accent
                      : theme.colors.textSubtle,
                    fontSize: 19,
                    fontWeight: "900",
                  }}
                >
                  {getBehaviorIcon(behavior.behaviorKey)}
                </Text>
              </View>

              <View style={{ flex: 1, gap: 4 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      color: theme.colors.text,
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
                      borderRadius: theme.radius.pill,
                      borderWidth: 1,
                      borderColor: "rgba(145, 113, 255, 0.18)",
                      backgroundColor: "rgba(32, 41, 88, 0.46)",
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.textMuted,
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
                      color: theme.colors.textMuted,
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
                      color: theme.colors.textSubtle,
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
  onAdjustDieQty,
  onAdjustDieModifier,
  onRemoveDie,
  onToggleDieSign,
  onConfigureDieBehavior,
  onClearDieBehavior,
}: PreparedRollEditSheetProps) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const diceSummary = useMemo(() => getDiceSummary(dice), [dice]);
  const totalDiceCount = useMemo(() => getTotalDiceCount(dice), [dice]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.68)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        <View
          style={{
            maxHeight: "84%",
            backgroundColor: "rgba(8, 12, 31, 0.98)",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderWidth: 1,
            borderColor: "rgba(145, 113, 255, 0.28)",
            paddingTop: 10,
            paddingHorizontal: 14,
            paddingBottom: 14,
            gap: 12,
            overflow: "hidden",
            ...theme.shadow.card,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -78,
              right: -70,
              width: 190,
              height: 190,
              borderRadius: 999,
              backgroundColor: rollTheme.cockpit.magicGlow,
              opacity: 0.15,
            }}
          />

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: -92,
              left: -76,
              width: 210,
              height: 210,
              borderRadius: 999,
              backgroundColor: rollTheme.cockpit.glow,
              opacity: 0.11,
            }}
          />

          <View
            style={{
              alignSelf: "center",
              width: 52,
              height: 5,
              borderRadius: theme.radius.pill,
              backgroundColor: "rgba(145, 113, 255, 0.34)",
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 3 }}>
              <Text
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: 10,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.85,
                }}
              >
                ✦ Jet préparé
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.text,
                  fontSize: 22,
                  fontWeight: "900",
                  letterSpacing: -0.4,
                  lineHeight: 27,
                }}
              >
                {title}
              </Text>

              <Text
                numberOfLines={2}
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 12,
                  lineHeight: 16,
                  fontWeight: "700",
                }}
              >
                Ajuste chaque ligne sans reconstruire tout le jet.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderWidth: 1,
                borderColor: "rgba(145, 113, 255, 0.22)",
                borderRadius: theme.radius.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed
                  ? "rgba(32, 41, 88, 0.78)"
                  : "rgba(18, 23, 58, 0.76)",
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 21,
                  fontWeight: "900",
                  lineHeight: 23,
                }}
              >
                ×
              </Text>
            </Pressable>
          </View>

          {mode === "dice" && onChangeNameValue ? (
            <View
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(145, 113, 255, 0.2)",
                backgroundColor: "rgba(18, 23, 58, 0.62)",
                padding: 11,
                gap: 7,
              }}
            >
              <Text
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: 9,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.75,
                }}
              >
                Nom du jet
              </Text>

              <TextInput
                value={nameValue}
                onChangeText={onChangeNameValue}
                placeholder="Nom du jet"
                placeholderTextColor={theme.colors.textSubtle}
                selectionColor={theme.colors.accent}
                style={{
                  minHeight: 44,
                  color: theme.colors.text,
                  backgroundColor: "rgba(8, 12, 31, 0.68)",
                  borderWidth: 1,
                  borderColor: "rgba(145, 113, 255, 0.18)",
                  borderRadius: theme.radius.lg,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  fontSize: 16,
                  fontWeight: "800",
                }}
              />
            </View>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              gap: 8,
            }}
          >
            <SummaryStat label="Composition" value={diceSummary} />

            <SummaryStat label="Total dés" value={`${totalDiceCount}`} />
          </View>

          <ScrollView
            contentContainerStyle={{
              gap: 9,
              paddingBottom: 4,
            }}
            showsVerticalScrollIndicator={false}
          >
            {mode === "behavior_picker" && behaviorPickerData ? (
              <PreparedBehaviorPickerPanel data={behaviorPickerData} />
            ) : mode === "behavior_config" ? (
              (behaviorConfigPanel ?? (
                <View
                  style={{
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: "rgba(217, 160, 55, 0.34)",
                    backgroundColor: "rgba(217, 160, 55, 0.08)",
                    padding: 14,
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 16,
                      fontWeight: "900",
                    }}
                  >
                    Aucun panneau de configuration disponible.
                  </Text>
                </View>
              ))
            ) : dice.length === 0 ? (
              <View
                style={{
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: "rgba(145, 113, 255, 0.2)",
                  backgroundColor: "rgba(18, 23, 58, 0.66)",
                  padding: 14,
                  gap: 5,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 16,
                    fontWeight: "900",
                  }}
                >
                  Aucun dé à modifier
                </Text>

                <Text
                  style={{
                    color: theme.colors.textMuted,
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
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              height: 48,
              borderRadius: theme.radius.pill,
              borderWidth: 1,
              borderColor: "rgba(217, 160, 55, 0.7)",
              backgroundColor: pressed
                ? "rgba(217, 160, 55, 0.2)"
                : "rgba(217, 160, 55, 0.13)",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.86 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            })}
          >
            <Text
              style={{
                color: theme.colors.accent,
                fontSize: 15,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Terminé
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
