// dice-universal/features/roll/components/RenameDraftGroupModal.tsx

import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

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

export function RenameDraftGroupModal({
  visible,
  value,
  onChangeValue,
  onCancel,
  onSave,
}: Props) {
  const { theme, styles } = useArcaneTheme();
  
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
            ...styles.card,
            gap: theme.spacing.md,
            borderColor: theme.colors.accent,
          }}
        >
          <View style={{ gap: theme.spacing.xs }}>
            <Text style={styles.sectionTitle}>Renommer le groupe</Text>

            <Text style={styles.muted}>
              Donne un nom lisible à ce groupe temporaire.
            </Text>
          </View>

          <TextInput
            value={value}
            onChangeText={onChangeValue}
            placeholder="Ex: Actions, Dégâts, Localisation..."
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

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: theme.spacing.sm,
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
