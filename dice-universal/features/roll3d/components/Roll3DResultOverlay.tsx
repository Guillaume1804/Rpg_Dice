// dice-universal/features/roll3d/components/Roll3DResultOverlay.tsx

import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DRollSummary } from "../types";
import {
  buildRoll3DResultPresentation,
  type Roll3DResultTone,
} from "../presentation/roll3DResultPresentation";

type Roll3DResultOverlayProps = {
  result: Roll3DRollSummary | null;
  visible: boolean;
  onClose: () => void;
  onRollAgain: () => void;
};

function formatRollTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getToneVisual(tone: Roll3DResultTone) {
  switch (tone) {
    case "criticalSuccess":
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

    case "criticalFailure":
      return {
        label: "Échec critique",
        icon: "!",
        borderColor: "rgba(255, 88, 88, 0.72)",
        backgroundColor: "rgba(190, 28, 28, 0.18)",
        textColor: "#FF7D7D",
      };

    case "complication":
      return {
        label: "Complication",
        icon: "◇",
        borderColor: "rgba(255, 188, 92, 0.6)",
        backgroundColor: "rgba(190, 114, 36, 0.16)",
        textColor: "#FFC978",
      };

    case "neutral":
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

  const presentation = buildRoll3DResultPresentation(result);
  const toneVisual = getToneVisual(presentation.tone);

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
              borderColor: toneVisual.borderColor,
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
                backgroundColor: toneVisual.backgroundColor,
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
                  borderColor: toneVisual.borderColor,
                  backgroundColor: toneVisual.backgroundColor,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    color: toneVisual.textColor,
                    fontSize: 11,
                    fontWeight: "900",
                  }}
                >
                  {toneVisual.icon}
                </Text>

                <Text
                  style={{
                    color: toneVisual.textColor,
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                  }}
                >
                  {presentation.title}
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
                  textAlign: "center",
                }}
              >
                {presentation.mainValue}
              </Text>

              <Text
                style={{
                  color: premium.colors.accent.primary,
                  fontSize: 11,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginTop: -2,
                  textAlign: "center",
                }}
              >
                {presentation.mainLabel}
              </Text>

              <Text
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 12,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginTop: 6,
                  textAlign: "center",
                }}
              >
                {presentation.subtitle}
              </Text>

              <Text
                style={{
                  color: premium.colors.text.muted,
                  fontSize: 11,
                  fontWeight: "700",
                  marginTop: 5,
                  textAlign: "center",
                }}
              >
                {result.dice.length} dé{result.dice.length > 1 ? "s" : ""} ·{" "}
                {formatRollTime(result.createdAt)}
              </Text>
            </View>

            {presentation.summaryLines.length > 0 ? (
              <View
                style={{
                  marginTop: 14,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: toneVisual.borderColor,
                  backgroundColor: toneVisual.backgroundColor,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    color: toneVisual.textColor,
                    fontSize: 11,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.9,
                    marginBottom: 7,
                  }}
                >
                  Interprétation officielle
                </Text>

                {presentation.summaryLines.map((line) => (
                  <Text
                    key={`presentation-summary-${line}`}
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
              {presentation.sections.map((section) => {
                const sectionToneVisual = getToneVisual(section.tone);
                const hasSpecialTone = section.tone !== "neutral";

                return (
                  <View
                    key={section.id}
                    style={{
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: hasSpecialTone
                        ? sectionToneVisual.borderColor
                        : premium.colors.border.subtle,
                      backgroundColor: hasSpecialTone
                        ? sectionToneVisual.backgroundColor
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
                          {section.title}
                        </Text>

                        <Text
                          style={{
                            color: premium.colors.text.muted,
                            fontSize: 10,
                            fontWeight: "800",
                            marginTop: 3,
                          }}
                        >
                          {section.subtitle ?? "Somme simple"}
                        </Text>
                      </View>

                      {hasSpecialTone ? (
                        <View
                          style={{
                            borderRadius: premium.radius.pill,
                            borderWidth: 1,
                            borderColor: sectionToneVisual.borderColor,
                            backgroundColor: "rgba(0,0,0,0.18)",
                            paddingHorizontal: 9,
                            paddingVertical: 5,
                          }}
                        >
                          <Text
                            style={{
                              color: sectionToneVisual.textColor,
                              fontSize: 10,
                              fontWeight: "900",
                            }}
                          >
                            {sectionToneVisual.label}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {section.chips.length > 0 ? (
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 7,
                          marginTop: 10,
                        }}
                      >
                        {section.chips.map((chip) => (
                          <View
                            key={`${section.id}-${chip}`}
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
                    ) : null}

                    {section.lines.length > 0 ? (
                      <View
                        style={{
                          marginTop: 9,
                          gap: 2,
                        }}
                      >
                        {section.lines.map((line) => (
                          <Text
                            key={`${section.id}-${line}`}
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
