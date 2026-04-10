import type { RuleRow } from "../../../data/repositories/rulesRepo";

type SaveRuleFn = (params: {
  editingRule: RuleRow | null;
  name: string;
  kind: string;
  params_json: string;
}) => Promise<void>;

type RemoveRuleFn = (ruleId: string) => Promise<void>;

type UseRulesScreenActionsParams = {
  editingRule: RuleRow | null;
  formName: string;
  getRulePayload: () => {
    kind: string;
    params_json: string;
  };
  saveRule: SaveRuleFn;
  removeRule: RemoveRuleFn;
  closeEditor: () => void;
};

export function useRulesScreenActions({
  editingRule,
  formName,
  getRulePayload,
  saveRule,
  removeRule,
  closeEditor,
}: UseRulesScreenActionsParams) {
  async function handleSave() {
    try {
      const payload = getRulePayload();

      await saveRule({
        editingRule,
        name: formName,
        kind: payload.kind,
        params_json: payload.params_json,
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