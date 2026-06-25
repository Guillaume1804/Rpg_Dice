// dice-universal/features/preparation/utils/preparationSaveHelpers.ts

export function getDefaultFreeActionName(params: {
    draftGroupName?: string | null;
    fallback?: string;
}) {
    const trimmedName = params.draftGroupName?.trim();

    if (trimmedName) {
        return trimmedName;
    }

    return params.fallback ?? "Jet rapide";
}

export function getDefaultNewTableName(params?: {
    date?: Date;
}) {
    const date = params?.date ?? new Date();

    return `Nouvelle table (${date.toLocaleDateString()})`;
}

export function getDefaultActionCopyName(params: {
    draftGroupName?: string | null;
    actionLabel: string;
}) {
    const baseName = params.draftGroupName?.trim() || params.actionLabel;

    return `${baseName} — variante`;
}