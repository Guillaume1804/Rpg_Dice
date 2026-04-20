import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { useDb } from "../../data/db/DbProvider";

import type { ProfileRow } from "../../data/repositories/profilesRepo";

import { useTableDetailData } from "../../features/tables/hooks/useTableDetailData";
import { TableProfilesSection } from "../../features/tables/components/TableProfilesSection";
import { TableProfileModals } from "../../features/tables/components/TableProfileModals";
import { TableGroupModals } from "../../features/tables/components/TableGroupModals";
import { TableDieModals } from "../../features/tables/components/TableDieModals";
import { TableRenameModal } from "../../features/tables/components/TableRenameModal";

import { useTableDetailActions } from "../../features/tables/hooks/useTableDetailActions";
import { TableDetailHeader } from "../../features/tables/components/TableDetailHeader";
import { useTableDetailUi } from "../../features/tables/hooks/useTableDetailUi";

import { CreateActionWizardModal } from "../../features/tables/actionWizard/CreateActionWizardModal";
import { useCreateActionWizard } from "../../features/tables/actionWizard/useCreateActionWizard";
import { useCreateActionFromWizard } from "../../features/tables/actionWizard/useCreateActionFromWizard";

import { getCompatibleRulesForContext } from "../../features/rules/helpers/ruleCompatibility";
import { isLocalRule } from "../../data/repositories/rulesRepo";

import { useHumanRuleEditor } from "../../features/rules/hooks/useHumanRuleEditor";
import { HumanRuleEditorModal } from "../../features/rules/components/HumanRuleEditorModal";
import { useRulesData } from "../../features/rules/hooks/useRulesData";

export default function TableDetailScreen() {
  const db = useDb();
  const {
    saveRule,
  } = useRulesData({ db });
  const { id } = useLocalSearchParams<{ id: string }>();

  const tableId = useMemo(() => (typeof id === "string" ? id : ""), [id]);

  const {
    showEditModal,
    editingRule,
    form,
    previewValues,
    previewSides,
    previewModifier,
    previewSign,
    previewResult,
    formError,
    setPreviewValues,
    setPreviewSides,
    setPreviewModifier,
    setPreviewSign,
    openCreateFromWizard,
    closeEditor,
    updateForm,
    updateRangeRow,
    addRangeRow,
    removeRangeRow,
    setScope,
    setSupportedSidesText,
    getRulePayload,
    computePreview,
  } = useHumanRuleEditor();

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
    // setTargetGroupForNewDie,
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
    openRenameProfileModal,
    openRenameGroupModal,
    openEditGroupRuleModal,
    openEditDieModal,

    openRenameTableModal,
    closeRenameTableModal,

    openCreateProfileModal,
    closeCreateProfileModal,

    closeRenameProfileModal,
    closeRenameGroupModal,
    closeEditGroupRuleModal,
    openCreateDieModal,
    closeCreateDieModal,
    closeEditDieModal,

    showCreateActionWizard,
    targetProfileForActionWizard,
    openCreateActionWizard,
    closeCreateActionWizard,
  } = useTableDetailUi();

  const {
    table,
    profiles,
    error,
    load,
    getRuleName,
    modernRules,
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

  const {
    visible: wizardVisible,
    step: wizardStep,
    stepIndex: wizardStepIndex,
    totalSteps: wizardTotalSteps,
    draft: wizardDraft,
    error: wizardError,
    open: openWizardState,
    close: closeWizardState,
    goNext: goWizardNext,
    goBack: goWizardBack,
    updateDraft: updateWizardDraft,
    updateDie: updateWizardDie,
    updateRangeRow: updateWizardRangeRow,
    addRangeRow: addWizardRangeRow,
    removeRangeRow: removeWizardRangeRow,
    setBehaviorType: setWizardBehaviorType,
  } = useCreateActionWizard();

  const {
    submitError: wizardSubmitError,
    submit: submitWizardAction,
    resetSubmitState: resetWizardSubmitState,
  } = useCreateActionFromWizard({
    db,
    tableId,
    tableName: table?.name ?? "",
    profile: targetProfileForActionWizard,
    reload: load,
    onSuccess: () => {
      closeWizardState();
      closeCreateActionWizard();
    },
  });

  const compatibleRulesForWizard = useMemo(() => {
    if (!wizardDraft.behaviorType || !wizardDraft.die.sides) {
      return [];
    }

    const wantedScope =
      wizardDraft.behaviorType === "success_pool" ? "group" : "entry";

    const allRules = [...modernRules, ...legacyRules];

    const compatible = getCompatibleRulesForContext(allRules, {
      scope: wantedScope,
      sides: [wizardDraft.die.sides],
    });

    return [...compatible].sort((a, b) => {
      const aLocal = isLocalRule(a);
      const bLocal = isLocalRule(b);

      if (aLocal !== bLocal) {
        return aLocal ? -1 : 1;
      }

      const aCustom = a.is_system !== 1;
      const bCustom = b.is_system !== 1;

      if (aCustom !== bCustom) {
        return aCustom ? -1 : 1;
      }

      return a.name.localeCompare(b.name, "fr");
    });
  }, [
    wizardDraft.behaviorType,
    wizardDraft.die.sides,
    modernRules,
    legacyRules,
  ]);

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
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          Table introuvable
        </Text>
        <Text style={{ marginTop: 8, opacity: 0.7 }}>id: {tableId}</Text>
      </View>
    );
  }

  const isSystem = table.is_system === 1;
  const currentTableName = table.name;

  function handleOpenCreateActionWizard(profile: ProfileRow) {
    resetWizardSubmitState();
    openCreateActionWizard(profile);
    openWizardState();
  }

  function handleCloseCreateActionWizard() {
    resetWizardSubmitState();
    closeWizardState();
    closeCreateActionWizard();
  }

  async function handleSubmitCreateActionWizard() {
    const ok = await submitWizardAction(wizardDraft);
    if (!ok) return;
  }

  function handleOpenAdvancedRuleEditor() {
    handleCloseCreateActionWizard();
    openCreateFromWizard(wizardDraft, currentTableName);
  }

  const actionWizardError = wizardSubmitError ?? wizardError;

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <TableDetailHeader
        tableName={table.name}
        isSystem={isSystem}
        onRenameTable={() => openRenameTableModal(table.name)}
        onCreateProfile={openCreateProfileModal}
      />

      <ScrollView>
        <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ fontWeight: "800", fontSize: 16 }}>
            Jet libre (dans cette table)
          </Text>

          <Text style={{ marginTop: 6, opacity: 0.7 }}>
            Lance des dés rapidement avec les règles de cette table, puis enregistre si besoin.
          </Text>

          {/* Placeholder pour l’instant */}
          <Text style={{ marginTop: 10, opacity: 0.5 }}>
            (Section jet libre à venir)
          </Text>
        </View>

        <TableProfilesSection
          profiles={profiles}
          isSystem={isSystem}
          getRuleName={getRuleName}
          onRenameProfile={openRenameProfileModal}
          onCreateGroup={handleOpenCreateActionWizard}
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
        modernRules={modernRules}
        legacyRules={legacyRules}
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
        modernRules={modernRules}
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

      <CreateActionWizardModal
        visible={showCreateActionWizard && wizardVisible}
        step={wizardStep}
        stepIndex={wizardStepIndex}
        totalSteps={wizardTotalSteps}
        draft={wizardDraft}
        error={actionWizardError}
        compatibleRules={compatibleRulesForWizard}
        onClose={handleCloseCreateActionWizard}
        onBack={goWizardBack}
        onNext={goWizardNext}
        onSubmit={handleSubmitCreateActionWizard}
        onUpdateDraft={updateWizardDraft}
        onUpdateDie={updateWizardDie}
        onSelectRuleId={(ruleId) => updateWizardDraft("selectedRuleId", ruleId)}
        onSelectCreationMode={(mode) => updateWizardDraft("creationMode", mode)}
        onOpenAdvancedRuleEditor={handleOpenAdvancedRuleEditor}
        onUpdateRangeRow={updateWizardRangeRow}
        onAddRangeRow={addWizardRangeRow}
        onRemoveRangeRow={removeWizardRangeRow}
        onSetBehaviorType={setWizardBehaviorType}
      />

      <HumanRuleEditorModal
        visible={showEditModal}
        editingRule={editingRule}
        form={form}
        formError={formError}
        previewValues={previewValues}
        previewSides={previewSides}
        previewModifier={previewModifier}
        previewSign={previewSign}
        previewResult={previewResult}
        onChangePreviewValues={setPreviewValues}
        onChangePreviewSides={setPreviewSides}
        onChangePreviewModifier={setPreviewModifier}
        onChangePreviewSign={setPreviewSign}
        onUpdateForm={updateForm}
        onUpdateRangeRow={updateRangeRow}
        onAddRangeRow={addRangeRow}
        onRemoveRangeRow={removeRangeRow}
        onSetScope={setScope}
        onSetSupportedSidesText={setSupportedSidesText}
        onComputePreview={computePreview}
        onClose={closeEditor}
        onSave={async () => {
          const payload = getRulePayload();

          await saveRule({
            editingRule: null,
            payload,
          });

          closeEditor();
          await load();
        }}
      />
    </View>
  );
}
