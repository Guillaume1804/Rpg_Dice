import type { Db } from "../db/database";
import { newId } from "../../core/types/ids";

export type DraftDie = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
};

function nowIso() {
  return new Date().toISOString();
}

export async function deleteAllGroupsForTable(db: Db, tableId: string): Promise<void> {

  const rows = await db.getAllAsync<{ is_system: number }>(
    "SELECT is_system FROM tables WHERE id = ? LIMIT 1;",
    [tableId]
  );

  if (rows.length && rows[0].is_system === 1) {
    throw new Error("Impossible de modifier une table système");
  }

  await db.runAsync("DELETE FROM groups WHERE table_id = ?;", [tableId]);
}

export async function createGroupFromDraft(db: Db, params: {
  tableId: string;
  groupName: string;
  draftDice: DraftDie[];
}): Promise<string> {
  const createdAt = nowIso();
  const groupId = await newId();

  await db.runAsync(
    `INSERT INTO groups(id, table_id, name, sort_order, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?);`,
    [groupId, params.tableId, params.groupName, 0, createdAt, createdAt]
  );

  let sort = 0;
  for (const d of params.draftDice) {
    const id = await newId();
    await db.runAsync(
      `INSERT INTO group_dice(
        id, group_id, sides, qty, modifier, sign, sort_order,
        rule_id,
        created_at, updated_at
      )
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        groupId,
        d.sides,
        d.qty,
        d.modifier ?? 0,
        d.sign ?? 1,
        sort++,
        d.rule_id ?? null,
        createdAt,
        createdAt,
      ]
    );
  }

  return groupId;
}

export async function createTableWithDraft(db: Db, params: {
  name: string;
  groupName: string;
  draftDice: DraftDie[];
}): Promise<string> {
  const createdAt = nowIso();
  const tableId = await newId();

  await db.runAsync(
    `INSERT INTO tables(id, name, is_system, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?);`,
    [tableId, params.name, 0, createdAt, createdAt]
  );

  await createGroupFromDraft(db, {
    tableId,
    groupName: params.groupName,
    draftDice: params.draftDice,
  });

  return tableId;
}