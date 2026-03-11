import type { Db } from "../db/database";
import { newId } from "../../core/types/ids";

export type GroupRow = {
  id: string;
  profile_id: string;
  name: string;
  sort_order: number;
  rule_id: string | null;
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

function nowIso() {
  return new Date().toISOString();
}

async function assertTableIsNotSystemFromGroup(db: Db, groupId: string): Promise<void> {
  const rows = await db.getAllAsync<{ is_system: number }>(
    `
    SELECT t.is_system
    FROM groups g
    JOIN profiles p ON p.id = g.profile_id
    JOIN tables t ON t.id = p.table_id
    WHERE g.id = ?
    LIMIT 1;
    `,
    [groupId]
  );

  if (rows.length && rows[0].is_system === 1) {
    throw new Error("Modification interdite sur table système");
  }
}

async function assertTableIsNotSystemFromDie(db: Db, dieId: string): Promise<void> {
  const rows = await db.getAllAsync<{ is_system: number }>(
    `
    SELECT t.is_system
    FROM group_dice gd
    JOIN groups g ON g.id = gd.group_id
    JOIN profiles p ON p.id = g.profile_id
    JOIN tables t ON t.id = p.table_id
    WHERE gd.id = ?
    LIMIT 1;
    `,
    [dieId]
  );

  if (rows.length && rows[0].is_system === 1) {
    throw new Error("Modification interdite sur table système");
  }
}

async function assertTableIsNotSystemFromProfile(db: Db, profileId: string): Promise<void> {
  const rows = await db.getAllAsync<{ is_system: number }>(
    `
    SELECT t.is_system
    FROM profiles p
    JOIN tables t ON t.id = p.table_id
    WHERE p.id = ?
    LIMIT 1;
    `,
    [profileId]
  );

  if (rows.length && rows[0].is_system === 1) {
    throw new Error("Modification interdite sur table système");
  }
}

export async function listGroupsByProfileId(db: Db, profileId: string): Promise<GroupRow[]> {
  return db.getAllAsync<GroupRow>(
    `
    SELECT *
    FROM groups
    WHERE profile_id = ?
    ORDER BY sort_order ASC, created_at ASC;
    `,
    [profileId]
  );
}

export async function getGroupById(db: Db, groupId: string): Promise<GroupRow | null> {
  const rows = await db.getAllAsync<GroupRow>(
    `
    SELECT *
    FROM groups
    WHERE id = ?
    LIMIT 1;
    `,
    [groupId]
  );

  return rows.length ? rows[0] : null;
}

export async function listDiceByGroupId(db: Db, groupId: string): Promise<GroupDieRow[]> {
  return db.getAllAsync<GroupDieRow>(
    `
    SELECT *
    FROM group_dice
    WHERE group_id = ?
    ORDER BY sort_order ASC, created_at ASC;
    `,
    [groupId]
  );
}

export async function createGroup(
  db: Db,
  params: {
    profileId: string;
    name: string;
    rule_id?: string | null;
  }
): Promise<string> {
  await assertTableIsNotSystemFromProfile(db, params.profileId);

  const createdAt = nowIso();
  const id = await newId();

  const rows = await db.getAllAsync<{ max_sort: number | null }>(
    `
    SELECT MAX(sort_order) as max_sort
    FROM groups
    WHERE profile_id = ?;
    `,
    [params.profileId]
  );

  const nextSort = (rows[0]?.max_sort ?? -1) + 1;

  await db.runAsync(
    `
    INSERT INTO groups(
      id,
      profile_id,
      name,
      sort_order,
      rule_id,
      created_at,
      updated_at
    )
    VALUES(?, ?, ?, ?, ?, ?, ?);
    `,
    [
      id,
      params.profileId,
      params.name,
      nextSort,
      params.rule_id ?? null,
      createdAt,
      createdAt,
    ]
  );

  return id;
}

export async function deleteGroup(db: Db, groupId: string): Promise<void> {
  await assertTableIsNotSystemFromGroup(db, groupId);
  await db.runAsync("DELETE FROM groups WHERE id = ?;", [groupId]);
}

export async function createGroupDie(
  db: Db,
  params: {
    groupId: string;
    sides: number;
    qty: number;
    modifier?: number;
    sign?: number;
    rule_id?: string | null;
  }
): Promise<string> {
  await assertTableIsNotSystemFromGroup(db, params.groupId);

  const createdAt = nowIso();
  const id = await newId();

  const rows = await db.getAllAsync<{ max_sort: number | null }>(
    `
    SELECT MAX(sort_order) as max_sort
    FROM group_dice
    WHERE group_id = ?;
    `,
    [params.groupId]
  );

  const nextSort = (rows[0]?.max_sort ?? -1) + 1;

  await db.runAsync(
    `
    INSERT INTO group_dice(
      id,
      group_id,
      sides,
      qty,
      modifier,
      sign,
      sort_order,
      rule_id,
      created_at,
      updated_at
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      id,
      params.groupId,
      params.sides,
      params.qty,
      params.modifier ?? 0,
      params.sign ?? 1,
      nextSort,
      params.rule_id ?? null,
      createdAt,
      createdAt,
    ]
  );

  return id;
}

export async function deleteGroupDie(db: Db, dieId: string): Promise<void> {
  await assertTableIsNotSystemFromDie(db, dieId);
  await db.runAsync("DELETE FROM group_dice WHERE id = ?;", [dieId]);
}

export async function updateGroupDieRuleId(
  db: Db,
  dieId: string,
  ruleId: string | null
): Promise<void> {
  await assertTableIsNotSystemFromDie(db, dieId);

  const now = nowIso();

  await db.runAsync(
    `
    UPDATE group_dice
    SET rule_id = ?, updated_at = ?
    WHERE id = ?;
    `,
    [ruleId, now, dieId]
  );
}

export async function updateGroupDie(
  db: Db,
  dieId: string,
  params: {
    sides: number;
    qty: number;
    modifier?: number;
    sign?: number;
    rule_id?: string | null;
  }
): Promise<void> {
  await assertTableIsNotSystemFromDie(db, dieId);

  const now = nowIso();

  await db.runAsync(
    `
    UPDATE group_dice
    SET
      sides = ?,
      qty = ?,
      modifier = ?,
      sign = ?,
      rule_id = ?,
      updated_at = ?
    WHERE id = ?;
    `,
    [
      params.sides,
      params.qty,
      params.modifier ?? 0,
      params.sign ?? 1,
      params.rule_id ?? null,
      now,
      dieId,
    ]
  );
}

export async function updateGroupRuleId(
  db: Db,
  groupId: string,
  ruleId: string | null
): Promise<void> {
  await assertTableIsNotSystemFromGroup(db, groupId);

  const now = nowIso();

  await db.runAsync(
    `
    UPDATE groups
    SET rule_id = ?, updated_at = ?
    WHERE id = ?;
    `,
    [ruleId, now, groupId]
  );
}

export async function updateGroupName(
  db: Db,
  groupId: string,
  name: string
): Promise<void> {
  await assertTableIsNotSystemFromGroup(db, groupId);

  const now = nowIso();

  await db.runAsync(
    `
    UPDATE groups
    SET name = ?, updated_at = ?
    WHERE id = ?;
    `,
    [name, now, groupId]
  );
}

export async function updateGroupOrder(
  db: Db,
  groupId: string,
  sortOrder: number
): Promise<void> {
  await assertTableIsNotSystemFromGroup(db, groupId);

  const now = nowIso();

  await db.runAsync(
    `
    UPDATE groups
    SET sort_order = ?, updated_at = ?
    WHERE id = ?;
    `,
    [sortOrder, now, groupId]
  );
}