import { newId } from "../../../core/types/ids";
import type { Db } from "../../../data/db/database";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type {
  GroupRow,
  GroupDieRow,
} from "../../../data/repositories/groupsRepo";
import type { TableRow } from "../../../data/repositories/tablesRepo";

import { updateTableName } from "../../../data/repositories/tablesRepo";
import {
  createProfile,
  updateProfileName,
  deleteProfile,
} from "../../../data/repositories/profilesRepo";
import {
  updateGroupName,
  updateGroupRuleId,
  deleteGroup,
  createGroupDie,
  updateGroupDie,
  deleteGroupDie,
} from "../../../data/repositories/groupsRepo";

type TableUiActions = {
  renameValue: string;
  setShowRenameModal: (value: boolean) => void;
};

type ProfileUiActions = {
  newProfileName: string;
  resetCreateProfileForm: () => void;
  setShowCreateProfileModal: (value: boolean) => void;

  editingProfile: ProfileRow | null;
  renameProfileValue: string;
  setShowRenameProfileModal: (value: boolean) => void;
  setEditingProfile: (value: ProfileRow | null) => void;
  setRenameProfileValue: (value: string) => void;
};

type GroupUiActions = {
  editingGroup: GroupRow | null;
  renameGroupValue: string;
  setShowRenameGroupModal: (value: boolean) => void;
  setEditingGroup: (value: GroupRow | null) => void;
  setRenameGroupValue: (value: string) => void;

  editingGroupForRule: GroupRow | null;
  selectedGroupRuleId: string | null;
  setShowEditGroupRuleModal: (value: boolean) => void;
  setEditingGroupForRule: (value: GroupRow | null) => void;
  setSelectedGroupRuleId: (value: string | null) => void;
};

type DieUiActions = {
  targetGroupForNewDie: GroupRow | null;
  newDieSides: string;
  newDieQty: string;
  newDieModifier: string;
  newDieSign: "1" | "-1";
  newDieRuleId: string | null;
  resetCreateDieForm: () => void;
  setShowCreateDieModal: (value: boolean) => void;

  editingDie: GroupDieRow | null;
  editDieSides: string;
  editDieQty: string;
  editDieModifier: string;
  editDieSign: "1" | "-1";
  selectedRuleId: string | null;
  setEditingDie: (value: GroupDieRow | null) => void;
  setSelectedRuleId: (value: string | null) => void;
};

type UseTableDetailActionsParams = {
  db: Db;
  table: TableRow | null;
  load: () => Promise<void>;

  tableUi: TableUiActions;
  profileUi: ProfileUiActions;
  groupUi: GroupUiActions;
  dieUi: DieUiActions;
};

export function useTableDetailActions({
  db,
  table,
  load,
  tableUi,
  profileUi,
  groupUi,
  dieUi,
}: UseTableDetailActionsParams) {
  async function submitRenameTable() {
    const name = tableUi.renameValue.trim();
    if (!table) return;
    if (!name) return;
    if (table.is_system === 1) return;

    await updateTableName(db, table.id, name);
    tableUi.setShowRenameModal(false);
    await load();
  }

  async function submitCreateProfile() {
    const name = profileUi.newProfileName.trim();
    if (!table) return;
    if (!name) return;

    await createProfile(db, {
      id: await newId(),
      table_id: table.id,
      name,
    });

    profileUi.setShowCreateProfileModal(false);
    profileUi.resetCreateProfileForm();
    await load();
  }

  async function submitRenameProfile() {
    const name = profileUi.renameProfileValue.trim();
    if (!profileUi.editingProfile || !name) return;

    await updateProfileName(db, profileUi.editingProfile.id, name);

    profileUi.setShowRenameProfileModal(false);
    profileUi.setEditingProfile(null);
    profileUi.setRenameProfileValue("");
    await load();
  }

  async function submitDeleteProfile(profile: ProfileRow) {
    await deleteProfile(db, profile.id);
    await load();
  }

  async function submitRenameGroup() {
    const name = groupUi.renameGroupValue.trim();
    if (!groupUi.editingGroup || !name) return;

    await updateGroupName(db, groupUi.editingGroup.id, name);

    groupUi.setShowRenameGroupModal(false);
    groupUi.setEditingGroup(null);
    groupUi.setRenameGroupValue("");
    await load();
  }

  async function submitEditGroupRule() {
    if (!groupUi.editingGroupForRule) return;

    await updateGroupRuleId(
      db,
      groupUi.editingGroupForRule.id,
      groupUi.selectedGroupRuleId ?? null,
    );

    groupUi.setShowEditGroupRuleModal(false);
    groupUi.setEditingGroupForRule(null);
    groupUi.setSelectedGroupRuleId(null);
    await load();
  }

  async function submitDeleteGroup(group: GroupRow) {
    await deleteGroup(db, group.id);
    await load();
  }

  async function submitCreateDie() {
    if (!dieUi.targetGroupForNewDie) return;

    const sides = Number(dieUi.newDieSides || "0");
    const qty = Number(dieUi.newDieQty || "0");
    const modifier = Number(dieUi.newDieModifier || "0");
    const sign = Number(dieUi.newDieSign || "1");

    if (!Number.isFinite(sides) || sides <= 0) return;
    if (!Number.isFinite(qty) || qty <= 0) return;

    await createGroupDie(db, {
      groupId: dieUi.targetGroupForNewDie.id,
      sides,
      qty,
      modifier: Number.isFinite(modifier) ? modifier : 0,
      sign: sign === -1 ? -1 : 1,
      rule_id: dieUi.newDieRuleId ?? null,
    });

    dieUi.setShowCreateDieModal(false);
    dieUi.resetCreateDieForm();
    await load();
  }

  async function submitEditDie() {
    if (!dieUi.editingDie) return;

    const sides = Number(dieUi.editDieSides || "0");
    const qty = Number(dieUi.editDieQty || "0");
    const modifier = Number(dieUi.editDieModifier || "0");
    const sign = Number(dieUi.editDieSign || "1");

    if (!Number.isFinite(sides) || sides <= 0) return;
    if (!Number.isFinite(qty) || qty <= 0) return;

    await updateGroupDie(db, dieUi.editingDie.id, {
      sides,
      qty,
      modifier: Number.isFinite(modifier) ? modifier : 0,
      sign: sign === -1 ? -1 : 1,
      rule_id: dieUi.selectedRuleId ?? null,
    });

    dieUi.setEditingDie(null);
    dieUi.setSelectedRuleId(null);
    await load();
  }

  async function submitDeleteDie(die: GroupDieRow) {
    await deleteGroupDie(db, die.id);
    await load();
  }

  return {
    submitRenameTable,
    submitCreateProfile,
    submitRenameProfile,
    submitDeleteProfile,
    submitRenameGroup,
    submitEditGroupRule,
    submitDeleteGroup,
    submitCreateDie,
    submitEditDie,
    submitDeleteDie,
  };
}