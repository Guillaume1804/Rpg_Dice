// dice-universal/features/preparation/utils/preparationPreparedRollViewModel.ts

import { formatPreparedCardDieLabel } from "./preparationRollHelpers";

export type PreparedEditDieSummary = {
    label: string | null;
    sides: number;
    qty: number;
    modifier: number;
    sign: number;
    ruleLabel: string;
};

export type PreparedCardLineViewModel = {
    id: string;
    label: string;
    customLabel: string;
    technicalLabel: string;
    detail: string;
    sign: number;
    sides: number;
    qty: number;
    modifier: number;
    hasBehavior: boolean;
};

export function mapPreparedEditDiceToPreparedCardLines(params: {
    dice: PreparedEditDieSummary[];
    draftGroupId?: string | null;
}): PreparedCardLineViewModel[] {
    const { dice, draftGroupId } = params;

    return dice.map((die, index) => {
        const ruleLabel = die.ruleLabel ?? "Somme simple";
        const hasBehavior = ruleLabel !== "Somme simple";
        const technicalLabel = formatPreparedCardDieLabel(die);
        const rawCustomLabel = typeof die.label === "string" ? die.label : "";

        const displayCustomLabel =
            rawCustomLabel.trim().length > 0 ? rawCustomLabel.trim() : null;

        return {
            id: `${draftGroupId ?? "prepared"}-${index}-${die.sides}`,
            label: displayCustomLabel ?? technicalLabel,
            customLabel: rawCustomLabel,
            technicalLabel,
            detail: ruleLabel,
            sign: die.sign ?? 1,
            sides: die.sides,
            qty: die.qty,
            modifier: die.modifier ?? 0,
            hasBehavior,
        };
    });
}

export function countFreeDiceBySides(
    dice: { sides: number; qty: number }[] | null | undefined,
): Record<number, number> {
    const counts: Record<number, number> = {};

    for (const die of dice ?? []) {
        counts[die.sides] = (counts[die.sides] ?? 0) + die.qty;
    }

    return counts;
}