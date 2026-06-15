// dice-universal/features/roll3d/components/Roll3DDiceSelector.tsx

import { Pressable, ScrollView, Text, View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DDieSides } from "../types";

type Roll3DDiceSelectorProps = {
  compact?: boolean;
  selectedSides: Roll3DDieSides;
  availableSides: Roll3DDieSides[];
  diceCount: number;
  maxDice: number;
  onSelectSides: (sides: Roll3DDieSides) => void;
  onClearDice?: () => void;
};

function getDieShortLabel(sides: Roll3DDieSides) {
  return `d${sides}`;
}

function getDieHint(sides: Roll3DDieSides) {
  if (sides === 100) return "centile";
  if (sides === 20) return "héroïque";
  if (sides === 12) return "large";
  if (sides === 10) return "décimal";
  if (sides === 8) return "stable";
  if (sides === 6) return "classique";
  if (sides === 4) return "léger";
  return "dé";
}

function DiceQuickButton({
  sides,
  selected,
  disabled,
  compact,
  onPress,
}: {
  sides: Roll3DDieSides;
  selected: boolean;
  disabled: boolean;
  compact: boolean;
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: disabled ? 0.38 : pressed ? 0.78 : 1,
        transform: [
          {
            scale: pressed && !disabled ? premium.animation.pressScale : 1,
          },
        ],
      })}
    >
      <View
        style={{
          width: compact ? 54 : 62,
          minHeight: compact ? 54 : 62,
          borderRadius: compact ? 19 : 22,
          borderWidth: 1,
          borderColor: selected
            ? "rgba(232, 200, 120, 0.38)"
            : "rgba(255,255,255,0.075)",
          backgroundColor: selected
            ? "rgba(232, 200, 120, 0.14)"
            : "rgba(255,255,255,0.045)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 6,
          paddingVertical: 7,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: selected
              ? premium.colors.accent.primary
              : "rgba(255,255,255,0.88)",
            fontSize: sides === 100 ? 14 : 16,
            fontWeight: "900",
            letterSpacing: -0.3,
          }}
        >
          {getDieShortLabel(sides)}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: selected
              ? "rgba(232, 200, 120, 0.62)"
              : "rgba(255,255,255,0.38)",
            fontSize: 8,
            fontWeight: "800",
            marginTop: 3,
          }}
        >
          {getDieHint(sides)}
        </Text>
      </View>
    </Pressable>
  );
}

export function Roll3DDiceSelector({
  compact = true,
  selectedSides,
  availableSides,
  diceCount,
  maxDice,
  onSelectSides,
  onClearDice,
}: Roll3DDiceSelectorProps) {
  const premium = usePremiumTheme();

  const limitReached = diceCount >= maxDice;
  const hasDice = diceCount > 0;

  return (
    <View
      style={{
        width: "100%",
        gap: 9,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          paddingHorizontal: 4,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              color: "rgba(255,255,255,0.54)",
              fontSize: 9,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.9,
            }}
          >
            Dés libres
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: hasDice
                ? premium.colors.accent.primary
                : "rgba(255,255,255,0.82)",
              fontSize: 12,
              fontWeight: "900",
              marginTop: 2,
            }}
          >
            {hasDice
              ? `${diceCount} dé${diceCount > 1 ? "s" : ""} prêt${diceCount > 1 ? "s" : ""}`
              : "Ajoute un dé sur la table"}
          </Text>
        </View>

        <View
          style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: limitReached
              ? "rgba(239, 111, 145, 0.24)"
              : "rgba(255,255,255,0.09)",
            backgroundColor: limitReached
              ? "rgba(239, 111, 145, 0.08)"
              : "rgba(255,255,255,0.045)",
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Text
            style={{
              color: limitReached
                ? "rgba(239, 111, 145, 0.92)"
                : "rgba(255,255,255,0.68)",
              fontSize: 10,
              fontWeight: "900",
            }}
          >
            {diceCount} / {maxDice}
          </Text>
        </View>

        {onClearDice ? (
          <Pressable
            disabled={!hasDice}
            onPress={onClearDice}
            style={({ pressed }) => ({
              opacity: !hasDice ? 0.42 : pressed ? 0.76 : 1,
              transform: [{ scale: pressed && hasDice ? 0.985 : 1 }],
            })}
          >
            <View
              style={{
                minHeight: 32,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: hasDice
                  ? "rgba(239, 111, 145, 0.28)"
                  : "rgba(255,255,255,0.06)",
                backgroundColor: hasDice
                  ? "rgba(239, 111, 145, 0.08)"
                  : "rgba(255,255,255,0.025)",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  color: hasDice
                    ? "rgba(239, 111, 145, 0.92)"
                    : "rgba(255,255,255,0.34)",
                  fontSize: 9,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                Vider
              </Text>
            </View>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: 2,
          paddingVertical: 2,
        }}
      >
        {availableSides.map((sides) => (
          <DiceQuickButton
            key={`roll-3d-free-die-${sides}`}
            sides={sides}
            selected={sides === selectedSides}
            disabled={limitReached}
            compact={compact}
            onPress={() => onSelectSides(sides)}
          />
        ))}
      </ScrollView>

      {limitReached ? (
        <View
          style={{
            borderRadius: 18,
            backgroundColor: "rgba(239, 111, 145, 0.075)",
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              color: "rgba(239, 111, 145, 0.92)",
              fontSize: 10,
              fontWeight: "800",
              lineHeight: 14,
            }}
          >
            Limite atteinte pour ce lancer. Vide la table ou lance les dés
            présents.
          </Text>
        </View>
      ) : null}
    </View>
  );
}