// app/rules.tsx
import { useState } from "react";
import { View, Text, Pressable, Modal, TextInput, ScrollView } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { RuleRow } from "../data/repositories/rulesRepo";
import { useRulesData } from "./hooks/useRulesData";
import { evaluateRule } from "../core/rules/evaluate";

type RangeRow = { min: string; max: string; label: string };

type PipelineStep =
  | { op: "keep_highest"; n: number }
  | { op: "keep_lowest"; n: number }
  | { op: "drop_highest"; n: number }
  | { op: "drop_lowest"; n: number }
  | { op: "take"; index: number }
  | { op: "sort_asc" }
  | { op: "sort_desc" }
  | { op: "reroll"; faces: number[]; once?: boolean; max_rerolls?: number }
  | { op: "explode"; faces: number[]; max_explosions?: number }
  | { op: "count_successes"; at_or_above: number }
  | { op: "count_equal"; faces: number[] }
  | { op: "count_range"; min: number; max: number }
  | { op: "lookup"; ranges: { min: number; max: number; label: string }[] }
  | { op: "sum" };

type PipelineOutput =
  | "sum"
  | "successes"
  | "count_equal"
  | "count_range"
  | "first_value"
  | "values"
  | "lookup_label"
  | "lookup_value";

type PipelineParams = {
  steps: PipelineStep[];
  output?: PipelineOutput;
  crit_success_faces?: number[];
  crit_failure_faces?: number[];
  success_threshold?: number | null;
};

function safeParse(json: string) {
  try {
    return JSON.parse(json || "{}");
  } catch {
    return {};
  }
}

function stringifyPipeline(p: PipelineParams) {
  return JSON.stringify(
    {
      steps: p.steps ?? [],
      output: p.output ?? "sum",
      crit_success_faces: p.crit_success_faces ?? [],
      crit_failure_faces: p.crit_failure_faces ?? [],
      success_threshold: p.success_threshold ?? null,
    },
    null,
    2
  );
}

function formatPreviewResult(res: any): string {
  if (!res) return "";

  if (res.kind === "sum") {
    return `Somme = ${res.total}`;
  }

  if (res.kind === "d20") {
    return JSON.stringify(
      {
        kind: res.kind,
        outcome: res.outcome,
        natural: res.natural,
        final: res.final,
        threshold: res.threshold,
      },
      null,
      2
    );
  }

  if (res.kind === "pool") {
    return JSON.stringify(
      {
        kind: res.kind,
        outcome: res.outcome,
        successes: res.successes,
        ones: res.ones,
      },
      null,
      2
    );
  }

  if (res.kind === "table_lookup") {
    return `Lookup → ${res.label} (${res.value})`;
  }

  if (res.kind === "pipeline") {
    return JSON.stringify(
      {
        kind: res.kind,
        values: res.values,
        kept: res.kept,
        final: res.final,
        meta: res.meta,
      },
      null,
      2
    );
  }

  return JSON.stringify(res, null, 2);
}

export default function RulesScreen() {
  const db = useDb();

  const [showEditModal, setShowEditModal] = useState(false);

  const [editingRule, setEditingRule] = useState<RuleRow | null>(null);
  const [formName, setFormName] = useState("");

  const [pipeOutput, setPipeOutput] = useState<PipelineOutput>("sum");
  const [successThreshold, setSuccessThreshold] = useState("");
  const [critSuccessFaces, setCritSuccessFaces] = useState("");
  const [critFailureFaces, setCritFailureFaces] = useState("");

  const [steps, setSteps] = useState<PipelineStep[]>([]);

  // Step builders
  const [keepN, setKeepN] = useState("5");
  const [successAt, setSuccessAt] = useState("5");
  const [takeIndex, setTakeIndex] = useState("0");
  const [facesInput, setFacesInput] = useState("1");
  const [rangeMin, setRangeMin] = useState("1");
  const [rangeMax, setRangeMax] = useState("10");

  // lookup editor
  const [ranges, setRanges] = useState<RangeRow[]>([
    { min: "1", max: "20", label: "Tête" },
    { min: "21", max: "50", label: "Torse" },
    { min: "51", max: "80", label: "Bras" },
    { min: "81", max: "100", label: "Jambes" },
  ]);

  // preview
  const [previewValues, setPreviewValues] = useState("4, 6, 1, 5");
  const [previewSides, setPreviewSides] = useState("20");
  const [previewModifier, setPreviewModifier] = useState("0");
  const [previewSign, setPreviewSign] = useState("1");
  const [previewResult, setPreviewResult] = useState("");

  const {
    error,
    pipelineRules,
    legacyRules,
    saveRule,
    removeRule,
  } = useRulesData({ db });

  function resetForm() {
    setEditingRule(null);
    setFormName("");

    setPipeOutput("sum");
    setSuccessThreshold("");
    setCritSuccessFaces("");
    setCritFailureFaces("");
    setSteps([]);

    setKeepN("5");
    setSuccessAt("5");
    setTakeIndex("0");
    setFacesInput("1");
    setRangeMin("1");
    setRangeMax("10");

    setRanges([
      { min: "1", max: "20", label: "Tête" },
      { min: "21", max: "50", label: "Torse" },
      { min: "51", max: "80", label: "Bras" },
      { min: "81", max: "100", label: "Jambes" },
    ]);

    setPreviewResult("");
  }

  function toFacesArray(input: string): number[] {
    return input
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n));
  }

  function buildPipelineParams(): PipelineParams {
    const threshold = successThreshold.trim() === "" ? null : Number(successThreshold);
    const cs = toFacesArray(critSuccessFaces);
    const cf = toFacesArray(critFailureFaces);

    return {
      steps,
      output: pipeOutput,
      crit_success_faces: cs,
      crit_failure_faces: cf,
      success_threshold: threshold,
    };
  }

  function openCreate() {
    resetForm();
    setFormName("Nouvelle règle");
    setPipeOutput("sum");
    setSteps([{ op: "sum" }]);
    setShowEditModal(true);
  }

  function openEdit(rule: RuleRow) {
    setEditingRule(rule);
    setFormName(rule.name);

    const p = safeParse(rule.params_json);

    if (rule.kind === "pipeline") {
      setSteps(Array.isArray(p.steps) ? p.steps : []);
      setPipeOutput((p.output as PipelineOutput) ?? "sum");
      setSuccessThreshold(p.success_threshold == null ? "" : String(p.success_threshold));
      setCritSuccessFaces(
        Array.isArray(p.crit_success_faces) ? p.crit_success_faces.join(", ") : ""
      );
      setCritFailureFaces(
        Array.isArray(p.crit_failure_faces) ? p.crit_failure_faces.join(", ") : ""
      );
    } else {
      setSteps([{ op: "sum" }]);
      setPipeOutput("sum");
      setSuccessThreshold("");
      setCritSuccessFaces("");
      setCritFailureFaces("");
    }

    setPreviewResult("");
    setShowEditModal(true);
  }

  function applyPreset(
    preset:
      | "SUM"
      | "D20"
      | "D100_CRIT"
      | "D100_LOC"
      | "KEEP_HIGHEST"
      | "SUCCESS_POOL"
  ) {
    setPreviewResult("");

    if (preset === "SUM") {
      setFormName("Somme (pipeline)");
      setPipeOutput("sum");
      setSteps([{ op: "sum" }]);
      setSuccessThreshold("");
      setCritSuccessFaces("");
      setCritFailureFaces("");
      return;
    }

    if (preset === "D20") {
      setFormName("D20 (crit 1/20) — pipeline");
      setPipeOutput("sum");
      setSteps([{ op: "take", index: 0 }, { op: "sum" }]);
      setSuccessThreshold("");
      setCritSuccessFaces("20");
      setCritFailureFaces("1");
      return;
    }

    if (preset === "D100_CRIT") {
      setFormName("D100 (crit 95-100 / 1-5) — pipeline");
      setPipeOutput("sum");
      setSteps([{ op: "take", index: 0 }, { op: "sum" }]);
      setSuccessThreshold("");
      setCritSuccessFaces("95,96,97,98,99,100");
      setCritFailureFaces("1,2,3,4,5");
      return;
    }

    if (preset === "D100_LOC") {
      setFormName("D100 localisation — pipeline");
      setPipeOutput("lookup_label");
      setSteps([
        {
          op: "lookup",
          ranges: ranges.map((r) => ({
            min: Number(r.min),
            max: Number(r.max),
            label: r.label,
          })),
        },
      ]);
      setSuccessThreshold("");
      setCritSuccessFaces("");
      setCritFailureFaces("");
      return;
    }

    if (preset === "KEEP_HIGHEST") {
      setFormName("Keep highest — pipeline");
      setPipeOutput("sum");
      setSteps([
        { op: "keep_highest", n: Math.max(0, Number(keepN || "0")) },
        { op: "sum" },
      ]);
      setSuccessThreshold("");
      setCritSuccessFaces("");
      setCritFailureFaces("");
      return;
    }

    if (preset === "SUCCESS_POOL") {
      setFormName("Pool à succès — pipeline");
      setPipeOutput("successes");
      setSteps([{ op: "count_successes", at_or_above: Math.max(0, Number(successAt || "0")) }]);
      setSuccessThreshold("");
      setCritSuccessFaces("");
      setCritFailureFaces("");
    }
  }

  function addStep(step: PipelineStep) {
    setSteps((prev) => [...prev, step]);
    setPreviewResult("");
  }

  function removeStepAt(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
    setPreviewResult("");
  }

  function moveStepUp(index: number) {
    if (index <= 0) return;
    setSteps((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setPreviewResult("");
  }

  function moveStepDown(index: number) {
    setSteps((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setPreviewResult("");
  }

  function computePreview() {
    try {
      const values = previewValues
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n));

      const params_json = stringifyPipeline(buildPipelineParams());

      const sides = Number(previewSides || "0");
      const modifier = Number(previewModifier || "0");
      const sign = Number(previewSign || "1");

      const res = evaluateRule("pipeline", params_json, {
        values,
        sides,
        modifier,
        sign,
      });

      setPreviewResult(formatPreviewResult(res));
    } catch (e: any) {
      setPreviewResult(e?.message ?? "Erreur preview");
    }
  }

  async function onSave() {
    const params_json = stringifyPipeline(buildPipelineParams());

    try {
      await saveRule({
        editingRule,
        name: formName,
        params_json,
      });

      setShowEditModal(false);
      resetForm();
    } catch {
      // l'erreur est déjà gérée dans useRulesData
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

      <Pressable onPress={openCreate} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
        <Text style={{ fontWeight: "600" }}>Créer une règle (pipeline)</Text>
      </Pressable>

      <ScrollView style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: "700" }}>Pipelines</Text>

        {pipelineRules.map((rule) => (
          <View
            key={rule.id}
            style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 10 }}
          >
            <Text style={{ fontWeight: "600" }}>{rule.name}</Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>
              type: {rule.kind} {rule.is_system === 1 ? "• système" : "• perso"}
            </Text>

            <Pressable
              disabled={rule.is_system === 1}
              onPress={() => openEdit(rule)}
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

            {rule.is_system !== 1 ? (
              <Pressable
                onPress={async () => {
                  try {
                    await removeRule(rule.id);
                  } catch {
                    // l'erreur est déjà gérée dans useRulesData
                  }
                }}
                style={{ marginTop: 8, padding: 8, borderWidth: 1, borderRadius: 8 }}
              >
                <Text>Supprimer</Text>
              </Pressable>
            ) : null}
          </View>
        ))}

        {legacyRules.length ? (
          <View style={{ marginTop: 18 }}>
            <Text style={{ fontWeight: "700" }}>Compatibilité (anciens types)</Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>
              Ces règles existent encore pour compatibilité.
            </Text>

            {legacyRules.map((rule) => (
              <View
                key={rule.id}
                style={{
                  marginTop: 10,
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: 0.75,
                }}
              >
                <Text style={{ fontWeight: "600" }}>{rule.name}</Text>
                <Text style={{ opacity: 0.7, marginTop: 4 }}>
                  type: {rule.kind} {rule.is_system === 1 ? "• système" : "• perso"}
                </Text>

                <Pressable
                  onPress={() => openEdit(rule)}
                  style={{ marginTop: 8, padding: 8, borderWidth: 1, borderRadius: 8 }}
                >
                  <Text>Voir</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowEditModal(false);
          resetForm();
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
              {editingRule ? "Éditer la règle" : "Créer une règle"} — pipeline
            </Text>

            <ScrollView style={{ marginTop: 12 }}>
              <Text>Nom</Text>
              <TextInput
                value={formName}
                onChangeText={setFormName}
                placeholder="Ex: D100 Localisation"
                style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
              />

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Presets</Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                <Pressable
                  onPress={() => applyPreset("SUM")}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>Somme</Text>
                </Pressable>

                <Pressable
                  onPress={() => applyPreset("D20")}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>D20 crit</Text>
                </Pressable>

                <Pressable
                  onPress={() => applyPreset("D100_CRIT")}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>D100 crit</Text>
                </Pressable>

                <Pressable
                  onPress={() => applyPreset("D100_LOC")}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>D100 localisation</Text>
                </Pressable>

                <Pressable
                  onPress={() => applyPreset("KEEP_HIGHEST")}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>Keep highest</Text>
                </Pressable>

                <Pressable
                  onPress={() => applyPreset("SUCCESS_POOL")}
                  style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>Pool succès</Text>
                </Pressable>
              </View>

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Options</Text>

              <Text style={{ marginTop: 8 }}>Output</Text>
              {(
                [
                  "sum",
                  "successes",
                  "count_equal",
                  "count_range",
                  "first_value",
                  "values",
                  "lookup_label",
                  "lookup_value",
                ] as const
              ).map((o) => (
                <Pressable
                  key={o}
                  onPress={() => setPipeOutput(o)}
                  style={{
                    marginTop: 6,
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 10,
                    opacity: pipeOutput === o ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontWeight: pipeOutput === o ? "700" : "400" }}>{o}</Text>
                </Pressable>
              ))}

              <Text style={{ marginTop: 12 }}>success_threshold (optionnel)</Text>
              <TextInput
                value={successThreshold}
                onChangeText={setSuccessThreshold}
                placeholder="ex: 12 (vide = null)"
                style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
                keyboardType="numeric"
              />

              <Text style={{ marginTop: 10 }}>crit_success_faces</Text>
              <TextInput
                value={critSuccessFaces}
                onChangeText={setCritSuccessFaces}
                placeholder="ex: 20"
                style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
              />

              <Text style={{ marginTop: 10 }}>crit_failure_faces</Text>
              <TextInput
                value={critFailureFaces}
                onChangeText={setCritFailureFaces}
                placeholder="ex: 1"
                style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
              />

              <Text style={{ marginTop: 14, fontWeight: "700" }}>Pipeline steps</Text>

              {steps.length === 0 ? (
                <Text style={{ marginTop: 8, opacity: 0.7 }}>
                  Aucune étape. Ajoute au moins une étape.
                </Text>
              ) : (
                steps.map((s, idx) => (
                  <View
                    key={idx}
                    style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}
                  >
                    <Text style={{ fontWeight: "700" }}>
                      #{idx + 1} — {s.op}
                    </Text>
                    <Text style={{ marginTop: 6, opacity: 0.8 }}>{JSON.stringify(s)}</Text>

                    <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                      <Pressable
                        onPress={() => moveStepUp(idx)}
                        style={{ padding: 8, borderWidth: 1, borderRadius: 10 }}
                      >
                        <Text>Monter</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => moveStepDown(idx)}
                        style={{ padding: 8, borderWidth: 1, borderRadius: 10 }}
                      >
                        <Text>Descendre</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => removeStepAt(idx)}
                        style={{ padding: 8, borderWidth: 1, borderRadius: 10 }}
                      >
                        <Text>Supprimer</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}

              <Text style={{ marginTop: 14, fontWeight: "700" }}>Ajouter une step</Text>

              <Pressable
                onPress={() => addStep({ op: "sum" })}
                style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ sum</Text>
              </Pressable>

              <Pressable
                onPress={() => addStep({ op: "sort_asc" })}
                style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ sort_asc</Text>
              </Pressable>

              <Pressable
                onPress={() => addStep({ op: "sort_desc" })}
                style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ sort_desc</Text>
              </Pressable>

              <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
                <Text style={{ fontWeight: "600" }}>keep_highest</Text>
                <TextInput
                  value={keepN}
                  onChangeText={setKeepN}
                  placeholder="n"
                  keyboardType="numeric"
                  style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
                />
                <Pressable
                  onPress={() =>
                    addStep({ op: "keep_highest", n: Math.max(0, Number(keepN || "0")) })
                  }
                  style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>+ keep_highest</Text>
                </Pressable>
              </View>

              <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
                <Text style={{ fontWeight: "600" }}>keep_lowest</Text>
                <TextInput
                  value={keepN}
                  onChangeText={setKeepN}
                  placeholder="n"
                  keyboardType="numeric"
                  style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
                />
                <Pressable
                  onPress={() =>
                    addStep({ op: "keep_lowest", n: Math.max(0, Number(keepN || "0")) })
                  }
                  style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>+ keep_lowest</Text>
                </Pressable>
              </View>

              <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
                <Text style={{ fontWeight: "600" }}>drop_highest</Text>
                <TextInput
                  value={keepN}
                  onChangeText={setKeepN}
                  placeholder="n"
                  keyboardType="numeric"
                  style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
                />
                <Pressable
                  onPress={() =>
                    addStep({ op: "drop_highest", n: Math.max(0, Number(keepN || "0")) })
                  }
                  style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>+ drop_highest</Text>
                </Pressable>
              </View>

              <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
                <Text style={{ fontWeight: "600" }}>drop_lowest</Text>
                <TextInput
                  value={keepN}
                  onChangeText={setKeepN}
                  placeholder="n"
                  keyboardType="numeric"
                  style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
                />
                <Pressable
                  onPress={() =>
                    addStep({ op: "drop_lowest", n: Math.max(0, Number(keepN || "0")) })
                  }
                  style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>+ drop_lowest</Text>
                </Pressable>
              </View>

              <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
                <Text style={{ fontWeight: "600" }}>count_successes</Text>
                <TextInput
                  value={successAt}
                  onChangeText={setSuccessAt}
                  placeholder="at_or_above"
                  keyboardType="numeric"
                  style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
                />
                <Pressable
                  onPress={() =>
                    addStep({
                      op: "count_successes",
                      at_or_above: Math.max(0, Number(successAt || "0")),
                    })
                  }
                  style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>+ count_successes</Text>
                </Pressable>
              </View>

              <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
                <Text style={{ fontWeight: "600" }}>count_equal</Text>
                <TextInput
                  value={facesInput}
                  onChangeText={setFacesInput}
                  placeholder="ex: 1 ou 1,10"
                  style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
                />
                <Pressable
                  onPress={() => addStep({ op: "count_equal", faces: toFacesArray(facesInput) })}
                  style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>+ count_equal</Text>
                </Pressable>
              </View>

              <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
                <Text style={{ fontWeight: "600" }}>count_range</Text>
                <TextInput
                  value={rangeMin}
                  onChangeText={setRangeMin}
                  placeholder="min"
                  keyboardType="numeric"
                  style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
                />
                <TextInput
                  value={rangeMax}
                  onChangeText={setRangeMax}
                  placeholder="max"
                  keyboardType="numeric"
                  style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
                />
                <Pressable
                  onPress={() =>
                    addStep({
                      op: "count_range",
                      min: Number(rangeMin || "0"),
                      max: Number(rangeMax || "0"),
                    })
                  }
                  style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>+ count_range</Text>
                </Pressable>
              </View>

              <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
                <Text style={{ fontWeight: "600" }}>take</Text>
                <TextInput
                  value={takeIndex}
                  onChangeText={setTakeIndex}
                  placeholder="index"
                  keyboardType="numeric"
                  style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
                />
                <Pressable
                  onPress={() =>
                    addStep({ op: "take", index: Math.max(0, Number(takeIndex || "0")) })
                  }
                  style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>+ take</Text>
                </Pressable>
              </View>

              <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
                <Text style={{ fontWeight: "600" }}>lookup ranges</Text>

                {ranges.map((r, i) => (
                  <View key={i} style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1 }}>
                    <Text style={{ fontWeight: "600" }}>Range #{i + 1}</Text>

                    <TextInput
                      value={r.min}
                      onChangeText={(v) =>
                        setRanges((prev) =>
                          prev.map((x, idx) => (idx === i ? { ...x, min: v } : x))
                        )
                      }
                      placeholder="min"
                      keyboardType="numeric"
                      style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
                    />
                    <TextInput
                      value={r.max}
                      onChangeText={(v) =>
                        setRanges((prev) =>
                          prev.map((x, idx) => (idx === i ? { ...x, max: v } : x))
                        )
                      }
                      placeholder="max"
                      keyboardType="numeric"
                      style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
                    />
                    <TextInput
                      value={r.label}
                      onChangeText={(v) =>
                        setRanges((prev) =>
                          prev.map((x, idx) => (idx === i ? { ...x, label: v } : x))
                        )
                      }
                      placeholder="label"
                      style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
                    />

                    <Pressable
                      onPress={() => setRanges((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{ marginTop: 8, padding: 8, borderWidth: 1, borderRadius: 10 }}
                    >
                      <Text>Supprimer range</Text>
                    </Pressable>
                  </View>
                ))}

                <Pressable
                  onPress={() =>
                    setRanges((prev) => [...prev, { min: "1", max: "1", label: "Nouvelle entrée" }])
                  }
                  style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>+ Ajouter une range</Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    addStep({
                      op: "lookup",
                      ranges: ranges.map((rr) => ({
                        min: Number(rr.min),
                        max: Number(rr.max),
                        label: rr.label,
                      })),
                    })
                  }
                  style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>+ Ajouter step lookup</Text>
                </Pressable>
              </View>

              <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1 }}>
                <Text style={{ fontWeight: "700" }}>Preview</Text>

                <Text style={{ marginTop: 10 }}>values</Text>
                <TextInput
                  value={previewValues}
                  onChangeText={setPreviewValues}
                  placeholder="ex: 4,6,1,5"
                  style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
                />

                <Text style={{ marginTop: 10 }}>sides</Text>
                <TextInput
                  value={previewSides}
                  onChangeText={setPreviewSides}
                  placeholder="ex: 20"
                  keyboardType="numeric"
                  style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
                />

                <Text style={{ marginTop: 10 }}>modifier</Text>
                <TextInput
                  value={previewModifier}
                  onChangeText={setPreviewModifier}
                  placeholder="ex: 3"
                  keyboardType="numeric"
                  style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
                />

                <Text style={{ marginTop: 10 }}>sign (+1 / -1)</Text>
                <TextInput
                  value={previewSign}
                  onChangeText={setPreviewSign}
                  placeholder="1"
                  keyboardType="numeric"
                  style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
                />

                <Pressable
                  onPress={computePreview}
                  style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text>Calculer</Text>
                </Pressable>

                {previewResult ? (
                  <Text style={{ marginTop: 10, opacity: 0.85, fontFamily: "monospace" }}>
                    {previewResult}
                  </Text>
                ) : null}
              </View>

              <View style={{ height: 10 }} />
            </ScrollView>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
              <Pressable
                onPress={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable onPress={onSave} style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}>
                <Text style={{ fontWeight: "700" }}>Sauvegarder</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}