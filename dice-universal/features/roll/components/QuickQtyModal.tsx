// dice-universal/features/roll/components/QuickQtyModal.tsx

import { useMemo } from "react";
import { View, Text, Pressable, TextInput } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

type Props = {
  visible: boolean;
  qtyValue: string;
  modifierValue: string;
  onChangeQtyValue: (value: string) => void;
  onChangeModifierValue: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

function FieldLabel({ children }: { children: string }) {
  const { theme } = useArcaneTheme();

  return (
    <Text
      style={{
        color: theme.colors.textMuted,
        fontWeight: "900",
      }}
    >
      {children}
    </Text>
  );
}

function ModalInput({
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType: "number-pad" | "numbers-and-punctuation";
}) {
  const { theme } = useArcaneTheme();

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSubtle}
      selectionColor={theme.colors.accent}
      style={{
        minHeight: 52,
        color: theme.colors.text,
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 18,
        fontWeight: "900",
      }}
    />
  );
}

function ModalButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent";
}) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: isAccent ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.pill,
        backgroundColor: isAccent
          ? pressed
            ? theme.colors.surfaceSoft
            : theme.colors.accentSoft
          : pressed
            ? theme.colors.surfaceSoft
            : theme.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        shadowColor: rollTheme.cockpit.glow,
        shadowOpacity: isAccent ? 0.2 : 0,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 },
        elevation: isAccent ? 3 : 0,
      })}
    >
      <Text
        style={{
          color: isAccent ? theme.colors.accent : theme.colors.text,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function QuickQtyModal({
  visible,
  qtyValue,
  modifierValue,
  onChangeQtyValue,
  onChangeModifierValue,
  onClose,
  onSave,
}: Props) {
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  if (!visible) return null;

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
        padding: 20,
      }}
    >
      <View
        style={{
          ...styles.card,
          gap: theme.spacing.md,
          borderColor: theme.colors.accent,
          backgroundColor: rollTheme.cockpit.panel,
          borderRadius: rollTheme.layout.cockpitRadius,
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
            ✦ Entrée de dés
          </Text>

          <Text style={styles.sectionTitle}>Modifier l’entrée</Text>

          <Text
            style={{
              color: theme.colors.textMuted,
              lineHeight: 20,
              fontWeight: "600",
            }}
          >
            Ajuste la quantité de dés et le modificateur appliqué à cette ligne.
          </Text>
        </View>

        <View
          style={{
            ...styles.cardSoft,
            gap: theme.spacing.md,
            backgroundColor: rollTheme.cockpit.panelAlt,
            borderColor: rollTheme.cockpit.borderSoft,
          }}
        >
          <View style={{ gap: theme.spacing.sm }}>
            <FieldLabel>Quantité</FieldLabel>

            <ModalInput
              value={qtyValue}
              onChangeText={onChangeQtyValue}
              keyboardType="number-pad"
              placeholder="Ex: 3"
            />
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <FieldLabel>Modificateur</FieldLabel>

            <ModalInput
              value={modifierValue}
              onChangeText={onChangeModifierValue}
              keyboardType="numbers-and-punctuation"
              placeholder="Ex: +2 ou -1"
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: theme.spacing.sm,
          }}
        >
          <ModalButton label="Annuler" onPress={onClose} />
          <ModalButton label="Valider" onPress={onSave} variant="accent" />
        </View>
      </View>
    </View>
  );
}
