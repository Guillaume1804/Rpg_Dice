// dice-universal/theme/premium/premiumTypes.ts

export type PremiumAvailability = "free" | "premium" | "locked";

export type PremiumThemeId = "graphite_astral";

export type PremiumDiceSkinId =
  | "default_2d"
  | "graphite_2d"
  | "dragon"
  | "arcane"
  | "metal"
  | "cosmic";

export type PremiumThemeDefinition = {
  id: PremiumThemeId;
  label: string;
  description: string;
  availability: PremiumAvailability;
  isDefault: boolean;
};

export type PremiumDiceSkinDefinition = {
  id: PremiumDiceSkinId;
  label: string;
  description: string;
  availability: PremiumAvailability;
  isDefault: boolean;
  supports2d: boolean;
  supports3d: boolean;
  supportsResultEffects: boolean;
};

export type PremiumRollTone =
  | "neutral"
  | "success"
  | "failure"
  | "critical"
  | "crit_success"
  | "crit_failure"
  | "warning"
  | "complication";

export type PremiumThemeColors = {
  background: {
    primary: string;
    secondary: string;
    elevated: string;
    overlay: string;
    bottomFade: string;
  };

  surface: {
    primary: string;
    secondary: string;
    elevated: string;
    pressed: string;
    disabled: string;
    subtle: string;
  };

  text: {
    primary: string;
    secondary: string;
    muted: string;
    subtle: string;
    inverse: string;
  };

  accent: {
    primary: string;
    secondary: string;
    soft: string;
    softer: string;
  };

  state: {
    success: string;
    successSoft: string;
    failure: string;
    failureSoft: string;
    critical: string;
    criticalSoft: string;
    warning: string;
    warningSoft: string;
    complication: string;
    complicationSoft: string;
  };

  border: {
    subtle: string;
    default: string;
    strong: string;
    accent: string;
  };
};

export type PremiumThemeRadius = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  pill: number;
};

export type PremiumThemeSpacing = {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

export type PremiumThemeTypography = {
  tiny: number;
  caption: number;
  body: number;
  bodyStrong: number;
  title: number;
  hero: number;
};

export type PremiumThemeAnimationSpring = {
  friction: number;
  tension: number;
};

export type PremiumThemeAnimation = {
  fast: number;
  normal: number;
  slow: number;

  entrance: number;
  feedback: number;

  pressScale: number;
  deepPressScale: number;
  subtleScale: number;

  translateSmall: number;
  translateMedium: number;

  spring: {
    press: PremiumThemeAnimationSpring;
    settle: PremiumThemeAnimationSpring;
    softSettle: PremiumThemeAnimationSpring;
    inertia: PremiumThemeAnimationSpring;
  };
};

export type PremiumThemeShadow = {
  card: object;
  button: object;
  soft: object;
  none: object;
};

export type PremiumTheme = {
  id: PremiumThemeId;
  name: string;
  colors: PremiumThemeColors;
  radius: PremiumThemeRadius;
  spacing: PremiumThemeSpacing;
  typography: PremiumThemeTypography;
  animation: PremiumThemeAnimation;
  shadow: PremiumThemeShadow;
};
