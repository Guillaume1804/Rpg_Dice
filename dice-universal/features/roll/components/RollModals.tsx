// app/roll/components/RollModals.tsx
import React from "react";
import { RenameDraftGroupModal } from "./RenameDraftGroupModal";
import { DraftGroupRuleModal } from "./DraftGroupRuleModal";
import { DraftDieEditorModal } from "./DraftDieEditorModal";
import { NewTableModal } from "./NewTableModal";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

type DraftDie = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
};

type DraftGroupState = {
  id: string;
  name: string;
  rule_id?: string | null;
  dice: DraftDie[];
};

type RollModalsProps = {
  draftGroups: DraftGroupState[];
  editingDraftGroupId: string | null;
  editingDraftIndex: number | null;
  draftEditSign: "1" | "-1";
  draftEditSides: string;
  draftEditQty: string;
  draftEditModifier: string;
  draftEditRuleId: string | null;
  pipelineRules: RuleRow[];
  legacyRules: RuleRow[];
  onChangeSign: (value: "1" | "-1") => void;
  onChangeSides: (value: string) => void;
  onChangeQty: (value: string) => void;
  onChangeModifier: (value: string) => void;
  onChangeRuleId: (value: string | null) => void;
  onCancelDraftEditor: () => void;
  onSaveDraftEditor: () => void;
  showDraftGroupRuleModal: boolean;
  draftGroupRuleSelection: string | null;
  onSelectDraftGroupRule: (value: string | null) => void;
  onCancelDraftGroupRule: () => void;
  onSaveDraftGroupRule: () => void;
  showRenameDraftGroupModal: boolean;
  renameDraftGroupValue: string;
  onChangeRenameDraftGroupValue: (value: string) => void;
  onCancelRenameDraftGroup: () => void;
  onSaveRenameDraftGroup: () => void;
  showNameModal: boolean;
  newTableName: string;
  onChangeNewTableName: (value: string) => void;
  onCancelNewTable: () => void;
  onSaveNewTable: () => void | Promise<void>;
};

export function RollModals({
  draftGroups,
  editingDraftGroupId,
  editingDraftIndex,
  draftEditSign,
  draftEditSides,
  draftEditQty,
  draftEditModifier,
  draftEditRuleId,
  pipelineRules,
  legacyRules,
  onChangeSign,
  onChangeSides,
  onChangeQty,
  onChangeModifier,
  onChangeRuleId,
  onCancelDraftEditor,
  onSaveDraftEditor,
  showDraftGroupRuleModal,
  draftGroupRuleSelection,
  onSelectDraftGroupRule,
  onCancelDraftGroupRule,
  onSaveDraftGroupRule,
  showRenameDraftGroupModal,
  renameDraftGroupValue,
  onChangeRenameDraftGroupValue,
  onCancelRenameDraftGroup,
  onSaveRenameDraftGroup,
  showNameModal,
  newTableName,
  onChangeNewTableName,
  onCancelNewTable,
  onSaveNewTable,
}: RollModalsProps) {
  const entryLabel =
    editingDraftGroupId != null && editingDraftIndex != null
      ? (() => {
          const group = draftGroups.find((g) => g.id === editingDraftGroupId);
          const die = group?.dice[editingDraftIndex];
          return die ? `${die.qty}d${die.sides}` : null;
        })()
      : null;

  return (
    <>
      <DraftDieEditorModal
        visible={editingDraftIndex !== null}
        entryLabel={entryLabel}
        draftEditSign={draftEditSign}
        draftEditSides={draftEditSides}
        draftEditQty={draftEditQty}
        draftEditModifier={draftEditModifier}
        draftEditRuleId={draftEditRuleId}
        pipelineRules={pipelineRules}
        legacyRules={legacyRules}
        onChangeSign={onChangeSign}
        onChangeSides={onChangeSides}
        onChangeQty={onChangeQty}
        onChangeModifier={onChangeModifier}
        onChangeRuleId={onChangeRuleId}
        onCancel={onCancelDraftEditor}
        onSave={onSaveDraftEditor}
      />

      <DraftGroupRuleModal
        visible={showDraftGroupRuleModal}
        selectedRuleId={draftGroupRuleSelection}
        pipelineRules={pipelineRules}
        legacyRules={legacyRules}
        onSelectRule={onSelectDraftGroupRule}
        onCancel={onCancelDraftGroupRule}
        onSave={onSaveDraftGroupRule}
      />

      <RenameDraftGroupModal
        visible={showRenameDraftGroupModal}
        value={renameDraftGroupValue}
        onChangeValue={onChangeRenameDraftGroupValue}
        onCancel={onCancelRenameDraftGroup}
        onSave={onSaveRenameDraftGroup}
      />

      <NewTableModal
        visible={showNameModal}
        value={newTableName}
        onChangeValue={onChangeNewTableName}
        onCancel={onCancelNewTable}
        onSave={onSaveNewTable}
      />
    </>
  );
}