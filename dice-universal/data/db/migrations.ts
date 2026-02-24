import { Db, getUserVersion, setUserVersion } from "./database";

async function migrateToV1(db : Db) {
    // Table meta (pour les flags seed, content version, etc...)
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS meta (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL
        );
    `);

    // Profil = "table de jeu" / configuration global
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            ruleset_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    `);

    // Un ruleset = un mode + paramétres JSON (évolutif)
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

    // Groupes = ensemble de dés dans un profil
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

    // Dice entries pour un groupe (1d20, 4d10, etc...)
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS group_dice (
            id TEXT PRIMARY KEY NOT NULL,
            group_id TEXT NOT NULL,
            qty INTEGER NOT NULL,
            modifier INTEGER NOT NULL DEFAULT 0,
            sort_oorder INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
        );
    `);

    // Historique de jets 
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS roll_events (
            id TEXT PRIMARY KEY NOT NULL,
            profile_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            summary_json TEXT NOT NULL,
            FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
        )     ;
    `);

    // Index Utiles (performance historique / listing)
    await db.execAsync(`
       CREATE INDEX IF NOT EXISTS idx_groups_profile ON groups(profile_id);
       CREATE INDEX IF NOT EXISTS idx_rolls_profile ON roll_events(profile_id);
       CREATE INDEX IF NOT EXISTS idx_rolls_crated ON roll_events(created_at);
    `);
}

export async function runMigrations(db: Db): Promise<void> {
    const version = await getUserVersion(db);

    if (version < 1) {
        await migrateToV1(db);
        await setUserVersion(db, 1);
    }

    // Plus tards : 
    // if (version < 2) {migrateToV2....; setUserVersion(db, 2); }
}