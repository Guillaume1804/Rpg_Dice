// dice-universal/features/tables/actionWizard/steps/ActionWizardStepRuleChoice.tsx

import { Pressable, Text, View } from "react-native";
import type { RuleRow } from "../../../../data/repositories/rulesRepo";

import { useArcaneTheme } from "../../../../theme/ArcaneThemeProvider";

type Props = {
  rules: RuleRow[];
  selectedRuleId: string | null;
  creationMode: "auto" | "advanced";
  onSelectRule: (ruleId: string | null) => void;
  onSelectCreationMode: (mode: "auto" | "advanced") => void;
};

function getRuleOriginLabel(rule: RuleRow) {
  if (rule.table_id) {
    return "Règle locale de cette table";
  }

  if (rule.is_system === 1) {
    return "Règle système";
  }

  return "Règle personnalisée globale";
}

function SectionLabel({ children }: { children: string }) {
  const { theme } = useArcaneTheme();

  return (
    <Text
      style={{
        color: theme.colors.textSubtle,
        fontSize: theme.typography.tiny,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}
    >
      {children}
    </Text>
  );
}

function RuleCard({
  title,
  subtitle,
  footer,
  selected,
  onPress,
  variant = "default",
}: {
  title: string;
  subtitle: string;
  footer: string;
  selected: boolean;
  onPress: () => void;
  variant?: "default" | "accent";
}) {
  const { theme, styles } = useArcaneTheme();
  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...styles.cardSoft,
        gap: theme.spacing.xs,
        borderColor: selected
          ? theme.colors.accent
          : isAccent
            ? theme.colors.accent
            : theme.colors.border,
        backgroundColor: selected
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: theme.colors.textMuted,
          lineHeight: 19,
        }}
      >
        {subtitle}
      </Text>

      <Text
        style={{
          marginTop: 2,
          color: selected ? theme.colors.accent : theme.colors.textSubtle,
          fontWeight: "900",
        }}
      >
        {footer}
      </Text>
    </Pressable>
  );
}

export function ActionWizardStepRuleChoice({
  rules,
  selectedRuleId,
  creationMode,
  onSelectRule,
  onSelectCreationMode,
}: Props) {
  const { theme, styles } = useArcaneTheme();
  const recommendedRule = rules.length > 0 ? rules[0] : null;
  const alternativeRules = rules.slice(1);

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={styles.sectionTitle}>Logique de l’action</Text>

        <Text style={styles.muted}>
          L’application cherche si une règle existante peut être réutilisée. Tu
          peux aussi générer une nouvelle règle automatiquement.
        </Text>
      </View>

      {recommendedRule ? (
        <>
          <View style={{ gap: theme.spacing.sm }}>
            <SectionLabel>Suggestion recommandée</SectionLabel>

            <RuleCard
              title={recommendedRule.name}
              subtitle={getRuleOriginLabel(recommendedRule)}
              footer={
                selectedRuleId === recommendedRule.id && creationMode === "auto"
                  ? "Sélectionnée"
                  : "Utiliser cette logique"
              }
              selected={
                selectedRuleId === recommendedRule.id && creationMode === "auto"
              }
              variant="accent"
              onPress={() => {
                onSelectRule(recommendedRule.id);
                onSelectCreationMode("auto");
              }}
            />
          </View>

          {alternativeRules.length > 0 ? (
            <View style={{ gap: theme.spacing.sm }}>
              <SectionLabel>Autres logiques compatibles</SectionLabel>

              {alternativeRules.map((rule) => {
                const selected =
                  selectedRuleId === rule.id && creationMode === "auto";

                return (
                  <RuleCard
                    key={rule.id}
                    title={rule.name}
                    subtitle={getRuleOriginLabel(rule)}
                    footer={
                      selected ? "Sélectionnée" : "Utiliser cette logique"
                    }
                    selected={selected}
                    onPress={() => {
                      onSelectRule(rule.id);
                      onSelectCreationMode("auto");
                    }}
                  />
                );
              })}
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.cardSoft}>
          <Text
            style={{
              color: theme.colors.text,
              fontWeight: "900",
            }}
          >
            Aucune logique existante trouvée
          </Text>

          <Text
            style={[
              styles.muted,
              {
                marginTop: theme.spacing.xs,
              },
            ]}
          >
            Cette action ne correspond à aucune règle déjà enregistrée pour ce
            type de dé et ce comportement.
          </Text>
        </View>
      )}

      <View style={{ gap: theme.spacing.sm }}>
        <SectionLabel>Créer une nouvelle règle</SectionLabel>

        <RuleCard
          title="Création automatique"
          subtitle="Une règle sera générée automatiquement à partir de ta configuration."
          footer={
            selectedRuleId === null && creationMode === "auto"
              ? "Sélectionnée"
              : "Utiliser ce mode"
          }
          selected={selectedRuleId === null && creationMode === "auto"}
          variant="accent"
          onPress={() => {
            onSelectRule(null);
            onSelectCreationMode("auto");
          }}
        />

        <RuleCard
          title="Créer une règle personnalisée"
          subtitle="Ouvre l’éditeur complet pour concevoir une règle sur mesure."
          footer={
            creationMode === "advanced" ? "Sélectionnée" : "Utiliser ce mode"
          }
          selected={creationMode === "advanced"}
          onPress={() => {
            onSelectRule(null);
            onSelectCreationMode("advanced");
          }}
        />
      </View>
    </View>
  );
}
