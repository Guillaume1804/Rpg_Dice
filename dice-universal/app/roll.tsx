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

type SaveMode = "replace" | "create" | null;

export default function RollScreen() {
  const db = useDb();
  const { activeTableId, setActiveTableId } = useActiveTable();

  const [table, setTable] = useState<TableRow | null>(null);
  const [groups, setGroups] = useState<GroupWithDice[]>([]);
  const [results, setResults] = useState<GroupRollResult[]>([]);

  // Draft (jet rapide)
  const [draftDice, setDraftDice] = useState<DraftDie[]>([]);
  const [draftResult, setDraftResult] = useState<GroupRollResult | null>(null);

  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showDraftConfigModal, setShowDraftConfigModal] = useState(false);
  const [showRulePickerModal, setShowRulePickerModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);

  const [newTableName, setNewTableName] = useState("");
  const [draftGroupName, setDraftGroupName] = useState("Groupe (depuis Jet rapide)");

  const [draftEditingIndex, setDraftEditingIndex] = useState<number | null>(null);
  const [pendingSaveMode, setPendingSaveMode] = useState<SaveMode>(null);

  const [rulesMap, setRulesMap] = useState<Record<string, RuleRow>>({});
  const [availableRules, setAvailableRules] = useState<RuleRow[]>([]);

  const [error, setError] = useState<string | null>(null);

  const STANDARD_DICE = [4, 6, 8, 10, 12, 20, 100];

  const tableId = useMemo(
    () => (typeof activeTableId === "string" && activeTableId.length > 0 ? activeTableId : ""),
    [activeTableId]
  );

  function nowIso() {
    return new Date().toISOString();
  }

  function getRuleName(ruleId: string | null | undefined) {
    if (!ruleId) return "Somme (par défaut)";
    return rulesMap[ruleId]?.name ?? availableRules.find((r) => r.id === ruleId)?.name ?? "Règle inconnue";
  }

  function formatRuleResult(res: any): string {
    if (!res) return "";
    if (res.kind === "sum") return `Somme = ${res.total}`;

    if (res.kind === "pipeline") {
      const outcome = res?.meta?.outcome;
      if (outcome === "crit_success") return `Pipeline → réussite critique (final ${res.final})`;
      if (outcome === "crit_failure") return `Pipeline → échec critique (final ${res.final})`;
      if (outcome === "success") return `Pipeline → réussite (final ${res.final})`;
      if (outcome === "failure") return `Pipeline → échec (final ${res.final})`;
      return `Pipeline → final = ${res.final}`;
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

  function resetDraftUiOnly() {
    setShowSaveOptions(false);
    setShowDraftConfigModal(false);
    setShowRulePickerModal(false);
    setShowNameModal(false);
    setDraftEditingIndex(null);
    setPendingSaveMode(null);
    setDraftGroupName("Groupe (depuis Jet rapide)");
    setNewTableName("");
  }

  function clearDraft() {
    setDraftDice([]);
    setDraftResult(null);
    resetDraftUiOnly();
  }

  async function loadRulesAndBuildMap(groupList: GroupWithDice[]) {
    const allRules = await listRules(db);

    allRules.sort((a, b) => {
      const ap = a.kind === "pipeline" ? 0 : 1;
      const bp = b.kind === "pipeline" ? 0 : 1;
      if (ap !== bp) return ap - bp;
      if (a.is_system !== b.is_system) return b.is_system - a.is_system;
      return a.created_at.localeCompare(b.created_at);
    });

    setAvailableRules(allRules);

    const ruleIds = new Set<string>();
    groupList.forEach((g) =>
      g.dice.forEach((d) => {
        if (d.rule_id) ruleIds.add(d.rule_id);
      })
    );

    const map: Record<string, RuleRow> = {};
    for (const id of ruleIds) {
      const rule = await getRuleById(db, id);
      if (rule) map[id] = rule;
    }

    // on ajoute aussi toutes les règles disponibles au map pour l’UI draft
    allRules.forEach((r) => {
      map[r.id] = r;
    });

    setRulesMap(map);
  }

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setResults([]);
        setDraftDice([]);
        setDraftResult(null);
        resetDraftUiOnly();

        if (!tableId) {
          setTable(null);
          setGroups([]);
          setRulesMap({});
          setAvailableRules([]);
          return;
        }

        const t = await getTableById(db, tableId);
        setTable(t);

        if (!t) {
          setGroups([]);
          setRulesMap({});
          setAvailableRules([]);
          return;
        }

        const gs = await listGroupsByTableId(db, tableId);
        const withDice: GroupWithDice[] = [];
        for (const g of gs) {
          const dice = await listDiceByGroupId(db, g.id);
          withDice.push({ group: g, dice });
        }
        setGroups(withDice);

        await loadRulesAndBuildMap(withDice);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, [db, tableId]);

  async function reloadGroups(tid: string) {
    const gs = await listGroupsByTableId(db, tid);
    const withDice: GroupWithDice[] = [];
    for (const g of gs) {
      const dice = await listDiceByGroupId(db, g.id);
      withDice.push({ group: g, dice });
    }
    setGroups(withDice);
    await loadRulesAndBuildMap(withDice);
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
              ? { id: rule.id, name: rule.name, kind: rule.kind, params_json: rule.params_json }
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
    setDraftDice((prev) => {
      const existing = prev.find(
        (d) =>
          d.sides === sides &&
          (d.sign ?? 1) === 1 &&
          (d.modifier ?? 0) === 0 &&
          (d.rule_id ?? null) === null
      );

      if (existing) {
        return prev.map((d) => (d === existing ? { ...d, qty: d.qty + 1 } : d));
      }

      return [...prev, { sides, qty: 1, sign: 1, modifier: 0, rule_id: null }];
    });
  }

  function updateDraftDie(index: number, patch: Partial<DraftDie>) {
    setDraftDice((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function removeDraftDie(index: number) {
    setDraftDice((prev) => prev.filter((_, i) => i !== index));
    if (draftEditingIndex === index) {
      setDraftEditingIndex(null);
      setShowRulePickerModal(false);
    }
  }

  function duplicateRuleToAllDraftDice(ruleId: string | null) {
    setDraftDice((prev) => prev.map((d) => ({ ...d, rule_id: ruleId })));
  }

  async function rollDraft() {
    if (draftDice.length === 0) return;
    if (!table) return;

    const result = rollGroup({
      groupId: "draft",
      label: "Jet rapide",
      entries: draftDice.map((d, idx) => {
        const rule = d.rule_id ? rulesMap[d.rule_id] : null;
        return {
          entryId: `draft-${idx}`,
          sides: d.sides,
          qty: d.qty,
          modifier: d.modifier ?? 0,
          sign: d.sign ?? 1,
          rule: rule
            ? { id: rule.id, name: rule.name, kind: rule.kind, params_json: rule.params_json }
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

      const flat = result.entries.flatMap((e) => e.signed_values);
      const summary = {
        title: `Jet rapide — ${table.name}`,
        lines: [`vals: ${flat.join(", ")} (total ${result.total})`],
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

  async function handleReplaceCurrentTable() {
    if (!table) return;
    if (table.is_system === 1) return;
    if (draftDice.length === 0) return;

    await deleteAllGroupsForTable(db, table.id);

    await createGroupFromDraft(db, {
      tableId: table.id,
      groupName: draftGroupName.trim() || "Groupe (depuis Jet rapide)",
      draftDice: draftDice.map((d) => ({
        sides: d.sides,
        qty: d.qty,
        modifier: d.modifier ?? 0,
        sign: d.sign ?? 1,
        rule_id: d.rule_id ?? null,
      })),
    });

    await reloadGroups(table.id);
    resetDraftUiOnly();
  }

  async function handleCreateNewTable() {
    const name = newTableName.trim();
    if (!name) return;
    if (draftDice.length === 0) return;

    const newTableId = await createTableWithDraft(db, {
      name,
      groupName: draftGroupName.trim() || "Groupe (depuis Jet rapide)",
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
    setShowDraftConfigModal(false);
    setPendingSaveMode(null);
    setNewTableName("");
    setDraftGroupName("Groupe (depuis Jet rapide)");
    setDraftDice([]);
    setDraftResult(null);
    setShowSaveOptions(false);
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

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Jet — {table.name}</Text>

      <Pressable
        onPress={onRoll}
        style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: "center" }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Lancer</Text>
      </Pressable>

      <ScrollView style={{ flex: 1 }}>
        {/* --- Jet rapide --- */}
        <View style={{ marginTop: 16, padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Jet rapide</Text>

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

          <Text style={{ marginTop: 10, opacity: 0.7 }}>
            Draft :{" "}
            {draftDice.length === 0
              ? "—"
              : draftDice
                  .map((d) => {
                    const signLabel = (d.sign ?? 1) === -1 ? "-" : "";
                    const mod = d.modifier ?? 0;
                    const modLabel = mod ? ` ${mod >= 0 ? "+" : ""}${mod}` : "";
                    return `${signLabel}${d.qty}d${d.sides}${modLabel} [${getRuleName(d.rule_id)}]`;
                  })
                  .join(" + ")}
          </Text>

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <Pressable
              onPress={rollDraft}
              style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 10 }}
            >
              <Text>Lancer draft</Text>
            </Pressable>

            <Pressable onPress={clearDraft} style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}>
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
                <View key={e.entryId} style={{ marginTop: 6 }}>
                  <Text style={{ fontWeight: "600" }}>
                    {e.qty}d{e.sides} {e.sign === -1 ? "(-)" : "(+)"}
                    {e.modifier ? ` mod ${e.modifier >= 0 ? "+" : ""}${e.modifier}` : ""}
                  </Text>
                  <Text style={{ opacity: 0.8 }}>
                    valeurs: [{e.signed_values.join(", ")}] → entrée = {e.final_total}
                  </Text>
                  <Text style={{ opacity: 0.75 }}>
                    règle: {e.rule?.name ?? "Somme"} {e.eval_result ? `→ ${formatRuleResult(e.eval_result)}` : ""}
                  </Text>
                </View>
              ))}
              <Text style={{ marginTop: 8, fontWeight: "800" }}>Total draft : {draftResult.total}</Text>
            </View>
          ) : null}

          {showSaveOptions ? (
            <View style={{ marginTop: 10, gap: 8 }}>
              <Text style={{ fontWeight: "600" }}>Enregistrer le draft</Text>

              <Pressable
                onPress={() => {
                  if (!table) return;
                  if (table.is_system === 1) return;
                  if (draftDice.length === 0) return;
                  setPendingSaveMode("replace");
                  setDraftGroupName("Groupe (depuis Jet rapide)");
                  setShowDraftConfigModal(true);
                }}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  opacity: table?.is_system === 1 ? 0.4 : 1,
                }}
              >
                <Text>Remplacer la table actuelle</Text>
                {table?.is_system === 1 ? (
                  <Text style={{ opacity: 0.7, marginTop: 4 }}>
                    Table système : remplacement interdit
                  </Text>
                ) : null}
              </Pressable>

              <Pressable
                onPress={() => {
                  if (draftDice.length === 0) return;
                  setPendingSaveMode("create");
                  setDraftGroupName("Groupe (depuis Jet rapide)");
                  setShowDraftConfigModal(true);
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
              >
                <Text>Créer une nouvelle table</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* --- Groupes --- */}
        <Text style={{ fontWeight: "600", marginTop: 12 }}>Groupes :</Text>

        {groups.map(({ group }) => {
          const r = results.find((x) => x.groupId === group.id);

          return (
            <View
              key={group.id}
              style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 12 }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>{group.name}</Text>

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
                          règle: {ruleName}
                          {evalText}
                        </Text>

                        <Text style={{ marginTop: 4, fontWeight: "800" }}>
                          final entrée: {e.final_total}
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

        {/* --- Modal config du draft avant save --- */}
        <Modal
          visible={showDraftConfigModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowDraftConfigModal(false);
            setPendingSaveMode(null);
            setDraftEditingIndex(null);
          }}
        >
          <View
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}
          >
            <View
              style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1, maxHeight: "90%" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                Configurer le groupe à enregistrer
              </Text>

              <ScrollView style={{ marginTop: 12 }}>
                <Text>Nom du groupe</Text>
                <TextInput
                  value={draftGroupName}
                  onChangeText={setDraftGroupName}
                  placeholder="Ex: Actions / Dégâts / Localisation"
                  style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
                />

                <Text style={{ marginTop: 14, fontWeight: "700" }}>Entrées du draft</Text>

                {draftDice.length === 0 ? (
                  <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucune entrée.</Text>
                ) : (
                  draftDice.map((d, idx) => (
                    <View
                      key={`${d.sides}-${idx}`}
                      style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 10 }}
                    >
                      <Text style={{ fontWeight: "700" }}>
                        {d.qty}d{d.sides}
                      </Text>

                      <Text style={{ marginTop: 6 }}>Quantité</Text>
                      <TextInput
                        value={String(d.qty)}
                        onChangeText={(v) =>
                          updateDraftDie(idx, {
                            qty: Math.max(1, Number(v || "1")),
                          })
                        }
                        keyboardType="numeric"
                        style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
                      />

                      <Text style={{ marginTop: 10 }}>Modifier</Text>
                      <TextInput
                        value={String(d.modifier ?? 0)}
                        onChangeText={(v) =>
                          updateDraftDie(idx, {
                            modifier: Number(v || "0"),
                          })
                        }
                        keyboardType="numeric"
                        style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
                      />

                      <Text style={{ marginTop: 10 }}>Signe</Text>
                      <View style={{ flexDirection: "row", marginTop: 6 }}>
                        <Pressable
                          onPress={() => updateDraftDie(idx, { sign: 1 })}
                          style={{
                            padding: 10,
                            borderWidth: 1,
                            borderRadius: 10,
                            marginRight: 8,
                            opacity: (d.sign ?? 1) === 1 ? 1 : 0.6,
                          }}
                        >
                          <Text style={{ fontWeight: (d.sign ?? 1) === 1 ? "700" : "400" }}>+</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => updateDraftDie(idx, { sign: -1 })}
                          style={{
                            padding: 10,
                            borderWidth: 1,
                            borderRadius: 10,
                            opacity: (d.sign ?? 1) === -1 ? 1 : 0.6,
                          }}
                        >
                          <Text style={{ fontWeight: (d.sign ?? 1) === -1 ? "700" : "400" }}>-</Text>
                        </Pressable>
                      </View>

                      <Text style={{ marginTop: 10 }}>Règle</Text>
                      <Text style={{ marginTop: 6, opacity: 0.8 }}>{getRuleName(d.rule_id)}</Text>

                      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
                        <Pressable
                          onPress={() => {
                            setDraftEditingIndex(idx);
                            setShowRulePickerModal(true);
                          }}
                          style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 8 }}
                        >
                          <Text>Choisir règle</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => removeDraftDie(idx)}
                          style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                        >
                          <Text>Supprimer entrée</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}

                <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1 }}>
                  <Text style={{ fontWeight: "700" }}>Actions globales</Text>

                  <Pressable
                    onPress={() => duplicateRuleToAllDraftDice(null)}
                    style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
                  >
                    <Text>Appliquer “Somme” à toutes les entrées</Text>
                  </Pressable>

                  {availableRules.map((rule) => (
                    <Pressable
                      key={rule.id}
                      onPress={() => duplicateRuleToAllDraftDice(rule.id)}
                      style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
                    >
                      <Text>Appliquer “{rule.name}” à toutes les entrées</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
                <Pressable
                  onPress={() => {
                    setShowDraftConfigModal(false);
                    setPendingSaveMode(null);
                    setDraftEditingIndex(null);
                  }}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
                >
                  <Text>Annuler</Text>
                </Pressable>

                <Pressable
                  onPress={async () => {
                    if (pendingSaveMode === "replace") {
                      await handleReplaceCurrentTable();
                    } else if (pendingSaveMode === "create") {
                      setShowDraftConfigModal(false);
                      setNewTableName(`Nouvelle table (${new Date().toLocaleDateString()})`);
                      setShowNameModal(true);
                    }
                  }}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text style={{ fontWeight: "700" }}>
                    {pendingSaveMode === "replace" ? "Continuer (remplacement)" : "Continuer (création)"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* --- Modal picker de règle pour une entrée draft --- */}
        <Modal
          visible={showRulePickerModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowRulePickerModal(false);
            setDraftEditingIndex(null);
          }}
        >
          <View
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}
          >
            <View
              style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1, maxHeight: "85%" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>Choisir une règle</Text>

              <ScrollView style={{ marginTop: 12 }}>
                <Pressable
                  onPress={() => {
                    if (draftEditingIndex != null) {
                      updateDraftDie(draftEditingIndex, { rule_id: null });
                    }
                    setShowRulePickerModal(false);
                    setDraftEditingIndex(null);
                  }}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text style={{ fontWeight: "700" }}>Somme (par défaut)</Text>
                </Pressable>

                {availableRules.map((rule) => (
                  <Pressable
                    key={rule.id}
                    onPress={() => {
                      if (draftEditingIndex != null) {
                        updateDraftDie(draftEditingIndex, { rule_id: rule.id });
                      }
                      setShowRulePickerModal(false);
                      setDraftEditingIndex(null);
                    }}
                    style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
                  >
                    <Text style={{ fontWeight: "700" }}>{rule.name}</Text>
                    <Text style={{ marginTop: 4, opacity: 0.7 }}>
                      type: {rule.kind} {rule.is_system === 1 ? "• système" : "• perso"}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
                <Pressable
                  onPress={() => {
                    setShowRulePickerModal(false);
                    setDraftEditingIndex(null);
                  }}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>Fermer</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* --- Modal création table depuis draft --- */}
        <Modal
          visible={showNameModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNameModal(false)}
        >
          <View
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}
          >
            <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1 }}>
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
                    setPendingSaveMode(null);
                  }}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>Annuler</Text>
                </Pressable>

                <Pressable
                  onPress={handleCreateNewTable}
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