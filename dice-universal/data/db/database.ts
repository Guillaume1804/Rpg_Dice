import * as SQLite from "expo-sqlite";

export type Db = SQLite.SQLiteDatabase;

export async function openDb(): Promise<Db> {
  const db = await SQLite.openDatabaseAsync("dice_universal_V5.db");

  await db.execAsync("PRAGMA foreign_keys = ON;");
  await initSchema(db);

  return db;
}

// --- Meta helpers (flags / content version) ---
export async function ensureMetaTable(db: Db): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

export async function getMeta(db: Db, key: string): Promise<string | null> {
  const rows = await db.getAllAsync<{ value: string }>(
    "SELECT value FROM meta WHERE key = ? LIMIT 1;",
    [key],
  );
  return rows.length ? rows[0].value : null;
}

export async function setMeta(
  db: Db,
  key: string,
  value: string,
): Promise<void> {
  await db.runAsync("INSERT OR REPLACE INTO meta(key, value) VALUES(?, ?);", [
    key,
    value,
  ]);
}

async function ensureColumn(
  db: Db,
  table: string,
  column: string,
): Promise<boolean> {
  const rows = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table});`,
  );
  return rows.some((r) => r.name === column);
}

/**
 * Schéma cible :
 * - tables
 * - profiles
 * - groups
 * - group_dice
 * - rules
 * - roll_events
 */
export async function initSchema(db: Db): Promise<void> {
  await ensureMetaTable(db);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY NOT NULL,
      table_id TEXT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      params_json TEXT NOT NULL DEFAULT '{}',
      is_system INTEGER NOT NULL DEFAULT 0,
      supported_sides_json TEXT NOT NULL DEFAULT '[]',
      scope TEXT NOT NULL DEFAULT 'entry',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY NOT NULL,
      table_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY NOT NULL,
      table_id TEXT NOT NULL,
      profile_id TEXT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      rule_id TEXT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE SET NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS group_dice (
      id TEXT PRIMARY KEY NOT NULL,
      group_id TEXT NOT NULL,
      sides INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      modifier INTEGER NOT NULL DEFAULT 0,
      sign INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      rule_id TEXT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE SET NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS roll_events (
      id TEXT PRIMARY KEY NOT NULL,
      table_id TEXT NULL,
      created_at TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      summary_json TEXT NOT NULL,
      FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
    );
  `);

  // --- Migrations légères (ALTER TABLE) ---

  const hasSign = await ensureColumn(db, "group_dice", "sign");
  if (!hasSign) {
    await db.execAsync(`
      ALTER TABLE group_dice
      ADD COLUMN sign INTEGER NOT NULL DEFAULT 1;
    `);
  }

  const hasGroupRuleId = await ensureColumn(db, "groups", "rule_id");
  if (!hasGroupRuleId) {
    await db.execAsync(`
      ALTER TABLE groups
      ADD COLUMN rule_id TEXT NULL;
    `);
  }

  const hasProfileId = await ensureColumn(db, "groups", "profile_id");
  if (!hasProfileId) {
    await db.execAsync(`
      ALTER TABLE groups
      ADD COLUMN profile_id TEXT NULL;
    `);
  }

  const hasRuleSupportedSides = await ensureColumn(
    db,
    "rules",
    "supported_sides_json",
  );
  if (!hasRuleSupportedSides) {
    await db.execAsync(`
      ALTER TABLE rules
      ADD COLUMN supported_sides_json TEXT NOT NULL DEFAULT '[]';
    `);
  }

  const hasRuleScope = await ensureColumn(db, "rules", "scope");
  if (!hasRuleScope) {
    await db.execAsync(`
      ALTER TABLE rules
      ADD COLUMN scope TEXT NOT NULL DEFAULT 'entry';
    `);
  }

  const hasRuleUsageKind = await ensureColumn(db, "rules", "usage_kind");
  if (!hasRuleUsageKind) {
    await db.execAsync(`
      ALTER TABLE rules
      ADD COLUMN usage_kind TEXT NOT NULL DEFAULT 'user_template';
    `);

    await db.execAsync(`
      UPDATE rules
      SET usage_kind = CASE
        WHEN is_system = 1 THEN 'system_template'
        ELSE 'user_template'
      END
      WHERE usage_kind IS NULL OR usage_kind = '';
    `);
  }

  const hasRuleTableId = await ensureColumn(db, "rules", "table_id");
  if (!hasRuleTableId) {
    await db.execAsync(`
      ALTER TABLE rules
      ADD COLUMN table_id TEXT NULL;
    `);
  }

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_profiles_table
    ON profiles(table_id);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_profiles_sort
    ON profiles(table_id, sort_order);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_groups_table
    ON groups(table_id);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_groups_profile
    ON groups(profile_id);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_groups_rule
    ON groups(rule_id);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_groups_profile_sort
    ON groups(profile_id, sort_order);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_dice_group
    ON group_dice(group_id);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_dice_rule
    ON group_dice(rule_id);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_rolls_table
    ON roll_events(table_id);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_rolls_created
    ON roll_events(created_at);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_rules_kind
    ON rules(kind);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_rules_scope
    ON rules(scope);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_rules_system_kind
    ON rules(is_system, kind);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_rules_usage_kind
    ON rules(usage_kind);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_rules_table
    ON rules(table_id);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_rules_table_kind_scope
    ON rules(table_id, kind, scope);
  `);
}
