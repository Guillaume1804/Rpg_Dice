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
  disabledLabel = "AJOUTE DES DÉS",
  onPress,
}: StickyRollButtonProps) {
  const { theme } = useArcaneTheme();
  const layout = useArcaneLayout();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const buttonHeight = layout.isSmallHeight ? 46 : 52;
  const iconSize = layout.isSmallHeight ? 28 : 32;
  const labelSize = layout.isSmallHeight ? 14 : 16;

  return (
    <View
      pointerEvents="box-none"
      style={{
        width: "100%",
        alignSelf: "center",
        maxWidth: layout.maxContentWidth,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          alignSelf: "center",
          bottom: -6,
          width: "88%",
          height: buttonHeight,
          borderRadius: 999,
          backgroundColor: disabled
            ? "rgba(145, 113, 255, 0.12)"
            : rollTheme.launchButton.glow,
          opacity: disabled ? 0.12 : 0.2,
          shadowColor: disabled
            ? rollTheme.cockpit.magicGlow
            : rollTheme.launchButton.glow,
          shadowOpacity: disabled ? 0.1 : 0.3,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 0 },
          elevation: disabled ? 1 : 6,
        }}
      />

      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={8}
        style={({ pressed }) => ({
          minHeight: buttonHeight,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: disabled
            ? "rgba(145, 113, 255, 0.22)"
            : "rgba(217, 160, 55, 0.92)",
          backgroundColor: disabled
            ? "rgba(43, 42, 103, 0.78)"
            : pressed
              ? "rgba(217, 160, 55, 0.24)"
              : "rgba(217, 160, 55, 0.16)",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          opacity: disabled ? 0.78 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
          shadowColor: disabled
            ? rollTheme.cockpit.magicGlow
            : theme.colors.accent,
          shadowOpacity: disabled ? 0.1 : 0.34,
          shadowRadius: disabled ? 10 : 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: disabled ? 2 : 8,
        })}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -44,
            top: -46,
            width: 132,
            height: 132,
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
            right: -58,
            bottom: -60,
            width: 152,
            height: 152,
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
              width: iconSize,
              height: iconSize,
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
                color: disabled ? theme.colors.textSubtle : theme.colors.accent,
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
              fontSize: labelSize,
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
  );
}