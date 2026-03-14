import { newId } from "../../../core/types/ids";
import type { Db } from "../../../data/db/database";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type { GroupRow, GroupDieRow } from "../../../data/repositories/groupsRepo";
import type { TableRow } from "../../../data/repositories/tablesRepo";

import { updateTableName } from "../../../data/repositories/tablesRepo";
import {
  createProfile,
  updateProfileName,
  deleteProfile,
} from "../../../data/repositories/profilesRepo";
import {
  createGroup,
  updateGroupName,
  updateGroupRuleId,
  deleteGroup,
  createGroupDie,
  updateGroupDie,
  deleteGroupDie,
} from "../../../data/repositories/groupsRepo";

type UseTableDetailActionsParams = {
  db: Db;
  table: TableRow | null;
  load: () => Promise<void>;

  renameValue: string;
  setShowRenameModal: (value: boolean) => void;

  newProfileName: string;
  resetCreateProfileForm: () => void;
  setShowCreateProfileModal: (value: boolean) => void;

  editingProfile: ProfileRow | null;
  renameProfileValue: string;
  setShowRenameProfileModal: (value: boolean) => void;
  setEditingProfile: (value: ProfileRow | null) => void;
  setRenameProfileValue: (value: string) => void;

  targetProfileForNewGroup: ProfileRow | null;
  newGroupName: string;
  newGroupRuleId: string | null;
  resetCreateGroupForm: () => void;
  setShowCreateGroupModal: (value: boolean) => void;

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

export function useTableDetailActions({
  db,
  table,
  load,

  renameValue,
  setShowRenameModal,

  newProfileName,
  resetCreateProfileForm,
  setShowCreateProfileModal,

  editingProfile,
  renameProfileValue,
  setShowRenameProfileModal,
  setEditingProfile,
  setRenameProfileValue,

  targetProfileForNewGroup,
  newGroupName,
  newGroupRuleId,
  resetCreateGroupForm,
  setShowCreateGroupModal,

  editingGroup,
  renameGroupValue,
  setShowRenameGroupModal,
  setEditingGroup,
  setRenameGroupValue,

  editingGroupForRule,
  selectedGroupRuleId,
  setShowEditGroupRuleModal,
  setEditingGroupForRule,
  setSelectedGroupRuleId,

  targetGroupForNewDie,
  newDieSides,
  newDieQty,
  newDieModifier,
  newDieSign,
  newDieRuleId,
  resetCreateDieForm,
  setShowCreateDieModal,

  editingDie,
  editDieSides,
  editDieQty,
  editDieModifier,
  editDieSign,
  selectedRuleId,
  setEditingDie,
  setSelectedRuleId,
}: UseTableDetailActionsParams) {
  async function submitRenameTable() {
    const name = renameValue.trim();
    if (!table) return;
    if (!name) return;
    if (table.is_system === 1) return;
    
    await updateTableName(db, table.id, name);
    setShowRenameModal(false);
    await load();
  }

  async function submitCreateProfile() {
    const name = newProfileName.trim();
    if (!table) return; 
    if (!name) return;

    await createProfile(db, {
      id: await newId(),
      table_id: table.id,
      name,
    });

    setShowCreateProfileModal(false);
    resetCreateProfileForm();
    await load();
  }

  async function submitRenameProfile() {
    const name = renameProfileValue.trim();
    if (!editingProfile || !name) return;

    await updateProfileName(db, editingProfile.id, name);

    setShowRenameProfileModal(false);
    setEditingProfile(null);
    setRenameProfileValue("");
    await load();
  }

  async function submitDeleteProfile(profile: ProfileRow) {
    await deleteProfile(db, profile.id);
    await load();
  }

  async function submitCreateGroup() {
    const name = newGroupName.trim();
    if (!name || !targetProfileForNewGroup) return;

    await createGroup(db, {
      profileId: targetProfileForNewGroup.id,
      name,
      rule_id: newGroupRuleId ?? null,
    });

    setShowCreateGroupModal(false);
    resetCreateGroupForm();
    await load();
  }

  async function submitRenameGroup() {
    const name = renameGroupValue.trim();
    if (!editingGroup || !name) return;

    await updateGroupName(db, editingGroup.id, name);

    setShowRenameGroupModal(false);
    setEditingGroup(null);
    setRenameGroupValue("");
    await load();
  }

  async function submitEditGroupRule() {
    if (!editingGroupForRule) return;

    await updateGroupRuleId(
      db,
      editingGroupForRule.id,
      selectedGroupRuleId ?? null
    );

    setShowEditGroupRuleModal(false);
    setEditingGroupForRule(null);
    setSelectedGroupRuleId(null);
    await load();
  }

  async function submitDeleteGroup(group: GroupRow) {
    await deleteGroup(db, group.id);
    await load();
  }

  async function submitCreateDie() {
    if (!targetGroupForNewDie) return;

    const sides = Number(newDieSides || "0");
    const qty = Number(newDieQty || "0");
    const modifier = Number(newDieModifier || "0");
    const sign = Number(newDieSign || "1");

    if (!Number.isFinite(sides) || sides <= 0) return;
    if (!Number.isFinite(qty) || qty <= 0) return;

    await createGroupDie(db, {
      groupId: targetGroupForNewDie.id,
      sides,
      qty,
      modifier: Number.isFinite(modifier) ? modifier : 0,
      sign: sign === -1 ? -1 : 1,
      rule_id: newDieRuleId ?? null,
    });

    setShowCreateDieModal(false);
    resetCreateDieForm();
    await load();
  }

  async function submitEditDie() {
    if (!editingDie) return;

    const sides = Number(editDieSides || "0");
    const qty = Number(editDieQty || "0");
    const modifier = Number(editDieModifier || "0");
    const sign = Number(editDieSign || "1");

    if (!Number.isFinite(sides) || sides <= 0) return;
    if (!Number.isFinite(qty) || qty <= 0) return;

    await updateGroupDie(db, editingDie.id, {
      sides,
      qty,
      modifier: Number.isFinite(modifier) ? modifier : 0,
      sign: sign === -1 ? -1 : 1,
      rule_id: selectedRuleId ?? null,
    });

    setEditingDie(null);
    setSelectedRuleId(null);
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
    submitCreateGroup,
    submitRenameGroup,
    submitEditGroupRule,
    submitDeleteGroup,
    submitCreateDie,
    submitEditDie,
    submitDeleteDie,
  };
}