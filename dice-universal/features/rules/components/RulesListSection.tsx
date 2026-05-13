// dice-universal/features/rules/components/RulesListSection.tsx

import { View, Text, Pressable, ScrollView } from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

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

function PillButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent" | "danger";
}) {
  const borderColor =
    variant === "accent"
      ? arcane.colors.accent
      : variant === "danger"
        ? arcane.colors.failure
        : arcane.colors.border;

  const backgroundColor =
    variant === "accent"
      ? arcane.colors.accentSoft
      : variant === "danger"
        ? arcane.colors.failureSoft
        : arcane.colors.surfaceAlt;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor,
        borderRadius: arcane.radius.pill,
        backgroundColor,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
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
  const borderColor =
    variant === "system"
      ? arcane.colors.border
      : variant === "custom"
        ? arcane.colors.accent
        : variant === "pipeline"
          ? arcane.colors.warning
          : arcane.colors.border;

  const backgroundColor =
    variant === "custom"
      ? arcane.colors.accentSoft
      : variant === "pipeline"
        ? arcane.colors.warningSoft
        : arcane.colors.surfaceAlt;

  return (
    <View
      style={{
        paddingVertical: 5,
        paddingHorizontal: 9,
        borderWidth: 1,
        borderColor,
        borderRadius: arcane.radius.pill,
        backgroundColor,
      }}
    >
      <Text
        style={{
          color: arcane.colors.textMuted,
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

  return (
    <View
      style={{
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.sm,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: arcane.spacing.sm,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: arcane.colors.text,
              fontSize: 17,
              fontWeight: "900",
            }}
          >
            {rule.name}
          </Text>

          <Text
            style={{
              color: arcane.colors.textMuted,
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
          gap: arcane.spacing.sm,
          marginTop: arcane.spacing.xs,
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
  return (
    <View
      style={{
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.xs,
      }}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontWeight: "900",
        }}
      >
        Rien à afficher
      </Text>

      <Text style={arcaneStyles.muted}>{text}</Text>
    </View>
  );
}

export function RulesListSection({
  systemRules,
  customRules,
  onEditRule,
  onDeleteRule,
}: Props) {
  return (
    <ScrollView
      contentContainerStyle={{
        gap: arcane.spacing.md,
        paddingBottom: arcane.spacing.xl,
      }}
      showsVerticalScrollIndicator
    >
      <View style={{ gap: arcane.spacing.sm }}>
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

      <View style={{ gap: arcane.spacing.sm }}>
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
