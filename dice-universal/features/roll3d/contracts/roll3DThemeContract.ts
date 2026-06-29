export type Roll3DThemeIntensity = "low" | "medium" | "high" | "legendary";

export type Roll3DAssetKind =
    | "model"
    | "texture"
    | "material"
    | "audio"
    | "particle"
    | "environment"
    | "haptic"
    | "shader";

export type Roll3DAssetRef = {
    id: string;
    uri?: string;
    kind: Roll3DAssetKind;
};

export type Roll3DDiceSkinConfig = {
    id: string;
    label: string;
    supportedSides?: number[];
    modelAssetId?: string;
    materialAssetId?: string;
    textureAssetId?: string;
    edgeStyle?: "none" | "subtle" | "glow" | "engraved";
    numberStyle?: "none" | "floating" | "engraved" | "emissive";
};

export type Roll3DTableThemeConfig = {
    id: string;
    label: string;
    surfaceMaterialAssetId?: string;
    borderMaterialAssetId?: string;
    environmentAssetId?: string;
    lightingPresetId?: string;
    backgroundAssetId?: string;
};

export type Roll3DEffectThemeConfig = {
    id: string;
    label: string;
    rollTrailAssetId?: string;
    successEffectAssetId?: string;
    failureEffectAssetId?: string;
    criticalSuccessEffectAssetId?: string;
    criticalFailureEffectAssetId?: string;
    complicationEffectAssetId?: string;
    explosionEffectAssetId?: string;
    rerollEffectAssetId?: string;
};

export type Roll3DSoundThemeConfig = {
    id: string;
    label: string;
    rollSoundAssetId?: string;
    settleSoundAssetId?: string;
    successSoundAssetId?: string;
    failureSoundAssetId?: string;
    criticalSoundAssetId?: string;
    complicationSoundAssetId?: string;
};

export type Roll3DHapticThemeConfig = {
    id: string;
    label: string;
    lightPatternAssetId?: string;
    mediumPatternAssetId?: string;
    heavyPatternAssetId?: string;
    criticalPatternAssetId?: string;
};

export type Roll3DThemeConfig = {
    id: string;
    label: string;
    description?: string;
    assets: Roll3DAssetRef[];
    table: Roll3DTableThemeConfig;
    defaultDiceSkinId: string;
    diceSkins: Roll3DDiceSkinConfig[];
    effects?: Roll3DEffectThemeConfig;
    sounds?: Roll3DSoundThemeConfig;
    haptics?: Roll3DHapticThemeConfig;
    tags?: string[];
};