// RollScreen.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";

import { useDataRefresh } from "../data/state/DataRefreshProvider";

import { RollModals } from "../features/roll/components/RollModals";
import { QuickRollSection } from "../features/roll/components/QuickRollSection";
import { TableActionSection } from "../features/roll/components/TableActionSection";

import { useDraftTableActions } from "../features/roll/hooks/useDraftTableActions";
import { useRollExecution } from "../features/roll/hooks/useRollExecution";
import { useQuickRollDraft } from "../features/roll/hooks/useQuickRollDraft";
import { useRollTableData } from "../features/roll/hooks/useRollTableData";

import { GroupRollResult, rollGroup } from "../core/roll/roll";
import { evaluateRule } from "../core/rules/evaluate";

import { buildDraftTempRuleFromPreset } from "../features/roll/helpers/buildDraftTempRuleFromPreset";

import { QuickBehaviorConfigModal } from "../features/roll/components/QuickBehaviorConfigModal";
import { QuickQtyModal } from "../features/roll/components/QuickQtyModal";
import { QuickDieBehaviorPickerModal } from "../features/roll/components/QuickDieBehaviorPickerModal";
import { useQuickBehaviorConfigModal } from "../features/roll/hooks/useQuickBehaviorConfigModal";
import { useQuickQtyModal } from "../features/roll/hooks/useQuickQtyModal";
import { useQuickDieBehaviorPicker } from "../features/roll/hooks/useQuickDieBehaviorPicker";


export default function RollScreen() {
  type RollMode = "quick" | "table";
  const [mode, setMode] = useState<RollMode>("quick");

  const db = useDb();
  const { activeTableId, setActiveTableId } = useActiveTable();

  const [results, setResults] = useState<GroupRollResult[]>([]);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newProfileName, setNewProfileName] = useState("Profil principal");
  const [availableSaveTargets, setAvailableSaveTargets] = useState<
    {
      table: {
        id: string;
        name: string;
        is_system: number;
      };
      profiles: {
        id: string;
        name: string;
      }[];
    }[]
  >([]);
  const [loadingSaveTargets, setLoadingSaveTargets] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );

  const quickBehaviorConfig = useQuickBehaviorConfigModal();

  const [tableQuickSides, setTableQuickSides] = useState(20);
  const [tableQuickQty, setTableQuickQty] = useState(1);
  const [tableQuickModifier] = useState(0);
  const [tableQuickResult, setTableQuickResult] =
    useState<GroupRollResult | null>(null);

  const { revision } = useDataRefresh();

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
    modernRules,
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
    // addDieToDraft,
    addQuickStandardDie,
    addQuickPresetDie,
    // updateDraftDieQty,
    updateDraftDieEntry,
    adjustDraftDieQty,
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

    // applyTempRuleToSides,
    // clearTempRuleFromSides,
    // clearAllTempRules,

    // applyTempRuleToSelectedGroup,
    // clearTempRuleFromSelectedGroup,
  } = useQuickRollDraft({
    db,
    table,
    availableRules,
  });

  const quickDieBehaviorPicker = useQuickDieBehaviorPicker({
    addQuickPresetDie,
    quickBehaviorConfig,
  });

  const quickQtyModal = useQuickQtyModal({
    draftGroups,
    availableRules,
    adjustDraftDieQty,
    updateDraftDieEntry,
    replaceDraftDieWithQtySplit,
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
    // openCreateTableModal,
    createNewTableFromName,
    appendDraftToExistingTableNewProfile,
    appendDraftToExistingProfile,
    getAvailableSaveTargets,
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
      setShowNameModal(false);
      setShowSaveOptions(false);
      setNewTableName("");
      setNewProfileName("Profil principal");
      setAvailableSaveTargets([]);
      setLoadingSaveTargets(false);
    },
  });

  useEffect(() => {
    if (!tableId) return;

    reloadGroups();
  }, [revision, tableId, reloadGroups]);

  function handleClearQuickRoll() {
    clearDraft();
  }

  async function handleOpenSaveDraftModal() {
    const nonEmptyGroups = getNonEmptyDraftGroups();
    if (nonEmptyGroups.length === 0) return;

    setLoadingSaveTargets(true);

    try {
      const targets = await getAvailableSaveTargets();
      setAvailableSaveTargets(targets);
      setNewTableName(`Nouvelle table (${new Date().toLocaleDateString()})`);
      setNewProfileName("Profil principal");
      setShowSaveOptions(false);
      setShowNameModal(true);
    } finally {
      setLoadingSaveTargets(false);
    }
  }

  async function handleSaveDraftTarget(params: {
    mode:
    | "new_table_new_profile"
    | "existing_table_new_profile"
    | "existing_table_existing_profile";
    tableName?: string;
    profileName?: string;
    tableId?: string;
    profileId?: string;
  }) {
    if (params.mode === "new_table_new_profile") {
      await createNewTableFromName(
        params.tableName ?? "",
        params.profileName ?? "Profil principal",
      );
      return;
    }

    if (params.mode === "existing_table_new_profile") {
      if (!params.tableId) {
        throw new Error("Table cible manquante.");
      }

      await appendDraftToExistingTableNewProfile(
        params.tableId,
        params.profileName ?? "Profil principal",
      );
      return;
    }

    if (!params.tableId || !params.profileId) {
      throw new Error("Table ou profil cible manquant.");
    }

    await appendDraftToExistingProfile(params.tableId, params.profileId);
  }

  function handleConfirmBehaviorConfig() {
    if (
      !quickBehaviorConfig.pendingBehaviorKey ||
      quickDieBehaviorPicker.editingDieSides == null ||
      !quickBehaviorConfig.isValid()
    ) {
      return;
    }

    const tempRule = buildDraftTempRuleFromPreset({
      preset: {
        key: quickBehaviorConfig.pendingBehaviorKey,
        label: quickBehaviorConfig.pendingBehaviorLabel,
        scope: quickBehaviorConfig.pendingBehaviorScope,
        behaviorKey: quickBehaviorConfig.pendingBehaviorKey,
        defaultValues: quickBehaviorConfig.buildDefaultValues(),
      },
      sides: quickDieBehaviorPicker.editingDieSides,
      actionName: quickBehaviorConfig.pendingBehaviorLabel,
    });

    addQuickPresetDie(quickDieBehaviorPicker.editingDieSides, {
      scope: quickBehaviorConfig.pendingBehaviorScope,
      rule: tempRule,
    });

    quickBehaviorConfig.close();
    quickDieBehaviorPicker.close();
  }

  const hasActiveTable = !!table;

  const activeProfile =
    profiles.find((entry) => entry.profile.id === selectedProfileId)?.profile ??
    profiles[0]?.profile ??
    null;

  function handleAdjustTableQuickQty(delta: number) {
    setTableQuickQty((current) => Math.max(1, current + delta));
  }

  function handleRollTableQuickAction() {
    if (!activeProfile) return;

    const result = rollGroup({
      groupId: `table-quick-${activeProfile.id}`,
      label: `Jet rapide — ${activeProfile.name}`,
      entries: [
        {
          entryId: `table-quick-entry-${Date.now()}`,
          sides: tableQuickSides,
          qty: tableQuickQty,
          modifier: tableQuickModifier,
          sign: 1,
          rule: null,
        },
      ],
      groupRule: null,
      evaluateRule,
    });

    setTableQuickResult(result);
  }

  function handleSaveQuickRollAsAction() {
    // Temporaire : on reconnectera cette sauvegarde proprement ensuite.
    setMode("quick");
  }

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Erreur</Text>
        <Text style={{ marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

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
            activeProfile={activeProfile}
            tableQuickSides={tableQuickSides}
            tableQuickQty={tableQuickQty}
            tableQuickModifier={tableQuickModifier}
            tableQuickBehaviorLabel={null}
            tableQuickResult={tableQuickResult}
            onSelectTableQuickDie={setTableQuickSides}
            onAdjustTableQuickQty={handleAdjustTableQuickQty}
            onOpenTableQuickBehaviorPicker={() => { }}
            onRollTableQuickAction={handleRollTableQuickAction}
            onSaveQuickRollAsAction={handleSaveQuickRollAsAction}
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
            onOpenDieConfig={quickDieBehaviorPicker.open}
            onRemoveDraftDie={removeDraftDie}
            onRollDraft={rollDraft}
            onRollQuickGroup={rollSingleDraftGroup}
            onClearQuickGroup={clearDraftGroup}
            onClearDraft={handleClearQuickRoll}
            onReplaceCurrentTable={replaceCurrentTable}
            onCreateNewTable={handleOpenSaveDraftModal}
            availableRules={availableRules}
            onEditQuickDieQty={quickQtyModal.open}
            onAdjustQuickDieQty={quickQtyModal.adjust}
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
          modernRules={modernRules}
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
          newProfileName={newProfileName}
          availableSaveTargets={availableSaveTargets}
          loadingSaveTargets={loadingSaveTargets}
          onCancelNewTable={closeCreateTableModal}
          onSaveDraftTarget={handleSaveDraftTarget}
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

      <QuickDieBehaviorPickerModal
        visible={quickDieBehaviorPicker.visible}
        editingDieSides={quickDieBehaviorPicker.editingDieSides}
        behaviors={quickDieBehaviorPicker.behaviors}
        getDefinition={quickDieBehaviorPicker.getDefinition}
        onSelectBehavior={quickDieBehaviorPicker.select}
        onClose={quickDieBehaviorPicker.close}
      />

      <QuickBehaviorConfigModal
        visible={quickBehaviorConfig.visible}
        pendingBehaviorKey={quickBehaviorConfig.pendingBehaviorKey}
        pendingBehaviorLabel={quickBehaviorConfig.pendingBehaviorLabel}
        configKeepCount={quickBehaviorConfig.configKeepCount}
        configDropCount={quickBehaviorConfig.configDropCount}
        configResultMode={quickBehaviorConfig.configResultMode}
        configCompare={quickBehaviorConfig.configCompare}
        configSuccessThreshold={quickBehaviorConfig.configSuccessThreshold}
        configCritSuccessFaces={quickBehaviorConfig.configCritSuccessFaces}
        configCritFailureFaces={quickBehaviorConfig.configCritFailureFaces}
        configSuccessAtOrAbove={quickBehaviorConfig.configSuccessAtOrAbove}
        configFailFaces={quickBehaviorConfig.configFailFaces}
        configGlitchRule={quickBehaviorConfig.configGlitchRule}
        configRanges={quickBehaviorConfig.configRanges}
        onChangeKeepCount={quickBehaviorConfig.setConfigKeepCount}
        onChangeDropCount={quickBehaviorConfig.setConfigDropCount}
        onChangeResultMode={quickBehaviorConfig.setConfigResultMode}
        onChangeCompare={quickBehaviorConfig.setConfigCompare}
        onChangeSuccessThreshold={quickBehaviorConfig.setConfigSuccessThreshold}
        onChangeCritSuccessFaces={quickBehaviorConfig.setConfigCritSuccessFaces}
        onChangeCritFailureFaces={quickBehaviorConfig.setConfigCritFailureFaces}
        onChangeSuccessAtOrAbove={quickBehaviorConfig.setConfigSuccessAtOrAbove}
        onChangeFailFaces={quickBehaviorConfig.setConfigFailFaces}
        onChangeGlitchRule={quickBehaviorConfig.setConfigGlitchRule}
        onUpdateRange={quickBehaviorConfig.updateRange}
        onClose={quickBehaviorConfig.close}
        onConfirm={handleConfirmBehaviorConfig}
      />

      <QuickQtyModal
        visible={quickQtyModal.visible}
        qtyValue={quickQtyModal.qtyValue}
        modifierValue={quickQtyModal.modifierValue}
        onChangeQtyValue={quickQtyModal.setQtyValue}
        onChangeModifierValue={quickQtyModal.setModifierValue}
        onClose={quickQtyModal.close}
        onSave={quickQtyModal.save}
      />
    </View>
  );
}
