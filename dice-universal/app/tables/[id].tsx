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
import { useTableDetailUi } from "./hooks/useTableDetailUi";

export default function TableDetailScreen() {
  const db = useDb();
  const { id } = useLocalSearchParams<{ id: string }>();

  const tableId = useMemo(() => (typeof id === "string" ? id : ""), [id]);

  const {
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
  } = useTableDetailUi();

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