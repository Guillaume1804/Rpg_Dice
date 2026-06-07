// dice-universal/screens/Roll3DScreen.tsx

import { View, useWindowDimensions } from "react-native";

import { Roll3DLauncherSurface } from "../features/roll3d";
import { PremiumRollScreenBackground } from "../features/roll/premium";
import { useArcaneLayout } from "../theme/useArcaneLayout";
import { useArcaneTheme } from "../theme/ArcaneThemeProvider";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function Roll3DScreen() {
  const layout = useArcaneLayout();
  const { styles } = useArcaneTheme();
  const { height: windowHeight } = useWindowDimensions();

  /**
   * La bottom tab bar reste visible.
   * On réserve une zone basse stable pour éviter que la table ou les contrôles
   * passent derrière la navigation.
   */
  const bottomNavigationClearance = 104;

  /**
   * Petite marge haute/basse pour laisser respirer la scène.
   * Cet espace servira aussi plus tard aux mises en scène de thèmes/skins.
   */
  const sceneTopPadding = Math.max(layout.insets.top, 10);
  const sceneBottomPadding = layout.insets.bottom + bottomNavigationClearance;

  const availableHeight = windowHeight - sceneTopPadding - sceneBottomPadding;

  /**
   * On évite le Math.max(520, surfaceHeight), trop agressif sur petits écrans.
   * La table doit être immersive, mais ne doit pas forcer le layout à dépasser.
   */
  const surfaceHeight = clamp(
    availableHeight,
    430,
    windowHeight - sceneTopPadding - layout.insets.bottom - 78,
  );

  return (
    <View
      style={{
        ...styles.screen,
        flex: 1,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#050713",
      }}
    >
      <PremiumRollScreenBackground />

      <View
        style={{
          flex: 1,
          zIndex: 1,
          paddingTop: sceneTopPadding,
          paddingBottom: sceneBottomPadding,
          justifyContent: "flex-start",
        }}
      >
        <Roll3DLauncherSurface height={surfaceHeight} maxDice={12} />
      </View>
    </View>
  );
}
