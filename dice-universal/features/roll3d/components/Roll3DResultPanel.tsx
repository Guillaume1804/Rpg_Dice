// dice-universal/features/roll3d/components/Roll3DResultPanel.tsx

import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DRollSummary } from "../types";

type Roll3DResultPanelProps = {
  result: Roll3DRollSummary | null;
};

function formatRollTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Roll3DResultPanel({ result }: Roll3DResultPanelProps) {
  const premium = usePremiumTheme();

  const hasResult = !!result;

  return (
    <LinearGradient
      colors={["rgba(255,255,255,0.08)", "rgba(5,6,11,0.94)"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{
        width: "100%",
        borderRadius: premium.radius.xl,
        borderWidth: 1,
        borderColor: hasResult
          ? premium.colors.border.accent
          : premium.colors.border.subtle,
        padding: hasResult ? 14 : 11,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 18,
          right: 18,
          height: 16,
          borderBottomLeftRadius: premium.radius.pill,
          borderBottomRightRadius: premium.radius.pill,
          backgroundColor: result
            ? "rgba(232,200,120,0.14)"
            : "rgba(255,255,255,0.055)",
        }}
      />

      <Text
        style={{
          color: premium.colors.text.muted,
          fontSize: 10,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 1.2,
          marginBottom: 8,
        }}
      >
        Résultat Roll3D
      </Text>

      {hasResult ? (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View>
              <Text
                style={{
                  color: premium.colors.text.primary,
                  fontSize: 34,
                  fontWeight: "900",
                  letterSpacing: -1.2,
                  lineHeight: 38,
                }}
              >
                {result.total}
              </Text>

              <Text
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 11,
                  fontWeight: "800",
                  marginTop: 2,
                }}
              >
                {result.modifierTotal !== 0
                  ? "Total avec modificateurs"
                  : "Total simple"}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: premium.colors.accent.primary,
                  fontSize: 11,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {result.dice.length} dé{result.dice.length > 1 ? "s" : ""}
              </Text>

              <Text
                style={{
                  color: premium.colors.text.muted,
                  fontSize: 10,
                  fontWeight: "700",
                  marginTop: 3,
                }}
              >
                {formatRollTime(result.createdAt)}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 7,
              marginTop: 12,
            }}
          >
            {result.dice.map((die) => (
              <View
                key={die.id}
                style={{
                  borderRadius: premium.radius.pill,
                  borderWidth: 1,
                  borderColor: premium.colors.border.subtle,
                  backgroundColor: "rgba(255,255,255,0.055)",
                  paddingHorizontal: 9,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{
                    color: premium.colors.text.secondary,
                    fontSize: 11,
                    fontWeight: "900",
                  }}
                >
                  {die.sign < 0 ? "-" : ""}d{die.sides}: {die.value}
                  {die.modifier !== 0
                    ? ` ${die.modifier > 0 ? "+" : "-"} ${Math.abs(die.modifier)}`
                    : ""}{" "}
                  = {die.total}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text
          style={{
            color: premium.colors.text.secondary,
            fontSize: 11,
            fontWeight: "700",
            lineHeight: 16,
          }}
        >
          AAjoute des dés, puis lance la table.
        </Text>
      )}
    </LinearGradient>
  );
}
