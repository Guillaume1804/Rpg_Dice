// dice-universal/features/roll/components/QuickQtyModal.tsx

import { View, Text, Pressable, TextInput } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

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
        fontWeight: "800",
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
      style={{
        color: theme.colors.text,
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 11,
        fontSize: 16,
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

  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: isAccent ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.pill,
        backgroundColor: isAccent
          ? theme.colors.accentSoft
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

  if (!visible) return null;

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
        padding: 20,
      }}
    >
      <View
        style={{
          ...styles.card,
          gap: theme.spacing.md,
          borderColor: theme.colors.accent,
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={styles.sectionTitle}>Modifier l’entrée</Text>

          <Text style={styles.muted}>
            Ajuste la quantité de dés et le modificateur appliqué à cette ligne.
          </Text>
        </View>

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

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
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
