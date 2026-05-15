// dice-universal/features/roll/components/PreparedRollEditSheet.tsx

import { useMemo } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

export type PreparedRollEditDie = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  ruleLabel?: string | null;
};

type PreparedRollEditSheetProps = {
  visible: boolean;
  title?: string;
  dice: PreparedRollEditDie[];
  onClose: () => void;
  onAdjustDieQty: (index: number, delta: number) => void;
  onEditDie: (index: number) => void;
  onRemoveDie: (index: number) => void;
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

function PillButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "danger" | "accent";
}) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const borderColor =
    variant === "danger"
      ? theme.colors.failure
      : variant === "accent"
        ? theme.colors.accent
        : theme.colors.border;

  const backgroundColor =
    variant === "danger"
      ? theme.colors.failureSoft
      : variant === "accent"
        ? theme.colors.accentSoft
        : theme.colors.surfaceAlt;

  const textColor =
    variant === "danger"
      ? theme.colors.failure
      : variant === "accent"
        ? theme.colors.accent
        : theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 13,
        borderWidth: 1,
        borderColor,
        borderRadius: theme.radius.pill,
        backgroundColor: pressed ? theme.colors.surfaceSoft : backgroundColor,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        shadowColor: rollTheme.cockpit.glow,
        shadowOpacity: variant === "accent" ? 0.18 : 0,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: variant === "accent" ? 3 : 0,
      })}
    >
      <Text
        style={{
          color: textColor,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RoundButton({
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
        width: 42,
        height: 42,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: pressed
          ? theme.colors.surfaceSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 20,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PreparedRollEditSheet({
  visible,
  title = "Modifier le jet",
  dice,
  onClose,
  onAdjustDieQty,
  onEditDie,
  onRemoveDie,
}: PreparedRollEditSheetProps) {
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.68)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            maxHeight: "86%",
            backgroundColor: rollTheme.cockpit.panel,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderWidth: 1,
            borderColor: rollTheme.cockpit.border,
            padding: theme.spacing.md,
            gap: theme.spacing.md,
            overflow: "hidden",
            ...theme.shadow.card,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -70,
              right: -60,
              width: 180,
              height: 180,
              borderRadius: 999,
              backgroundColor: rollTheme.cockpit.glow,
              opacity: 0.16,
            }}
          />

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: -80,
              left: -70,
              width: 190,
              height: 190,
              borderRadius: 999,
              backgroundColor: rollTheme.cockpit.magicGlow,
              opacity: 0.12,
            }}
          />

          <View
            style={{
              alignSelf: "center",
              width: 52,
              height: 5,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.borderSoft,
              opacity: 0.9,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <Text
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: theme.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.9,
                }}
              >
                ✦ Jet préparé
              </Text>

              <Text style={styles.sectionTitle}>{title}</Text>

              <Text
                style={{
                  color: theme.colors.textMuted,
                  lineHeight: 20,
                  fontWeight: "600",
                }}
              >
                Ajuste une ligne de dés sans reconstruire tout le jet.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed
                  ? theme.colors.surfaceSoft
                  : theme.colors.surfaceAlt,
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 22,
                  fontWeight: "900",
                  lineHeight: 24,
                }}
              >
                ×
              </Text>
            </Pressable>
          </View>

          {dice.length === 0 ? (
            <View
              style={{
                ...styles.cardSoft,
                gap: theme.spacing.xs,
                backgroundColor: rollTheme.cockpit.panelAlt,
                borderColor: rollTheme.cockpit.borderSoft,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "900",
                }}
              >
                Aucun dé à modifier
              </Text>

              <Text style={styles.muted}>
                Ajoute d’abord un dé libre depuis l’écran Jet.
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{
                gap: theme.spacing.sm,
                paddingBottom: theme.spacing.md,
              }}
              showsVerticalScrollIndicator={false}
            >
              {dice.map((die, index) => (
                <View
                  key={`prepared-die-${index}-${die.sides}`}
                  style={{
                    ...styles.cardSoft,
                    gap: theme.spacing.md,
                    backgroundColor: rollTheme.cockpit.panelAlt,
                    borderColor: rollTheme.cockpit.borderSoft,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: theme.spacing.md,
                    }}
                  >
                    <View
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: theme.radius.lg,
                        borderWidth: 1,
                        borderColor: theme.colors.accent,
                        backgroundColor: theme.colors.accentSoft,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.accent,
                          fontSize: 26,
                          fontWeight: "900",
                          lineHeight: 30,
                        }}
                      >
                        {getDieIcon(die.sides)}
                      </Text>
                    </View>

                    <View style={{ flex: 1, gap: theme.spacing.xs }}>
                      <Text
                        style={{
                          color: theme.colors.text,
                          fontSize: 19,
                          fontWeight: "900",
                          letterSpacing: -0.2,
                        }}
                      >
                        {formatDieLabel(die)}
                      </Text>

                      <Text
                        style={{
                          color: theme.colors.textMuted,
                          lineHeight: 19,
                          fontWeight: "600",
                        }}
                      >
                        {die.ruleLabel || "Somme simple"}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      height: 1,
                      backgroundColor: rollTheme.cockpit.borderSoft,
                    }}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: theme.spacing.sm,
                      alignItems: "center",
                    }}
                  >
                    <RoundButton
                      label="−"
                      onPress={() => onAdjustDieQty(index, -1)}
                    />

                    <RoundButton
                      label="+"
                      onPress={() => onAdjustDieQty(index, 1)}
                    />

                    <PillButton
                      label="Réglages"
                      onPress={() => onEditDie(index)}
                      variant="accent"
                    />

                    <PillButton
                      label="Retirer"
                      onPress={() => onRemoveDie(index)}
                      variant="danger"
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
