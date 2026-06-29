import type { Roll3DDieSides } from "../types";

export type Roll3DExternalSourceApp =
    | "dice_universal"
    | "character_sheet"
    | "modern_book"
    | "platform"
    | "unknown";

export type Roll3DExternalRef = {
    app: Roll3DExternalSourceApp;
    id: string;
    label?: string;
};

export type Roll3DRollIntentDie = {
    id: string;
    sides: Roll3DDieSides;
    qty: number;
    modifier?: number;
    sign?: 1 | -1;
    label?: string;
    behaviorId?: string | null;
};

export type Roll3DRollIntentHandLine = {
    id: string;
    label?: string;
    dice: Roll3DRollIntentDie[];
    behaviorId?: string | null;
    sourceRef?: Roll3DExternalRef;
};

export type Roll3DRollIntentHand = {
    id: string;
    label: string;
    lines: Roll3DRollIntentHandLine[];
    behaviorId?: string | null;
    sourceRef?: Roll3DExternalRef;
};

export type Roll3DRollContext = {
    tableId?: string;
    profileId?: string;
    characterRef?: Roll3DExternalRef;
    bookRef?: Roll3DExternalRef;
    sceneRef?: Roll3DExternalRef;
    reason?: string;
    difficulty?: number;
    opposition?: unknown;
    tags?: string[];
};

export type Roll3DRollIntent = {
    id: string;
    sourceApp: Roll3DExternalSourceApp;
    createdAt: number;
    hand: Roll3DRollIntentHand;
    context?: Roll3DRollContext;
};

export type Roll3DRollResultEvent = {
    id: string;
    type:
    | "success"
    | "failure"
    | "critical_success"
    | "critical_failure"
    | "complication"
    | "explosion"
    | "reroll"
    | "kept"
    | "dropped"
    | "degrees"
    | "table_lookup"
    | "custom";
    label: string;
    dieIds?: string[];
    payload?: unknown;
};

export type Roll3DRollResultEnvelope = {
    id: string;
    intentId?: string;
    createdAt: number;
    rawValues: {
        dieId: string;
        sides: Roll3DDieSides;
        value: number;
    }[];
    total?: number;
    label?: string;
    events: Roll3DRollResultEvent[];
    officialResult?: unknown;
    sourceApp?: Roll3DExternalSourceApp;
};