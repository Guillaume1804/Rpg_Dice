// dice-universal/features/roll3d/components/Roll3DResultOverlay.tsx

import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DRollSummary } from "../types";

type Roll3DResultOverlayProps = {
  result: Roll3DRollSummary | null;
  visible: boolean;
  onClose: () => void;
  onRollAgain: () => void;
};

type OfficialEntry = Roll3DRollSummary["officialResult"]["entries"][number];

type OutcomeVisual = {
  label: string;
  icon: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
};

function formatRollTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCompare(compare?: string) {
  return compare === "lte" ? "≤" : "≥";
}

function formatNumberArray(values: number[] | undefined | null) {
  if (!Array.isArray(values) || values.length === 0) {
    return "—";
  }

  return values.join(", ");
}

function formatMaybeArray(value: number | number[] | null | undefined) {
  if (Array.isArray(value)) {
    return formatNumberArray(value);
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "—";
}

function getOutcomeFromEval(evalResult: any | null | undefined): string | null {
  if (!evalResult) {
    return null;
  }

  if (typeof evalResult.outcome === "string") {
    return evalResult.outcome;
  }

  if (typeof evalResult.meta?.outcome === "string") {
    return evalResult.meta.outcome;
  }

  return null;
}

function getPrimaryEvalResult(result: Roll3DRollSummary) {
  if (result.officialResult.group_eval_result) {
    return result.officialResult.group_eval_result;
  }

  const entryWithOutcome = result.officialResult.entries.find((entry) =>
    getOutcomeFromEval(entry.eval_result),
  );

  if (entryWithOutcome?.eval_result) {
    return entryWithOutcome.eval_result;
  }

  return result.officialResult.entries.find((entry) => entry.eval_result)
    ?.eval_result;
}

function getOutcomeVisual(outcome: string | null | undefined): OutcomeVisual {
  switch (outcome) {
    case "crit_success":
      return {
        label: "Réussite critique",
        icon: "✦",
        borderColor: "rgba(125, 255, 190, 0.72)",
        backgroundColor: "rgba(42, 190, 119, 0.16)",
        textColor: "#9DFFD0",
      };

    case "success":
      return {
        label: "Réussite",
        icon: "✓",
        borderColor: "rgba(113, 221, 150, 0.58)",
        backgroundColor: "rgba(54, 160, 98, 0.14)",
        textColor: "#9BE7B2",
      };

    case "failure":
      return {
        label: "Échec",
        icon: "×",
        borderColor: "rgba(255, 130, 130, 0.52)",
        backgroundColor: "rgba(190, 58, 58, 0.14)",
        textColor: "#FF9C9C",
      };

    case "crit_failure":
    case "crit_glitch":
      return {
        label:
          outcome === "crit_glitch"
            ? "Complication critique"
            : "Échec critique",
        icon: "!",
        borderColor: "rgba(255, 88, 88, 0.72)",
        backgroundColor: "rgba(190, 28, 28, 0.18)",
        textColor: "#FF7D7D",
      };

    case "glitch":
      return {
        label: "Complication",
        icon: "◇",
        borderColor: "rgba(255, 188, 92, 0.6)",
        backgroundColor: "rgba(190, 114, 36, 0.16)",
        textColor: "#FFC978",
      };

    default:
      return {
        label: "Résultat",
        icon: "◆",
        borderColor: "rgba(232, 200, 120, 0.48)",
        backgroundColor: "rgba(232, 200, 120, 0.12)",
        textColor: "#E8C878",
      };
  }
}

function getResultSubtitle(result: Roll3DRollSummary) {
  if (result.officialResult.group_eval_result) {
    return "Moteur officiel · comportement de groupe";
  }

  if (result.officialResult.entries.some((entry) => entry.eval_result)) {
    return "Moteur officiel · comportements";
  }

  if (result.modifierTotal !== 0) {
    return "Moteur officiel · modificateurs";
  }

  return "Moteur officiel · somme";
}

function getEntryTitle(entry: OfficialEntry) {
  const signPrefix = entry.sign < 0 ? "-" : "";
  const modifierLabel =
    entry.modifier !== 0
      ? ` ${entry.modifier > 0 ? "+" : "-"} ${Math.abs(entry.modifier)}`
      : "";

  return `${signPrefix}${entry.qty}d${entry.sides}${modifierLabel}`;
}

function formatEvalSummaryLines(evalResult: any | null | undefined): string[] {
  if (!evalResult) {
    return [];
  }

  if (evalResult.kind === "sum") {
    return [`Total : ${evalResult.total}`];
  }

  if (evalResult.kind === "single_check") {
    const threshold =
      evalResult.threshold == null
        ? "sans seuil"
        : `${formatCompare(evalResult.compare)} ${evalResult.threshold}`;

    return [
      `Jet naturel : ${evalResult.natural}`,
      `Final : ${evalResult.final}`,
      `Seuil : ${threshold}`,
    ];
  }

  if (evalResult.kind === "threshold_degrees") {
    return [
      `Jet : ${evalResult.roll}`,
      `Final : ${evalResult.final}`,
      `Cible : ${formatCompare(evalResult.compare)} ${evalResult.target}`,
      `Marge : ${evalResult.margin}`,
      `Degrés : ${evalResult.degrees}`,
    ];
  }

  if (evalResult.kind === "success_pool") {
    const lines = [
      `Succès : ${evalResult.successes}`,
      `Échecs spéciaux : ${evalResult.fail_count}`,
      `Dés lancés : ${evalResult.dice_count}`,
      `Seuil de succès : ${evalResult.success_at_or_above}+`,
    ];

    if (evalResult.complication) {
      lines.push("Complication détectée");
    }

    if (evalResult.critical_success) {
      lines.push("Réussite critique détectée");
    }

    if (evalResult.critical_failure) {
      lines.push("Échec critique détecté");
    }

    return lines;
  }

  if (evalResult.kind === "table_lookup") {
    return [`Valeur : ${evalResult.value}`, `Résultat : ${evalResult.label}`];
  }

  if (evalResult.kind === "banded_sum") {
    return [`Total : ${evalResult.total}`, `Palier : ${evalResult.label}`];
  }

  if (
    evalResult.kind === "highest_of_pool" ||
    evalResult.kind === "lowest_of_pool"
  ) {
    const modeLabel =
      evalResult.kind === "highest_of_pool" ? "Meilleur dé" : "Pire dé";

    const threshold =
      evalResult.threshold == null
        ? "sans seuil"
        : `${formatCompare(evalResult.compare)} ${evalResult.threshold}`;

    return [
      `${modeLabel} : ${evalResult.kept}`,
      `Dés : ${formatNumberArray(evalResult.natural_values)}`,
      `Final : ${evalResult.final}`,
      `Seuil : ${threshold}`,
    ];
  }

  if (evalResult.kind === "keep_highest_n") {
    return [
      `Dés : ${formatNumberArray(evalResult.natural_values)}`,
      `Gardés : ${formatNumberArray(evalResult.kept)}`,
      `Final : ${formatMaybeArray(evalResult.final)}`,
    ];
  }

  if (evalResult.kind === "keep_lowest_n") {
    return [
      `Dés : ${formatNumberArray(evalResult.natural_values)}`,
      `Gardés : ${formatNumberArray(evalResult.kept)}`,
      `Final : ${formatMaybeArray(evalResult.final)}`,
    ];
  }

  if (evalResult.kind === "drop_highest_n") {
    return [
      `Dés : ${formatNumberArray(evalResult.natural_values)}`,
      `Restants : ${formatNumberArray(evalResult.remaining)}`,
      `Final : ${formatMaybeArray(evalResult.final)}`,
    ];
  }

  if (evalResult.kind === "drop_lowest_n") {
    return [
      `Dés : ${formatNumberArray(evalResult.natural_values)}`,
      `Restants : ${formatNumberArray(evalResult.remaining)}`,
      `Final : ${formatMaybeArray(evalResult.final)}`,
    ];
  }

  if (evalResult.kind === "pipeline") {
    const lines = [
      `Dés : ${formatNumberArray(evalResult.values)}`,
      `Gardés : ${formatNumberArray(evalResult.kept)}`,
      `Final : ${formatMaybeArray(evalResult.final)}`,
    ];

    if (typeof evalResult.meta?.successes === "number") {
      lines.push(`Succès : ${evalResult.meta.successes}`);
    }

    if (typeof evalResult.meta?.complications === "number") {
      lines.push(`Complications : ${evalResult.meta.complications}`);
    }

    if (typeof evalResult.meta?.count_equal === "number") {
      lines.push(`Comptage faces : ${evalResult.meta.count_equal}`);
    }

    if (typeof evalResult.meta?.count_range === "number") {
      lines.push(`Comptage plage : ${evalResult.meta.count_range}`);
    }

    if (evalResult.meta?.lookup?.label) {
      lines.push(`Palier : ${evalResult.meta.lookup.label}`);
    }

    if (evalResult.meta?.degrees) {
      lines.push(`Degrés : ${evalResult.meta.degrees.degrees}`);
      lines.push(`Marge : ${evalResult.meta.degrees.margin}`);
    }

    if (evalResult.meta?.complication) {
      lines.push("Complication détectée");
    }

    if (evalResult.meta?.critical_success) {
      lines.push("Réussite critique détectée");
    }

    if (evalResult.meta?.critical_failure) {
      lines.push("Échec critique détecté");
    }

    return lines;
  }

  if (evalResult.kind === "unknown") {
    return [evalResult.message ?? "Règle inconnue"];
  }

  return [];
}

function buildEntryChips(entry: OfficialEntry) {
  const chips: string[] = [];

  chips.push(`Dés : ${formatNumberArray(entry.natural_values)}`);

  if (entry.base_total !== entry.total_with_modifier) {
    chips.push(`Base : ${entry.base_total}`);
    chips.push(`Modifié : ${entry.total_with_modifier}`);
  }

  chips.push(`Final : ${entry.final_total}`);

  return chips;
}

export function Roll3DResultOverlay({
  result,
  visible,
  onClose,
  onRollAgain,
}: Roll3DResultOverlayProps) {
  const premium = usePremiumTheme();

  if (!result) {
    return null;
  }

  const primaryEvalResult = getPrimaryEvalResult(result);
  const primaryOutcome = getOutcomeFromEval(primaryEvalResult);
  const outcomeVisual = getOutcomeVisual(primaryOutcome);

  const hasAnyBehavior =
    !!result.officialResult.group_eval_result ||
    result.officialResult.entries.some((entry) => !!entry.eval_result);

  const groupSummaryLines = formatEvalSummaryLines(
    result.officialResult.group_eval_result,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.62)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 18,
          paddingVertical: 28,
        }}
      >
        <Pressable
          onPress={() => {
            return;
          }}
          style={{
            width: "100%",
            maxWidth: 420,
          }}
        >
          <LinearGradient
            colors={["rgba(24, 26, 36, 0.98)", "rgba(5, 6, 11, 0.98)"]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{
              borderRadius: 30,
              borderWidth: 1,
              borderColor: premium.colors.border.accent,
              padding: 18,
              overflow: "hidden",
            }}
          >
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 26,
                right: 26,
                height: 22,
                borderBottomLeftRadius: premium.radius.pill,
                borderBottomRightRadius: premium.radius.pill,
                backgroundColor: "rgba(232, 200, 120, 0.16)",
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <Text
                style={{
                  color: premium.colors.accent.primary,
                  fontSize: 11,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                }}
              >
                Résultat Roll3D
              </Text>

              <View
                style={{
                  borderRadius: premium.radius.pill,
                  borderWidth: 1,
                  borderColor: outcomeVisual.borderColor,
                  backgroundColor: outcomeVisual.backgroundColor,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    color: outcomeVisual.textColor,
                    fontSize: 11,
                    fontWeight: "900",
                  }}
                >
                  {outcomeVisual.icon}
                </Text>

                <Text
                  style={{
                    color: outcomeVisual.textColor,
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                  }}
                >
                  {outcomeVisual.label}
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: premium.colors.text.primary,
                  fontSize: 58,
                  fontWeight: "900",
                  letterSpacing: -2,
                  lineHeight: 64,
                }}
              >
                {result.total}
              </Text>

              <Text
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 12,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                {getResultSubtitle(result)}
              </Text>

              <Text
                style={{
                  color: premium.colors.text.muted,
                  fontSize: 11,
                  fontWeight: "700",
                  marginTop: 5,
                }}
              >
                {result.dice.length} dé{result.dice.length > 1 ? "s" : ""} ·{" "}
                {formatRollTime(result.createdAt)}
              </Text>
            </View>

            {hasAnyBehavior ? (
              <View
                style={{
                  marginTop: 14,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: outcomeVisual.borderColor,
                  backgroundColor: outcomeVisual.backgroundColor,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    color: outcomeVisual.textColor,
                    fontSize: 11,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.9,
                    marginBottom: 7,
                  }}
                >
                  Interprétation officielle
                </Text>

                {formatEvalSummaryLines(primaryEvalResult).map((line) => (
                  <Text
                    key={`primary-eval-${line}`}
                    style={{
                      color: premium.colors.text.secondary,
                      fontSize: 11,
                      fontWeight: "800",
                      lineHeight: 17,
                    }}
                  >
                    {line}
                  </Text>
                ))}
              </View>
            ) : null}

            {groupSummaryLines.length > 0 ? (
              <View
                style={{
                  marginTop: 10,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: premium.colors.border.subtle,
                  backgroundColor: "rgba(255,255,255,0.045)",
                  padding: 10,
                }}
              >
                <Text
                  style={{
                    color: premium.colors.text.secondary,
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 6,
                  }}
                >
                  Comportement de groupe
                </Text>

                {groupSummaryLines.map((line) => (
                  <Text
                    key={`group-eval-${line}`}
                    style={{
                      color: premium.colors.text.muted,
                      fontSize: 11,
                      fontWeight: "700",
                      lineHeight: 16,
                    }}
                  >
                    {line}
                  </Text>
                ))}
              </View>
            ) : null}

            <ScrollView
              style={{
                maxHeight: 260,
                marginTop: 14,
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                gap: 10,
                paddingBottom: 4,
              }}
            >
              {result.officialResult.entries.map((entry) => {
                const entryOutcome = getOutcomeFromEval(entry.eval_result);
                const entryOutcomeVisual = getOutcomeVisual(entryOutcome);
                const evalLines = formatEvalSummaryLines(entry.eval_result);
                const chips = buildEntryChips(entry);

                return (
                  <View
                    key={entry.entryId}
                    style={{
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: entry.eval_result
                        ? entryOutcomeVisual.borderColor
                        : premium.colors.border.subtle,
                      backgroundColor: entry.eval_result
                        ? entryOutcomeVisual.backgroundColor
                        : "rgba(255,255,255,0.055)",
                      padding: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: premium.colors.text.primary,
                            fontSize: 13,
                            fontWeight: "900",
                          }}
                        >
                          {getEntryTitle(entry)}
                        </Text>

                        <Text
                          style={{
                            color: premium.colors.text.muted,
                            fontSize: 10,
                            fontWeight: "800",
                            marginTop: 3,
                          }}
                        >
                          {entry.rule?.name ?? "Somme simple"}
                        </Text>
                      </View>

                      {entryOutcome ? (
                        <View
                          style={{
                            borderRadius: premium.radius.pill,
                            borderWidth: 1,
                            borderColor: entryOutcomeVisual.borderColor,
                            backgroundColor: "rgba(0,0,0,0.18)",
                            paddingHorizontal: 9,
                            paddingVertical: 5,
                          }}
                        >
                          <Text
                            style={{
                              color: entryOutcomeVisual.textColor,
                              fontSize: 10,
                              fontWeight: "900",
                            }}
                          >
                            {entryOutcomeVisual.label}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 7,
                        marginTop: 10,
                      }}
                    >
                      {chips.map((chip) => (
                        <View
                          key={`${entry.entryId}-${chip}`}
                          style={{
                            borderRadius: premium.radius.pill,
                            borderWidth: 1,
                            borderColor: premium.colors.border.subtle,
                            backgroundColor: "rgba(0,0,0,0.16)",
                            paddingHorizontal: 9,
                            paddingVertical: 5,
                          }}
                        >
                          <Text
                            style={{
                              color: premium.colors.text.secondary,
                              fontSize: 10,
                              fontWeight: "900",
                            }}
                          >
                            {chip}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {evalLines.length > 0 ? (
                      <View
                        style={{
                          marginTop: 9,
                          gap: 2,
                        }}
                      >
                        {evalLines.map((line) => (
                          <Text
                            key={`${entry.entryId}-${line}`}
                            style={{
                              color: premium.colors.text.secondary,
                              fontSize: 11,
                              fontWeight: "700",
                              lineHeight: 16,
                            }}
                          >
                            {line}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 16,
              }}
            >
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                  flex: 1,
                  opacity: pressed ? 0.76 : 1,
                  transform: [
                    {
                      scale: pressed ? premium.animation.pressScale : 1,
                    },
                  ],
                })}
              >
                <View
                  style={{
                    minHeight: 46,
                    borderRadius: premium.radius.pill,
                    borderWidth: 1,
                    borderColor: premium.colors.border.subtle,
                    backgroundColor: "rgba(255,255,255,0.055)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: premium.colors.text.secondary,
                      fontSize: 12,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: 0.9,
                    }}
                  >
                    Fermer
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={onRollAgain}
                style={({ pressed }) => ({
                  flex: 1,
                  opacity: pressed ? 0.82 : 1,
                  transform: [
                    {
                      scale: pressed ? premium.animation.pressScale : 1,
                    },
                  ],
                })}
              >
                <LinearGradient
                  colors={["rgba(232,200,120,0.28)", "rgba(5,6,11,0.92)"]}
                  start={{ x: 0.15, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                  style={{
                    minHeight: 46,
                    borderRadius: premium.radius.pill,
                    borderWidth: 1,
                    borderColor: premium.colors.border.accent,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: premium.colors.text.primary,
                      fontSize: 12,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: 0.9,
                    }}
                  >
                    Relancer
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
