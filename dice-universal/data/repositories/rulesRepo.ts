import type { Db } from "../db/database";
import { newId } from "../../core/types/ids";

export type RuleScope = "entry" | "group" | "both";
export type RuleUsageKind = "system_template" | "user_template" | "generated";

export type RuleRow = {
  id: string;
  table_id: string | null;
  name: string;
  kind: string;
  params_json: string;
  is_system: number;
  supported_sides_json: string;
  scope: RuleScope;
  created_at: string;
  updated_at: string;
};

function nowIso() {
  return new Date().toISOString();
}

export function parseSupportedSides(
  rule: Pick<RuleRow, "supported_sides_json">,
): number[] {
  try {
    const parsed = JSON.parse(rule.supported_sides_json || "[]");
    return Array.isArray(parsed)
      ? parsed.map(Number).filter((n) => Number.isFinite(n))
      : [];
  } catch {
    return [];
  }
}

async function assertRuleIsNotSystem(db: Db, id: string): Promise<void> {
  const rows = await db.getAllAsync<{ is_system: number }>(
    `
    SELECT is_system
    FROM rules
    WHERE id = ?
    LIMIT 1;
    `,
    [id],
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
    `,
  );
}

export async function listRulesByTableId(
  db: Db,
  tableId: string,
): Promise<RuleRow[]> {
  return db.getAllAsync<RuleRow>(
    `
    SELECT *
    FROM rules
    WHERE table_id = ?
    ORDER BY is_system DESC, created_at ASC;
    `,
    [tableId],
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
    [id],
  );

  return rows.length ? rows[0] : null;
}

export async function findCanonicalLocalRule(
  db: Db,
  params: {
    tableId: string;
    kind: string;
    scope: RuleScope;
    supported_sides_json: string;
  },
): Promise<RuleRow | null> {
  const rows = await db.getAllAsync<RuleRow>(
    `
    SELECT *
    FROM rules
    WHERE table_id = ?
      AND kind = ?
      AND scope = ?
      AND supported_sides_json = ?
    LIMIT 1;
    `,
    [params.tableId, params.kind, params.scope, params.supported_sides_json],
  );

  return rows.length ? rows[0] : null;
}

export async function createRule(
  db: Db,
  params: {
    table_id?: string | null;
    name: string;
    kind: string;
    params_json: string;
    is_system?: number;
    supported_sides_json?: string;
    scope?: RuleScope;
  },
): Promise<string> {
  const createdAt = nowIso();
  const id = await newId();
  const isSystem = params.is_system ?? 0;

  await db.runAsync(
    `
    INSERT INTO rules(
      id,
      table_id,
      name,
      kind,
      params_json,
      is_system,
      supported_sides_json,
      scope,
      created_at,
      updated_at
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      id,
      params.table_id ?? null,
      params.name,
      params.kind,
      params.params_json,
      isSystem,
      params.supported_sides_json ?? "[]",
      params.scope ?? "entry",
      createdAt,
      createdAt,
    ],
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
    [id],
  );
}

export async function updateRule(
  db: Db,
  id: string,
  params: {
    name: string;
    kind: string;
    params_json: string;
    supported_sides_json: string;
    scope: RuleScope;
    usage_kind: RuleUsageKind;
  },
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
      supported_sides_json = ?,
      scope = ?,
      usage_kind = ?,
      updated_at = ?
    WHERE id = ?;
    `,
    [
      params.name,
      params.kind,
      params.params_json,
      params.supported_sides_json,
      params.scope,
      params.usage_kind,
      now,
      id,
    ],
  );
}

export function isLocalRule(rule: Pick<RuleRow, "table_id">): boolean {
  return rule.table_id != null;
}
