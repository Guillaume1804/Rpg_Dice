// dice-universal/app/(tabs)/collection.tsx

import { Text, View } from "react-native";

import { PremiumRollScreenBackground } from "../../features/roll/premium";
import { useArcaneLayout } from "../../theme/useArcaneLayout";
import { useArcaneTheme } from "../../theme/ArcaneThemeProvider";

export default function CollectionScreen() {
  const layout = useArcaneLayout();
  const { styles, theme } = useArcaneTheme();

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

      <View
        style={{
          flex: 1,
          zIndex: 1,
          paddingTop: layout.insets.top + theme.spacing.lg,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: Math.max(
            layout.insets.bottom + theme.spacing.xl,
            theme.spacing.xl,
          ),
          justifyContent: "center",
        }}
      >
        <View
          style={{
            alignSelf: "center",
            width: "100%",
            maxWidth: layout.maxContentWidth,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.16)",
            backgroundColor: "rgba(5, 6, 11, 0.64)",
            padding: 18,
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
            Collection
          </Text>

          <Text
            style={{
              color: theme.colors.text,
              fontSize: 22,
              fontWeight: "900",
              marginTop: 6,
            }}
          >
            Bibliothèque & skins
          </Text>

          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 13,
              fontWeight: "700",
              lineHeight: 19,
              marginTop: 8,
            }}
          >
            Espace temporaire pour les futurs thèmes, skins de dés, éléments
            cosmétiques et contenus possédés.
          </Text>
        </View>
      </View>
    </View>
  );
}
