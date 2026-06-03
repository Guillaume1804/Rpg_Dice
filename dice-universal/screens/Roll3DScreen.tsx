// dice-universal/screens/Roll3DScreen.tsx

import { ScrollView, Text, useWindowDimensions, View } from "react-native";

import { Roll3DLauncherSurface } from "../features/roll3d";
import { PremiumRollScreenBackground } from "../features/roll/premium";
import { useArcaneLayout } from "../theme/useArcaneLayout";
import { useArcaneTheme } from "../theme/ArcaneThemeProvider";

export default function Roll3DScreen() {
  const layout = useArcaneLayout();
  const { styles, theme } = useArcaneTheme();
  const { height: windowHeight } = useWindowDimensions();

  const isSmallScreen = windowHeight < 780;
  const isVerySmallScreen = windowHeight < 720;

  const tableHeight = isVerySmallScreen ? 250 : isSmallScreen ? 286 : 336;
  const bottomNavigationClearance = isVerySmallScreen ? 118 : 132;

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
          paddingTop: layout.insets.top + (isSmallScreen ? 8 : 12),
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom:
            layout.insets.bottom + theme.spacing.lg + bottomNavigationClearance,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignSelf: "center",
            width: "100%",
            maxWidth: layout.maxContentWidth,
            gap: isSmallScreen ? 9 : 11,
          }}
        >
          <View
            style={{
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(232, 200, 120, 0.14)",
              backgroundColor: "rgba(5, 6, 11, 0.48)",
              paddingHorizontal: 14,
              paddingVertical: isSmallScreen ? 9 : 11,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: theme.colors.accent,
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 1.3,
                  }}
                >
                  Table de lancer
                </Text>

                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: isSmallScreen ? 18 : 20,
                    fontWeight: "900",
                    marginTop: 2,
                    letterSpacing: -0.35,
                  }}
                >
                  Lancez vos dés
                </Text>
              </View>

              <View
                style={{
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(232, 200, 120, 0.22)",
                  backgroundColor: "rgba(232, 200, 120, 0.08)",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.accent,
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  3D
                </Text>
              </View>
            </View>

            {!isVerySmallScreen ? (
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 11,
                  fontWeight: "700",
                  lineHeight: 16,
                  marginTop: 6,
                }}
              >
                Ajoutez des dés, lancez-les sur la table, puis lisez le
                résultat.
              </Text>
            ) : null}
          </View>

          <Roll3DLauncherSurface height={tableHeight} maxDice={12} />
        </View>
      </ScrollView>
    </View>
  );
}
