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

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [targetProfileForNewGroup, setTargetProfileForNewGroup] = useState<ProfileRow | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupRuleId, setNewGroupRuleId] = useState<string | null>(null);

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

  function resetCreateProfileForm() {
    setNewProfileName("");
  }

  function resetCreateGroupForm() {
    setTargetProfileForNewGroup(null);
    setNewGroupName("");
    setNewGroupRuleId(null);
  }

  function resetCreateDieForm() {
    setTargetGroupForNewDie(null);
    setNewDieSides("6");
    setNewDieQty("1");
    setNewDieModifier("0");
    setNewDieSign("1");
    setNewDieRuleId(null);
  }

  function openRenameProfileModal(profile: ProfileRow) {
    setEditingProfile(profile);
    setRenameProfileValue(profile.name);
    setShowRenameProfileModal(true);
  }

  function openRenameGroupModal(group: GroupRow) {
    setEditingGroup(group);
    setRenameGroupValue(group.name);
    setShowRenameGroupModal(true);
  }

  function openEditGroupRuleModal(group: GroupRow) {
    setEditingGroupForRule(group);
    setSelectedGroupRuleId(group.rule_id ?? null);
    setShowEditGroupRuleModal(true);
  }

  function openEditDieModal(die: GroupDieRow) {
    setEditingDie(die);
    setEditDieSides(String(die.sides));
    setEditDieQty(String(die.qty));
    setEditDieModifier(String(die.modifier ?? 0));
    setEditDieSign((die.sign ?? 1) === -1 ? "-1" : "1");
    setSelectedRuleId(die.rule_id ?? null);
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

    showCreateGroupModal,
    setShowCreateGroupModal,
    targetProfileForNewGroup,
    setTargetProfileForNewGroup,
    newGroupName,
    setNewGroupName,
    newGroupRuleId,
    setNewGroupRuleId,

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
    resetCreateGroupForm,
    resetCreateDieForm,
    openRenameProfileModal,
    openRenameGroupModal,
    openEditGroupRuleModal,
    openEditDieModal,
  };
}