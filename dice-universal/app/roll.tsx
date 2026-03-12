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

import {
  useQuickRollDraft,
} from "./roll/hooks/useQuickRollDraft";

import { useRollTableData } from "./roll/hooks/useRollTableData";

import {
  replaceTableWithDraftGroups,
  createTableWithDraftGroups,
} from "../data/repositories/draftSaveRepo";

import { rollGroup, GroupRollResult } from "../core/roll/roll";
import { insertRollEvent } from "../data/repositories/rollEventsRepo";
import { newId } from "../core/types/ids";

import { evaluateRule } from "../core/rules/evaluate";

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

  function nowIso() {
    return new Date().toISOString();
  }

  async function onRoll() {
    if (!table) return;

    const rolled: GroupRollResult[] = [];

    profiles.forEach((p) => {
      p.groups.forEach(({ group, dice }) => {
        const groupRule = group.rule_id ? rulesMap[group.rule_id] : null;

        const r = rollGroup({
          groupId: group.id,
          label: `${p.profile.name} — ${group.name}`,
          entries: dice.map((d) => {
            const rule = d.rule_id ? rulesMap[d.rule_id] : null;

            return {
              entryId: d.id,
              sides: d.sides,
              qty: d.qty,
              modifier: d.modifier ?? 0,
              sign: d.sign ?? 1,
              rule: rule
                ? {
                    id: rule.id,
                    name: rule.name,
                    kind: rule.kind,
                    params_json: rule.params_json,
                  }
                : null,
            };
          }),
          groupRule: groupRule
            ? {
                id: groupRule.id,
                name: groupRule.name,
                kind: groupRule.kind,
                params_json: groupRule.params_json,
              }
            : null,
          evaluateRule,
        });

        rolled.push(r);
      });
    });

    setResults(rolled);

    try {
      const eventId = await newId();
      const createdAt = nowIso();

      const payload = {
        type: "groups",
        tableId: table.id,
        tableName: table.name,
        groups: rolled,
      };

      const summary = {
        title: `Jet — ${table.name}`,
        lines: rolled.map((r) => `${r.label}: total ${r.total}`),
      };

      await insertRollEvent(db, {
        id: eventId,
        table_id: table.id,
        created_at: createdAt,
        payload_json: JSON.stringify(payload),
        summary_json: JSON.stringify(summary),
      });
    } catch (e) {
      console.warn("insertRollEvent (groups) failed", e);
    }
  }

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
        onPress={onRoll}
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
          onReplaceCurrentTable={async () => {
            if (!table) return;
            if (table.is_system === 1) return;
          
            const nonEmptyGroups = getNonEmptyDraftGroups();
            if (nonEmptyGroups.length === 0) return;
          
            await replaceTableWithDraftGroups(db, {
              tableId: table.id,
              groups: nonEmptyGroups.map((g) => ({
                name: g.name,
                rule_id: g.rule_id ?? null,
                dice: g.dice.map((d) => ({
                  sides: d.sides,
                  qty: d.qty,
                  modifier: d.modifier ?? 0,
                  sign: d.sign ?? 1,
                  rule_id: d.rule_id ?? null,
                })),
              })),
            });
          
            await reloadGroups();
            setShowSaveOptions(false);
          }}
          onCreateNewTable={() => {
            const nonEmptyGroups = getNonEmptyDraftGroups();
            if (nonEmptyGroups.length === 0) return;
          
            setNewTableName(`Nouvelle table (${new Date().toLocaleDateString()})`);
            setShowSaveOptions(false);
            setShowNameModal(true);
          }}
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
          onCancel={() => {
            setShowNameModal(false);
            setNewTableName("");
          }}
          onSave={async () => {
            const name = newTableName.trim();
            if (!name) return;
          
            const nonEmptyGroups = getNonEmptyDraftGroups();
            if (nonEmptyGroups.length === 0) return;
          
            const newTableId = await createTableWithDraftGroups(db, {
              name,
              groups: nonEmptyGroups.map((g) => ({
                name: g.name,
                rule_id: g.rule_id ?? null,
                dice: g.dice.map((d) => ({
                  sides: d.sides,
                  qty: d.qty,
                  modifier: d.modifier ?? 0,
                  sign: d.sign ?? 1,
                  rule_id: d.rule_id ?? null,
                })),
              })),
            });
          
            await setActiveTableId(newTableId);
          
            setShowNameModal(false);
            setNewTableName("");
            setDraftGroups([]);
            setDraftResults([]);
            setSelectedDraftGroupId(null);
            setDraftGroupRuleSelection(null);
          }}
        />

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}