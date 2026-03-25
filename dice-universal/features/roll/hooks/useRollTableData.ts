// useRollTableData.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Db } from "../../../data/db/database";
import type { TableRow } from "../../../data/repositories/tablesRepo";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type { GroupRow, GroupDieRow } from "../../../data/repositories/groupsRepo";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

import { getTableById } from "../../../data/repositories/tablesRepo";
import { listProfilesByTableId } from "../../../data/repositories/profilesRepo";
import { listGroupsByProfileId, listDiceByGroupId } from "../../../data/repositories/groupsRepo";
import { listRules, getRuleById } from "../../../data/repositories/rulesRepo";

export type ProfileWithGroups = {
  profile: ProfileRow;
  groups: {
    group: GroupRow;
    dice: GroupDieRow[];
  }[];
};

type UseRollTableDataParams = {
  db: Db;
  tableId: string;
};

export function useRollTableData({ db, tableId }: UseRollTableDataParams) {
  const [table, setTable] = useState<TableRow | null>(null);
  const [profiles, setProfiles] = useState<ProfileWithGroups[]>([]);
  const [rulesMap, setRulesMap] = useState<Record<string, RuleRow>>({});
  const [availableRules, setAvailableRules] = useState<RuleRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableRules = useCallback(async () => {
    const all = await listRules(db);
    setAvailableRules(all);
  }, [db]);

  const loadTableData = useCallback(async (tid: string) => {
    const t = await getTableById(db, tid);
    setTable(t);

    if (!t) {
      setProfiles([]);
      setRulesMap({});
      return;
    }

    const ps = await listProfilesByTableId(db, tid);
    const result: ProfileWithGroups[] = [];

    for (const p of ps) {
      const groups = await listGroupsByProfileId(db, p.id);
      const groupsWithDice: { group: GroupRow; dice: GroupDieRow[] }[] = [];

      for (const g of groups) {
        const dice = await listDiceByGroupId(db, g.id);
        groupsWithDice.push({ group: g, dice });
      }

      result.push({
        profile: p,
        groups: groupsWithDice,
      });
    }

    setProfiles(result);

    const ruleIds = new Set<string>();

    result.forEach((p) => {
      p.groups.forEach((g) => {
        if (g.group.rule_id) ruleIds.add(g.group.rule_id);
        g.dice.forEach((d) => {
          if (d.rule_id) ruleIds.add(d.rule_id);
        });
      });
    });

    const map: Record<string, RuleRow> = {};
    for (const id of ruleIds) {
      const rule = await getRuleById(db, id);
      if (rule) map[id] = rule;
    }

    setRulesMap(map);
  }, [db]);

  const reloadGroups = useCallback(async () => {
    if (!tableId) return;
    await loadTableData(tableId);
    await loadAvailableRules();
  }, [tableId, loadTableData, loadAvailableRules]);

  useEffect(() => {
    (async () => {
      try {
        setError(null);

        await loadAvailableRules();

        if (!tableId) {
          setTable(null);
          setProfiles([]);
          setRulesMap({});
          return;
        }

        await loadTableData(tableId);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, [tableId, loadAvailableRules, loadTableData]);

  const pipelineRules = useMemo(
    () => availableRules.filter((r) => r.kind === "pipeline"),
    [availableRules]
  );

  const legacyRules = useMemo(
    () => availableRules.filter((r) => r.kind !== "pipeline"),
    [availableRules]
  );

  return {
    table,
    profiles,
    rulesMap,
    availableRules,
    pipelineRules,
    legacyRules,
    error,
    reloadGroups,
  };
}