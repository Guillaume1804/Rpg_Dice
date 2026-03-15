// app/rules/components/RulesEditorFooter.tsx
import { View, Pressable, Text } from "react-native";

type RulesEditorFooterProps = {
  onClose: () => void;
  onSave: () => void | Promise<void>;
};

export function RulesEditorFooter({
  onClose,
  onSave,
}: RulesEditorFooterProps) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
      <Pressable
        onPress={onClose}
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
  );
}