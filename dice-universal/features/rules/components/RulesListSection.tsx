import { View, Text, Pressable, ScrollView } from "react-native";
import {
  parseSupportedSides,
  type RuleRow,
} from "../../../data/repositories/rulesRepo";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

type Props = {
  systemRules: RuleRow[];
  customRules: RuleRow[];
  onEditRule: (rule: RuleRow) => void;
  onDeleteRule: (ruleId: string) => Promise<void>;
};

function getRuleKindLabel(kind: string) {
  switch (kind) {
    case "sum":
      return "Somme simple";
    case "single_check":
      return "Test avec seuil";
    case "threshold_degrees":
      return "Seuil avec degrés";
    case "success_pool":
      return "Pool de succès";
    case "banded_sum":
      return "Résultat par paliers";
    case "table_lookup":
      return "Table / Paliers";
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

function getRuleKindDescription(kind: string) {
  switch (kind) {
    case "sum":
      return "Additionne les dés et les modificateurs. C’est le comportement standard le plus simple.";
    case "single_check":
      return "Compare le résultat à un seuil pour déterminer une réussite, un échec ou un critique.";
    case "threshold_degrees":
      return "Compare un d100 à une cible et calcule des degrés selon la marge obtenue.";
    case "success_pool":
      return "Compte les dés qui atteignent un seuil de réussite et peut détecter complications ou critiques.";
    case "banded_sum":
      return "Additionne le résultat puis associe le total à un palier défini.";
    case "table_lookup":
      return "Utilise une valeur pour lire un résultat dans une table de plages.";
    case "highest_of_pool":
      return "Lance plusieurs dés et conserve uniquement le meilleur résultat.";
    case "lowest_of_pool":
      return "Lance plusieurs dés et conserve uniquement le plus faible résultat.";
    case "keep_highest_n":
      return "Garde un nombre défini des meilleurs dés du lancer.";
    case "keep_lowest_n":
      return "Garde un nombre défini des plus faibles dés du lancer.";
    case "drop_highest_n":
      return "Retire un nombre défini des meilleurs dés avant le calcul.";
    case "drop_lowest_n":
      return "Retire un nombre défini des plus faibles dés avant le calcul.";
    case "pipeline":
      return "Combine plusieurs étapes avancées : relances, explosions, succès, paliers, complications ou degrés.";
    default:
      return "Comportement personnalisé.";
  }
}

function getRuleKindFamily(kind: string) {
  switch (kind) {
    case "sum":
      return "Standard";
    case "single_check":
      return "Seuil";
    case "threshold_degrees":
      return "Degrés";
    case "success_pool":
      return "Pool";
    case "highest_of_pool":
    case "lowest_of_pool":
    case "keep_highest_n":
    case "keep_lowest_n":
    case "drop_highest_n":
    case "drop_lowest_n":
      return "Garder / retirer";
    case "table_lookup":
    case "banded_sum":
      return "Paliers";
    case "pipeline":
      return "Avancé";
    default:
      return "Comportement";
  }
}

function getRuleKindIcon(kind: string) {
  switch (kind) {
    case "sum":
      return "+";
    case "single_check":
      return "≥";
    case "threshold_degrees":
      return "%";
    case "success_pool":
      return "●";
    case "table_lookup":
    case "banded_sum":
      return "≡";
    case "highest_of_pool":
    case "lowest_of_pool":
    case "keep_highest_n":
    case "keep_lowest_n":
    case "drop_highest_n":
    case "drop_lowest_n":
      return "◇";
    case "pipeline":
      return "✦";
    default:
      return "•";
  }
}

function getScopeLabel(scope: RuleRow["scope"]) {
  if (scope === "entry") return "Entrée";
  if (scope === "group") return "Groupe";
  return "Entrée ou groupe";
}

function getSupportedSidesLabel(rule: RuleRow) {
  const sides = parseSupportedSides(rule);

  if (sides.length === 0) {
    return "Tous les dés";
  }

  return sides.map((side) => `d${side}`).join(", ");
}

function LibrarySectionHeader({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count: number;
}) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            color: premium.colors.text.primary,
            fontSize: 16,
            fontWeight: "900",
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 11,
            fontWeight: "700",
            lineHeight: 16,
          }}
        >
          {description}
        </Text>
      </View>

      <View
        style={{
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.075)",
          backgroundColor: "rgba(255,255,255,0.045)",
          paddingHorizontal: 9,
          paddingVertical: 5,
        }}
      >
        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 10,
            fontWeight: "900",
          }}
        >
          {count}
        </Text>
      </View>
    </View>
  );
}

function BehaviorBadge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "accent" | "system" | "custom" | "warning";
}) {
  const premium = usePremiumTheme();

  const borderColor =
    variant === "accent"
      ? "rgba(232, 200, 120, 0.28)"
      : variant === "warning"
        ? "rgba(255, 190, 105, 0.24)"
        : variant === "custom"
          ? "rgba(124, 92, 255, 0.28)"
          : "rgba(255,255,255,0.075)";

  const backgroundColor =
    variant === "accent"
      ? "rgba(232, 200, 120, 0.09)"
      : variant === "warning"
        ? "rgba(255, 190, 105, 0.08)"
        : variant === "custom"
          ? "rgba(124, 92, 255, 0.10)"
          : "rgba(255,255,255,0.04)";

  const color =
    variant === "accent"
      ? premium.colors.accent.primary
      : variant === "warning"
        ? premium.colors.state.warning
        : variant === "custom"
          ? premium.colors.accent.secondary
          : premium.colors.text.muted;

  return (
    <View
      style={{
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor,
        backgroundColor,
        paddingHorizontal: 9,
        paddingVertical: 5,
      }}
    >
      <Text
        style={{
          color,
          fontSize: 9,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.55,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function LibraryButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent" | "danger";
}) {
  const premium = usePremiumTheme();

  const borderColor =
    variant === "accent"
      ? "rgba(232, 200, 120, 0.28)"
      : variant === "danger"
        ? "rgba(239, 111, 145, 0.32)"
        : "rgba(255,255,255,0.08)";

  const backgroundColor =
    variant === "accent"
      ? "rgba(232, 200, 120, 0.10)"
      : variant === "danger"
        ? "rgba(239, 111, 145, 0.08)"
        : "rgba(255,255,255,0.045)";

  const color =
    variant === "accent"
      ? premium.colors.accent.primary
      : variant === "danger"
        ? premium.colors.state.failure
        : premium.colors.text.secondary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.78 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          minHeight: 34,
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor,
          backgroundColor,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 12,
        }}
      >
        <Text
          style={{
            color,
            fontSize: 10,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.65,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function BehaviorCard({
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
  const premium = usePremiumTheme();

  const isSystem = origin === "system";
  const isPipeline = rule.kind === "pipeline";
  const label = getRuleKindLabel(rule.kind);
  const description = getRuleKindDescription(rule.kind);
  const family = getRuleKindFamily(rule.kind);
  const icon = getRuleKindIcon(rule.kind);

  return (
    <View
      style={{
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.075)",
        backgroundColor: "rgba(255,255,255,0.04)",
        paddingHorizontal: 13,
        paddingVertical: 13,
        gap: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isSystem
              ? "rgba(232, 200, 120, 0.20)"
              : "rgba(124, 92, 255, 0.28)",
            backgroundColor: isSystem
              ? "rgba(232, 200, 120, 0.08)"
              : "rgba(124, 92, 255, 0.10)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: isSystem
                ? premium.colors.accent.primary
                : premium.colors.accent.secondary,
              fontSize: 17,
              fontWeight: "900",
            }}
          >
            {icon}
          </Text>
        </View>

        <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.primary,
              fontSize: 16,
              fontWeight: "900",
              letterSpacing: -0.15,
            }}
          >
            {rule.name}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.accent.primary,
              fontSize: 11,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.7,
            }}
          >
            {label}
          </Text>

          <Text
            numberOfLines={3}
            style={{
              color: premium.colors.text.muted,
              fontSize: 11,
              fontWeight: "700",
              lineHeight: 16,
            }}
          >
            {description}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 7,
        }}
      >
        <BehaviorBadge
          label={isSystem ? "Système" : "Perso"}
          variant={isSystem ? "system" : "custom"}
        />

        <BehaviorBadge label={family} variant="accent" />

        <BehaviorBadge label={`Portée : ${getScopeLabel(rule.scope)}`} />

        <BehaviorBadge label={getSupportedSidesLabel(rule)} />

        {isPipeline ? <BehaviorBadge label="Expert" variant="warning" /> : null}
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <LibraryButton
          label={isSystem ? "Voir" : "Modifier"}
          onPress={() => onEditRule(rule)}
          variant={isSystem ? "default" : "accent"}
        />

        {!isSystem && onDeleteRule ? (
          <LibraryButton
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

function EmptyLibraryState({ text }: { text: string }) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.075)",
        backgroundColor: "rgba(255,255,255,0.035)",
        paddingHorizontal: 13,
        paddingVertical: 13,
        gap: 5,
      }}
    >
      <Text
        style={{
          color: premium.colors.text.primary,
          fontSize: 13,
          fontWeight: "900",
        }}
      >
        Rien à afficher
      </Text>

      <Text
        style={{
          color: premium.colors.text.muted,
          fontSize: 11,
          fontWeight: "700",
          lineHeight: 16,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

export function RulesListSection({
  systemRules,
  customRules,
  onEditRule,
  onDeleteRule,
}: Props) {
  const premium = usePremiumTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        gap: 18,
        paddingBottom: premium.spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: 10 }}>
        <LibrarySectionHeader
          title="Comportements système"
          description="Les comportements de base fournis par l’application. Ils servent de modèles fiables."
          count={systemRules.length}
        />

        {systemRules.length === 0 ? (
          <EmptyLibraryState text="Aucun comportement système disponible." />
        ) : (
          systemRules.map((rule) => (
            <BehaviorCard
              key={rule.id}
              rule={rule}
              origin="system"
              onEditRule={onEditRule}
            />
          ))
        )}
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "rgba(255,255,255,0.07)",
        }}
      />

      <View style={{ gap: 10 }}>
        <LibrarySectionHeader
          title="Mes comportements"
          description="Tes comportements personnalisés, réutilisables dans les tables, profils et actions."
          count={customRules.length}
        />

        {customRules.length === 0 ? (
          <EmptyLibraryState text="Aucun comportement personnalisé pour le moment. Utilise la création guidée pour créer ton premier comportement." />
        ) : (
          customRules.map((rule) => (
            <BehaviorCard
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
