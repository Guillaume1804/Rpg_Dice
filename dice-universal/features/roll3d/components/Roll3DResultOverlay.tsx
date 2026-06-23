// dice-universal/features/roll3d/components/Roll3DResultOverlay.tsx

import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DRollSummary } from "../types";
import { buildRoll3DResultPresentation } from "../presentation/roll3DResultPresentation";
import {
  buildRoll3DResultSkinEvents,
  formatRoll3DResultEventLabel,
  getRoll3DResultToneVisual,
  type Roll3DResultToneVisual,
} from "../presentation/roll3DResultSkinEvents";
import type { Roll3DResultPresentationSection } from "../presentation/roll3DResultPresentation";

type Roll3DResultOverlayProps = {
  result: Roll3DRollSummary | null;
  visible: boolean;
  canSaveAdjustedAction?: boolean;
  onClose: () => void;
  onRollAgain: () => void;
  onSaveAdjustedAction?: () => void;
};

function formatRollTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ResultToneBadge({
  toneVisual,
  title,
}: {
  toneVisual: Roll3DResultToneVisual;
  title: string;
}) {
  return (
    <View
      style={{
        borderRadius: 999,
        borderWidth: 1,
        borderColor: toneVisual.borderColor,
        backgroundColor: toneVisual.backgroundColor,
        paddingHorizontal: 11,
        paddingVertical: 7,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
      }}
    >
      <Text
        style={{
          color: toneVisual.textColor,
          fontSize: 12,
          fontWeight: "900",
        }}
      >
        {toneVisual.icon}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: toneVisual.textColor,
          fontSize: 10,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.75,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function ResultEventChips({
  events,
}: {
  events: ReturnType<typeof buildRoll3DResultSkinEvents>["highlightedEvents"];
}) {
  const premium = usePremiumTheme();

  if (events.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 6,
        marginTop: 12,
      }}
    >
      {events.slice(0, 5).map((event) => (
        <View
          key={`skin-event-${event}`}
          style={{
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.16)",
            backgroundColor: "rgba(255,255,255,0.04)",
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              color: premium.colors.text.secondary,
              fontSize: 9,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {formatRoll3DResultEventLabel(event)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ResultSummaryBlock({
  lines,
  toneVisual,
}: {
  lines: string[];
  toneVisual: Roll3DResultToneVisual;
}) {
  const premium = usePremiumTheme();

  if (lines.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        marginTop: 14,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: toneVisual.borderColor,
        backgroundColor: toneVisual.backgroundColor,
        paddingHorizontal: 13,
        paddingVertical: 12,
      }}
    >
      <Text
        style={{
          color: toneVisual.textColor,
          fontSize: 10,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.9,
          marginBottom: 7,
        }}
      >
        Lecture immédiate
      </Text>

      {lines.slice(0, 4).map((line) => (
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
  );
}

function ResultStatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: Roll3DResultPresentationSection["tone"];
}) {
  const premium = usePremiumTheme();

  const toneVisual = tone ? getRoll3DResultToneVisual(tone) : null;

  return (
    <View
      style={{
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: toneVisual
          ? toneVisual.borderColor
          : "rgba(255,255,255,0.08)",
        backgroundColor: toneVisual
          ? toneVisual.backgroundColor
          : "rgba(0,0,0,0.16)",
        paddingHorizontal: 9,
        paddingVertical: 6,
        gap: 1,
      }}
    >
      <Text
        style={{
          color: premium.colors.text.muted,
          fontSize: 8,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.45,
        }}
      >
        {label}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: toneVisual ? toneVisual.textColor : premium.colors.text.primary,
          fontSize: 11,
          fontWeight: "900",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function ResultDiePill({
  value,
  index,
}: {
  value: number;
  index: number;
}) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        minWidth: 36,
        height: 36,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(232, 200, 120, 0.20)",
        backgroundColor: "rgba(232, 200, 120, 0.08)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
      }}
    >
      <Text
        style={{
          color: premium.colors.accent.primary,
          fontSize: 14,
          fontWeight: "900",
          lineHeight: 16,
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          color: premium.colors.text.muted,
          fontSize: 7,
          fontWeight: "900",
          marginTop: 1,
        }}
      >
        #{index + 1}
      </Text>
    </View>
  );
}

function ResultSectionCard({
  section,
}: {
  section: Roll3DResultPresentationSection;
}) {
  const premium = usePremiumTheme();
  const sectionToneVisual = getRoll3DResultToneVisual(section.tone);
  const hasSpecialTone = section.tone !== "neutral";

  return (
    <View
      style={{
        borderRadius: 22,
        borderWidth: 1,
        borderColor: hasSpecialTone
          ? sectionToneVisual.borderColor
          : "rgba(255,255,255,0.075)",
        backgroundColor: hasSpecialTone
          ? sectionToneVisual.backgroundColor
          : "rgba(255,255,255,0.045)",
        padding: 12,
        gap: 11,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={2}
            style={{
              color: premium.colors.text.primary,
              fontSize: 13,
              fontWeight: "900",
              lineHeight: 17,
            }}
          >
            {section.title}
          </Text>

          <Text
            numberOfLines={1}
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
            gap: 6,
          }}
        >
          {section.chips.map((chip) => (
            <View
              key={`${section.id}-${chip}`}
              style={{
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.075)",
                backgroundColor: "rgba(0,0,0,0.16)",
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 9,
                  fontWeight: "900",
                }}
              >
                {chip}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {section.diceValues.length > 0 ? (
        <View style={{ gap: 7 }}>
          <Text
            style={{
              color: premium.colors.text.muted,
              fontSize: 9,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Dés de cette entrée
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 7,
              paddingRight: 4,
            }}
          >
            {section.diceValues.map((value, index) => (
              <ResultDiePill
                key={`${section.id}-die-${index}-${value}`}
                value={value}
                index={index}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {section.stats.length > 0 ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 7,
          }}
        >
          {section.stats.map((stat) => (
            <ResultStatPill
              key={`${section.id}-stat-${stat.label}-${stat.value}`}
              label={stat.label}
              value={stat.value}
              tone={stat.tone}
            />
          ))}
        </View>
      ) : null}

      {section.lines.length > 0 ? (
        <View
          style={{
            gap: 4,
          }}
        >
          <Text
            style={{
              color: premium.colors.text.muted,
              fontSize: 9,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Interprétation
          </Text>

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
}

function ResultActionButton({
  label,
  variant,
  disabled,
  onPress,
}: {
  label: string;
  variant: "neutral" | "primary" | "success";
  disabled?: boolean;
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  const isPrimary = variant === "primary";
  const isSuccess = variant === "success";

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        opacity: disabled ? 0.42 : pressed ? 0.78 : 1,
        transform: [
          {
            scale: pressed && !disabled ? premium.animation.pressScale : 1,
          },
        ],
      })}
    >
      {isPrimary ? (
        <LinearGradient
          colors={["rgba(232,200,120,0.30)", "rgba(5,6,11,0.92)"]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            minHeight: 46,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: premium.colors.border.accent,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 8,
          }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.74}
            style={{
              color: premium.colors.text.primary,
              fontSize: 12,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.9,
              textAlign: "center",
            }}
          >
            {label}
          </Text>
        </LinearGradient>
      ) : (
        <View
          style={{
            minHeight: 46,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: isSuccess
              ? "rgba(136, 211, 154, 0.32)"
              : "rgba(255,255,255,0.08)",
            backgroundColor: isSuccess
              ? "rgba(136, 211, 154, 0.12)"
              : "rgba(255,255,255,0.055)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 8,
          }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.74}
            style={{
              color: isSuccess
                ? premium.colors.state.success
                : premium.colors.text.secondary,
              fontSize: 11,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.7,
              textAlign: "center",
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function Roll3DResultOverlay({
  result,
  visible,
  canSaveAdjustedAction = false,
  onClose,
  onRollAgain,
  onSaveAdjustedAction,
}: Roll3DResultOverlayProps) {
  const premium = usePremiumTheme();
  const insets = useSafeAreaInsets();

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowDetails(false);
    }
  }, [visible, result?.id]);

  if (!result) {
    return null;
  }

  const presentation = buildRoll3DResultPresentation(result);
  const skinEvents = buildRoll3DResultSkinEvents(presentation);
  const toneVisual = getRoll3DResultToneVisual(skinEvents.tone);

  const hasDetails = presentation.sections.length > 0;
  const detailCount = presentation.sections.length;

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
          backgroundColor: "rgba(0, 0, 0, 0.68)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
          paddingTop: Math.max(28, insets.top + 18),
          paddingBottom: Math.max(28, insets.bottom + 18),
        }}
      >
        <Pressable
          onPress={() => {
            return;
          }}
          style={{
            width: "100%",
            maxWidth: 420,
            maxHeight: "94%",
          }}
        >
          <LinearGradient
            colors={["rgba(24, 26, 36, 0.985)", "rgba(5, 6, 11, 0.99)"]}
            start={{ x: 0.12, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{
              borderRadius: 32,
              borderWidth: 1,
              borderColor: toneVisual.borderColor,
              padding: 16,
              overflow: "hidden",
            }}
          >
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: -90,
                left: -40,
                right: -40,
                height: 210,
                backgroundColor: toneVisual.backgroundColor,
                opacity: 0.75,
                borderBottomLeftRadius: 180,
                borderBottomRightRadius: 180,
              }}
            />

            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 28,
                right: 28,
                height: 18,
                borderBottomLeftRadius: premium.radius.pill,
                borderBottomRightRadius: premium.radius.pill,
                backgroundColor: "rgba(255,255,255,0.07)",
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
                  fontSize: 10,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                }}
              >
                Révélation du jet
              </Text>

              <ResultToneBadge
                toneVisual={toneVisual}
                title={presentation.title}
              />
            </View>

            <View
              style={{
                marginTop: 18,
                alignItems: "center",
                paddingHorizontal: 4,
              }}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.48}
                style={{
                  color: premium.colors.text.primary,
                  fontSize: 68,
                  fontWeight: "900",
                  letterSpacing: -2.4,
                  lineHeight: 74,
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
                  letterSpacing: 1.3,
                  marginTop: -2,
                  textAlign: "center",
                }}
              >
                {presentation.mainLabel}
              </Text>

              <Text
                numberOfLines={2}
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 12,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.9,
                  marginTop: 8,
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

              <ResultEventChips events={skinEvents.highlightedEvents} />
            </View>

            <ResultSummaryBlock
              lines={presentation.summaryLines}
              toneVisual={toneVisual}
            />

            {hasDetails ? (
              <Pressable
                onPress={() => setShowDetails((current) => !current)}
                style={({ pressed }) => ({
                  marginTop: 13,
                  opacity: pressed ? 0.78 : 1,
                  transform: [
                    {
                      scale: pressed ? premium.animation.pressScale : 1,
                    },
                  ],
                })}
              >
                <View
                  style={{
                    minHeight: 42,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.085)",
                    backgroundColor: "rgba(255,255,255,0.045)",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 12,
                  }}
                >
                  <Text
                    style={{
                      color: premium.colors.text.secondary,
                      fontSize: 11,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    {showDetails
                      ? "Masquer les détails"
                      : `Voir entrées & dés · ${detailCount}`}
                  </Text>
                </View>
              </Pressable>
            ) : null}

            {showDetails ? (
              <View
                style={{
                  marginTop: 12,
                  paddingHorizontal: 2,
                }}
              >
                <Text
                  style={{
                    color: premium.colors.text.muted,
                    fontSize: 9,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.9,
                  }}
                >
                  Détail complet du lancer
                </Text>
              </View>
            ) : null}

            {showDetails ? (
              <ScrollView
                style={{
                  maxHeight: 280,
                  marginTop: 8,
                }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 10,
                  paddingBottom: 12,
                }}
              >
                {presentation.sections.map((section) => (
                  <ResultSectionCard key={section.id} section={section} />
                ))}
              </ScrollView>
            ) : null}

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 16,
              }}
            >
              <ResultActionButton
                label="Fermer"
                variant="neutral"
                onPress={onClose}
              />

              {canSaveAdjustedAction && onSaveAdjustedAction ? (
                <ResultActionButton
                  label="Sauvegarder"
                  variant="success"
                  onPress={onSaveAdjustedAction}
                />
              ) : null}

              <ResultActionButton
                label="Relancer"
                variant="primary"
                onPress={onRollAgain}
              />
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}