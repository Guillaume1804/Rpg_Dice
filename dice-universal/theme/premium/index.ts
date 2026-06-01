// dice-universal/theme/premium/index.ts

export { usePremiumTheme } from "./usePremiumTheme";
export { usePremiumDiceSkin } from "./usePremiumDiceSkin";

export {
    DEFAULT_PREMIUM_THEME_ID,
    getPremiumThemeById,
    getPremiumThemeDefinition,
    isPremiumThemeId,
    listPremiumThemeDefinitions,
} from "./premiumThemeRegistry";

export {
    DEFAULT_PREMIUM_DICE_SKIN_ID,
    getPremiumDiceSkinDefinition,
    isPremiumDiceSkinId,
    listPremiumDiceSkinDefinitions,
} from "./diceSkinRegistry";

export type {
    PremiumAvailability,
    PremiumDiceSkinDefinition,
    PremiumDiceSkinId,
    PremiumTheme,
    PremiumThemeDefinition,
    PremiumThemeId,
} from "./premiumTypes";