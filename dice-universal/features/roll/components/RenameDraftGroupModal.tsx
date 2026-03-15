import { Modal, Pressable, Text, TextInput, View } from "react-native";

type Props = {
  visible: boolean;
  value: string;
  onChangeValue: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function RenameDraftGroupModal({
  visible,
  value,
  onChangeValue,
  onCancel,
  onSave,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
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
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Renommer le groupe draft</Text>

          <TextInput
            value={value}
            onChangeText={onChangeValue}
            placeholder="Ex: Actions, Dégâts, Localisation..."
            style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, padding: 10 }}
          />

          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
            <Pressable
              onPress={onCancel}
              style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
            >
              <Text>Annuler</Text>
            </Pressable>

            <Pressable
              onPress={onSave}
              style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
            >
              <Text style={{ fontWeight: "700" }}>Sauvegarder</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}