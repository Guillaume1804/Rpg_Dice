import { useMemo, useState } from "react";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import {
  buildRulePayloadFromForm,
  createDefaultRuleFormState,
  fillRuleFormFromExistingRule,
  type RuleFormState,
} from "../helpers/ruleForm";
import { evaluateRule } from "../../../core/rules/evaluate";

function safeNumber(value: string, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function useHumanRuleEditor() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleRow | null>(null);
  const [form, setForm] = useState<RuleFormState>(createDefaultRuleFormState());
  const [previewValues, setPreviewValues] = useState("1, 2, 3");
  const [previewSides, setPreviewSides] = useState("6");
  const [previewModifier, setPreviewModifier] = useState("0");
  const [previewSign, setPreviewSign] = useState<"1" | "-1">("1");
  const [previewResult, setPreviewResult] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function resetForm() {
    setEditingRule(null);
    setForm(createDefaultRuleFormState());
    setPreviewValues("1, 2, 3");
    setPreviewSides("6");
    setPreviewModifier("0");
    setPreviewSign("1");
    setPreviewResult("");
    setFormError(null);
  }

  function openCreate() {
    resetForm();
    setShowEditModal(true);
  }

  function openEdit(rule: RuleRow) {
    setEditingRule(rule);
    setForm(fillRuleFormFromExistingRule(rule));
    setPreviewResult("");
    setFormError(null);
    setShowEditModal(true);
  }

  function closeEditor() {
    setShowEditModal(false);
    resetForm();
  }

  function updateForm<K extends keyof RuleFormState>(
    key: K,
    value: RuleFormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateRangeRow(
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      ranges: prev.ranges.map((row, i) =>
        i === index ? { ...row, [key]: value } : row,
      ),
    }));
  }

  function addRangeRow() {
    setForm((prev) => ({
      ...prev,
      ranges: [...prev.ranges, { min: "", max: "", label: "" }],
    }));
  }

  function removeRangeRow(index: number) {
    setForm((prev) => ({
      ...prev,
      ranges: prev.ranges.filter((_, i) => i !== index),
    }));
  }

  function getRulePayload() {
    setFormError(null);
    return buildRulePayloadFromForm(form);
  }

  function computePreview() {
    try {
      setFormError(null);
      const payload = buildRulePayloadFromForm(form);

      const values = previewValues
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => Number(item))
        .filter((n) => Number.isFinite(n));

      const result = evaluateRule(payload.kind, payload.params_json, {
        values,
        sides: safeNumber(previewSides, 6),
        modifier: safeNumber(previewModifier, 0),
        sign: previewSign === "-1" ? -1 : 1,
      });

      setPreviewResult(JSON.stringify(result, null, 2));
    } catch (e: any) {
      const message = e?.message ?? "Erreur de prévisualisation.";
      setFormError(message);
      setPreviewResult(message);
    }
  }

  const formName = useMemo(() => form.name, [form.name]);

  return {
    showEditModal,
    editingRule,
    form,
    formName,
    previewValues,
    previewSides,
    previewModifier,
    previewSign,
    previewResult,
    formError,

    setPreviewValues,
    setPreviewSides,
    setPreviewModifier,
    setPreviewSign,

    openCreate,
    openEdit,
    closeEditor,
    updateForm,
    updateRangeRow,
    addRangeRow,
    removeRangeRow,
    getRulePayload,
    computePreview,
  };
}