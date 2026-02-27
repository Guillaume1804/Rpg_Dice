import type { Db } from "../db/database";

export type RollEventRow = {
  id: string;
  profile_id: string;
  created_at: string;
  payload_json: string;
  summary_json: string;
};

export async function insertRollEvent(db: Db, row: RollEventRow): Promise<void> {
  await db.runAsync(
    `INSERT INTO roll_events(id, profile_id, created_at, payload_json, summary_json)
     VALUES(?, ?, ?, ?, ?);`,
    [row.id, row.profile_id, row.created_at, row.payload_json, row.summary_json]
  );
}

export async function listRecentRollEvents(db: Db, limit = 50): Promise<RollEventRow[]> {
  return db.getAllAsync<RollEventRow>(
    `SELECT * FROM roll_events ORDER BY created_at DESC LIMIT ?;`,
    [limit]
  );
}

export async function deleteAllRollEvents(db: Db): Promise<void> {
  await db.execAsync("DELETE FROM roll_events;");
}