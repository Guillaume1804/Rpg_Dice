// dice-universal/features/preparation/model/preparationConstants.ts

export const STANDARD_DICE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const;

export type StandardDiceSide = (typeof STANDARD_DICE_SIDES)[number];