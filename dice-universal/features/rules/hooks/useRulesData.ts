import { useCallback, useEffect, useMemo, useState } from "react";
import type { Db } from "../../../data/db/database";
import type { RuleRow, RuleScope } from "../../../data/repositories/rulesRepo";
import {
  listRules,
  createRule,
  deleteRule,
  updateRule,
} from "../../../data/repositories/rulesRepo";

type UseRulesDataParams = {
  db: Db;
};

type SaveRulePayload = {
  name: string;
  kind: string;
  params_json: string;
  supported_sides_json: string;
  scope: RuleScope;
};

type SaveRuleParams = {
  editingRule: RuleRow | null;
  payload: SaveRulePayload;
};

export function useRulesData({ db }: UseRulesDataParams) {
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const all = await listRules(db);
      setRules(all);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }, [db]);

  useEffect(() => {
    load();
  }, [load]);

  const systemRules = useMemo(
    () => rules.filter((rule) => rule.is_system === 1),
    [rules],
  );

  const customRules = useMemo(
    () => rules.filter((rule) => rule.is_system !== 1),
    [rules],
  );

  const saveRule = useCallback(
    async ({ editingRule, payload }: SaveRuleParams) => {
      const trimmedName = payload.name.trim();
      if (!trimmedName) return;

      try {
        setError(null);

        if (editingRule) {
          await updateRule(db, editingRule.id, {
            name: trimmedName,
            kind: payload.kind,
            params_json: payload.params_json,
            supported_sides_json: payload.supported_sides_json,
            scope: payload.scope,
          });
        } else {
          await createRule(db, {
            name: trimmedName,
            kind: payload.kind,
            params_json: payload.params_json,
            is_system: 0,
            supported_sides_json: payload.supported_sides_json,
            scope: payload.scope,
          });
        }

        await load();
      } catch (e: any) {
        setError(e?.message ?? String(e));
        throw e;
      }
    },
    [db, load],
  );

  const removeRule = useCallback(
    async (ruleId: string) => {
      try {
        setError(null);
        await deleteRule(db, ruleId);
        await load();
      } catch (e: any) {
        setError(e?.message ?? String(e));
        throw e;
      }
    },
    [db, load],
  );

  return {
    rules,
    error,
    load,
    systemRules,
    customRules,
    saveRule,
    removeRule,
  };
}
