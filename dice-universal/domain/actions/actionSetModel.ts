import type { BehaviorRef } from "../behaviors/behaviorModel";

export type ActionEntrySign = 1 | -1;

export type ActionEntry = {
    id: string;
    actionSetId: string;
    label: string | null;
    sides: number;
    quantity: number;
    modifier: number;
    sign: ActionEntrySign;
    behavior: BehaviorRef | null;
};

export type ActionSet = {
    id: string;
    profileId: string;
    name: string;
    behavior: BehaviorRef | null;
    entries: ActionEntry[];
};