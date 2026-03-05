// core/roll/roll.ts

export type RollDieValue = {
  value: number; // valeur naturelle (1..sides)
};

export type RollEntryInput = {
  dieId: string;      // ✅ id de group_dice
  sides: number;
  qty: number;
};

export type RollEntryResult = {
  dieId: string;
  sides: number;
  qty: number;
  dice: RollDieValue[]; // ✅ valeurs naturelles, longueur = qty
};

export type GroupRollResult = {
  groupId: string;
  label: string;
  entries: RollEntryResult[];
  // total brut (somme des valeurs naturelles), utile debug/legacy
  raw_total: number;
};

function randInt(min: number, max: number) {
  // min/max inclus
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function rollGroup(params: {
  groupId: string;
  label: string;
  entries: RollEntryInput[];
}): GroupRollResult {
  const entries: RollEntryResult[] = params.entries.map((e) => {
    const dice: RollDieValue[] = [];
    for (let i = 0; i < e.qty; i++) {
      dice.push({ value: randInt(1, e.sides) });
    }
    return { dieId: e.dieId, sides: e.sides, qty: e.qty, dice };
  });

  const raw_total = entries
    .flatMap((e) => e.dice)
    .reduce((acc, d) => acc + d.value, 0);

  return {
    groupId: params.groupId,
    label: params.label,
    entries,
    raw_total,
  };
}