import type { Db } from "../db/database";

export type ProfileRow = {
  id: string;
  name: string;
  ruleset_id: string;
  created_at: string;
  updated_at: string;
};

export async function listProfiles(db: Db): Promise<ProfileRow[]> {
  return db.getAllAsync<ProfileRow>(
    "SELECT * FROM profiles ORDER BY created_at ASC;"
  );
}

export async function getProfileById(db: Db, id: string): Promise<ProfileRow | null> {
  const rows = await db.getAllAsync<ProfileRow>(
    "SELECT * FROM profiles WHERE id = ? LIMIT 1;",
    [id]
  );
  return rows.length ? rows[0] : null;
}