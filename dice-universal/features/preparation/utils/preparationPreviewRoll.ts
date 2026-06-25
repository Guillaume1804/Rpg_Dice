// dice-universal/features/preparation/utils/preparationPreviewRoll.ts

export type PreparedPreviewRuleLike = {
    id?: string | number | null;
    name?: string | null;
    kind?: string | null;
    params_json?: unknown;
    paramsJson?: unknown;
};

export type PreparedPreviewRollRule = {
    id: string;
    name: string;
    kind: string;
    params_json: string;
};

export function createPreparedPreviewRollRule(params: {
    sourceRule: PreparedPreviewRuleLike | null | undefined;
    fallbackId: string;
    fallbackName?: string;
    fallbackKind?: string;
}): PreparedPreviewRollRule | null {
    const {
        sourceRule,
        fallbackId,
        fallbackName = "Comportement temporaire",
        fallbackKind = "sum",
    } = params;

    if (!sourceRule) {
        return null;
    }

    const rawParamsJson =
        typeof sourceRule.params_json === "string"
            ? sourceRule.params_json
            : typeof sourceRule.paramsJson === "string"
                ? sourceRule.paramsJson
                : JSON.stringify(sourceRule.params_json ?? {});

    return {
        id: String(sourceRule.id ?? fallbackId),
        name: String(sourceRule.name ?? fallbackName),
        kind: String(sourceRule.kind ?? fallbackKind),
        params_json: rawParamsJson,
    };
}