// dice-universal/features/rules/components/RulesListSection.tsx

import { View, Text, Pressable, ScrollView } from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";


type Props = {
  systemRules: RuleRow[];
  customRules: RuleRow[];
  onEditRule: (rule: RuleRow) => void;
  onDeleteRule: (ruleId: string) => Promise<void>;
};

function getRuleKindLabel(kind: string) {
  switch (kind) {
    case "sum":
      return "Somme";
    case "single_check":
      return "Test avec seuil";
    case "success_pool":
      return "Pool de succès";
    case "banded_sum":
      return "Somme par paliers";
    case "table_lookup":
      return "Table d’intervalles";
    case "highest_of_pool":
      return "Meilleur dé";
    case "lowest_of_pool":
      return "Plus faible dé";
    case "keep_highest_n":
      return "Garder les meilleurs";
    case "keep_lowest_n":
      return "Garder les plus faibles";
    case "drop_highest_n":
      return "Retirer les meilleurs";
    case "drop_lowest_n":
      return "Retirer les plus faibles";
    case "pipeline":
      return "Pipeline personnalisé";
    default:
      return kind;
  }
}



function getScopeLabel(scope: RuleRow["scope"]) {
  if (scope === "entry") return "Entrée";
  if (scope === "group") return "Groupe";
  return "Les deux";
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

function PillButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent" | "danger";
}) {
  const { theme } = useArcaneTheme();

  const borderColor =
    variant === "accent"
      ? theme.colors.accent
      : variant === "danger"
        ? theme.colors.failure
        : theme.colors.border;

  const backgroundColor =
    variant === "accent"
      ? theme.colors.accentSoft
      : variant === "danger"
        ? theme.colors.failureSoft
        : theme.colors.surfaceAlt;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor,
        borderRadius: theme.radius.pill,
        backgroundColor,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RuleBadge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "system" | "custom" | "pipeline";
}) {
  const { theme } = useArcaneTheme();
  
  const borderColor =
    variant === "system"
      ? theme.colors.border
      : variant === "custom"
        ? theme.colors.accent
        : variant === "pipeline"
          ? theme.colors.warning
          : theme.colors.border;

  const backgroundColor =
    variant === "custom"
      ? theme.colors.accentSoft
      : variant === "pipeline"
        ? theme.colors.warningSoft
        : theme.colors.surfaceAlt;

  return (
    <View
      style={{
        paddingVertical: 5,
        paddingHorizontal: 9,
        borderWidth: 1,
        borderColor,
        borderRadius: theme.radius.pill,
        backgroundColor,
      }}
    >
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: 12,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function RuleCard({
  rule,
  origin,
  onEditRule,
  onDeleteRule,
}: {
  rule: RuleRow;
  origin: "system" | "custom";
  onEditRule: (rule: RuleRow) => void;
  onDeleteRule?: (ruleId: string) => Promise<void>;
}) {
  const isSystem = origin === "system";
  const isPipeline = rule.kind === "pipeline";

  const { theme, styles } = useArcaneTheme();

  return (
    <View
      style={{
        ...styles.cardSoft,
        gap: theme.spacing.sm,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: theme.spacing.sm,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 17,
              fontWeight: "900",
            }}
          >
            {rule.name}
          </Text>

          <Text
            style={{
              color: theme.colors.textMuted,
              fontWeight: "700",
            }}
          >
            {getRuleKindLabel(rule.kind)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            gap: 6,
          }}
        >
          <RuleBadge
            label={isSystem ? "Système" : "Perso"}
            variant={isSystem ? "system" : "custom"}
          />

          {isPipeline ? (
            <RuleBadge label="Pipeline" variant="pipeline" />
          ) : null}
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <RuleBadge label={`Portée : ${getScopeLabel(rule.scope)}`} />

        {rule.supported_sides_json ? (
          <RuleBadge label="Dés configurés" />
        ) : (
          <RuleBadge label="Tous dés" />
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.spacing.sm,
          marginTop: theme.spacing.xs,
        }}
      >
        <PillButton
          label={isSystem ? "Voir" : "Éditer"}
          onPress={() => onEditRule(rule)}
          variant={isSystem ? "default" : "accent"}
        />

        {!isSystem && onDeleteRule ? (
          <PillButton
            label="Supprimer"
            onPress={() => {
              void onDeleteRule(rule.id);
            }}
            variant="danger"
          />
        ) : null}
      </View>
    </View>
  );
}

function EmptyCard({ text }: { text: string }) {
  const { theme, styles } = useArcaneTheme();
  return (
    <View
      style={{
        ...styles.cardSoft,
        gap: theme.spacing.xs,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: "900",
        }}
      >
        Rien à afficher
      </Text>

      <Text style={styles.muted}>{text}</Text>
    </View>
  );
}

export function RulesListSection({
  systemRules,
  customRules,
  onEditRule,
  onDeleteRule,
}: Props) {

  const { theme } = useArcaneTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        gap: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
      }}
      showsVerticalScrollIndicator
    >
      <View style={{ gap: theme.spacing.sm }}>
        <SectionLabel>Règles système</SectionLabel>

        {systemRules.length === 0 ? (
          <EmptyCard text="Aucune règle système disponible." />
        ) : (
          systemRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              origin="system"
              onEditRule={onEditRule}
            />
          ))
        )}
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <SectionLabel>Règles personnalisées</SectionLabel>

        {customRules.length === 0 ? (
          <EmptyCard text="Aucune règle personnalisée pour le moment. Utilise la création guidée ou l’éditeur avancé pour en ajouter une." />
        ) : (
          customRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              origin="custom"
              onEditRule={onEditRule}
              onDeleteRule={onDeleteRule}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
