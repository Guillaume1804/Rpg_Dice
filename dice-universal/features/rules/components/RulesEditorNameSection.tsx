import { View, Text, TextInput } from "react-native";

type Props = {
  formName: string;
  onChangeFormName: (value: string) => void;
};

export function RulesEditorNameSection({
  formName,
  onChangeFormName,
}: Props) {
  return (
    <View>
      <Text>Nom</Text>
      <TextInput
        value={formName}
        onChangeText={onChangeFormName}
        placeholder="Ex: D100 Localisation"
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
          marginTop: 6,
        }}
      />
    </View>
  );
}