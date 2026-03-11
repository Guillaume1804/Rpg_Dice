import type { Db } from "../db/database";

export type TableRow = {
  id: string;
  name: string;
  is_system: number; // 0 ou 1
  created_at: string;
  updated_at: string;
};

export type TableStats = {
  profile_count: number;
  group_count: number;
  die_count: number;
};

export async function listTables(db: Db): Promise<TableRow[]> {
  return db.getAllAsync<TableRow>(
    "SELECT * FROM tables ORDER BY created_at ASC;"
  );
}

export async function getTableById(db: Db, id: string): Promise<TableRow | null> {
  const rows = await db.getAllAsync<TableRow>(
    "SELECT * FROM tables WHERE id = ? LIMIT 1;",
    [id]
  );
  return rows.length ? rows[0] : null;
}

export async function updateTableName(db: Db, id: string, name: string): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    "UPDATE tables SET name = ?, updated_at = ? WHERE id = ?;",
    [name, now, id]
  );
}

export async function deleteTable(db: Db, id: string): Promise<void> {
  const rows = await db.getAllAsync<{ is_system: number }>(
    "SELECT is_system FROM tables WHERE id = ? LIMIT 1;",
    [id]
  );

  if (rows.length && rows[0].is_system === 1) {
    throw new Error("Impossible de supprimer une table système");
  }

  await db.runAsync("DELETE FROM tables WHERE id = ?;", [id]);
}

export async function getTableStats(db: Db, tableId: string): Promise<TableStats> {
  const profileRows = await db.getAllAsync<{ count: number }>(
    `
    SELECT COUNT(*) as count
    FROM profiles
    WHERE table_id = ?;
    `,
    [tableId]
  );

  const groupRows = await db.getAllAsync<{ count: number }>(
    `
    SELECT COUNT(*) as count
    FROM groups g
    JOIN profiles p ON p.id = g.profile_id
    WHERE p.table_id = ?;
    `,
    [tableId]
  );

  const dieRows = await db.getAllAsync<{ count: number }>(
    `
    SELECT COUNT(*) as count
    FROM group_dice gd
    JOIN groups g ON g.id = gd.group_id
    JOIN profiles p ON p.id = g.profile_id
    WHERE p.table_id = ?;
    `,
    [tableId]
  );

  return {
    profile_count: profileRows[0]?.count ?? 0,
    group_count: groupRows[0]?.count ?? 0,
    die_count: dieRows[0]?.count ?? 0,
  };
}