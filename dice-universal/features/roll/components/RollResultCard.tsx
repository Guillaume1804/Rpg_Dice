// dice-universal\features\roll\components\RollResultCard.tsx

import { Text, View } from "react-native";
import { renderRollResult } from "../renderers/rollResultRenderer";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

type Props = {
  result: any | null;
  title?: string;
};

type Tone = "neutral" | "success" | "failure" | "warning";

type ThemeColors = ReturnType<typeof useArcaneTheme>["theme"]["colors"];

function getToneIcon(tone?: Tone) {
  if (tone === "success") return "✅";
  if (tone === "failure") return "❌";
  if (tone === "warning") return "⚠️";
  return "🎲";
}

function getToneColors(tone: Tone | undefined, colors: ThemeColors) {
  if (tone === "success") {
    return {
      border: colors.success,
      background: colors.successSoft,
      text: colors.success,
    };
  }

  if (tone === "failure") {
    return {
      border: colors.failure,
      background: colors.failureSoft,
      text: colors.failure,
    };
  }

  if (tone === "warning") {
    return {
      border: colors.warning,
      background: colors.warningSoft,
      text: colors.warning,
    };
  }

  return {
    border: colors.border,
    background: colors.surfaceAlt,
    text: colors.text,
  };
}

export function RollResultCard({ result, title }: Props) {
  const { theme, styles } = useArcaneTheme();
  const rendered = renderRollResult(result);

  if (!rendered) return null;

  const toneColors = getToneColors(rendered.tone, theme.colors);

  return (
    <View
      style={{
        ...styles.cardSoft,
        borderColor: toneColors.border,
        backgroundColor: toneColors.background,
        gap: theme.spacing.sm,
      }}
    >
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: theme.typography.small,
          fontWeight: "900",
        }}
      >
        {title ?? rendered.title}
      </Text>

      <Text
        style={{
          color: toneColors.text,
          fontSize: 19,
          fontWeight: "900",
        }}
      >
        {getToneIcon(rendered.tone)} {rendered.summary}
      </Text>

      {rendered.lines.length > 0 ? (
        <View style={{ gap: 4 }}>
          {rendered.lines.map((line, index) => {
            const isSectionTitle = line.endsWith(":");

            return (
              <Text
                key={`roll-result-line-${index}`}
                style={{
                  color: isSectionTitle
                    ? theme.colors.text
                    : theme.colors.textMuted,
                  fontWeight: isSectionTitle ? "900" : "500",
                  lineHeight: 20,
                }}
              >
                {line}
              </Text>
            );
          })}
        </View>
      ) : null}

      {rendered.details && rendered.details.length > 0 ? (
        <View
          style={{
            gap: 4,
            marginTop: theme.spacing.xs,
            paddingTop: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.borderSoft,
          }}
        >
          {rendered.details.map((line, index) => (
            <Text
              key={`roll-result-detail-${index}`}
              style={{
                color: theme.colors.textSubtle,
                lineHeight: 19,
              }}
            >
              {line}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
