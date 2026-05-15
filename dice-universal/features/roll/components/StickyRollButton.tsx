// dice-universal\features\roll\components\StickyRollButton.tsx

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

  const buttonBackground = disabled
    ? rollTheme.cockpit.panelAlt
    : theme.colors.accentSoft;

  const buttonBorder = disabled
    ? rollTheme.cockpit.borderSoft
    : theme.colors.accent;

  const glowColor = disabled
    ? rollTheme.cockpit.magicGlow
    : rollTheme.launchButton.glow;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: layout.horizontalPadding,
        paddingTop: theme.spacing.md,
        paddingBottom: Math.max(theme.spacing.lg, layout.insets.bottom + 12),
        backgroundColor: rollTheme.cockpit.background,
        borderTopWidth: 1,
        borderTopColor: rollTheme.cockpit.borderSoft,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -40,
          right: -40,
          top: -28,
          height: 96,
          backgroundColor: glowColor,
          opacity: disabled ? 0.07 : 0.14,
          borderRadius: 999,
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
          style={({ pressed }) => ({
            minHeight: 72,
            borderRadius: theme.radius.xl,
            borderWidth: 1,
            borderColor: buttonBorder,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              pressed && !disabled
                ? theme.colors.surfaceSoft
                : buttonBackground,
            opacity: disabled ? 0.64 : pressed ? 0.92 : 1,
            transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
            overflow: "hidden",
            shadowColor: glowColor,
            shadowOpacity: disabled ? 0.08 : 0.34,
            shadowRadius: disabled ? 8 : 22,
            shadowOffset: { width: 0, height: disabled ? 4 : 10 },
            elevation: disabled ? 2 : 8,
          })}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: -36,
              top: -42,
              width: 120,
              height: 120,
              borderRadius: 999,
              backgroundColor: disabled
                ? rollTheme.cockpit.magicGlow
                : theme.colors.accent,
              opacity: disabled ? 0.08 : 0.2,
            }}
          />

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -48,
              bottom: -58,
              width: 150,
              height: 150,
              borderRadius: 999,
              backgroundColor: rollTheme.cockpit.magicGlow,
              opacity: disabled ? 0.08 : 0.16,
            }}
          />

          <Text
            style={{
              color: disabled ? theme.colors.textSubtle : theme.colors.accent,
              fontSize: theme.typography.tiny,
              fontWeight: "900",
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 3,
            }}
          >
            {disabled ? "En attente" : "✦ Prêt à lancer"}
          </Text>

          <Text
            style={{
              color: disabled ? theme.colors.textMuted : theme.colors.text,
              fontSize: 21,
              fontWeight: "900",
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            🎲 {disabled ? disabledLabel : label}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
