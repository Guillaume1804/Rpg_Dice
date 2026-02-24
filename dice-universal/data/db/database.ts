import * as SQlite from "expo-sqlite";

export type Db = SQlite.SQLiteDatabase;

export async function openDb(): Promise<Db> {
    // "dice_universal.db" sera créé localement sur l'appareil si absent
    const db = await SQlite.openDatabaseAsync("dice_universal.db");
    
    // Active les clés étrangères si on les utilise plus tards
    await db.execAsync("PRAGMA foreign_keys = ON;");
    return db;
};

export async function getUserVersion(db: Db): Promise<number> {
    const rows = await db.getAllAsync<{ user_version: number }>("PRAGMA user_version;");
    return rows?.[0]?.user_version ?? 0;
};

export async function setUserVersion(db :Db, version: number): Promise<void> {
    await db.execAsync(`PRAGMA user_version = ${version};`);
};