import { Db, ensureMetaTable, getMeta, setMeta } from "./database";
import { newId } from "../../core/types/ids";

function nowIso() {
  return new Date().toISOString();
}

async function findTableIdByName(db: Db, name: string): Promise<string | null> {
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM tables WHERE name = ? LIMIT 1;`,
    [name]
  );
  return rows.length ? rows[0].id : null;
}

async function findGroupId(db: Db, tableId: string, name: string): Promise<string | null> {
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM groups WHERE table_id = ? AND name = ? LIMIT 1;`,
    [tableId, name]
  );
  return rows.length ? rows[0].id : null;
}

export async function runSeedIfNeeded(db: Db): Promise<void> {
  await ensureMetaTable(db);

  const done = await getMeta(db, "seed_done");
  if (done === "true") return;

  const createdAt = nowIso();

  // --- TABLES SYSTÈME ---
  const tableD20Name = "Table par défaut (D20)";
  const tablePoolName = "Exemple Pool D6";

  let tableD20Id = await findTableIdByName(db, tableD20Name);
  if (!tableD20Id) {
    tableD20Id = await newId();
    await db.runAsync(
      `INSERT INTO tables(id, name, is_system, created_at, updated_at)
       VALUES(?, ?, ?, ?, ?);`,
      [tableD20Id, tableD20Name, 1, createdAt, createdAt]
    );
  }

  let tablePoolId = await findTableIdByName(db, tablePoolName);
  if (!tablePoolId) {
    tablePoolId = await newId();
    await db.runAsync(
      `INSERT INTO tables(id, name, is_system, created_at, updated_at)
       VALUES(?, ?, ?, ?, ?);`,
      [tablePoolId, tablePoolName, 1, createdAt, createdAt]
    );
  }

  // --- GROUPES + DÉS ---
  // D20
  const g1Name = "Jet D20";
  let g1 = await findGroupId(db, tableD20Id, g1Name);
  if (!g1) {
    g1 = await newId();
    await db.runAsync(
      `INSERT INTO groups(id, table_id, name, sort_order, created_at, updated_at)
       VALUES(?, ?, ?, ?, ?, ?);`,
      [g1, tableD20Id, g1Name, 0, createdAt, createdAt]
    );

    const dieId = await newId();
    await db.runAsync(
      `INSERT INTO group_dice(
        id, group_id, sides, qty, modifier, sort_order, rule_mode, rule_params_json, created_at, updated_at
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        dieId,
        g1,
        20,
        1,
        0,
        0,
        "d20",
        JSON.stringify({ critSuccess: 20, critFailure: 1, successThreshold: null }),
        createdAt,
        createdAt,
      ]
    );
  }

  // Pool D6
  const g2Name = "Pool D6 (6 dés)";
  let g2 = await findGroupId(db, tablePoolId, g2Name);
  if (!g2) {
    g2 = await newId();
    await db.runAsync(
      `INSERT INTO groups(id, table_id, name, sort_order, created_at, updated_at)
       VALUES(?, ?, ?, ?, ?, ?);`,
      [g2, tablePoolId, g2Name, 0, createdAt, createdAt]
    );

    const dieId = await newId();
    await db.runAsync(
      `INSERT INTO group_dice(
        id, group_id, sides, qty, modifier, sort_order, rule_mode, rule_params_json, created_at, updated_at
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        dieId,
        g2,
        6,
        6,
        0,
        0,
        "pool",
        JSON.stringify({ successAtOrAbove: 4, critFailureFace: 1, glitchRule: "ones_gt_successes" }),
        createdAt,
        createdAt,
      ]
    );
  }

  await setMeta(db, "seed_done", "true");
  await setMeta(db, "content_version", "2");
}