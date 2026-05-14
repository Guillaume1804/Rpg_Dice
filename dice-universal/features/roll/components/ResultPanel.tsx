// dice-universal/features/roll/components/ResultPanel.tsx

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
      icon: "❌",
      tone: "failure",
    };
  }

  if (anyResult.is_critical_success || anyResult.critical_success) {
    return {
      eyebrow: "Le destin vous sourit",
      title: "Réussite critique",
      subtitle: `Total : ${result.total}`,
      icon: "💥",
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
      icon: complication ? "⚠️" : "🎯",
      tone: complication ? "warning" : "success",
    };
  }

  if (anyResult.is_success === true || anyResult.success === true) {
    return {
      eyebrow: "Action réussie",
      title: "Réussite",
      subtitle: `Total : ${result.total}`,
      icon: "✅",
      tone: "success",
    };
  }

  if (anyResult.is_success === false || anyResult.success === false) {
    return {
      eyebrow: "Action échouée",
      title: "Échec",
      subtitle: `Total : ${result.total}`,
      icon: "❌",
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
      background: rollTheme.cockpit.background,
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
    background: theme.colors.backgroundElevated,
    soft: theme.colors.surfaceAlt,
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

  return (
    <View
      style={{
        ...styles.card,
        gap: theme.spacing.md,
        borderRadius: rollTheme.layout.cockpitRadius,
        borderColor: result ? toneColors.border : theme.colors.borderSoft,
        backgroundColor: result
          ? toneColors.background
          : rollTheme.cockpit.panel,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          left: -54,
          top: -54,
          width: 150,
          height: 150,
          borderRadius: 999,
          backgroundColor: result ? toneColors.glow : theme.colors.surfaceSoft,
          opacity: result ? 0.2 : 0.12,
        }}
      />

      <View
        style={{
          position: "absolute",
          right: -36,
          bottom: -48,
          width: 130,
          height: 130,
          borderRadius: 999,
          backgroundColor: theme.colors.arcane,
          opacity: result ? 0.14 : 0.08,
        }}
      />

      <View style={{ gap: theme.spacing.xs }}>
        <Text
          style={{
            color: theme.colors.textSubtle,
            fontSize: theme.typography.tiny,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.9,
          }}
        >
          ✦ Résultat
        </Text>

        {!result || !headline ? (
          <>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 22,
                fontWeight: "900",
                letterSpacing: -0.2,
              }}
            >
              En attente du lancer
            </Text>

            <Text
              style={{
                color: theme.colors.textMuted,
                lineHeight: 20,
                fontWeight: "600",
              }}
            >
              Lance un jet préparé pour révéler le résultat ici.
            </Text>
          </>
        ) : (
          <>
            <Text
              style={{
                color: theme.colors.textMuted,
                fontWeight: "800",
              }}
            >
              {result.label}
            </Text>

            <View
              style={{
                marginTop: theme.spacing.xs,
                padding: theme.spacing.lg,
                borderWidth: 1,
                borderColor: toneColors.border,
                borderRadius: rollTheme.layout.cockpitRadius,
                backgroundColor: toneColors.soft,
                gap: theme.spacing.sm,
                shadowColor: toneColors.glow,
                shadowOpacity: 0.22,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: theme.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                {headline.eyebrow}
              </Text>

              <Text
                style={{
                  color: toneColors.text,
                  fontSize: 26,
                  fontWeight: "900",
                  letterSpacing: -0.4,
                  lineHeight: 32,
                }}
              >
                {headline.icon} {headline.title}
              </Text>

              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontWeight: "800",
                }}
              >
                {headline.subtitle}
              </Text>
            </View>
          </>
        )}
      </View>

      {result ? (
        <View style={{ gap: theme.spacing.sm }}>
          {result.group_eval_result ? (
            <RollResultCard
              result={result.group_eval_result}
              title="Résultat principal"
            />
          ) : null}

          {result.entries.map((entry) => (
            <View
              key={entry.entryId}
              style={{
                ...styles.cardSoft,
                gap: theme.spacing.sm,
                backgroundColor: rollTheme.cockpit.panelAlt,
                borderColor: rollTheme.cockpit.borderSoft,
              }}
            >
              {entry.eval_result ? (
                <RollResultCard
                  result={entry.eval_result}
                  title={getEntryLabel(entry)}
                />
              ) : (
                <>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                    }}
                  >
                    {getEntryLabel(entry)}
                  </Text>

                  <Text
                    style={{
                      color: theme.colors.textMuted,
                      lineHeight: 20,
                    }}
                  >
                    Valeurs : {formatValues(entry.natural_values)}
                  </Text>

                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 18,
                      fontWeight: "900",
                    }}
                  >
                    Total : {entry.final_total}
                  </Text>
                </>
              )}
            </View>
          ))}

          {!result.group_eval_result && result.entries.length > 1 ? (
            <View
              style={{
                paddingTop: theme.spacing.sm,
                borderTopWidth: 1,
                borderTopColor: rollTheme.cockpit.borderSoft,
              }}
            >
              <Text
                style={{
                  color: theme.colors.accent,
                  fontSize: 24,
                  fontWeight: "900",
                }}
              >
                Total : {result.total}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
