import { openDb } from "./database";
import { runSeedIfNeeded } from "./seed";
import type { Db } from "./database";

let initPromise: Promise<Db> | null = null;

export function initDb(): Promise<Db> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await openDb();
      // ✅ openDb() appelle déjà initSchema(db)
      await runSeedIfNeeded(db);
      return db;
    })();
  }
  return initPromise;
}