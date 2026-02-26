// data/db/seed.ts
import { Db } from "./database";
import { newId } from "../../core/types/ids";
import { getMeta, setMeta, ensureMetaTable } from "./database";

function nowIso() {
  return new Date().toISOString();
}

async function findIdByName(db: Db, table: "rulesets" | "profiles", name: string): Promise<string | null> {
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM ${table} WHERE name = ? LIMIT 1;`,
    [name]
  );
  return rows.length ? rows[0].id : null;
}

async function findGroupId(db: Db, profileId: string, name: string): Promise<string | null> {
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM groups WHERE profile_id = ? AND name = ? LIMIT 1;`,
    [profileId, name]
  );
  return rows.length ? rows[0].id : null;
}

export async function runSeedIfNeeded(db: Db): Promise<void> {
  // S'assure que la table meta existe avant toute lecture/écriture
  await ensureMetaTable(db);

  const done = await getMeta(db, "seed_done");
  if (done === "true") return;

  const createdAt = nowIso();

  // ---- Rulesets templates ----
const d20Name = "D20 (crit 1/20)";
const poolName = "Pool D6 (seuil 4+, glitch)";

let rulesetD20Id = await findIdByName(db, "rulesets", d20Name);
if (!rulesetD20Id) {
  rulesetD20Id = await newId();
  await db.runAsync(
    `INSERT INTO rulesets(id, name, mode, params_json, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?);`,
    [
      rulesetD20Id,
      d20Name,
      "d20",
      JSON.stringify({ critSuccess: 20, critFailure: 1, successThreshold: null }),
      createdAt,
      createdAt,
    ]
  );
}

let rulesetPoolId = await findIdByName(db, "rulesets", poolName);
if (!rulesetPoolId) {
  rulesetPoolId = await newId();
  await db.runAsync(
    `INSERT INTO rulesets(id, name, mode, params_json, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?);`,
    [
      rulesetPoolId,
      poolName,
      "pool",
      JSON.stringify({ sides: 6, successAtOrAbove: 4, critFailureFace: 1, glitchRule: "ones_gt_successes" }),
      createdAt,
      createdAt,
    ]
  );
}

  // ---- Profiles templates ----
const profileD20Name = "Table par défaut (D20)";
let profileD20Id = await findIdByName(db, "profiles", profileD20Name);
if (!profileD20Id) {
  profileD20Id = await newId();
  await db.runAsync(
    `INSERT INTO profiles(id, name, ruleset_id, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?);`,
    [profileD20Id, profileD20Name, rulesetD20Id, createdAt, createdAt]
  );
}

const profilePoolName = "Exemple Pool D6";
let profilePoolId = await findIdByName(db, "profiles", profilePoolName);
if (!profilePoolId) {
  profilePoolId = await newId();
  await db.runAsync(
    `INSERT INTO profiles(id, name, ruleset_id, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?);`,
    [profilePoolId, profilePoolName, rulesetPoolId, createdAt, createdAt]
  );
}

  // ---- Default groups for D20 profile ----
const g1Name = "Jet D20";
let g1 = await findGroupId(db, profileD20Id, g1Name);
if (!g1) {
  g1 = await newId();
  await db.runAsync(
    `INSERT INTO groups(id, profile_id, name, sort_order, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?);`,
    [g1, profileD20Id, g1Name, 0, createdAt, createdAt]
  );

  const gd1 = await newId();
  await db.runAsync(
    `INSERT INTO group_dice(id, group_id, sides, qty, modifier, sort_order, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?);`,
    [gd1, g1, 20, 1, 0, 0, createdAt, createdAt]
  );
}

// ---- Default groups for Pool profile ----
const g2Name = "Pool D6 (6 dés)";
let g2 = await findGroupId(db, profilePoolId, g2Name);
if (!g2) {
  g2 = await newId();
  await db.runAsync(
    `INSERT INTO groups(id, profile_id, name, sort_order, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?);`,
    [g2, profilePoolId, g2Name, 0, createdAt, createdAt]
  );

  const gd2 = await newId();
  await db.runAsync(
    `INSERT INTO group_dice(id, group_id, sides, qty, modifier, sort_order, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?);`,
    [gd2, g2, 6, 6, 0, 0, createdAt, createdAt]
  );
}

  // Marque le seed comme fait
  await setMeta(db, "seed_done", "true");
  await setMeta(db, "content_version", "1");
}