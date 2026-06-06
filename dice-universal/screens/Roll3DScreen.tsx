// dice-universal/screens/Roll3DScreen.tsx

import { View, useWindowDimensions } from "react-native";

import { Roll3DLauncherSurface } from "../features/roll3d";
import { PremiumRollScreenBackground } from "../features/roll/premium";
import { useArcaneLayout } from "../theme/useArcaneLayout";
import { useArcaneTheme } from "../theme/ArcaneThemeProvider";

export default function Roll3DScreen() {
  const layout = useArcaneLayout();
  const { styles } = useArcaneTheme();
  const { height: windowHeight } = useWindowDimensions();

  /**
   * La bottom tab bar reste présente.
   * On garde donc une réserve basse pour éviter que les contrôles flottants
   * soient masqués par la navigation.
   */
  const bottomNavigationClearance = 104;

  const surfaceHeight =
    windowHeight - layout.insets.top - layout.insets.bottom - bottomNavigationClearance;

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
          paddingTop: layout.insets.top,
          paddingBottom: layout.insets.bottom + bottomNavigationClearance,
        }}
      >
        <Roll3DLauncherSurface
          height={Math.max(520, surfaceHeight)}
          maxDice={12}
        />
      </View>
    </View>
  );
}