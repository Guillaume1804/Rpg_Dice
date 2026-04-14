import { Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeValue: (value: string) => void;
};

export function ActionWizardStepName({
  value,
  onChangeValue,
}: Props) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>
        Nom de l’action
      </Text>

      <Text style={{ opacity: 0.72 }}>
        Donne un nom clair à cette action.
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeValue}
        placeholder="Ex: Attaque, Esquive, Dégâts..."
        style={{
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
          fontSize: 16,
        }}
      />
    </View>
  );
}