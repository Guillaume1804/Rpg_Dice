// dice-universal/features/roll3d/components/Roll3DRollButton.tsx

import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

type Roll3DRollButtonProps = {
  disabled?: boolean;
  diceCount: number;
  compact?: boolean;
  onPress: () => void;
};

export function Roll3DRollButton({
  disabled = false,
  diceCount,
  compact = false,
  onPress,
}: Roll3DRollButtonProps) {
  const premium = usePremiumTheme();

  const isDisabled = disabled || diceCount <= 0;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: "100%",
        opacity: isDisabled ? 0.42 : pressed ? 0.86 : 1,
        transform: [
          {
            scale: pressed ? premium.animation.pressScale : 1,
          },
        ],
      })}
    >
      <LinearGradient
        colors={
          isDisabled
            ? ["rgba(255,255,255,0.06)", "rgba(5,6,11,0.96)"]
            : ["rgba(232,200,120,0.34)", "rgba(5,6,11,0.98)"]
        }
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{
          minHeight: compact ? 60 : 68,
          borderRadius: 28,
          borderWidth: 1,
          borderColor: isDisabled
            ? premium.colors.border.subtle
            : premium.colors.border.accent,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          shadowColor: "#E8C878",
          shadowOpacity: isDisabled ? 0 : 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: isDisabled ? 0 : 7,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 18,
            right: 18,
            height: compact ? 14 : 18,
            borderBottomLeftRadius: premium.radius.pill,
            borderBottomRightRadius: premium.radius.pill,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />

        <Text
          style={{
            color: isDisabled
              ? premium.colors.text.muted
              : premium.colors.text.primary,
            fontSize: compact ? 16 : 17,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 1.7,
          }}
        >
          {isDisabled ? "Prépare une Main" : "Lancer"}
        </Text>

        <Text
          style={{
            color: isDisabled
              ? premium.colors.text.muted
              : premium.colors.accent.primary,
            fontSize: 9,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.9,
            marginTop: compact ? 2 : 3,
          }}
        >
          {isDisabled
            ? "Ajoute des dés ou choisis une Main sauvegardée"
            : `${diceCount} dé${diceCount > 1 ? "s" : ""} dans la Main · toucher pour lancer`}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
