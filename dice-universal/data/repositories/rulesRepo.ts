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

function nowIso() {
  return new Date().toISOString();
}

async function assertRuleIsNotSystem(db: Db, id: string): Promise<void> {
  const rows = await db.getAllAsync<{ is_system: number }>(
    `
    SELECT is_system
    FROM rules
    WHERE id = ?
    LIMIT 1;
    `,
    [id]
  );

  if (rows.length && rows[0].is_system === 1) {
    throw new Error("Modification interdite sur règle système");
  }
}

export async function listRules(db: Db): Promise<RuleRow[]> {
  return db.getAllAsync<RuleRow>(
    `
    SELECT *
    FROM rules
    ORDER BY is_system DESC, created_at ASC;
    `
  );
}

export async function getRuleById(db: Db, id: string): Promise<RuleRow | null> {
  const rows = await db.getAllAsync<RuleRow>(
    `
    SELECT *
    FROM rules
    WHERE id = ?
    LIMIT 1;
    `,
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
  const createdAt = nowIso();
  const id = await newId();
  const isSystem = params.is_system ?? 0;

  await db.runAsync(
    `
    INSERT INTO rules(
      id,
      name,
      kind,
      params_json,
      is_system,
      created_at,
      updated_at
    )
    VALUES(?, ?, ?, ?, ?, ?, ?);
    `,
    [
      id,
      params.name,
      params.kind,
      params.params_json,
      isSystem,
      createdAt,
      createdAt,
    ]
  );

  return id;
}

export async function deleteRule(db: Db, id: string): Promise<void> {
  await assertRuleIsNotSystem(db, id);

  await db.runAsync(
    `
    DELETE FROM rules
    WHERE id = ?;
    `,
    [id]
  );
}

export async function updateRule(
  db: Db,
  id: string,
  params: {
    name: string;
    kind: string;
    params_json: string;
  }
): Promise<void> {
  await assertRuleIsNotSystem(db, id);

  const now = nowIso();

  await db.runAsync(
    `
    UPDATE rules
    SET
      name = ?,
      kind = ?,
      params_json = ?,
      updated_at = ?
    WHERE id = ?;
    `,
    [
      params.name,
      params.kind,
      params.params_json,
      now,
      id,
    ]
  );
}