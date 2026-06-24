// dice-universal/domain/rolls/roll3DDraftMappers.ts

import type { RollDraft, RollDraftEntry } from "./rollDraftModel";
import type {
    Roll3DDieBehaviorRef,
    Roll3DDieSource,
} from "../../features/roll3d/types";
import {
    createRoll3DDraftFromDice,
    type CreateRoll3DDieInput,
} from "../../features/roll3d/logic/roll3DDraft";

function mapRollDraftSourceToRoll3DSource(
    source: RollDraftEntry["source"],
): Roll3DDieSource {
    if (source === "action") return "action";
    if (source === "prepared") return "prepared";
    return "free";
}

function mapBehaviorRefToRoll3DBehaviorRef(
    behavior: RollDraftEntry["behavior"],
): Roll3DDieBehaviorRef | null {
    if (!behavior) return null;

    return {
        id: behavior.id,
        label: behavior.name,
        kind: behavior.kind,
        rule: {
            id: behavior.id,
            name: behavior.name,
            kind: behavior.kind,
            params_json: behavior.paramsJson,
        },
    };
}

function mapGroupBehaviorToRoll3DBehaviorRef(
    behavior: RollDraft["groupBehavior"],
): Roll3DDieBehaviorRef | null {
    if (!behavior) return null;

    return {
        id: behavior.id,
        label: behavior.name,
        kind: behavior.kind,
        rule: {
            id: behavior.id,
            name: behavior.name,
            kind: behavior.kind,
            params_json: behavior.paramsJson,
        },
    };
}

function mapRollDraftEntryToRoll3DDieInputs(
    entry: RollDraftEntry,
): CreateRoll3DDieInput[] {
    const quantity = Math.max(1, Math.floor(entry.quantity));
    const dice: CreateRoll3DDieInput[] = [];

    const source = mapRollDraftSourceToRoll3DSource(entry.source);
    const behavior = mapBehaviorRefToRoll3DBehaviorRef(entry.behavior);

    for (let index = 0; index < quantity; index += 1) {
        dice.push({
            rollEntryId: entry.id,
            sides: entry.sides as CreateRoll3DDieInput["sides"],
            sign: entry.sign,
            modifier: index === 0 ? entry.modifier : 0,
            source,
            behavior,
            rollEntryMeta: {
                actionId: entry.actionSetId ?? undefined,
                actionName: entry.actionSetName ?? undefined,
                savedEntryId: entry.savedEntryId ?? undefined,
                entryLabel: entry.label ?? entry.technicalLabel,
                technicalLabel: entry.technicalLabel,
            },
        });
    }

    return dice;
}

export function mapRollDraftToRoll3DDraft(rollDraft: RollDraft) {
    const dice = rollDraft.entries.flatMap(mapRollDraftEntryToRoll3DDieInputs);

    return createRoll3DDraftFromDice(dice, {
        groupBehavior: mapGroupBehaviorToRoll3DBehaviorRef(
            rollDraft.groupBehavior,
        ),
    });
}