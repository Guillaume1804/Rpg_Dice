// dice-universal/features/tables/actionWizard/steps/ActionWizardStepDice.tsx

import { Pressable, Text, TextInput, View } from "react-native";
import type { ActionDieDraft } from "../types";

import { useArcaneTheme } from "../../../../theme/ArcaneThemeProvider";

type Props = {
  dice: ActionDieDraft[];
  onChangeDie: <K extends keyof ActionDieDraft>(
    index: number,
    key: K,
    value: ActionDieDraft[K],
  ) => void;
  onAddDie: () => void;
  onRemoveDie: (index: number) => void;

  /**
   * Compat temporaire si un appel ancien passe encore par `die`.
   */
  fallbackDie?: ActionDieDraft;
  onChangeFallbackDie?: <K extends keyof ActionDieDraft>(
    key: K,
    value: ActionDieDraft[K],
  ) => void;
};

const STANDARD_DICE = [4, 6, 8, 10, 12, 20, 100];

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toNumberOrFallback(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getSafeDice(dice: ActionDieDraft[], fallbackDie?: ActionDieDraft) {
  if (dice.length > 0) return dice;

  if (fallbackDie) return [fallbackDie];

  return [
    {
      sides: null,
      qty: 1,
      modifier: 0,
      sign: 1 as const,
    },
  ];
}

function FieldLabel({ children }: { children: string }) {
  const { theme } = useArcaneTheme();
  return (
    <Text
      style={{
        color: theme.colors.textMuted,
        fontWeight: "800",
      }}
    >
      {children}
    </Text>
  );
}

function BoxInput({
  value,
  onChangeText,
  placeholder,
  keyboardType = "numeric",
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "numeric" | "numbers-and-punctuation";
}) {
  const { theme } = useArcaneTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSubtle}
      selectionColor={theme.colors.accent}
      keyboardType={keyboardType}
      style={{
        minHeight: 48,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 11,
        backgroundColor: theme.colors.surfaceAlt,
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: "700",
      }}
    />
  );
}

function ChoiceButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useArcaneTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: 52,
        minHeight: 44,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: selected
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.84 : selected ? 1 : 0.78,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StandardDieButton({
  sides,
  selected,
  onPress,
}: {
  sides: number;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useArcaneTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: 64,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.lg,
        alignItems: "center",
        backgroundColor: selected
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.84 : selected ? 1 : 0.82,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: "900",
        }}
      >
        d{sides}
      </Text>
    </Pressable>
  );
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
        paddingHorizontal: 14,
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

function formatDiePreview(die: ActionDieDraft) {
  return `${die.qty}d${die.sides ?? "?"}${
    die.modifier !== 0 ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}` : ""
  }${die.sign === -1 ? " en négatif" : ""}`;
}

export function ActionWizardStepDice({
  dice,
  onChangeDie,
  onAddDie,
  onRemoveDie,
  fallbackDie,
  onChangeFallbackDie,
}: Props) {
  const safeDice = getSafeDice(dice, fallbackDie);

  const { theme, styles } = useArcaneTheme();

  function updateDie<K extends keyof ActionDieDraft>(
    index: number,
    key: K,
    value: ActionDieDraft[K],
  ) {
    if (dice.length === 0 && index === 0 && onChangeFallbackDie) {
      onChangeFallbackDie(key, value);
      return;
    }

    onChangeDie(index, key, value);
  }

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={styles.sectionTitle}>Dés utilisés</Text>

        <Text style={styles.muted}>
          Configure une ou plusieurs lignes de dés pour cette action.
        </Text>
      </View>

      {safeDice.map((die, index) => (
        <View
          key={`action-die-${index}`}
          style={{
            ...styles.cardSoft,
            gap: theme.spacing.md,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: theme.spacing.sm,
            }}
          >
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 17,
                  fontWeight: "900",
                }}
              >
                Dé {index + 1}
              </Text>

              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontWeight: "700",
                }}
              >
                {formatDiePreview(die)}
              </Text>
            </View>

            {safeDice.length > 1 ? (
              <PillButton
                label="Supprimer"
                onPress={() => onRemoveDie(index)}
                variant="danger"
              />
            ) : null}
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <FieldLabel>Dés standards</FieldLabel>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {STANDARD_DICE.map((sides) => (
                <StandardDieButton
                  key={`${index}-${sides}`}
                  sides={sides}
                  selected={die.sides === sides}
                  onPress={() => updateDie(index, "sides", sides)}
                />
              ))}
            </View>
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <FieldLabel>Faces du dé</FieldLabel>

            <BoxInput
              value={die.sides == null ? "" : String(die.sides)}
              onChangeText={(value) =>
                updateDie(index, "sides", toNumberOrNull(value))
              }
              placeholder="Ex: 6"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <FieldLabel>Quantité</FieldLabel>

            <BoxInput
              value={String(die.qty)}
              onChangeText={(value) =>
                updateDie(index, "qty", toNumberOrFallback(value, 1))
              }
              placeholder="1"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <FieldLabel>Modificateur</FieldLabel>

            <BoxInput
              value={String(die.modifier)}
              onChangeText={(value) =>
                updateDie(index, "modifier", toNumberOrFallback(value, 0))
              }
              placeholder="0"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <FieldLabel>Signe</FieldLabel>

            <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <ChoiceButton
                label="+"
                selected={die.sign === 1}
                onPress={() => updateDie(index, "sign", 1)}
              />

              <ChoiceButton
                label="−"
                selected={die.sign === -1}
                onPress={() => updateDie(index, "sign", -1)}
              />
            </View>
          </View>
        </View>
      ))}

      <PillButton label="+ Ajouter un dé" onPress={onAddDie} variant="accent" />
    </View>
  );
}
