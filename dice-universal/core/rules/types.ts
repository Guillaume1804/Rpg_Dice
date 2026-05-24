// core/rules/types.ts

export type RuleInput = {
  values: number[];
  sides?: number;
  modifier?: number;
  sign?: number;
};

export type SingleCheckParams = {
  compare?: "gte" | "lte";
  success_threshold?: number | null;
  crit_success_faces?: number[];
  crit_failure_faces?: number[];
};

export type SuccessPoolParams = {
  success_at_or_above: number;
  fail_faces?: number[];
  glitch_rule?:
    | "none"
    | "any_special_failure"
    | "special_failures_gt_successes"
    | "special_failures_gte_successes"
    | "special_failures_gt_half_dice"
    | "special_failures_gte_half_dice"
    | "special_failures_gt_half_successes"
    | "special_failures_gte_half_successes"
    | "ones_gt_successes"
    | "ones_gte_successes";

  critical_failure_rule?:
    | "none"
    | "zero_successes"
    | "all_special_failures"
    | "special_failures_gt_successes"
    | "special_failures_gte_successes"
    | "complication_and_zero_successes"
    | "complication_and_failure";

  critical_success_rule?:
    | "none"
    | "successes_gte_threshold"
    | "all_dice_successes"
    | "all_dice_max_faces"
    | "any_max_face"
    | "any_critical_face";

  critical_success_threshold?: number | null;
  critical_success_faces?: number[];
};

export type TableLookupRange = {
  min: number;
  max: number;
  label: string;
};

export type TableLookupParams = {
  ranges: TableLookupRange[];
  defaultLabel?: string;
};

export type BandedSumBand = {
  min: number;
  max: number;
  label: string;
};

export type BandedSumParams = {
  bands: BandedSumBand[];
  defaultLabel?: string;
};

export type HighestOfPoolParams = {
  compare?: "gte" | "lte";
  success_threshold?: number | null;
  crit_success_faces?: number[];
  crit_failure_faces?: number[];
};

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
  | { op: "lookup"; ranges: TableLookupRange[] }
  | { op: "sum" };

export type PipelineComplicationRule =
  | "none"
  | "any"
  | "gt_successes"
  | "gte_successes"
  | "zero_successes"
  | "gt_half_dice"
  | "gte_half_dice"
  | "gt_half_successes"
  | "gte_half_successes";

export type PipelineCriticalFailureRule =
  | "none"
  | "zero_successes"
  | "all_complication_faces"
  | "complications_gt_successes"
  | "complications_gte_successes"
  | "complication_and_zero_successes"
  | "complication_and_failed_threshold";

export type PipelineCriticalSuccessRule =
  | "none"
  | "successes_gte_threshold"
  | "all_dice_successes"
  | "all_dice_max_faces"
  | "any_max_face"
  | "any_critical_face";

export type PipelineParams = {
  steps: PipelineStep[];
  output?:
    | "sum"
    | "successes"
    | "count_equal"
    | "count_range"
    | "first_value"
    | "values"
    | "lookup_label"
    | "lookup_value";
  crit_success_faces?: number[];
  crit_failure_faces?: number[];
  success_threshold?: number | null;
  compare?: "gte" | "lte";

  complication_faces?: number[];
  complication_rule?: PipelineComplicationRule;

  critical_failure_rule?: PipelineCriticalFailureRule;
  critical_success_rule?: PipelineCriticalSuccessRule;
  critical_success_threshold?: number | null;
  critical_success_faces?: number[];

  degree_target?: number | null;
  degree_compare?: "gte" | "lte";
  degree_step?: number | null;
  degree_crit_success_min?: number | null;
  degree_crit_success_max?: number | null;
  degree_crit_failure_min?: number | null;
  degree_crit_failure_max?: number | null;
};

export type UniversalRuleParams =
  | SingleCheckParams
  | SuccessPoolParams
  | TableLookupParams
  | BandedSumParams
  | HighestOfPoolParams
  | PipelineParams
  | Record<string, unknown>;

export type RuleResult =
  | { kind: "sum"; total: number; values?: number[] }
  | {
      kind: "single_check";
      outcome: "crit_success" | "crit_failure" | "success" | "failure";
      threshold: number | null;
      natural: number;
      final: number;
      compare: "gte" | "lte";
    }
  | {
      kind: "success_pool";
      successes: number;
      fail_count: number;
      fail_faces: number[];
      dice_count: number;
      success_at_or_above: number;
      complication: boolean;
      critical_success: boolean;
      critical_failure: boolean;
      complication_rule: string;
      critical_failure_rule: string;
      critical_success_rule: string;
      outcome:
        | "crit_success"
        | "crit_glitch"
        | "crit_failure"
        | "glitch"
        | "success"
        | "failure";
    }
  | { kind: "table_lookup"; value: number; label: string }
  | { kind: "banded_sum"; total: number; label: string }
  | {
      kind: "highest_of_pool";
      kept: number;
      natural_values: number[];
      threshold: number | null;
      final: number;
      compare: "gte" | "lte";
      outcome: "crit_success" | "crit_failure" | "success" | "failure";
    }
  | {
      kind: "pipeline";
      values: number[];
      kept: number[];
      final: number | null;
      meta: any;
    }
  | { kind: "unknown"; message: string };

export type RuleEvaluator<TParams = UniversalRuleParams> = (
  params: TParams,
  input: RuleInput,
) => RuleResult;
