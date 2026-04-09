import {
  replaceTableWithDraftGroups,
  createTableWithDraftGroups,
  createProfileFromDraft,
  createGroupsFromDraft,
} from "../../../data/repositories/draftSaveRepo";
import { listTables } from "../../../data/repositories/tablesRepo";
import { listProfilesByTableId } from "../../../data/repositories/profilesRepo";
import { createRule } from "../../../data/repositories/rulesRepo";

import type { Db } from "../../../data/db/database";
import type { TableRow } from "../../../data/repositories/tablesRepo";

type DraftTempRule = {
  id: string;
  name: string;
  kind: string;
  params_json: string;
};

type DraftLikeDie = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
  rule_temp?: DraftTempRule | null;
};

type DraftLikeGroup = {
  id: string;
  name: string;
  rule_id?: string | null;
  rule_temp?: DraftTempRule | null;
  dice: DraftLikeDie[];
};

export type SaveTargetMode =
  | "replace_current_table"
  | "new_table_new_profile"
  | "existing_table_new_profile"
  | "existing_table_existing_profile";

type ResolvedSaveableDraftDie = {
  sides: number;
  qty: number;
  modifier: number;
  sign: number;
  rule_id: string | null;
};

type ResolvedSaveableDraftGroup = {
  name: string;
  rule_id: string | null;
  dice: ResolvedSaveableDraftDie[];
};

type Params = {
  db: Db;
  table: TableRow | null;
  getNonEmptyDraftGroups: () => DraftLikeGroup[];
  reloadGroups: () => Promise<void>;
  setShowSaveOptions: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowNameModal: (value: boolean) => void;
  setNewTableName: (value: string) => void;
  setActiveTableId: (tableId: string) => Promise<void>;
  resetDraftAfterCreate: () => void;
};

async function resolveTempRuleId(
  db: Db,
  ruleTemp: DraftTempRule | null | undefined,
): Promise<string | null> {
  if (!ruleTemp) return null;

  return createRule(db, {
    name: ruleTemp.name,
    kind: ruleTemp.kind,
    params_json: ruleTemp.params_json,
    is_system: 0,
  });
}

async function resolveDraftGroupsForSave(
  db: Db,
  groups: DraftLikeGroup[],
): Promise<ResolvedSaveableDraftGroup[]> {
  const resolvedGroups: ResolvedSaveableDraftGroup[] = [];

  for (const group of groups) {
    const resolvedGroupRuleId =
      group.rule_temp != null
        ? await resolveTempRuleId(db, group.rule_temp)
        : (group.rule_id ?? null);

    const resolvedDice: ResolvedSaveableDraftDie[] = [];

    for (const die of group.dice) {
      const resolvedDieRuleId =
        die.rule_temp != null
          ? await resolveTempRuleId(db, die.rule_temp)
          : (die.rule_id ?? null);

      resolvedDice.push({
        sides: die.sides,
        qty: die.qty,
        modifier: die.modifier ?? 0,
        sign: die.sign ?? 1,
        rule_id: resolvedDieRuleId,
      });
    }

    resolvedGroups.push({
      name: group.name,
      rule_id: resolvedGroupRuleId,
      dice: resolvedDice,
    });
  }

  return resolvedGroups;
}

export function useDraftTableActions({
  db,
  table,
  getNonEmptyDraftGroups,
  reloadGroups,
  setShowSaveOptions,
  setShowNameModal,
  setNewTableName,
  setActiveTableId,
  resetDraftAfterCreate,
}: Params) {
  async function replaceCurrentTable() {
    if (!table) return;
    if (table.is_system === 1) return;

    const nonEmptyGroups = getNonEmptyDraftGroups();
    if (nonEmptyGroups.length === 0) return;

    const resolvedGroups = await resolveDraftGroupsForSave(db, nonEmptyGroups);

    await replaceTableWithDraftGroups(db, {
      tableId: table.id,
      groups: resolvedGroups,
    });

    await reloadGroups();
    setShowSaveOptions(false);
  }

  function openCreateTableModal() {
    const nonEmptyGroups = getNonEmptyDraftGroups();
    if (nonEmptyGroups.length === 0) return;

    setNewTableName(`Nouvelle table (${new Date().toLocaleDateString()})`);
    setShowSaveOptions(false);
    setShowNameModal(true);
  }

  async function createNewTableFromName(
    tableName: string,
    profileName = "Profil principal",
  ) {
    const trimmedTableName = tableName.trim();
    const trimmedProfileName = profileName.trim() || "Profil principal";

    if (!trimmedTableName) {
      throw new Error("Le nom de la table est obligatoire.");
    }

    const nonEmptyGroups = getNonEmptyDraftGroups();
    if (nonEmptyGroups.length === 0) return;

    const existingTables = await listTables(db);
    const alreadyExists = existingTables.some(
      (t) => t.name.trim().toLowerCase() === trimmedTableName.toLowerCase(),
    );

    if (alreadyExists) {
      throw new Error("Une table avec ce nom existe déjà.");
    }

    const resolvedGroups = await resolveDraftGroupsForSave(db, nonEmptyGroups);

    const newTableId = await createTableWithDraftGroups(db, {
      name: trimmedTableName,
      profileName: trimmedProfileName,
      groups: resolvedGroups,
    });

    await setActiveTableId(newTableId);

    setShowNameModal(false);
    setNewTableName("");
    resetDraftAfterCreate();
  }

  async function appendDraftToExistingTableNewProfile(
    tableId: string,
    profileName: string,
  ) {
    const trimmedProfileName = profileName.trim();
    if (!trimmedProfileName) {
      throw new Error("Le nom du profil est obligatoire.");
    }

    const nonEmptyGroups = getNonEmptyDraftGroups();
    if (nonEmptyGroups.length === 0) return;

    const resolvedGroups = await resolveDraftGroupsForSave(db, nonEmptyGroups);

    const profileId = await createProfileFromDraft(db, {
      tableId,
      profileName: trimmedProfileName,
    });

    await createGroupsFromDraft(db, {
      tableId,
      profileId,
      groups: resolvedGroups,
    });

    await setActiveTableId(tableId);
    await reloadGroups();
    resetDraftAfterCreate();
  }

  async function appendDraftToExistingProfile(
    tableId: string,
    profileId: string,
  ) {
    const nonEmptyGroups = getNonEmptyDraftGroups();
    if (nonEmptyGroups.length === 0) return;

    const resolvedGroups = await resolveDraftGroupsForSave(db, nonEmptyGroups);

    await createGroupsFromDraft(db, {
      tableId,
      profileId,
      groups: resolvedGroups,
    });

    await setActiveTableId(tableId);
    await reloadGroups();
    resetDraftAfterCreate();
  }

  async function getAvailableSaveTargets() {
    const tables = await listTables(db);

    const nonSystemTables = tables.filter((t) => t.is_system !== 1);

    const tablesWithProfiles = await Promise.all(
      nonSystemTables.map(async (t) => ({
        table: t,
        profiles: await listProfilesByTableId(db, t.id),
      })),
    );

    return tablesWithProfiles;
  }

  function closeCreateTableModal() {
    setShowNameModal(false);
    setNewTableName("");
  }

  return {
    replaceCurrentTable,
    openCreateTableModal,
    createNewTableFromName,
    appendDraftToExistingTableNewProfile,
    appendDraftToExistingProfile,
    getAvailableSaveTargets,
    closeCreateTableModal,
  };
}