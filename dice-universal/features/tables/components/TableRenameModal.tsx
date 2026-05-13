// dice-universal/features/tables/components/TableRenameModal.tsx

import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

type TableRenameModalProps = {
  visible: boolean;
  value: string;
  onChangeValue: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
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
        paddingVertical: 11,
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

export function TableRenameModal({
  visible,
  value,
  onChangeValue,
  onClose,
  onSubmit,
}: TableRenameModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.68)",
          justifyContent: "center",
          padding: arcane.spacing.md,
        }}
      >
        <View
          style={{
            ...arcaneStyles.card,
            gap: arcane.spacing.md,
          }}
        >
          <View style={{ gap: arcane.spacing.xs }}>
            <Text
              style={{
                color: arcane.colors.textSubtle,
                fontSize: arcane.typography.tiny,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Table
            </Text>

            <Text
              style={{
                color: arcane.colors.text,
                fontSize: 22,
                fontWeight: "900",
              }}
            >
              Renommer la table
            </Text>

            <Text style={arcaneStyles.muted}>
              Choisis un nom clair pour retrouver rapidement cette table dans
              l’onglet Tables et sur l’écran Jet.
            </Text>
          </View>

          <View style={{ gap: arcane.spacing.xs }}>
            <Text
              style={{
                color: arcane.colors.text,
                fontWeight: "800",
              }}
            >
              Nouveau nom
            </Text>

            <TextInput
              value={value}
              onChangeText={onChangeValue}
              placeholder="Ex: Campagne principale"
              placeholderTextColor={arcane.colors.textMuted}
              selectionColor={arcane.colors.accent}
              style={{
                minHeight: 48,
                borderWidth: 1,
                borderColor: arcane.colors.border,
                borderRadius: arcane.radius.md,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: arcane.colors.surfaceAlt,
                color: arcane.colors.text,
                fontSize: 16,
                fontWeight: "700",
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              gap: arcane.spacing.sm,
            }}
          >
            <ModalButton label="Annuler" onPress={onClose} />
            <ModalButton label="Renommer" onPress={onSubmit} variant="accent" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
