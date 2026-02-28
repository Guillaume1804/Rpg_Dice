import * as SQLite from "expo-sqlite";

export type Db = SQLite.SQLiteDatabase;

export async function openDb(): Promise<Db> {
  // ✅ Nouveau fichier = reset total
  const db = await SQLite.openDatabaseAsync("dice_universal_V2_reset1.db");

  // ⚠️ FK ON doit être fait à chaque ouverture
  await db.execAsync("PRAGMA foreign_keys = ON;");

  // ✅ Crée le schéma complet si nécessaire
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
    [key]
  );
  return rows.length ? rows[0].value : null;
}

export async function setMeta(db: Db, key: string, value: string): Promise<void> {
  await db.runAsync(
    "INSERT OR REPLACE INTO meta(key, value) VALUES(?, ?);",
    [key, value]
  );
}

/**
 * ✅ Nouveau schéma “rules par dé/groupe”
 * - tables -> groups -> group_dice (avec rule_mode / rule_params_json)
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
    CREATE TABLE IF NOT EXISTS groups (
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
    CREATE TABLE IF NOT EXISTS group_dice (
      id TEXT PRIMARY KEY NOT NULL,
      group_id TEXT NOT NULL,
      sides INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      modifier INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,

      -- ✅ règles AU NIVEAU DU DÉ (ou entrée de dé)
      rule_mode TEXT NOT NULL DEFAULT 'sum',
      rule_params_json TEXT NOT NULL DEFAULT '{}',

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS roll_events (
      id TEXT PRIMARY KEY NOT NULL,

      -- ✅ soit lié à une table, soit NULL pour un jet instantané pur
      table_id TEXT NULL,

      created_at TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      summary_json TEXT NOT NULL,

      FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_groups_table ON groups(table_id);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_dice_group ON group_dice(group_id);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_rolls_table ON roll_events(table_id);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_rolls_created ON roll_events(created_at);`);
}