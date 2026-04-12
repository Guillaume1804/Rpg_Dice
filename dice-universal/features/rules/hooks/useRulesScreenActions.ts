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
};

export function useRulesScreenActions({
  editingRule,
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
        payload,
      });

      closeEditor();
    } catch {
      // erreur déjà gérée plus haut
    }
  }

  async function handleDeleteRule(ruleId: string) {
    try {
      await removeRule(ruleId);
    } catch {
      // erreur déjà gérée plus haut
    }
  }

  return {
    handleSave,
    handleDeleteRule,
  };
}
