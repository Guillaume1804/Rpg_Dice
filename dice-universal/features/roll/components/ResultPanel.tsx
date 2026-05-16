// dice-universal/features/roll/components/ResultPanel.tsx

import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
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
  return `${entry.qty}d${entry.sides}${entry.modifier ? ` ${entry.modifier > 0 ? "+" : ""}${entry.modifier}` : ""
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
      border: "rgba(217, 160, 55, 0.86)",
      background: "rgba(31, 24, 54, 0.88)",
      soft: "rgba(217, 160, 55, 0.15)",
      text: theme.colors.accent,
      glow: theme.colors.accent,
    };
  }

  if (tone === "success") {
    return {
      border: theme.colors.success,
      background: "rgba(15, 38, 36, 0.84)",
      soft: theme.colors.successSoft,
      text: theme.colors.success,
      glow: theme.colors.success,
    };
  }

  if (tone === "failure") {
    return {
      border: theme.colors.failure,
      background: "rgba(48, 19, 36, 0.84)",
      soft: theme.colors.failureSoft,
      text: theme.colors.failure,
      glow: theme.colors.failure,
    };
  }

  if (tone === "warning") {
    return {
      border: theme.colors.warning,
      background: "rgba(48, 35, 18, 0.84)",
      soft: theme.colors.warningSoft,
      text: theme.colors.warning,
      glow: theme.colors.warning,
    };
  }

  return {
    border: "rgba(145, 113, 255, 0.24)",
    background: "rgba(13, 19, 43, 0.72)",
    soft: "rgba(32, 41, 88, 0.52)",
    text: theme.colors.text,
    glow: rollTheme.cockpit.magicGlow,
  };
}

function DetailPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 11,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.18)",
        borderRadius: theme.radius.pill,
        backgroundColor: "rgba(32, 41, 88, 0.52)",
        gap: 2,
      }}
    >
      <Text
        style={{
          color: theme.colors.textSubtle,
          fontSize: 10,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
      >
        {label}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: theme.colors.text,
          fontSize: 13,
          fontWeight: "900",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function ResultDetailsModal({
  visible,
  result,
  headline,
  onClose,
}: {
  visible: boolean;
  result: GroupRollResult | null;
  headline: ResultHeadline | null;
  onClose: () => void;
}) {
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  if (!result || !headline) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.68)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            maxHeight: "86%",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderWidth: 1,
            borderColor: "rgba(145, 113, 255, 0.26)",
            backgroundColor: rollTheme.cockpit.panel,
            padding: theme.spacing.md,
            gap: theme.spacing.md,
            overflow: "hidden",
            ...theme.shadow.card,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -80,
              top: -80,
              width: 210,
              height: 210,
              borderRadius: 999,
              backgroundColor: rollTheme.cockpit.magicGlow,
              opacity: 0.14,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: theme.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.9,
                }}
              >
                ✦ Détails du lancer
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.text,
                  fontSize: 23,
                  fontWeight: "900",
                  letterSpacing: -0.4,
                }}
              >
                {headline.title}
              </Text>

              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                {headline.subtitle}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderRadius: theme.radius.pill,
                borderWidth: 1,
                borderColor: "rgba(145, 113, 255, 0.22)",
                backgroundColor: pressed
                  ? "rgba(32, 41, 88, 0.72)"
                  : "rgba(32, 41, 88, 0.52)",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 21,
                  fontWeight: "900",
                }}
              >
                ×
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              gap: theme.spacing.md,
              paddingBottom: theme.spacing.md,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: theme.spacing.sm,
              }}
            >
              <DetailPill label="Total" value={String(result.total)} />
              <DetailPill
                label="Entrées"
                value={String(result.entries.length)}
              />
              <DetailPill label="Type" value={headline.eyebrow} />
            </View>

            <View
              style={{
                ...styles.cardSoft,
                backgroundColor: "rgba(28, 37, 82, 0.54)",
                borderColor: "rgba(145, 113, 255, 0.18)",
                gap: theme.spacing.sm,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                Dés lancés
              </Text>

              {result.entries.map((entry, index) => (
                <View
                  key={`result-entry-${index}-${entry.sides}`}
                  style={{
                    paddingVertical: 9,
                    paddingHorizontal: 10,
                    borderRadius: theme.radius.md,
                    borderWidth: 1,
                    borderColor: "rgba(145, 113, 255, 0.14)",
                    backgroundColor: "rgba(13, 19, 43, 0.54)",
                    gap: 3,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 14,
                      fontWeight: "900",
                    }}
                  >
                    {getEntryLabel(entry)}
                  </Text>

                  <Text
                    style={{
                      color: theme.colors.textMuted,
                      fontSize: 13,
                      fontWeight: "700",
                    }}
                  >
                    Valeurs : {formatValues(entry.natural_values)}
                  </Text>
                </View>
              ))}
            </View>

            {result.group_eval_result ? (
              <RollResultCard
                result={result.group_eval_result}
                title="Interprétation"
              />
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function ResultPanel({ result }: ResultPanelProps) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const headline = result ? getResultHeadline(result) : null;

  const toneColors = headline
    ? getToneColors(headline.tone, theme, rollTheme)
    : getToneColors("neutral", theme, rollTheme);

  return (
    <>
      <View
        style={{
          minHeight: result ? 82 : 54,
          paddingVertical: result ? 9 : 7,
          paddingHorizontal: 11,
          borderRadius: rollTheme.layout.cockpitRadius,
          borderWidth: 1,
          borderColor: result
            ? toneColors.border
            : "rgba(145, 113, 255, 0.16)",
          backgroundColor: result
            ? toneColors.background
            : "rgba(13, 19, 43, 0.52)",
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -54,
            top: -64,
            width: 138,
            height: 138,
            borderRadius: 999,
            backgroundColor: result
              ? toneColors.glow
              : rollTheme.cockpit.magicGlow,
            opacity: result ? 0.18 : 0.07,
          }}
        />

        {result && headline ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: toneColors.border,
                backgroundColor: toneColors.soft,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: toneColors.glow,
                shadowOpacity: 0.22,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 5 },
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: toneColors.text,
                  fontSize: 25,
                  fontWeight: "900",
                  lineHeight: 28,
                }}
              >
                {headline.icon}
              </Text>
            </View>

            <View style={{ flex: 1, gap: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: theme.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                ✦ {headline.eyebrow}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: toneColors.text,
                  fontSize: 22,
                  fontWeight: "900",
                  letterSpacing: -0.45,
                  lineHeight: 26,
                }}
              >
                {headline.title}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {headline.subtitle}
              </Text>
            </View>

            <Pressable
              onPress={() => setDetailsVisible(true)}
              style={({ pressed }) => ({
                paddingVertical: 8,
                paddingHorizontal: 11,
                borderRadius: theme.radius.pill,
                borderWidth: 1,
                borderColor: "rgba(145, 113, 255, 0.22)",
                backgroundColor: pressed
                  ? "rgba(32, 41, 88, 0.72)"
                  : "rgba(32, 41, 88, 0.52)",
                opacity: pressed ? 0.84 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 12,
                  fontWeight: "900",
                }}
              >
                Détails
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              minHeight: 38,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 13,
                borderWidth: 1,
                borderColor: "rgba(145, 113, 255, 0.16)",
                backgroundColor: "rgba(32, 41, 88, 0.38)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: 18,
                  fontWeight: "900",
                }}
              >
                🎲
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.text,
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                En attente du lancer
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                Prépare un jet, puis lance les dés.
              </Text>
            </View>
          </View>
        )}
      </View>

      <ResultDetailsModal
        visible={detailsVisible}
        result={result}
        headline={headline}
        onClose={() => setDetailsVisible(false)}
      />
    </>
  );
}