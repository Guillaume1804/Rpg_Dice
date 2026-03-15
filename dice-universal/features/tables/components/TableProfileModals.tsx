import { View, Text, Pressable, TextInput, Modal } from "react-native";

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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Créer un profil</Text>

            <TextInput
              value={newProfileName}
              onChangeText={onChangeNewProfileName}
              placeholder="Ex: Guerrier, Mage, Samouraï..."
              style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, padding: 10 }}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <Pressable
                onPress={onCloseCreateProfileModal}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={onSubmitCreateProfile}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text style={{ fontWeight: "700" }}>Créer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRenameProfileModal}
        transparent
        animationType="fade"
        onRequestClose={onCloseRenameProfileModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Renommer le profil</Text>

            <TextInput
              value={renameProfileValue}
              onChangeText={onChangeRenameProfileValue}
              placeholder="Nouveau nom du profil..."
              style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, padding: 10 }}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <Pressable
                onPress={onCloseRenameProfileModal}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={onSubmitRenameProfile}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text style={{ fontWeight: "700" }}>Renommer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}