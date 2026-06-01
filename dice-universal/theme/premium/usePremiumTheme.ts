// dice-universal/theme/premium/usePremiumTheme.ts

import { useMemo } from "react";

import { useAppSettings } from "../../data/state/AppSettingsProvider";
import { GRAPHITE_ASTRAL_THEME } from "./themes";
import type { PremiumTheme } from "./premiumTypes";

function createMotionAwareTheme({
  animationsEnabled,
  reduceMotion,
  batterySaver,
}: {
  animationsEnabled: boolean;
  reduceMotion: boolean;
  batterySaver: boolean;
}): PremiumTheme {
  const baseTheme = GRAPHITE_ASTRAL_THEME;

  if (!animationsEnabled) {
    return {
      ...baseTheme,
      animation: {
        ...baseTheme.animation,

        fast: 0,
        normal: 0,
        slow: 0,
        entrance: 0,
        feedback: 0,

        pressScale: 1,
        deepPressScale: 1,
        subtleScale: 1,

        translateSmall: 0,
        translateMedium: 0,

        spring: {
          press: {
            friction: 100,
            tension: 1,
          },
          settle: {
            friction: 100,
            tension: 1,
          },
          softSettle: {
            friction: 100,
            tension: 1,
          },
          inertia: {
            friction: 100,
            tension: 1,
          },
        },
      },
    };
  }

  if (reduceMotion || batterySaver) {
    return {
      ...baseTheme,
      animation: {
        ...baseTheme.animation,

        fast: 80,
        normal: 140,
        slow: 180,
        entrance: 140,
        feedback: 100,

        pressScale: 0.992,
        deepPressScale: 0.982,
        subtleScale: 0.992,

        translateSmall: 1,
        translateMedium: 4,

        spring: {
          press: {
            friction: 10,
            tension: 95,
          },
          settle: {
            friction: 11,
            tension: 60,
          },
          softSettle: {
            friction: 12,
            tension: 62,
          },
          inertia: {
            friction: 12,
            tension: 45,
          },
        },
      },
    };
  }

  return baseTheme;
}

export function usePremiumTheme() {
  const { settings } = useAppSettings();

  return useMemo(
    () =>
      createMotionAwareTheme({
        animationsEnabled: settings.animationsEnabled,
        reduceMotion: settings.reduceMotion,
        batterySaver: settings.batterySaver,
      }),
    [
      settings.animationsEnabled,
      settings.reduceMotion,
      settings.batterySaver,
    ],
  );
}