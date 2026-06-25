// dice-universal/features/preparation/utils/preparationSessionMenuItems.ts

import type { SessionMenuItem } from "../../roll/components/SessionMenuModal";

export function createFreeModeSessionMenuItem(params: {
    activeTableId: string | null | undefined;
    onPress: () => void | Promise<void>;
}): SessionMenuItem {
    const { activeTableId, onPress } = params;

    return {
        id: "free-mode",
        label: "Mode libre",
        description: activeTableId
            ? "Revenir aux jets libres, sans table active."
            : "Tu es déjà en mode libre.",
        icon: "🎲",
        selected: !activeTableId,
        disabled: !activeTableId,
        danger: !!activeTableId,
        onPress,
    };
}

export function createLoadingTablesSessionMenuItem(): SessionMenuItem {
    return {
        id: "loading-tables",
        label: "Chargement des tables…",
        description: "Récupération des tables disponibles.",
        icon: "⌛",
        disabled: true,
        onPress: (): void => {
            return;
        },
    };
}

export function createEmptyTablesSessionMenuItem(): SessionMenuItem {
    return {
        id: "no-tables",
        label: "Aucune table disponible",
        description: "Crée une table depuis l’écran Tables.",
        icon: "◇",
        disabled: true,
        onPress: (): void => {
            return;
        },
    };
}

export function createNoProfileSessionMenuItem(): SessionMenuItem {
    return {
        id: "no-profile",
        label: "Aucun profil disponible",
        description: "Active une table contenant des profils.",
        icon: "◇",
        disabled: true,
        onPress: (): void => {
            return;
        },
    };
}