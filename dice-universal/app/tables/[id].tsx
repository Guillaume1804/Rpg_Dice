// app/tables/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useDb } from "../../data/db/DbProvider";

import { ProfileRow } from "../../data/repositories/profilesRepo";
import { GroupRow, GroupDieRow } from "../../data/repositories/groupsRepo";

import { useTableDetailData } from "./hooks/useTableDetailData";
import { TableProfilesSection } from "./components/TableProfilesSection";
import { TableProfileModals } from "./components/TableProfileModals";
import { TableGroupModals } from "./components/TableGroupModals";
import { TableDieModals } from "./components/TableDieModals";
import { TableRenameModal } from "./components/TableRenameModal";

import { useTableDetailActions } from "./hooks/useTableDetailActions";
import { TableDetailHeader } from "./components/TableDetailHeader";

export default function TableDetailScreen() {
  const db = useDb();
  const { id } = useLocalSearchParams<{ id: string }>();

  const tableId = useMemo(() => (typeof id === "string" ? id : ""), [id]);

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

  const {
    table,
    profiles,
    error,
    load,
    getRuleName,
    pipelineRules,
    legacyRules,
  } = useTableDetailData({
    db,
    tableId,
  });

  const {
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
  } = useTableDetailActions({
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
  });

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

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Erreur</Text>
        <Text style={{ marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

  if (!table) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Table introuvable</Text>
        <Text style={{ marginTop: 8, opacity: 0.7 }}>id: {tableId}</Text>
      </View>
    );
  }

  const isSystem = table.is_system === 1;

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <TableDetailHeader
        tableName={table.name}
        isSystem={isSystem}
        onRenameTable={() => {
          setRenameValue(table.name);
          setShowRenameModal(true);
        }}
        onCreateProfile={() => {
          resetCreateProfileForm();
          setShowCreateProfileModal(true);
        }}
      />

      <ScrollView>
        <TableProfilesSection
          profiles={profiles}
          isSystem={isSystem}
          getRuleName={getRuleName}
          onRenameProfile={openRenameProfileModal}
          onCreateGroup={(profile) => {
            setTargetProfileForNewGroup(profile);
            setNewGroupName("");
            setNewGroupRuleId(null);
            setShowCreateGroupModal(true);
          }}
          onDeleteProfile={submitDeleteProfile}
          onRenameGroup={openRenameGroupModal}
          onEditGroupRule={openEditGroupRuleModal}
          onCreateDie={(group) => {
            setTargetGroupForNewDie(group);
            setNewDieSides("6");
            setNewDieQty("1");
            setNewDieModifier("0");
            setNewDieSign("1");
            setNewDieRuleId(null);
            setShowCreateDieModal(true);
          }}
          onDeleteGroup={submitDeleteGroup}
          onEditDie={openEditDieModal}
          onDeleteDie={submitDeleteDie}
        />
      </ScrollView>

      <TableRenameModal
        visible={showRenameModal}
        value={renameValue}
        onChangeValue={setRenameValue}
        onClose={() => setShowRenameModal(false)}
        onSubmit={submitRenameTable}
      />

      <TableGroupModals
        showCreateGroupModal={showCreateGroupModal}
        targetProfileForNewGroup={targetProfileForNewGroup}
        newGroupName={newGroupName}
        newGroupRuleId={newGroupRuleId}
        pipelineRules={pipelineRules}
        legacyRules={legacyRules}
        onChangeNewGroupName={setNewGroupName}
        onSelectNewGroupRuleId={setNewGroupRuleId}
        onCloseCreateGroupModal={() => {
          setShowCreateGroupModal(false);
          resetCreateGroupForm();
        }}
        onSubmitCreateGroup={submitCreateGroup}
        showRenameGroupModal={showRenameGroupModal}
        renameGroupValue={renameGroupValue}
        onChangeRenameGroupValue={setRenameGroupValue}
        onCloseRenameGroupModal={() => {
          setShowRenameGroupModal(false);
          setEditingGroup(null);
          setRenameGroupValue("");
        }}
        onSubmitRenameGroup={submitRenameGroup}
        showEditGroupRuleModal={showEditGroupRuleModal}
        editingGroupForRule={editingGroupForRule}
        selectedGroupRuleId={selectedGroupRuleId}
        onSelectGroupRuleId={setSelectedGroupRuleId}
        onCloseEditGroupRuleModal={() => {
          setShowEditGroupRuleModal(false);
          setEditingGroupForRule(null);
          setSelectedGroupRuleId(null);
        }}
        onSubmitEditGroupRule={submitEditGroupRule}
      />

      <TableProfileModals
        showCreateProfileModal={showCreateProfileModal}
        newProfileName={newProfileName}
        onChangeNewProfileName={setNewProfileName}
        onCloseCreateProfileModal={() => {
          setShowCreateProfileModal(false);
          resetCreateProfileForm();
        }}
        onSubmitCreateProfile={submitCreateProfile}
        showRenameProfileModal={showRenameProfileModal}
        renameProfileValue={renameProfileValue}
        onChangeRenameProfileValue={setRenameProfileValue}
        onCloseRenameProfileModal={() => {
          setShowRenameProfileModal(false);
          setEditingProfile(null);
          setRenameProfileValue("");
        }}
        onSubmitRenameProfile={submitRenameProfile}
      />

      <TableDieModals
        showCreateDieModal={showCreateDieModal}
        targetGroupForNewDie={targetGroupForNewDie}
        newDieSides={newDieSides}
        newDieQty={newDieQty}
        newDieModifier={newDieModifier}
        newDieSign={newDieSign}
        newDieRuleId={newDieRuleId}
        pipelineRules={pipelineRules}
        legacyRules={legacyRules}
        onChangeNewDieSides={setNewDieSides}
        onChangeNewDieQty={setNewDieQty}
        onChangeNewDieModifier={setNewDieModifier}
        onChangeNewDieSign={setNewDieSign}
        onChangeNewDieRuleId={setNewDieRuleId}
        onCloseCreateDieModal={() => {
          setShowCreateDieModal(false);
          resetCreateDieForm();
        }}
        onSubmitCreateDie={submitCreateDie}
        editingDie={editingDie}
        editDieSides={editDieSides}
        editDieQty={editDieQty}
        editDieModifier={editDieModifier}
        editDieSign={editDieSign}
        selectedRuleId={selectedRuleId}
        onChangeEditDieSides={setEditDieSides}
        onChangeEditDieQty={setEditDieQty}
        onChangeEditDieModifier={setEditDieModifier}
        onChangeEditDieSign={setEditDieSign}
        onChangeSelectedRuleId={setSelectedRuleId}
        onCloseEditDieModal={() => {
          setEditingDie(null);
          setSelectedRuleId(null);
        }}
        onSubmitEditDie={submitEditDie}
      />

    </View>
  );
}