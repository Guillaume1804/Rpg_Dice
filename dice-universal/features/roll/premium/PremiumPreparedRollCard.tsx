// dice-universal/features/roll/premium/PremiumPreparedRollCard.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  PremiumBottomSheet,
  PremiumPill,
  PremiumText,
} from "../../../components/premium";

import { runPremiumTiming } from "../../../theme/premium/premiumAnimation";
import type { PremiumDiceSkinId } from "../../../theme/premium/premiumTypes";
import { usePremiumDiceSkin } from "../../../theme/premium/usePremiumDiceSkin";
import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

export type PremiumPreparedRollCardLine = {
  id: string;
  label: string;
  detail?: string | null;
  sign?: number;
  sides?: number;
  qty?: number;
  modifier?: number;
  hasBehavior?: boolean;
};

type PremiumPreparedRollCardProps = {
  title?: string;
  name: string | null;
  detail: string | null;
  lines?: PremiumPreparedRollCardLine[];
  isEmpty: boolean;
  focusedLineIndex?: number | null;
  onEdit?: () => void;
  onClear?: () => void;
  onSave?: () => void;
  onAdjustLineQty?: (index: number, delta: number) => void;
  onAdjustLineModifier?: (index: number, delta: number) => void;
  onToggleLineSign?: (index: number) => void;
  onRemoveLine?: (index: number) => void;
  onConfigureLineBehavior?: (index: number) => void;
  onRollLine?: (index: number) => void | Promise<void>;
  onFocusLine?: (index: number) => void;
};

function getDieShapeLabel(
  sides: number | undefined,
  skinId: PremiumDiceSkinId,
) {
  /**
   * Pour l’instant, tous les skins utilisent le rendu glyphes par défaut.
   * Plus tard, ce switch permettra de remplacer les glyphes par des images,
   * formes ou composants propres au skin actif.
   */
  switch (skinId) {
    case "default_2d":
    case "graphite_2d":
    case "dragon":
    case "arcane":
    case "metal":
    case "cosmic":
    default:
      if (sides === 4) return "△";
      if (sides === 6) return "□";
      if (sides === 8) return "◇";
      if (sides === 10) return "⬟";
      if (sides === 12) return "⬢";
      if (sides === 20) return "✦";
      if (sides === 100) return "%";
      return "◈";
  }
}

function getDieDisplayLabel(line: PremiumPreparedRollCardLine) {
  if (line.sides === 100) return "d100";
  if (line.sides) return `d${line.sides}`;
  return line.label;
}

function PreparedActionButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent" | "danger";
}) {
  const premium = usePremiumTheme();

  const borderColor =
    variant === "accent"
      ? premium.colors.border.accent
      : variant === "danger"
        ? "rgba(239, 111, 145, 0.38)"
        : premium.colors.border.subtle;

  const backgroundColor =
    variant === "accent"
      ? premium.colors.accent.soft
      : variant === "danger"
        ? premium.colors.state.failureSoft
        : premium.colors.surface.subtle;

  const color =
    variant === "accent"
      ? premium.colors.accent.primary
      : variant === "danger"
        ? premium.colors.state.failure
        : premium.colors.text.secondary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor,
        borderRadius: premium.radius.pill,
        backgroundColor: pressed
          ? premium.colors.surface.pressed
          : backgroundColor,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <Text
        style={{
          color,
          fontSize: 11,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PreparedDieTile({
  line,
  index,
  skinId,
  onAdjustQty,
  onOpenLineConfig,
  isFocused,
}: {
  line: PremiumPreparedRollCardLine;
  index: number;
  skinId: PremiumDiceSkinId;
  onAdjustQty?: (index: number, delta: number) => void;
  onOpenLineConfig?: (index: number) => void;
  isFocused?: boolean;
}) {
  const premium = usePremiumTheme();

  const qty = Math.max(1, line.qty ?? 1);
  const modifier = line.modifier ?? 0;
  const hasModifier = modifier !== 0;
  const modifierLabel = modifier > 0 ? `+${modifier}` : `${modifier}`;

  const isNegative = line.sign === -1;
  const hasBehavior = !!line.hasBehavior;
  const canDecrease = !!onAdjustQty && qty > 1;

  const borderColor = isFocused
    ? premium.colors.border.accent
    : isNegative
      ? "rgba(239, 111, 145, 0.42)"
      : hasBehavior
        ? "rgba(124, 92, 255, 0.46)"
        : premium.colors.border.subtle;

  const backgroundColor = isFocused
    ? premium.colors.accent.soft
    : isNegative
      ? premium.colors.state.failureSoft
      : hasBehavior
        ? "rgba(124, 92, 255, 0.11)"
        : premium.colors.surface.subtle;

  const accentColor = isNegative
    ? premium.colors.state.failure
    : hasBehavior
      ? premium.colors.accent.secondary
      : premium.colors.accent.primary;

  return (
    <Pressable
      onPress={() => onOpenLineConfig?.(index)}
      disabled={!onOpenLineConfig}
      style={({ pressed }) => ({
        width: "23%",
        minWidth: 0,
        height: 68,
        borderRadius: premium.radius.lg,
        borderWidth: 1,
        borderColor,
        backgroundColor: pressed
          ? premium.colors.surface.pressed
          : backgroundColor,
        paddingVertical: 5,
        paddingHorizontal: 5,
        alignItems: "center",
        justifyContent: "space-between",
        overflow: "visible",
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 5,
          right: 5,
          minWidth: 22,
          height: 20,
          paddingHorizontal: 6,
          borderRadius: premium.radius.pill,
          backgroundColor: premium.colors.accent.primary,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.24)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
        }}
      >
        <Text
          style={{
            color: premium.colors.text.inverse,
            fontSize: 9,
            fontWeight: "900",
            lineHeight: 11,
          }}
        >
          x{qty}
        </Text>
      </View>

      {hasBehavior ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 7,
            left: 7,
            width: 8,
            height: 8,
            borderRadius: premium.radius.pill,
            backgroundColor: premium.colors.accent.secondary,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.28)",
            zIndex: 4,
          }}
        />
      ) : null}

      {isFocused ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 5,
            bottom: 24,
            minWidth: 34,
            height: 16,
            paddingHorizontal: 5,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: premium.colors.border.accent,
            backgroundColor: premium.colors.accent.soft,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 4,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.accent.primary,
              fontSize: 8,
              fontWeight: "900",
              lineHeight: 10,
            }}
          >
            CIBLE
          </Text>
        </View>
      ) : null}

      <View style={{ alignItems: "center", gap: 0 }}>
        <Text
          style={{
            color: accentColor,
            fontSize: line.sides === 100 ? 17 : 16,
            fontWeight: "900",
            lineHeight: 18,
          }}
        >
          {getDieShapeLabel(line.sides, skinId)}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            maxWidth: "100%",
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.primary,
              fontSize: line.sides === 100 ? 12 : 13,
              fontWeight: "900",
              lineHeight: 15,
            }}
          >
            {getDieDisplayLabel(line)}
          </Text>

          {hasModifier ? (
            <View
              style={{
                minWidth: 23,
                height: 15,
                paddingHorizontal: 4,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor:
                  modifier > 0
                    ? "rgba(136, 211, 154, 0.32)"
                    : "rgba(239, 111, 145, 0.32)",
                backgroundColor:
                  modifier > 0
                    ? premium.colors.state.successSoft
                    : premium.colors.state.failureSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color:
                    modifier > 0
                      ? premium.colors.state.success
                      : premium.colors.state.failure,
                  fontSize: 8,
                  fontWeight: "900",
                  lineHeight: 10,
                }}
              >
                {modifierLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View
        style={{
          height: 21,
          minWidth: 58,
          borderRadius: premium.radius.pill,
          backgroundColor: premium.colors.surface.secondary,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 7,
          gap: 5,
        }}
      >
        <Pressable
          disabled={!canDecrease}
          onPress={(event) => {
            event.stopPropagation();
            onAdjustQty?.(index, -1);
          }}
          hitSlop={6}
          style={({ pressed }) => ({
            opacity: !canDecrease ? 0.35 : pressed ? 0.68 : 1,
            transform: [{ scale: pressed && canDecrease ? 0.9 : 1 }],
          })}
        >
          <Text
            style={{
              color: premium.colors.text.secondary,
              fontSize: 15,
              fontWeight: "900",
              lineHeight: 17,
            }}
          >
            −
          </Text>
        </Pressable>

        <Text
          style={{
            color: premium.colors.text.primary,
            fontSize: 12,
            fontWeight: "900",
            lineHeight: 15,
            minWidth: 10,
            textAlign: "center",
          }}
        >
          {qty}
        </Text>

        <Pressable
          disabled={!onAdjustQty}
          onPress={(event) => {
            event.stopPropagation();
            onAdjustQty?.(index, 1);
          }}
          hitSlop={6}
          style={({ pressed }) => ({
            opacity: !onAdjustQty ? 0.35 : pressed ? 0.68 : 1,
            transform: [{ scale: pressed && onAdjustQty ? 0.9 : 1 }],
          })}
        >
          <Text
            style={{
              color: premium.colors.text.secondary,
              fontSize: 15,
              fontWeight: "900",
              lineHeight: 17,
            }}
          >
            +
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function CompactStepper({
  label,
  value,
  valueColor,
  onDecrement,
  onIncrement,
  decrementDisabled,
}: {
  label: string;
  value: string;
  valueColor?: string;
  onDecrement?: () => void;
  onIncrement?: () => void;
  decrementDisabled?: boolean;
}) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        flex: 1,
        minWidth: 130,
        borderRadius: premium.radius.lg,
        borderWidth: 1,
        borderColor: premium.colors.border.subtle,
        backgroundColor: premium.colors.surface.subtle,
        paddingVertical: 9,
        paddingHorizontal: 10,
        gap: 7,
      }}
    >
      <PremiumText variant="tiny" tone="muted" uppercase numberOfLines={1}>
        {label}
      </PremiumText>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Pressable
          disabled={!onDecrement || decrementDisabled}
          onPress={onDecrement}
          style={({ pressed }) => ({
            width: 34,
            height: 34,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: premium.colors.border.subtle,
            backgroundColor: premium.colors.surface.secondary,
            alignItems: "center",
            justifyContent: "center",
            opacity:
              !onDecrement || decrementDisabled ? 0.35 : pressed ? 0.72 : 1,
            transform: [
              {
                scale: pressed && onDecrement && !decrementDisabled ? 0.94 : 1,
              },
            ],
          })}
        >
          <Text
            style={{
              color: premium.colors.text.secondary,
              fontSize: 19,
              fontWeight: "900",
              lineHeight: 21,
            }}
          >
            −
          </Text>
        </Pressable>

        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            color: valueColor ?? premium.colors.text.primary,
            fontSize: 18,
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          {value}
        </Text>

        <Pressable
          disabled={!onIncrement}
          onPress={onIncrement}
          style={({ pressed }) => ({
            width: 34,
            height: 34,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: premium.colors.border.subtle,
            backgroundColor: premium.colors.surface.secondary,
            alignItems: "center",
            justifyContent: "center",
            opacity: !onIncrement ? 0.35 : pressed ? 0.72 : 1,
            transform: [{ scale: pressed && onIncrement ? 0.94 : 1 }],
          })}
        >
          <Text
            style={{
              color: premium.colors.text.secondary,
              fontSize: 19,
              fontWeight: "900",
              lineHeight: 21,
            }}
          >
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function LineRollButton({ onPress }: { onPress?: () => void }) {
  const premium = usePremiumTheme();

  if (!onPress) return null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 52,
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: premium.colors.border.accent,
        backgroundColor: pressed
          ? premium.colors.surface.pressed
          : premium.colors.accent.soft,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <Text
        style={{
          color: premium.colors.accent.primary,
          fontSize: 15,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Lancer cette ligne
      </Text>
    </Pressable>
  );
}

function EmptyPreparedState() {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        minHeight: 46,
        borderRadius: premium.radius.lg,
        borderWidth: 1,
        borderColor: premium.colors.border.subtle,
        backgroundColor: "rgba(255, 255, 255, 0.025)",
        paddingVertical: 8,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: premium.spacing.sm,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: premium.radius.md,
          borderWidth: 1,
          borderColor: premium.colors.border.subtle,
          backgroundColor: premium.colors.surface.secondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: premium.colors.text.subtle,
            fontSize: 17,
            fontWeight: "900",
          }}
        >
          ◇
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <PremiumText variant="bodyStrong" numberOfLines={1}>
          Aucun jet préparé
        </PremiumText>

        <PremiumText variant="caption" tone="secondary" numberOfLines={1}>
          Ajoute un dé depuis le cercle.
        </PremiumText>
      </View>
    </View>
  );
}

function formatCompactLineLabel(line: PremiumPreparedRollCardLine) {
  const qty = Math.max(1, line.qty ?? 1);
  const signPrefix = line.sign === -1 ? "−" : "";
  const dieLabel = getDieDisplayLabel(line);
  const modifier = line.modifier ?? 0;

  const modifierLabel =
    modifier > 0 ? ` +${modifier}` : modifier < 0 ? ` ${modifier}` : "";

  return `${signPrefix}${qty}${dieLabel}${modifierLabel}`;
}

function CompactPreparedLineChip({
  line,
  index,
  skinId,
  focused,
  highlighted,
  onOpenLineConfig,
  onAdjustQty,
}: {
  line: PremiumPreparedRollCardLine;
  index: number;
  skinId: PremiumDiceSkinId;
  focused?: boolean;
  highlighted?: boolean;
  onOpenLineConfig?: (index: number) => void;
  onAdjustQty?: (index: number, delta: number) => void;
}) {
  const premium = usePremiumTheme();

  const entryAnim = useRef(new Animated.Value(highlighted ? 0 : 1)).current;
  const wasHighlightedRef = useRef(false);

  useEffect(() => {
    if (!highlighted) {
      wasHighlightedRef.current = false;
      entryAnim.stopAnimation();
      entryAnim.setValue(1);
      return;
    }

    if (wasHighlightedRef.current) return;

    wasHighlightedRef.current = true;
    entryAnim.stopAnimation();
    entryAnim.setValue(0);

    requestAnimationFrame(() => {
      runPremiumTiming(premium, entryAnim, {
        toValue: 1,
        duration: premium.animation.normal,
        useNativeDriver: true,
      }).start();
    });
  }, [highlighted, entryAnim, premium]);

  const entryOpacity = entryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const entryTranslateY = entryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [premium.animation.translateMedium, 0],
  });

  const entryScale = entryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.965, 1],
  });

  const qty = Math.max(1, line.qty ?? 1);
  const isNegative = line.sign === -1;
  const hasBehavior = !!line.hasBehavior;
  const canDecrease = !!onAdjustQty && qty > 1;

  const borderColor = focused
    ? premium.colors.border.accent
    : isNegative
      ? "rgba(239, 111, 145, 0.28)"
      : hasBehavior
        ? "rgba(124, 92, 255, 0.32)"
        : premium.colors.border.subtle;

  const backgroundColor = focused
    ? premium.colors.accent.soft
    : isNegative
      ? premium.colors.state.failureSoft
      : hasBehavior
        ? "rgba(124, 92, 255, 0.08)"
        : premium.colors.surface.secondary;

  const accentColor = focused
    ? premium.colors.accent.primary
    : isNegative
      ? premium.colors.state.failure
      : hasBehavior
        ? premium.colors.accent.secondary
        : premium.colors.text.secondary;

  return (
    <Animated.View
      style={{
        width: 108,
        height: 58,
        opacity: entryOpacity,
        transform: [{ translateY: entryTranslateY }, { scale: entryScale }],
      }}
    >
      <Pressable
        onPress={() => onOpenLineConfig?.(index)}
        disabled={!onOpenLineConfig}
        style={({ pressed }) => ({
          width: "100%",
          height: "100%",
          borderRadius: premium.radius.lg,
          borderWidth: 1,
          borderColor,
          backgroundColor: pressed
            ? premium.colors.surface.pressed
            : backgroundColor,
          paddingHorizontal: 7,
          paddingVertical: 5,
          justifyContent: "space-between",
          opacity: pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
        })}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            minHeight: 25,
          }}
        >
          <View
            style={{
              width: 25,
              height: 25,
              borderRadius: premium.radius.md,
              borderWidth: 1,
              borderColor,
              backgroundColor: premium.colors.surface.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: accentColor,
                fontSize: line.sides === 100 ? 12 : 13,
                fontWeight: "900",
                lineHeight: 15,
              }}
            >
              {getDieShapeLabel(line.sides, skinId)}
            </Text>
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: premium.colors.text.primary,
                  fontSize: 11,
                  fontWeight: "900",
                  lineHeight: 13,
                  flexShrink: 1,
                }}
              >
                {formatCompactLineLabel(line)}
              </Text>

              {hasBehavior ? (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: premium.radius.pill,
                    backgroundColor: premium.colors.accent.secondary,
                  }}
                />
              ) : null}
            </View>

            <Text
              numberOfLines={1}
              style={{
                color: focused
                  ? premium.colors.accent.primary
                  : premium.colors.text.muted,
                fontSize: 8,
                fontWeight: "800",
                lineHeight: 10,
                marginTop: 1,
              }}
            >
              {focused ? "CIBLE" : (line.detail ?? "Somme simple")}
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 22,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: premium.colors.border.subtle,
            backgroundColor: premium.colors.surface.primary,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 10,
          }}
        >
          <Pressable
            disabled={!canDecrease}
            onPress={(event) => {
              event.stopPropagation();
              onAdjustQty?.(index, -1);
            }}
            hitSlop={8}
            style={({ pressed }) => ({
              minWidth: 28,
              height: 22,
              alignItems: "center",
              justifyContent: "center",
              opacity: !canDecrease ? 0.28 : pressed ? 0.68 : 1,
              transform: [{ scale: pressed && canDecrease ? 0.9 : 1 }],
            })}
          >
            <Text
              style={{
                color: premium.colors.text.secondary,
                fontSize: 15,
                fontWeight: "900",
                lineHeight: 17,
              }}
            >
              −
            </Text>
          </Pressable>

          <Text
            style={{
              color: premium.colors.text.primary,
              fontSize: 11,
              fontWeight: "900",
              lineHeight: 13,
              minWidth: 18,
              textAlign: "center",
            }}
          >
            {qty}
          </Text>

          <Pressable
            disabled={!onAdjustQty}
            onPress={(event) => {
              event.stopPropagation();
              onAdjustQty?.(index, 1);
            }}
            hitSlop={8}
            style={({ pressed }) => ({
              minWidth: 28,
              height: 22,
              alignItems: "center",
              justifyContent: "center",
              opacity: !onAdjustQty ? 0.28 : pressed ? 0.68 : 1,
              transform: [{ scale: pressed && onAdjustQty ? 0.9 : 1 }],
            })}
          >
            <Text
              style={{
                color: premium.colors.text.secondary,
                fontSize: 15,
                fontWeight: "900",
                lineHeight: 17,
              }}
            >
              +
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function CompactOverflowChip({
  hiddenCount,
  animationKey,
  onPress,
}: {
  hiddenCount: number;
  animationKey: number;
  onPress: () => void;
}) {
  const premium = usePremiumTheme();
  const bumpAnim = useRef(new Animated.Value(hiddenCount > 0 ? 0 : 1)).current;

  useEffect(() => {
    if (hiddenCount <= 0) {
      bumpAnim.stopAnimation();
      bumpAnim.setValue(1);
      return;
    }

    bumpAnim.stopAnimation();
    bumpAnim.setValue(0);

    requestAnimationFrame(() => {
      runPremiumTiming(premium, bumpAnim, {
        toValue: 1,
        duration: premium.animation.normal,
        useNativeDriver: true,
      }).start();
    });
  }, [animationKey, hiddenCount, bumpAnim, premium]);

  const opacity = bumpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1],
  });

  const scale = bumpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  const translateY = bumpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [premium.animation.translateMedium - premium.animation.translateSmall, 0],
  });

  return (
    <Animated.View
      style={{
        width: 58,
        height: 58,
        opacity,
        transform: [{ translateY }, { scale }],
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          width: "100%",
          height: "100%",
          borderRadius: premium.radius.lg,
          borderWidth: 1,
          borderColor: premium.colors.border.subtle,
          backgroundColor: pressed
            ? premium.colors.surface.pressed
            : premium.colors.surface.secondary,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.84 : 1,
          transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
        })}
      >
        <Text
          style={{
            color: premium.colors.text.secondary,
            fontSize: 12,
            fontWeight: "900",
            lineHeight: 16,
          }}
        >
          +{hiddenCount}
        </Text>

        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 8,
            fontWeight: "800",
            lineHeight: 11,
          }}
        >
          autres
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function CompactPreparedSummary({
  lines,
  skinId,
  focusedLineIndex,
  highlightedLineId,
  overflowAnimationKey,
  onOpenLineConfig,
  onAdjustLineQty,
  onOpenAll,
}: {
  lines: PremiumPreparedRollCardLine[];
  skinId: PremiumDiceSkinId;
  focusedLineIndex?: number | null;
  highlightedLineId?: string | null;
  overflowAnimationKey: number;
  onOpenLineConfig?: (index: number) => void;
  onAdjustLineQty?: (index: number, delta: number) => void;
  onOpenAll: () => void;
}) {
  const visibleLines = lines.slice(0, 2);
  const hiddenCount = Math.max(0, lines.length - visibleLines.length);

  return (
    <View style={{ gap: 0 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 6,
          paddingRight: 0,
          alignItems: "center",
        }}
      >
        {visibleLines.map((line, index) => (
          <CompactPreparedLineChip
            key={`compact-line-chip-${line.id}`}
            line={line}
            index={index}
            skinId={skinId}
            focused={focusedLineIndex === index}
            highlighted={highlightedLineId === line.id}
            onOpenLineConfig={onOpenLineConfig}
            onAdjustQty={onAdjustLineQty}
          />
        ))}

        {hiddenCount > 0 ? (
          <CompactOverflowChip
            hiddenCount={hiddenCount}
            animationKey={overflowAnimationKey}
            onPress={onOpenAll}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function PreparedDiceListSheet({
  visible,
  lines,
  skinId,
  onClose,
  onAdjustLineQty,
  onOpenLineConfig,
  focusedLineIndex,
  onEditFull,
}: {
  visible: boolean;
  lines: PremiumPreparedRollCardLine[];
  skinId: PremiumDiceSkinId;
  onClose: () => void;
  onAdjustLineQty?: (index: number, delta: number) => void;
  onOpenLineConfig?: (index: number) => void;
  focusedLineIndex?: number | null;
  onEditFull?: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <PremiumBottomSheet
      visible={visible}
      title="Tous les dés"
      subtitle={`${lines.length} ligne${lines.length > 1 ? "s" : ""} dans ce jet.`}
      onClose={onClose}
      maxHeight="74%"
    >
      <View style={{ gap: premium.spacing.md }}>
        {onEditFull ? (
          <Pressable
            onPress={() => {
              onClose();
              onEditFull();
            }}
            style={({ pressed }) => ({
              minHeight: 44,
              borderRadius: premium.radius.pill,
              borderWidth: 1,
              borderColor: premium.colors.border.accent,
              backgroundColor: pressed
                ? premium.colors.surface.pressed
                : premium.colors.accent.soft,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.86 : 1,
              transform: [
                { scale: pressed ? premium.animation.pressScale : 1 },
              ],
            })}
          >
            <Text
              style={{
                color: premium.colors.accent.primary,
                fontSize: 12,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.9,
              }}
            >
              Édition complète
            </Text>
          </Pressable>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            rowGap: 10,
            paddingTop: 4,
          }}
        >
          {lines.map((line, index) => (
            <PreparedDieTile
              key={`all-premium-prepared-${line.id}`}
              line={line}
              index={index}
              skinId={skinId}
              onAdjustQty={onAdjustLineQty}
              onOpenLineConfig={(lineIndex) => {
                onClose();
                onOpenLineConfig?.(lineIndex);
              }}
              isFocused={focusedLineIndex === index}
            />
          ))}
        </View>

        <PremiumText variant="caption" tone="muted">
          Le point violet signale un comportement configuré sur la ligne.
        </PremiumText>
      </View>
    </PremiumBottomSheet>
  );
}

function PreparedLineConfigSheet({
  visible,
  line,
  index,
  skinId,
  onClose,
  onAdjustQty,
  onAdjustModifier,
  onToggleSign,
  onConfigureBehavior,
  onRemove,
  onRollLine,
  onFocusLine,
  isFocusedLine,
}: {
  visible: boolean;
  line: PremiumPreparedRollCardLine | null;
  index: number | null;
  skinId: PremiumDiceSkinId;
  onClose: () => void;
  onAdjustQty?: (index: number, delta: number) => void;
  onAdjustModifier?: (index: number, delta: number) => void;
  onToggleSign?: (index: number) => void;
  onConfigureBehavior?: (index: number) => void;
  onRemove?: (index: number) => void;
  onRollLine?: (index: number) => void | Promise<void>;
  onFocusLine?: (index: number) => void;
  isFocusedLine?: boolean;
}) {
  const premium = usePremiumTheme();

  if (!line || index == null) return null;

  const qty = Math.max(1, line.qty ?? 1);
  const modifier = line.modifier ?? 0;
  const isNegative = line.sign === -1;
  const canDecreaseQty = qty > 1 && !!onAdjustQty;

  const lineTitle = `${qty}d${line.sides ?? ""}`;
  const displayModifier =
    modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : "0";

  return (
    <PremiumBottomSheet
      visible={visible}
      title={line.label}
      subtitle={line.detail ?? "Somme simple"}
      onClose={onClose}
      maxHeight="86%"
    >
      <View style={{ gap: premium.spacing.md }}>
        <View
          style={{
            borderRadius: premium.radius.xl,
            borderWidth: 1,
            borderColor: isNegative
              ? "rgba(239, 111, 145, 0.32)"
              : premium.colors.border.subtle,
            backgroundColor: isNegative
              ? premium.colors.state.failureSoft
              : premium.colors.surface.subtle,
            padding: premium.spacing.md,
            gap: premium.spacing.md,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: premium.spacing.md,
            }}
          >
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: premium.radius.xl,
                borderWidth: 1,
                borderColor: line.hasBehavior
                  ? "rgba(124, 92, 255, 0.48)"
                  : premium.colors.border.accent,
                backgroundColor: line.hasBehavior
                  ? "rgba(124, 92, 255, 0.12)"
                  : premium.colors.accent.soft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: line.hasBehavior
                    ? premium.colors.accent.secondary
                    : premium.colors.accent.primary,
                  fontSize: 24,
                  fontWeight: "900",
                  lineHeight: 28,
                }}
              >
                {getDieShapeLabel(line.sides, skinId)}
              </Text>

              <Text
                style={{
                  color: premium.colors.text.primary,
                  fontSize: 13,
                  fontWeight: "900",
                  marginTop: -1,
                }}
              >
                {getDieDisplayLabel(line)}
              </Text>
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <PremiumText variant="title" numberOfLines={1}>
                {lineTitle || line.label}
              </PremiumText>

              <PremiumText variant="caption" tone="secondary" numberOfLines={1}>
                {line.detail ?? "Somme simple"}
              </PremiumText>

              <PremiumText
                variant="caption"
                tone={
                  modifier > 0 ? "success" : modifier < 0 ? "failure" : "muted"
                }
                numberOfLines={1}
              >
                Modificateur : {displayModifier}
              </PremiumText>
            </View>

            <Pressable
              disabled={!onToggleSign}
              onPress={() => onToggleSign?.(index)}
              style={({ pressed }) => ({
                paddingVertical: 7,
                paddingHorizontal: 10,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: isNegative
                  ? "rgba(239, 111, 145, 0.38)"
                  : "rgba(136, 211, 154, 0.32)",
                backgroundColor: isNegative
                  ? premium.colors.state.failureSoft
                  : premium.colors.state.successSoft,
                opacity: !onToggleSign ? 0.4 : pressed ? 0.78 : 1,
                transform: [{ scale: pressed && onToggleSign ? 0.96 : 1 }],
              })}
            >
              <Text
                style={{
                  color: isNegative
                    ? premium.colors.state.failure
                    : premium.colors.state.success,
                  fontSize: 11,
                  fontWeight: "900",
                }}
              >
                {isNegative ? "−" : "+"}
              </Text>
            </Pressable>
          </View>

          <LineRollButton
            onPress={
              onRollLine
                ? () => {
                  onClose();
                  void onRollLine(index);
                }
                : undefined
            }
          />

          {onFocusLine ? (
            <Pressable
              onPress={() => {
                onClose();
                onFocusLine(index);
              }}
              style={({ pressed }) => ({
                minHeight: 38,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: isFocusedLine
                  ? premium.colors.border.accent
                  : premium.colors.border.subtle,
                backgroundColor: isFocusedLine
                  ? premium.colors.accent.soft
                  : pressed
                    ? premium.colors.surface.pressed
                    : premium.colors.surface.secondary,
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
                  color: isFocusedLine
                    ? premium.colors.accent.primary
                    : premium.colors.text.secondary,
                  fontSize: 12,
                  fontWeight: "900",
                }}
              >
                {isFocusedLine
                  ? "Cette ligne est ciblée par le bouton principal"
                  : "Cibler cette ligne avec le bouton principal"}
              </Text>
            </Pressable>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              gap: premium.spacing.sm,
              flexWrap: "wrap",
            }}
          >
            <CompactStepper
              label="Quantité"
              value={`${qty}`}
              onDecrement={() => onAdjustQty?.(index, -1)}
              onIncrement={() => onAdjustQty?.(index, 1)}
              decrementDisabled={!canDecreaseQty}
            />

            <CompactStepper
              label="Modificateur"
              value={displayModifier}
              valueColor={
                modifier > 0
                  ? premium.colors.state.success
                  : modifier < 0
                    ? premium.colors.state.failure
                    : premium.colors.text.muted
              }
              onDecrement={() => onAdjustModifier?.(index, -1)}
              onIncrement={() => onAdjustModifier?.(index, 1)}
            />
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: premium.colors.border.subtle,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              gap: premium.spacing.sm,
            }}
          >
            <PreparedActionButton
              label="Comportement"
              onPress={() => {
                onClose();
                onConfigureBehavior?.(index);
              }}
            />

            <PreparedActionButton
              label="Retirer"
              onPress={() => {
                onClose();
                onRemove?.(index);
              }}
              variant="danger"
            />
          </View>
        </View>
      </View>
    </PremiumBottomSheet>
  );
}

export function PremiumPreparedRollCard({
  title = "Jet préparé",
  name,
  detail,
  lines,
  isEmpty,
  focusedLineIndex,
  onEdit,
  onClear,
  onSave,
  onAdjustLineQty,
  onAdjustLineModifier,
  onToggleLineSign,
  onRemoveLine,
  onConfigureLineBehavior,
  onRollLine,
  onFocusLine,
}: PremiumPreparedRollCardProps) {
  const premium = usePremiumTheme();
  const { skinId } = usePremiumDiceSkin();
  const [showAllDiceModal, setShowAllDiceModal] = useState(false);
  const [selectedLineConfigIndex, setSelectedLineConfigIndex] = useState<
    number | null
  >(null);

  const preparedContentAnim = useRef(new Animated.Value(1)).current;

  const previousPreparedLineCountRef = useRef(0);
  const previousPreparedLineIdsRef = useRef<string[]>([]);
  const [highlightedPreparedLineId, setHighlightedPreparedLineId] = useState<
    string | null
  >(null);
  const [overflowAnimationKey, setOverflowAnimationKey] = useState(0);

  const preparedLines = useMemo(
    () => lines?.filter((line) => line.label.trim().length > 0) ?? [],
    [lines],
  );

  const immediateHighlightedPreparedLineId = useMemo(() => {
    const currentIds = preparedLines.map((line) => line.id);
    const previousIds = previousPreparedLineIdsRef.current;
    const previousCount = previousPreparedLineCountRef.current;

    if (currentIds.length <= previousCount) return null;

    const addedId =
      currentIds.find((id) => !previousIds.includes(id)) ??
      currentIds[currentIds.length - 1] ??
      null;

    if (!addedId) return null;

    const addedIndex = currentIds.indexOf(addedId);

    return addedIndex >= 0 && addedIndex < 2 ? addedId : null;
  }, [preparedLines]);

  const effectiveHighlightedPreparedLineId =
    immediateHighlightedPreparedLineId ?? highlightedPreparedLineId;

  const lineCountLabel = `${preparedLines.length} ligne${preparedLines.length > 1 ? "s" : ""
    }`;

  useEffect(() => {
    preparedContentAnim.setValue(0);

    runPremiumTiming(premium, preparedContentAnim, {
      toValue: 1,
      duration: premium.animation.normal,
      useNativeDriver: true,
    }).start();
  }, [isEmpty, premium, preparedContentAnim]);

  useEffect(() => {
    const currentIds = preparedLines.map((line) => line.id);
    const previousIds = previousPreparedLineIdsRef.current;
    const previousCount = previousPreparedLineCountRef.current;

    if (currentIds.length > previousCount) {
      const addedId =
        currentIds.find((id) => !previousIds.includes(id)) ??
        currentIds[currentIds.length - 1] ??
        null;

      if (addedId) {
        const addedIndex = currentIds.indexOf(addedId);

        if (addedIndex >= 0 && addedIndex < 2) {
          setHighlightedPreparedLineId(addedId);

          const timeout = setTimeout(() => {
            setHighlightedPreparedLineId((current) =>
              current === addedId ? null : current,
            );
          }, 320);

          previousPreparedLineIdsRef.current = currentIds;
          previousPreparedLineCountRef.current = currentIds.length;

          return () => clearTimeout(timeout);
        }

        setHighlightedPreparedLineId(null);
        setOverflowAnimationKey((value) => value + 1);
      }
    }

    previousPreparedLineIdsRef.current = currentIds;
    previousPreparedLineCountRef.current = currentIds.length;
  }, [preparedLines]);

  const preparedContentOpacity = preparedContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const preparedContentTranslateY = preparedContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [premium.animation.translateMedium, 0],
  });

  const preparedContentScale = preparedContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [premium.animation.pressScale, 1],
  });

  return (
    <>
      <View
        style={{
          width: "100%",
          borderRadius: 0,
          borderWidth: 0,
          backgroundColor: "transparent",
          overflow: "visible",
          paddingVertical: 0,
          paddingHorizontal: 0,
          gap: 7,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: premium.spacing.sm,
            paddingHorizontal: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              flex: 1,
              minWidth: 0,
            }}
          >
            <View
              style={{
                width: 27,
                height: 27,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: premium.colors.border.accent,
                backgroundColor: premium.colors.accent.soft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: premium.colors.accent.primary,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                ⚑
              </Text>
            </View>

            <PremiumText
              variant="bodyStrong"
              numberOfLines={1}
              style={{
                textTransform: title === "Jet préparé" ? "uppercase" : "none",
                flexShrink: 1,
              }}
            >
              {title}
            </PremiumText>

            {!isEmpty ? (
              <PremiumPill tone="accent" compact>
                {lineCountLabel}
              </PremiumPill>
            ) : null}
          </View>

          {onEdit ? (
            <Pressable
              onPress={() => setShowAllDiceModal(true)}
              style={({ pressed }) => ({
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: premium.colors.border.subtle,
                backgroundColor: pressed
                  ? premium.colors.surface.pressed
                  : premium.colors.surface.subtle,
                opacity: pressed ? 0.84 : 1,
                transform: [
                  { scale: pressed ? premium.animation.pressScale : 1 },
                ],
              })}
            >
              <Text
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 11,
                  fontWeight: "900",
                }}
              >
                Modifier ✎
              </Text>
            </Pressable>
          ) : null}
        </View>

        <Animated.View
          style={{
            opacity: preparedContentOpacity,
            transform: [
              { translateY: preparedContentTranslateY },
              { scale: preparedContentScale },
            ],
          }}
        >
          {isEmpty ? (
            <EmptyPreparedState />
          ) : (
            <View style={{ gap: 6 }}>
              <CompactPreparedSummary
                lines={preparedLines}
                skinId={skinId}
                focusedLineIndex={focusedLineIndex}
                highlightedLineId={effectiveHighlightedPreparedLineId}
                overflowAnimationKey={overflowAnimationKey}
                onOpenLineConfig={setSelectedLineConfigIndex}
                onAdjustLineQty={onAdjustLineQty}
                onOpenAll={() => setShowAllDiceModal(true)}
              />

              <View
                style={{
                  height: 1,
                  backgroundColor: premium.colors.border.subtle,
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: premium.spacing.xs,
                }}
              >
                {onSave ? (
                  <PreparedActionButton label="Sauver" onPress={onSave} />
                ) : null}

                {onClear ? (
                  <PreparedActionButton
                    label="Vider"
                    onPress={onClear}
                    variant="danger"
                  />
                ) : null}
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      <PreparedDiceListSheet
        visible={showAllDiceModal}
        lines={preparedLines}
        skinId={skinId}
        onClose={() => setShowAllDiceModal(false)}
        onAdjustLineQty={onAdjustLineQty}
        onOpenLineConfig={setSelectedLineConfigIndex}
        focusedLineIndex={focusedLineIndex}
        onEditFull={onEdit}
      />

      <PreparedLineConfigSheet
        visible={selectedLineConfigIndex != null}
        line={
          selectedLineConfigIndex != null
            ? (preparedLines[selectedLineConfigIndex] ?? null)
            : null
        }
        index={selectedLineConfigIndex}
        skinId={skinId}
        onClose={() => setSelectedLineConfigIndex(null)}
        onAdjustQty={onAdjustLineQty}
        onAdjustModifier={onAdjustLineModifier}
        onToggleSign={onToggleLineSign}
        onConfigureBehavior={onConfigureLineBehavior}
        onRemove={onRemoveLine}
        onRollLine={onRollLine}
        onFocusLine={onFocusLine}
        isFocusedLine={focusedLineIndex === selectedLineConfigIndex}
      />
    </>
  );
}
