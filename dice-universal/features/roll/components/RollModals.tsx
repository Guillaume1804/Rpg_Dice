// features/roll/components/RollModals.tsx
import React from "react";
import { RenameDraftGroupModal } from "./RenameDraftGroupModal";
import { DraftGroupRuleModal } from "./DraftGroupRuleModal";
import { DraftDieEditorModal } from "./DraftDieEditorModal";
import { SaveDraftModal } from "./SaveDraftModal";
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
  modernRules: RuleRow[];
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
  newProfileName: string;
  availableSaveTargets: {
    table: {
      id: string;
      name: string;
      is_system: number;
    };
    profiles: {
      id: string;
      name: string;
    }[];
  }[];
  loadingSaveTargets: boolean;
  onCancelNewTable: () => void;
  onSaveDraftTarget: (params: {
    mode:
    | "new_table_new_profile"
    | "existing_table_new_profile"
    | "existing_table_existing_profile";
    tableName?: string;
    profileName?: string;
    tableId?: string;
    profileId?: string;
  }) => void | Promise<void>;
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
  modernRules,
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
  newProfileName,
  availableSaveTargets,
  loadingSaveTargets,
  onCancelNewTable,
  onSaveDraftTarget,
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
        modernRules={modernRules}
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
        modernRules={modernRules}
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

      <SaveDraftModal
        visible={showNameModal}
        initialTableName={newTableName}
        initialProfileName={newProfileName}
        availableTargets={availableSaveTargets}
        loadingTargets={loadingSaveTargets}
        onCancel={onCancelNewTable}
        onConfirm={onSaveDraftTarget}
      />
    </>
  );
}