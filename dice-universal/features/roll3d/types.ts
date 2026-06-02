// dice-universal/features/roll3d/types.ts

export type Roll3DDieSides = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export type Roll3DDieVisualState =
    | "idle"
    | "selected"
    | "dropping"
    | "rolling"
    | "settled"
    | "highlighted";

export type Roll3DDieSkinId =
    | "graphite_default"
    | "dragon"
    | "arcane"
    | "metal"
    | "cosmic";

export type Roll3DD100DisplayMode = "percentile_pair" | "single_oracle";