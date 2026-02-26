import type { Db } from "../db/database";

export type RulesetRow = {
  id: string;
  name: string;
  mode: string;
  params_json: string;
  created_at: string;
  updated_at: string;
};

export async function getRulesetById(db: Db, id: string): Promise<RulesetRow | null> {
  const rows = await db.getAllAsync<RulesetRow>(
    "SELECT * FROM rulesets WHERE id = ? LIMIT 1;",
    [id]
  );
  return rows.length ? rows[0] : null;
}