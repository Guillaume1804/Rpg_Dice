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
  deleteAllGroupsForTable,
  createGroupFromDraft,
  createTableWithDraft,
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

export default function RollScreen() {
  const db = useDb();
  const { activeTableId, setActiveTableId } = useActiveTable();

  const [table, setTable] = useState<TableRow | null>(null);
  const [groups, setGroups] = useState<GroupWithDice[]>([]);
  const [results, setResults] = useState<GroupRollResult[]>([]);

  const [draftDice, setDraftDice] = useState<DraftDie[]>([]);
  const [draftResult, setDraftResult] = useState<GroupRollResult | null>(null);

  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  const [rulesMap, setRulesMap] = useState<Record<string, any>>({});
  const [availableRules, setAvailableRules] = useState<RuleRow[]>([]);

  const [editingDraftIndex, setEditingDraftIndex] = useState<number | null>(null);
  const [draftEditModifier, setDraftEditModifier] = useState("0");
  const [draftEditSign, setDraftEditSign] = useState<"1" | "-1">("1");
  const [draftEditRuleId, setDraftEditRuleId] = useState<string | null>(null);

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

    if (res.kind === "sum") {
      return `Somme = ${res.total}`;
    }

    if (res.kind === "d20") {
      if (res.outcome === "crit_success") return `Réussite critique (final ${res.final})`;
      if (res.outcome === "crit_failure") return `Échec critique (final ${res.final})`;
      if (res.threshold == null) return `Résultat (final ${res.final})`;
      return res.outcome === "success"
        ? `Réussite (final ${res.final})`
        : `Échec (final ${res.final})`;
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

    if (res.kind === "table_lookup") {
      return `${res.label} (valeur ${res.value})`;
    }

    if (res.kind === "pipeline") {
      const outcome = res.meta?.outcome ? ` | état: ${res.meta.outcome}` : "";
      const successes =
        typeof res.meta?.successes === "number" ? ` | succès: ${res.meta.successes}` : "";
      const lookup =
        res.meta?.lookup?.label != null ? ` | lookup: ${res.meta.lookup.label}` : "";
      return `Pipeline → final ${res.final}${outcome}${successes}${lookup}`;
    }

    if (res.kind === "unknown") {
      return res.message;
    }

    return "";
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
    withDice.forEach((g) =>
      g.dice.forEach((d) => {
        if (d.rule_id) ruleIds.add(d.rule_id);
      })
    );

    const map: Record<string, any> = {};
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
        setDraftDice([]);
        setDraftResult(null);
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

    const rolled: GroupRollResult[] = groups.map(({ group, dice }) =>
      rollGroup({
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
        evaluateRule,
      })
    );

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

  function addDieToDraft(sides: number) {
    setDraftDice((prev) => [
      ...prev,
      {
        sides,
        qty: 1,
        modifier: 0,
        sign: 1,
        rule_id: null,
      },
    ]);
  }

  function removeDraftDie(index: number) {
    setDraftDice((prev) => prev.filter((_, i) => i !== index));
    setDraftResult(null);
  }

  function clearDraft() {
    setDraftDice([]);
    setDraftResult(null);
    setShowSaveOptions(false);
  }

  function openDraftEditor(index: number) {
    const d = draftDice[index];
    if (!d) return;

    setEditingDraftIndex(index);
    setDraftEditModifier(String(d.modifier ?? 0));
    setDraftEditSign(String(d.sign ?? 1) as "1" | "-1");
    setDraftEditRuleId(d.rule_id ?? null);
  }

  function saveDraftEditor() {
    if (editingDraftIndex == null) return;

    const modifier = Number(draftEditModifier || "0");
    const sign = Number(draftEditSign || "1");

    setDraftDice((prev) =>
      prev.map((d, i) =>
        i === editingDraftIndex
          ? {
              ...d,
              modifier: Number.isFinite(modifier) ? modifier : 0,
              sign: sign === -1 ? -1 : 1,
              rule_id: draftEditRuleId ?? null,
            }
          : d
      )
    );

    setEditingDraftIndex(null);
    setDraftEditModifier("0");
    setDraftEditSign("1");
    setDraftEditRuleId(null);
    setDraftResult(null);
  }

  async function rollDraft() {
    if (draftDice.length === 0) return;
    if (!table) return;

    const result = rollGroup({
      groupId: "draft",
      label: "Jet rapide",
      entries: draftDice.map((d, idx) => {
        const rule = d.rule_id ? availableRules.find((r) => r.id === d.rule_id) : null;

        return {
          entryId: `draft-${idx}`,
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
      evaluateRule,
    });

    setDraftResult(result);

    try {
      const eventId = await newId();
      const createdAt = nowIso();

      const payload = {
        type: "draft",
        tableId: table.id,
        tableName: table.name,
        result,
      };

      const summary = {
        title: `Jet rapide — ${table.name}`,
        lines: [`Total draft: ${result.total}`],
      };

      await insertRollEvent(db, {
        id: eventId,
        table_id: table.id,
        created_at: createdAt,
        payload_json: JSON.stringify(payload),
        summary_json: JSON.stringify(summary),
      });
    } catch (e) {
      console.warn("insertRollEvent (draft) failed", e);
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
        {/* Jet rapide */}
        <View style={{ marginTop: 16, padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Jet rapide</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
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

          {draftDice.length === 0 ? (
            <Text style={{ marginTop: 10, opacity: 0.7 }}>Draft : —</Text>
          ) : (
            <View style={{ marginTop: 10 }}>
              {draftDice.map((d, index) => (
                <View
                  key={`${d.sides}-${index}`}
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
                      onPress={() => openDraftEditor(index)}
                      style={{ padding: 8, borderWidth: 1, borderRadius: 8, marginRight: 8 }}
                    >
                      <Text>Configurer</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => removeDraftDie(index)}
                      style={{ padding: 8, borderWidth: 1, borderRadius: 8 }}
                    >
                      <Text>Supprimer</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
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

          {draftResult ? (
            <View style={{ marginTop: 10 }}>
              {draftResult.entries.map((e) => (
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

              <Text style={{ marginTop: 10, fontWeight: "900" }}>
                Total draft : {draftResult.total}
              </Text>
            </View>
          ) : null}

          {showSaveOptions ? (
            <View style={{ marginTop: 10, gap: 8 }}>
              <Text style={{ fontWeight: "700" }}>Enregistrer le draft</Text>

              <Pressable
                onPress={async () => {
                  if (!table) return;
                  if (table.is_system === 1) return;
                  if (draftDice.length === 0) return;

                  await deleteAllGroupsForTable(db, table.id);

                  await createGroupFromDraft(db, {
                    tableId: table.id,
                    groupName: "Groupe (depuis Jet rapide)",
                    draftDice: draftDice.map((d) => ({
                      sides: d.sides,
                      qty: d.qty,
                      modifier: d.modifier ?? 0,
                      sign: d.sign ?? 1,
                      rule_id: d.rule_id ?? null,
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
                  if (draftDice.length === 0) return;
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

        {/* Groupes */}
        <Text style={{ fontWeight: "700", marginTop: 12 }}>Groupes de la table</Text>

        {groups.map(({ group, dice }) => {
          const r = results.find((x) => x.groupId === group.id);

          return (
            <View
              key={group.id}
              style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 12 }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>{group.name}</Text>

              {!r ? (
                <View style={{ marginTop: 8 }}>
                  {dice.map((d) => {
                    const rule = d.rule_id ? rulesMap[d.rule_id] : null;

                    return (
                      <View
                        key={d.id}
                        style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1 }}
                      >
                        <Text style={{ fontWeight: "700" }}>
                          {d.qty}d{d.sides}
                        </Text>
                        <Text style={{ marginTop: 4, opacity: 0.75 }}>
                          signe : {getSignLabel(d.sign)} | mod : {d.modifier ?? 0}
                        </Text>
                        <Text style={{ marginTop: 4, opacity: 0.75 }}>
                          règle : {getRuleName(rule)}
                        </Text>
                      </View>
                    );
                  })}

                  <Text style={{ marginTop: 10, opacity: 0.7 }}>
                    Pas encore de résultat. Appuie sur “Lancer la table”.
                  </Text>
                </View>
              ) : (
                <View style={{ marginTop: 10 }}>
                  {r.entries.map((e) => {
                    const evalText = e.eval_result ? formatRuleResult(e.eval_result) : "";
                    const ruleName = getRuleName(e.rule);

                    return (
                      <View
                        key={e.entryId}
                        style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1 }}
                      >
                        <Text style={{ fontWeight: "700" }}>
                          {e.qty}d{e.sides}
                        </Text>

                        <Text style={{ marginTop: 4, opacity: 0.8 }}>
                          signe : {getSignLabel(e.sign)} | mod : {e.modifier}
                        </Text>

                        <Text style={{ marginTop: 4, opacity: 0.8 }}>
                          valeurs : [{e.signed_values.join(", ")}]
                        </Text>

                        <Text style={{ marginTop: 4, opacity: 0.8 }}>
                          règle : {ruleName}
                        </Text>

                        <Text style={{ marginTop: 4, opacity: 0.8 }}>
                          base {e.base_total} → total avec mod {e.total_with_modifier}
                        </Text>

                        {evalText ? (
                          <Text style={{ marginTop: 4, opacity: 0.9 }}>
                            résultat règle : {evalText}
                          </Text>
                        ) : null}

                        <Text style={{ marginTop: 6, fontWeight: "900" }}>
                          final entrée : {e.final_total}
                        </Text>
                      </View>
                    );
                  })}

                  <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "900" }}>
                    Total groupe : {r.total}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Modal config entrée draft */}
        <Modal
          visible={editingDraftIndex !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setEditingDraftIndex(null)}
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

              {editingDraftIndex != null && draftDice[editingDraftIndex] ? (
                <Text style={{ marginTop: 8, opacity: 0.7 }}>
                  Entrée : {draftDice[editingDraftIndex].qty}d{draftDice[editingDraftIndex].sides}
                </Text>
              ) : null}

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
                  onPress={() => setEditingDraftIndex(null)}
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

        {/* Modal création table depuis draft */}
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

              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
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
                    if (draftDice.length === 0) return;

                    const newTableId = await createTableWithDraft(db, {
                      name,
                      groupName: "Groupe (depuis Jet rapide)",
                      draftDice: draftDice.map((d) => ({
                        sides: d.sides,
                        qty: d.qty,
                        modifier: d.modifier ?? 0,
                        sign: d.sign ?? 1,
                        rule_id: d.rule_id ?? null,
                      })),
                    });

                    await setActiveTableId(newTableId);

                    setShowNameModal(false);
                    setNewTableName("");
                    setDraftDice([]);
                    setDraftResult(null);
                  }}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text style={{ fontWeight: "700" }}>Créer</Text>
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