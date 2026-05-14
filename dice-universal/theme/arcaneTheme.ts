// dice-universal/theme/arcaneTheme.ts

export type ArcaneThemeKey = "arcane_dark" | "arcane_light" | "arcane_purple";

type ArcaneColors = {
  background: string;
  backgroundElevated: string;

  surface: string;
  surfaceAlt: string;
  surfaceSoft: string;

  border: string;
  borderSoft: string;

  text: string;
  textMuted: string;
  textSubtle: string;

  accent: string;
  accentSoft: string;

  arcane: string;
  arcaneSoft: string;

  success: string;
  successSoft: string;

  failure: string;
  failureSoft: string;

  warning: string;
  warningSoft: string;

  white: string;
  black: string;
};

type ArcaneThemeDefinition = {
  key: ArcaneThemeKey;
  label: string;
  description: string;
  colors: ArcaneColors;
};

export const ARCANE_THEMES: Record<ArcaneThemeKey, ArcaneThemeDefinition> = {
  arcane_dark: {
    key: "arcane_dark",
    label: "Arcane sombre",
    description: "Thème sombre principal, pensé pour les sessions de jeu.",
    colors: {
      background: "#0B1020",
      backgroundElevated: "#10172A",

      surface: "#141C2F",
      surfaceAlt: "#1B2540",
      surfaceSoft: "#202B47",

      border: "#2D3A5F",
      borderSoft: "#253151",

      text: "#F5F1E8",
      textMuted: "#AAB4D4",
      textSubtle: "#7F8AAD",

      accent: "#D9A441",
      accentSoft: "#3A2E16",

      arcane: "#8B5CF6",
      arcaneSoft: "#241A3F",

      success: "#34D399",
      successSoft: "#0F2F26",

      failure: "#FB7185",
      failureSoft: "#3A1420",

      warning: "#FBBF24",
      warningSoft: "#3A2A0A",

      white: "#FFFFFF",
      black: "#000000",
    },
  },

  arcane_light: {
    key: "arcane_light",
    label: "Parchemin clair",
    description: "Thème clair plus lisible en journée.",
    colors: {
      background: "#F5EFE3",
      backgroundElevated: "#FFF8EA",

      surface: "#FFF8EA",
      surfaceAlt: "#F0E2C8",
      surfaceSoft: "#E7D5B4",

      border: "#C7A86F",
      borderSoft: "#D8C294",

      text: "#20160E",
      textMuted: "#5F4A32",
      textSubtle: "#8A7454",

      accent: "#A16207",
      accentSoft: "#EBD29A",

      arcane: "#6D28D9",
      arcaneSoft: "#DDD0FF",

      success: "#047857",
      successSoft: "#BFEAD8",

      failure: "#BE123C",
      failureSoft: "#F6C7D1",

      warning: "#B45309",
      warningSoft: "#F5D99A",

      white: "#FFFFFF",
      black: "#000000",
    },
  },

  arcane_purple: {
    key: "arcane_purple",
    label: "Violet astral",
    description: "Variante sombre plus magique et cosmique.",
    colors: {
      background: "#100A1F",
      backgroundElevated: "#18102C",

      surface: "#21143A",
      surfaceAlt: "#2B1B4A",
      surfaceSoft: "#38235F",

      border: "#4C3578",
      borderSoft: "#3A2A5E",

      text: "#FAF5FF",
      textMuted: "#C4B5FD",
      textSubtle: "#9F8AD8",

      accent: "#C084FC",
      accentSoft: "#3B1F58",

      arcane: "#A78BFA",
      arcaneSoft: "#2D1D4F",

      success: "#34D399",
      successSoft: "#0E342A",

      failure: "#FB7185",
      failureSoft: "#3A1425",

      warning: "#FBBF24",
      warningSoft: "#3A2A0A",

      white: "#FFFFFF",
      black: "#000000",
    },
  },
};

export const DEFAULT_ARCANE_THEME_KEY: ArcaneThemeKey = "arcane_dark";

function createArcaneBase() {
  return {
    colors: { ...ARCANE_THEMES[DEFAULT_ARCANE_THEME_KEY].colors },

    radius: {
      sm: 10,
      md: 14,
      lg: 18,
      xl: 24,
      pill: 999,
    },

    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24,
    },

    typography: {
      title: 24,
      sectionTitle: 18,
      body: 15,
      small: 13,
      tiny: 11,
    },

    shadow: {
      card: {
        shadowColor: "#000000",
        shadowOpacity: 0.24,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5,
      },
      button: {
        shadowColor: "#000000",
        shadowOpacity: 0.32,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 7,
      },
    },
  };
}

export const arcane = createArcaneBase();

export function isArcaneThemeKey(value: string): value is ArcaneThemeKey {
  return value in ARCANE_THEMES;
}

export function applyArcaneTheme(themeKey: ArcaneThemeKey) {
  const nextTheme = ARCANE_THEMES[themeKey];

  Object.assign(arcane.colors, nextTheme.colors);
}
