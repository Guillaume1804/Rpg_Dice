// dice-universal/features/preparation/utils/preparationRollHelpers.ts

import type {
    Roll3DDieSides,
    Roll3DDieSign,
} from "../../roll3d/types";

import type { DraftGroupSummary } from "../../roll/helpers/rollDisplaySummary";

export function findStandardQuickGroup(groups: DraftGroupSummary[]) {
    return (
        groups.find(
            (group) => group.name === "Jet libre" && group.dice.length > 0,
        ) ?? null
    );
}

export function findDraftGroupById(
    groups: DraftGroupSummary[],
    groupId: string | null,
) {
    if (!groupId) return null;

    return groups.find((group) => group.id === groupId) ?? null;
}

export function formatPreparedCardModifier(modifier?: number) {
    const safeModifier = Number.isFinite(modifier ?? 0) ? (modifier ?? 0) : 0;

    if (safeModifier === 0) return "";

    return ` ${safeModifier > 0 ? "+" : "-"} ${Math.abs(safeModifier)}`;
}

export function formatPreparedCardDieLabel(die: {
    sides: number;
    qty: number;
    modifier?: number;
    sign?: number;
}) {
    const signPrefix = die.sign === -1 ? "- " : "";

    return `${signPrefix}${die.qty}d${die.sides}${formatPreparedCardModifier(
        die.modifier,
    )}`;
}

export function toRoll3DDieSides(value: number): Roll3DDieSides | null {
    if (
        value === 4 ||
        value === 6 ||
        value === 8 ||
        value === 10 ||
        value === 12 ||
        value === 20 ||
        value === 100
    ) {
        return value;
    }

    return null;
}

export function toRoll3DDieSign(value?: number | null): Roll3DDieSign {
    return value === -1 ? -1 : 1;
}