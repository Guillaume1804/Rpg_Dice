import type {
  RuleScope,
  RuleUsageKind,
} from "../../data/repositories/rulesRepo";
import { getRuleBehaviorByKey, type RuleBehaviorKey } from "./behaviorCatalog";

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

function buildUiSchemaJson(behaviorKey: RuleBehaviorKey): string | null {
  const behavior = getRuleBehaviorByKey(behaviorKey);
  if (!behavior) return null;

  return JSON.stringify({
    behavior_key: behavior.key,
    category: behavior.category,
    fields: behavior.fields,
  });
}

function buildBasePayload(
  input: RuleBuildInput,
  params: Record<string, unknown>,
  kind: string,
  scope: RuleScope,
): BuiltRulePayload {
  const behavior = getRuleBehaviorByKey(input.behaviorKey);

  return {
    name: `${input.actionName.trim()} — règle`,
    kind,
    behavior_key: behavior?.key ?? input.behaviorKey,
    category: behavior?.category ?? null,
    params_json: JSON.stringify(params),
    ui_schema_json: buildUiSchemaJson(input.behaviorKey),
    supported_sides_json: JSON.stringify([input.sides]),
    scope,
    usage_kind: "generated",
  };
}

export function buildRuleFromBehavior(input: RuleBuildInput): BuiltRulePayload {
  if (!input.actionName.trim()) {
    throw new Error("Le nom de l’action est obligatoire.");
  }

  if (!Number.isFinite(input.sides) || input.sides <= 0) {
    throw new Error("Le type de dé est obligatoire.");
  }

  if (input.behaviorKey === "single_check") {
    return buildBasePayload(
      input,
      {
        compare: input.compare ?? "gte",
        success_threshold: parseOptionalNumber(input.successThreshold),
        crit_success_faces: parseNumberList(input.critSuccessFaces),
        crit_failure_faces: parseNumberList(input.critFailureFaces),
      },
      "single_check",
      "entry",
    );
  }

  if (input.behaviorKey === "success_pool") {
    return buildBasePayload(
      input,
      {
        success_at_or_above: Number(input.successAtOrAbove ?? "5"),
        fail_faces: parseNumberList(input.failFaces),
        glitch_rule: input.glitchRule ?? "ones_gt_successes",
      },
      "success_pool",
      "group",
    );
  }

  if (input.behaviorKey === "sum_total") {
    return buildBasePayload(input, {}, "sum", "entry");
  }

  if (input.behaviorKey === "banded_sum") {
    return buildBasePayload(
      input,
      {
        bands: parseValidRanges(input.ranges),
        defaultLabel: "—",
      },
      "banded_sum",
      "entry",
    );
  }

  if (input.behaviorKey === "highest_of_pool") {
    return buildBasePayload(
      input,
      {
        compare: input.compare ?? "gte",
        success_threshold: parseOptionalNumber(input.successThreshold),
        crit_success_faces: parseNumberList(input.critSuccessFaces),
        crit_failure_faces: parseNumberList(input.critFailureFaces),
      },
      "highest_of_pool",
      "entry",
    );
  }

  if (input.behaviorKey === "lowest_of_pool") {
    return buildBasePayload(
      input,
      {
        compare: input.compare ?? "gte",
        success_threshold: parseOptionalNumber(input.successThreshold),
        crit_success_faces: parseNumberList(input.critSuccessFaces),
        crit_failure_faces: parseNumberList(input.critFailureFaces),
      },
      "lowest_of_pool",
      "entry",
    );
  }

  if (input.behaviorKey === "keep_highest_n") {
    return buildBasePayload(
      input,
      {
        keep: Number(input.keepCount ?? "1"),
        result_mode: input.resultMode ?? "sum",
      },
      "keep_highest_n",
      "entry",
    );
  }

  if (input.behaviorKey === "keep_lowest_n") {
    return buildBasePayload(
      input,
      {
        keep: Number(input.keepCount ?? "1"),
        result_mode: input.resultMode ?? "sum",
      },
      "keep_lowest_n",
      "entry",
    );
  }

  if (input.behaviorKey === "drop_highest_n") {
    return buildBasePayload(
      input,
      {
        drop: Number(input.dropCount ?? "1"),
        result_mode: input.resultMode ?? "sum",
      },
      "drop_highest_n",
      "entry",
    );
  }

  if (input.behaviorKey === "drop_lowest_n") {
    return buildBasePayload(
      input,
      {
        drop: Number(input.dropCount ?? "1"),
        result_mode: input.resultMode ?? "sum",
      },
      "drop_lowest_n",
      "entry",
    );
  }

  if (input.behaviorKey === "table_lookup") {
    return buildBasePayload(
      input,
      {
        ranges: parseValidRanges(input.ranges),
        defaultLabel: "—",
      },
      "table_lookup",
      "entry",
    );
  }

  throw new Error(`Comportement non supporté: ${input.behaviorKey}`);
}
