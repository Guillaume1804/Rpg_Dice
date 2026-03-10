// app/roll.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Modal } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";

import { getTableById, TableRow } from "../data/repositories/tablesRepo";
import {
  listGroupsByTableId,
  listDiceByGroupId,
  GroupRow,
  GroupDieRow,
} from "../data/repositories/groupsRepo";

import {
  replaceTableWithDraftGroups,
  createTableWithDraftGroups,
} from "../data/repositories/draftSaveRepo";

import { rollGroup, GroupRollResult } from "../core/roll/roll";
import { insertRollEvent } from "../data/repositories/rollEventsRepo";
import { newId } from "../core/types/ids";

import { evaluateRule } from "../core/rules/evaluate";
import { getRuleById, listRules, RuleRow } from "../data/repositories/rulesRepo";

type GroupWithDice = {
  group: GroupRow;
  dice: GroupDieRow[];
};

type DraftDie = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
};

type DraftGroupState = {
  id: string;
  name: string;
  rule_id?: string | null;
  dice: DraftDie[];
};

export default function RollScreen() {
  const db = useDb();
  const { activeTableId, setActiveTableId } = useActiveTable();

  const [table, setTable] = useState<TableRow | null>(null);
  const [groups, setGroups] = useState<GroupWithDice[]>([]);
  const [results, setResults] = useState<GroupRollResult[]>([]);

  const [draftGroups, setDraftGroups] = useState<DraftGroupState[]>([]);
  const [draftResults, setDraftResults] = useState<GroupRollResult[]>([]);
  const [selectedDraftGroupId, setSelectedDraftGroupId] = useState<string | null>(null);

  const [showRenameDraftGroupModal, setShowRenameDraftGroupModal] = useState(false);
  const [renamingDraftGroupId, setRenamingDraftGroupId] = useState<string | null>(null);
  const [renameDraftGroupValue, setRenameDraftGroupValue] = useState("");

  const [showDraftGroupRuleModal, setShowDraftGroupRuleModal] = useState(false);
  const [draftGroupRuleSelection, setDraftGroupRuleSelection] = useState<string | null>(null);

  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  const [rulesMap, setRulesMap] = useState<Record<string, RuleRow>>({});
  const [availableRules, setAvailableRules] = useState<RuleRow[]>([]);

  const [editingDraftGroupId, setEditingDraftGroupId] = useState<string | null>(null);
  const [editingDraftIndex, setEditingDraftIndex] = useState<number | null>(null);
  const [draftEditModifier, setDraftEditModifier] = useState("0");
  const [draftEditSign, setDraftEditSign] = useState<"1" | "-1">("1");
  const [draftEditRuleId, setDraftEditRuleId] = useState<string | null>(null);

  const [draftEditSides, setDraftEditSides] = useState("6");
  const [draftEditQty, setDraftEditQty] = useState("1");

  const [error, setError] = useState<string | null>(null);

  const STANDARD_DICE = [4, 6, 8, 10, 12, 20, 100];

  const tableId = useMemo(
    () => (typeof activeTableId === "string" && activeTableId.length > 0 ? activeTableId : ""),
    [activeTableId]
  );

  function nowIso() {
    return new Date().toISOString();
  }

  function getRuleName(rule: any | null) {
    return rule?.name ?? "Somme (par défaut)";
  }

  function getRuleNameFromId(ruleId: string | null | undefined) {
    if (!ruleId) return "Somme (par défaut)";
    return availableRules.find((r) => r.id === ruleId)?.name ?? "Règle introuvable";
  }

  function getSignLabel(sign?: number) {
    return (sign ?? 1) === -1 ? "-" : "+";
  }

  function formatRuleResult(res: any): string {
    if (!res) return "";

    if (res.kind === "sum") return `Somme = ${res.total}`;

    if (res.kind === "pipeline") {
      const outcome = res?.meta?.outcome != null ? ` | outcome: ${res.meta.outcome}` : "";
      return `Pipeline = ${res.final}${outcome}`;
    }

    if (res.kind === "d20") {
      if (res.outcome === "crit_success") return "Réussite critique";
      if (res.outcome === "crit_failure") return "Échec critique";
      if (res.threshold == null) return "Résultat";
      return res.outcome === "success" ? "Réussite" : "Échec";
    }

    if (res.kind === "pool") {
      const label =
        res.outcome === "crit_glitch"
          ? "Échec critique (glitch)"
          : res.outcome === "glitch"
          ? "Glitch"
          : res.outcome === "success"
          ? "Réussite"
          : "Échec";
      return `${label} — succès: ${res.successes} / ones: ${res.ones}`;
    }

    if (res.kind === "table_lookup") return res.label;
    if (res.kind === "unknown") return res.message;

    return "";
  }

  function createEmptyDraftGroup(name?: string): DraftGroupState {
    return {
      id: `draft-group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name ?? "Groupe rapide",
      rule_id: null,
      dice: [],
    };
  }

  function openRenameDraftGroupModal(groupId: string, currentName: string) {
    setRenamingDraftGroupId(groupId);
    setRenameDraftGroupValue(currentName);
    setShowRenameDraftGroupModal(true);
  }

  function saveRenameDraftGroup() {
    const name = renameDraftGroupValue.trim();
    if (!renamingDraftGroupId) return;
    if (!name) return;

    setDraftGroups((prev) =>
      prev.map((g) =>
        g.id === renamingDraftGroupId
          ? { ...g, name }
          : g
      )
    );

    setShowRenameDraftGroupModal(false);
    setRenamingDraftGroupId(null);
    setRenameDraftGroupValue("");
  }

  function closeRenameDraftGroupModal() {
    setShowRenameDraftGroupModal(false);
    setRenamingDraftGroupId(null);
    setRenameDraftGroupValue("");
  }

  async function loadTableData(tid: string) {
    const t = await getTableById(db, tid);
    setTable(t);

    if (!t) {
      setGroups([]);
      setRulesMap({});
      return;
    }

    const gs = await listGroupsByTableId(db, tid);
    const withDice: GroupWithDice[] = [];

    for (const g of gs) {
      const dice = await listDiceByGroupId(db, g.id);
      withDice.push({ group: g, dice });
    }

    setGroups(withDice);

    const ruleIds = new Set<string>();
    withDice.forEach((g) => {
      if (g.group.rule_id) ruleIds.add(g.group.rule_id);
      g.dice.forEach((d) => {
        if (d.rule_id) ruleIds.add(d.rule_id);
      });
    });

    const map: Record<string, RuleRow> = {};
    for (const id of ruleIds) {
      const rule = await getRuleById(db, id);
      if (rule) map[id] = rule;
    }

    setRulesMap(map);
  }

  async function loadAvailableRules() {
    const all = await listRules(db);
    setAvailableRules(all);
  }

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setResults([]);
        setDraftGroups([]);
        setDraftResults([]);
        setSelectedDraftGroupId(null);
        setDraftGroupRuleSelection(null);
        setShowSaveOptions(false);

        await loadAvailableRules();

        if (!tableId) {
          setTable(null);
          setGroups([]);
          setRulesMap({});
          return;
        }

        await loadTableData(tableId);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, [db, tableId]);

  async function reloadGroups(tid: string) {
    await loadTableData(tid);
    await loadAvailableRules();
  }

  async function onRoll() {
    if (!table) return;

    const rolled: GroupRollResult[] = groups.map(({ group, dice }) => {
      const groupRule = group.rule_id ? rulesMap[group.rule_id] : null;

      return rollGroup({
        groupId: group.id,
        label: group.name,
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

  function addDraftGroup() {
    const newGroup = createEmptyDraftGroup(`Groupe ${draftGroups.length + 1}`);
    setDraftGroups((prev) => [...prev, newGroup]);
    setSelectedDraftGroupId(newGroup.id);
    setDraftResults([]);
  }

  function addDieToDraft(sides: number) {
    setDraftGroups((prev) => {
      let next = [...prev];

      if (next.length === 0) {
        const newGroup = createEmptyDraftGroup("Groupe rapide");
        next = [newGroup];
        setSelectedDraftGroupId(newGroup.id);
      }

      const targetGroupId = selectedDraftGroupId ?? next[0].id;

      return next.map((group) =>
        group.id === targetGroupId
          ? {
              ...group,
              dice: [
                ...group.dice,
                {
                  sides,
                  qty: 1,
                  modifier: 0,
                  sign: 1,
                  rule_id: null,
                },
              ],
            }
          : group
      );
    });

    setDraftResults([]);
  }

  function removeDraftDie(groupId: string, index: number) {
    setDraftGroups((prev) => {
      const next = prev
        .map((group) =>
          group.id === groupId
            ? { ...group, dice: group.dice.filter((_, i) => i !== index) }
            : group
        )
        .filter((group) => group.dice.length > 0 || prev.length === 1);

      const cleaned = next.filter((group) => group.dice.length > 0);

      if (cleaned.length === 0) {
        setSelectedDraftGroupId(null);
        setDraftGroupRuleSelection(null);
        return [];
      }

      if (!cleaned.some((g) => g.id === selectedDraftGroupId)) {
        setSelectedDraftGroupId(cleaned[0].id);
      }

      return cleaned;
    });

    setDraftResults([]);
  }

  function removeDraftGroup(groupId: string) {
    setDraftGroups((prev) => {
      const next = prev.filter((group) => group.id !== groupId);

      if (next.length === 0) {
        setSelectedDraftGroupId(null);
        return [];
      }

      if (selectedDraftGroupId === groupId) {
        setSelectedDraftGroupId(next[0].id);
      }

      return next;
    });

    setDraftResults((prev) => prev.filter((r) => r.groupId !== groupId));

    if (editingDraftGroupId === groupId) {
      setEditingDraftGroupId(null);
      setEditingDraftIndex(null);
      setDraftEditModifier("0");
      setDraftEditSign("1");
      setDraftEditRuleId(null);
    }

    if (renamingDraftGroupId === groupId) {
      closeRenameDraftGroupModal();
    }

    if (showDraftGroupRuleModal && selectedDraftGroupId === groupId) {
      setShowDraftGroupRuleModal(false);
      setDraftGroupRuleSelection(null);
    }
  }

  function clearDraft() {
    setDraftGroups([]);
    setDraftResults([]);
    setSelectedDraftGroupId(null);

    setShowSaveOptions(false);
    setShowNameModal(false);
    setNewTableName("");

    setShowDraftGroupRuleModal(false);
    setDraftGroupRuleSelection(null);

    setEditingDraftGroupId(null);
    setEditingDraftIndex(null);
    setDraftEditModifier("0");
    setDraftEditSign("1");
    setDraftEditRuleId(null);

    setShowRenameDraftGroupModal(false);
    setRenamingDraftGroupId(null);
    setRenameDraftGroupValue("");

    setDraftEditSides("6");
    setDraftEditQty("1");
  }

  function openDraftEditor(groupId: string, index: number) {
    const group = draftGroups.find((g) => g.id === groupId);
    const d = group?.dice[index];
    if (!group || !d) return;

    setEditingDraftGroupId(groupId);
    setEditingDraftIndex(index);
    setDraftEditModifier(String(d.modifier ?? 0));
    setDraftEditSign(String(d.sign ?? 1) as "1" | "-1");
    setDraftEditRuleId(d.rule_id ?? null);
    setDraftEditSides(String(d.sides));
    setDraftEditQty(String(d.qty));
  }

  function saveDraftEditor() {
    if (editingDraftGroupId == null || editingDraftIndex == null) return;

    const sides = Number(draftEditSides || "0");
    const qty = Number(draftEditQty || "0");
    const modifier = Number(draftEditModifier || "0");
    const sign = Number(draftEditSign || "1");

    if (!Number.isFinite(sides) || sides <= 0) return;
    if (!Number.isFinite(qty) || qty <= 0) return;

    setDraftGroups((prev) =>
      prev.map((group) =>
        group.id === editingDraftGroupId
          ? {
              ...group,
              dice: group.dice.map((d, i) =>
                i === editingDraftIndex
                  ? {
                      ...d,
                      sides,
                      qty,
                      modifier: Number.isFinite(modifier) ? modifier : 0,
                      sign: sign === -1 ? -1 : 1,
                      rule_id: draftEditRuleId ?? null,
                    }
                  : d
              ),
            }
          : group
      )
    );

    setEditingDraftGroupId(null);
    setEditingDraftIndex(null);
    setDraftEditSides("6");
    setDraftEditQty("1");
    setDraftEditModifier("0");
    setDraftEditSign("1");
    setDraftEditRuleId(null);
    setDraftResults([]);
  }

  function openDraftGroupRuleEditor(groupId: string) {
    const group = draftGroups.find((g) => g.id === groupId);
    if (!group) return;

    setSelectedDraftGroupId(groupId);
    setDraftGroupRuleSelection(group.rule_id ?? null);
    setShowDraftGroupRuleModal(true);
  }

  function saveDraftGroupRuleEditor() {
    if (!selectedDraftGroupId) return;

    setDraftGroups((prev) =>
      prev.map((group) =>
        group.id === selectedDraftGroupId
          ? { ...group, rule_id: draftGroupRuleSelection ?? null }
          : group
      )
    );

    setShowDraftGroupRuleModal(false);
    setDraftResults([]);
  }

  function getNonEmptyDraftGroups(): DraftGroupState[] {
    return draftGroups.filter((group) => group.dice.length > 0);
  }

  async function rollDraft() {
    const nonEmptyGroups = getNonEmptyDraftGroups();
    
    if (nonEmptyGroups.length === 0) return;
    if (!table) return;
    
    const rolled = nonEmptyGroups.map((group) => {
      const groupRule = group.rule_id
        ? availableRules.find((r) => r.id === group.rule_id)
        : null;
    
      return rollGroup({
        groupId: group.id,
        label: group.name,
        entries: group.dice.map((d, idx) => {
          const rule = d.rule_id ? availableRules.find((r) => r.id === d.rule_id) : null;
        
          return {
            entryId: `${group.id}-draft-${idx}`,
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
    });

    setDraftResults(rolled);

    try {
      const eventId = await newId();
      const createdAt = nowIso();

      const payload = {
        type: "draft_multi_groups",
        tableId: table.id,
        tableName: table.name,
        groups: rolled,
      };

      const summary = {
        title: `Jet rapide — ${table.name}`,
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
      console.warn("insertRollEvent (draft multi-groups) failed", e);
    }
  }

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Erreur</Text>
        <Text style={{ marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

  if (!tableId) {
    return (
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Jet</Text>
        <Text style={{ opacity: 0.7 }}>
          Aucune table active. Va dans “Mes tables” et sélectionne une table.
        </Text>
      </View>
    );
  }

  if (!table) {
    return (
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Jet</Text>
        <Text style={{ opacity: 0.7 }}>Table active introuvable (id: {tableId}).</Text>
      </View>
    );
  }

  const pipelineRules = availableRules.filter((r) => r.kind === "pipeline");
  const legacyRules = availableRules.filter((r) => r.kind !== "pipeline");

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Jet — {table.name}</Text>

      <Pressable
        onPress={onRoll}
        style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: "center" }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Lancer la table</Text>
      </Pressable>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ marginTop: 16, padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Jet rapide</Text>

          <View style={{ flexDirection: "row", marginTop: 10, flexWrap: "wrap" }}>
            <Pressable
              onPress={addDraftGroup}
              style={{
                padding: 10,
                borderWidth: 1,
                borderRadius: 8,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text>+ Groupe</Text>
            </Pressable>

            {STANDARD_DICE.map((s) => (
              <Pressable
                key={s}
                onPress={() => addDieToDraft(s)}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text>d{s}</Text>
              </Pressable>
            ))}
          </View>

          {draftGroups.length === 0 ? (
            <Text style={{ marginTop: 10, opacity: 0.7 }}>Draft : —</Text>
          ) : (
            <View style={{ marginTop: 10 }}>
              {draftGroups.map((group) => {
                const groupResult = draftResults.find((r) => r.groupId === group.id);
                const isSelected = selectedDraftGroupId === group.id;

                return (
                  <View
                    key={group.id}
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontWeight: "800" }}>
                      {group.name} {isSelected ? "• sélectionné" : ""}
                    </Text>

                    <Text style={{ marginTop: 4, opacity: 0.8 }}>
                      règle de groupe : {getRuleNameFromId(group.rule_id)}
                    </Text>

                    <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
                      <Pressable
                        onPress={() => setSelectedDraftGroupId(group.id)}
                        style={{
                          padding: 8,
                          borderWidth: 1,
                          borderRadius: 8,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text>Sélectionner</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => openRenameDraftGroupModal(group.id, group.name)}
                        style={{
                          padding: 8,
                          borderWidth: 1,
                          borderRadius: 8,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text>Renommer</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => openDraftGroupRuleEditor(group.id)}
                        style={{
                          padding: 8,
                          borderWidth: 1,
                          borderRadius: 8,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text>Règle groupe</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => removeDraftGroup(group.id)}
                        style={{
                          padding: 8,
                          borderWidth: 1,
                          borderRadius: 8,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text>Supprimer groupe</Text>
                      </Pressable>

                    </View>

                    {group.dice.length === 0 ? (
                      <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucune entrée.</Text>
                    ) : (
                      group.dice.map((d, index) => (
                        <View
                          key={`${group.id}-${index}`}
                          style={{
                            marginTop: 8,
                            padding: 10,
                            borderWidth: 1,
                            borderRadius: 10,
                          }}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            Entrée #{index + 1} — {d.qty}d{d.sides}
                          </Text>

                          <Text style={{ marginTop: 4, opacity: 0.8 }}>
                            signe : {getSignLabel(d.sign)} | mod : {d.modifier ?? 0}
                          </Text>

                          <Text style={{ marginTop: 4, opacity: 0.8 }}>
                            règle : {getRuleNameFromId(d.rule_id)}
                          </Text>

                          <View style={{ flexDirection: "row", marginTop: 8 }}>
                            <Pressable
                              onPress={() => openDraftEditor(group.id, index)}
                              style={{
                                padding: 8,
                                borderWidth: 1,
                                borderRadius: 8,
                                marginRight: 8,
                              }}
                            >
                              <Text>Configurer</Text>
                            </Pressable>

                            <Pressable
                              onPress={() => removeDraftDie(group.id, index)}
                              style={{ padding: 8, borderWidth: 1, borderRadius: 8 }}
                            >
                              <Text>Supprimer</Text>
                            </Pressable>
                          </View>
                        </View>
                      ))
                    )}

                    {groupResult ? (
                      <View style={{ marginTop: 10 }}>
                        {groupResult.entries.map((e) => (
                          <View
                            key={e.entryId}
                            style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1 }}
                          >
                            <Text style={{ fontWeight: "700" }}>
                              {e.qty}d{e.sides} | signe {getSignLabel(e.sign)} | mod {e.modifier}
                            </Text>

                            <Text style={{ marginTop: 4, opacity: 0.8 }}>
                              valeurs : [{e.signed_values.join(", ")}]
                            </Text>

                            <Text style={{ marginTop: 4, opacity: 0.8 }}>
                              règle : {getRuleName(e.rule)}
                            </Text>

                            {e.eval_result ? (
                              <Text style={{ marginTop: 4, opacity: 0.9 }}>
                                résultat règle : {formatRuleResult(e.eval_result)}
                              </Text>
                            ) : null}

                            <Text style={{ marginTop: 4, fontWeight: "700" }}>
                              entrée = {e.final_total}
                            </Text>
                          </View>
                        ))}

                        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1 }}>
                          <Text style={{ opacity: 0.8 }}>
                            Somme des entrées : {groupResult.entries_total}
                          </Text>

                          <Text style={{ marginTop: 4, opacity: 0.8 }}>
                            Règle de groupe :{" "}
                            {groupResult.group_rule
                              ? groupResult.group_rule.name
                              : "Somme (par défaut)"}
                            {groupResult.group_eval_result
                              ? ` → ${formatRuleResult(groupResult.group_eval_result)}`
                              : ""}
                          </Text>
                        </View>

                        <Text style={{ marginTop: 10, fontWeight: "900" }}>
                          Total groupe : {groupResult.total}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <Pressable
              onPress={rollDraft}
              style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 10 }}
            >
              <Text>Lancer draft</Text>
            </Pressable>

            <Pressable
              onPress={clearDraft}
              style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
            >
              <Text>Reset</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowSaveOptions((v) => !v)}
              style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginLeft: 10 }}
            >
              <Text>Enregistrer</Text>
            </Pressable>
          </View>

          {showSaveOptions ? (
            <View style={{ marginTop: 10, gap: 8 }}>
              <Text style={{ fontWeight: "700" }}>Enregistrer le draft</Text>

              <Pressable
                onPress={async () => {
                  if (!table) return;
                  if (table.is_system === 1) return;
                  const nonEmptyGroups = getNonEmptyDraftGroups();
                  if (nonEmptyGroups.length === 0) return;

                  await replaceTableWithDraftGroups(db, {
                    tableId: table.id,
                    groups: nonEmptyGroups.map((g) => ({
                      name: g.name,
                      rule_id: g.rule_id ?? null,
                      dice: g.dice.map((d) => ({
                        sides: d.sides,
                        qty: d.qty,
                        modifier: d.modifier ?? 0,
                        sign: d.sign ?? 1,
                        rule_id: d.rule_id ?? null,
                      })),
                    })),
                  });

                  await reloadGroups(table.id);
                  setShowSaveOptions(false);
                }}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  opacity: table.is_system === 1 ? 0.4 : 1,
                }}
              >
                <Text>Remplacer la table actuelle</Text>
                {table.is_system === 1 ? (
                  <Text style={{ opacity: 0.7, marginTop: 4 }}>
                    Table système : remplacement interdit
                  </Text>
                ) : null}
              </Pressable>

              <Pressable
                onPress={() => {
                  const nonEmptyGroups = getNonEmptyDraftGroups();
                  if (nonEmptyGroups.length === 0) return;
                  setNewTableName(`Nouvelle table (${new Date().toLocaleDateString()})`);
                  setShowSaveOptions(false);
                  setShowNameModal(true);
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
              >
                <Text>Créer une nouvelle table</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <Text style={{ fontWeight: "700", marginTop: 12 }}>Groupes de la table</Text>

        {groups.map(({ group }) => {
          const r = results.find((x) => x.groupId === group.id);

          return (
            <View
              key={group.id}
              style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 12 }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>{group.name}</Text>
              <Text style={{ marginTop: 4, opacity: 0.75 }}>
                règle de groupe :{" "}
                {group.rule_id
                  ? rulesMap[group.rule_id]?.name ?? "Règle inconnue"
                  : "Somme (par défaut)"}
              </Text>

              {!r ? (
                <Text style={{ marginTop: 8, opacity: 0.7 }}>
                  Pas encore de résultat (appuie sur Lancer).
                </Text>
              ) : (
                <View style={{ marginTop: 10 }}>
                  {r.entries.map((e) => {
                    const ruleName = e.rule?.name ?? "Somme";
                    const evalText = e.eval_result ? ` → ${formatRuleResult(e.eval_result)}` : "";

                    return (
                      <View
                        key={e.entryId}
                        style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1 }}
                      >
                        <Text style={{ fontWeight: "700" }}>
                          Entrée: {e.qty}d{e.sides} {e.sign === -1 ? "(-)" : "(+)"}
                          {e.modifier ? ` mod ${e.modifier >= 0 ? "+" : ""}${e.modifier}` : ""}
                        </Text>

                        <Text style={{ marginTop: 4, opacity: 0.8 }}>
                          valeurs: [{e.signed_values.join(", ")}]
                        </Text>

                        <Text style={{ marginTop: 2, opacity: 0.75 }}>
                          base {e.base_total} → total {e.total_with_modifier}
                        </Text>

                        <Text style={{ marginTop: 2, opacity: 0.75 }}>
                          règle entrée: {ruleName}
                          {evalText}
                        </Text>

                        <Text style={{ marginTop: 4, fontWeight: "800" }}>
                          final entrée: {e.final_total}
                        </Text>
                      </View>
                    );
                  })}

                  <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1 }}>
                    <Text style={{ opacity: 0.8 }}>Somme des entrées : {r.entries_total}</Text>

                    <Text style={{ marginTop: 4, opacity: 0.8 }}>
                      Règle de groupe :{" "}
                      {r.group_rule ? r.group_rule.name : "Somme (par défaut)"}
                      {r.group_eval_result
                        ? ` → ${formatRuleResult(r.group_eval_result)}`
                        : ""}
                    </Text>

                    <Text style={{ marginTop: 8, fontSize: 16, fontWeight: "900" }}>
                      Total groupe : {r.total}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <Modal
          visible={editingDraftIndex !== null}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setEditingDraftGroupId(null);
            setEditingDraftIndex(null);
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                maxHeight: "90%",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                Configurer l’entrée du draft
              </Text>

              {editingDraftGroupId != null && editingDraftIndex != null ? (() => {
                const group = draftGroups.find((g) => g.id === editingDraftGroupId);
                const die = group?.dice[editingDraftIndex];
                if (!group || !die) return null;

                return (
                  <Text style={{ marginTop: 8, opacity: 0.7 }}>
                    Entrée : {die.qty}d{die.sides}
                  </Text>
                );
              })() : null}

              <Text style={{ marginTop: 12 }}>Signe</Text>

              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <Pressable
                  onPress={() => setDraftEditSign("1")}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    marginRight: 8,
                    opacity: draftEditSign === "1" ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontWeight: draftEditSign === "1" ? "700" : "400" }}>+</Text>
                </Pressable>

                <Pressable
                  onPress={() => setDraftEditSign("-1")}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    opacity: draftEditSign === "-1" ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontWeight: draftEditSign === "-1" ? "700" : "400" }}>-</Text>
                </Pressable>
              </View>

              <Text style={{ marginTop: 12 }}>Faces</Text>
              <TextInput
                value={draftEditSides}
                onChangeText={setDraftEditSides}
                placeholder="6"
                keyboardType="numeric"
                style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Quantité</Text>
              <TextInput
                value={draftEditQty}
                onChangeText={setDraftEditQty}
                placeholder="1"
                keyboardType="numeric"
                style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Modificateur</Text>
              <TextInput
                value={draftEditModifier}
                onChangeText={setDraftEditModifier}
                placeholder="0"
                keyboardType="numeric"
                style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Règle</Text>

              <Pressable
                onPress={() => setDraftEditRuleId(null)}
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  opacity: draftEditRuleId === null ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: draftEditRuleId === null ? "700" : "400" }}>
                  Somme (par défaut)
                </Text>
              </Pressable>

              <ScrollView style={{ marginTop: 12, maxHeight: 260 }}>
                <Text style={{ fontWeight: "700" }}>Pipelines</Text>

                {pipelineRules.map((rule) => (
                  <Pressable
                    key={rule.id}
                    onPress={() => setDraftEditRuleId(rule.id)}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 8,
                      marginTop: 8,
                      opacity: draftEditRuleId === rule.id ? 1 : 0.7,
                    }}
                  >
                    <Text style={{ fontWeight: draftEditRuleId === rule.id ? "700" : "400" }}>
                      {rule.name}
                    </Text>
                    <Text style={{ marginTop: 2, opacity: 0.7, fontSize: 12 }}>
                      {rule.is_system === 1 ? "système" : "perso"}
                    </Text>
                  </Pressable>
                ))}

                {legacyRules.length > 0 ? (
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ fontWeight: "700" }}>Compatibilité</Text>
                    {legacyRules.map((rule) => (
                      <Pressable
                        key={rule.id}
                        onPress={() => setDraftEditRuleId(rule.id)}
                        style={{
                          padding: 10,
                          borderWidth: 1,
                          borderRadius: 8,
                          marginTop: 8,
                          opacity: draftEditRuleId === rule.id ? 1 : 0.65,
                        }}
                      >
                        <Text style={{ fontWeight: draftEditRuleId === rule.id ? "700" : "400" }}>
                          {rule.name}
                        </Text>
                        <Text style={{ marginTop: 2, opacity: 0.7, fontSize: 12 }}>
                          type: {rule.kind}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </ScrollView>

              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
                <Pressable
                  onPress={() => {
                    setEditingDraftGroupId(null);
                    setEditingDraftIndex(null);
                  }}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 10 }}
                >
                  <Text>Annuler</Text>
                </Pressable>

                <Pressable
                  onPress={saveDraftEditor}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
                >
                  <Text style={{ fontWeight: "700" }}>Sauvegarder</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showDraftGroupRuleModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDraftGroupRuleModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                maxHeight: "90%",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                Configurer la règle de groupe du draft
              </Text>

              <Pressable
                onPress={() => setDraftGroupRuleSelection(null)}
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  opacity: draftGroupRuleSelection === null ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: draftGroupRuleSelection === null ? "700" : "400" }}>
                  Somme (par défaut)
                </Text>
              </Pressable>

              <ScrollView style={{ marginTop: 12, maxHeight: 300 }}>
                <Text style={{ fontWeight: "700" }}>Pipelines</Text>

                {pipelineRules.map((rule) => (
                  <Pressable
                    key={rule.id}
                    onPress={() => setDraftGroupRuleSelection(rule.id)}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 8,
                      marginTop: 8,
                      opacity: draftGroupRuleSelection === rule.id ? 1 : 0.7,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: draftGroupRuleSelection === rule.id ? "700" : "400",
                      }}
                    >
                      {rule.name}
                    </Text>
                    <Text style={{ marginTop: 2, opacity: 0.7, fontSize: 12 }}>
                      {rule.is_system === 1 ? "système" : "perso"}
                    </Text>
                  </Pressable>
                ))}

                {legacyRules.length > 0 ? (
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ fontWeight: "700" }}>Compatibilité</Text>
                    {legacyRules.map((rule) => (
                      <Pressable
                        key={rule.id}
                        onPress={() => setDraftGroupRuleSelection(rule.id)}
                        style={{
                          padding: 10,
                          borderWidth: 1,
                          borderRadius: 8,
                          marginTop: 8,
                          opacity: draftGroupRuleSelection === rule.id ? 1 : 0.65,
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: draftGroupRuleSelection === rule.id ? "700" : "400",
                          }}
                        >
                          {rule.name}
                        </Text>
                        <Text style={{ marginTop: 2, opacity: 0.7, fontSize: 12 }}>
                          type: {rule.kind}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </ScrollView>

              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
                <Pressable
                  onPress={() => setShowDraftGroupRuleModal(false)}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 10 }}
                >
                  <Text>Annuler</Text>
                </Pressable>

                <Pressable
                  onPress={saveDraftGroupRuleEditor}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
                >
                  <Text style={{ fontWeight: "700" }}>Sauvegarder</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showNameModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNameModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>Nom de la nouvelle table</Text>

              <TextInput
                value={newTableName}
                onChangeText={setNewTableName}
                placeholder="Ex: Donjons & Dragons — Mage"
                style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <View
                style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 }}
              >
                <Pressable
                  onPress={() => {
                    setShowNameModal(false);
                    setNewTableName("");
                  }}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>Annuler</Text>
                </Pressable>

                <Pressable
                  onPress={async () => {
                    const name = newTableName.trim();
                    if (!name) return;
                                    
                    const nonEmptyGroups = getNonEmptyDraftGroups();
                    if (nonEmptyGroups.length === 0) return;
                                    
                    const newTableId = await createTableWithDraftGroups(db, {
                      name,
                      groups: nonEmptyGroups.map((g) => ({
                        name: g.name,
                        rule_id: g.rule_id ?? null,
                        dice: g.dice.map((d) => ({
                          sides: d.sides,
                          qty: d.qty,
                          modifier: d.modifier ?? 0,
                          sign: d.sign ?? 1,
                          rule_id: d.rule_id ?? null,
                        })),
                      })),
                    });

                    await setActiveTableId(newTableId);

                    setShowNameModal(false);
                    setNewTableName("");
                    setDraftGroups([]);
                    setDraftResults([]);
                    setSelectedDraftGroupId(null);
                    setDraftGroupRuleSelection(null);
                  }}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text style={{ fontWeight: "700" }}>Créer</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showRenameDraftGroupModal}
          transparent
          animationType="fade"
          onRequestClose={closeRenameDraftGroupModal}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                Renommer le groupe draft
              </Text>
            
              <TextInput
                value={renameDraftGroupValue}
                onChangeText={setRenameDraftGroupValue}
                placeholder="Ex: Actions, Dégâts, Localisation..."
                style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
                <Pressable
                  onPress={closeRenameDraftGroupModal}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
                >
                  <Text>Annuler</Text>
                </Pressable>
            
                <Pressable
                  onPress={saveRenameDraftGroup}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text style={{ fontWeight: "700" }}>Sauvegarder</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}