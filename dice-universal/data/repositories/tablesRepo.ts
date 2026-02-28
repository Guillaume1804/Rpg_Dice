import type { Db } from "../db/database";

export type TableRow = {
  id: string;
  name: string;
  is_system: number; // 0 ou 1
  created_at: string;
  updated_at: string;
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