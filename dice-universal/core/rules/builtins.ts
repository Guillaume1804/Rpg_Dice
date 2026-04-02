// core/rules/builtins.ts 

import { registerRule } from "./registry";
import type {
  RuleEvaluator,
  SingleCheckParams,
  SuccessPoolParams,
  TableLookupParams,
} from "./types";

// --- SUM (par défaut) ---
const evalSum: RuleEvaluator = (_params, input) => {
  const total = input.values.reduce((a, b) => a + b, 0);
  return { kind: "sum", total, values: input.values };
};

// --- SINGLE CHECK ---
const evalSingleCheck: RuleEvaluator<SingleCheckParams & Record<string, unknown>> = (
  params,
  input,
) => {
  const natural = input.values[0] ?? 0;
  const modifier = Number(input.modifier ?? 0);
  const sign = Number(input.sign ?? 1);
  const final = natural * sign + modifier;

  const compare: "gte" | "lte" = params?.compare === "lte" ? "lte" : "gte";

  const critSuccessFaces = Array.isArray(params?.crit_success_faces)
    ? params.crit_success_faces.map(Number)
    : [Number(params?.critSuccess ?? 20)];

  const critFailureFaces = Array.isArray(params?.crit_failure_faces)
    ? params.crit_failure_faces.map(Number)
    : [Number(params?.critFailure ?? 1)];

  const threshold =
    params?.success_threshold != null
      ? Number(params.success_threshold)
      : params?.successThreshold != null
        ? Number(params.successThreshold)
        : null;

  if (critSuccessFaces.includes(natural)) {
    return {
      kind: "single_check",
      natural,
      final,
      threshold,
      compare,
      outcome: "crit_success",
    };
  }

  if (critFailureFaces.includes(natural)) {
    return {
      kind: "single_check",
      natural,
      final,
      threshold,
      compare,
      outcome: "crit_failure",
    };
  }

  if (threshold == null) {
    return {
      kind: "single_check",
      natural,
      final,
      threshold: null,
      compare,
      outcome: "success",
    };
  }

  const success = compare === "lte" ? final <= threshold : final >= threshold;

  return {
    kind: "single_check",
    natural,
    final,
    threshold,
    compare,
    outcome: success ? "success" : "failure",
  };
};

// --- SUCCESS POOL ---
const evalSuccessPool: RuleEvaluator<SuccessPoolParams & Record<string, unknown>> = (
  params,
  input,
) => {
  const successAtOrAbove =
    params?.success_at_or_above != null
      ? Number(params.success_at_or_above)
      : Number(params?.successAtOrAbove ?? 5);

  const failFaces = Array.isArray(params?.fail_faces)
    ? params.fail_faces.map(Number)
    : [Number(params?.critFailureFace ?? 1)];

  const glitchRule = String(
    params?.glitch_rule ?? params?.glitchRule ?? "ones_gt_successes",
  );

  const successes = input.values.filter((v) => v >= successAtOrAbove).length;
  const failCount = input.values.filter((v) => failFaces.includes(v)).length;

  let outcome: "crit_glitch" | "glitch" | "success" | "failure" = "success";

  if (glitchRule === "ones_gte_successes") {
    if (failCount >= successes) {
      outcome = successes === 0 ? "crit_glitch" : "glitch";
    } else {
      outcome = successes > 0 ? "success" : "failure";
    }
  } else if (glitchRule === "none") {
    outcome = successes > 0 ? "success" : "failure";
  } else {
    if (failCount > successes) {
      outcome = successes === 0 ? "crit_glitch" : "glitch";
    } else {
      outcome = successes > 0 ? "success" : "failure";
    }
  }

  return {
    kind: "success_pool",
    successes,
    fail_count: failCount,
    fail_faces: failFaces,
    outcome,
  };
};

// --- TABLE LOOKUP ---
const evalTableLookup: RuleEvaluator<TableLookupParams & Record<string, unknown>> = (
  params,
  input,
) => {
  const v = input.values[0] ?? 0;
  const ranges = Array.isArray(params?.ranges)
    ? params.ranges
    : Array.isArray(params?.mapping)
      ? params.mapping
      : [];

  const defaultLabel = String(params?.defaultLabel ?? "Normal");

  for (const r of ranges) {
    const min = Number(r?.min);
    const max = Number(r?.max);
    const label = String(r?.label ?? "");
    if (Number.isFinite(min) && Number.isFinite(max) && v >= min && v <= max) {
      return {
        kind: "table_lookup",
        value: v,
        label: label || defaultLabel,
      };
    }
  }

  return { kind: "table_lookup", value: v, label: defaultLabel };
};

export function registerBuiltins() {
  registerRule("sum", evalSum);

  registerRule("single_check", evalSingleCheck);
  registerRule("success_pool", evalSuccessPool);
  registerRule("table_lookup", evalTableLookup);

  // Compat legacy temporaire
  registerRule("d20", evalSingleCheck);
  registerRule("pool", evalSuccessPool);
}