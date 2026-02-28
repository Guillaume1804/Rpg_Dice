import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Modal } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";

import { getTableById, TableRow } from "../data/repositories/tablesRepo";
import { listGroupsByTableId, listDiceByGroupId, GroupRow, GroupDieRow } from "../data/repositories/groupsRepo";

import { rollGroup, GroupRollResult } from "../core/roll/roll";
import { insertRollEvent } from "../data/repositories/rollEventsRepo";
import { newId } from "../core/types/ids";

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
  const [ignoreRules, setIgnoreRules] = useState(false);
  const [draftDice, setDraftDice] = useState<{ sides: number; qty: number }[]>([]);
  const [draftResult, setDraftResult] = useState<GroupRollResult | null>(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  const STANDARD_DICE = [4, 6, 8, 10, 12, 20];

  const [error, setError] = useState<string | null>(null);

  const tableId = useMemo(
    () => (typeof activeTableId === "string" && activeTableId.length > 0 ? activeTableId : ""),
    [activeTableId]
  );

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setResults([]);
        setDraftDice([]);
        setDraftResult(null);

        if (!tableId) {
          setTable(null);
          setGroups([]);
          return;
        }

        const t = await getTableById(db, tableId);
        setTable(t);

        if (!t) {
          setGroups([]);
          return;
        }

        const gs = await listGroupsByTableId(db, tableId);
        const withDice: GroupWithDice[] = [];
        for (const g of gs) {
          const dice = await listDiceByGroupId(db, g.id);
          withDice.push({ group: g, dice });
        }
        setGroups(withDice);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, [db, tableId]);

  function nowIso() {
    return new Date().toISOString();
  }

  function summarizeGroup(r: GroupRollResult) {
    const values = r.dice.map((d) => d.value);
    const short =
      values.length === 1 ? String(values[0]) : `${values.join(", ")} (total ${r.total})`;
    return `${r.label}: ${short}`;
  }

  async function onRoll() {
    if (!table) return;

    const rolled: GroupRollResult[] = groups.map(({ group, dice }) =>
      rollGroup({
        groupId: group.id,
        label: group.name,
        dice: dice.map((d) => ({ sides: d.sides, qty: d.qty })),
      })
    );

    // UI immédiate
    setResults(rolled);

    // Persistance robuste
    try {
      const eventId = await newId();
      const createdAt = nowIso();

      const payload = {
        type: "groups",
        tableId: table.id,
        tableName: table.name,
        groups: rolled.map((r) => ({
          groupId: r.groupId,
          label: r.label,
          dice: r.dice,
          total: r.total,
        })),
      };

      const summary = {
        title: `Jet — ${table.name}`,
        lines: rolled.map(summarizeGroup),
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
      const existing = prev.find((d) => d.sides === sides);
      if (existing) {
        return prev.map((d) =>
          d.sides === sides ? { ...d, qty: d.qty + 1 } : d
        );
      }
      return [...prev, { sides, qty: 1 }];
    });
  }

  function clearDraft() {
    setDraftDice([]);
    setDraftResult(null);
  }

  function resetDraftState() {
    setDraftDice([]);
    setDraftResult(null);
    setShowSaveOptions(false);
    setNewTableName("");
  }

  async function rollDraft() {
    if (draftDice.length === 0) return;
    if (!table) return;

    const result = rollGroup({
      groupId: "draft",
      label: "Jet rapide",
      dice: draftDice.map((d) => ({
        sides: d.sides,
        qty: d.qty, // important : tu as bien le draft en qty maintenant
      })),
    });

    // UI immédiate
    setDraftResult(result);

    // Persistance robuste
    try {
      const eventId = await newId();
      const createdAt = nowIso();

      const payload = {
        type: "draft",
        tableId: table.id,
        tableName: table.name,
        groups: [
          {
            groupId: "draft",
            label: "Jet rapide",
            dice: result.dice,
            total: result.total,
          },
        ],
      };

      const summary = {
        title: `Jet rapide — ${table.name}`,
        lines: [summarizeGroup(result)],
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

  if (!pid) {
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
        <Text style={{ opacity: 0.7 }}>Table active introuvable (id: {pid}).</Text>
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

      <Pressable
        onPress={() => setIgnoreRules((v) => !v)}
        style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}
      >
        <Text style={{ fontWeight: "600" }}>
          {ignoreRules ? "✅ Ignorer les règles" : "⬜ Ignorer les règles"}
        </Text>
      </Pressable>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ marginTop: 16, padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Jet rapide</Text>

          {/* Dés standards */}
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
          
          {/* Draft actuel */}
          <Text style={{ marginTop: 10, opacity: 0.7 }}>
            Draft :{" "}
            {draftDice.length === 0
              ? "—"
              : draftDice.map((d) => `${d.qty}d${d.sides}`).join(" + ")}
          </Text>
            
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <Pressable
              onPress={rollDraft}
              style={{
                padding: 10,
                borderWidth: 1,
                borderRadius: 8,
                marginRight: 10,
              }}
            >
              <Text>Lancer draft</Text>
            </Pressable>
            
            <Pressable
              onPress={clearDraft}
              style={{
                padding: 10,
                borderWidth: 1,
                borderRadius: 8,
              }}
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
              <Text style={{ fontWeight: "600" }}>Enregistrer le draft</Text>

              <Pressable
                onPress={async () => {
                  if (!table) return;
                  if (table.is_system === 1) return; // sécurité
                  if (draftDice.length === 0) return;
                
                  await deleteAllGroupsForProfile(db, table.id);
                  await createGroupFromDraft(db, {
                    tableId: table.id,
                    groupName: "Groupe (depuis Jet rapide)",
                    draftDice,
                  });
                
                  // recharge les groupes (simple: relance ton loader en changeant un state ou rappelle la fonction de load)
                  // pour V1 : on force un refresh en rappelant la logique de load
                  const gs = await listGroupsByProfileId(db, table.id);
                  const withDice: GroupWithDice[] = [];
                  for (const g of gs) {
                    const dice = await listDiceByGroupId(db, g.id);
                    withDice.push({ group: g, dice });
                  }
                  setGroups(withDice);
                
                  resetDraftState();
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
                onPress={async () => {
                  if (!table) return;
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
                    
                      // --- CRÉER NOUVELLE TABLE ---
                      if (!table) return;
                      if (draftDice.length === 0) return;
                    
                      const newTableId = await createProfileWithDraft(db, {
                        name,
                        rulesetId: table.ruleset_id,
                        draftDice,
                        groupName: "Groupe (depuis Jet rapide)",
                      });
                    
                      await setActiveProfileId(newProfileId);
                    
                      setShowNameModal(false);
                      resetDraftState();
                    }}
                    style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                  >
                    <Text style={{ fontWeight: "700" }}>
                      Créer
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
          {draftResult ? (
            <View style={{ marginTop: 10 }}>
              <Text>Résultats : {draftResult.dice.map((d) => d.value).join(", ")}</Text>
              <Text style={{ marginTop: 4, opacity: 0.8 }}>Total : {draftResult.total}</Text>

              {!ignoreRules && ruleset ? (() => {
                const values = draftResult.dice.map((d) => d.value);
                const params = JSON.parse(ruleset.params_json);
                const ev = evaluateRoll(ruleset.mode as any, params, values);
              
                if (ev.kind === "d20") {
                  const label =
                    ev.outcome === "crit_success"
                      ? "Réussite critique"
                      : ev.outcome === "crit_failure"
                      ? "Échec critique"
                      : ev.outcome === "success"
                      ? ev.threshold == null
                        ? "Résultat (pas de seuil)"
                        : "Réussite"
                      : "Échec";
                  return <Text style={{ marginTop: 6, fontWeight: "600" }}>{label}</Text>;
                }
              
                if (ev.kind === "pool") {
                  const label =
                    ev.outcome === "crit_glitch"
                      ? "Échec critique (glitch)"
                      : ev.outcome === "glitch"
                      ? "Glitch"
                      : ev.outcome === "success"
                      ? "Réussite"
                      : "Échec";
                  return (
                    <Text style={{ marginTop: 6, fontWeight: "600" }}>
                      {label} — succès: {ev.successes} / ones: {ev.ones}
                    </Text>
                  );
                }
              
                return null;
              })() : null}
            </View>
          ) : null}
        </View>
        <Text style={{ fontWeight: "600", marginTop: 8 }}>Groupes :</Text>
        {groups.map(({ group, dice }) => (
          <View key={group.id} style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>{group.name}</Text>
            <Text style={{ marginTop: 6, opacity: 0.7 }}>
              {dice.map((d) => `${d.qty}d${d.sides}`).join(" + ")}
            </Text>

            {results.find((r) => r.groupId === group.id) ? (
              (() => {
                const r = results.find((x) => x.groupId === group.id)!;
              
                return (
                  <View style={{ marginTop: 10 }}>
                    <Text>Résultats : {r.dice.map((d) => d.value).join(", ")}</Text>
                    <Text style={{ marginTop: 4, opacity: 0.8 }}>
                      Total : {r.total}
                    </Text>
                
                    {/* ÉVALUATION DES RÈGLES */}
                    {!ignoreRules && ruleset ? (() => {
                      const values = r.dice.map((d) => d.value);
                      const params = JSON.parse(ruleset.params_json);
                      const ev = evaluateRoll(ruleset.mode as any, params, values);
                    
                      if (ev.kind === "d20") {
                        const label =
                          ev.outcome === "crit_success"
                            ? "Réussite critique"
                            : ev.outcome === "crit_failure"
                            ? "Échec critique"
                            : ev.outcome === "success"
                            ? ev.threshold == null
                              ? "Résultat (pas de seuil)"
                              : "Réussite"
                            : "Échec";
                      
                        return (
                          <Text style={{ marginTop: 6, fontWeight: "600" }}>
                            {label}
                          </Text>
                        );
                      }
                    
                      if (ev.kind === "pool") {
                        const label =
                          ev.outcome === "crit_glitch"
                            ? "Échec critique (glitch)"
                            : ev.outcome === "glitch"
                            ? "Glitch"
                            : ev.outcome === "success"
                            ? "Réussite"
                            : "Échec";
                      
                        return (
                          <Text style={{ marginTop: 6, fontWeight: "600" }}>
                            {label} — succès: {ev.successes} / ones: {ev.ones}
                          </Text>
                        );
                      }
                    
                      return null;
                    })() : null}
                  </View>
                );            
              })()
            ) : null}

          </View>
        ))}
      </ScrollView>
    </View>
  );
}