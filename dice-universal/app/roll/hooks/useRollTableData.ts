// app/roll/hooks/useRollTableData.ts
import { useEffect, useState } from "react";

import type { Db } from "../../../data/db/database";
import { getTableById, type TableRow } from "../../../data/repositories/tablesRepo";
import {
  listGroupsByProfileId,
  listDiceByGroupId,
  type GroupRow,
  type GroupDieRow,
} from "../../../data/repositories/groupsRepo";
import {
  listProfilesByTableId,
  type ProfileRow,
} from "../../../data/repositories/profilesRepo";
import {
  getRuleById,
  listRules,
  type RuleRow,
} from "../../../data/repositories/rulesRepo";

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

  async function loadAvailableRules() {
    const all = await listRules(db);
    setAvailableRules(all);
  }

  async function loadTableData(tid: string) {
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
  }

  async function reloadGroups() {
    if (!tableId) return;
    await loadTableData(tableId);
    await loadAvailableRules();
  }

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
  }, [db, tableId]);

  return {
    table,
    profiles,
    rulesMap,
    availableRules,
    error,
    reloadGroups,
  };
}