// dice-universal/theme/premium/diceSkinRegistry.ts

import type {
    PremiumDiceSkinDefinition,
    PremiumDiceSkinId,
} from "./premiumTypes";

export const DEFAULT_PREMIUM_DICE_SKIN_ID: PremiumDiceSkinId = "default_2d";

export const PREMIUM_DICE_SKIN_DEFINITIONS: Record<
    PremiumDiceSkinId,
    PremiumDiceSkinDefinition
> = {
    default_2d: {
        id: "default_2d",
        label: "Dés 2D classiques",
        description:
            "Skin gratuit par défaut basé sur les glyphes actuels de l’application.",
        availability: "free",
        isDefault: true,
        supports2d: true,
        supports3d: false,
        supportsResultEffects: false,
    },

    graphite_2d: {
        id: "graphite_2d",
        label: "Graphite 2D",
        description:
            "Variation sobre et premium des dés 2D, pensée pour le thème Graphite Astral.",
        availability: "locked",
        isDefault: false,
        supports2d: true,
        supports3d: false,
        supportsResultEffects: false,
    },

    dragon: {
        id: "dragon",
        label: "Dragon",
        description:
            "Skin premium futur avec effets de flammes, impacts critiques et animations de résultat.",
        availability: "locked",
        isDefault: false,
        supports2d: true,
        supports3d: true,
        supportsResultEffects: true,
    },

    arcane: {
        id: "arcane",
        label: "Arcane",
        description:
            "Skin premium futur orienté magie, runes, halos et révélations mystiques.",
        availability: "locked",
        isDefault: false,
        supports2d: true,
        supports3d: true,
        supportsResultEffects: true,
    },

    metal: {
        id: "metal",
        label: "Métal",
        description:
            "Skin premium futur avec dés métalliques, impacts lourds et rendu plus physique.",
        availability: "locked",
        isDefault: false,
        supports2d: true,
        supports3d: true,
        supportsResultEffects: true,
    },

    cosmic: {
        id: "cosmic",
        label: "Cosmique",
        description:
            "Skin premium futur avec effets stellaires, sci-fi et particules astrales.",
        availability: "locked",
        isDefault: false,
        supports2d: true,
        supports3d: true,
        supportsResultEffects: true,
    },
};

export function isPremiumDiceSkinId(
    value: unknown,
): value is PremiumDiceSkinId {
    return (
        typeof value === "string" && value in PREMIUM_DICE_SKIN_DEFINITIONS
    );
}

export function getPremiumDiceSkinDefinition(
    skinId: string | null | undefined,
): PremiumDiceSkinDefinition {
    if (isPremiumDiceSkinId(skinId)) {
        return PREMIUM_DICE_SKIN_DEFINITIONS[skinId];
    }

    return PREMIUM_DICE_SKIN_DEFINITIONS[DEFAULT_PREMIUM_DICE_SKIN_ID];
}

export function listPremiumDiceSkinDefinitions(): PremiumDiceSkinDefinition[] {
    return Object.values(PREMIUM_DICE_SKIN_DEFINITIONS);
}