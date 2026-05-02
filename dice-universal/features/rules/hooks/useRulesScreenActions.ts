// dice-universal/features/rules/hooks/useRulesScreenActions.ts

import type { RuleRow } from "../../../data/repositories/rulesRepo";

type RulePayload = {
  name: string;
  kind: string;
  params_json: string;
  supported_sides_json: string;
  scope: "entry" | "group" | "both";
};

type SaveRuleFn = (params: {
  editingRule: RuleRow | null;
  payload: RulePayload;
}) => Promise<void>;

type RemoveRuleFn = (ruleId: string) => Promise<void>;

type UseRulesScreenActionsParams = {
  editingRule: RuleRow | null;
  getRulePayload: () => RulePayload;
  saveRule: SaveRuleFn;
  removeRule: RemoveRuleFn;
  closeEditor: () => void;
  notifyDataChanged: () => void;
};

export function useRulesScreenActions({
  editingRule,
  getRulePayload,
  saveRule,
  removeRule,
  closeEditor,
  notifyDataChanged,
}: UseRulesScreenActionsParams) {
  async function handleSave() {
    try {
      const payload = getRulePayload();

      await saveRule({
        editingRule,
        payload,
      });

      closeEditor();
      notifyDataChanged();
    } catch {
      // erreur déjà gérée plus haut
    }
  }

  async function handleDeleteRule(ruleId: string) {
    try {
      await removeRule(ruleId);
      notifyDataChanged();
    } catch {
      // erreur déjà gérée plus haut
    }
  }

  return {
    handleSave,
    handleDeleteRule,
  };
}
