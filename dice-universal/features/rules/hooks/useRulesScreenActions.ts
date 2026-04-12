import type { RuleRow, RuleScope } from "../../../data/repositories/rulesRepo";

type SaveRuleFn = (params: {
  editingRule: RuleRow | null;
  name: string;
  kind: string;
  params_json: string;
  supported_sides_json: string;
  scope: RuleScope;
}) => Promise<void>;

type RemoveRuleFn = (ruleId: string) => Promise<void>;

type UseRulesScreenActionsParams = {
  editingRule: RuleRow | null;
  formName: string;
  getRulePayload: () => {
    name: string;
    kind: string;
    params_json: string;
    supported_sides_json: string;
    scope: RuleScope;
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
        name: payload.name,
        kind: payload.kind,
        params_json: payload.params_json,
        supported_sides_json: payload.supported_sides_json,
        scope: payload.scope,
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
