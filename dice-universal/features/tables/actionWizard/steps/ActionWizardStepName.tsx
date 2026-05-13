// dice-universal/features/tables/actionWizard/steps/ActionWizardStepName.tsx

import { Text, TextInput, View } from "react-native";

import { arcane } from "../../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../../theme/arcaneStyles";

type Props = {
  value: string;
  onChangeValue: (value: string) => void;
};

export function ActionWizardStepName({ value, onChangeValue }: Props) {
  return (
    <View style={{ gap: arcane.spacing.md }}>
      <View style={{ gap: arcane.spacing.xs }}>
        <Text style={arcaneStyles.sectionTitle}>Nom de l’action</Text>

        <Text style={arcaneStyles.muted}>
          Donne un nom clair à cette action. Il apparaîtra ensuite dans le
          profil et dans l’écran Jet.
        </Text>
      </View>

      <View style={{ gap: arcane.spacing.xs }}>
        <Text
          style={{
            color: arcane.colors.text,
            fontWeight: "800",
          }}
        >
          Nom
        </Text>

        <TextInput
          value={value}
          onChangeText={onChangeValue}
          placeholder="Ex: Attaque, Esquive, Dégâts..."
          placeholderTextColor={arcane.colors.textSubtle}
          selectionColor={arcane.colors.accent}
          style={{
            minHeight: 48,
            borderWidth: 1,
            borderColor: arcane.colors.border,
            borderRadius: arcane.radius.md,
            paddingHorizontal: 12,
            paddingVertical: 11,
            backgroundColor: arcane.colors.surfaceAlt,
            color: arcane.colors.text,
            fontSize: 16,
            fontWeight: "700",
          }}
        />
      </View>
    </View>
  );
}
