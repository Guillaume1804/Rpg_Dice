import type { Db } from "../db/database";

export type RollEventRow = {
  id: string;
  table_id: string | null;
  created_at: string;
  payload_json: string;
  summary_json: string;
};

export async function insertRollEvent(db: Db, row: RollEventRow): Promise<void> {
  await db.runAsync(
    `INSERT INTO roll_events(id, table_id, created_at, payload_json, summary_json)
     VALUES(?, ?, ?, ?, ?);`,
    [row.id, row.table_id, row.created_at, row.payload_json, row.summary_json]
  );
}

export async function listRecentRollEvents(db: Db, limit = 50): Promise<RollEventRow[]> {
  return db.getAllAsync<RollEventRow>(
    `SELECT * FROM roll_events ORDER BY created_at DESC LIMIT ?;`,
    [limit]
  );
}

export async function listRecentRollEventsByTable(db: Db, tableId: string, limit = 50): Promise<RollEventRow[]> {
  return db.getAllAsync<RollEventRow>(
    `SELECT * FROM roll_events WHERE table_id = ? ORDER BY created_at DESC LIMIT ?;`,
    [tableId, limit]
  );
}

export async function deleteAllRollEvents(db: Db): Promise<void> {
  await db.execAsync("DELETE FROM roll_events;");
}