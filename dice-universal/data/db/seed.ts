import { Db, ensureMetaTable, getMeta, setMeta } from "./database";
import { newId } from "../../core/types/ids";
import type { RuleScope, RuleUsageKind } from "../repositories/rulesRepo";

function nowIso() {
  return new Date().toISOString();
}

async function findTableIdByName(db: Db, name: string): Promise<string | null> {
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM tables WHERE name = ? LIMIT 1;`,
    [name],
  );
  return rows.length ? rows[0].id : null;
}

async function findProfileId(
  db: Db,
  tableId: string,
  name: string,
): Promise<string | null> {
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM profiles WHERE table_id = ? AND name = ? LIMIT 1;`,
    [tableId, name],
  );
  return rows.length ? rows[0].id : null;
}

async function findGroupId(
  db: Db,
  profileId: string,
  name: string,
): Promise<string | null> {
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM groups WHERE profile_id = ? AND name = ? LIMIT 1;`,
    [profileId, name],
  );
  return rows.length ? rows[0].id : null;
}

async function findRuleIdByName(db: Db, name: string): Promise<string | null> {
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM rules WHERE name = ? LIMIT 1;`,
    [name],
  );
  return rows.length ? rows[0].id : null;
}

async function ensureRule(
  db: Db,
  params: {
    name: string;
    kind: string;
    paramsJson: string;
    isSystem?: number;
    supportedSidesJson?: string;
    scope?: RuleScope;
    usageKind?: RuleUsageKind;
  },
): Promise<string> {
  const createdAt = nowIso();

  const existing = await findRuleIdByName(db, params.name);
  if (existing) return existing;

  const id = await newId();
  await db.runAsync(
    `INSERT INTO rules(
      id,
      name,
      kind,
      params_json,
      is_system,
      supported_sides_json,
      scope,
      usage_kind,
      created_at,
      updated_at
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      params.name,
      params.kind,
      params.paramsJson,
      params.isSystem ?? 1,
      params.supportedSidesJson ?? "[]",
      params.scope ?? "entry",
      params.usageKind ?? "system_template",
      createdAt,
      createdAt,
    ],
  );

  return id;
}

async function ensureTable(
  db: Db,
  name: string,
  isSystem = 1,
): Promise<string> {
  const createdAt = nowIso();

  const existing = await findTableIdByName(db, name);
  if (existing) return existing;

  const id = await newId();
  await db.runAsync(
    `INSERT INTO tables(id, name, is_system, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?);`,
    [id, name, isSystem, createdAt, createdAt],
  );

  return id;
}

async function ensureProfile(
  db: Db,
  tableId: string,
  name: string,
  sortOrder = 0,
): Promise<string> {
  const createdAt = nowIso();

  const existing = await findProfileId(db, tableId, name);
  if (existing) return existing;

  const id = await newId();
  await db.runAsync(
    `INSERT INTO profiles(id, table_id, name, sort_order, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?);`,
    [id, tableId, name, sortOrder, createdAt, createdAt],
  );

  return id;
}

async function ensureGroup(
  db: Db,
  params: {
    tableId: string;
    profileId: string;
    name: string;
    sortOrder?: number;
    ruleId?: string | null;
  },
): Promise<string> {
  const createdAt = nowIso();

  const existing = await findGroupId(db, params.profileId, params.name);
  if (existing) return existing;

  const id = await newId();
  await db.runAsync(
    `INSERT INTO groups(
      id,
      table_id,
      profile_id,
      name,
      sort_order,
      rule_id,
      created_at,
      updated_at
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      params.tableId,
      params.profileId,
      params.name,
      params.sortOrder ?? 0,
      params.ruleId ?? null,
      createdAt,
      createdAt,
    ],
  );

  return id;
}

async function ensureGroupDie(
  db: Db,
  params: {
    groupId: string;
    sides: number;
    qty: number;
    modifier?: number;
    sign?: number;
    sortOrder?: number;
    ruleId?: string | null;
  },
): Promise<void> {
  const createdAt = nowIso();

  const existing = await db.getAllAsync<{ id: string }>(
    `SELECT id
     FROM group_dice
     WHERE group_id = ?
       AND sides = ?
       AND qty = ?
       AND modifier = ?
       AND sign = ?
       AND sort_order = ?
     LIMIT 1;`,
    [
      params.groupId,
      params.sides,
      params.qty,
      params.modifier ?? 0,
      params.sign ?? 1,
      params.sortOrder ?? 0,
    ],
  );

  if (existing.length) return;

  const id = await newId();
  await db.runAsync(
    `INSERT INTO group_dice(
      id,
      group_id,
      sides,
      qty,
      modifier,
      sign,
      sort_order,
      rule_id,
      created_at,
      updated_at
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      params.groupId,
      params.sides,
      params.qty,
      params.modifier ?? 0,
      params.sign ?? 1,
      params.sortOrder ?? 0,
      params.ruleId ?? null,
      createdAt,
      createdAt,
    ],
  );
}

export async function runSeedIfNeeded(db: Db): Promise<void> {
  await ensureMetaTable(db);

  const done = await getMeta(db, "seed_done");
  if (done === "true") return;

  const ruleSumId = await ensureRule(db, {
    name: "Somme (par défaut)",
    kind: "sum",
    paramsJson: "{}",
    isSystem: 1,
    supportedSidesJson: JSON.stringify([]),
    scope: "both",
    usageKind: "system_template",
  });

  const ruleSingleCheckCritId = await ensureRule(db, {
    name: "Test critique naturel",
    kind: "single_check",
    paramsJson: JSON.stringify({
      compare: "gte",
      success_threshold: null,
      crit_success_faces: [20],
      crit_failure_faces: [1],
    }),
    isSystem: 1,
    supportedSidesJson: JSON.stringify([20]),
    scope: "entry",
    usageKind: "system_template",
  });

  const ruleSingleCheckThresholdHighId = await ensureRule(db, {
    name: "Test à seuil haut (10+)",
    kind: "single_check",
    paramsJson: JSON.stringify({
      compare: "gte",
      success_threshold: 10,
      crit_success_faces: [20],
      crit_failure_faces: [1],
    }),
    isSystem: 1,
    supportedSidesJson: JSON.stringify([20]),
    scope: "entry",
    usageKind: "system_template",
  });

  const ruleSuccessPoolD6Id = await ensureRule(db, {
    name: "Pool de succès D6",
    kind: "success_pool",
    paramsJson: JSON.stringify({
      success_at_or_above: 5,
      fail_faces: [1],
      glitch_rule: "ones_gt_successes",
    }),
    isSystem: 1,
    supportedSidesJson: JSON.stringify([6]),
    scope: "group",
    usageKind: "system_template",
  });

  const ruleHighestOfPoolD6Id = await ensureRule(db, {
    name: "Meilleur dé D6",
    kind: "highest_of_pool",
    paramsJson: JSON.stringify({
      compare: "gte",
      success_threshold: 5,
      crit_success_faces: [6],
      crit_failure_faces: [1],
    }),
    isSystem: 1,
    supportedSidesJson: JSON.stringify([6]),
    scope: "entry",
    usageKind: "system_template",
  });

  const ruleBandedSum2d6Id = await ensureRule(db, {
    name: "Somme à bandes 2D6",
    kind: "banded_sum",
    paramsJson: JSON.stringify({
      bands: [
        { min: 2, max: 6, label: "Échec" },
        { min: 7, max: 9, label: "Réussite partielle" },
        { min: 10, max: 12, label: "Réussite" },
      ],
      defaultLabel: "—",
    }),
    isSystem: 1,
    supportedSidesJson: JSON.stringify([6]),
    scope: "entry",
    usageKind: "system_template",
  });

  const ruleLocationD100Id = await ensureRule(db, {
    name: "Localisation D100",
    kind: "table_lookup",
    paramsJson: JSON.stringify({
      ranges: [
        { min: 1, max: 10, label: "Tête" },
        { min: 11, max: 35, label: "Bras gauche" },
        { min: 36, max: 60, label: "Bras droit" },
        { min: 61, max: 80, label: "Torse" },
        { min: 81, max: 90, label: "Jambe gauche" },
        { min: 91, max: 100, label: "Jambe droite" },
      ],
      defaultLabel: "Zone inconnue",
    }),
    isSystem: 1,
    supportedSidesJson: JSON.stringify([100]),
    scope: "entry",
    usageKind: "system_template",
  });

  const demoD20TableId = await ensureTable(db, "Démo D20", 1);

  const guerrierId = await ensureProfile(db, demoD20TableId, "Guerrier", 0);
  const archerId = await ensureProfile(db, demoD20TableId, "Archer", 1);

  const guerrierAttaqueId = await ensureGroup(db, {
    tableId: demoD20TableId,
    profileId: guerrierId,
    name: "Attaque",
    sortOrder: 0,
  });
  await ensureGroupDie(db, {
    groupId: guerrierAttaqueId,
    sides: 20,
    qty: 1,
    modifier: 0,
    sign: 1,
    sortOrder: 0,
    ruleId: ruleSingleCheckCritId,
  });

  const guerrierTestSeuilId = await ensureGroup(db, {
    tableId: demoD20TableId,
    profileId: guerrierId,
    name: "Test 10+",
    sortOrder: 1,
  });
  await ensureGroupDie(db, {
    groupId: guerrierTestSeuilId,
    sides: 20,
    qty: 1,
    modifier: 0,
    sign: 1,
    sortOrder: 0,
    ruleId: ruleSingleCheckThresholdHighId,
  });

  const guerrierDegatsId = await ensureGroup(db, {
    tableId: demoD20TableId,
    profileId: guerrierId,
    name: "Dégâts",
    sortOrder: 2,
  });
  await ensureGroupDie(db, {
    groupId: guerrierDegatsId,
    sides: 8,
    qty: 1,
    modifier: 0,
    sign: 1,
    sortOrder: 0,
    ruleId: ruleSumId,
  });

  const archerTirId = await ensureGroup(db, {
    tableId: demoD20TableId,
    profileId: archerId,
    name: "Tir",
    sortOrder: 0,
  });
  await ensureGroupDie(db, {
    groupId: archerTirId,
    sides: 20,
    qty: 1,
    modifier: 0,
    sign: 1,
    sortOrder: 0,
    ruleId: ruleSingleCheckCritId,
  });

  const archerDegatsId = await ensureGroup(db, {
    tableId: demoD20TableId,
    profileId: archerId,
    name: "Dégâts",
    sortOrder: 1,
  });
  await ensureGroupDie(db, {
    groupId: archerDegatsId,
    sides: 6,
    qty: 1,
    modifier: 0,
    sign: 1,
    sortOrder: 0,
    ruleId: ruleSumId,
  });

  const demoSpecialTableId = await ensureTable(db, "Démo Spéciale", 1);

  const aventurierId = await ensureProfile(
    db,
    demoSpecialTableId,
    "Aventurier",
    0,
  );

  const testD20Id = await ensureGroup(db, {
    tableId: demoSpecialTableId,
    profileId: aventurierId,
    name: "Test D20",
    sortOrder: 0,
  });
  await ensureGroupDie(db, {
    groupId: testD20Id,
    sides: 20,
    qty: 1,
    modifier: 0,
    sign: 1,
    sortOrder: 0,
    ruleId: ruleSingleCheckCritId,
  });

  const rafaleId = await ensureGroup(db, {
    tableId: demoSpecialTableId,
    profileId: aventurierId,
    name: "Rafale",
    sortOrder: 1,
    ruleId: ruleSuccessPoolD6Id,
  });
  await ensureGroupDie(db, {
    groupId: rafaleId,
    sides: 6,
    qty: 6,
    modifier: 0,
    sign: 1,
    sortOrder: 0,
    ruleId: null,
  });

  const meilleurDeId = await ensureGroup(db, {
    tableId: demoSpecialTableId,
    profileId: aventurierId,
    name: "Meilleur de 4D6",
    sortOrder: 2,
  });
  await ensureGroupDie(db, {
    groupId: meilleurDeId,
    sides: 6,
    qty: 4,
    modifier: 0,
    sign: 1,
    sortOrder: 0,
    ruleId: ruleHighestOfPoolD6Id,
  });

  const reaction2d6Id = await ensureGroup(db, {
    tableId: demoSpecialTableId,
    profileId: aventurierId,
    name: "Réaction 2D6",
    sortOrder: 3,
  });
  await ensureGroupDie(db, {
    groupId: reaction2d6Id,
    sides: 6,
    qty: 2,
    modifier: 0,
    sign: 1,
    sortOrder: 0,
    ruleId: ruleBandedSum2d6Id,
  });

  const localisationId = await ensureGroup(db, {
    tableId: demoSpecialTableId,
    profileId: aventurierId,
    name: "Localisation",
    sortOrder: 4,
  });
  await ensureGroupDie(db, {
    groupId: localisationId,
    sides: 100,
    qty: 1,
    modifier: 0,
    sign: 1,
    sortOrder: 0,
    ruleId: ruleLocationD100Id,
  });

  await setMeta(db, "seed_done", "true");
  await setMeta(db, "content_version", "8");
}