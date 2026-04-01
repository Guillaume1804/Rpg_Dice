// RollScreen.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";

import { RollModals } from "../features/roll/components/RollModals";
import { QuickRollSection } from "../features/roll/components/QuickRollSection";
import { TableActionSection } from "../features/roll/components/TableActionSection";

import { useDraftTableActions } from "../features/roll/hooks/useDraftTableActions";
import { useRollExecution } from "../features/roll/hooks/useRollExecution";
import { useQuickRollDraft } from "../features/roll/hooks/useQuickRollDraft";
import { useRollTableData } from "../features/roll/hooks/useRollTableData";

import { GroupRollResult } from "../core/roll/roll";
import { QUICK_RULE_PRESETS } from "../features/roll/config/quickRulePresets";

export default function RollScreen() {
  type RollMode = "quick" | "table";
  const [mode, setMode] = useState<RollMode>("quick");

  const db = useDb();
  const { activeTableId, setActiveTableId } = useActiveTable();

  const [results, setResults] = useState<GroupRollResult[]>([]);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [editingDieSides, setEditingDieSides] = useState<number | null>(null);
  const [showDieRuleModal, setShowDieRuleModal] = useState(false);

  const [showQuickQtyModal, setShowQuickQtyModal] = useState(false);
  const [editingQuickQtyGroupId, setEditingQuickQtyGroupId] = useState<string | null>(null);
  const [editingQuickQtyIndex, setEditingQuickQtyIndex] = useState<number | null>(null);
  const [quickQtyValue, setQuickQtyValue] = useState("");
  const [quickEntryModifierValue, setQuickEntryModifierValue] = useState("0");

  const STANDARD_DICE = [4, 6, 8, 10, 12, 20, 100];

  const tableId = useMemo(
    () =>
      typeof activeTableId === "string" && activeTableId.length > 0
        ? activeTableId
        : "",
    [activeTableId],
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

  useEffect(() => {
    if (profiles.length === 0) {
      setSelectedProfileId(null);
      return;
    }

    const exists = profiles.some((p) => p.profile.id === selectedProfileId);
    if (!exists) {
      setSelectedProfileId(profiles[0].profile.id);
    }
  }, [profiles, selectedProfileId]);

  useEffect(() => {
    if (!table) {
      setMode("quick");
    }
  }, [table]);

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
    addQuickStandardDie,
    addQuickPresetDie,
    updateDraftDieQty,
    updateDraftDieEntry,
    replaceDraftDieWithQtySplit,
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
    rollSingleDraftGroup,
    clearDraftGroup,

    applyTempRuleToSides,
    clearTempRuleFromSides,
    clearAllTempRules,

    applyTempRuleToSelectedGroup,
    clearTempRuleFromSelectedGroup,
  } = useQuickRollDraft({
    db,
    table,
    availableRules,
  });

  const { rollSavedTable, rollSavedProfile, rollSavedGroup } = useRollExecution(
    {
      db,
      table,
      profiles,
      rulesMap,
      setResults,
    },
  );

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
      setShowAdvanced(false);
    },
  });

  function handleClearQuickRoll() {
    clearDraft();
  }

  function handleOpenDieConfig(sides: number) {
    setEditingDieSides(sides);
    setShowDieRuleModal(true);
  }

  function handleOpenQuickQtyEditor(
    groupId: string,
    index: number,
    currentQty: number,
    currentModifier: number,
  ) {
    setEditingQuickQtyGroupId(groupId);
    setEditingQuickQtyIndex(index);
    setQuickQtyValue(String(currentQty));
    setQuickEntryModifierValue(String(currentModifier));
    setShowQuickQtyModal(true);
  }

  function handleCloseQuickQtyEditor() {
    setShowQuickQtyModal(false);
    setEditingQuickQtyGroupId(null);
    setEditingQuickQtyIndex(null);
    setQuickQtyValue("");
    setQuickEntryModifierValue("0");
  }

  function handleAdjustQuickDieQty(
    groupId: string,
    index: number,
    delta: number,
  ) {
    const targetGroup = draftGroups.find((g) => g.id === groupId);
    const targetDie = targetGroup?.dice[index];

    if (!targetDie) return;

    const nextQty = Math.max(1, (targetDie.qty ?? 1) + delta);

    const isEntryScopedDie = !!targetDie.rule_temp || !!targetDie.rule_id;

    if (isEntryScopedDie) {
      replaceDraftDieWithQtySplit(groupId, index, nextQty, targetDie.modifier ?? 0);
    } else {
      updateDraftDieEntry(groupId, index, {
        qty: nextQty,
        modifier: targetDie.modifier ?? 0,
      });
    }
  }

  function handleSaveQuickQtyEditor() {
    if (editingQuickQtyGroupId == null || editingQuickQtyIndex == null) return;

    const qty = Number(quickQtyValue);
    const modifier = Number(quickEntryModifierValue);

    if (!Number.isFinite(qty) || qty <= 0) return;
    if (!Number.isFinite(modifier)) return;

    const targetGroup = draftGroups.find((g) => g.id === editingQuickQtyGroupId);
    const targetDie = targetGroup?.dice[editingQuickQtyIndex];

    if (!targetDie) return;

    const isEntryScopedDie = !!targetDie.rule_temp || !!targetDie.rule_id;

    if (isEntryScopedDie) {
      replaceDraftDieWithQtySplit(
        editingQuickQtyGroupId,
        editingQuickQtyIndex,
        qty,
        modifier,
      );

    } else {
      updateDraftDieEntry(editingQuickQtyGroupId, editingQuickQtyIndex, {
        qty,
        modifier,
      });
    }

    handleCloseQuickQtyEditor();
  }

  function makeTempRule(params: {
    name: string;
    kind: string;
    params: Record<string, unknown>;
  }) {
    return {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: params.name,
      kind: params.kind,
      params_json: JSON.stringify(params.params),
    };
  }

  const compatibleQuickRulePresets = useMemo(() => {
    if (editingDieSides == null) return [];

    return QUICK_RULE_PRESETS.filter(
      (preset) =>
        !preset.supportedSides ||
        preset.supportedSides.includes(editingDieSides),
    );
  }, [editingDieSides]);

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Erreur</Text>
        <Text style={{ marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

  const hasActiveTable = !!table;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {hasActiveTable ? (
          <View
            style={{
              padding: 14,
              borderWidth: 1,
              borderRadius: 14,
            }}
          >
            <Text style={{ opacity: 0.72 }}>Table active</Text>
            <Text style={{ marginTop: 4, fontSize: 24, fontWeight: "900" }}>
              {table.name}
            </Text>
          </View>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            marginTop: 12,
            borderWidth: 1,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <Pressable
            onPress={() => setMode("quick")}
            style={{
              flex: 1,
              padding: 10,
              alignItems: "center",
              backgroundColor: mode === "quick" ? "#ddd" : "transparent",
            }}
          >
            <Text style={{ fontWeight: "600" }}>⚡ Rapide</Text>
          </Pressable>

          <Pressable
            onPress={() => setMode("table")}
            disabled={!hasActiveTable}
            style={{
              flex: 1,
              padding: 10,
              alignItems: "center",
              opacity: hasActiveTable ? 1 : 0.3,
              backgroundColor: mode === "table" ? "#ddd" : "transparent",
            }}
          >
            <Text style={{ fontWeight: "600" }}>🎮 Table</Text>
          </Pressable>
        </View>

        {mode === "table" && hasActiveTable && (
          <TableActionSection
            profiles={profiles}
            selectedProfileId={selectedProfileId}
            results={results}
            onSelectProfile={setSelectedProfileId}
            onRollProfile={rollSavedProfile}
            onRollGroup={rollSavedGroup}
            onRollAll={rollSavedTable}
          />
        )}

        {mode === "quick" && (
          <QuickRollSection
            simplified={true}
            title={hasActiveTable ? "Jet libre" : "Jet"}
            standardDice={STANDARD_DICE}
            draftGroups={draftGroups}
            draftResults={draftResults}
            selectedDraftGroupId={selectedDraftGroupId}
            tableIsSystem={table?.is_system === 1}
            showSaveOptions={showSaveOptions}
            showAdvanced={showAdvanced}
            onToggleSaveOptions={() => setShowSaveOptions((v) => !v)}
            onToggleAdvanced={() => setShowAdvanced((v) => !v)}
            onAddDraftGroup={addDraftGroup}
            onAddQuickStandardDie={addQuickStandardDie}
            onSelectDraftGroup={setSelectedDraftGroupId}
            onRenameDraftGroup={openRenameDraftGroupModal}
            onEditDraftGroupRule={openDraftGroupRuleEditor}
            onRemoveDraftGroup={removeDraftGroup}
            onEditDraftDie={openDraftEditor}
            onOpenDieConfig={handleOpenDieConfig}
            onRemoveDraftDie={removeDraftDie}
            onRollDraft={rollDraft}
            onRollQuickGroup={rollSingleDraftGroup}
            onClearQuickGroup={clearDraftGroup}
            onClearDraft={handleClearQuickRoll}
            onReplaceCurrentTable={replaceCurrentTable}
            onCreateNewTable={openCreateTableModal}
            availableRules={availableRules}
            onEditQuickDieQty={handleOpenQuickQtyEditor}
            onAdjustQuickDieQty={handleAdjustQuickDieQty}
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
      </ScrollView>

      <Pressable
        onPress={() => setShowAdvanced((v) => !v)}
        style={{
          position: "absolute",
          right: 20,
          bottom: 90,
          width: 56,
          height: 56,
          borderWidth: 1,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "700", lineHeight: 30 }}>
          +
        </Text>
      </Pressable>

      {showDieRuleModal && editingDieSides !== null ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 14,
              padding: 16,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800" }}>
              Configurer d{editingDieSides}
            </Text>

            <Text style={{ opacity: 0.7 }}>
              Choisis un preset de règle compatible avec ce dé.
            </Text>

            {compatibleQuickRulePresets.length === 0 ? (
              <Text style={{ opacity: 0.7 }}>
                Aucun preset disponible pour ce dé.
              </Text>
            ) : (
              compatibleQuickRulePresets.map((preset) => (
                <Pressable
                  key={preset.key}
                  onPress={() => {
                    if (editingDieSides == null) return;

                    const built = preset.buildRule(editingDieSides);
                    const rule = makeTempRule({
                      name: built.name,
                      kind: built.kind,
                      params: built.params,
                    });

                    addQuickPresetDie(editingDieSides, {
                      scope: preset.scope,
                      rule,
                    });

                    setShowDieRuleModal(false);
                    setEditingDieSides(null);
                  }}
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: 10,
                    gap: 4,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>{preset.label}</Text>
                  {preset.description ? (
                    <Text style={{ opacity: 0.7 }}>{preset.description}</Text>
                  ) : null}
                </Pressable>
              ))
            )}

            <Pressable
              onPress={() => {
                setShowDieRuleModal(false);
                setEditingDieSides(null);
              }}
              style={{
                marginTop: 4,
                alignItems: "center",
              }}
            >
              <Text style={{ opacity: 0.6 }}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {showQuickQtyModal ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 14,
              padding: 16,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800" }}>
              Modifier la quantité
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Saisis le nombre de dés voulu.
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={quickQtyValue}
                onChangeText={setQuickQtyValue}
                keyboardType="number-pad"
                placeholder="Quantité"
                style={{ fontSize: 16 }}
              />
            </View>

            <Text style={{ opacity: 0.72 }}>
              Modificateur appliqué à cette entrée uniquement.
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={quickEntryModifierValue}
                onChangeText={setQuickEntryModifierValue}
                keyboardType="numbers-and-punctuation"
                placeholder="Modificateur"
                style={{ fontSize: 16 }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Pressable
                onPress={handleCloseQuickQtyEditor}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveQuickQtyEditor}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Valider</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
