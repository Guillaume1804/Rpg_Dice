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

function formatRollTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
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
                }}
              >
                {result.modifierTotal !== 0
                  ? "Moteur officiel · modificateurs"
                  : "Moteur officiel · somme"}
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 8,
                paddingTop: 16,
                paddingBottom: 4,
              }}
            >
              {result.dice.map((die) => (
                <View
                  key={die.id}
                  style={{
                    borderRadius: premium.radius.pill,
                    borderWidth: 1,
                    borderColor: premium.colors.border.subtle,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    paddingHorizontal: 10,
                    paddingVertical: 7,
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
                      ? ` ${die.modifier > 0 ? "+" : "-"} ${Math.abs(
                          die.modifier,
                        )}`
                      : ""}{" "}
                    = {die.total}
                  </Text>
                </View>
              ))}
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
