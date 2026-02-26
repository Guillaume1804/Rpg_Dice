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