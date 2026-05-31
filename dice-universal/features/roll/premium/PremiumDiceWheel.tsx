// dice-universal/features/roll/premium/PremiumDiceWheel.tsx

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

type PremiumDiceWheelProps = {
  title?: string;
  subtitle?: string;
  dice: number[];
  countsBySides?: Record<number, number>;
  modifierValue?: number;
  onIncrementModifier?: () => void;
  onDecrementModifier?: () => void;
  onPressDie: (sides: number) => void;
  onLongPressDie?: (sides: number) => void;
};

type DiceLayout = {
  angle: number;
  size: number;
  height: number;
  featured: boolean;
  zIndex: number;
};

function getDieShapeLabel(sides: number) {
  if (sides === 4) return "△";
  if (sides === 6) return "□";
  if (sides === 8) return "◇";
  if (sides === 10) return "⬟";
  if (sides === 12) return "⬢";
  if (sides === 20) return "✦";
  if (sides === 100) return "%";
  return "◈";
}

function getDieDisplayLabel(sides: number) {
  if (sides === 100) return "d100";
  return `d${sides}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function getDiceLayout(sides: number, featuredSides: number): DiceLayout {
  if (sides === featuredSides) {
    return {
      angle: 90,
      size: 66,
      height: 76,
      featured: true,
      zIndex: 50,
    };
  }

  switch (sides) {
    case 12:
      return { angle: 112, size: 45, height: 53, featured: false, zIndex: 36 };
    case 10:
      return { angle: 68, size: 45, height: 53, featured: false, zIndex: 36 };
    case 100:
      return { angle: 133, size: 45, height: 53, featured: false, zIndex: 30 };
    case 8:
      return { angle: 47, size: 45, height: 53, featured: false, zIndex: 30 };
    case 6:
      return { angle: 154, size: 45, height: 53, featured: false, zIndex: 24 };
    case 4:
      return { angle: 26, size: 45, height: 53, featured: false, zIndex: 24 };
    default:
      return { angle: 270, size: 45, height: 53, featured: false, zIndex: 10 };
  }
}

export function PremiumDiceWheel({
  title: _title = "Cercle de dés",
  subtitle: _subtitle = "Appui long : effet",
  dice,
  countsBySides = {},
  modifierValue = 0,
  onIncrementModifier,
  onDecrementModifier,
  onPressDie,
  onLongPressDie,
}: PremiumDiceWheelProps) {
  const { width, height } = useWindowDimensions();
  const premium = usePremiumTheme();

  const appearAnim = useRef(new Animated.Value(0)).current;
  const dicePressAnims = useRef<Record<number, Animated.Value>>({}).current;

  const modifierLabel =
    modifierValue > 0
      ? `+ ${modifierValue}`
      : modifierValue < 0
        ? `− ${Math.abs(modifierValue)}`
        : "0";

  const arenaWidth = Math.max(300, Math.min(width - 48, 620));
  const isVerySmallHeight = height < 760;
  const isCompactHeight = height < 820;

  const arenaHeight = isVerySmallHeight ? 246 : isCompactHeight ? 264 : 284;

  const wheelCenterX = arenaWidth / 2;
  const wheelCenterY = arenaHeight - 20;

  const radiusX = Math.min(arenaWidth * 0.47, 170);
  const radiusY = isVerySmallHeight ? 150 : isCompactHeight ? 162 : 174;

  const outerArcRadiusX = radiusX + 46;
  const outerArcRadiusY = radiusY + 24;
  const innerArcRadiusX = radiusX + 12;
  const innerArcRadiusY = radiusY - 18;
  const lowerArcRadiusX = radiusX - 22;
  const lowerArcRadiusY = radiusY - 58;

  const featuredSides = useMemo(() => {
    if (dice.includes(20)) return 20;
    return dice[0] ?? 20;
  }, [dice]);

  const orderedDice = useMemo(() => {
    const preferredOrder = [20, 12, 10, 100, 8, 6, 4];

    return [...dice].sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a);
      const bIndex = preferredOrder.indexOf(b);

      if (aIndex === -1 && bIndex === -1) return a - b;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  }, [dice]);

  useEffect(() => {
    appearAnim.setValue(0);

    Animated.timing(appearAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appearAnim]);

  const getDiePressAnim = useCallback(
    (sides: number) => {
      if (!dicePressAnims[sides]) {
        dicePressAnims[sides] = new Animated.Value(0);
      }

      return dicePressAnims[sides];
    },
    [dicePressAnims],
  );

  const animateDiePress = useCallback(
    (sides: number, toValue: number) => {
      Animated.spring(getDiePressAnim(sides), {
        toValue,
        useNativeDriver: true,
        friction: 6,
        tension: 150,
      }).start();
    },
    [getDiePressAnim],
  );

  function getDiePosition(layout: DiceLayout) {
    const rad = degToRad(layout.angle);

    const centerX = wheelCenterX + radiusX * Math.cos(rad);
    const centerY = wheelCenterY - radiusY * Math.sin(rad);

    const sideMargin = 8;

    const left = clamp(
      centerX - layout.size / 2,
      sideMargin,
      arenaWidth - layout.size - sideMargin,
    );

    const top = clamp(
      centerY - layout.height / 2,
      8,
      arenaHeight - layout.height - 8,
    );

    return { left, top };
  }

  function renderCountBadge(sides: number, featured = false) {
    const count = countsBySides[sides] ?? 0;

    if (count <= 0) return null;

    return (
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: featured ? 6 : 5,
          right: featured ? 6 : 5,
          minWidth: featured ? 25 : 20,
          height: featured ? 25 : 20,
          borderRadius: premium.radius.pill,
          backgroundColor: "rgba(232, 200, 120, 0.92)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: featured ? 7 : 6,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.22)",
          zIndex: 8,
          elevation: 8,
        }}
      >
        <Text
          style={{
            color: premium.colors.text.inverse,
            fontSize: featured ? 11 : 9,
            fontWeight: "900",
            lineHeight: featured ? 13 : 11,
          }}
        >
          {count > 1 ? `x${count}` : "1"}
        </Text>
      </View>
    );
  }

  function renderDieButton(sides: number, index: number) {
    const count = countsBySides[sides] ?? 0;
    const isActive = count > 0;
    const layout = getDiceLayout(sides, featuredSides);
    const isFeatured = layout.featured;
    const position = getDiePosition(layout);
    const pressAnim = getDiePressAnim(sides);

    const borderColor = isFeatured
      ? premium.colors.border.accent
      : isActive
        ? premium.colors.accent.primary
        : premium.colors.border.default;

    const backgroundColor = isFeatured
      ? premium.colors.accent.soft
      : isActive
        ? premium.colors.accent.softer
        : premium.colors.surface.secondary;

    const symbolColor = isFeatured
      ? premium.colors.accent.primary
      : isActive
        ? premium.colors.accent.primary
        : premium.colors.text.secondary;

    const appearDelay = Math.min(index * 0.055, 0.28);

    const dieOpacity = appearAnim.interpolate({
      inputRange: [0, appearDelay, 1],
      outputRange: [0, 0, isActive || isFeatured ? 1 : 0.82],
      extrapolate: "clamp",
    });

    const dieTranslateY = appearAnim.interpolate({
      inputRange: [0, appearDelay, 1],
      outputRange: [10, 10, 0],
      extrapolate: "clamp",
    });

    const dieAppearScale = appearAnim.interpolate({
      inputRange: [0, appearDelay, 1],
      outputRange: [0.94, 0.94, 1],
      extrapolate: "clamp",
    });

    const diePressScale = pressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [isFeatured ? 1 : 0.995, 0.94],
    });

    const diePressTranslateY = pressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 2],
    });

    return (
      <Animated.View
        key={sides}
        style={{
          position: "absolute",
          left: position.left,
          top: position.top,
          width: layout.size,
          height: layout.height,
          zIndex: layout.zIndex,
          opacity: dieOpacity,
          transform: [
            { translateY: dieTranslateY },
            { scale: dieAppearScale },
            { translateY: diePressTranslateY },
            { scale: diePressScale },
          ],
        }}
      >
        <Pressable
          onPress={() => onPressDie(sides)}
          onPressIn={() => animateDiePress(sides, 1)}
          onPressOut={() => animateDiePress(sides, 0)}
          onLongPress={() => onLongPressDie?.(sides)}
          delayLongPress={300}
          style={({ pressed }) => ({
            width: layout.size,
            height: layout.height,
            borderRadius: isFeatured ? premium.radius.lg : premium.radius.md,
            borderWidth: 1,
            borderColor,
            backgroundColor: pressed
              ? premium.colors.surface.pressed
              : backgroundColor,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: isFeatured ? 0.28 : isActive ? 0.2 : 0.12,
            shadowRadius: isFeatured ? 16 : 8,
            shadowOffset: { width: 0, height: isFeatured ? 9 : 4 },
            elevation: isFeatured ? 9 : isActive ? 4 : 2,
          })}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 5,
              left: 5,
              right: 5,
              height: "38%",
              borderTopLeftRadius: isFeatured
                ? premium.radius.lg
                : premium.radius.md,
              borderTopRightRadius: isFeatured
                ? premium.radius.lg
                : premium.radius.md,
              backgroundColor: "rgba(255, 255, 255, 0.045)",
              opacity: isFeatured ? 0.7 : 0.42,
            }}
          />

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: isFeatured ? 54 : 32,
              height: isFeatured ? 54 : 32,
              borderRadius: premium.radius.pill,
              backgroundColor: isFeatured
                ? premium.colors.accent.soft
                : premium.colors.surface.subtle,
              opacity: isFeatured ? 0.82 : 0.46,
            }}
          />

          <Text
            style={{
              color: symbolColor,
              fontSize: isFeatured ? 27 : 17,
              lineHeight: isFeatured ? 31 : 20,
              fontWeight: "900",
            }}
          >
            {getDieShapeLabel(sides)}
          </Text>

          <Text
            style={{
              marginTop: isFeatured ? 1 : 0,
              color: isFeatured
                ? premium.colors.text.primary
                : premium.colors.text.secondary,
              fontSize: isFeatured ? 18 : 12,
              fontWeight: "900",
              letterSpacing: isFeatured ? 0.2 : 0,
            }}
          >
            {getDieDisplayLabel(sides)}
          </Text>

          {renderCountBadge(sides, isFeatured)}
        </Pressable>
      </Animated.View>
    );
  }

  const wheelAppearOpacity = appearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1],
  });

  const wheelAppearScale = appearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });

  const wheelAppearTranslateY = appearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  return (
    <Animated.View
      style={{
        height: arenaHeight,
        alignSelf: "center",
        width: "100%",
        maxWidth: arenaWidth,
        backgroundColor: "transparent",
        overflow: "visible",
        marginTop: isVerySmallHeight ? -14 : -18,
        marginBottom: isVerySmallHeight ? -14 : -18,
        opacity: wheelAppearOpacity,
        transform: [
          { translateY: wheelAppearTranslateY },
          { scale: wheelAppearScale },
        ],
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          alignSelf: "center",
          top: wheelCenterY - outerArcRadiusY,
          width: outerArcRadiusX * 2,
          height: outerArcRadiusY * 2,
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor: premium.colors.border.accent,
          opacity: 0.13,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          alignSelf: "center",
          top: wheelCenterY - innerArcRadiusY,
          width: innerArcRadiusX * 2,
          height: innerArcRadiusY * 2,
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor: premium.colors.border.default,
          opacity: 0.2,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          alignSelf: "center",
          top: wheelCenterY - lowerArcRadiusY,
          width: lowerArcRadiusX * 2,
          height: lowerArcRadiusY * 2,
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor: premium.colors.border.subtle,
          opacity: 0.18,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          alignSelf: "center",
          top: 104,
          width: 150,
          height: 150,
          borderRadius: premium.radius.pill,
          backgroundColor: premium.colors.surface.subtle,
          opacity: 0.24,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: arenaWidth * 0.21,
          top: 124,
          width: 4,
          height: 4,
          borderRadius: premium.radius.pill,
          backgroundColor: premium.colors.accent.primary,
          opacity: 0.28,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: arenaWidth * 0.21,
          top: 124,
          width: 4,
          height: 4,
          borderRadius: premium.radius.pill,
          backgroundColor: premium.colors.accent.primary,
          opacity: 0.28,
        }}
      />

      <View
        pointerEvents="auto"
        style={{
          position: "absolute",
          alignSelf: "center",
          top: isVerySmallHeight ? 124 : isCompactHeight ? 132 : 138,
          width: 166,
          alignItems: "center",
          gap: isVerySmallHeight ? 6 : 8,
          zIndex: 4,
        }}
      >
        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: premium.typography.tiny,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.9,
          }}
        >
          Modificateur
        </Text>

        <View
          style={{
            width: 140,
            height: 38,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: premium.colors.border.subtle,
            backgroundColor: premium.colors.surface.primary,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            ...premium.shadow.soft,
          }}
        >
          <Pressable
            onPress={onDecrementModifier}
            disabled={!onDecrementModifier}
            hitSlop={8}
            style={({ pressed }) => ({
              width: 28,
              height: 28,
              borderRadius: premium.radius.pill,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.72 : 1,
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <Text
              style={{
                color: premium.colors.text.secondary,
                fontSize: 20,
                fontWeight: "900",
              }}
            >
              –
            </Text>
          </Pressable>

          <Text
            style={{
              color:
                modifierValue === 0
                  ? premium.colors.text.muted
                  : modifierValue > 0
                    ? premium.colors.accent.primary
                    : premium.colors.state.failure,
              fontSize: 17,
              fontWeight: "900",
              minWidth: 34,
              textAlign: "center",
            }}
          >
            {modifierLabel}
          </Text>

          <Pressable
            onPress={onIncrementModifier}
            disabled={!onIncrementModifier}
            hitSlop={8}
            style={({ pressed }) => ({
              width: 28,
              height: 28,
              borderRadius: premium.radius.pill,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.72 : 1,
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <Text
              style={{
                color: premium.colors.text.secondary,
                fontSize: 20,
                fontWeight: "900",
              }}
            >
              +
            </Text>
          </Pressable>
        </View>
      </View>

      {orderedDice
        .filter((sides) => sides !== featuredSides)
        .map((sides, index) => renderDieButton(sides, index))}

      {orderedDice
        .filter((sides) => sides === featuredSides)
        .map((sides, index) =>
          renderDieButton(sides, orderedDice.length + index),
        )}
    </Animated.View>
  );
}
