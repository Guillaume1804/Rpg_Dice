// RollScreen.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
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
  const [quickModifier, setQuickModifier] = useState(0);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [editingDieSides, setEditingDieSides] = useState<number | null>(null);
  const [showDieRuleModal, setShowDieRuleModal] = useState(false);
  const [quickDiePresets, setQuickDiePresets] = useState<
    Record<
      number,
      {
        scope: "entry" | "group";
        rule: {
          id: string;
          name: string;
          kind: string;
          params_json: string;
        };
      }
    >
  >({});

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
    setQuickModifier(0);
  }

  function handleOpenDieConfig(sides: number) {
    setEditingDieSides(sides);
    setShowDieRuleModal(true);
  }

  function handleResetConfiguredDice() {
    setQuickDiePresets({});
    clearAllTempRules();
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
            quickModifier={quickModifier}
            onIncreaseModifier={() => setQuickModifier((prev) => prev + 1)}
            onDecreaseModifier={() => setQuickModifier((prev) => prev - 1)}
            onToggleSaveOptions={() => setShowSaveOptions((v) => !v)}
            onToggleAdvanced={() => setShowAdvanced((v) => !v)}
            onAddDraftGroup={addDraftGroup}
            onAddDieToDraft={(sides) => {
              const preset = quickDiePresets[sides];
              addDieToDraft(sides, preset?.rule ?? null, {
                aggregate: preset?.scope !== "entry",
              });
            }}
            onSelectDraftGroup={setSelectedDraftGroupId}
            onRenameDraftGroup={openRenameDraftGroupModal}
            onEditDraftGroupRule={openDraftGroupRuleEditor}
            onRemoveDraftGroup={removeDraftGroup}
            onEditDraftDie={openDraftEditor}
            onOpenDieConfig={handleOpenDieConfig}
            onRemoveDraftDie={removeDraftDie}
            onRollDraft={rollDraft}
            onClearDraft={handleClearQuickRoll}
            onReplaceCurrentTable={replaceCurrentTable}
            onCreateNewTable={openCreateTableModal}
            availableRules={availableRules}
            quickDiePresets={quickDiePresets}
            onResetConfiguredDice={handleResetConfiguredDice}
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

                    setQuickDiePresets((prev) => ({
                      ...prev,
                      [editingDieSides]: {
                        scope: preset.scope,
                        rule,
                      },
                    }));

                    if (preset.scope === "group") {
                      addDieToDraft(editingDieSides, null, { aggregate: true });
                      applyTempRuleToSelectedGroup(rule);
                      clearTempRuleFromSides(editingDieSides);
                    } else {
                      addDieToDraft(editingDieSides, rule, { aggregate: false });
                      applyTempRuleToSides(editingDieSides, rule);
                      clearTempRuleFromSelectedGroup();
                    }

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
                if (editingDieSides != null) {
                  clearTempRuleFromSides(editingDieSides);
                  clearTempRuleFromSelectedGroup();

                  setQuickDiePresets((prev) => {
                    const next = { ...prev };
                    delete next[editingDieSides];
                    return next;
                  });
                }
                setShowDieRuleModal(false);
                setEditingDieSides(null);
              }}
              style={{
                padding: 12,
                borderWidth: 1,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "700" }}>
                Réinitialiser la règle de ce dé
              </Text>
            </Pressable>

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
    </View>
  );
}
