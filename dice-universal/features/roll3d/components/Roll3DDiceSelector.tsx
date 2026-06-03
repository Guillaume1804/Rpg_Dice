// dice-universal/features/roll3d/components/Roll3DDiceSelector.tsx

import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DDieSides } from "../types";
import { STANDARD_ROLL_3D_DICE } from "../constants";

type Roll3DDiceSelectorProps = {
  selectedSides: Roll3DDieSides;
  diceCount?: number;
  maxDice?: number;
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
  diceCount = 0,
  maxDice = 12,
  onSelectSides,
  onClearDice,
}: Roll3DDiceSelectorProps) {
  const premium = usePremiumTheme();
  const isFull = diceCount >= maxDice;
  const hasDice = diceCount > 0;

  return (
    <View
      style={{
        width: "100%",
        borderRadius: premium.radius.xl,
        borderWidth: 1,
        borderColor: premium.colors.border.subtle,
        backgroundColor: "rgba(5, 6, 11, 0.72)",
        paddingVertical: 10,
        paddingHorizontal: 10,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <View>
          <Text
            style={{
              color: premium.colors.text.muted,
              fontSize: 10,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Table 3D
          </Text>

          <Text
            style={{
              color: isFull
                ? premium.colors.accent.primary
                : premium.colors.text.secondary,
              fontSize: 10,
              fontWeight: "800",
              marginTop: 3,
            }}
          >
            {diceCount}/{maxDice} dés posés
          </Text>
        </View>

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
              paddingHorizontal: 12,
              paddingVertical: 7,
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
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 9,
          paddingRight: 2,
        }}
      >
        {STANDARD_ROLL_3D_DICE.map((sides) => {
          const selected = sides === selectedSides;

          return (
            <Pressable
              key={`roll-3d-selector-${sides}`}
              disabled={isFull}
              onPress={() => onSelectSides(sides)}
              style={({ pressed }) => ({
                width: 58,
                height: 66,
                borderRadius: 18,
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
                    ? ["rgba(232, 200, 120, 0.28)", "rgba(5, 6, 11, 0.92)"]
                    : ["rgba(255, 255, 255, 0.08)", "rgba(5, 6, 11, 0.9)"]
                }
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={{
                  flex: 1,
                  borderRadius: 18,
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
                    height: 18,
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
                    fontSize: sides === 100 ? 20 : 22,
                    fontWeight: "900",
                    lineHeight: 26,
                    marginBottom: 2,
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
                    letterSpacing: 0.8,
                  }}
                >
                  d{sides}
                </Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </ScrollView>

      {isFull ? (
        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 10,
            fontWeight: "700",
            marginTop: 8,
          }}
        >
          Limite temporaire atteinte. Vide la table pour ajouter d’autres dés.
        </Text>
      ) : null}
    </View>
  );
}
