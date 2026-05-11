// dice-universal\features\roll\components\RollResultCard.tsx

import { Text, View } from "react-native";
import { renderRollResult } from "../renderers/rollResultRenderer";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

type Props = {
  result: any | null;
  title?: string;
};

type Tone = "neutral" | "success" | "failure" | "warning";

function getToneIcon(tone?: Tone) {
  if (tone === "success") return "✅";
  if (tone === "failure") return "❌";
  if (tone === "warning") return "⚠️";
  return "🎲";
}

function getToneColors(tone?: Tone) {
  if (tone === "success") {
    return {
      border: arcane.colors.success,
      background: arcane.colors.successSoft,
      text: arcane.colors.success,
    };
  }

  if (tone === "failure") {
    return {
      border: arcane.colors.failure,
      background: arcane.colors.failureSoft,
      text: arcane.colors.failure,
    };
  }

  if (tone === "warning") {
    return {
      border: arcane.colors.warning,
      background: arcane.colors.warningSoft,
      text: arcane.colors.warning,
    };
  }

  return {
    border: arcane.colors.border,
    background: arcane.colors.surfaceAlt,
    text: arcane.colors.text,
  };
}

export function RollResultCard({ result, title }: Props) {
  const rendered = renderRollResult(result);

  if (!rendered) return null;

  const toneColors = getToneColors(rendered.tone);

  return (
    <View
      style={{
        ...arcaneStyles.cardSoft,
        borderColor: toneColors.border,
        backgroundColor: toneColors.background,
        gap: arcane.spacing.sm,
      }}
    >
      <Text
        style={{
          color: arcane.colors.textMuted,
          fontSize: arcane.typography.small,
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
                    ? arcane.colors.text
                    : arcane.colors.textMuted,
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
            marginTop: arcane.spacing.xs,
            paddingTop: arcane.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: arcane.colors.borderSoft,
          }}
        >
          {rendered.details.map((line, index) => (
            <Text
              key={`roll-result-detail-${index}`}
              style={{
                color: arcane.colors.textSubtle,
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