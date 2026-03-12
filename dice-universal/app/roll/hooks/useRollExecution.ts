import { rollGroup, GroupRollResult } from "../../../core/roll/roll";
import { insertRollEvent } from "../../../data/repositories/rollEventsRepo";
import { newId } from "../../../core/types/ids";
import { evaluateRule } from "../../../core/rules/evaluate";

import type { Db } from "../../../data/db/database";
import type { TableRow } from "../../../data/repositories/tablesRepo";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type { GroupRow, GroupDieRow } from "../../../data/repositories/groupsRepo";

type ProfileWithGroups = {
  profile: ProfileRow;
  groups: {
    group: GroupRow;
    dice: GroupDieRow[];
  }[];
};

type Params = {
  db: Db;
  table: TableRow | null;
  profiles: ProfileWithGroups[];
  rulesMap: Record<string, RuleRow>;
  setResults: (results: GroupRollResult[]) => void;
};

function nowIso() {
  return new Date().toISOString();
}

export function useRollExecution({
  db,
  table,
  profiles,
  rulesMap,
  setResults,
}: Params) {
  async function rollSavedTable() {
    if (!table) return;

    const rolled: GroupRollResult[] = [];

    profiles.forEach((p) => {
      p.groups.forEach(({ group, dice }) => {
        const groupRule = group.rule_id ? rulesMap[group.rule_id] : null;

        const result = rollGroup({
          groupId: group.id,
          label: `${p.profile.name} — ${group.name}`,
          entries: dice.map((d) => {
            const rule = d.rule_id ? rulesMap[d.rule_id] : null;

            return {
              entryId: d.id,
              sides: d.sides,
              qty: d.qty,
              modifier: d.modifier ?? 0,
              sign: d.sign ?? 1,
              rule: rule
                ? {
                    id: rule.id,
                    name: rule.name,
                    kind: rule.kind,
                    params_json: rule.params_json,
                  }
                : null,
            };
          }),
          groupRule: groupRule
            ? {
                id: groupRule.id,
                name: groupRule.name,
                kind: groupRule.kind,
                params_json: groupRule.params_json,
              }
            : null,
          evaluateRule,
        });

        rolled.push(result);
      });
    });

    setResults(rolled);

    try {
      const eventId = await newId();
      const createdAt = nowIso();

      const payload = {
        type: "groups",
        tableId: table.id,
        tableName: table.name,
        groups: rolled,
      };

      const summary = {
        title: `Jet — ${table.name}`,
        lines: rolled.map((r) => `${r.label}: total ${r.total}`),
      };

      await insertRollEvent(db, {
        id: eventId,
        table_id: table.id,
        created_at: createdAt,
        payload_json: JSON.stringify(payload),
        summary_json: JSON.stringify(summary),
      });
    } catch (e) {
      console.warn("insertRollEvent (groups) failed", e);
    }
  }

  return {
    rollSavedTable,
  };
}