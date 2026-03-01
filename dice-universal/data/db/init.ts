import { openDb } from "./database";
import { runSeedIfNeeded } from "./seed";
import type { Db } from "./database";
import { registerBuiltins } from "../../core/rules/builtins"; // ✅ AJOUTE CET IMPORT

let initPromise: Promise<Db> | null = null;

export function initDb(): Promise<Db> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await openDb();
      await runSeedIfNeeded(db);

      registerBuiltins(); // ✅ AJOUTE CETTE LIGNE ICI

      return db;
    })();
  }
  return initPromise;
}