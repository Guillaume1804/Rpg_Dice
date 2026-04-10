import { useCallback, useEffect, useMemo, useState } from "react";
import type { Db } from "../../../data/db/database";
import type { TableRow } from "../../../data/repositories/tablesRepo";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type { GroupRow, GroupDieRow } from "../../../data/repositories/groupsRepo";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

import { getTableById } from "../../../data/repositories/tablesRepo";
import { listProfilesByTableId } from "../../../data/repositories/profilesRepo";
import { listGroupsByProfileId, listDiceByGroupId } from "../../../data/repositories/groupsRepo";
import { listRules } from "../../../data/repositories/rulesRepo";

export type GroupWithDice = {
  group: GroupRow;
  dice: GroupDieRow[];
};

export type ProfileWithGroups = {
  profile: ProfileRow;
  groups: GroupWithDice[];
};

type UseTableDetailDataParams = {
  db: Db;
  tableId: string;
};

const MODERN_RULE_KINDS = new Set([
  "single_check",
  "success_pool",
  "table_lookup",
  "banded_sum",
  "highest_of_pool",
  "pipeline",
]);

export function useTableDetailData({ db, tableId }: UseTableDetailDataParams) {
  const [table, setTable] = useState<TableRow | null>(null);
  const [profiles, setProfiles] = useState<ProfileWithGroups[]>([]);
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tableId) return;

    try {
      setError(null);

      const t = await getTableById(db, tableId);
      setTable(t);

      if (!t) {
        setProfiles([]);
        setRules([]);
        return;
      }

      const profileRows = await listProfilesByTableId(db, tableId);
      const nextProfiles: ProfileWithGroups[] = [];

      for (const profile of profileRows) {
        const groupRows = await listGroupsByProfileId(db, profile.id);
        const groupsWithDice: GroupWithDice[] = [];

        for (const group of groupRows) {
          const dice = await listDiceByGroupId(db, group.id);
          groupsWithDice.push({ group, dice });
        }

        nextProfiles.push({
          profile,
          groups: groupsWithDice,
        });
      }

      setProfiles(nextProfiles);

      const allRules = await listRules(db);
      setRules(allRules);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }, [db, tableId]);

  useEffect(() => {
    load();
  }, [load]);

  const getRuleName = useCallback(
    (ruleId: string | null) => {
      if (!ruleId) return "Somme (par défaut)";
      return rules.find((r) => r.id === ruleId)?.name ?? "Somme (par défaut)";
    },
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

  return {
    table,
    profiles,
    rules,
    error,
    load,
    getRuleName,
    modernRules,
    legacyRules,
  };
}