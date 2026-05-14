// dice-universal/features/tables/actionWizard/steps/ActionWizardStepName.tsx

import { Text, TextInput, View } from "react-native";

import { useArcaneTheme } from "../../../../theme/ArcaneThemeProvider";

type Props = {
  value: string;
  onChangeValue: (value: string) => void;
};

export function ActionWizardStepName({ value, onChangeValue }: Props) {
  const { theme, styles } = useArcaneTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={styles.sectionTitle}>Nom de l’action</Text>

        <Text style={styles.muted}>
          Donne un nom clair à cette action. Il apparaîtra ensuite dans le
          profil et dans l’écran Jet.
        </Text>
      </View>

      <View style={{ gap: theme.spacing.xs }}>
        <Text
          style={{
            color: theme.colors.text,
            fontWeight: "800",
          }}
        >
          Nom
        </Text>

        <TextInput
          value={value}
          onChangeText={onChangeValue}
          placeholder="Ex: Attaque, Esquive, Dégâts..."
          placeholderTextColor={theme.colors.textSubtle}
          selectionColor={theme.colors.accent}
          style={{
            minHeight: 48,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            paddingHorizontal: 12,
            paddingVertical: 11,
            backgroundColor: theme.colors.surfaceAlt,
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: "700",
          }}
        />
      </View>
    </View>
  );
}
