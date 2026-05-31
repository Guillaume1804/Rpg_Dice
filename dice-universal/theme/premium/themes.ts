// dice-universal/theme/premium/themes.ts

import type { PremiumTheme } from "./premiumTypes";

export const GRAPHITE_ASTRAL_THEME: PremiumTheme = {
  id: "graphite_astral",
  name: "Graphite Astral",

  colors: {
    background: {
      primary: "#060812",
      secondary: "#0B0E1A",
      elevated: "#101321",
      overlay: "rgba(0, 0, 0, 0.74)",
      bottomFade: "rgba(0, 0, 0, 0.62)",
    },

    surface: {
      primary: "rgba(15, 18, 32, 0.86)",
      secondary: "rgba(22, 24, 42, 0.72)",
      elevated: "rgba(28, 31, 50, 0.88)",
      pressed: "rgba(36, 39, 58, 0.92)",
      disabled: "rgba(35, 37, 50, 0.48)",
      subtle: "rgba(255, 255, 255, 0.035)",
    },

    text: {
      primary: "#F5F3EA",
      secondary: "#A7A8B8",
      muted: "#6F7184",
      subtle: "#4F5263",
      inverse: "#060812",
    },

    accent: {
      primary: "#E8C878",
      secondary: "#7C5CFF",
      soft: "rgba(232, 200, 120, 0.12)",
      softer: "rgba(232, 200, 120, 0.06)",
    },

    state: {
      success: "#88D39A",
      successSoft: "rgba(136, 211, 154, 0.12)",

      failure: "#EF6F91",
      failureSoft: "rgba(239, 111, 145, 0.12)",

      critical: "#F0D98A",
      criticalSoft: "rgba(240, 217, 138, 0.14)",

      warning: "#DFAF55",
      warningSoft: "rgba(223, 175, 85, 0.12)",

      complication: "#DFAF55",
      complicationSoft: "rgba(223, 175, 85, 0.12)",
    },

    border: {
      subtle: "rgba(255, 255, 255, 0.06)",
      default: "rgba(255, 255, 255, 0.1)",
      strong: "rgba(255, 255, 255, 0.18)",
      accent: "rgba(232, 200, 120, 0.36)",
    },
  },

  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
    xxl: 34,
    pill: 999,
  },

  spacing: {
    xxs: 3,
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 36,
  },

  typography: {
    tiny: 10,
    caption: 12,
    body: 14,
    bodyStrong: 15,
    title: 18,
    hero: 34,
  },

  animation: {
    fast: 120,
    normal: 220,
    slow: 360,

    entrance: 260,
    feedback: 180,

    pressScale: 0.985,
    deepPressScale: 0.955,
    subtleScale: 0.982,

    translateSmall: 2,
    translateMedium: 8,

    spring: {
      press: {
        friction: 7,
        tension: 140,
      },

      settle: {
        friction: 8,
        tension: 70,
      },

      softSettle: {
        friction: 9,
        tension: 78,
      },

      inertia: {
        friction: 5,
        tension: 58,
      },
    },
  },

  shadow: {
    card: {
      shadowColor: "#000",
      shadowOpacity: 0.22,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },

    button: {
      shadowColor: "#000",
      shadowOpacity: 0.28,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 7,
    },

    soft: {
      shadowColor: "#000",
      shadowOpacity: 0.14,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },

    none: {
      shadowOpacity: 0,
      elevation: 0,
    },
  },
};

export const PREMIUM_THEMES = {
  graphite_astral: GRAPHITE_ASTRAL_THEME,
} as const;
