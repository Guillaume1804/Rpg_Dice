// dice-universal/screens/Roll3DScreen.tsx

import { ScrollView, Text, View } from "react-native";

import { Roll3DLauncherSurface } from "../features/roll3d";
import { PremiumRollScreenBackground } from "../features/roll/premium";
import { useArcaneLayout } from "../theme/useArcaneLayout";
import { useArcaneTheme } from "../theme/ArcaneThemeProvider";

export default function Roll3DScreen() {
  const layout = useArcaneLayout();
  const { styles, theme } = useArcaneTheme();

  const bottomNavigationClearance = 128;

  return (
    <View
      style={{
        ...styles.screen,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    >
      <PremiumRollScreenBackground />

      <ScrollView
        style={{
          flex: 1,
          zIndex: 1,
        }}
        contentContainerStyle={{
          paddingTop: layout.insets.top + theme.spacing.md,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom:
            layout.insets.bottom + theme.spacing.xl + bottomNavigationClearance,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignSelf: "center",
            width: "100%",
            maxWidth: layout.maxContentWidth,
            gap: 14,
          }}
        >
          <View
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "rgba(232, 200, 120, 0.18)",
              backgroundColor: "rgba(5, 6, 11, 0.62)",
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <Text
              style={{
                color: theme.colors.accent,
                fontSize: 11,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 1.4,
              }}
            >
              Nouvelle table de lancer
            </Text>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 22,
                fontWeight: "900",
                marginTop: 4,
                letterSpacing: -0.4,
              }}
            >
              Roll3D
            </Text>

            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: 12,
                fontWeight: "700",
                lineHeight: 18,
                marginTop: 6,
              }}
            >
              Écran autonome temporaire pour construire la nouvelle expérience
              de lancer.
            </Text>
          </View>

          <Roll3DLauncherSurface height={320} maxDice={12} />
        </View>
      </ScrollView>
    </View>
  );
}
