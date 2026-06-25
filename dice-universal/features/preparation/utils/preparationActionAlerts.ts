// dice-universal/features/preparation/utils/preparationActionAlerts.ts

import { Alert } from "react-native";

import { isDuplicateGroupNameError } from "../../../data/repositories/groupsRepo";

export async function showDuplicateActionNameWarning(
    error: unknown,
): Promise<boolean> {
    if (!isDuplicateGroupNameError(error)) {
        return false;
    }

    Alert.alert(
        "Nom d’action déjà utilisé",
        "Une action avec ce nom existe déjà dans ce profil. Choisis un autre nom pour continuer.",
    );

    return true;
}