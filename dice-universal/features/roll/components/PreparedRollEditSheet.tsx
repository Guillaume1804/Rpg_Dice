// dice-universal/features/roll/components/PreparedRollEditSheet.tsx

import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

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
  const borderColor =
    variant === "danger"
      ? arcane.colors.failure
      : variant === "accent"
        ? arcane.colors.accent
        : arcane.colors.border;

  const backgroundColor =
    variant === "danger"
      ? arcane.colors.failureSoft
      : variant === "accent"
        ? arcane.colors.accentSoft
        : arcane.colors.surfaceAlt;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor,
        borderRadius: arcane.radius.pill,
        backgroundColor,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 42,
        height: 42,
        borderWidth: 1,
        borderColor: arcane.colors.border,
        borderRadius: arcane.radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: arcane.colors.surfaceAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
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
            backgroundColor: arcane.colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderWidth: 1,
            borderColor: arcane.colors.border,
            padding: arcane.spacing.md,
            gap: arcane.spacing.md,
            ...arcane.shadow.card,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: arcane.spacing.md,
            }}
          >
            <View style={{ flex: 1, gap: arcane.spacing.xs }}>
              <Text style={arcaneStyles.sectionTitle}>{title}</Text>

              <Text style={arcaneStyles.muted}>
                Ajuste une ligne de dés sans reconstruire tout le jet.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderWidth: 1,
                borderColor: arcane.colors.border,
                borderRadius: arcane.radius.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: arcane.colors.surfaceAlt,
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <Text
                style={{
                  color: arcane.colors.text,
                  fontSize: 20,
                  fontWeight: "900",
                }}
              >
                ×
              </Text>
            </Pressable>
          </View>

          {dice.length === 0 ? (
            <View style={arcaneStyles.cardSoft}>
              <Text
                style={{
                  color: arcane.colors.text,
                  fontWeight: "900",
                }}
              >
                Aucun dé à modifier
              </Text>

              <Text
                style={[arcaneStyles.muted, { marginTop: arcane.spacing.xs }]}
              >
                Ajoute d’abord un dé libre depuis l’écran Jet.
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{
                gap: arcane.spacing.sm,
                paddingBottom: arcane.spacing.md,
              }}
              showsVerticalScrollIndicator={false}
            >
              {dice.map((die, index) => (
                <View
                  key={`prepared-die-${index}-${die.sides}`}
                  style={{
                    ...arcaneStyles.cardSoft,
                    gap: arcane.spacing.sm,
                  }}
                >
                  <View style={{ gap: arcane.spacing.xs }}>
                    <Text
                      style={{
                        color: arcane.colors.text,
                        fontSize: 18,
                        fontWeight: "900",
                      }}
                    >
                      {formatDieLabel(die)}
                    </Text>

                    <Text
                      style={{
                        color: arcane.colors.textMuted,
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
                      gap: arcane.spacing.sm,
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
