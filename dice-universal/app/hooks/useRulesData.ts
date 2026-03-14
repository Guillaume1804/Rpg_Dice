import { useCallback, useEffect, useMemo, useState } from "react";
import type { Db } from "../../data/db/database";
import type { RuleRow } from "../../data/repositories/rulesRepo";
import {
  listRules,
  createRule,
  deleteRule,
  updateRule,
} from "../../data/repositories/rulesRepo";

type UseRulesDataParams = {
  db: Db;
};

type SaveRuleParams = {
  editingRule: RuleRow | null;
  name: string;
  params_json: string;
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

  const pipelineRules = useMemo(
    () => rules.filter((r) => r.kind === "pipeline"),
    [rules]
  );

  const legacyRules = useMemo(
    () => rules.filter((r) => r.kind !== "pipeline"),
    [rules]
  );

  const saveRule = useCallback(
    async ({ editingRule, name, params_json }: SaveRuleParams) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      try {
        setError(null);

        if (editingRule) {
          await updateRule(db, editingRule.id, {
            name: trimmedName,
            kind: "pipeline",
            params_json,
          });
        } else {
          await createRule(db, {
            name: trimmedName,
            kind: "pipeline",
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
    [db, load]
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
    [db, load]
  );

  return {
    rules,
    error,
    load,
    pipelineRules,
    legacyRules,
    saveRule,
    removeRule,
  };
}