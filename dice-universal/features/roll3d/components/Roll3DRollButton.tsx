// dice-universal/features/roll3d/components/Roll3DRollButton.tsx

import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

type Roll3DRollButtonProps = {
  disabled?: boolean;
  diceCount: number;
  onPress: () => void;
};

export function Roll3DRollButton({
  disabled = false,
  diceCount,
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
            : ["rgba(232,200,120,0.32)", "rgba(5,6,11,0.98)"]
        }
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{
          minHeight: 58,
          borderRadius: premium.radius.xl,
          borderWidth: 1,
          borderColor: isDisabled
            ? premium.colors.border.subtle
            : premium.colors.border.accent,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 14,
            right: 14,
            height: 18,
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
            fontSize: 16,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 1.6,
          }}
        >
          {isDisabled ? "Ajoute des dés" : "Lancer"}
        </Text>

        <Text
          style={{
            color: isDisabled
              ? premium.colors.text.muted
              : premium.colors.accent.primary,
            fontSize: 10,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginTop: 3,
          }}
        >
          {diceCount} dé{diceCount > 1 ? "s" : ""} sur la table
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
