// dice-universal/features/tables/actionWizard/steps/ActionWizardStepSummary.tsx

import { Text, View } from "react-native";
import { buildActionWizardSummary } from "../helpers";
import type { ActionWizardDraft } from "../types";

import { useArcaneTheme } from "../../../../theme/ArcaneThemeProvider";

type Props = {
  draft: ActionWizardDraft;
};

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

function InfoLine({ label, value }: { label: string; value: string }) {
  const { theme } = useArcaneTheme();
  return (
    <View
      style={{
        gap: 3,
      }}
    >
      <Text
        style={{
          color: theme.colors.textSubtle,
          fontSize: 12,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: theme.colors.text,
          fontSize: 15,
          fontWeight: "800",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function formatDieLine(die: ActionWizardDraft["dice"][number]) {
  const sides = die.sides ?? "?";
  const modifier =
    die.modifier !== 0 ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}` : "";
  const sign = die.sign === -1 ? " en négatif" : "";

  return `${die.qty}d${sides}${modifier}${sign}`;
}

function getBehaviorLabel(value: ActionWizardDraft["behaviorType"]) {
  if (!value) return "—";

  switch (value) {
    case "single_check":
      return "Test avec seuil";
    case "threshold_degrees":
      return "Seuil avec degrés";
    case "success_pool":
      return "Pool de succès";
    case "sum_total":
      return "Somme totale";
    case "banded_sum":
      return "Résultat par paliers";
    case "table_lookup":
      return "Table / Intervalles";
    case "highest_of_pool":
      return "Meilleur dé du pool";
    case "lowest_of_pool":
      return "Plus faible dé du pool";
    case "keep_highest_n":
      return "Garder les meilleurs";
    case "keep_lowest_n":
      return "Garder les plus faibles";
    case "drop_highest_n":
      return "Retirer les meilleurs";
    case "drop_lowest_n":
      return "Retirer les plus faibles";
    case "custom_pipeline":
      return "Pipeline personnalisé";
    default:
      return String(value);
  }
}

export function ActionWizardStepSummary({ draft }: Props) {
  const { theme, styles } = useArcaneTheme();
  const dice = draft.dice.length > 0 ? draft.dice : [draft.die];

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={styles.sectionTitle}>Résumé</Text>

        <Text style={styles.muted}>
          Vérifie les informations avant de créer l’action.
        </Text>
      </View>

      <View
        style={{
          ...styles.cardSoft,
          gap: theme.spacing.md,
          borderColor: theme.colors.accent,
          backgroundColor: theme.colors.accentSoft,
        }}
      >
        <SectionLabel>Action prête à créer</SectionLabel>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: "900",
            lineHeight: 24,
          }}
        >
          {buildActionWizardSummary(draft)}
        </Text>
      </View>

      <View
        style={{
          ...styles.cardSoft,
          gap: theme.spacing.md,
        }}
      >
        <SectionLabel>Détails</SectionLabel>

        <InfoLine label="Nom" value={draft.name || "—"} />

        <InfoLine
          label="Type de comportement"
          value={getBehaviorLabel(draft.behaviorType)}
        />

        <InfoLine
          label="Mode de création"
          value={
            draft.creationMode === "advanced"
              ? "Règle personnalisée avancée"
              : draft.selectedRuleId
                ? "Règle existante réutilisée"
                : "Création automatique"
          }
        />
      </View>

      <View
        style={{
          ...styles.cardSoft,
          gap: theme.spacing.sm,
        }}
      >
        <SectionLabel>Dés</SectionLabel>

        {dice.map((die, index) => (
          <View
            key={`summary-die-${index}`}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surfaceAlt,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: "900",
              }}
            >
              {formatDieLine(die)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
