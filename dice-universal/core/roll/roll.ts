export type DieSpec = {
  sides: number;   // ex: 20
  qty: number;     // ex: 2
};

export type RolledDie = {
  sides: number;
  value: number;
};

export type GroupRollResult = {
  groupId: string;
  label: string;
  dice: RolledDie[];
  total: number; // somme simple (utile même si on affiche séparé)
};

function rollOne(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollGroup(params: {
  groupId: string;
  label: string;
  dice: DieSpec[];
}): GroupRollResult {
  const rolled: RolledDie[] = [];
  for (const spec of params.dice) {
    for (let i = 0; i < spec.qty; i++) {
      rolled.push({ sides: spec.sides, value: rollOne(spec.sides) });
    }
  }
  const total = rolled.reduce((acc, d) => acc + d.value, 0);

  return {
    groupId: params.groupId,
    label: params.label,
    dice: rolled,
    total,
  };
}