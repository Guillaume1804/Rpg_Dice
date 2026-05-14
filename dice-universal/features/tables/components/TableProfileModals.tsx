// dice-universal/features/tables/components/TableProfileModals.tsx

import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

type Props = {
  showCreateProfileModal: boolean;
  newProfileName: string;
  onChangeNewProfileName: (value: string) => void;
  onCloseCreateProfileModal: () => void;
  onSubmitCreateProfile: () => void | Promise<void>;

  showRenameProfileModal: boolean;
  renameProfileValue: string;
  onChangeRenameProfileValue: (value: string) => void;
  onCloseRenameProfileModal: () => void;
  onSubmitRenameProfile: () => void | Promise<void>;
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

function ProfileModalShell({
  label,
  title,
  description,
  inputValue,
  inputPlaceholder,
  onChangeInput,
  onClose,
  onSubmit,
  submitLabel,
}: {
  label: string;
  title: string;
  description: string;
  inputValue: string;
  inputPlaceholder: string;
  onChangeInput: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  submitLabel: string;
}) {
  const { theme, styles } = useArcaneTheme();
  
  return (
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
            {label}
          </Text>

          <Text
            style={{
              color: theme.colors.text,
              fontSize: 22,
              fontWeight: "900",
            }}
          >
            {title}
          </Text>

          <Text style={styles.muted}>{description}</Text>
        </View>

        <View style={{ gap: theme.spacing.xs }}>
          <Text
            style={{
              color: theme.colors.text,
              fontWeight: "800",
            }}
          >
            Nom du profil
          </Text>

          <TextInput
            value={inputValue}
            onChangeText={onChangeInput}
            placeholder={inputPlaceholder}
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

          <ModalButton
            label={submitLabel}
            onPress={onSubmit}
            variant="accent"
          />
        </View>
      </View>
    </View>
  );
}

export function TableProfileModals({
  showCreateProfileModal,
  newProfileName,
  onChangeNewProfileName,
  onCloseCreateProfileModal,
  onSubmitCreateProfile,
  showRenameProfileModal,
  renameProfileValue,
  onChangeRenameProfileValue,
  onCloseRenameProfileModal,
  onSubmitRenameProfile,
}: Props) {
  return (
    <>
      <Modal
        visible={showCreateProfileModal}
        transparent
        animationType="fade"
        onRequestClose={onCloseCreateProfileModal}
      >
        <ProfileModalShell
          label="Profil"
          title="Créer un profil"
          description="Un profil représente un personnage, une créature, un PNJ ou un ensemble d’actions sauvegardées dans cette table."
          inputValue={newProfileName}
          inputPlaceholder="Ex: Guerrier, Mage, Samouraï..."
          onChangeInput={onChangeNewProfileName}
          onClose={onCloseCreateProfileModal}
          onSubmit={onSubmitCreateProfile}
          submitLabel="Créer"
        />
      </Modal>

      <Modal
        visible={showRenameProfileModal}
        transparent
        animationType="fade"
        onRequestClose={onCloseRenameProfileModal}
      >
        <ProfileModalShell
          label="Profil"
          title="Renommer le profil"
          description="Choisis un nom clair pour retrouver facilement ce profil dans la table et depuis l’écran Jet."
          inputValue={renameProfileValue}
          inputPlaceholder="Nouveau nom du profil..."
          onChangeInput={onChangeRenameProfileValue}
          onClose={onCloseRenameProfileModal}
          onSubmit={onSubmitRenameProfile}
          submitLabel="Renommer"
        />
      </Modal>
    </>
  );
}
