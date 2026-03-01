import { registerRule } from "./registry";
import type { RuleEvaluator } from "./types";

// --- SUM (par défaut) ---
const evalSum: RuleEvaluator = (_params, input) => {
  const total = input.values.reduce((a, b) => a + b, 0);
  return { kind: "sum", total };
};

// --- D20 ---
const evalD20: RuleEvaluator = (params, input) => {
  const v = input.values[0] ?? 0;
  const critSuccess = Number(params?.critSuccess ?? 20);
  const critFailure = Number(params?.critFailure ?? 1);
  const threshold = params?.successThreshold == null ? null : Number(params.successThreshold);

  if (v === critSuccess) return { kind: "d20", value: v, outcome: "crit_success", threshold };
  if (v === critFailure) return { kind: "d20", value: v, outcome: "crit_failure", threshold };

  if (threshold == null) {
    // si pas de seuil, on renvoie "success" par défaut (tu peux changer plus tard)
    return { kind: "d20", value: v, outcome: "success", threshold: null };
  }

  return { kind: "d20", value: v, outcome: v >= threshold ? "success" : "failure", threshold };
};

// --- POOL (Shadowrun-like / pool D6, etc.) ---
const evalPool: RuleEvaluator = (params, input) => {
  const successAtOrAbove = Number(params?.successAtOrAbove ?? 5); // ex: Shadowrun 5+
  const critFailureFace = Number(params?.critFailureFace ?? 1);   // ex: 1
  const glitchRule = String(params?.glitchRule ?? "ones_gt_successes"); // ones_gt_successes

  const successes = input.values.filter((v) => v >= successAtOrAbove).length;
  const ones = input.values.filter((v) => v === critFailureFace).length;

  // outcome
  let outcome: "crit_glitch" | "glitch" | "success" | "failure" = "success";

  if (glitchRule === "ones_gt_successes") {
    if (ones > successes) outcome = successes === 0 ? "crit_glitch" : "glitch";
    else outcome = successes > 0 ? "success" : "failure";
  } else {
    // fallback
    outcome = successes > 0 ? "success" : "failure";
  }

  return { kind: "pool", successes, ones, outcome };
};

// --- TABLE LOOKUP (localisation, tables de crit, etc.) ---
// params: { ranges: [{min,max,label}], defaultLabel? }
const evalTableLookup: RuleEvaluator = (params, input) => {
  const v = input.values[0] ?? 0;
  const ranges = Array.isArray(params?.ranges) ? params.ranges : [];
  const defaultLabel = String(params?.defaultLabel ?? "Normal");

  for (const r of ranges) {
    const min = Number(r?.min);
    const max = Number(r?.max);
    const label = String(r?.label ?? "");
    if (Number.isFinite(min) && Number.isFinite(max) && v >= min && v <= max) {
      return { kind: "table_lookup", value: v, label: label || defaultLabel };
    }
  }
  return { kind: "table_lookup", value: v, label: defaultLabel };
};

export function registerBuiltins() {
  registerRule("sum", evalSum);
  registerRule("d20", evalD20);
  registerRule("pool", evalPool);
  registerRule("table_lookup", evalTableLookup);
}
