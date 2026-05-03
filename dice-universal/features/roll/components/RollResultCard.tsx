// dice-universal\features\roll\components\RollResultCard.tsx

import { Text, View } from "react-native";
import { renderRollResult } from "../renderers/rollResultRenderer";

type Props = {
  result: any | null;
  title?: string;
};

function getToneLabel(tone?: "neutral" | "success" | "failure" | "warning") {
  if (tone === "success") return "✅";
  if (tone === "failure") return "❌";
  if (tone === "warning") return "⚠️";
  return "🎲";
}

export function RollResultCard({ result, title }: Props) {
  const rendered = renderRollResult(result);

  if (!rendered) return null;

  return (
    <View
      style={{
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
        gap: 6,
      }}
    >
      <Text style={{ fontWeight: "800" }}>{title ?? rendered.title}</Text>

      <Text style={{ fontSize: 18, fontWeight: "900" }}>
        {getToneLabel(rendered.tone)} {rendered.summary}
      </Text>

      {rendered.lines.length > 0 ? (
        <View style={{ gap: 3 }}>
          {rendered.lines.map((line, index) => (
            <Text
              key={`roll-result-line-${index}`}
              style={{
                opacity: line.endsWith(":") ? 1 : 0.72,
                fontWeight: line.endsWith(":") ? "800" : "400",
              }}
            >
              {line}
            </Text>
          ))}
        </View>
      ) : null}

      {rendered.details && rendered.details.length > 0 ? (
        <View style={{ gap: 3, marginTop: 4 }}>
          {rendered.details.map((line, index) => (
            <Text key={`roll-result-detail-${index}`} style={{ opacity: 0.72 }}>
              {line}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
