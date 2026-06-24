import type { ActionEntry, ActionSet } from "../actions/actionSetModel";
import type { BehaviorRef } from "../behaviors/behaviorModel";

export type RollDraftSource = "free" | "prepared" | "action";

export type RollDraftEntry = {
    id: string;
    source: RollDraftSource;
    actionSetId?: string | null;
    actionSetName?: string | null;
    savedEntryId?: string | null;
    label: string | null;
    technicalLabel: string;
    sides: number;
    quantity: number;
    modifier: number;
    sign: 1 | -1;
    behavior: BehaviorRef | null;
};

export type RollDraft = {
    id: string;
    name: string | null;
    entries: RollDraftEntry[];
    groupBehavior: BehaviorRef | null;
};

export type RollDraftFromActionSetInput = {
    actionSet: ActionSet;
    entries?: ActionEntry[];
};