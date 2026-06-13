// dice-universal/features/roll3d/logic/roll3DAvailableDice.ts

import type { TableRow } from "../../../data/repositories/tablesRepo";
import { STANDARD_ROLL_3D_DICE } from "../constants";
import type { Roll3DDieSides } from "../types";

export type Roll3DAvailableDie = {
    sides: Roll3DDieSides;
    label: string;
    source: "standard" | "table";
};

function formatDieLabel(sides: Roll3DDieSides) {
    return `d${sides}`;
}

export function getRoll3DAvailableDiceForTable(
    _table: TableRow | null,
): Roll3DAvailableDie[] {
    return STANDARD_ROLL_3D_DICE.map((sides) => ({
        sides,
        label: formatDieLabel(sides),
        source: "standard",
    }));
}

export function getRoll3DAvailableDiceSidesForTable(
    table: TableRow | null,
): Roll3DDieSides[] {
    return getRoll3DAvailableDiceForTable(table).map((die) => die.sides);
}