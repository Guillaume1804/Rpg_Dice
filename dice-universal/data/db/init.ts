import { openDb } from "./database";
import { runMigrations } from "./migrations";
import { runSeedIfNeeded } from "./seed";
import type { Db } from "./database";

let initPromise: Promise<Db> | null = null;

export function initDb(): Promise<Db> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await openDb();
      await runMigrations(db);
      await runSeedIfNeeded(db);
      return db;
    })();
  }
  return initPromise;
}