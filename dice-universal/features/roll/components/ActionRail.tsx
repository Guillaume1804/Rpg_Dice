// dice-universal/features/roll/components/ActionRail.tsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { PremiumBottomSheet } from "../../../components/premium";
import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

export type ActionRailItem = {
  id: string;
  name: string;
  detail: string;
};

type ActionRailProps = {
  profileName: string | null;
  actions: ActionRailItem[];
  selectedActionId: string | null;
  onPrepareAction: (actionId: string) => void;
  floatingAnchorRight?: number;
  floatingAnchorBottom?: number;
  floatingTopLimit?: number;
  floatingBottomLimit?: number;
};

const FLOATING_BUTTON_SIZE = 56;
const FLOATING_MARGIN = 12;

function getActionIcon(index: number) {
  const icons = ["📖", "🎒", "🎯", "✦", "⏳", "◇"];
  return icons[index % icons.length];
}

function ActionListRow({
  action,
  index,
  selected,
  onPress,
}: {
  action: ActionRailItem;
  index: number;
  selected: boolean;
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 68,
        borderRadius: premium.radius.lg,
        borderWidth: 1,
        borderColor: selected
          ? premium.colors.border.accent
          : premium.colors.border.subtle,
        backgroundColor: selected
          ? premium.colors.accent.soft
          : pressed
            ? premium.colors.surface.pressed
            : premium.colors.surface.subtle,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: premium.spacing.sm,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: premium.radius.md,
          borderWidth: 1,
          borderColor: selected
            ? premium.colors.border.accent
            : premium.colors.border.subtle,
          backgroundColor: selected
            ? premium.colors.accent.softer
            : premium.colors.surface.secondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: selected
              ? premium.colors.accent.primary
              : premium.colors.text.secondary,
            fontSize: 18,
          }}
        >
          {getActionIcon(index)}
        </Text>
      </View>

      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <Text
          numberOfLines={1}
          style={{
            color: selected
              ? premium.colors.accent.primary
              : premium.colors.text.primary,
            fontSize: 15,
            fontWeight: "900",
          }}
        >
          {action.name}
        </Text>

        <Text
          numberOfLines={2}
          style={{
            color: premium.colors.text.secondary,
            fontSize: 12,
            lineHeight: 16,
            fontWeight: "700",
          }}
        >
          {action.detail}
        </Text>
      </View>

      {selected ? (
        <Text
          style={{
            color: premium.colors.accent.primary,
            fontSize: 16,
            fontWeight: "900",
          }}
        >
          ✓
        </Text>
      ) : null}
    </Pressable>
  );
}

export function ActionRail({
  profileName,
  actions,
  selectedActionId,
  onPrepareAction,
  floatingAnchorRight = 16,
  floatingAnchorBottom = 96,
  floatingTopLimit = 92,
  floatingBottomLimit = 86,
}: ActionRailProps) {
  const premium = usePremiumTheme();
  const [showAllActions, setShowAllActions] = useState(false);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const floatingPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const floatingAppearAnim = useRef(new Animated.Value(0)).current;
  const floatingPressAnim = useRef(new Animated.Value(0)).current;
  const hasDraggedFloatingButtonRef = useRef(false);

  const floatingInertiaOffset = useRef(
    new Animated.ValueXY({ x: 0, y: 0 }),
  ).current;

  const floatingPositionRef = useRef({
    x: 0,
    y: 0,
  });

  const dragStartPositionRef = useRef({
    x: 0,
    y: 0,
  });

  const floatingInitialLeft =
    windowWidth - floatingAnchorRight - FLOATING_BUTTON_SIZE;

  const floatingInitialTop =
    windowHeight - floatingAnchorBottom - FLOATING_BUTTON_SIZE;

  const floatingBounds = {
    minX: FLOATING_MARGIN - floatingInitialLeft,
    maxX:
      windowWidth -
      FLOATING_MARGIN -
      FLOATING_BUTTON_SIZE -
      floatingInitialLeft,

    minY: floatingTopLimit - floatingInitialTop,
    maxY:
      windowHeight -
      floatingBottomLimit -
      FLOATING_BUTTON_SIZE -
      floatingInitialTop,
  };

  const clampFloatingPosition = useCallback(
    (x: number, y: number) => {
      const safeX = Math.min(
        Math.max(x, floatingBounds.minX),
        floatingBounds.maxX,
      );

      const safeY = Math.min(
        Math.max(y, floatingBounds.minY),
        floatingBounds.maxY,
      );

      return {
        x: safeX,
        y: safeY,
      };
    },
    [
      floatingBounds.minX,
      floatingBounds.maxX,
      floatingBounds.minY,
      floatingBounds.maxY,
    ],
  );

  const animateFloatingPress = useCallback(
    (toValue: number) => {
      Animated.spring(floatingPressAnim, {
        toValue,
        useNativeDriver: true,
        friction: 7,
        tension: 140,
      }).start();
    },
    [floatingPressAnim],
  );

  const getSubtleInertiaOffset = useCallback(
    (safePosition: { x: number; y: number }, velocityX = 0, velocityY = 0) => {
      let inertiaX = Math.max(-6, Math.min(6, velocityX * 10));
      let inertiaY = Math.max(-6, Math.min(6, velocityY * 10));

      if (
        (safePosition.x <= floatingBounds.minX && inertiaX < 0) ||
        (safePosition.x >= floatingBounds.maxX && inertiaX > 0)
      ) {
        inertiaX = 0;
      }

      if (
        (safePosition.y <= floatingBounds.minY && inertiaY < 0) ||
        (safePosition.y >= floatingBounds.maxY && inertiaY > 0)
      ) {
        inertiaY = 0;
      }

      return {
        x: inertiaX,
        y: inertiaY,
      };
    },
    [
      floatingBounds.minX,
      floatingBounds.maxX,
      floatingBounds.minY,
      floatingBounds.maxY,
    ],
  );

  const releaseFloatingButton = useCallback(
    (gestureState?: { vx?: number; vy?: number }) => {
      const safePosition = clampFloatingPosition(
        floatingPositionRef.current.x,
        floatingPositionRef.current.y,
      );

      const inertiaOffset = hasDraggedFloatingButtonRef.current
        ? getSubtleInertiaOffset(
            safePosition,
            gestureState?.vx ?? 0,
            gestureState?.vy ?? 0,
          )
        : { x: 0, y: 0 };

      floatingPositionRef.current = safePosition;

      floatingInertiaOffset.stopAnimation();
      floatingInertiaOffset.setValue(inertiaOffset);

      Animated.parallel([
        Animated.spring(floatingPosition, {
          toValue: safePosition,
          useNativeDriver: true,
          friction: 9,
          tension: 78,
        }),
        Animated.spring(floatingInertiaOffset, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 5,
          tension: 58,
        }),
      ]).start();

      setTimeout(() => {
        hasDraggedFloatingButtonRef.current = false;
      }, 100);
    },
    [
      clampFloatingPosition,
      floatingInertiaOffset,
      floatingPosition,
      getSubtleInertiaOffset,
    ],
  );

  const floatingPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,

        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5,

        onPanResponderGrant: () => {
          hasDraggedFloatingButtonRef.current = false;
          floatingInertiaOffset.stopAnimation();
          floatingInertiaOffset.setValue({ x: 0, y: 0 });

          dragStartPositionRef.current = {
            ...floatingPositionRef.current,
          };
        },

        onPanResponderMove: (_, gestureState) => {
          if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
            hasDraggedFloatingButtonRef.current = true;
          }

          const nextPosition = {
            x: dragStartPositionRef.current.x + gestureState.dx,
            y: dragStartPositionRef.current.y + gestureState.dy,
          };

          floatingPositionRef.current = nextPosition;
          floatingPosition.setValue(nextPosition);
        },

        onPanResponderRelease: (_, gestureState) => {
          releaseFloatingButton(gestureState);
        },

        onPanResponderTerminate: (_, gestureState) => {
          releaseFloatingButton(gestureState);
        },
      }),
    [floatingInertiaOffset, floatingPosition, releaseFloatingButton],
  );

  useEffect(() => {
    const safePosition = clampFloatingPosition(
      floatingPositionRef.current.x,
      floatingPositionRef.current.y,
    );

    floatingPositionRef.current = safePosition;
    floatingPosition.setValue(safePosition);
  }, [clampFloatingPosition, floatingPosition]);

  useEffect(() => {
    if (!profileName) {
      floatingAppearAnim.setValue(0);
      return;
    }

    floatingAppearAnim.setValue(0);

    Animated.timing(floatingAppearAnim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [profileName, floatingAppearAnim]);

  if (!profileName) return null;

  const selectedAction =
    actions.find((action) => action.id === selectedActionId) ?? null;

  const floatingAppearOpacity = floatingAppearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const floatingAppearScale = floatingAppearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });

  const floatingAppearTranslateY = floatingAppearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  const floatingPressScale = floatingPressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.955],
  });

  const floatingPressTranslateY = floatingPressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  const floatingTranslateX = Animated.add(
    floatingPosition.x,
    floatingInertiaOffset.x,
  );

  const floatingTranslateY = Animated.add(
    Animated.add(floatingPosition.y, floatingInertiaOffset.y),
    Animated.add(floatingAppearTranslateY, floatingPressTranslateY),
  );

  const floatingScale = Animated.multiply(
    floatingAppearScale,
    floatingPressScale,
  );

  return (
    <>
      <Animated.View
        {...floatingPanResponder.panHandlers}
        style={{
          opacity: floatingAppearOpacity,
          transform: [
            { translateX: floatingTranslateX },
            { translateY: floatingTranslateY },
            { scale: floatingScale },
          ],
        }}
      >
        <Pressable
          onPress={() => {
            if (hasDraggedFloatingButtonRef.current) {
              hasDraggedFloatingButtonRef.current = false;
              return;
            }

            setShowAllActions(true);
          }}
          disabled={actions.length === 0}
          onPressIn={() => {
            if (actions.length === 0) return;
            animateFloatingPress(1);
          }}
          onPressOut={() => {
            animateFloatingPress(0);
          }}
          style={({ pressed }) => ({
            width: FLOATING_BUTTON_SIZE,
            height: FLOATING_BUTTON_SIZE,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: selectedAction
              ? premium.colors.border.accent
              : premium.colors.border.subtle,
            backgroundColor: selectedAction
              ? premium.colors.accent.soft
              : pressed
                ? premium.colors.surface.pressed
                : premium.colors.surface.elevated,
            alignItems: "center",
            justifyContent: "center",
            opacity: actions.length === 0 ? 0.48 : pressed ? 0.88 : 0.96,
            ...premium.shadow.card,
          })}
        >
          <Text
            style={{
              color: selectedAction
                ? premium.colors.accent.primary
                : premium.colors.text.primary,
              fontSize: 18,
              fontWeight: "900",
              lineHeight: 21,
            }}
          >
            ✦
          </Text>

          <Text
            style={{
              marginTop: -1,
              color: selectedAction
                ? premium.colors.accent.primary
                : premium.colors.text.secondary,
              fontSize: 8,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Actions
          </Text>

          {actions.length > 0 ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 21,
                height: 21,
                paddingHorizontal: 5,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.22)",
                backgroundColor: premium.colors.accent.primary,
                alignItems: "center",
                justifyContent: "center",
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
                {actions.length}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>

      <PremiumBottomSheet
        visible={showAllActions}
        title="Toutes les actions"
        subtitle={`${actions.length} action${actions.length > 1 ? "s" : ""} dans ${profileName}.`}
        onClose={() => setShowAllActions(false)}
        maxHeight="78%"
      >
        <View style={{ gap: premium.spacing.sm }}>
          {actions.length === 0 ? (
            <View
              style={{
                minHeight: 64,
                borderRadius: premium.radius.lg,
                borderWidth: 1,
                borderColor: premium.colors.border.subtle,
                backgroundColor: premium.colors.surface.subtle,
                padding: premium.spacing.md,
                justifyContent: "center",
                gap: premium.spacing.xs,
              }}
            >
              <Text
                style={{
                  color: premium.colors.text.primary,
                  fontSize: 15,
                  fontWeight: "900",
                }}
              >
                Aucune action disponible
              </Text>

              <Text
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 12,
                  lineHeight: 16,
                  fontWeight: "700",
                }}
              >
                Crée des actions depuis l’écran Tables pour les retrouver ici.
              </Text>
            </View>
          ) : (
            actions.map((action, index) => (
              <ActionListRow
                key={`all-action-${action.id}`}
                action={action}
                index={index}
                selected={selectedActionId === action.id}
                onPress={() => {
                  setShowAllActions(false);
                  onPrepareAction(action.id);
                }}
              />
            ))
          )}
        </View>
      </PremiumBottomSheet>
    </>
  );
}
