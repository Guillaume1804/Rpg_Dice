import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
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

  const [freeDieSides, setFreeDieSides] = useState("6");
  const [freeDieQty, setFreeDieQty] = useState("1");
  const [freeDieModifier, setFreeDieModifier] = useState("0");
  const [freeDieSign, setFreeDieSign] = useState<"1" | "-1">("1");
  const [freeRuleId, setFreeRuleId] = useState<string | null>(null);

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

  const compatibleRulesForFreeRoll = useMemo(() => {
    const sides = Number(freeDieSides);

    if (!Number.isFinite(sides) || sides <= 0) {
      return [];
    }

    const allRules = [...modernRules, ...legacyRules];

    const compatible = getCompatibleRulesForContext(allRules, {
      scope: "entry",
      sides: [sides],
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
  }, [freeDieSides, modernRules, legacyRules]);

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
        <View
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            gap: 10,
          }}
        >
          <Text style={{ fontWeight: "800", fontSize: 16 }}>
            Jet libre (dans cette table)
          </Text>

          <Text style={{ opacity: 0.7 }}>
            Lance des dés rapidement avec les règles de cette table, puis enregistre si besoin.
          </Text>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>Dé</Text>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => setFreeDieSides("6")}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: freeDieSides === "6" ? 1 : 0.7,
                }}
              >
                <Text>d6</Text>
              </Pressable>

              <Pressable
                onPress={() => setFreeDieSides("20")}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: freeDieSides === "20" ? 1 : 0.7,
                }}
              >
                <Text>d20</Text>
              </Pressable>

              <Pressable
                onPress={() => setFreeDieSides("100")}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: freeDieSides === "100" ? 1 : 0.7,
                }}
              >
                <Text>d100</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>Quantité</Text>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => setFreeDieQty("1")}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: freeDieQty === "1" ? 1 : 0.7,
                }}
              >
                <Text>1</Text>
              </Pressable>

              <Pressable
                onPress={() => setFreeDieQty("2")}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: freeDieQty === "2" ? 1 : 0.7,
                }}
              >
                <Text>2</Text>
              </Pressable>

              <Pressable
                onPress={() => setFreeDieQty("3")}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: freeDieQty === "3" ? 1 : 0.7,
                }}
              >
                <Text>3</Text>
              </Pressable>

              <Pressable
                onPress={() => setFreeDieQty("5")}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: freeDieQty === "5" ? 1 : 0.7,
                }}
              >
                <Text>5</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>Règle compatible</Text>

            {compatibleRulesForFreeRoll.length > 0 ? (
              <View style={{ gap: 8 }}>
                <Pressable
                  onPress={() => setFreeRuleId(null)}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 10,
                    opacity: freeRuleId === null ? 1 : 0.7,
                  }}
                >
                  <Text style={{ fontWeight: freeRuleId === null ? "700" : "400" }}>
                    Aucune règle
                  </Text>
                </Pressable>

                {compatibleRulesForFreeRoll.slice(0, 4).map((rule) => (
                  <Pressable
                    key={rule.id}
                    onPress={() => setFreeRuleId(rule.id)}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                      opacity: freeRuleId === rule.id ? 1 : 0.7,
                    }}
                  >
                    <Text style={{ fontWeight: freeRuleId === rule.id ? "700" : "400" }}>
                      {rule.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={{ opacity: 0.6 }}>
                Aucune règle compatible trouvée pour ce dé.
              </Text>
            )}
          </View>

          <Text style={{ opacity: 0.5 }}>
            Le lancer réel et l’enregistrement comme action arrivent à l’étape suivante.
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
