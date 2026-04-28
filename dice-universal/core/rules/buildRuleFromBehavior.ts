// dice-universal/core/rules/buildRuleFromBehavior.ts

import type {
  RuleScope,
  RuleUsageKind,
} from "../../data/repositories/rulesRepo";
import {
  getRuleBehaviorDefinition,
  type RuleBehaviorKey,
} from "./behaviorRegistry";

export type RuleBuildInput = {
  actionName: string;
  behaviorKey: RuleBehaviorKey;
  sides: number;
  compare?: "gte" | "lte";
  successThreshold?: string;
  critSuccessFaces?: string;
  critFailureFaces?: string;
  successAtOrAbove?: string;
  failFaces?: string;
  glitchRule?: string;
  ranges?: {
    min: string;
    max: string;
    label: string;
  }[];
  keepCount?: string;
  dropCount?: string;
  resultMode?: string;
  targetValue?: string;
  degreeStep?: string;
  critSuccessMin?: string;
  critSuccessMax?: string;
  critFailureMin?: string;
  critFailureMax?: string;
};

export type BuiltRulePayload = {
  name: string;
  kind: string;
  behavior_key: string | null;
  category: string | null;
  params_json: string;
  ui_schema_json: string | null;
  supported_sides_json: string;
  scope: RuleScope;
  usage_kind: RuleUsageKind;
};

function parseNumberList(value?: string): number[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);
}

function parseOptionalNumber(value?: string): number | null {
  if (value == null || value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseValidRanges(
  ranges?: {
    min: string;
    max: string;
    label: string;
  }[],
) {
  if (!ranges) return [];

  return ranges
    .map((row) => ({
      min: Number(row.min),
      max: Number(row.max),
      label: row.label.trim(),
    }))
    .filter(
      (row) =>
        Number.isFinite(row.min) &&
        Number.isFinite(row.max) &&
        row.label.length > 0,
    );
}

function getInputValue(input: RuleBuildInput, key: string): unknown {
  switch (key) {
    case "compare":
      return input.compare ?? "gte";

    case "successThreshold":
      return parseOptionalNumber(input.successThreshold);

    case "critSuccessFaces":
      return parseNumberList(input.critSuccessFaces);

    case "critFailureFaces":
      return parseNumberList(input.critFailureFaces);

    case "successAtOrAbove":
      return Number(input.successAtOrAbove ?? "5");

    case "failFaces":
      return parseNumberList(input.failFaces);

    case "glitchRule":
      return input.glitchRule ?? "ones_gt_successes";

    case "keepCount":
      return Number(input.keepCount ?? "1");

    case "dropCount":
      return Number(input.dropCount ?? "1");

    case "resultMode":
      return input.resultMode === "values" ? "values" : "sum";

    case "ranges":
      return parseValidRanges(input.ranges);

    case "targetValue":
      return Number(input.targetValue ?? "0");

    case "degreeStep":
      return Number(input.degreeStep ?? "10");

    case "critSuccessMin":
      return parseOptionalNumber(input.critSuccessMin);

    case "critSuccessMax":
      return parseOptionalNumber(input.critSuccessMax);

    case "critFailureMin":
      return parseOptionalNumber(input.critFailureMin);

    case "critFailureMax":
      return parseOptionalNumber(input.critFailureMax);

    default:
      return undefined;
  }
}

function buildParams(input: RuleBuildInput): Record<string, unknown> {
  const behavior = getRuleBehaviorDefinition(input.behaviorKey);
  if (!behavior) {
    throw new Error(`Comportement non supporté: ${input.behaviorKey}`);
  }

  const params: Record<string, unknown> = {};

  for (const field of behavior.fields) {
    const paramsKey = field.paramsKey ?? field.key;

    params[paramsKey] = getInputValue(input, field.key);
  }

  if (input.behaviorKey === "table_lookup") {
    params.defaultLabel = "—";
  }

  if (input.behaviorKey === "banded_sum") {
    params.defaultLabel = "—";
  }

  return params;
}

function buildUiSchemaJson(behaviorKey: RuleBehaviorKey): string | null {
  const behavior = getRuleBehaviorDefinition(behaviorKey);
  if (!behavior) return null;

  return JSON.stringify({
    behavior_key: behavior.key,
    category: behavior.defaultScope,
    fields: behavior.fields,
  });
}

function resolveScope(behaviorKey: RuleBehaviorKey): RuleScope {
  const behavior = getRuleBehaviorDefinition(behaviorKey);

  if (!behavior) return "entry";

  return behavior.defaultScope === "both" ? "entry" : behavior.defaultScope;
}

export function buildRuleFromBehavior(input: RuleBuildInput): BuiltRulePayload {
  if (!input.actionName.trim()) {
    throw new Error("Le nom de l’action est obligatoire.");
  }

  if (!Number.isFinite(input.sides) || input.sides <= 0) {
    throw new Error("Le type de dé est obligatoire.");
  }

  const behavior = getRuleBehaviorDefinition(input.behaviorKey);

  if (!behavior) {
    throw new Error(`Comportement non supporté: ${input.behaviorKey}`);
  }

  return {
    name: `${input.actionName.trim()} — règle`,
    kind: behavior.kind,
    behavior_key: behavior.key,
    category: behavior.defaultScope,
    params_json: JSON.stringify(buildParams(input)),
    ui_schema_json: buildUiSchemaJson(input.behaviorKey),
    supported_sides_json: JSON.stringify([input.sides]),
    scope: resolveScope(input.behaviorKey),
    usage_kind: "generated",
  };
}
