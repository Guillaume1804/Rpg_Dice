// dice-universal/domain/rolls/rollDraftMappers.ts

import type {
    ActionEntry,
    ActionSet,
} from "../actions/actionSetModel";
import { getActionEntryTechnicalLabel } from "../actions/actionSetMappers";
import type {
    RollDraft,
    RollDraftEntry,
    RollDraftFromActionSetInput,
    RollDraftSource,
} from "./rollDraftModel";

function createDomainRollDraftId(prefix = "roll-draft") {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function mapActionEntryToRollDraftEntry(params: {
    entry: ActionEntry;
    actionSet: ActionSet;
    source?: RollDraftSource;
}): RollDraftEntry {
    const { entry, actionSet, source = "action" } = params;

    return {
        id: createDomainRollDraftId("roll-entry"),
        source,
        actionSetId: actionSet.id,
        actionSetName: actionSet.name,
        savedEntryId: entry.id,
        label: entry.label,
        technicalLabel: getActionEntryTechnicalLabel(entry),
        sides: entry.sides,
        quantity: entry.quantity,
        modifier: entry.modifier,
        sign: entry.sign,
        behavior: entry.behavior,
    };
}

export function mapActionSetToRollDraft({
    actionSet,
    entries,
}: RollDraftFromActionSetInput): RollDraft {
    const selectedEntries = entries && entries.length > 0
        ? entries
        : actionSet.entries;

    return {
        id: createDomainRollDraftId(),
        name: actionSet.name,
        groupBehavior: actionSet.behavior,
        entries: selectedEntries.map((entry) =>
            mapActionEntryToRollDraftEntry({
                entry,
                actionSet,
                source: "action",
            }),
        ),
    };
}

export function createFreeRollDraftEntry(params: {
    sides: number;
    quantity?: number;
    modifier?: number;
    sign?: 1 | -1;
    label?: string | null;
}): RollDraftEntry {
    const quantity = params.quantity ?? 1;
    const modifier = params.modifier ?? 0;
    const sign = params.sign ?? 1;

    const technicalLabel = `${sign === -1 ? "- " : ""}${quantity}d${params.sides}${modifier > 0
            ? ` + ${modifier}`
            : modifier < 0
                ? ` - ${Math.abs(modifier)}`
                : ""
        }`;

    return {
        id: createDomainRollDraftId("free-roll-entry"),
        source: "free",
        actionSetId: null,
        actionSetName: null,
        savedEntryId: null,
        label: params.label ?? null,
        technicalLabel,
        sides: params.sides,
        quantity,
        modifier,
        sign,
        behavior: null,
    };
}

export function createFreeRollDraft(params: {
    entries: RollDraftEntry[];
    name?: string | null;
}): RollDraft {
    return {
        id: createDomainRollDraftId(),
        name: params.name ?? null,
        entries: params.entries,
        groupBehavior: null,
    };
}