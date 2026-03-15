// app/rules/hooks/useRulesScreenActions.ts
import type { RuleRow } from "../../../data/repositories/rulesRepo";

type SaveRuleFn = (params: {
  editingRule: RuleRow | null;
  name: string;
  params_json: string;
}) => Promise<void>;

type RemoveRuleFn = (ruleId: string) => Promise<void>;

type UseRulesScreenActionsParams = {
  editingRule: RuleRow | null;
  formName: string;
  getParamsJson: () => string;
  saveRule: SaveRuleFn;
  removeRule: RemoveRuleFn;
  closeEditor: () => void;
};

export function useRulesScreenActions({
  editingRule,
  formName,
  getParamsJson,
  saveRule,
  removeRule,
  closeEditor,
}: UseRulesScreenActionsParams) {
  async function handleSave() {
    try {
      await saveRule({
        editingRule,
        name: formName,
        params_json: getParamsJson(),
      });

      closeEditor();
    } catch {
      // erreur déjà gérée dans useRulesData
    }
  }

  async function handleDeleteRule(ruleId: string) {
    try {
      await removeRule(ruleId);
    } catch {
      // erreur déjà gérée dans useRulesData
    }
  }

  return {
    handleSave,
    handleDeleteRule,
  };
}