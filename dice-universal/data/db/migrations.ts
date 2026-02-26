import { Db, getSchemaVersion, setSchemaVersion, ensureMetaTable } from "./database";

async function migrateToV1(db: Db) {
  await ensureMetaTable(db);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS rulesets (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      mode TEXT NOT NULL,
      params_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      ruleset_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
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
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
  );
`);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS roll_events (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      summary_json TEXT NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_groups_profile ON groups(profile_id);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_rolls_profile ON roll_events(profile_id);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_rolls_created ON roll_events(created_at);`);
}




async function migrateToV2_fixGroupDice(db: Db) {
  // Lit les colonnes existantes
  const cols = await db.getAllAsync<{ name: string }>("PRAGMA table_info(group_dice);");
  const colNames = new Set(cols.map((c) => c.name));

  // Si la table n'existe pas du tout, on ne fait rien ici (V1 l'a créée)
  if (cols.length === 0) return;

  // Ajoute les colonnes manquantes (SQLite: ALTER TABLE ADD COLUMN)
  // ⚠️ On met des DEFAULT pour pouvoir ajouter des colonnes NOT NULL sans casser.
  if (!colNames.has("sides")) {
    await db.execAsync(`ALTER TABLE group_dice ADD COLUMN sides INTEGER NOT NULL DEFAULT 6;`);
  }
  if (!colNames.has("qty")) {
    await db.execAsync(`ALTER TABLE group_dice ADD COLUMN qty INTEGER NOT NULL DEFAULT 1;`);
  }
  if (!colNames.has("modifier")) {
    await db.execAsync(`ALTER TABLE group_dice ADD COLUMN modifier INTEGER NOT NULL DEFAULT 0;`);
  }
  if (!colNames.has("sort_order")) {
    await db.execAsync(`ALTER TABLE group_dice ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;`);
  }
  if (!colNames.has("created_at")) {
    await db.execAsync(`ALTER TABLE group_dice ADD COLUMN created_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z';`);
  }
  if (!colNames.has("updated_at")) {
    await db.execAsync(`ALTER TABLE group_dice ADD COLUMN updated_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z';`);
  }
}



export async function runMigrations(db: Db): Promise<void> {
  const version = await getSchemaVersion(db);

  if (version < 1) {
    await migrateToV1(db);
    await setSchemaVersion(db, 1);
  }

  // V2 : réparation des anciennes DB
  const vAfter = await getSchemaVersion(db);
  if (vAfter < 2) {
    await migrateToV2_fixGroupDice(db);
    await setSchemaVersion(db, 2);
  }
}

