// dice-universal/features/roll3d/components/Roll3DDiceSelector.tsx

import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DDieSides } from "../types";

type Roll3DDiceSelectorProps = {
  selectedSides: Roll3DDieSides;
  availableSides: Roll3DDieSides[];
  diceCount?: number;
  maxDice?: number;
  compact?: boolean;
  onSelectSides: (sides: Roll3DDieSides) => void;
  onClearDice?: () => void;
};

function getDieSymbol(sides: Roll3DDieSides) {
  if (sides === 4) return "△";
  if (sides === 6) return "□";
  if (sides === 8) return "◇";
  if (sides === 10) return "⬟";
  if (sides === 12) return "⬢";
  if (sides === 20) return "✦";
  return "%";
}

export function Roll3DDiceSelector({
  selectedSides,
  availableSides,
  diceCount = 0,
  maxDice = 12,
  compact = false,
  onSelectSides,
  onClearDice,
}: Roll3DDiceSelectorProps) {
  const premium = usePremiumTheme();

  const isFull = diceCount >= maxDice;
  const hasDice = diceCount > 0;

  const dieButtonWidth = compact ? 46 : 54;
  const dieButtonHeight = compact ? 52 : 62;
  const dieButtonRadius = compact ? 15 : 17;

  return (
    <View
      style={{
        width: "100%",
        paddingVertical: compact ? 4 : 6,
        paddingHorizontal: compact ? 4 : 6,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: compact ? 6 : 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            gap: 8,
          }}
        >
          <Text
            style={{
              color: premium.colors.text.secondary,
              fontSize: 10,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 1.1,
            }}
          >
            Dés
          </Text>

          <Text
            style={{
              color: isFull
                ? premium.colors.accent.primary
                : premium.colors.text.muted,
              fontSize: 10,
              fontWeight: "800",
            }}
          >
            {diceCount}/{maxDice}
          </Text>
        </View>

        {onClearDice ? (
          <Pressable
            disabled={!hasDice || !onClearDice}
            onPress={onClearDice}
            style={({ pressed }) => ({
              opacity: !hasDice || !onClearDice ? 0.34 : pressed ? 0.72 : 1,
              transform: [
                {
                  scale: pressed ? premium.animation.pressScale : 1,
                },
              ],
            })}
          >
            <View
              style={{
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: premium.colors.border.subtle,
                backgroundColor: "rgba(255, 255, 255, 0.055)",
                paddingHorizontal: compact ? 10 : 12,
                paddingVertical: compact ? 5 : 7,
              }}
            >
              <Text
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 10,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Vider
              </Text>
            </View>
          </Pressable>
        ) : null}
      </View>

      {availableSides.length === 0 ? (
        <View
          style={{
            minHeight: compact ? 52 : 62,
            borderRadius: premium.radius.lg,
            borderWidth: 1,
            borderColor: premium.colors.border.subtle,
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
              fontWeight: "800",
              textAlign: "center",
            }}
          >
            Aucun dé disponible pour cette table.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: compact ? 7 : 9,
            paddingRight: 2,
          }}
        >
          {availableSides.map((sides) => {
            const selected = sides === selectedSides;

            return (
              <Pressable
                key={`roll-3d-selector-${sides}`}
                disabled={isFull}
                onPress={() => onSelectSides(sides)}
                style={({ pressed }) => ({
                  width: dieButtonWidth,
                  height: dieButtonHeight,
                  borderRadius: dieButtonRadius,
                  opacity: isFull ? 0.42 : pressed ? 0.82 : 1,
                  transform: [
                    {
                      scale: pressed
                        ? premium.animation.pressScale
                        : selected
                          ? 1.04
                          : 1,
                    },
                  ],
                })}
              >
                <LinearGradient
                  colors={
                    selected
                      ? ["rgba(232, 200, 120, 0.3)", "rgba(5, 6, 11, 0.92)"]
                      : ["rgba(255, 255, 255, 0.075)", "rgba(5, 6, 11, 0.9)"]
                  }
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={{
                    flex: 1,
                    borderRadius: dieButtonRadius,
                    borderWidth: 1,
                    borderColor: selected
                      ? premium.colors.border.accent
                      : premium.colors.border.subtle,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      top: 5,
                      left: 7,
                      right: 7,
                      height: compact ? 14 : 18,
                      borderRadius: premium.radius.pill,
                      backgroundColor: selected
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(255, 255, 255, 0.045)",
                    }}
                  />

                  <Text
                    style={{
                      color: selected
                        ? premium.colors.accent.primary
                        : premium.colors.text.secondary,
                      fontSize: compact
                        ? sides === 100
                          ? 17
                          : 19
                        : sides === 100
                          ? 20
                          : 22,
                      fontWeight: "900",
                      lineHeight: compact ? 22 : 26,
                      marginBottom: compact ? 0 : 2,
                    }}
                  >
                    {getDieSymbol(sides)}
                  </Text>

                  <Text
                    style={{
                      color: selected
                        ? premium.colors.text.primary
                        : premium.colors.text.muted,
                      fontSize: 10,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: 0.7,
                    }}
                  >
                    d{sides}
                  </Text>
                </LinearGradient>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      {isFull ? (
        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 10,
            fontWeight: "700",
            marginTop: 7,
          }}
        >
          Limite temporaire atteinte.
        </Text>
      ) : null}
    </View>
  );
}
