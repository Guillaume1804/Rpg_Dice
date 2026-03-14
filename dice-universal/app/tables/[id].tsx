// app/tables/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { useDb } from "../../data/db/DbProvider";

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

    openRenameTableModal,
    closeRenameTableModal,
      
    openCreateProfileModal,
    closeCreateProfileModal,
      
    closeRenameProfileModal,
      
    openCreateGroupModal,
    closeCreateGroupModal,
      
    closeRenameGroupModal,
      
    closeEditGroupRuleModal,
      
    openCreateDieModal,
    closeCreateDieModal,
      
    closeEditDieModal,
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
    tableUi: {
      renameValue,
      setShowRenameModal,
    },
    profileUi: {
      newProfileName,
      resetCreateProfileForm,
      setShowCreateProfileModal,
      editingProfile,
      renameProfileValue,
      setShowRenameProfileModal,
      setEditingProfile,
      setRenameProfileValue,
    },
    groupUi: {
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
    },
    dieUi: {
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
    },
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
        onRenameTable={() => openRenameTableModal(table.name)}
        onCreateProfile={openCreateProfileModal}
      />

      <ScrollView>
        <TableProfilesSection
          profiles={profiles}
          isSystem={isSystem}
          getRuleName={getRuleName}
          onRenameProfile={openRenameProfileModal}
          onCreateGroup={openCreateGroupModal}
          onDeleteProfile={submitDeleteProfile}
          onRenameGroup={openRenameGroupModal}
          onEditGroupRule={openEditGroupRuleModal}
          onCreateDie={openCreateDieModal}
          onDeleteGroup={submitDeleteGroup}
          onEditDie={openEditDieModal}
          onDeleteDie={submitDeleteDie}
        />
      </ScrollView>

      <TableRenameModal
        visible={showRenameModal}
        value={renameValue}
        onChangeValue={setRenameValue}
        onClose={closeRenameTableModal}
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
        onCloseCreateGroupModal={closeCreateGroupModal}
        onSubmitCreateGroup={submitCreateGroup}
        showRenameGroupModal={showRenameGroupModal}
        renameGroupValue={renameGroupValue}
        onChangeRenameGroupValue={setRenameGroupValue}
        onCloseRenameGroupModal={closeRenameGroupModal}
        onSubmitRenameGroup={submitRenameGroup}
        showEditGroupRuleModal={showEditGroupRuleModal}
        editingGroupForRule={editingGroupForRule}
        selectedGroupRuleId={selectedGroupRuleId}
        onSelectGroupRuleId={setSelectedGroupRuleId}
        onCloseEditGroupRuleModal={closeEditGroupRuleModal}
        onSubmitEditGroupRule={submitEditGroupRule}
      />

      <TableProfileModals
        showCreateProfileModal={showCreateProfileModal}
        newProfileName={newProfileName}
        onChangeNewProfileName={setNewProfileName}
        onCloseCreateProfileModal={closeCreateProfileModal}
        onSubmitCreateProfile={submitCreateProfile}
        showRenameProfileModal={showRenameProfileModal}
        renameProfileValue={renameProfileValue}
        onChangeRenameProfileValue={setRenameProfileValue}
        onCloseRenameProfileModal={closeRenameProfileModal}
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
        onCloseCreateDieModal={closeCreateDieModal}
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
        onCloseEditDieModal={closeEditDieModal}
        onSubmitEditDie={submitEditDie}
      />

    </View>
  );
}