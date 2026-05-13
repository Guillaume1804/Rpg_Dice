// dice-universal/features/roll/components/RenameDraftGroupModal.tsx

import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

type Props = {
  visible: boolean;
  value: string;
  onChangeValue: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

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

export function RenameDraftGroupModal({
  visible,
  value,
  onChangeValue,
  onCancel,
  onSave,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.64)",
          justifyContent: "center",
          padding: 16,
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
            <Text style={arcaneStyles.sectionTitle}>Renommer le groupe</Text>

            <Text style={arcaneStyles.muted}>
              Donne un nom lisible à ce groupe temporaire.
            </Text>
          </View>

          <TextInput
            value={value}
            onChangeText={onChangeValue}
            placeholder="Ex: Actions, Dégâts, Localisation..."
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

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: arcane.spacing.sm,
            }}
          >
            <ModalButton label="Annuler" onPress={onCancel} />
            <ModalButton
              label="Sauvegarder"
              onPress={onSave}
              variant="accent"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
