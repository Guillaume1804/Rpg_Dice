// dice-universal/features/preparation/utils/preparationLayoutHelpers.ts

export type PreparationCockpitDensity = "tight" | "compact" | "comfortable";

export type PreparationScreenSizeFlags = {
    isVerySmallScreen: boolean;
    isCompactScreen: boolean;
    cockpitDensity: PreparationCockpitDensity;
};

export function getPreparationScreenSizeFlags(
    windowHeight: number,
): PreparationScreenSizeFlags {
    const isVerySmallScreen = windowHeight < 760;
    const isCompactScreen = windowHeight < 820;

    const cockpitDensity: PreparationCockpitDensity = isVerySmallScreen
        ? "tight"
        : isCompactScreen
            ? "compact"
            : "comfortable";

    return {
        isVerySmallScreen,
        isCompactScreen,
        cockpitDensity,
    };
}

export function getPreparationBaseStageGap(
    density: PreparationCockpitDensity,
): number {
    return density === "tight" ? 0 : density === "compact" ? 2 : 4;
}

export function getPreparationResultToDiceOverlap(
    density: PreparationCockpitDensity,
): number {
    return density === "tight" ? -14 : density === "compact" ? -12 : -8;
}

export function getPreparationDiceToPreparedOverlap(
    density: PreparationCockpitDensity,
): number {
    return density === "tight" ? -18 : density === "compact" ? -16 : -12;
}