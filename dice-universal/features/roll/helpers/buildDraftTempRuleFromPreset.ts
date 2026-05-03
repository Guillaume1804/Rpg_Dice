// dice-universal\features\roll\helpers\buildDraftTempRuleFromPreset.ts

import { buildRuleFromBehavior } from "../../../core/rules/buildRuleFromBehavior";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import type { RuleUsageKind } from "../../../data/repositories/rulesRepo";

export type QuickRulePresetScope = "entry" | "group";

export type QuickRulePresetDefinition = {
  key: string;
  label: string;
  description?: string;
  scope: QuickRulePresetScope;
  supportedSides?: number[];
  behaviorKey: RuleBehaviorKey;
  defaultValues?: Record<string, unknown>;
};

export type DraftTempRule = {
  id: string;
  name: string;
  kind: string;
  behavior_key: string | null;
  category: string | null;
  params_json: string;
  ui_schema_json: string | null;
  usage_kind: RuleUsageKind;
};

function readString(
  values: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = values?.[key];
  return typeof value === "string" ? value : undefined;
}

function readCompare(
  values: Record<string, unknown> | undefined,
): "gte" | "lte" | undefined {
  const value = values?.compare;
  return value === "gte" || value === "lte" ? value : undefined;
}

function readRanges(
  values: Record<string, unknown> | undefined,
  key: string,
):
  | {
      min: string;
      max: string;
      label: string;
    }[]
  | undefined {
  const value = values?.[key];
  if (!Array.isArray(value)) return undefined;

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const row = item as {
        min?: unknown;
        max?: unknown;
        label?: unknown;
      };

      if (
        typeof row.min !== "string" ||
        typeof row.max !== "string" ||
        typeof row.label !== "string"
      ) {
        return null;
      }

      return {
        min: row.min,
        max: row.max,
        label: row.label,
      };
    })
    .filter(
      (
        row,
      ): row is {
        min: string;
        max: string;
        label: string;
      } => row !== null,
    );
}

function parseNumberList(value: unknown): number[] {
  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);
}

function parseOptionalPositiveInt(value: unknown): number | null {
  if (typeof value !== "string") return null;

  const text = value.trim();
  if (!text) return null;

  const n = Number(text);
  if (!Number.isFinite(n) || n <= 0) return null;

  return Math.floor(n);
}

function readBoolean(
  values: Record<string, unknown> | undefined,
  key: string,
  fallback: boolean,
): boolean {
  const value = values?.[key];
  return typeof value === "boolean" ? value : fallback;
}

function readPipelineOutput(values: Record<string, unknown> | undefined) {
  const value = values?.pipelineOutput;

  if (
    value === "sum" ||
    value === "successes" ||
    value === "count_equal" ||
    value === "count_range" ||
    value === "first_value" ||
    value === "values"
  ) {
    return value;
  }

  return "sum";
}

function buildQuickPipelineParams(values: Record<string, unknown> | undefined) {
  const steps: any[] = [];

  const rerollFaces = parseNumberList(values?.pipelineRerollFaces);
  if (rerollFaces.length > 0) {
    const maxRerolls = parseOptionalPositiveInt(values?.pipelineMaxRerolls);

    steps.push({
      op: "reroll",
      faces: rerollFaces,
      once: readBoolean(values, "pipelineRerollOnce", true),
      ...(maxRerolls != null ? { max_rerolls: maxRerolls } : {}),
    });
  }

  const explodeFaces = parseNumberList(values?.pipelineExplodeFaces);
  if (explodeFaces.length > 0) {
    const maxExplosions = parseOptionalPositiveInt(
      values?.pipelineMaxExplosions,
    );

    steps.push({
      op: "explode",
      faces: explodeFaces,
      ...(maxExplosions != null ? { max_explosions: maxExplosions } : {}),
    });
  }

  const keepHighest = parseOptionalPositiveInt(values?.pipelineKeepHighest);
  if (keepHighest != null) {
    steps.push({ op: "keep_highest", n: keepHighest });
  }

  const keepLowest = parseOptionalPositiveInt(values?.pipelineKeepLowest);
  if (keepLowest != null) {
    steps.push({ op: "keep_lowest", n: keepLowest });
  }

  const dropHighest = parseOptionalPositiveInt(values?.pipelineDropHighest);
  if (dropHighest != null) {
    steps.push({ op: "drop_highest", n: dropHighest });
  }

  const dropLowest = parseOptionalPositiveInt(values?.pipelineDropLowest);
  if (dropLowest != null) {
    steps.push({ op: "drop_lowest", n: dropLowest });
  }

  const countSuccessAtOrAbove = parseOptionalPositiveInt(
    values?.pipelineCountSuccessAtOrAbove,
  );

  if (countSuccessAtOrAbove != null) {
    steps.push({
      op: "count_successes",
      at_or_above: countSuccessAtOrAbove,
    });
  }

  const countEqualFaces = parseNumberList(values?.pipelineCountEqualFaces);
  if (countEqualFaces.length > 0) {
    steps.push({
      op: "count_equal",
      faces: countEqualFaces,
    });
  }

  const countRangeMin = Number(values?.pipelineCountRangeMin);
  const countRangeMax = Number(values?.pipelineCountRangeMax);

  if (
    typeof values?.pipelineCountRangeMin === "string" &&
    typeof values?.pipelineCountRangeMax === "string" &&
    values.pipelineCountRangeMin.trim() !== "" &&
    values.pipelineCountRangeMax.trim() !== "" &&
    Number.isFinite(countRangeMin) &&
    Number.isFinite(countRangeMax)
  ) {
    steps.push({
      op: "count_range",
      min: countRangeMin,
      max: countRangeMax,
    });
  }

  const thresholdRaw = values?.pipelineSuccessThreshold;
  const successThreshold =
    typeof thresholdRaw === "string" && thresholdRaw.trim() !== ""
      ? Number(thresholdRaw)
      : null;

  const compare =
    values?.pipelineCompare === "lte" || values?.pipelineCompare === "gte"
      ? values.pipelineCompare
      : "gte";

  return {
    steps,
    output: readPipelineOutput(values),
    success_threshold:
      successThreshold != null && Number.isFinite(successThreshold)
        ? successThreshold
        : undefined,
    compare,
    crit_success_faces: parseNumberList(values?.pipelineCritSuccessFaces),
    crit_failure_faces: parseNumberList(values?.pipelineCritFailureFaces),
    complication_faces: parseNumberList(values?.pipelineComplicationFaces),

    complication_rule:
      values?.pipelineComplicationRule === "any" ||
      values?.pipelineComplicationRule === "gt_successes" ||
      values?.pipelineComplicationRule === "gte_successes" ||
      values?.pipelineComplicationRule === "zero_successes" ||
      values?.pipelineComplicationRule === "none"
        ? values.pipelineComplicationRule
        : "none",
  };
}

export function buildDraftTempRuleFromPreset(params: {
  preset: QuickRulePresetDefinition;
  sides: number;
  actionName?: string;
}): DraftTempRule {
  const { preset, sides, actionName } = params;

  if (preset.behaviorKey === "custom_pipeline") {
    const paramsJson = JSON.stringify(
      buildQuickPipelineParams(preset.defaultValues),
    );

    return {
      id: `temp-rule-${preset.key}-${sides}`,
      name: `${actionName ?? preset.label} — règle`,
      kind: "pipeline",
      behavior_key: "custom_pipeline",
      category: preset.scope,
      params_json: paramsJson,
      ui_schema_json: JSON.stringify({
        behavior_key: "custom_pipeline",
        category: preset.scope,
        fields: [],
      }),
      usage_kind: "generated",
    };
  }

  const built = buildRuleFromBehavior({
    actionName: actionName ?? preset.label,
    behaviorKey: preset.behaviorKey,
    sides,
    compare: readCompare(preset.defaultValues),
    successThreshold: readString(preset.defaultValues, "successThreshold"),
    critSuccessFaces: readString(preset.defaultValues, "critSuccessFaces"),
    critFailureFaces: readString(preset.defaultValues, "critFailureFaces"),
    targetValue: readString(preset.defaultValues, "targetValue"),
    degreeStep: readString(preset.defaultValues, "degreeStep"),
    critSuccessMin: readString(preset.defaultValues, "critSuccessMin"),
    critSuccessMax: readString(preset.defaultValues, "critSuccessMax"),
    critFailureMin: readString(preset.defaultValues, "critFailureMin"),
    critFailureMax: readString(preset.defaultValues, "critFailureMax"),
    successAtOrAbove: readString(preset.defaultValues, "successAtOrAbove"),
    failFaces: readString(preset.defaultValues, "failFaces"),
    glitchRule: readString(preset.defaultValues, "glitchRule"),
    ranges: readRanges(preset.defaultValues, "ranges"),
    keepCount: readString(preset.defaultValues, "keepCount"),
    dropCount: readString(preset.defaultValues, "dropCount"),
    resultMode: readString(preset.defaultValues, "resultMode"),
  });

  return {
    id: `temp-rule-${preset.key}-${sides}`,
    name: built.name,
    kind: built.kind,
    behavior_key: built.behavior_key,
    category: built.category,
    params_json: built.params_json,
    ui_schema_json: built.ui_schema_json,
    usage_kind: built.usage_kind,
  };
}
