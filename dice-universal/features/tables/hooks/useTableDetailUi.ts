import { useState } from "react";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type { GroupRow, GroupDieRow } from "../../../data/repositories/groupsRepo";

export function useTableDetailUi() {
  const [renameValue, setRenameValue] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);

  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const [showRenameProfileModal, setShowRenameProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileRow | null>(null);
  const [renameProfileValue, setRenameProfileValue] = useState("");

  const [showRenameGroupModal, setShowRenameGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupRow | null>(null);
  const [renameGroupValue, setRenameGroupValue] = useState("");

  const [showEditGroupRuleModal, setShowEditGroupRuleModal] = useState(false);
  const [editingGroupForRule, setEditingGroupForRule] = useState<GroupRow | null>(null);
  const [selectedGroupRuleId, setSelectedGroupRuleId] = useState<string | null>(null);

  const [showCreateDieModal, setShowCreateDieModal] = useState(false);
  const [targetGroupForNewDie, setTargetGroupForNewDie] = useState<GroupRow | null>(null);
  const [newDieSides, setNewDieSides] = useState("6");
  const [newDieQty, setNewDieQty] = useState("1");
  const [newDieModifier, setNewDieModifier] = useState("0");
  const [newDieSign, setNewDieSign] = useState<"1" | "-1">("1");
  const [newDieRuleId, setNewDieRuleId] = useState<string | null>(null);

  const [editingDie, setEditingDie] = useState<GroupDieRow | null>(null);
  const [editDieSides, setEditDieSides] = useState("6");
  const [editDieQty, setEditDieQty] = useState("1");
  const [editDieModifier, setEditDieModifier] = useState("0");
  const [editDieSign, setEditDieSign] = useState<"1" | "-1">("1");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const [showCreateActionWizard, setShowCreateActionWizard] = useState(false);
  const [targetProfileForActionWizard, setTargetProfileForActionWizard] =
    useState<ProfileRow | null>(null);

  function resetCreateProfileForm() {
    setNewProfileName("");
  }

  function resetCreateDieForm() {
    setTargetGroupForNewDie(null);
    setNewDieSides("6");
    setNewDieQty("1");
    setNewDieModifier("0");
    setNewDieSign("1");
    setNewDieRuleId(null);
  }

  function openRenameTableModal(tableName: string) {
    setRenameValue(tableName);
    setShowRenameModal(true);
  }

  function closeRenameTableModal() {
    setShowRenameModal(false);
  }

  function openCreateProfileModal() {
    resetCreateProfileForm();
    setShowCreateProfileModal(true);
  }

  function closeCreateProfileModal() {
    setShowCreateProfileModal(false);
    resetCreateProfileForm();
  }

  function openRenameProfileModal(profile: ProfileRow) {
    setEditingProfile(profile);
    setRenameProfileValue(profile.name);
    setShowRenameProfileModal(true);
  }

  function closeRenameProfileModal() {
    setShowRenameProfileModal(false);
    setEditingProfile(null);
    setRenameProfileValue("");
  }

  function openCreateActionWizard(profile: ProfileRow) {
    setTargetProfileForActionWizard(profile);
    setShowCreateActionWizard(true);
  }

  function closeCreateActionWizard() {
    setShowCreateActionWizard(false);
    setTargetProfileForActionWizard(null);
  }

  function openRenameGroupModal(group: GroupRow) {
    setEditingGroup(group);
    setRenameGroupValue(group.name);
    setShowRenameGroupModal(true);
  }

  function closeRenameGroupModal() {
    setShowRenameGroupModal(false);
    setEditingGroup(null);
    setRenameGroupValue("");
  }

  function openEditGroupRuleModal(group: GroupRow) {
    setEditingGroupForRule(group);
    setSelectedGroupRuleId(group.rule_id ?? null);
    setShowEditGroupRuleModal(true);
  }

  function closeEditGroupRuleModal() {
    setShowEditGroupRuleModal(false);
    setEditingGroupForRule(null);
    setSelectedGroupRuleId(null);
  }

  function openCreateDieModal(group: GroupRow) {
    setTargetGroupForNewDie(group);
    setNewDieSides("6");
    setNewDieQty("1");
    setNewDieModifier("0");
    setNewDieSign("1");
    setNewDieRuleId(null);
    setShowCreateDieModal(true);
  }

  function closeCreateDieModal() {
    setShowCreateDieModal(false);
    resetCreateDieForm();
  }

  function openEditDieModal(die: GroupDieRow) {
    setEditingDie(die);
    setEditDieSides(String(die.sides));
    setEditDieQty(String(die.qty));
    setEditDieModifier(String(die.modifier ?? 0));
    setEditDieSign((die.sign ?? 1) === -1 ? "-1" : "1");
    setSelectedRuleId(die.rule_id ?? null);
  }

  function closeEditDieModal() {
    setEditingDie(null);
    setSelectedRuleId(null);
  }

  return {
    renameValue,
    setRenameValue,
    showRenameModal,
    setShowRenameModal,

    showCreateProfileModal,
    setShowCreateProfileModal,
    newProfileName,
    setNewProfileName,

    showRenameProfileModal,
    setShowRenameProfileModal,
    editingProfile,
    setEditingProfile,
    renameProfileValue,
    setRenameProfileValue,

    showRenameGroupModal,
    setShowRenameGroupModal,
    editingGroup,
    setEditingGroup,
    renameGroupValue,
    setRenameGroupValue,

    showEditGroupRuleModal,
    setShowEditGroupRuleModal,
    editingGroupForRule,
    setEditingGroupForRule,
    selectedGroupRuleId,
    setSelectedGroupRuleId,

    showCreateDieModal,
    setShowCreateDieModal,
    targetGroupForNewDie,
    setTargetGroupForNewDie,
    newDieSides,
    setNewDieSides,
    newDieQty,
    setNewDieQty,
    newDieModifier,
    setNewDieModifier,
    newDieSign,
    setNewDieSign,
    newDieRuleId,
    setNewDieRuleId,

    editingDie,
    setEditingDie,
    editDieSides,
    setEditDieSides,
    editDieQty,
    setEditDieQty,
    editDieModifier,
    setEditDieModifier,
    editDieSign,
    setEditDieSign,
    selectedRuleId,
    setSelectedRuleId,

    resetCreateProfileForm,
    resetCreateDieForm,

    openRenameTableModal,
    closeRenameTableModal,

    openCreateProfileModal,
    closeCreateProfileModal,

    openRenameProfileModal,
    closeRenameProfileModal,

    openRenameGroupModal,
    closeRenameGroupModal,

    openEditGroupRuleModal,
    closeEditGroupRuleModal,

    openCreateDieModal,
    closeCreateDieModal,

    openEditDieModal,
    closeEditDieModal,

    showCreateActionWizard,
    targetProfileForActionWizard,

    openCreateActionWizard,
    closeCreateActionWizard,
  };
}