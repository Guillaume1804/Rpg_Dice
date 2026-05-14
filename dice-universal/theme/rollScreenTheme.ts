// dice-universal/theme/rollScreenTheme.ts

import type { ArcaneTheme } from "./arcaneTheme";

export type DiceDisplayMode = "flat" | "floating" | "fullscreen3d";

export function createRollScreenTheme(theme: ArcaneTheme) {
  return {
    layout: {
      maxCockpitWidth: 920,
      compactGap: theme.spacing.sm,
      sectionGap: theme.spacing.md,
      cockpitRadius: theme.radius.xl,
    },

    cockpit: {
      background: theme.colors.background,
      panel: theme.colors.surface,
      panelAlt: theme.colors.surfaceAlt,
      panelSoft: theme.colors.surfaceSoft,
      border: theme.colors.border,
      borderSoft: theme.colors.borderSoft,
      glow: theme.colors.accent,
      magicGlow: theme.colors.arcane,
    },

    hero: {
      border: theme.colors.accent,
      background: theme.colors.surface,
      backgroundSoft: theme.colors.accentSoft,
      title: theme.colors.accent,
      text: theme.colors.text,
      muted: theme.colors.textMuted,
    },

    diceZone: {
      ringBorder: theme.colors.border,
      ringGlow: theme.colors.accent,
      dieSurface: theme.colors.surfaceAlt,
      dieSurfacePressed: theme.colors.surfaceSoft,
      dieSelected: theme.colors.accentSoft,
      dieText: theme.colors.text,
      dieAccent: theme.colors.arcane,
      modifierBackground: theme.colors.backgroundElevated,
    },

    prepared: {
      background: theme.colors.surface,
      backgroundAlt: theme.colors.surfaceAlt,
      border: theme.colors.border,
      accent: theme.colors.accent,
      text: theme.colors.text,
      muted: theme.colors.textMuted,
    },

    quickActions: {
      background: theme.colors.surfaceAlt,
      border: theme.colors.borderSoft,
      icon: theme.colors.arcane,
      text: theme.colors.text,
      muted: theme.colors.textMuted,
    },

    recent: {
      background: theme.colors.surfaceAlt,
      border: theme.colors.borderSoft,
      success: theme.colors.success,
      warning: theme.colors.warning,
      failure: theme.colors.failure,
      text: theme.colors.text,
      muted: theme.colors.textMuted,
    },

    launchButton: {
      background: theme.colors.accent,
      backgroundDisabled: theme.colors.surfaceSoft,
      text: theme.colors.black,
      textDisabled: theme.colors.textSubtle,
      border: theme.colors.accent,
      borderDisabled: theme.colors.border,
      glow: theme.colors.arcane,
    },

    future3d: {
      displayMode: "flat" as DiceDisplayMode,
      fullscreenOverlayBackground: theme.colors.black,
      floatingDiceGlow: theme.colors.arcane,
      rollSceneSurface: theme.colors.backgroundElevated,
    },
  };
}
