import type { Db } from "../db/database";
import { newId } from "../../core/types/ids";

export type DraftDie = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
};

export type DraftGroup = {
  name: string;
  rule_id?: string | null;
  dice: DraftDie[];
};

function nowIso() {
  return new Date().toISOString();
}

async function assertTableIsNotSystem(db: Db, tableId: string): Promise<void> {
  const rows = await db.getAllAsync<{ is_system: number }>(
    "SELECT is_system FROM tables WHERE id = ? LIMIT 1;",
    [tableId]
  );

  if (rows.length && rows[0].is_system === 1) {
    throw new Error("Impossible de modifier une table système");
  }
}

export async function deleteAllGroupsForTable(db: Db, tableId: string): Promise<void> {
  await assertTableIsNotSystem(db, tableId);
  await db.runAsync("DELETE FROM groups WHERE table_id = ?;", [tableId]);
}

export async function createGroupFromDraft(
  db: Db,
  params: {
    tableId: string;
    groupName: string;
    groupRuleId?: string | null;
    draftDice: DraftDie[];
    sortOrder?: number;
  }
): Promise<string> {
  const createdAt = nowIso();
  const groupId = await newId();

  await db.runAsync(
    `INSERT INTO groups(id, table_id, name, sort_order, rule_id, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?, ?);`,
    [
      groupId,
      params.tableId,
      params.groupName,
      params.sortOrder ?? 0,
      params.groupRuleId ?? null,
      createdAt,
      createdAt,
    ]
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

export async function createGroupsFromDraft(
  db: Db,
  params: {
    tableId: string;
    groups: DraftGroup[];
  }
): Promise<string[]> {
  await assertTableIsNotSystem(db, params.tableId);

  const groupIds: string[] = [];

  for (let i = 0; i < params.groups.length; i++) {
    const g = params.groups[i];

    const groupId = await createGroupFromDraft(db, {
      tableId: params.tableId,
      groupName: g.name,
      groupRuleId: g.rule_id ?? null,
      draftDice: g.dice,
      sortOrder: i,
    });

    groupIds.push(groupId);
  }

  return groupIds;
}

export async function createTableWithDraft(
  db: Db,
  params: {
    name: string;
    groupName: string;
    groupRuleId?: string | null;
    draftDice: DraftDie[];
  }
): Promise<string> {
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
    groupRuleId: params.groupRuleId ?? null,
    draftDice: params.draftDice,
    sortOrder: 0,
  });

  return tableId;
}

export async function createTableWithDraftGroups(
  db: Db,
  params: {
    name: string;
    groups: DraftGroup[];
  }
): Promise<string> {
  const createdAt = nowIso();
  const tableId = await newId();

  await db.runAsync(
    `INSERT INTO tables(id, name, is_system, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?);`,
    [tableId, params.name, 0, createdAt, createdAt]
  );

  await createGroupsFromDraft(db, {
    tableId,
    groups: params.groups,
  });

  return tableId;
}

export async function replaceTableWithDraftGroups(
  db: Db,
  params: {
    tableId: string;
    groups: DraftGroup[];
  }
): Promise<void> {
  await assertTableIsNotSystem(db, params.tableId);

  await deleteAllGroupsForTable(db, params.tableId);

  await createGroupsFromDraft(db, {
    tableId: params.tableId,
    groups: params.groups,
  });
}