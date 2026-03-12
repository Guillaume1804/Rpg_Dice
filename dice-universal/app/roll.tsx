// app/roll.tsx
import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";

import { RenameDraftGroupModal } from "./roll/components/RenameDraftGroupModal";
import { DraftGroupRuleModal } from "./roll/components/DraftGroupRuleModal";
import { DraftDieEditorModal } from "./roll/components/DraftDieEditorModal";
import { QuickRollSection } from "./roll/components/QuickRollSection";
import { SavedProfilesSection } from "./roll/components/SavedProfilesSection";
import { NewTableModal } from "./roll/components/NewTableModal";
import { useDraftTableActions } from "./roll/hooks/useDraftTableActions";


import {
  useQuickRollDraft,
} from "./roll/hooks/useQuickRollDraft";

import { useRollTableData } from "./roll/hooks/useRollTableData";

import { GroupRollResult } from "../core/roll/roll";

export default function RollScreen() {
  const db = useDb();
  const { activeTableId, setActiveTableId } = useActiveTable();

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

  const pipelineRules = availableRules.filter((r) => r.kind === "pipeline");
  const legacyRules = availableRules.filter((r) => r.kind !== "pipeline");

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Jet — {table.name}</Text>

      <Pressable
        onPress={rollSavedTable}
        style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: "center" }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Lancer la table</Text>
      </Pressable>

      <ScrollView style={{ flex: 1 }}>
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

        <SavedProfilesSection
          profiles={profiles}
          results={results}
          rulesMap={rulesMap}
        />

        <DraftDieEditorModal
          visible={editingDraftIndex !== null}
          entryLabel={
            editingDraftGroupId != null && editingDraftIndex != null
              ? (() => {
                  const group = draftGroups.find((g) => g.id === editingDraftGroupId);
                  const die = group?.dice[editingDraftIndex];
                  return die ? `${die.qty}d${die.sides}` : null;
                })()
              : null
          }
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
          onCancel={resetDraftEditorState}
          onSave={saveDraftEditor}
        />
        
        <DraftGroupRuleModal
          visible={showDraftGroupRuleModal}
          selectedRuleId={draftGroupRuleSelection}
          pipelineRules={pipelineRules}
          legacyRules={legacyRules}
          onSelectRule={setDraftGroupRuleSelection}
          onCancel={closeDraftGroupRuleModal}
          onSave={saveDraftGroupRuleEditor}
        />
        
        <RenameDraftGroupModal
          visible={showRenameDraftGroupModal}
          value={renameDraftGroupValue}
          onChangeValue={setRenameDraftGroupValue}
          onCancel={closeRenameDraftGroupModal}
          onSave={saveRenameDraftGroup}
        />

        <NewTableModal
          visible={showNameModal}
          value={newTableName}
          onChangeValue={setNewTableName}
          onCancel={closeCreateTableModal}
          onSave={() => createNewTableFromName(newTableName)}
        />

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}