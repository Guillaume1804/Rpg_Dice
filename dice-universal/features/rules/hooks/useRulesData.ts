import { useCallback, useEffect, useMemo, useState } from "react";
import type { Db } from "../../../data/db/database";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import {
  listRules,
  createRule,
  deleteRule,
  updateRule,
} from "../../../data/repositories/rulesRepo";

type UseRulesDataParams = {
  db: Db;
};

type SaveRuleParams = {
  editingRule: RuleRow | null;
  name: string;
  kind: string;
  params_json: string;
};

const MODERN_RULE_KINDS = new Set([
  "single_check",
  "success_pool",
  "table_lookup",
  "banded_sum",
  "highest_of_pool",
  "pipeline",
]);

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
    () => rules.filter((r) => r.is_system === 1),
    [rules],
  );

  const customRules = useMemo(
    () => rules.filter((r) => r.is_system !== 1),
    [rules],
  );

  const modernRules = useMemo(
    () => rules.filter((r) => MODERN_RULE_KINDS.has(r.kind)),
    [rules],
  );

  const legacyRules = useMemo(
    () => rules.filter((r) => !MODERN_RULE_KINDS.has(r.kind)),
    [rules],
  );

  const saveRule = useCallback(
    async ({ editingRule, name, kind, params_json }: SaveRuleParams) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      try {
        setError(null);

        if (editingRule) {
          await updateRule(db, editingRule.id, {
            name: trimmedName,
            kind,
            params_json,
          });
        } else {
          await createRule(db, {
            name: trimmedName,
            kind,
            params_json,
            is_system: 0,
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
    modernRules,
    legacyRules,
    saveRule,
    removeRule,
  };
}