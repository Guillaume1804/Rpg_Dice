// dice-universal/features/roll/components/QuickQtyModal.tsx

import { View, Text, Pressable, TextInput } from "react-native";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

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
  return (
    <Text
      style={{
        color: arcane.colors.textMuted,
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
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={arcane.colors.textSubtle}
      style={{
        color: arcane.colors.text,
        backgroundColor: arcane.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: arcane.colors.border,
        borderRadius: arcane.radius.md,
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
  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: isAccent ? arcane.colors.accent : arcane.colors.border,
        borderRadius: arcane.radius.pill,
        backgroundColor: isAccent
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
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

export function QuickQtyModal({
  visible,
  qtyValue,
  modifierValue,
  onChangeQtyValue,
  onChangeModifierValue,
  onClose,
  onSave,
}: Props) {
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
          ...arcaneStyles.card,
          gap: arcane.spacing.md,
          borderColor: arcane.colors.accent,
        }}
      >
        <View style={{ gap: arcane.spacing.xs }}>
          <Text style={arcaneStyles.sectionTitle}>Modifier l’entrée</Text>

          <Text style={arcaneStyles.muted}>
            Ajuste la quantité de dés et le modificateur appliqué à cette ligne.
          </Text>
        </View>

        <View style={{ gap: arcane.spacing.sm }}>
          <FieldLabel>Quantité</FieldLabel>
          <ModalInput
            value={qtyValue}
            onChangeText={onChangeQtyValue}
            keyboardType="number-pad"
            placeholder="Ex: 3"
          />
        </View>

        <View style={{ gap: arcane.spacing.sm }}>
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
            gap: arcane.spacing.sm,
          }}
        >
          <ModalButton label="Annuler" onPress={onClose} />
          <ModalButton label="Valider" onPress={onSave} variant="accent" />
        </View>
      </View>
    </View>
  );
}
