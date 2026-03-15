import { useState } from "react";
import { RuleRow } from "../../../data/repositories/rulesRepo";
import { evaluateRule } from "../../../core/rules/evaluate";

export type RangeRow = { min: string; max: string; label: string };

export type PipelineStep =
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

export type PipelineOutput =
  | "sum"
  | "successes"
  | "count_equal"
  | "count_range"
  | "first_value"
  | "values"
  | "lookup_label"
  | "lookup_value";

export type PipelineParams = {
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

export function useRulesEditor() {
  const [showEditModal, setShowEditModal] = useState(false);

  const [editingRule, setEditingRule] = useState<RuleRow | null>(null);
  const [formName, setFormName] = useState("");

  const [pipeOutput, setPipeOutput] = useState<PipelineOutput>("sum");
  const [successThreshold, setSuccessThreshold] = useState("");
  const [critSuccessFaces, setCritSuccessFaces] = useState("");
  const [critFailureFaces, setCritFailureFaces] = useState("");

  const [steps, setSteps] = useState<PipelineStep[]>([]);

  const [keepN, setKeepN] = useState("5");
  const [successAt, setSuccessAt] = useState("5");
  const [takeIndex, setTakeIndex] = useState("0");
  const [facesInput, setFacesInput] = useState("1");
  const [rangeMin, setRangeMin] = useState("1");
  const [rangeMax, setRangeMax] = useState("10");

  const [ranges, setRanges] = useState<RangeRow[]>([
    { min: "1", max: "20", label: "Tête" },
    { min: "21", max: "50", label: "Torse" },
    { min: "51", max: "80", label: "Bras" },
    { min: "81", max: "100", label: "Jambes" },
  ]);

  const [previewValues, setPreviewValues] = useState("4, 6, 1, 5");
  const [previewSides, setPreviewSides] = useState("20");
  const [previewModifier, setPreviewModifier] = useState("0");
  const [previewSign, setPreviewSign] = useState("1");
  const [previewResult, setPreviewResult] = useState("");

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

    setPreviewValues("4, 6, 1, 5");
    setPreviewSides("20");
    setPreviewModifier("0");
    setPreviewSign("1");
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

  function getParamsJson() {
    return stringifyPipeline(buildPipelineParams());
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

  function closeEditor() {
    setShowEditModal(false);
    resetForm();
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
      setSteps([
        {
          op: "count_successes",
          at_or_above: Math.max(0, Number(successAt || "0")),
        },
      ]);
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

      const params_json = getParamsJson();

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

  return {
    showEditModal,
    setShowEditModal,

    editingRule,
    formName,
    setFormName,

    pipeOutput,
    setPipeOutput,
    successThreshold,
    setSuccessThreshold,
    critSuccessFaces,
    setCritSuccessFaces,
    critFailureFaces,
    setCritFailureFaces,

    steps,
    keepN,
    setKeepN,
    successAt,
    setSuccessAt,
    takeIndex,
    setTakeIndex,
    facesInput,
    setFacesInput,
    rangeMin,
    setRangeMin,
    rangeMax,
    setRangeMax,
    ranges,
    setRanges,

    previewValues,
    setPreviewValues,
    previewSides,
    setPreviewSides,
    previewModifier,
    setPreviewModifier,
    previewSign,
    setPreviewSign,
    previewResult,

    resetForm,
    toFacesArray,
    buildPipelineParams,
    getParamsJson,
    openCreate,
    openEdit,
    closeEditor,
    applyPreset,
    addStep,
    removeStepAt,
    moveStepUp,
    moveStepDown,
    computePreview,
  };
}