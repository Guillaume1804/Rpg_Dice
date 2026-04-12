import { useState } from "react";
import { evaluateRule } from "../../../core/rules/evaluate";
import type { RuleRow, RuleScope } from "../../../data/repositories/rulesRepo";
import { parseSupportedSides } from "../../../data/repositories/rulesRepo";
import type { RuleFamilyKey } from "../config/ruleFamilies";
import {
  createDefaultRuleFormState,
  buildRulePayloadFromForm,
  fillRuleFormFromExistingRule,
  type RuleFormState,
  type RuleRangeFormRow,
} from "../helpers/ruleForm";

function formatPreviewResult(res: any): string {
  if (!res) return "";

  if (res.kind === "sum") {
    return `Somme = ${res.total}`;
  }

  if (res.kind === "single_check") {
    return JSON.stringify(
      {
        kind: res.kind,
        outcome: res.outcome,
        natural: res.natural,
        final: res.final,
        threshold: res.threshold,
        compare: res.compare,
      },
      null,
      2,
    );
  }

  if (res.kind === "success_pool") {
    return JSON.stringify(
      {
        kind: res.kind,
        outcome: res.outcome,
        successes: res.successes,
        fail_count: res.fail_count,
        fail_faces: res.fail_faces,
      },
      null,
      2,
    );
  }

  if (res.kind === "banded_sum") {
    return JSON.stringify(
      {
        kind: res.kind,
        total: res.total,
        label: res.label,
      },
      null,
      2,
    );
  }

  if (res.kind === "highest_of_pool") {
    return JSON.stringify(
      {
        kind: res.kind,
        outcome: res.outcome,
        kept: res.kept,
        natural_values: res.natural_values,
        final: res.final,
        threshold: res.threshold,
        compare: res.compare,
      },
      null,
      2,
    );
  }

  if (res.kind === "table_lookup") {
    return JSON.stringify(
      {
        kind: res.kind,
        value: res.value,
        label: res.label,
      },
      null,
      2,
    );
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
      2,
    );
  }

  return JSON.stringify(res, null, 2);
}

function normalizeSidesInput(value: string): string {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
}

function parseSupportedSidesInput(value: string): number[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function useRulesEditor() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleRow | null>(null);

  const [formState, setFormState] = useState<RuleFormState>(
    createDefaultRuleFormState(),
  );

  const [scope, setScope] = useState<RuleScope>("entry");
  const [supportedSidesInput, setSupportedSidesInput] = useState("");

  const [previewValues, setPreviewValues] = useState("4, 6, 1, 5");
  const [previewSides, setPreviewSides] = useState("20");
  const [previewModifier, setPreviewModifier] = useState("0");
  const [previewSign, setPreviewSign] = useState("1");
  const [previewResult, setPreviewResult] = useState("");

  function resetForm() {
    setEditingRule(null);
    setFormState(createDefaultRuleFormState());
    setScope("entry");
    setSupportedSidesInput("");
    setPreviewValues("4, 6, 1, 5");
    setPreviewSides("20");
    setPreviewModifier("0");
    setPreviewSign("1");
    setPreviewResult("");
  }

  function openCreate() {
    resetForm();
    setFormState((prev) => ({
      ...prev,
      name: "Nouvelle règle",
    }));
    setShowEditModal(true);
  }

  function openEdit(rule: RuleRow) {
    setEditingRule(rule);
    setFormState(fillRuleFormFromExistingRule(rule));
    setScope(rule.scope ?? "entry");
    setSupportedSidesInput(parseSupportedSides(rule).join(", "));
    setPreviewResult("");
    setShowEditModal(true);
  }

  function closeEditor() {
    setShowEditModal(false);
    resetForm();
  }

  function setRuleName(value: string) {
    setFormState((prev) => ({ ...prev, name: value }));
  }

  function setRuleFamily(value: RuleFamilyKey) {
    setFormState((prev) => ({ ...prev, family: value }));
  }

  function setCompare(value: "gte" | "lte") {
    setFormState((prev) => ({ ...prev, compare: value }));
  }

  function setSuccessThreshold(value: string) {
    setFormState((prev) => ({ ...prev, successThreshold: value }));
  }

  function setCritSuccessFaces(value: string) {
    setFormState((prev) => ({ ...prev, critSuccessFaces: value }));
  }

  function setCritFailureFaces(value: string) {
    setFormState((prev) => ({ ...prev, critFailureFaces: value }));
  }

  function setSuccessAtOrAbove(value: string) {
    setFormState((prev) => ({ ...prev, successAtOrAbove: value }));
  }

  function setFailFaces(value: string) {
    setFormState((prev) => ({ ...prev, failFaces: value }));
  }

  function setGlitchRule(
    value: "ones_gt_successes" | "ones_gte_successes" | "none",
  ) {
    setFormState((prev) => ({ ...prev, glitchRule: value }));
  }

  function setRanges(
    updater:
      | RuleRangeFormRow[]
      | ((prev: RuleRangeFormRow[]) => RuleRangeFormRow[]),
  ) {
    setFormState((prev) => ({
      ...prev,
      ranges: typeof updater === "function" ? updater(prev.ranges) : updater,
    }));
  }

  function addRangeRow() {
    setRanges((prev) => [...prev, { min: "", max: "", label: "" }]);
  }

  function removeRangeRow(index: number) {
    setRanges((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRangeRow(index: number, patch: Partial<RuleRangeFormRow>) {
    setRanges((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function getRulePayload() {
    const base = buildRulePayloadFromForm(formState);

    return {
      ...base,
      supported_sides_json: JSON.stringify(
        parseSupportedSidesInput(supportedSidesInput),
      ),
      scope,
    };
  }

  function computePreview() {
    try {
      const payload = getRulePayload();

      const values = previewValues
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => Number(item))
        .filter((n) => Number.isFinite(n));

      const sides = Number(previewSides || "0");
      const modifier = Number(previewModifier || "0");
      const sign = Number(previewSign || "1");

      const result = evaluateRule(payload.kind, payload.params_json, {
        values,
        sides,
        modifier,
        sign,
      });

      setPreviewResult(formatPreviewResult(result));
    } catch (e: any) {
      setPreviewResult(e?.message ?? "Erreur preview");
    }
  }

  return {
    showEditModal,
    setShowEditModal,

    editingRule,

    formState,
    setFormState,

    ruleName: formState.name,
    setRuleName,

    ruleFamily: formState.family,
    setRuleFamily,

    compare: formState.compare,
    setCompare,

    successThreshold: formState.successThreshold,
    setSuccessThreshold,

    critSuccessFaces: formState.critSuccessFaces,
    setCritSuccessFaces,

    critFailureFaces: formState.critFailureFaces,
    setCritFailureFaces,

    successAtOrAbove: formState.successAtOrAbove,
    setSuccessAtOrAbove,

    failFaces: formState.failFaces,
    setFailFaces,

    glitchRule: formState.glitchRule,
    setGlitchRule,

    ranges: formState.ranges,
    setRanges,
    addRangeRow,
    removeRangeRow,
    updateRangeRow,

    scope,
    setScope,

    supportedSidesInput,
    setSupportedSidesInput: (value: string) =>
      setSupportedSidesInput(normalizeSidesInput(value)),

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
    openCreate,
    openEdit,
    closeEditor,
    getRulePayload,
    computePreview,
  };
}
