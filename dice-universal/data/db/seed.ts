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

async function findRuleIdByName(db: Db, name: string): Promise<string | null> {
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM rules WHERE name = ? LIMIT 1;`,
    [name]
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
  const ruleSumName = "Somme (par défaut)";
  const ruleD20Name = "D20 (crit 1/20)";
  const rulePoolName = "Pool D6 (4+ succès, glitch)";
  
  let ruleSumId = await findRuleIdByName(db, ruleSumName);
  if (!ruleSumId) {
    ruleSumId = await newId();
    await db.runAsync(
      `INSERT INTO rules(id, name, kind, params_json, is_system, created_at, updated_at)
       VALUES(?, ?, ?, ?, ?, ?, ?);`,
      [ruleSumId, ruleSumName, "sum", "{}", 1, createdAt, createdAt]
    );
  }
  
  let ruleD20Id = await findRuleIdByName(db, ruleD20Name);
  if (!ruleD20Id) {
    ruleD20Id = await newId();
    await db.runAsync(
      `INSERT INTO rules(id, name, kind, params_json, is_system, created_at, updated_at)
       VALUES(?, ?, ?, ?, ?, ?, ?);`,
      [
        ruleD20Id,
        ruleD20Name,
        "d20",
        JSON.stringify({ critSuccess: 20, critFailure: 1, successThreshold: null }),
        1,
        createdAt,
        createdAt,
      ]
    );
  }
  
  let rulePoolId = await findRuleIdByName(db, rulePoolName);
  if (!rulePoolId) {
    rulePoolId = await newId();
    await db.runAsync(
      `INSERT INTO rules(id, name, kind, params_json, is_system, created_at, updated_at)
       VALUES(?, ?, ?, ?, ?, ?, ?);`,
      [
        rulePoolId,
        rulePoolName,
        "pool",
        JSON.stringify({ successAtOrAbove: 4, critFailureFace: 1, glitchRule: "ones_gt_successes" }),
        1,
        createdAt,
        createdAt,
      ]
    );
  }

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
        id, group_id, sides, qty, modifier, sign, sort_order, rule_id, created_at, updated_at
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [dieId, g1, 20, 1, 0, 1, 0, ruleD20Id, createdAt, createdAt]
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
        id, group_id, sides, qty, modifier, sign, sort_order, rule_id, created_at, updated_at
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [dieId, g2, 6, 6, 0, 1, 0, rulePoolId, createdAt, createdAt]
    );
  }

  await setMeta(db, "seed_done", "true");
  await setMeta(db, "content_version", "3");
}