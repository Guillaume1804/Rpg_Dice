// dice-universal\features\rules\hooks\useHumanRuleEditor.ts

import { useMemo, useState } from "react";
import type { RuleRow, RuleScope } from "../../../data/repositories/rulesRepo";
import type { ActionWizardDraft } from "../../tables/actionWizard/types";
import {
  buildRulePayloadFromForm,
  createDefaultRuleFormState,
  fillRuleFormFromExistingRule,
  type RuleFormState,
} from "../helpers/ruleForm";
import { buildCanonicalLocalRuleName } from "../../tables/actionWizard/ruleNaming";
import { evaluateRule } from "../../../core/rules/evaluate";

function safeNumber(value: string, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parsePreviewValues(value: string): number[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((n) => Number.isFinite(n));
}

function stringifyPreviewResult(result: any): string {
  return JSON.stringify(result, null, 2);
}

function toHumanEditorAdvancedBehaviorType(
  behaviorType: ActionWizardDraft["behaviorType"],
): RuleFormState["advancedBehaviorType"] {
  switch (behaviorType) {
    case "sum_total":
    case "single_check":
    case "success_pool":
    case "table_lookup":
    case "banded_sum":
    case "highest_of_pool":
    case "lowest_of_pool":
    case "keep_highest_n":
    case "keep_lowest_n":
    case "drop_highest_n":
    case "drop_lowest_n":
      return behaviorType;

    default:
      return "single_check";
  }
}

function buildFormStateFromWizardDraft(
  draft: ActionWizardDraft,
  tableName: string,
): RuleFormState {
  const base = createDefaultRuleFormState();

  return {
    ...base,
    name: buildCanonicalLocalRuleName(tableName, draft.behaviorType),
    family:
      draft.behaviorType === "success_pool"
        ? "success_pool"
        : draft.behaviorType === "banded_sum"
          ? "banded_sum"
          : draft.behaviorType === "highest_of_pool"
            ? "highest_of_pool"
            : draft.behaviorType === "table_lookup"
              ? "table_lookup"
              : "single_check",

    advancedBehaviorType: toHumanEditorAdvancedBehaviorType(draft.behaviorType),

    supportedSidesText: draft.die.sides ? String(draft.die.sides) : "",
    scope: draft.behaviorType === "success_pool" ? "group" : "entry",

    compare: draft.compare,
    successThreshold: draft.successThreshold,
    critSuccessFaces: draft.critSuccessFaces,
    critFailureFaces: draft.critFailureFaces,

    successAtOrAbove: draft.successAtOrAbove,
    failFaces: draft.failFaces,
    glitchRule: draft.glitchRule,

    keepCount: draft.keepCount,
    dropCount: draft.dropCount,
    resultMode: draft.resultMode,

    ranges: draft.ranges.map((row) => ({
      min: row.min,
      max: row.max,
      label: row.label,
    })),
  };
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

  function openCreateFromWizard(draft: ActionWizardDraft, tableName: string) {
    if (
      draft.behaviorType === "custom_pipeline" ||
      draft.behaviorType === "threshold_degrees"
    ) {
      setFormError(
        "Ce type de règle doit être configuré directement dans le wizard d’action ou le wizard de règle moderne.",
      );
      return;
    }

    resetForm();

    const nextForm = buildFormStateFromWizardDraft(draft, tableName);

    setEditingRule(null);
    setForm(nextForm);

    setPreviewSides(draft.die.sides ? String(draft.die.sides) : "6");
    setPreviewModifier(String(draft.die.modifier ?? 0));
    setPreviewSign(draft.die.sign === -1 ? "-1" : "1");
    setPreviewValues("1, 2, 3");
    setPreviewResult("");
    setFormError(null);
    setShowEditModal(true);
  }

  function openEdit(rule: RuleRow) {
    if (rule.kind === "pipeline") {
      resetForm();
      setEditingRule(null);
      setFormError(
        "Les règles pipeline personnalisées ne sont pas éditables dans cet ancien éditeur. Utilise le wizard de règle moderne.",
      );
      return;
    }

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

  function setScope(scope: RuleScope) {
    setForm((prev) => ({
      ...prev,
      scope,
    }));
  }

  function setSupportedSidesText(value: string) {
    setForm((prev) => ({
      ...prev,
      supportedSidesText: value,
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
      const values = parsePreviewValues(previewValues);

      const result = evaluateRule(payload.kind, payload.params_json, {
        values,
        sides: safeNumber(previewSides, 6),
        modifier: safeNumber(previewModifier, 0),
        sign: previewSign === "-1" ? -1 : 1,
      });

      setPreviewResult(stringifyPreviewResult(result));
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
    openCreateFromWizard,
    openEdit,
    closeEditor,

    updateForm,
    updateRangeRow,
    addRangeRow,
    removeRangeRow,
    setScope,
    setSupportedSidesText,

    getRulePayload,
    computePreview,
  };
}
