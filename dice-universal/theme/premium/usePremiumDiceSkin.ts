// dice-universal/theme/premium/usePremiumDiceSkin.ts

import { useMemo } from "react";

import { useAppSettings } from "../../data/state/AppSettingsProvider";
import {
    getPremiumDiceSkinDefinition,
    isPremiumDiceSkinId,
} from "./diceSkinRegistry";
import type {
    PremiumDiceSkinDefinition,
    PremiumDiceSkinId,
} from "./premiumTypes";

type UsePremiumDiceSkinResult = {
    skinId: PremiumDiceSkinId;
    skin: PremiumDiceSkinDefinition;
    isFallback: boolean;
};

export function usePremiumDiceSkin(): UsePremiumDiceSkinResult {
    const { settings } = useAppSettings();

    return useMemo(() => {
        const skinId = isPremiumDiceSkinId(settings.selectedDiceSkinId)
            ? settings.selectedDiceSkinId
            : "default_2d";

        return {
            skinId,
            skin: getPremiumDiceSkinDefinition(skinId),
            isFallback: skinId !== settings.selectedDiceSkinId,
        };
    }, [settings.selectedDiceSkinId]);
}