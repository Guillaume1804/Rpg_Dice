// dice-universal/features/tables/actionWizard/steps/ActionWizardStepRuleChoice.tsx

import { Pressable, Text, View } from "react-native";
import type { RuleRow } from "../../../../data/repositories/rulesRepo";

import { arcane } from "../../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../../theme/arcaneStyles";

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
  return (
    <Text
      style={{
        color: arcane.colors.textSubtle,
        fontSize: arcane.typography.tiny,
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
  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.xs,
        borderColor: selected
          ? arcane.colors.accent
          : isAccent
            ? arcane.colors.accent
            : arcane.colors.border,
        backgroundColor: selected
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontSize: 16,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: arcane.colors.textMuted,
          lineHeight: 19,
        }}
      >
        {subtitle}
      </Text>

      <Text
        style={{
          marginTop: 2,
          color: selected ? arcane.colors.accent : arcane.colors.textSubtle,
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
  const recommendedRule = rules.length > 0 ? rules[0] : null;
  const alternativeRules = rules.slice(1);

  return (
    <View style={{ gap: arcane.spacing.md }}>
      <View style={{ gap: arcane.spacing.xs }}>
        <Text style={arcaneStyles.sectionTitle}>Logique de l’action</Text>

        <Text style={arcaneStyles.muted}>
          L’application cherche si une règle existante peut être réutilisée. Tu
          peux aussi générer une nouvelle règle automatiquement.
        </Text>
      </View>

      {recommendedRule ? (
        <>
          <View style={{ gap: arcane.spacing.sm }}>
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
            <View style={{ gap: arcane.spacing.sm }}>
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
        <View style={arcaneStyles.cardSoft}>
          <Text
            style={{
              color: arcane.colors.text,
              fontWeight: "900",
            }}
          >
            Aucune logique existante trouvée
          </Text>

          <Text
            style={[
              arcaneStyles.muted,
              {
                marginTop: arcane.spacing.xs,
              },
            ]}
          >
            Cette action ne correspond à aucune règle déjà enregistrée pour ce
            type de dé et ce comportement.
          </Text>
        </View>
      )}

      <View style={{ gap: arcane.spacing.sm }}>
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
