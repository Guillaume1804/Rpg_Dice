// app/roll.tsx
import { useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";

import { RollModals } from "../features/roll/components/RollModals";

import { SavedProfilesSection } from "../features/roll/components/SavedProfilesSection";
import { useDraftTableActions } from "../features/roll/hooks/useDraftTableActions";

import { useRollExecution } from "../features/roll/hooks/useRollExecution";

import {
  useQuickRollDraft,
} from "../features/roll/hooks/useQuickRollDraft";

import { QuickRollSection } from "../features/roll/components/QuickRollSection";

import { useRollTableData } from "../features/roll/hooks/useRollTableData";

import { GroupRollResult } from "../core/roll/roll";

import { RollHeaderSection } from "../features/roll/components/RollHeaderSection";

import { RollTabs } from "../features/roll/components/RollTabs";

export default function RollScreen() {
  const db = useDb();
  const { activeTableId, setActiveTableId } = useActiveTable();
  const [activeTab, setActiveTab] = useState<"quick" | "profiles">("quick");

  const [results, setResults] = useState<GroupRollResult[]>([]);

  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  const STANDARD_DICE = [4, 6, 8, 10, 12, 20, 100];

  const tableId = useMemo(
    () => (typeof activeTableId === "string" && activeTableId.length > 0 ? activeTableId : ""),
    [activeTableId]
  );

  const {
    table,
    profiles,
    rulesMap,
    availableRules,
    pipelineRules,
    legacyRules,
    error,
    reloadGroups,
  } = useRollTableData({
    db,
    tableId,
  });


  const {
    draftGroups,
    setDraftGroups,
    draftResults,
    setDraftResults,
    selectedDraftGroupId,
    setSelectedDraftGroupId,

    showRenameDraftGroupModal,
    renameDraftGroupValue,
    setRenameDraftGroupValue,

    showDraftGroupRuleModal,
    closeDraftGroupRuleModal,
    draftGroupRuleSelection,
    setDraftGroupRuleSelection,

    editingDraftGroupId,
    editingDraftIndex,
    draftEditModifier,
    setDraftEditModifier,
    draftEditSign,
    setDraftEditSign,
    draftEditRuleId,
    setDraftEditRuleId,
    draftEditSides,
    setDraftEditSides,
    draftEditQty,
    setDraftEditQty,

    resetDraftEditorState,
    getNonEmptyDraftGroups,

    addDraftGroup,
    addDieToDraft,
    removeDraftDie,
    removeDraftGroup,
    clearDraft,

    openRenameDraftGroupModal,
    closeRenameDraftGroupModal,
    saveRenameDraftGroup,

    openDraftEditor,
    saveDraftEditor,

    openDraftGroupRuleEditor,
    saveDraftGroupRuleEditor,

    rollDraft,
  } = useQuickRollDraft({
    db,
    table,
    availableRules,
  });

  const { rollSavedTable } = useRollExecution({
    db,
    table,
    profiles,
    rulesMap,
    setResults,
  });

  const {
    replaceCurrentTable,
    openCreateTableModal,
    createNewTableFromName,
    closeCreateTableModal,
  } = useDraftTableActions({
    db,
    table,
    getNonEmptyDraftGroups,
    reloadGroups,
    setShowSaveOptions,
    setShowNameModal,
    setNewTableName,
    setActiveTableId,
    resetDraftAfterCreate: () => {
      setDraftGroups([]);
      setDraftResults([]);
      setSelectedDraftGroupId(null);
      setDraftGroupRuleSelection(null);
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

  if (!tableId) {
    return (
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Jet</Text>
        <Text style={{ opacity: 0.7 }}>
          Aucune table active. Va dans “Mes tables” et sélectionne une table.
        </Text>
      </View>
    );
  }

  if (!table) {
    return (
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Jet</Text>
        <Text style={{ opacity: 0.7 }}>Table active introuvable (id: {tableId}).</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <RollHeaderSection
        tableName={table.name}
        onRollTable={rollSavedTable}
      />

      <RollTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      <ScrollView style={{ flex: 1 }}>
        {activeTab === "quick" ? (
          <QuickRollSection
            standardDice={STANDARD_DICE}
            draftGroups={draftGroups}
            draftResults={draftResults}
            selectedDraftGroupId={selectedDraftGroupId}
            tableIsSystem={table.is_system === 1}
            showSaveOptions={showSaveOptions}
            onToggleSaveOptions={() => setShowSaveOptions((v) => !v)}
            onAddDraftGroup={addDraftGroup}
            onAddDieToDraft={addDieToDraft}
            onSelectDraftGroup={setSelectedDraftGroupId}
            onRenameDraftGroup={openRenameDraftGroupModal}
            onEditDraftGroupRule={openDraftGroupRuleEditor}
            onRemoveDraftGroup={removeDraftGroup}
            onEditDraftDie={openDraftEditor}
            onRemoveDraftDie={removeDraftDie}
            onRollDraft={rollDraft}
            onClearDraft={clearDraft}
            onReplaceCurrentTable={replaceCurrentTable}
            onCreateNewTable={openCreateTableModal}
            availableRules={availableRules}
          />
        ) : (
          <SavedProfilesSection
            profiles={profiles}
            results={results}
            rulesMap={rulesMap}
          />
        )}

        <RollModals
          draftGroups={draftGroups}
          editingDraftGroupId={editingDraftGroupId}
          editingDraftIndex={editingDraftIndex}
          draftEditSign={draftEditSign}
          draftEditSides={draftEditSides}
          draftEditQty={draftEditQty}
          draftEditModifier={draftEditModifier}
          draftEditRuleId={draftEditRuleId}
          pipelineRules={pipelineRules}
          legacyRules={legacyRules}
          onChangeSign={setDraftEditSign}
          onChangeSides={setDraftEditSides}
          onChangeQty={setDraftEditQty}
          onChangeModifier={setDraftEditModifier}
          onChangeRuleId={setDraftEditRuleId}
          onCancelDraftEditor={resetDraftEditorState}
          onSaveDraftEditor={saveDraftEditor}
          showDraftGroupRuleModal={showDraftGroupRuleModal}
          draftGroupRuleSelection={draftGroupRuleSelection}
          onSelectDraftGroupRule={setDraftGroupRuleSelection}
          onCancelDraftGroupRule={closeDraftGroupRuleModal}
          onSaveDraftGroupRule={saveDraftGroupRuleEditor}
          showRenameDraftGroupModal={showRenameDraftGroupModal}
          renameDraftGroupValue={renameDraftGroupValue}
          onChangeRenameDraftGroupValue={setRenameDraftGroupValue}
          onCancelRenameDraftGroup={closeRenameDraftGroupModal}
          onSaveRenameDraftGroup={saveRenameDraftGroup}
          showNameModal={showNameModal}
          newTableName={newTableName}
          onChangeNewTableName={setNewTableName}
          onCancelNewTable={closeCreateTableModal}
          onSaveNewTable={() => createNewTableFromName(newTableName)}
        />

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}