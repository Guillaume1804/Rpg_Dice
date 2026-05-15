// dice-universal\features\roll\components\ResultPanel.tsx

import { useMemo } from "react";
import { Text, View } from "react-native";
import type { GroupRollResult } from "../../../core/roll/roll";
import { RollResultCard } from "./RollResultCard";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

type ResultPanelProps = {
  result: GroupRollResult | null;
};

type ResultTone = "neutral" | "success" | "failure" | "warning" | "critical";

type ResultHeadline = {
  title: string;
  subtitle: string;
  eyebrow: string;
  icon: string;
  tone: ResultTone;
};

function formatValues(values: number[]) {
  if (!values.length) return "—";
  return values.join(" + ");
}

function getEntryLabel(entry: GroupRollResult["entries"][number]) {
  return `${entry.qty}d${entry.sides}${
    entry.modifier ? ` ${entry.modifier > 0 ? "+" : ""}${entry.modifier}` : ""
  }`;
}

function getResultHeadline(result: GroupRollResult): ResultHeadline {
  const evalResult =
    result.group_eval_result ??
    result.entries.find((entry) => entry.eval_result)?.eval_result ??
    null;

  if (!evalResult) {
    return {
      eyebrow: "Résultat brut",
      title: `Total : ${result.total}`,
      subtitle: "Résultat numérique simple.",
      icon: "🎲",
      tone: "neutral",
    };
  }

  const anyResult = evalResult as any;

  if (anyResult.is_critical_failure || anyResult.critical_failure) {
    return {
      eyebrow: "Le destin se retourne",
      title: "Échec critique",
      subtitle: `Total : ${result.total}`,
      icon: "✖",
      tone: "failure",
    };
  }

  if (anyResult.is_critical_success || anyResult.critical_success) {
    return {
      eyebrow: "Le destin vous sourit",
      title: "Réussite critique",
      subtitle: `Total : ${result.total}`,
      icon: "✦",
      tone: "critical",
    };
  }

  if (typeof anyResult.successes === "number") {
    const complication =
      anyResult.has_complication ||
      anyResult.complication ||
      anyResult.is_complication;

    return {
      eyebrow: complication ? "Succès instable" : "Succès comptabilisés",
      title: complication
        ? `${anyResult.successes} succès + complication`
        : `${anyResult.successes} succès`,
      subtitle: `Total : ${result.total}`,
      icon: complication ? "⚠" : "◎",
      tone: complication ? "warning" : "success",
    };
  }

  if (anyResult.is_success === true || anyResult.success === true) {
    return {
      eyebrow: "Action réussie",
      title: "Réussite",
      subtitle: `Total : ${result.total}`,
      icon: "✓",
      tone: "success",
    };
  }

  if (anyResult.is_success === false || anyResult.success === false) {
    return {
      eyebrow: "Action échouée",
      title: "Échec",
      subtitle: `Total : ${result.total}`,
      icon: "✖",
      tone: "failure",
    };
  }

  if (typeof anyResult.final_total === "number") {
    return {
      eyebrow: "Résultat interprété",
      title: `Total : ${anyResult.final_total}`,
      subtitle: `Total global : ${result.total}`,
      icon: "🎲",
      tone: "neutral",
    };
  }

  if (typeof anyResult.label === "string" && anyResult.label.trim()) {
    return {
      eyebrow: "Résultat narratif",
      title: anyResult.label,
      subtitle: `Total : ${result.total}`,
      icon: "✦",
      tone: "neutral",
    };
  }

  return {
    eyebrow: "Résultat interprété",
    title: `Total : ${result.total}`,
    subtitle: "Résultat du lancer.",
    icon: "🎲",
    tone: "neutral",
  };
}

function getToneColors(
  tone: ResultTone,
  theme: ReturnType<typeof useArcaneTheme>["theme"],
  rollTheme: ReturnType<typeof createRollScreenTheme>,
) {
  if (tone === "critical") {
    return {
      border: theme.colors.accent,
      background: rollTheme.hero.background,
      soft: theme.colors.accentSoft,
      text: theme.colors.accent,
      glow: rollTheme.cockpit.glow,
    };
  }

  if (tone === "success") {
    return {
      border: theme.colors.success,
      background: theme.colors.successSoft,
      soft: theme.colors.successSoft,
      text: theme.colors.success,
      glow: theme.colors.success,
    };
  }

  if (tone === "failure") {
    return {
      border: theme.colors.failure,
      background: theme.colors.failureSoft,
      soft: theme.colors.failureSoft,
      text: theme.colors.failure,
      glow: theme.colors.failure,
    };
  }

  if (tone === "warning") {
    return {
      border: theme.colors.warning,
      background: theme.colors.warningSoft,
      soft: theme.colors.warningSoft,
      text: theme.colors.warning,
      glow: theme.colors.warning,
    };
  }

  return {
    border: theme.colors.border,
    background: rollTheme.cockpit.panel,
    soft: rollTheme.cockpit.panelAlt,
    text: theme.colors.text,
    glow: theme.colors.arcane,
  };
}

export function ResultPanel({ result }: ResultPanelProps) {
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const headline = result ? getResultHeadline(result) : null;

  const toneColors = headline
    ? getToneColors(headline.tone, theme, rollTheme)
    : getToneColors("neutral", theme, rollTheme);

  const firstEntry = result?.entries[0] ?? null;
  const hasMultipleEntries = (result?.entries.length ?? 0) > 1;

  return (
    <View
      style={{
        ...styles.card,
        minHeight: result ? 132 : 118,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.sm,
        borderRadius: rollTheme.layout.cockpitRadius,
        borderColor: result ? toneColors.border : rollTheme.cockpit.borderSoft,
        backgroundColor: result
          ? toneColors.background
          : rollTheme.cockpit.panel,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -42,
          top: -46,
          width: 136,
          height: 136,
          borderRadius: 999,
          backgroundColor: result
            ? toneColors.glow
            : rollTheme.cockpit.magicGlow,
          opacity: result ? 0.22 : 0.12,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -58,
          bottom: -64,
          width: 170,
          height: 170,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.magicGlow,
          opacity: result ? 0.14 : 0.1,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.md,
        }}
      >
        <View
          style={{
            width: result ? 72 : 62,
            height: result ? 72 : 62,
            borderRadius: theme.radius.xl,
            borderWidth: 1,
            borderColor: result
              ? toneColors.border
              : rollTheme.cockpit.borderSoft,
            backgroundColor: result
              ? toneColors.soft
              : rollTheme.cockpit.panelAlt,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: toneColors.glow,
            shadowOpacity: result ? 0.28 : 0.08,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: result ? 4 : 1,
          }}
        >
          <Text
            style={{
              color: toneColors.text,
              fontSize: result ? 31 : 27,
              fontWeight: "900",
              lineHeight: result ? 34 : 30,
            }}
          >
            {headline?.icon ?? "🎲"}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.textSubtle,
              fontSize: theme.typography.tiny,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.9,
            }}
          >
            ✦ {headline?.eyebrow ?? "Résultat"}
          </Text>

          <Text
            numberOfLines={2}
            style={{
              color: result ? toneColors.text : theme.colors.text,
              fontSize: result ? 24 : 23,
              fontWeight: "900",
              letterSpacing: -0.5,
              lineHeight: result ? 29 : 28,
            }}
          >
            {headline?.title ?? "En attente du lancer"}
          </Text>

          <Text
            numberOfLines={2}
            style={{
              color: theme.colors.textMuted,
              lineHeight: 19,
              fontWeight: "700",
            }}
          >
            {headline?.subtitle ??
              "Prépare un jet, puis laisse le destin décider."}
          </Text>
        </View>
      </View>

      {result && firstEntry ? (
        <View
          style={{
            marginTop: theme.spacing.xs,
            paddingTop: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: rollTheme.cockpit.borderSoft,
            gap: theme.spacing.xs,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: theme.spacing.sm,
              alignItems: "center",
            }}
          >
            <View
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: rollTheme.cockpit.borderSoft,
                borderRadius: theme.radius.pill,
                backgroundColor: rollTheme.cockpit.panelAlt,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.textMuted,
                  fontSize: theme.typography.small,
                  fontWeight: "900",
                }}
              >
                {getEntryLabel(firstEntry)}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                minWidth: 160,
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: rollTheme.cockpit.borderSoft,
                borderRadius: theme.radius.pill,
                backgroundColor: rollTheme.cockpit.panelAlt,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.textMuted,
                  fontSize: theme.typography.small,
                  fontWeight: "800",
                }}
              >
                Valeurs : {formatValues(firstEntry.natural_values)}
              </Text>
            </View>

            {hasMultipleEntries ? (
              <View
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderWidth: 1,
                  borderColor: theme.colors.accent,
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.accentSoft,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.accent,
                    fontSize: theme.typography.small,
                    fontWeight: "900",
                  }}
                >
                  +{result.entries.length - 1}
                </Text>
              </View>
            ) : null}
          </View>

          {result.group_eval_result ? (
            <RollResultCard
              result={result.group_eval_result}
              title="Détail du résultat"
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
