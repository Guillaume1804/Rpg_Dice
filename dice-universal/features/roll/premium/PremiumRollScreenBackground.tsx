// dice-universal/features/roll/premium/PremiumRollScreenBackground.tsx

import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

export function PremiumRollScreenBackground() {
  const premium = usePremiumTheme();

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        backgroundColor: premium.colors.background.primary,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -80,
          left: -80,
          width: 240,
          height: 240,
          borderRadius: premium.radius.pill,
          backgroundColor: premium.colors.surface.subtle,
          opacity: 0.42,
        }}
      />

      <View
        style={{
          position: "absolute",
          top: 118,
          alignSelf: "center",
          width: 300,
          height: 300,
          borderRadius: premium.radius.pill,
          backgroundColor: premium.colors.surface.subtle,
          opacity: 0.22,
        }}
      />

      <View
        style={{
          position: "absolute",
          top: 198,
          alignSelf: "center",
          width: 180,
          height: 180,
          borderRadius: premium.radius.pill,
          backgroundColor: premium.colors.surface.elevated,
          opacity: 0.12,
        }}
      />

      <View
        style={{
          position: "absolute",
          right: -110,
          top: 80,
          width: 260,
          height: 260,
          borderRadius: premium.radius.pill,
          backgroundColor: premium.colors.accent.secondary,
          opacity: 0.025,
        }}
      />

      {/* Voile doux sur la zone basse : transition progressive vers le noir */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(5, 6, 11, 0)",
          "rgba(5, 6, 11, 0.28)",
          "rgba(5, 6, 11, 0.68)",
          "rgba(5, 6, 11, 0.94)",
        ]}
        locations={[0, 0.34, 0.7, 1]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "48%",
        }}
      />

      {/* Ancrage final très sombre derrière la bottom nav et le bouton LANCER */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(0, 0, 0, 0)",
          "rgba(0, 0, 0, 0.34)",
          "rgba(0, 0, 0, 0.72)",
        ]}
        locations={[0, 0.45, 1]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 180,
        }}
      />

      {/* Léger halo central pour éviter une coupure trop plate */}
      <View
        style={{
          position: "absolute",
          left: -60,
          right: -60,
          bottom: 120,
          height: 180,
          borderRadius: premium.radius.pill,
          backgroundColor: premium.colors.surface.subtle,
          opacity: 0.035,
        }}
      />
    </View>
  );
}
