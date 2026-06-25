// dice-universal/features/preparation/utils/preparationActionValidation.ts

export type PreparationActionValidationResult =
    | {
        valid: true;
    }
    | {
        valid: false;
        message: string;
    };

export function validateRequiredActionName(
    actionName: string,
): PreparationActionValidationResult {
    if (actionName.trim().length > 0) {
        return { valid: true };
    }

    return {
        valid: false,
        message: "Le nom de l’action est obligatoire.",
    };
}

export function validateUserEditableTable(params: {
    tableIsSystem: boolean;
    action: "update" | "create";
}): PreparationActionValidationResult {
    if (!params.tableIsSystem) {
        return { valid: true };
    }

    return {
        valid: false,
        message:
            params.action === "update"
                ? "Impossible de modifier une action d’une table système."
                : "Impossible d’ajouter une action dans une table système.",
    };
}

export function validateActionHasDice(params: {
    diceCount: number;
}): PreparationActionValidationResult {
    if (params.diceCount > 0) {
        return { valid: true };
    }

    return {
        valid: false,
        message: "Impossible de sauvegarder une action sans dé.",
    };
}

export function validateSourceActionFound(params: {
    found: boolean;
}): PreparationActionValidationResult {
    if (params.found) {
        return { valid: true };
    }

    return {
        valid: false,
        message: "Action source introuvable.",
    };
}