import * as SQLite from "expo-sqlite";

export type Db = SQLite.SQLiteDatabase;

export async function openDb(): Promise<Db> {
  const db = await SQLite.openDatabaseAsync("dice_universal_V1.db");
  await db.execAsync("PRAGMA foreign_keys = ON;");
  return db;
}

// --- Meta helpers (schema/content/flags) ---
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

export async function getSchemaVersion(db: Db): Promise<number> {
  await ensureMetaTable(db);
  const v = await getMeta(db, "schema_version");
  const n = Number(v ?? "0");
  return Number.isFinite(n) ? n : 0;
}

export async function setSchemaVersion(db: Db, version: number): Promise<void> {
  await ensureMetaTable(db);
  await setMeta(db, "schema_version", String(version));
}