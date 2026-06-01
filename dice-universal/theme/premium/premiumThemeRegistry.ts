// dice-universal/theme/premium/premiumThemeRegistry.ts

import { GRAPHITE_ASTRAL_THEME } from "./themes";
import type {
    PremiumTheme,
    PremiumThemeDefinition,
    PremiumThemeId,
} from "./premiumTypes";

export const DEFAULT_PREMIUM_THEME_ID: PremiumThemeId = "graphite_astral";

export const PREMIUM_THEME_DEFINITIONS: Record<
    PremiumThemeId,
    PremiumThemeDefinition
> = {
    graphite_astral: {
        id: "graphite_astral",
        label: "Graphite Astral",
        description:
            "Thème sombre premium par défaut, sobre, tactile et orienté cockpit de jet.",
        availability: "free",
        isDefault: true,
    },
};

export const PREMIUM_THEME_REGISTRY: Record<PremiumThemeId, PremiumTheme> = {
    graphite_astral: GRAPHITE_ASTRAL_THEME,
};

export function isPremiumThemeId(value: unknown): value is PremiumThemeId {
    return typeof value === "string" && value in PREMIUM_THEME_REGISTRY;
}

export function getPremiumThemeDefinition(
    themeId: string | null | undefined,
): PremiumThemeDefinition {
    if (isPremiumThemeId(themeId)) {
        return PREMIUM_THEME_DEFINITIONS[themeId];
    }

    return PREMIUM_THEME_DEFINITIONS[DEFAULT_PREMIUM_THEME_ID];
}

export function getPremiumThemeById(
    themeId: string | null | undefined,
): PremiumTheme {
    if (isPremiumThemeId(themeId)) {
        return PREMIUM_THEME_REGISTRY[themeId];
    }

    return PREMIUM_THEME_REGISTRY[DEFAULT_PREMIUM_THEME_ID];
}

export function listPremiumThemeDefinitions(): PremiumThemeDefinition[] {
    return Object.values(PREMIUM_THEME_DEFINITIONS);
}