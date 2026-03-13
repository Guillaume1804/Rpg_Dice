import type { Db } from "../db/database";

export type ProfileRow = {
  id: string;
  table_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function nowIso() {
  return new Date().toISOString();
}

async function assertTableIsNotSystemFromTableId(db: Db, tableId: string): Promise<void> {
  const rows = await db.getAllAsync<{ is_system: number }>(
    `
    SELECT is_system
    FROM tables
    WHERE id = ?
    LIMIT 1;
    `,
    [tableId]
  );

  if (rows.length && rows[0].is_system === 1) {
    throw new Error("Modification interdite sur table système");
  }
}

async function assertTableIsNotSystemFromProfileId(db: Db, profileId: string): Promise<void> {
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

export async function listProfilesByTableId(
  db: Db,
  tableId: string
): Promise<ProfileRow[]> {
  return db.getAllAsync<ProfileRow>(
    `
    SELECT *
    FROM profiles
    WHERE table_id = ?
    ORDER BY sort_order ASC, created_at ASC;
    `,
    [tableId]
  );
}

export async function getProfileById(
  db: Db,
  id: string
): Promise<ProfileRow | null> {
  const rows = await db.getAllAsync<ProfileRow>(
    `
    SELECT *
    FROM profiles
    WHERE id = ?
    LIMIT 1;
    `,
    [id]
  );

  return rows.length ? rows[0] : null;
}

export async function createProfile(
  db: Db,
  row: {
    id: string;
    table_id: string;
    name: string;
    sort_order?: number;
  }
): Promise<void> {
  await assertTableIsNotSystemFromTableId(db, row.table_id);

  const now = nowIso();

  await db.runAsync(
    `
    INSERT INTO profiles(
      id,
      table_id,
      name,
      sort_order,
      created_at,
      updated_at
    )
    VALUES(?, ?, ?, ?, ?, ?);
    `,
    [
      row.id,
      row.table_id,
      row.name,
      row.sort_order ?? 0,
      now,
      now,
    ]
  );
}

export async function updateProfileName(
  db: Db,
  id: string,
  name: string
): Promise<void> {
  await assertTableIsNotSystemFromProfileId(db, id);

  const now = nowIso();

  await db.runAsync(
    `
    UPDATE profiles
    SET name = ?, updated_at = ?
    WHERE id = ?;
    `,
    [name, now, id]
  );
}

export async function deleteProfile(
  db: Db,
  id: string
): Promise<void> {
  await assertTableIsNotSystemFromProfileId(db, id);

  await db.runAsync(
    `
    DELETE FROM profiles
    WHERE id = ?;
    `,
    [id]
  );
}

export async function updateProfileOrder(
  db: Db,
  id: string,
  sortOrder: number
): Promise<void> {
  await assertTableIsNotSystemFromProfileId(db, id);

  const now = nowIso();

  await db.runAsync(
    `
    UPDATE profiles
    SET sort_order = ?, updated_at = ?
    WHERE id = ?;
    `,
    [sortOrder, now, id]
  );
}