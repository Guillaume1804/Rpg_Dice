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
  glitch_rule?: "ones_gt_successes" | "ones_gte_successes" | "none";
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
    outcome: "crit_glitch" | "glitch" | "success" | "failure";
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