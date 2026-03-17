import {
  replaceTableWithDraftGroups,
  createTableWithDraftGroups,
} from "../../../data/repositories/draftSaveRepo";
import { toSaveableDraftGroups } from "../helpers/draftMappers";
import { listTables } from "../../../data/repositories/tablesRepo";

import type { Db } from "../../../data/db/database";
import type {
  TableRow,
} from "../../../data/repositories/tablesRepo";

type DraftLikeDie = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
};

type DraftLikeGroup = {
  id: string;
  name: string;
  rule_id?: string | null;
  dice: DraftLikeDie[];
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

    await replaceTableWithDraftGroups(db, {
      tableId: table.id,
      groups: toSaveableDraftGroups(nonEmptyGroups),
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

  async function createNewTableFromName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    const nonEmptyGroups = getNonEmptyDraftGroups();
    if (nonEmptyGroups.length === 0) return;

    const existingTables = await listTables(db);
    const alreadyExists = existingTables.some(
      (t) => t.name.trim().toLowerCase() === trimmed.toLowerCase(),
    );

    if (alreadyExists) {
      throw new Error("Une table avec ce nom existe déjà.");
    }

    const newTableId = await createTableWithDraftGroups(db, {
      name: trimmed,
      groups: toSaveableDraftGroups(nonEmptyGroups),
    });

    await setActiveTableId(newTableId);

    setShowNameModal(false);
    setNewTableName("");
    resetDraftAfterCreate();
  }

  function closeCreateTableModal() {
    setShowNameModal(false);
    setNewTableName("");
  }

  return {
    replaceCurrentTable,
    openCreateTableModal,
    createNewTableFromName,
    closeCreateTableModal,
  };
}
