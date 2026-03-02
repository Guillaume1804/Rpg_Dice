import { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, TextInput, ScrollView } from "react-native";
import { useDb } from "../data/db/DbProvider";
import {
  listRules,
  createRule,
  deleteRule,
  RuleRow,
  updateRule
} from "../data/repositories/rulesRepo";
import { evaluateRule } from "../core/rules/evaluate";

export default function RulesScreen() {
  const db = useDb();

  const [rules, setRules] = useState<RuleRow[]>([]);

  const [editingRule, setEditingRule] = useState<RuleRow | null>(null);

  const [formName, setFormName] = useState("");
  const [formKind, setFormKind] = useState<"sum" | "d20" | "pool" | "table_lookup">("sum");

  // champs UI (au lieu de JSON brut)
  const [d20CritSuccess, setD20CritSuccess] = useState("20");
  const [d20CritFailure, setD20CritFailure] = useState("1");
  const [d20Threshold, setD20Threshold] = useState(""); // vide => null

  const [poolSuccessAtOrAbove, setPoolSuccessAtOrAbove] = useState("4");
  const [poolCritFailureFace, setPoolCritFailureFace] = useState("1");
  const [poolGlitchRule, setPoolGlitchRule] = useState("ones_gt_successes");

  // preview
  const [previewValues, setPreviewValues] = useState("4, 6, 1, 5");
  const [previewResult, setPreviewResult] = useState<string>("");

  // modals
  const [showPickKindModal, setShowPickKindModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const all = await listRules(db);
      setRules(all);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    load();
  }, [db]);

  function openCreateFlow() {
    setEditingRule(null);
    setFormName("");
    setFormKind("sum");
    setShowPickKindModal(true);
  }

  function openEditFlow(rule: RuleRow) {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormKind(rule.kind as any);

    // hydrate champs depuis params_json
    try {
      const p = JSON.parse(rule.params_json || "{}");

      if (rule.kind === "d20") {
        setD20CritSuccess(String(p.critSuccess ?? 20));
        setD20CritFailure(String(p.critFailure ?? 1));
        setD20Threshold(p.successThreshold == null ? "" : String(p.successThreshold));
      } else if (rule.kind === "pool") {
        setPoolSuccessAtOrAbove(String(p.successAtOrAbove ?? 4));
        setPoolCritFailureFace(String(p.critFailureFace ?? 1));
        setPoolGlitchRule(String(p.glitchRule ?? "ones_gt_successes"));
      } else {
        // sum / table_lookup => on laissera plus tard une UI dédiée à table_lookup
      }
    } catch {
      // si params_json cassé, on retombe sur défauts
    }

    setShowEditModal(true);
  }

  function buildParamsJson(kind: string): string {
    if (kind === "sum") return "{}";

    if (kind === "d20") {
      const critSuccess = Number(d20CritSuccess || "20");
      const critFailure = Number(d20CritFailure || "1");
      const threshold = d20Threshold.trim() === "" ? null : Number(d20Threshold);
      return JSON.stringify({
        critSuccess,
        critFailure,
        successThreshold: threshold,
      });
    }

    if (kind === "pool") {
      const successAtOrAbove = Number(poolSuccessAtOrAbove || "4");
      const critFailureFace = Number(poolCritFailureFace || "1");
      const glitchRule = poolGlitchRule || "ones_gt_successes";
      return JSON.stringify({
        successAtOrAbove,
        critFailureFace,
        glitchRule,
      });
    }

    if (kind === "table_lookup") {
      // MVP : structure vide (on fera l’UI mapping juste après)
      return JSON.stringify({ mapping: [] });
    }

    return "{}";
  }

  function computePreview(kind: string, params_json: string) {
    try {
      const values = previewValues
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n));

      const res = evaluateRule(kind as any, params_json, { values, sides: 0 });
      // format simple
      setPreviewResult(JSON.stringify(res));
    } catch (e: any) {
      setPreviewResult(e?.message ?? "Erreur preview");
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

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Règles</Text>

      <Pressable
        onPress={openCreateFlow}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text style={{ fontWeight: "600" }}>Créer une règle</Text>
      </Pressable>

      <ScrollView style={{ marginTop: 12 }}>
        
        {rules.map((rule) => (
          <View
            key={rule.id}
            style={{
              marginTop: 10,
              padding: 12,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "600" }}>{rule.name}</Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>
              type: {rule.kind} {rule.is_system === 1 ? "• système" : "• perso"}
            </Text>

            <Pressable
              disabled={rule.is_system === 1}
              onPress={() => openEditFlow(rule)}
              style={{
                marginTop: 8,
                padding: 8,
                borderWidth: 1,
                borderRadius: 8,
                opacity: rule.is_system === 1 ? 0.4 : 1,
              }}
            >
              <Text>Éditer</Text>
            </Pressable>

            {rule.is_system !== 1 && (
              <Pressable
                onPress={async () => {
                  await deleteRule(db, rule.id);
                  await load();
                }}
                style={{
                  marginTop: 8,
                  padding: 8,
                  borderWidth: 1,
                  borderRadius: 8,
                }}
              >
                <Text>Supprimer</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showPickKindModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPickKindModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Type de règle</Text>

            {(["sum", "d20", "pool", "table_lookup"] as const).map((k) => (
              <Pressable
                key={k}
                onPress={() => {
                  setFormKind(k);
                  setShowPickKindModal(false);
                  setShowEditModal(true);
                }}
                style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text style={{ fontWeight: "600" }}>{k}</Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() => setShowPickKindModal(false)}
              style={{ marginTop: 12, padding: 10, borderWidth: 1, borderRadius: 10 }}
            >
              <Text>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              {editingRule ? "Éditer la règle" : "Créer une règle"}
            </Text>

            <Text style={{ marginTop: 12 }}>Nom</Text>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              placeholder="Ex: Pool SR6"
              style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
            />

            <Text style={{ marginTop: 12 }}>Type</Text>
            <Text style={{ marginTop: 6, opacity: 0.7 }}>{formKind}</Text>

            {/* UI selon kind */}
            {formKind === "d20" ? (
              <View style={{ marginTop: 12 }}>
                <Text>critSuccess</Text>
                <TextInput value={d20CritSuccess} onChangeText={setD20CritSuccess} style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }} />
                <Text style={{ marginTop: 10 }}>critFailure</Text>
                <TextInput value={d20CritFailure} onChangeText={setD20CritFailure} style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }} />
                <Text style={{ marginTop: 10 }}>successThreshold (optionnel)</Text>
                <TextInput value={d20Threshold} onChangeText={setD20Threshold} placeholder="vide = null" style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }} />
              </View>
            ) : null}

            {formKind === "pool" ? (
              <View style={{ marginTop: 12 }}>
                <Text>successAtOrAbove</Text>
                <TextInput value={poolSuccessAtOrAbove} onChangeText={setPoolSuccessAtOrAbove} style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }} />
                <Text style={{ marginTop: 10 }}>critFailureFace</Text>
                <TextInput value={poolCritFailureFace} onChangeText={setPoolCritFailureFace} style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }} />
                <Text style={{ marginTop: 10 }}>glitchRule</Text>
                <TextInput value={poolGlitchRule} onChangeText={setPoolGlitchRule} style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }} />
              </View>
            ) : null}

            {formKind === "table_lookup" ? (
              <Text style={{ marginTop: 12, opacity: 0.7 }}>
                (MVP) L’éditeur de mapping arrive juste après. Pour l’instant on crée la règle.
              </Text>
            ) : null}

            {/* Preview */}
            <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1 }}>
              <Text style={{ fontWeight: "600" }}>Preview</Text>
              <TextInput
                value={previewValues}
                onChangeText={setPreviewValues}
                placeholder="ex: 4,6,1,5"
                style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8 }}
              />
              <Pressable
                onPress={() => {
                  const params_json = buildParamsJson(formKind);
                  computePreview(formKind, params_json);
                }}
                style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>Calculer</Text>
              </Pressable>
              {previewResult ? <Text style={{ marginTop: 8, opacity: 0.8 }}>{previewResult}</Text> : null}
            </View>
              
            {/* Actions */}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
              <Pressable
                onPress={() => setShowEditModal(false)}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>
              
              <Pressable
                onPress={async () => {
                  const name = formName.trim();
                  if (!name) return;
                
                  const params_json = buildParamsJson(formKind);
                
                  if (editingRule) {
                    await updateRule(db, editingRule.id, {
                      name,
                      kind: formKind,
                      params_json,
                    });
                  } else {
                    await createRule(db, {
                      name,
                      kind: formKind,
                      params_json,
                      is_system: 0,
                    });
                  }
                
                  setShowEditModal(false);
                  await load(); // ton load existant qui refresh la liste
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text style={{ fontWeight: "700" }}>Sauvegarder</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}