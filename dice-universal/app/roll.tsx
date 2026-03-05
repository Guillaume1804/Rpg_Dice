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
import { getRuleById } from "../data/repositories/rulesRepo";

type GroupWithDice = {
  group: GroupRow;
  dice: GroupDieRow[];
};

export default function RollScreen() {
  const db = useDb();
  const { activeTableId, setActiveTableId } = useActiveTable();

  const [table, setTable] = useState<TableRow | null>(null);
  const [groups, setGroups] = useState<GroupWithDice[]>([]);
  const [results, setResults] = useState<GroupRollResult[]>([]);

  // Draft (jet rapide)
  const [draftDice, setDraftDice] = useState<{ sides: number; qty: number; modifier?: number; sign?: number }[]>([]);
  const [draftResult, setDraftResult] = useState<GroupRollResult | null>(null);

  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  const [rulesMap, setRulesMap] = useState<Record<string, any>>({});

  const [error, setError] = useState<string | null>(null);

  const STANDARD_DICE = [4, 6, 8, 10, 12, 20, 100];

  const tableId = useMemo(
    () => (typeof activeTableId === "string" && activeTableId.length > 0 ? activeTableId : ""),
    [activeTableId]
  );

  function nowIso() {
    return new Date().toISOString();
  }

  // ---- Helpers d'affichage résultats rules ----
  function formatRuleResult(res: any): string {
    if (!res) return "";
    if (res.kind === "sum") return `Somme = ${res.total}`;
    if (res.kind === "pipeline") return `Pipeline → final = ${res.final}`;
    if (res.kind === "d20") {
      if (res.outcome === "crit_success") return "Réussite critique";
      if (res.outcome === "crit_failure") return "Échec critique";
      if (res.threshold == null) return `Résultat (final ${res.final})`;
      return res.outcome === "success" ? `Réussite (final ${res.final})` : `Échec (final ${res.final})`;
    }
    if (res.kind === "pool") {
      const label =
        res.outcome === "crit_glitch" ? "Échec critique (glitch)" :
        res.outcome === "glitch" ? "Glitch" :
        res.outcome === "success" ? "Réussite" : "Échec";
      return `${label} — succès: ${res.successes} / ones: ${res.ones}`;
    }
    if (res.kind === "table_lookup") return res.label;
    if (res.kind === "unknown") return res.message;
    return "";
  }

  function getFinalNumberFromEval(res: any): number | null {
    if (!res) return null;
    if (res.kind === "sum") return typeof res.total === "number" ? res.total : null;
    if (res.kind === "pipeline") return typeof res.final === "number" ? res.final : null;
    if (res.kind === "d20") return typeof res.final === "number" ? res.final : null;
    // pool / table_lookup => pas un "total" numérique standard
    return null;
  }

  // ---- Chargement table + groupes + règles nécessaires ----
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setResults([]);
        setDraftDice([]);
        setDraftResult(null);
        setShowSaveOptions(false);

        if (!tableId) {
          setTable(null);
          setGroups([]);
          setRulesMap({});
          return;
        }

        const t = await getTableById(db, tableId);
        setTable(t);

        if (!t) {
          setGroups([]);
          setRulesMap({});
          return;
        }

        const gs = await listGroupsByTableId(db, tableId);
        const withDice: GroupWithDice[] = [];
        for (const g of gs) {
          const dice = await listDiceByGroupId(db, g.id);
          withDice.push({ group: g, dice });
        }
        setGroups(withDice);

        // charger règles liées
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

    const ruleIds = new Set<string>();
    withDice.forEach((g) => g.dice.forEach((d) => { if (d.rule_id) ruleIds.add(d.rule_id); }));

    const map: Record<string, any> = {};
    for (const id of ruleIds) {
      const rule = await getRuleById(db, id);
      if (rule) map[id] = rule;
    }
    setRulesMap(map);
  }

  // ---- Roll groupes ----
  async function onRoll() {
    if (!table) return;

    const rolled: GroupRollResult[] = groups.map(({ group, dice }) =>
      rollGroup({
        groupId: group.id,
        label: group.name,
        entries: dice.map((d) => ({
          dieId: d.id,
          sides: d.sides,
          qty: d.qty,
        })),
      })
    );

    setResults(rolled);

    // Log dans roll_events
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
        lines: rolled.map((r) => `${r.label} (raw ${r.raw_total})`),
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

  // ---- Draft helpers ----
  function addDieToDraft(sides: number) {
    setDraftDice((prev) => {
      const existing = prev.find((d) => d.sides === sides && (d.sign ?? 1) === 1);
      if (existing) {
        return prev.map((d) => (d === existing ? { ...d, qty: d.qty + 1 } : d));
      }
      return [...prev, { sides, qty: 1, sign: 1, modifier: 0 }];
    });
  }

  function clearDraft() {
    setDraftDice([]);
    setDraftResult(null);
    setShowSaveOptions(false);
  }

  async function rollDraft() {
    if (draftDice.length === 0) return;
    if (!table) return;

    const result = rollGroup({
      groupId: "draft",
      label: "Jet rapide",
      entries: draftDice.map((d, idx) => ({
        dieId: `draft-${d.sides}-${idx}`,
        sides: d.sides,
        qty: d.qty,
      })),
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

      const flat = result.entries.flatMap((e) => e.dice.map((x) => x.value));
      const summary = {
        title: `Jet rapide — ${table.name}`,
        lines: [`vals: ${flat.join(", ")} (raw ${result.raw_total})`],
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

  // ---- UI states ----
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

  // ---- Render ----
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
                style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 8, marginBottom: 8 }}
              >
                <Text>d{s}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ marginTop: 10, opacity: 0.7 }}>
            Draft :{" "}
            {draftDice.length === 0
              ? "—"
              : draftDice.map((d) => `${d.qty}d${d.sides}`).join(" + ")}
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
              <Text>
                Résultats :{" "}
                {draftResult.entries.flatMap((e) => e.dice.map((x) => x.value)).join(", ")}
              </Text>
              <Text style={{ marginTop: 4, opacity: 0.8 }}>Total brut : {draftResult.raw_total}</Text>
            </View>
          ) : null}

          {showSaveOptions ? (
            <View style={{ marginTop: 10, gap: 8 }}>
              <Text style={{ fontWeight: "600" }}>Enregistrer le draft</Text>

              {/* Remplacer table */}
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
                      rule_id: null, // fallback sum
                    })),
                  });

                  await reloadGroups(table.id);
                  setShowSaveOptions(false);
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

              {/* Créer nouvelle table */}
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

        {/* --- Groupes --- */}
        <Text style={{ fontWeight: "600", marginTop: 12 }}>Groupes :</Text>

        {groups.map(({ group, dice }) => {
          const r = results.find((x) => x.groupId === group.id);

          return (
            <View key={group.id} style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>{group.name}</Text>

              {!r ? (
                <Text style={{ marginTop: 8, opacity: 0.7 }}>
                  {dice.length === 0 ? "Aucun dé." : "Pas encore de résultat (appuie sur Lancer)."}
                </Text>
              ) : (
                <View style={{ marginTop: 10 }}>
                  {/* Entrées (rendu propre par entrée) */}
                  {dice.map((d) => {
                    const entryRes = r.entries.find((e) => e.dieId === d.id);
                    const values = entryRes ? entryRes.dice.map((x) => x.value) : [];

                    const rule = d.rule_id ? rulesMap[d.rule_id] : null;

                    const res = entryRes
                      ? (rule
                          ? evaluateRule(rule.kind, rule.params_json, {
                              values,
                              sides: d.sides,
                              modifier: d.modifier,
                              sign: d.sign,
                            })
                          : evaluateRule("sum", "{}", {
                              values,
                              sides: d.sides,
                              modifier: d.modifier,
                              sign: d.sign,
                            }))
                      : null;

                    const finalNum = getFinalNumberFromEval(res);
                    const signLabel = d.sign === -1 ? "−" : "+";
                    const modLabel = d.modifier ? ` ${d.modifier >= 0 ? "+" : ""}${d.modifier}` : "";

                    return (
                      <View key={d.id} style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1 }}>
                        <Text style={{ fontWeight: "600" }}>
                          {d.qty}d{d.sides}
                        </Text>

                        <Text style={{ marginTop: 4, opacity: 0.8 }}>
                          Valeurs : {values.length ? values.join(", ") : "—"}
                        </Text>

                        <Text style={{ marginTop: 2, opacity: 0.75 }}>
                          Appliqué : sign {signLabel}
                          {modLabel ? ` | mod${modLabel}` : " | mod 0"}
                        </Text>

                        <Text style={{ marginTop: 2, opacity: 0.75 }}>
                          Règle : {rule ? rule.name : "Somme"}
                        </Text>

                        {res ? (
                          <Text style={{ marginTop: 6 }}>
                            Résultat : {formatRuleResult(res)}
                            {finalNum != null ? `  •  Total affiché = ${finalNum}` : ""}
                          </Text>
                        ) : (
                          <Text style={{ marginTop: 6, opacity: 0.7 }}>Résultat : —</Text>
                        )}
                      </View>
                    );
                  })}

                  {/* Total groupe (raw + info) */}
                  <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1 }}>
                    <Text style={{ opacity: 0.7 }}>
                      Total brut du groupe (debug) : {r.raw_total}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* --- Modal création table depuis draft --- */}
        <Modal
          visible={showNameModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNameModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
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
                        rule_id: null, // fallback sum
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