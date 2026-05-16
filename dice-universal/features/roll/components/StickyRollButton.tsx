// dice-universal/features/roll/components/StickyRollButton.tsx

import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useArcaneLayout } from "../../../theme/useArcaneLayout";
import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

type StickyRollButtonProps = {
  disabled: boolean;
  label?: string;
  disabledLabel?: string;
  onPress: () => void | Promise<void>;
};

export function StickyRollButton({
  disabled,
  label = "LANCER LE JET",
  disabledLabel = "PRÉPARE UN JET",
  onPress,
}: StickyRollButtonProps) {
  const { theme } = useArcaneTheme();
  const layout = useArcaneLayout();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  /**
   * IMPORTANT :
   * Ne pas utiliser layout.bottomBarHeight ici.
   * Le bouton doit être collé au bas de l'écran de contenu,
   * juste au-dessus de la tab bar native.
   */
  const bottomOffset = Math.max(layout.insets.bottom, 0) + 8;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
        paddingHorizontal: layout.horizontalPadding,
        zIndex: 100,
        elevation: 100,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          alignSelf: "center",
          bottom: -10,
          width: "88%",
          maxWidth: layout.maxContentWidth,
          height: layout.isSmallHeight ? 58 : 64,
          borderRadius: 999,
          backgroundColor: disabled
            ? "rgba(145, 113, 255, 0.12)"
            : rollTheme.launchButton.glow,
          opacity: disabled ? 0.16 : 0.22,
          shadowColor: disabled
            ? rollTheme.cockpit.magicGlow
            : rollTheme.launchButton.glow,
          shadowOpacity: disabled ? 0.12 : 0.3,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 0 },
          elevation: disabled ? 1 : 6,
        }}
      />

      <View
        style={{
          alignSelf: "center",
          width: "100%",
          maxWidth: layout.maxContentWidth,
        }}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          hitSlop={8}
          style={({ pressed }) => ({
            minHeight: layout.isSmallHeight ? 54 : 58,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: disabled
              ? "rgba(145, 113, 255, 0.22)"
              : "rgba(217, 160, 55, 0.9)",
            backgroundColor: disabled
              ? "rgba(43, 42, 103, 0.82)"
              : pressed
                ? "rgba(217, 160, 55, 0.22)"
                : "rgba(217, 160, 55, 0.15)",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            opacity: disabled ? 0.76 : pressed ? 0.92 : 1,
            transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
            shadowColor: disabled
              ? rollTheme.cockpit.magicGlow
              : theme.colors.accent,
            shadowOpacity: disabled ? 0.12 : 0.34,
            shadowRadius: disabled ? 10 : 20,
            shadowOffset: { width: 0, height: 8 },
            elevation: disabled ? 2 : 8,
          })}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: -40,
              top: -42,
              width: 130,
              height: 130,
              borderRadius: 999,
              backgroundColor: disabled
                ? "rgba(145, 113, 255, 0.1)"
                : "rgba(217, 160, 55, 0.2)",
            }}
          />

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -56,
              bottom: -58,
              width: 150,
              height: 150,
              borderRadius: 999,
              backgroundColor: disabled
                ? "rgba(145, 113, 255, 0.1)"
                : "rgba(160, 92, 255, 0.22)",
            }}
          />

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 18,
              right: 18,
              top: 8,
              height: 1,
              backgroundColor: disabled
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.22)",
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: layout.isSmallHeight ? 34 : 38,
                height: layout.isSmallHeight ? 34 : 38,
                borderRadius: theme.radius.pill,
                borderWidth: 1,
                borderColor: disabled
                  ? "rgba(145, 113, 255, 0.22)"
                  : "rgba(217, 160, 55, 0.88)",
                backgroundColor: disabled
                  ? "rgba(8, 10, 30, 0.42)"
                  : "rgba(217, 160, 55, 0.18)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: disabled
                    ? theme.colors.textSubtle
                    : theme.colors.accent,
                  fontSize: layout.isSmallHeight ? 18 : 20,
                  fontWeight: "900",
                  lineHeight: layout.isSmallHeight ? 22 : 24,
                }}
              >
                ✦
              </Text>
            </View>

            <Text
              numberOfLines={1}
              style={{
                color: disabled ? theme.colors.textSubtle : theme.colors.text,
                fontSize: layout.isSmallHeight ? 16 : 18,
                fontWeight: "900",
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              {disabled ? disabledLabel : label}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}