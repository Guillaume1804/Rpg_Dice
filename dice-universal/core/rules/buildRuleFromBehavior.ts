import type { RuleScope } from "../../data/repositories/rulesRepo";
import type { RuleBehaviorKey } from "./behaviorCatalog";

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
};

export type BuiltRulePayload = {
  name: string;
  kind: string;
  params_json: string;
  supported_sides_json: string;
  scope: RuleScope;
};

function parseNumberList(value?: string): number[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((n) => Number.isFinite(n));
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

function parseOptionalNumber(value?: string): number | null {
  if (value == null || value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildRuleFromBehavior(input: RuleBuildInput): BuiltRulePayload {
  const supported_sides_json = JSON.stringify([input.sides]);
  const baseName = `${input.actionName.trim()} — règle`;

  if (!input.actionName.trim()) {
    throw new Error("Le nom de l’action est obligatoire.");
  }

  if (!Number.isFinite(input.sides) || input.sides <= 0) {
    throw new Error("Le type de dé est obligatoire.");
  }

  if (input.behaviorKey === "single_check") {
    return {
      name: baseName,
      kind: "single_check",
      params_json: JSON.stringify({
        compare: input.compare ?? "gte",
        success_threshold: parseOptionalNumber(input.successThreshold),
        crit_success_faces: parseNumberList(input.critSuccessFaces),
        crit_failure_faces: parseNumberList(input.critFailureFaces),
      }),
      supported_sides_json,
      scope: "entry",
    };
  }

  if (input.behaviorKey === "success_pool") {
    return {
      name: baseName,
      kind: "success_pool",
      params_json: JSON.stringify({
        success_at_or_above: Number(input.successAtOrAbove ?? "5"),
        fail_faces: parseNumberList(input.failFaces),
        glitch_rule: input.glitchRule ?? "ones_gt_successes",
      }),
      supported_sides_json,
      scope: "group",
    };
  }

  if (input.behaviorKey === "sum_total") {
    return {
      name: baseName,
      kind: "sum",
      params_json: JSON.stringify({}),
      supported_sides_json,
      scope: "entry",
    };
  }

  if (input.behaviorKey === "banded_sum") {
    return {
      name: baseName,
      kind: "banded_sum",
      params_json: JSON.stringify({
        bands: parseValidRanges(input.ranges),
        defaultLabel: "—",
      }),
      supported_sides_json,
      scope: "entry",
    };
  }

  if (input.behaviorKey === "highest_of_pool") {
    return {
      name: baseName,
      kind: "highest_of_pool",
      params_json: JSON.stringify({
        compare: input.compare ?? "gte",
        success_threshold: parseOptionalNumber(input.successThreshold),
        crit_success_faces: parseNumberList(input.critSuccessFaces),
        crit_failure_faces: parseNumberList(input.critFailureFaces),
      }),
      supported_sides_json,
      scope: "entry",
    };
  }

  if (input.behaviorKey === "lowest_of_pool") {
    return {
      name: baseName,
      kind: "lowest_of_pool",
      params_json: JSON.stringify({
        compare: input.compare ?? "gte",
        success_threshold: parseOptionalNumber(input.successThreshold),
        crit_success_faces: parseNumberList(input.critSuccessFaces),
        crit_failure_faces: parseNumberList(input.critFailureFaces),
      }),
      supported_sides_json,
      scope: "entry",
    };
  }

  if (input.behaviorKey === "keep_highest_n") {
    return {
      name: baseName,
      kind: "keep_highest_n",
      params_json: JSON.stringify({
        keep: Number(input.keepCount ?? "1"),
        result_mode: input.resultMode ?? "sum",
      }),
      supported_sides_json,
      scope: "entry",
    };
  }

  if (input.behaviorKey === "keep_lowest_n") {
    return {
      name: baseName,
      kind: "keep_lowest_n",
      params_json: JSON.stringify({
        keep: Number(input.keepCount ?? "1"),
        result_mode: input.resultMode ?? "sum",
      }),
      supported_sides_json,
      scope: "entry",
    };
  }

  if (input.behaviorKey === "drop_highest_n") {
    return {
      name: baseName,
      kind: "drop_highest_n",
      params_json: JSON.stringify({
        drop: Number(input.dropCount ?? "1"),
        result_mode: input.resultMode ?? "sum",
      }),
      supported_sides_json,
      scope: "entry",
    };
  }

  if (input.behaviorKey === "drop_lowest_n") {
    return {
      name: baseName,
      kind: "drop_lowest_n",
      params_json: JSON.stringify({
        drop: Number(input.dropCount ?? "1"),
        result_mode: input.resultMode ?? "sum",
      }),
      supported_sides_json,
      scope: "entry",
    };
  }

  if (input.behaviorKey === "table_lookup") {
    return {
      name: baseName,
      kind: "table_lookup",
      params_json: JSON.stringify({
        ranges: parseValidRanges(input.ranges),
        defaultLabel: "—",
      }),
      supported_sides_json,
      scope: "entry",
    };
  }

  throw new Error(`Comportement non supporté: ${input.behaviorKey}`);
}
