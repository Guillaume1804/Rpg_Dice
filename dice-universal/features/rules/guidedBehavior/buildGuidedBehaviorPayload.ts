// dice-universal/features/rules/guidedBehavior/buildGuidedBehaviorPayload.ts

import type {
  CreateRuleInput,
  RuleScope,
} from "../../../data/repositories/rulesRepo";
import type {
  PipelineComplicationRule,
  PipelineCriticalFailureRule,
  PipelineCriticalSuccessRule,
  PipelineParams,
  PipelineStep,
  TableLookupRange,
} from "../../../core/rules/types";

import { resolveGuidedBehaviorScope } from "./resolveGuidedBehaviorScope";
import type {
  GuidedBehaviorComplicationRule,
  GuidedBehaviorCriticalFailureRule,
  GuidedBehaviorCriticalSuccessRule,
  GuidedBehaviorDraft,
  GuidedBehaviorKeepDropMode,
  GuidedBehaviorPrimaryOutput,
  GuidedBehaviorReadingMode,
} from "./types";

function parseNumberList(value: string): number[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);
}

function parseNumberOrNull(value: string): number | null {
  const text = value.trim();
  if (!text) return null;

  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

function parsePositiveIntOrNull(value: string): number | null {
  const n = parseNumberOrNull(value);
  if (n == null || n <= 0) return null;
  return Math.floor(n);
}

function parseRanges(
  ranges: GuidedBehaviorDraft["reading"]["tableRanges"],
): TableLookupRange[] {
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

function getSupportedSidesJson(draft: GuidedBehaviorDraft) {
  if (draft.diceCompatibility === "all") {
    return "[]";
  }

  const sides = draft.diceCompatibility.sides
    .map(Number)
    .filter((side) => Number.isFinite(side) && side > 0);

  return JSON.stringify(sides);
}

function getCategoryFromReadingMode(readingMode: GuidedBehaviorReadingMode) {
  switch (readingMode) {
    case "sum":
      return "sum";
    case "single_check":
      return "check";
    case "threshold_degrees":
      return "degrees";
    case "success_pool":
      return "pool";
    case "table_lookup":
      return "lookup";
    default:
      return "custom";
  }
}

function hasTransform(draft: GuidedBehaviorDraft) {
  return (
    draft.transforms.reroll.enabled ||
    draft.transforms.explode.enabled ||
    draft.transforms.keepDrop.mode !== "none"
  );
}

function hasAdvancedEvents(draft: GuidedBehaviorDraft) {
  if (draft.reading.mode === "success_pool") {
    return false;
  }

  if (draft.reading.mode === "single_check") {
    return draft.events.complication.enabled;
  }

  if (draft.reading.mode === "threshold_degrees") {
    return draft.events.complication.enabled;
  }

  return (
    draft.events.criticalSuccess.enabled ||
    draft.events.criticalFailure.enabled ||
    draft.events.complication.enabled
  );
}

function shouldBuildPipeline(draft: GuidedBehaviorDraft) {
  if (draft.intent === "advanced") return true;
  if (hasTransform(draft)) return true;
  if (hasAdvancedEvents(draft)) return true;
  if (draft.output.primary === "pipeline_final") return true;

  return false;
}

function mapKeepDropModeToPipelineStep(
  mode: GuidedBehaviorKeepDropMode,
  count: number,
): PipelineStep | null {
  switch (mode) {
    case "keep_highest":
      return { op: "keep_highest", n: count };
    case "keep_lowest":
      return { op: "keep_lowest", n: count };
    case "drop_highest":
      return { op: "drop_highest", n: count };
    case "drop_lowest":
      return { op: "drop_lowest", n: count };
    case "none":
    default:
      return null;
  }
}

function mapComplicationRuleToPipeline(
  rule: GuidedBehaviorComplicationRule,
): PipelineComplicationRule {
  switch (rule) {
    case "any_special_failure":
      return "any";
    case "special_failures_gt_successes":
      return "gt_successes";
    case "special_failures_gte_successes":
      return "gte_successes";
    case "special_failures_gt_half_dice":
      return "gt_half_dice";
    case "special_failures_gte_half_dice":
      return "gte_half_dice";
    case "none":
    default:
      return "none";
  }
}

function mapCriticalFailureRuleToPipeline(
  rule: GuidedBehaviorCriticalFailureRule,
): PipelineCriticalFailureRule {
  switch (rule) {
    case "zero_successes":
      return "zero_successes";
    case "all_special_failures":
      return "all_complication_faces";
    case "special_failures_gt_successes":
      return "complications_gt_successes";
    case "special_failures_gte_successes":
      return "complications_gte_successes";
    case "complication_and_zero_successes":
      return "complication_and_zero_successes";
    case "complication_and_failure":
      return "complication_and_failed_threshold";
    case "none":
    default:
      return "none";
  }
}

function mapCriticalSuccessRuleToPipeline(
  rule: GuidedBehaviorCriticalSuccessRule,
): PipelineCriticalSuccessRule {
  switch (rule) {
    case "successes_gte_threshold":
      return "successes_gte_threshold";
    case "all_dice_successes":
      return "all_dice_successes";
    case "all_dice_max_faces":
      return "all_dice_max_faces";
    case "any_max_face":
      return "any_max_face";
    case "any_critical_face":
      return "any_critical_face";
    case "explosion_chain_critical":
      return "explosion_chain_critical";
    case "none":
    default:
      return "none";
  }
}

function getCriticalSuccessFacesForPipeline(
  draft: GuidedBehaviorDraft,
): number[] {
  const explicitFaces = parseNumberList(draft.events.criticalSuccess.faces);

  if (explicitFaces.length > 0) {
    return explicitFaces;
  }

  if (draft.events.criticalSuccess.rule === "explosion_chain_critical") {
    return parseNumberList(draft.transforms.explode.faces);
  }

  return explicitFaces;
}

function getPipelineOutputFromPrimaryOutput(
  output: GuidedBehaviorPrimaryOutput,
): PipelineParams["output"] {
  switch (output) {
    case "successes":
      return "successes";
    case "table_label":
      return "lookup_label";
    case "kept_values":
      return "values";
    case "pipeline_final":
      return "sum";
    case "total":
    case "outcome":
    case "degrees":
    default:
      return "sum";
  }
}

function buildBasePayload(params: {
  draft: GuidedBehaviorDraft;
  kind: string;
  behaviorKey: string;
  scope: RuleScope;
  params: Record<string, unknown>;
}): CreateRuleInput {
  const { draft, kind, behaviorKey, scope, params: ruleParams } = params;

  return {
    name: draft.name.trim(),
    kind,
    behavior_key: behaviorKey,
    category: getCategoryFromReadingMode(draft.reading.mode),
    scope,
    supported_sides_json: getSupportedSidesJson(draft),
    params_json: JSON.stringify(ruleParams),
    ui_schema_json: JSON.stringify({
      builder: "guided_behavior_v1",
      description: draft.description.trim(),
      intent: draft.intent,
      applicationMode: draft.applicationMode,
      output: draft.output,
    }),
    is_system: 0,
    usage_kind: "user_template",
  };
}

function buildSimplePayload(draft: GuidedBehaviorDraft): CreateRuleInput {
  const scope = resolveGuidedBehaviorScope(draft);

  if (draft.reading.mode === "sum") {
    return buildBasePayload({
      draft,
      kind: "sum",
      behaviorKey: "sum_total",
      scope,
      params: {},
    });
  }

  if (draft.reading.mode === "single_check") {
    return buildBasePayload({
      draft,
      kind: "single_check",
      behaviorKey: "single_check",
      scope,
      params: {
        compare: draft.reading.compare,
        success_threshold: parseNumberOrNull(draft.reading.successThreshold),
        crit_success_faces: draft.events.criticalSuccess.enabled
          ? parseNumberList(draft.events.criticalSuccess.faces)
          : [],
        crit_failure_faces: draft.events.criticalFailure.enabled
          ? parseNumberList(draft.events.criticalFailure.faces)
          : [],
      },
    });
  }

  if (draft.reading.mode === "threshold_degrees") {
    return buildBasePayload({
      draft,
      kind: "threshold_degrees",
      behaviorKey: "threshold_degrees",
      scope,
      params: {
        compare: draft.reading.compare,
        target_value: parseNumberOrNull(draft.reading.targetValue),
        degree_step: parsePositiveIntOrNull(draft.reading.degreeStep) ?? 10,
        crit_success_min: draft.events.criticalSuccess.enabled
          ? parseNumberOrNull(draft.events.criticalSuccess.min)
          : null,
        crit_success_max: draft.events.criticalSuccess.enabled
          ? parseNumberOrNull(draft.events.criticalSuccess.max)
          : null,
        crit_failure_min: draft.events.criticalFailure.enabled
          ? parseNumberOrNull(draft.events.criticalFailure.min)
          : null,
        crit_failure_max: draft.events.criticalFailure.enabled
          ? parseNumberOrNull(draft.events.criticalFailure.max)
          : null,
      },
    });
  }

  if (draft.reading.mode === "success_pool") {
    return buildBasePayload({
      draft,
      kind: "success_pool",
      behaviorKey: "success_pool",
      scope,
      params: {
        success_at_or_above:
          parsePositiveIntOrNull(draft.reading.successAtOrAbove) ?? 5,
        fail_faces: parseNumberList(draft.reading.failFaces),
        glitch_rule: draft.events.complication.enabled
          ? draft.events.complication.rule
          : "none",
        critical_failure_rule: draft.events.criticalFailure.enabled
          ? draft.events.criticalFailure.rule
          : "none",
        critical_success_rule: draft.events.criticalSuccess.enabled
          ? draft.events.criticalSuccess.rule
          : "none",
        critical_success_threshold: parseNumberOrNull(
          draft.events.criticalSuccess.threshold,
        ),
        critical_success_faces: parseNumberList(
          draft.events.criticalSuccess.faces,
        ),
      },
    });
  }

  if (draft.reading.mode === "table_lookup") {
    return buildBasePayload({
      draft,
      kind: "table_lookup",
      behaviorKey: "table_lookup",
      scope,
      params: {
        ranges: parseRanges(draft.reading.tableRanges),
        defaultLabel: "—",
      },
    });
  }

  return buildBasePayload({
    draft,
    kind: "sum",
    behaviorKey: "sum_total",
    scope,
    params: {},
  });
}

function buildPipelineSteps(draft: GuidedBehaviorDraft): PipelineStep[] {
  const steps: PipelineStep[] = [];

  if (draft.transforms.reroll.enabled) {
    const faces = parseNumberList(draft.transforms.reroll.faces);
    const maxRerolls = parsePositiveIntOrNull(
      draft.transforms.reroll.maxRerollsPerDie,
    );

    if (faces.length > 0) {
      steps.push({
        op: "reroll",
        faces,
        once: draft.transforms.reroll.once,
        ...(maxRerolls != null ? { max_rerolls: maxRerolls } : {}),
      });
    }
  }

  if (draft.transforms.explode.enabled) {
    const faces = parseNumberList(draft.transforms.explode.faces);
    const maxExplosions = parsePositiveIntOrNull(
      draft.transforms.explode.maxExplosionsPerDie,
    );

    if (faces.length > 0) {
      steps.push({
        op: "explode",
        faces,
        ...(maxExplosions != null ? { max_explosions: maxExplosions } : {}),
      });
    }
  }

  const keepDropCount =
    parsePositiveIntOrNull(draft.transforms.keepDrop.count) ?? 1;

  const keepDropStep = mapKeepDropModeToPipelineStep(
    draft.transforms.keepDrop.mode,
    keepDropCount,
  );

  if (keepDropStep) {
    steps.push(keepDropStep);
  }

  if (draft.reading.mode === "success_pool") {
    steps.push({
      op: "count_successes",
      at_or_above: parsePositiveIntOrNull(draft.reading.successAtOrAbove) ?? 5,
    });
  }

  if (draft.reading.mode === "table_lookup") {
    steps.push({
      op: "lookup",
      ranges: parseRanges(draft.reading.tableRanges),
    });
  }

  return steps;
}

function buildPipelineParams(draft: GuidedBehaviorDraft): PipelineParams {
  const params: PipelineParams = {
    steps: buildPipelineSteps(draft),
    output: getPipelineOutputFromPrimaryOutput(draft.output.primary),
  };

  if (draft.transforms.keepDrop.resultMode === "values") {
    params.output = "values";
  }

  if (draft.reading.mode === "single_check") {
    params.compare = draft.reading.compare;
    params.success_threshold = parseNumberOrNull(
      draft.reading.successThreshold,
    );
  }

  if (draft.reading.mode === "threshold_degrees") {
    params.output = "sum";
    params.degree_target = parseNumberOrNull(draft.reading.targetValue);
    params.degree_compare = draft.reading.compare;
    params.degree_step = parsePositiveIntOrNull(draft.reading.degreeStep) ?? 10;

    params.degree_crit_success_min = draft.events.criticalSuccess.enabled
      ? parseNumberOrNull(draft.events.criticalSuccess.min)
      : null;

    params.degree_crit_success_max = draft.events.criticalSuccess.enabled
      ? parseNumberOrNull(draft.events.criticalSuccess.max)
      : null;

    params.degree_crit_failure_min = draft.events.criticalFailure.enabled
      ? parseNumberOrNull(draft.events.criticalFailure.min)
      : null;

    params.degree_crit_failure_max = draft.events.criticalFailure.enabled
      ? parseNumberOrNull(draft.events.criticalFailure.max)
      : null;

    params.success_threshold = parseNumberOrNull(draft.reading.targetValue);
    params.compare = draft.reading.compare;
  }

  if (draft.reading.mode === "success_pool") {
    params.output = "successes";
    params.compare = "gte";
    params.success_threshold = 1;
  }

  if (draft.events.criticalSuccess.enabled) {
    const criticalSuccessFaces = getCriticalSuccessFacesForPipeline(draft);

    params.crit_success_faces = criticalSuccessFaces;

    params.critical_success_rule = mapCriticalSuccessRuleToPipeline(
      draft.events.criticalSuccess.rule,
    );

    params.critical_success_threshold = parseNumberOrNull(
      draft.events.criticalSuccess.threshold,
    );

    params.critical_success_faces = criticalSuccessFaces;
  }

  if (draft.events.criticalFailure.enabled) {
    params.crit_failure_faces = parseNumberList(
      draft.events.criticalFailure.faces,
    );

    params.critical_failure_rule = mapCriticalFailureRuleToPipeline(
      draft.events.criticalFailure.rule,
    );
  }

  if (draft.events.complication.enabled) {
    params.complication_faces = parseNumberList(
      draft.events.complication.faces,
    );
    params.complication_rule = mapComplicationRuleToPipeline(
      draft.events.complication.rule,
    );
  }

  return params;
}

function buildPipelinePayload(draft: GuidedBehaviorDraft): CreateRuleInput {
  return buildBasePayload({
    draft,
    kind: "pipeline",
    behaviorKey: "custom_pipeline",
    scope: resolveGuidedBehaviorScope(draft),
    params: buildPipelineParams(draft),
  });
}

export function buildGuidedBehaviorPayload(
  draft: GuidedBehaviorDraft,
): CreateRuleInput {
  if (!draft.name.trim()) {
    throw new Error("Le nom du comportement est obligatoire.");
  }

  if (shouldBuildPipeline(draft)) {
    return buildPipelinePayload(draft);
  }

  return buildSimplePayload(draft);
}

export function isGuidedBehaviorBuiltAsPipeline(
  draft: GuidedBehaviorDraft,
): boolean {
  return shouldBuildPipeline(draft);
}
