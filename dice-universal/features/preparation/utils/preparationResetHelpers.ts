// dice-universal/features/preparation/utils/preparationResetHelpers.ts

import type { Dispatch, SetStateAction } from "react";
import type { GroupRollResult } from "../../../core/roll/roll";
import type { PreparedRoll } from "../model";

export type ResetPreparedRollUiParams = {
    setPreparedRoll: Dispatch<SetStateAction<PreparedRoll | null>>;
    setLatestResult: Dispatch<SetStateAction<GroupRollResult | null>>;
    setShowPreparedEditSheet: Dispatch<SetStateAction<boolean>>;
    setQuickModifier: Dispatch<SetStateAction<number>>;
    setFocusedPreparedLineIndex: Dispatch<SetStateAction<number | null>>;
};

export function resetPreparedRollUiState(params: ResetPreparedRollUiParams) {
    params.setPreparedRoll(null);
    params.setLatestResult(null);
    params.setShowPreparedEditSheet(false);
    params.setQuickModifier(0);
    params.setFocusedPreparedLineIndex(null);
}

export type ResetSessionUiParams = ResetPreparedRollUiParams & {
    setSelectedProfileId: Dispatch<SetStateAction<string | null>>;
    setShowTableSessionMenu: Dispatch<SetStateAction<boolean>>;
    setShowProfileSessionMenu: Dispatch<SetStateAction<boolean>>;
    setResults: Dispatch<SetStateAction<GroupRollResult[]>>;
};

export function resetPreparationSessionUiState(params: ResetSessionUiParams) {
    params.setSelectedProfileId(null);
    params.setResults([]);
    params.setShowTableSessionMenu(false);
    params.setShowProfileSessionMenu(false);

    resetPreparedRollUiState(params);
}