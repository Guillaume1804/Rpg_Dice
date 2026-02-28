import type { Db } from "../db/database";
import { newId } from "../../core/types/ids";

export type DraftDie = {
  sides: number;
  qty: number;
  modifier?: number;

  // ✅ règles V2 (optionnelles)
  rule_mode?: string;         // ex: "sum" | "d20" | "pool" ...
  rule_params_json?: string;  // JSON string
};

function nowIso() {
  return new Date().toISOString();
}

/** Supprime tous les groupes d'une table (cascade -> group_dice) */
export async function deleteAllGroupsForTable(db: Db, tableId: string): Promise<void> {
  await db.runAsync("DELETE FROM groups WHERE table_id = ?;", [tableId]);
}

/** Crée un groupe + ses dés dans une table */
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
    const dieId = await newId();

    await db.runAsync(
      `INSERT INTO group_dice(
        id, group_id, sides, qty, modifier, sort_order,
        rule_mode, rule_params_json,
        created_at, updated_at
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        dieId,
        groupId,
        d.sides,
        d.qty,
        d.modifier ?? 0,
        sort++,
        d.rule_mode ?? "sum",
        d.rule_params_json ?? "{}",
        createdAt,
        createdAt,
      ]
    );
  }

  return groupId;
}

/** Crée une nouvelle table + (optionnel) un groupe créé depuis draft */
export async function createTableWithDraft(db: Db, params: {
  name: string;
  draftDice: DraftDie[];
  groupName: string;
}): Promise<string> {
  const createdAt = nowIso();
  const tableId = await newId();

  await db.runAsync(
    `INSERT INTO tables(id, name, is_system, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?);`,
    [tableId, params.name, 0, createdAt, createdAt]
  );

  if (params.draftDice.length > 0) {
    await createGroupFromDraft(db, {
      tableId,
      groupName: params.groupName,
      draftDice: params.draftDice,
    });
  }

  return tableId;
}