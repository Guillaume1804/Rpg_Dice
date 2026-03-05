import type { Db } from "../db/database";

export type GroupRow = {
  id: string;
  table_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type GroupDieRow = {
  id: string;
  group_id: string;
  sides: number;
  qty: number;
  modifier: number;
  sign: number;
  sort_order: number;

  rule_id: string | null;

  created_at: string;
  updated_at: string;
};

export async function listGroupsByTableId(db: Db, tableId: string): Promise<GroupRow[]> {
  return db.getAllAsync<GroupRow>(
    "SELECT * FROM groups WHERE table_id = ? ORDER BY sort_order ASC;",
    [tableId]
  );
}

export async function listDiceByGroupId(db: Db, groupId: string): Promise<GroupDieRow[]> {
  return db.getAllAsync<GroupDieRow>(
    "SELECT * FROM group_dice WHERE group_id = ? ORDER BY sort_order ASC;",
    [groupId]
  );
}

export async function updateGroupDieRuleId(
  db: Db,
  dieId: string,
  ruleId: string | null
): Promise<void> {
  // Vérifier si la table liée est système
  const rows = await db.getAllAsync<{ is_system: number }>(
    `
    SELECT t.is_system
    FROM group_dice gd
    JOIN groups g ON g.id = gd.group_id
    JOIN tables t ON t.id = g.table_id
    WHERE gd.id = ?
    LIMIT 1;
    `,
    [dieId]
  );

  if (rows.length && rows[0].is_system === 1) {
    throw new Error("Modification interdite sur table système");
  }

  const now = new Date().toISOString();
  await db.runAsync(
    `
    UPDATE group_dice
    SET rule_id = ?, updated_at = ?
    WHERE id = ?;
    `,
    [ruleId, now, dieId]
  );
}