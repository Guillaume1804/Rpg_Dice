// dice-universal\features\rules\hooks\useRulesData.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Db } from "../../../data/db/database";
import type {
  RuleRow,
  RuleScope,
  RuleUsageKind,
} from "../../../data/repositories/rulesRepo";
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
  supported_sides_json: string | null;
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

  const visibleTemplateRules = useMemo(
    () =>
      rules.filter(
        (rule) =>
          rule.usage_kind === "system_template" ||
          rule.usage_kind === "user_template",
      ),
    [rules],
  );

  const systemRules = useMemo(
    () =>
      visibleTemplateRules.filter(
        (rule) => rule.usage_kind === "system_template",
      ),
    [visibleTemplateRules],
  );

  const customRules = useMemo(
    () =>
      visibleTemplateRules.filter(
        (rule) => rule.usage_kind === "user_template",
      ),
    [visibleTemplateRules],
  );

  const generatedRules = useMemo(
    () => rules.filter((rule) => rule.usage_kind === "generated"),
    [rules],
  );

  const saveRule = useCallback(
    async ({ editingRule, payload }: SaveRuleParams) => {
      const trimmedName = payload.name.trim();
      if (!trimmedName) return;

      try {
        setError(null);

        const usageKind: RuleUsageKind =
          editingRule?.usage_kind === "system_template"
            ? "system_template"
            : "user_template";

        const supportedSidesJson = payload.supported_sides_json ?? "[]";

        if (editingRule) {
          await updateRule(db, editingRule.id, {
            name: trimmedName,
            kind: payload.kind,
            params_json: payload.params_json,
            supported_sides_json: supportedSidesJson,
            scope: payload.scope,
            usage_kind: usageKind,
          });
        } else {
          await createRule(db, {
            name: trimmedName,
            kind: payload.kind,
            params_json: payload.params_json,
            is_system: 0,
            supported_sides_json: supportedSidesJson,
            scope: payload.scope,
            usage_kind: "user_template",
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
    generatedRules,
    saveRule,
    removeRule,
  };
}
