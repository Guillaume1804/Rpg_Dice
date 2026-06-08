import { openDb } from "./database";
import { runSeedIfNeeded } from "./seed";
import type { Db } from "./database";
import { registerBuiltins } from "../../core/rules/builtins"; // ✅ AJOUTE CET IMPORT

let initPromise: Promise<Db> | null = null;

async function ensureGroupDiceLabelColumn(db: Db): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(group_dice);`,
  );

  const hasLabelColumn = columns.some((column) => column.name === "label");

  if (hasLabelColumn) {
    return;
  }

  await db.runAsync(`ALTER TABLE group_dice ADD COLUMN label TEXT;`);
}

export function initDb(): Promise<Db> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await openDb();
      await runSeedIfNeeded(db);
      await ensureGroupDiceLabelColumn(db);

      registerBuiltins();

      return db;
    })();
  }
  return initPromise;
}
