export type SaveableDraftDie = {
  sides: number;
  qty: number;
  modifier: number;
  sign: number;
  rule_id: string | null;
};

export type SaveableDraftGroup = {
  name: string;
  rule_id: string | null;
  dice: SaveableDraftDie[];
};

type DraftLikeDie = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
};

type DraftLikeGroup = {
  name: string;
  rule_id?: string | null;
  dice: DraftLikeDie[];
};

export function toSaveableDraftGroups(
  groups: DraftLikeGroup[]
): SaveableDraftGroup[] {
  return groups.map((g) => ({
    name: g.name,
    rule_id: g.rule_id ?? null,
    dice: g.dice.map((d) => ({
      sides: d.sides,
      qty: d.qty,
      modifier: d.modifier ?? 0,
      sign: d.sign ?? 1,
      rule_id: d.rule_id ?? null,
    })),
  }));
}