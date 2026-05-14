// dice-universal/features/tables/components/TableRenameModal.tsx

import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

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
  const { theme } = useArcaneTheme();

  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 11,
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

export function TableRenameModal({
  visible,
  value,
  onChangeValue,
  onClose,
  onSubmit,
}: TableRenameModalProps) {
  const { theme, styles } = useArcaneTheme();
  
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
          padding: theme.spacing.md,
        }}
      >
        <View
          style={{
            ...styles.card,
            gap: theme.spacing.md,
          }}
        >
          <View style={{ gap: theme.spacing.xs }}>
            <Text
              style={{
                color: theme.colors.textSubtle,
                fontSize: theme.typography.tiny,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Table
            </Text>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 22,
                fontWeight: "900",
              }}
            >
              Renommer la table
            </Text>

            <Text style={styles.muted}>
              Choisis un nom clair pour retrouver rapidement cette table dans
              l’onglet Tables et sur l’écran Jet.
            </Text>
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: "800",
              }}
            >
              Nouveau nom
            </Text>

            <TextInput
              value={value}
              onChangeText={onChangeValue}
              placeholder="Ex: Campagne principale"
              placeholderTextColor={theme.colors.textMuted}
              selectionColor={theme.colors.accent}
              style={{
                minHeight: 48,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: theme.colors.surfaceAlt,
                color: theme.colors.text,
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
              gap: theme.spacing.sm,
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
