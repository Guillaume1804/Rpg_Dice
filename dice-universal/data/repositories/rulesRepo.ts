import type { Db } from "../db/database";
import { newId } from "../../core/types/ids";

export type RuleRow = {
  id: string;
  name: string;
  kind: string;
  params_json: string;
  is_system: number;
  created_at: string;
  updated_at: string;
};

export async function listRules(db: Db): Promise<RuleRow[]> {
  return db.getAllAsync<RuleRow>(
    "SELECT * FROM rules ORDER BY is_system DESC, created_at ASC;"
  );
}

export async function getRuleById(db: Db, id: string): Promise<RuleRow | null> {
  const rows = await db.getAllAsync<RuleRow>(
    "SELECT * FROM rules WHERE id = ? LIMIT 1;",
    [id]
  );
  return rows.length ? rows[0] : null;
}

export async function createRule(
  db: Db,
  params: {
    name: string;
    kind: string;
    params_json: string;
    is_system?: number;
  }
): Promise<string> {
  const createdAt = new Date().toISOString();
  const id = await newId(); // ✅ ici
  const isSystem = params.is_system ?? 0;

  await db.runAsync(
    `INSERT INTO rules(id, name, kind, params_json, is_system, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?, ?);`,
    [id, params.name, params.kind, params.params_json, isSystem, createdAt, createdAt]
  );

  return id;
}

export async function deleteRule(db: Db, id: string): Promise<void> {
  await db.runAsync("DELETE FROM rules WHERE id = ? AND is_system = 0;", [id]);
}