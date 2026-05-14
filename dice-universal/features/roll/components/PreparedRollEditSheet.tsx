// dice-universal/features/roll/components/PreparedRollEditSheet.tsx

import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

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

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor,
        borderRadius: theme.radius.pill,
        backgroundColor,
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
        backgroundColor: theme.colors.surfaceAlt,
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
          backgroundColor: "rgba(0,0,0,0.64)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            maxHeight: "84%",
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: theme.spacing.md,
            gap: theme.spacing.md,
            ...theme.shadow.card,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <Text style={styles.sectionTitle}>{title}</Text>

              <Text style={styles.muted}>
                Ajuste une ligne de dés sans reconstruire tout le jet.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.surfaceAlt,
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 20,
                  fontWeight: "900",
                }}
              >
                ×
              </Text>
            </Pressable>
          </View>

          {dice.length === 0 ? (
            <View style={styles.cardSoft}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "900",
                }}
              >
                Aucun dé à modifier
              </Text>

              <Text style={[styles.muted, { marginTop: theme.spacing.xs }]}>
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
                    gap: theme.spacing.sm,
                  }}
                >
                  <View style={{ gap: theme.spacing.xs }}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontSize: 18,
                        fontWeight: "900",
                      }}
                    >
                      {formatDieLabel(die)}
                    </Text>

                    <Text
                      style={{
                        color: theme.colors.textMuted,
                        lineHeight: 19,
                      }}
                    >
                      {die.ruleLabel || "Somme simple"}
                    </Text>
                  </View>

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
