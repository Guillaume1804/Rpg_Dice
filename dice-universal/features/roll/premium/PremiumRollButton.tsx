// dice-universal/features/roll/premium/PremiumRollButton.tsx

import { useCallback, useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { PremiumDiceSkinId } from "../../../theme/premium/premiumTypes";
import { usePremiumDiceSkin } from "../../../theme/premium/usePremiumDiceSkin";
import { runPremiumSpring } from "../../../theme/premium/premiumAnimation";

type PremiumRollButtonProps = {
  disabled: boolean;
  rolling?: boolean;
  focusedLine?: boolean;
  label?: string;
  disabledLabel?: string;
  focusedLineLabel?: string | null;
  onPress: () => void | Promise<void>;
  onClearFocusedLine?: () => void;
};

function getRollButtonSkinStyle(skinId: PremiumDiceSkinId) {
  /**
   * Pour l’instant, tous les skins conservent le rendu Graphite Astral actuel.
   * Plus tard, ce helper permettra de router vers des variantes visuelles :
   * dragon, arcane, metal, cosmic, etc.
   */
  switch (skinId) {
    case "default_2d":
    case "graphite_2d":
    case "dragon":
    case "arcane":
    case "metal":
    case "cosmic":
    default:
      return {
        idleBackground: "#05060B",
        pressedBackground: "#10121B",
        borderColor: "rgba(255, 255, 255, 0.14)",
        topHighlightBackground: "rgba(255, 255, 255, 0.055)",
        disabledTopHighlightBackground: "rgba(255, 255, 255, 0.025)",
        bottomLineColor: "rgba(232, 200, 120, 0.32)",
        disabledBottomLineColor: "rgba(255, 255, 255, 0.04)",
      };
  }
}

export function PremiumRollButton({
  disabled,
  rolling = false,
  focusedLine = false,
  label = "LANCER",
  disabledLabel = "AJOUTE DES DÉS",
  focusedLineLabel,
  onPress,
  onClearFocusedLine,
}: PremiumRollButtonProps) {
  const premium = usePremiumTheme();

  const { skinId } = usePremiumDiceSkin();
  const skinStyle = getRollButtonSkinStyle(skinId);

  const pressAnim = useRef(new Animated.Value(0)).current;

  const displayLabel = disabled
    ? disabledLabel
    : rolling
      ? "LANCEMENT…"
      : label;

  const isInteractive = !disabled && !rolling;

  const animatePress = useCallback(
    (toValue: number) => {
      runPremiumSpring(premium, pressAnim, {
        toValue,
        friction: premium.animation.spring.press.friction,
        tension: premium.animation.spring.press.tension,
        useNativeDriver: true,
      }).start();
    },
    [
      premium,
      pressAnim,
    ],
  );

  useEffect(() => {
    if (isInteractive) return;

    pressAnim.stopAnimation();
    pressAnim.setValue(0);
  }, [isInteractive, pressAnim]);

  const buttonScale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, premium.animation.subtleScale],
  });

  const buttonTranslateY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, premium.animation.translateSmall],
  });

  const innerHighlightOpacity = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.72],
  });

  const bottomLineOpacity = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [disabled ? 0.36 : focusedLine ? 0.82 : 0.48, 0.26],
  });

  return (
    <View style={{ gap: focusedLine && !disabled ? 8 : 0 }}>
      {focusedLine && !disabled ? (
        <View
          style={{
            minHeight: 34,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: premium.colors.border.accent,
            backgroundColor: premium.colors.accent.soft,
            paddingVertical: 5,
            paddingHorizontal: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: premium.spacing.sm,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              color: premium.colors.accent.primary,
              fontSize: 11,
              fontWeight: "900",
            }}
          >
            Ligne ciblée
            {focusedLineLabel ? ` · ${focusedLineLabel}` : ""}
          </Text>

          {onClearFocusedLine ? (
            <Pressable
              onPress={onClearFocusedLine}
              hitSlop={8}
              style={({ pressed }) => ({
                minHeight: 26,
                paddingHorizontal: 10,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: premium.colors.border.subtle,
                backgroundColor: pressed
                  ? premium.colors.surface.pressed
                  : premium.colors.surface.subtle,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.84 : 1,
                transform: [
                  { scale: pressed ? premium.animation.pressScale : 1 },
                ],
              })}
            >
              <Text
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 10,
                  fontWeight: "900",
                }}
              >
                Jet complet
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Animated.View
        style={{
          transform: [{ translateY: buttonTranslateY }, { scale: buttonScale }],
        }}
      >
        <Pressable
          disabled={!isInteractive}
          onPress={onPress}
          onPressIn={() => {
            if (!isInteractive) return;
            animatePress(1);
          }}
          onPressOut={() => {
            if (!isInteractive) return;
            animatePress(0);
          }}
          style={({ pressed }) => ({
            minHeight: focusedLine && !disabled ? 54 : 58,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: disabled
              ? premium.colors.border.subtle
              : focusedLine
                ? premium.colors.border.accent
                : skinStyle.borderColor,
            backgroundColor: disabled
              ? premium.colors.surface.disabled
              : pressed
                ? skinStyle.pressedBackground
                : skinStyle.idleBackground,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: premium.spacing.lg,
            opacity: disabled ? 0.58 : pressed ? 0.96 : 1,
            ...premium.shadow.button,
          })}
        >
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 1,
              left: 1,
              right: 1,
              height: "48%",
              borderTopLeftRadius: premium.radius.pill,
              borderTopRightRadius: premium.radius.pill,
              backgroundColor: disabled
                ? skinStyle.disabledTopHighlightBackground
                : skinStyle.topHighlightBackground,
              opacity: innerHighlightOpacity,
            }}
          />

          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 18,
              right: 18,
              bottom: 0,
              height: 1,
              backgroundColor: disabled
                ? skinStyle.disabledBottomLineColor
                : focusedLine
                  ? premium.colors.accent.primary
                  : skinStyle.bottomLineColor,
              opacity: bottomLineOpacity,
            }}
          />

          <Text
            numberOfLines={1}
            style={{
              color: disabled
                ? premium.colors.text.muted
                : premium.colors.text.primary,
              fontSize: 14,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 1.9,
            }}
          >
            {displayLabel}
          </Text>

          {focusedLine && !disabled ? (
            <Text
              numberOfLines={1}
              style={{
                marginTop: 3,
                color: premium.colors.accent.primary,
                fontSize: 9,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 1.2,
                opacity: 0.82,
              }}
            >
              ligne ciblée
            </Text>
          ) : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}
