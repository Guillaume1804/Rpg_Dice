import { Modal, View, Text, TextInput, Pressable } from "react-native";

type TableRenameModalProps = {
  visible: boolean;
  value: string;
  onChangeValue: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
};

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
          <Text style={{ fontSize: 16, fontWeight: "700" }}>
            Renommer la table
          </Text>

          <TextInput
            value={value}
            onChangeText={onChangeValue}
            placeholder="Nouveau nom..."
            style={{
              marginTop: 12,
              borderWidth: 1,
              borderRadius: 10,
              padding: 10,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 12,
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                padding: 10,
                borderWidth: 1,
                borderRadius: 10,
                marginRight: 10,
              }}
            >
              <Text>Annuler</Text>
            </Pressable>

            <Pressable
              onPress={onSubmit}
              style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
            >
              <Text style={{ fontWeight: "700" }}>Renommer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}