// dice-universal/features/tables/components/TableProfileModals.tsx

import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

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
  return (
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
            {label}
          </Text>

          <Text
            style={{
              color: arcane.colors.text,
              fontSize: 22,
              fontWeight: "900",
            }}
          >
            {title}
          </Text>

          <Text style={arcaneStyles.muted}>{description}</Text>
        </View>

        <View style={{ gap: arcane.spacing.xs }}>
          <Text
            style={{
              color: arcane.colors.text,
              fontWeight: "800",
            }}
          >
            Nom du profil
          </Text>

          <TextInput
            value={inputValue}
            onChangeText={onChangeInput}
            placeholder={inputPlaceholder}
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
