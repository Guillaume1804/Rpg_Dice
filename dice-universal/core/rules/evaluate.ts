// core/rules/evaluate.ts

import type { PipelineParams } from "./types";

export type EvalContext = {
  // valeurs naturelles (1..sides), déjà mappées sur l'entrée de dé
  values: number[];
  sides: number;

  // infos entrée (optionnelles selon appelant)
  modifier?: number;
  sign?: number; // +1 / -1
};

export type RuleResult =
  | { kind: "sum"; total: number; values: number[] }
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
    outcome:
    | "crit_success"
    | "success"
    | "failure"
    | "glitch"
    | "crit_glitch"
    | "crit_failure";
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
  }
  | { kind: "table_lookup"; label: string; value: number }
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
    kind: "lowest_of_pool";
    kept: number;
    natural_values: number[];
    threshold: number | null;
    final: number;
    compare: "gte" | "lte";
    outcome: "crit_success" | "crit_failure" | "success" | "failure";
  }
  | {
    kind: "keep_highest_n";
    kept: number[];
    natural_values: number[];
    final: number | number[] | null;
    result_mode: "sum" | "values";
  }
  | {
    kind: "keep_lowest_n";
    kept: number[];
    natural_values: number[];
    final: number | number[] | null;
    result_mode: "sum" | "values";
  }
  | {
    kind: "drop_highest_n";
    remaining: number[];
    natural_values: number[];
    final: number | number[] | null;
    result_mode: "sum" | "values";
  }
  | {
    kind: "drop_lowest_n";
    remaining: number[];
    natural_values: number[];
    final: number | number[] | null;
    result_mode: "sum" | "values";
  }
  | {
    kind: "pipeline";
    values: number[];
    kept: number[];
    final: number | null;
    meta: any;
  }
  | {
    kind: "threshold_degrees";
    roll: number;
    final: number;
    target: number;
    compare: "gte" | "lte";
    margin: number;
    degrees: number;
    outcome: "crit_success" | "crit_failure" | "success" | "failure";
    degree_step: number;
  }
  | { kind: "unknown"; message: string };

function safeParse(json: string) {
  try {
    return JSON.parse(json || "{}");
  } catch {
    return {};
  }
}

function applySignModifier(values: number[], sign: number, modifier: number) {
  const signed = values.map((v) => v * sign);
  const sum = signed.reduce((a, b) => a + b, 0) + modifier;
  return { signed, sum };
}

// --------------------------------------------------
// PIPELINE ENGINE
// --------------------------------------------------

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cloneArray(arr: number[]) {
  return [...arr];
}

function resolvePipelineDegrees(params: {
  final: number | null;
  naturalFirst: number;
  degreeTarget: number | null | undefined;
  degreeCompare: "gte" | "lte" | undefined;
  degreeStep: number | null | undefined;
  critSuccessMin: number | null | undefined;
  critSuccessMax: number | null | undefined;
  critFailureMin: number | null | undefined;
  critFailureMax: number | null | undefined;
}) {
  const {
    final,
    naturalFirst,
    degreeTarget,
    degreeCompare,
    degreeStep,
    critSuccessMin,
    critSuccessMax,
    critFailureMin,
    critFailureMax,
  } = params;

  if (final == null) return null;
  if (degreeTarget == null || !Number.isFinite(degreeTarget)) return null;

  const compare: "gte" | "lte" = degreeCompare === "lte" ? "lte" : "gte";
  const safeDegreeStep =
    degreeStep != null && Number.isFinite(degreeStep) && degreeStep > 0
      ? degreeStep
      : 10;

  const isSuccess =
    compare === "lte" ? final <= degreeTarget : final >= degreeTarget;
  const margin =
    compare === "lte" ? degreeTarget - final : final - degreeTarget;

  const degrees = Math.max(
    1,
    1 + Math.floor(Math.abs(margin) / safeDegreeStep),
  );

  const hasCritSuccessRange =
    critSuccessMin != null &&
    critSuccessMax != null &&
    Number.isFinite(critSuccessMin) &&
    Number.isFinite(critSuccessMax);

  const hasCritFailureRange =
    critFailureMin != null &&
    critFailureMax != null &&
    Number.isFinite(critFailureMin) &&
    Number.isFinite(critFailureMax);

  const isCritSuccess =
    hasCritSuccessRange &&
    naturalFirst >= Number(critSuccessMin) &&
    naturalFirst <= Number(critSuccessMax);

  const isCritFailure =
    hasCritFailureRange &&
    naturalFirst >= Number(critFailureMin) &&
    naturalFirst <= Number(critFailureMax);

  let outcome: "crit_success" | "crit_failure" | "success" | "failure";

  if (isCritSuccess) {
    outcome = "crit_success";
  } else if (isCritFailure) {
    outcome = "crit_failure";
  } else {
    outcome = isSuccess ? "success" : "failure";
  }

  return {
    target: degreeTarget,
    final,
    compare,
    margin,
    degrees,
    degree_step: safeDegreeStep,
    outcome,
  };
}

function runPipeline(
  initialNatural: number[],
  ctx: EvalContext,
  params: PipelineParams,
): RuleResult {
  const sign = ctx.sign ?? 1;
  const modifier = ctx.modifier ?? 0;
  const sides = ctx.sides;

  let kept = cloneArray(initialNatural);

  const meta: any = {
    steps: [],
    successes: undefined,
    complications: undefined,
    complication_faces: undefined,
    count_equal: undefined,
    count_range: undefined,
    lookup: undefined,
  };

  for (const step of params.steps || []) {
    if (step.op === "keep_highest") {
      const sorted = cloneArray(kept).sort((a, b) => b - a);
      kept = sorted.slice(0, Math.max(0, step.n));
      meta.steps.push({ op: step.op, kept: cloneArray(kept) });
      continue;
    }

    if (step.op === "keep_lowest") {
      const sorted = cloneArray(kept).sort((a, b) => a - b);
      kept = sorted.slice(0, Math.max(0, step.n));
      meta.steps.push({ op: step.op, kept: cloneArray(kept) });
      continue;
    }

    if (step.op === "drop_highest") {
      const sorted = cloneArray(kept).sort((a, b) => b - a);
      kept = sorted.slice(Math.max(0, step.n));
      meta.steps.push({ op: step.op, kept: cloneArray(kept) });
      continue;
    }

    if (step.op === "drop_lowest") {
      const sorted = cloneArray(kept).sort((a, b) => a - b);
      kept = sorted.slice(Math.max(0, step.n));
      meta.steps.push({ op: step.op, kept: cloneArray(kept) });
      continue;
    }

    if (step.op === "take") {
      const idx = Math.max(0, step.index);
      kept = kept[idx] == null ? [] : [kept[idx]];
      meta.steps.push({ op: step.op, kept: cloneArray(kept) });
      continue;
    }

    if (step.op === "sort_asc") {
      kept = cloneArray(kept).sort((a, b) => a - b);
      meta.steps.push({ op: step.op, kept: cloneArray(kept) });
      continue;
    }

    if (step.op === "sort_desc") {
      kept = cloneArray(kept).sort((a, b) => b - a);
      meta.steps.push({ op: step.op, kept: cloneArray(kept) });
      continue;
    }

    if (step.op === "reroll") {
      const faces = new Set(step.faces || []);
      const maxRerollsPerDie = step.max_rerolls ?? 100;

      const next: number[] = [];

      for (const v of kept) {
        let cur = v;
        let localRerolls = 0;

        while (faces.has(cur) && localRerolls < maxRerollsPerDie) {
          localRerolls++;

          const previous = cur;
          const rolled = randInt(1, sides);

          meta.steps.push({
            op: "reroll_one",
            from: previous,
            to: rolled,
            chain_start: v,
            reroll_index: localRerolls,
          });

          cur = rolled;

          if (step.once) break;
        }

        next.push(cur);
      }

      kept = next;
      meta.steps.push({ op: step.op, kept: cloneArray(kept) });
      continue;
    }

    if (step.op === "explode") {
      const faces = new Set(step.faces || []);
      const maxExplosionsPerDie = step.max_explosions ?? 100;

      const next: number[] = [];

      for (const v of kept) {
        next.push(v);

        let cur = v;
        let localExplosions = 0;

        while (faces.has(cur) && localExplosions < maxExplosionsPerDie) {
          localExplosions++;

          const extra = randInt(1, sides);
          next.push(extra);

          meta.steps.push({
            op: "explode_one",
            trigger: cur,
            extra,
            chain_start: v,
            explosion_index: localExplosions,
          });

          cur = extra;
        }
      }

      kept = next;
      meta.steps.push({ op: step.op, kept: cloneArray(kept) });
      continue;
    }

    if (step.op === "count_successes") {
      const at = step.at_or_above ?? 0;
      const successes = kept.filter((x) => x >= at).length;
      meta.successes = successes;
      meta.steps.push({
        op: step.op,
        at_or_above: at,
        successes,
      });
      continue;
    }

    if (step.op === "count_equal") {
      const faces = new Set(step.faces || []);
      const count = kept.filter((x) => faces.has(x)).length;
      meta.count_equal = count;
      meta.steps.push({
        op: step.op,
        faces: [...faces],
        count,
      });
      continue;
    }

    if (step.op === "count_range") {
      const count = kept.filter((x) => x >= step.min && x <= step.max).length;
      meta.count_range = count;
      meta.steps.push({
        op: step.op,
        min: step.min,
        max: step.max,
        count,
      });
      continue;
    }

    if (step.op === "lookup") {
      const v = kept.length ? kept[0] : 0;
      const hit = (step.ranges || []).find((r) => v >= r.min && v <= r.max);
      meta.lookup = {
        value: v,
        label: hit?.label ?? "—",
      };
      meta.steps.push({
        op: step.op,
        value: v,
        label: meta.lookup.label,
      });
      continue;
    }

    if (step.op === "sum") {
      meta.steps.push({ op: step.op });
      continue;
    }
  }

  const complicationFaces = new Set(params.complication_faces || []);

  if (complicationFaces.size > 0) {
    const complications = kept.filter((value) =>
      complicationFaces.has(value),
    ).length;

    meta.complications = complications;
    meta.complication_faces = [...complicationFaces];

    meta.steps.push({
      op: "count_complications",
      faces: [...complicationFaces],
      complications,
    });
  }

  const { sum } = applySignModifier(kept, sign, modifier);

  let final: number | null = sum;

  switch (params.output ?? "sum") {
    case "sum":
      final = sum;
      break;
    case "successes":
      final = typeof meta.successes === "number" ? meta.successes : 0;
      break;
    case "count_equal":
      final = typeof meta.count_equal === "number" ? meta.count_equal : 0;
      break;
    case "count_range":
      final = typeof meta.count_range === "number" ? meta.count_range : 0;
      break;
    case "first_value":
      final = kept.length ? kept[0] : null;
      break;
    case "lookup_value":
      final = typeof meta.lookup?.value === "number" ? meta.lookup.value : null;
      break;
    case "values":
    case "lookup_label":
      final = null;
      break;
    default:
      final = sum;
      break;
  }

  const naturalFirst = initialNatural[0] ?? 0;

  const degreeResult = resolvePipelineDegrees({
    final,
    naturalFirst,
    degreeTarget: params.degree_target,
    degreeCompare: params.degree_compare,
    degreeStep: params.degree_step,
    critSuccessMin: params.degree_crit_success_min,
    critSuccessMax: params.degree_crit_success_max,
    critFailureMin: params.degree_crit_failure_min,
    critFailureMax: params.degree_crit_failure_max,
  });

  const critSuccessFaces = new Set(params.crit_success_faces || []);
  const critFailureFaces = new Set(params.crit_failure_faces || []);
  const compare: "gte" | "lte" = params.compare === "lte" ? "lte" : "gte";

  if (critSuccessFaces.has(naturalFirst)) {
    return {
      kind: "pipeline",
      values: initialNatural,
      kept,
      final,
      meta: { ...meta, outcome: "crit_success", compare },
    };
  }

  if (critFailureFaces.has(naturalFirst)) {
    return {
      kind: "pipeline",
      values: initialNatural,
      kept,
      final,
      meta: { ...meta, outcome: "crit_failure", compare },
    };
  }

  if (
    degreeResult?.outcome === "crit_success" ||
    degreeResult?.outcome === "crit_failure"
  ) {
    return {
      kind: "pipeline",
      values: initialNatural,
      kept,
      final,
      meta: {
        ...meta,
        outcome: degreeResult.outcome,
        compare,
        degrees: degreeResult,
      },
    };
  }

  if (params.success_threshold != null && final != null) {
    const ok =
      compare === "lte"
        ? final <= params.success_threshold
        : final >= params.success_threshold;

    const complications =
      typeof meta.complications === "number" ? meta.complications : 0;

    const successes =
      typeof meta.successes === "number" ? meta.successes : final;

    const successAtOrAboveStep = (params.steps || []).find(
      (step) => step.op === "count_successes",
    );

    const successAtOrAbove =
      successAtOrAboveStep?.op === "count_successes"
        ? successAtOrAboveStep.at_or_above
        : null;

    const complicationRule = params.complication_rule ?? "none";
    const criticalFailureRule = params.critical_failure_rule ?? "none";
    const criticalSuccessRule = params.critical_success_rule ?? "none";

    const hasComplication = resolvePipelineComplication({
      rule: complicationRule,
      complications,
      successes: Number(successes ?? 0),
      diceCount: kept.length,
    });

    const isCriticalFailure = resolvePipelineCriticalFailure({
      rule: criticalFailureRule,
      complications,
      successes: Number(successes ?? 0),
      diceCount: kept.length,
      complication: hasComplication,
      thresholdFailed: !ok,
    });

    const criticalSuccessFacesForRule =
      params.critical_success_faces ?? params.crit_success_faces ?? [];

    const criticalExplosionChain = resolvePipelineCriticalExplosionChain({
      meta,
      criticalSuccessFaces: criticalSuccessFacesForRule,
    });

    const isCriticalSuccess = resolvePipelineCriticalSuccess({
      rule: criticalSuccessRule,
      values: kept,
      successes: Number(successes ?? 0),
      successAtOrAbove,
      criticalSuccessThreshold:
        typeof params.critical_success_threshold === "number" &&
          Number.isFinite(params.critical_success_threshold)
          ? params.critical_success_threshold
          : null,
      criticalSuccessFaces: criticalSuccessFacesForRule,
      sides,
      criticalExplosionChain,
    });

    let outcome: string = degreeResult?.outcome ?? (ok ? "success" : "failure");

    if (isCriticalSuccess) {
      outcome = "crit_success";
    } else if (isCriticalFailure) {
      outcome =
        criticalFailureRule === "complication_and_zero_successes" ||
          criticalFailureRule === "complication_and_failed_threshold"
          ? "crit_glitch"
          : "crit_failure";
    } else if (hasComplication) {
      outcome = !ok || Number(successes ?? 0) <= 0 ? "crit_glitch" : "glitch";
    }

    return {
      kind: "pipeline",
      values: initialNatural,
      kept,
      final,
      meta: {
        ...meta,
        outcome,
        compare,
        degrees: degreeResult,
        success_threshold: params.success_threshold,
        complication: hasComplication,
        critical_failure: isCriticalFailure,
        critical_success: isCriticalSuccess,
        critical_explosion_chain: criticalExplosionChain,
        complication_rule: complicationRule,
        critical_failure_rule: criticalFailureRule,
        critical_success_rule: criticalSuccessRule,
        critical_success_threshold: params.critical_success_threshold ?? null,
        critical_success_faces: params.critical_success_faces ?? [],
      },
    };
  }

  const complications =
    typeof meta.complications === "number" ? meta.complications : 0;

  const successes =
    typeof meta.successes === "number"
      ? meta.successes
      : typeof final === "number"
        ? final
        : 0;

  const successAtOrAboveStep = (params.steps || []).find(
    (step) => step.op === "count_successes",
  );

  const successAtOrAbove =
    successAtOrAboveStep?.op === "count_successes"
      ? successAtOrAboveStep.at_or_above
      : null;

  const complicationRule = params.complication_rule ?? "none";
  const criticalFailureRule = params.critical_failure_rule ?? "none";
  const criticalSuccessRule = params.critical_success_rule ?? "none";

  const hasComplication = resolvePipelineComplication({
    rule: complicationRule,
    complications,
    successes: Number(successes ?? 0),
    diceCount: kept.length,
  });

  const isCriticalFailure = resolvePipelineCriticalFailure({
    rule: criticalFailureRule,
    complications,
    successes: Number(successes ?? 0),
    diceCount: kept.length,
    complication: hasComplication,
    thresholdFailed: false,
  });

  const criticalSuccessFacesForRule =
    params.critical_success_faces ?? params.crit_success_faces ?? [];

  const criticalExplosionChain = resolvePipelineCriticalExplosionChain({
    meta,
    criticalSuccessFaces: criticalSuccessFacesForRule,
  });

  const isCriticalSuccess = resolvePipelineCriticalSuccess({
    rule: criticalSuccessRule,
    values: kept,
    successes: Number(successes ?? 0),
    successAtOrAbove,
    criticalSuccessThreshold:
      typeof params.critical_success_threshold === "number" &&
        Number.isFinite(params.critical_success_threshold)
        ? params.critical_success_threshold
        : null,
    criticalSuccessFaces: criticalSuccessFacesForRule,
    sides,
    criticalExplosionChain,
  });

  let outcome: string | undefined = degreeResult?.outcome;

  if (isCriticalSuccess) {
    outcome = "crit_success";
  } else if (isCriticalFailure) {
    outcome =
      criticalFailureRule === "complication_and_zero_successes" ||
        criticalFailureRule === "complication_and_failed_threshold"
        ? "crit_glitch"
        : "crit_failure";
  } else if (hasComplication) {
    outcome = Number(successes ?? 0) <= 0 ? "crit_glitch" : "glitch";
  } else if (typeof meta.successes === "number") {
    outcome = meta.successes > 0 ? "success" : "failure";
  }

  return {
    kind: "pipeline",
    values: initialNatural,
    kept,
    final,
    meta: {
      ...meta,
      outcome,
      degrees: degreeResult,
      complication: hasComplication,
      critical_failure: isCriticalFailure,
      critical_success: isCriticalSuccess,
      critical_explosion_chain: criticalExplosionChain,
      complication_rule: complicationRule,
      critical_failure_rule: criticalFailureRule,
      critical_success_rule: criticalSuccessRule,
      critical_success_threshold: params.critical_success_threshold ?? null,
      critical_success_faces: params.critical_success_faces ?? [],
    },
  };
}

function countValuesMatchingFaces(values: number[], faces: number[]) {
  if (faces.length === 0) return 0;
  const faceSet = new Set(faces);
  return values.filter((value) => faceSet.has(value)).length;
}

function resolveSuccessPoolComplication(params: {
  rule: string;
  specialFailureCount: number;
  successes: number;
  diceCount: number;
}) {
  const { rule, specialFailureCount, successes, diceCount } = params;

  if (rule === "none") return false;

  if (rule === "any_special_failure") {
    return specialFailureCount > 0;
  }

  if (rule === "special_failures_gt_successes") {
    return specialFailureCount > successes;
  }

  if (rule === "special_failures_gte_successes") {
    return specialFailureCount >= successes && specialFailureCount > 0;
  }

  if (rule === "special_failures_gt_half_dice") {
    return specialFailureCount > diceCount / 2;
  }

  if (rule === "special_failures_gte_half_dice") {
    return specialFailureCount >= diceCount / 2 && specialFailureCount > 0;
  }

  if (rule === "special_failures_gt_half_successes") {
    return specialFailureCount > successes / 2 && specialFailureCount > 0;
  }

  if (rule === "special_failures_gte_half_successes") {
    return specialFailureCount >= successes / 2 && specialFailureCount > 0;
  }

  // Compatibilité avec les anciennes valeurs
  if (rule === "ones_gt_successes") {
    return specialFailureCount > successes;
  }

  if (rule === "ones_gte_successes") {
    return specialFailureCount >= successes && specialFailureCount > 0;
  }

  return false;
}

function resolveSuccessPoolCriticalFailure(params: {
  rule: string;
  specialFailureCount: number;
  successes: number;
  diceCount: number;
  complication: boolean;
}) {
  const { rule, specialFailureCount, successes, diceCount, complication } =
    params;

  if (rule === "none") return false;

  if (rule === "zero_successes") {
    return successes <= 0;
  }

  if (rule === "all_special_failures") {
    return diceCount > 0 && specialFailureCount === diceCount;
  }

  if (rule === "special_failures_gt_successes") {
    return specialFailureCount > successes;
  }

  if (rule === "special_failures_gte_successes") {
    return specialFailureCount >= successes && specialFailureCount > 0;
  }

  if (rule === "complication_and_zero_successes") {
    return complication && successes <= 0;
  }

  if (rule === "complication_and_failure") {
    return complication && successes <= 0;
  }

  return false;
}

function resolveSuccessPoolCriticalSuccess(params: {
  rule: string;
  values: number[];
  successes: number;
  successThreshold: number;
  criticalSuccessThreshold: number | null;
  criticalSuccessFaces: number[];
  sides: number;
}) {
  const {
    rule,
    values,
    successes,
    successThreshold,
    criticalSuccessThreshold,
    criticalSuccessFaces,
    sides,
  } = params;

  if (rule === "none") return false;
  if (values.length === 0) return false;

  if (rule === "successes_gte_threshold") {
    return (
      criticalSuccessThreshold != null && successes >= criticalSuccessThreshold
    );
  }

  if (rule === "all_dice_successes") {
    return values.every((value) => value >= successThreshold);
  }

  if (rule === "all_dice_max_faces") {
    return values.every((value) => value === sides);
  }

  if (rule === "any_max_face") {
    return values.some((value) => value === sides);
  }

  if (rule === "any_critical_face") {
    return countValuesMatchingFaces(values, criticalSuccessFaces) > 0;
  }

  return false;
}

function resolvePipelineComplication(params: {
  rule: string;
  complications: number;
  successes: number;
  diceCount: number;
}) {
  const { rule, complications, successes, diceCount } = params;

  if (rule === "none") return false;

  if (rule === "any") return complications > 0;

  if (rule === "gt_successes") return complications > successes;

  if (rule === "gte_successes") {
    return complications >= successes && complications > 0;
  }

  if (rule === "zero_successes") {
    return successes <= 0 && complications > 0;
  }

  if (rule === "gt_half_dice") {
    return complications > diceCount / 2;
  }

  if (rule === "gte_half_dice") {
    return complications >= diceCount / 2 && complications > 0;
  }

  if (rule === "gt_half_successes") {
    return complications > successes / 2 && complications > 0;
  }

  if (rule === "gte_half_successes") {
    return complications >= successes / 2 && complications > 0;
  }

  return false;
}

function resolvePipelineCriticalFailure(params: {
  rule: string;
  complications: number;
  successes: number;
  diceCount: number;
  complication: boolean;
  thresholdFailed: boolean;
}) {
  const {
    rule,
    complications,
    successes,
    diceCount,
    complication,
    thresholdFailed,
  } = params;

  if (rule === "none") return false;

  if (rule === "zero_successes") {
    return successes <= 0;
  }

  if (rule === "all_complication_faces") {
    return diceCount > 0 && complications === diceCount;
  }

  if (rule === "complications_gt_successes") {
    return complications > successes;
  }

  if (rule === "complications_gte_successes") {
    return complications >= successes && complications > 0;
  }

  if (rule === "complication_and_zero_successes") {
    return complication && successes <= 0;
  }

  if (rule === "complication_and_failed_threshold") {
    return complication && thresholdFailed;
  }

  return false;
}

function resolvePipelineCriticalExplosionChain(params: {
  meta: any;
  criticalSuccessFaces: number[];
}) {
  const { meta, criticalSuccessFaces } = params;

  if (criticalSuccessFaces.length === 0) return false;

  const faces = new Set(criticalSuccessFaces);
  const steps = Array.isArray(meta?.steps) ? meta.steps : [];

  return steps.some((step: any) => {
    if (step?.op !== "explode_one") return false;

    return faces.has(Number(step.trigger)) && faces.has(Number(step.extra));
  });
}

function resolvePipelineCriticalSuccess(params: {
  rule: string;
  values: number[];
  successes: number;
  successAtOrAbove: number | null;
  criticalSuccessThreshold: number | null;
  criticalSuccessFaces: number[];
  sides: number;
  criticalExplosionChain: boolean;
}) {
  const {
    rule,
    values,
    successes,
    successAtOrAbove,
    criticalSuccessThreshold,
    criticalSuccessFaces,
    sides,
    criticalExplosionChain,
  } = params;

  if (rule === "none") return false;
  if (values.length === 0) return false;

  if (rule === "successes_gte_threshold") {
    return (
      criticalSuccessThreshold != null && successes >= criticalSuccessThreshold
    );
  }

  if (rule === "all_dice_successes") {
    if (successAtOrAbove == null) return false;
    return values.every((value) => value >= successAtOrAbove);
  }

  if (rule === "all_dice_max_faces") {
    return values.every((value) => value === sides);
  }

  if (rule === "any_max_face") {
    return values.some((value) => value === sides);
  }

  if (rule === "any_critical_face") {
    return countValuesMatchingFaces(values, criticalSuccessFaces) > 0;
  }

  if (rule === "explosion_chain_critical") {
    return criticalExplosionChain;
  }

  return false;
}

// --------------------------------------------------
// PUBLIC API
// --------------------------------------------------

export function evaluateRule(
  kind: string,
  params_json: string,
  ctx: EvalContext,
): RuleResult {
  const p = safeParse(params_json);
  const sign = ctx.sign ?? 1;
  const modifier = ctx.modifier ?? 0;

  if (kind === "sum") {
    const { sum } = applySignModifier(ctx.values, sign, modifier);
    return { kind: "sum", total: sum, values: ctx.values };
  }

  if (kind === "single_check" || kind === "d20") {
    const natural = ctx.values[0] ?? 0;
    const final = natural * sign + modifier;

    const compare: "gte" | "lte" = p.compare === "lte" ? "lte" : "gte";
    const critSuccessFaces = Array.isArray(p.crit_success_faces)
      ? p.crit_success_faces.map(Number)
      : [Number(p.critSuccess ?? 20)];
    const critFailureFaces = Array.isArray(p.crit_failure_faces)
      ? p.crit_failure_faces.map(Number)
      : [Number(p.critFailure ?? 1)];

    const threshold =
      p.success_threshold != null
        ? Number(p.success_threshold)
        : p.successThreshold != null
          ? Number(p.successThreshold)
          : null;

    if (critSuccessFaces.includes(natural)) {
      return {
        kind: "single_check",
        outcome: "crit_success",
        threshold,
        natural,
        final,
        compare,
      };
    }

    if (critFailureFaces.includes(natural)) {
      return {
        kind: "single_check",
        outcome: "crit_failure",
        threshold,
        natural,
        final,
        compare,
      };
    }

    if (threshold == null) {
      return {
        kind: "single_check",
        outcome: "success",
        threshold: null,
        natural,
        final,
        compare,
      };
    }

    const isSuccess =
      compare === "lte" ? final <= threshold : final >= threshold;

    return {
      kind: "single_check",
      outcome: isSuccess ? "success" : "failure",
      threshold,
      natural,
      final,
      compare,
    };
  }

  if (kind === "threshold_degrees") {
    const natural = ctx.values[0] ?? 0;
    const final = natural * sign + modifier;

    const compare: "gte" | "lte" = p.compare === "gte" ? "gte" : "lte";

    const target = Number(p.target_value ?? p.targetValue ?? 0);
    const degreeStep = Number(p.degree_step ?? p.degreeStep ?? 10);

    const critSuccessMin = Number(
      p.crit_success_min ?? p.critSuccessMin ?? NaN,
    );
    const critSuccessMax = Number(
      p.crit_success_max ?? p.critSuccessMax ?? NaN,
    );
    const critFailureMin = Number(
      p.crit_failure_min ?? p.critFailureMin ?? NaN,
    );
    const critFailureMax = Number(
      p.crit_failure_max ?? p.critFailureMax ?? NaN,
    );

    const isCritSuccess =
      Number.isFinite(critSuccessMin) &&
      Number.isFinite(critSuccessMax) &&
      natural >= critSuccessMin &&
      natural <= critSuccessMax;

    const isCritFailure =
      Number.isFinite(critFailureMin) &&
      Number.isFinite(critFailureMax) &&
      natural >= critFailureMin &&
      natural <= critFailureMax;

    const isSuccess = compare === "lte" ? final <= target : final >= target;

    const margin = compare === "lte" ? target - final : final - target;

    const safeDegreeStep =
      Number.isFinite(degreeStep) && degreeStep > 0 ? degreeStep : 10;

    const degrees = Math.max(
      1,
      1 + Math.floor(Math.abs(margin) / safeDegreeStep),
    );

    let outcome: "crit_success" | "crit_failure" | "success" | "failure";

    if (isCritSuccess) {
      outcome = "crit_success";
    } else if (isCritFailure) {
      outcome = "crit_failure";
    } else {
      outcome = isSuccess ? "success" : "failure";
    }

    return {
      kind: "threshold_degrees",
      roll: natural,
      final,
      target,
      compare,
      margin,
      degrees,
      outcome,
      degree_step: safeDegreeStep,
    };
  }

  if (kind === "success_pool" || kind === "pool") {
    const at =
      p.success_at_or_above != null
        ? Number(p.success_at_or_above)
        : Number(p.successAtOrAbove ?? 4);

    const successThreshold = Number.isFinite(at) ? at : 4;

    const failFaces = Array.isArray(p.fail_faces)
      ? p.fail_faces.map(Number).filter(Number.isFinite)
      : [Number(p.critFailureFace ?? 1)].filter(Number.isFinite);

    const glitchRule = String(
      p.glitch_rule ?? p.glitchRule ?? "special_failures_gt_successes",
    );

    const criticalFailureRule = String(
      p.critical_failure_rule ??
      p.criticalFailureRule ??
      "complication_and_zero_successes",
    );

    const criticalSuccessRule = String(
      p.critical_success_rule ?? p.criticalSuccessRule ?? "none",
    );

    const criticalSuccessThreshold =
      p.critical_success_threshold != null
        ? Number(p.critical_success_threshold)
        : p.criticalSuccessThreshold != null
          ? Number(p.criticalSuccessThreshold)
          : null;

    const resolvedCriticalSuccessThreshold =
      criticalSuccessThreshold != null &&
        Number.isFinite(criticalSuccessThreshold)
        ? criticalSuccessThreshold
        : null;

    const criticalSuccessFaces = Array.isArray(p.critical_success_faces)
      ? p.critical_success_faces.map(Number).filter(Number.isFinite)
      : [];

    const values = ctx.values;
    const diceCount = values.length;

    const successes = values.filter((v) => v >= successThreshold).length;
    const failCount = countValuesMatchingFaces(values, failFaces);

    const complication = resolveSuccessPoolComplication({
      rule: glitchRule,
      specialFailureCount: failCount,
      successes,
      diceCount,
    });

    const criticalSuccess = resolveSuccessPoolCriticalSuccess({
      rule: criticalSuccessRule,
      values,
      successes,
      successThreshold,
      criticalSuccessThreshold: resolvedCriticalSuccessThreshold,
      criticalSuccessFaces,
      sides: ctx.sides,
    });

    const criticalFailure = resolveSuccessPoolCriticalFailure({
      rule: criticalFailureRule,
      specialFailureCount: failCount,
      successes,
      diceCount,
      complication,
    });

    let outcome:
      | "crit_success"
      | "success"
      | "failure"
      | "glitch"
      | "crit_glitch"
      | "crit_failure";

    if (criticalSuccess) {
      outcome = "crit_success";
    } else if (criticalFailure) {
      outcome =
        criticalFailureRule === "complication_and_zero_successes" ||
          criticalFailureRule === "complication_and_failure"
          ? "crit_glitch"
          : "crit_failure";
    } else if (successes > 0) {
      outcome = complication ? "glitch" : "success";
    } else {
      outcome = complication ? "crit_glitch" : "failure";
    }

    return {
      kind: "success_pool",
      outcome,
      successes,
      fail_count: failCount,
      fail_faces: failFaces,
      dice_count: diceCount,
      success_at_or_above: successThreshold,
      complication,
      critical_success: criticalSuccess,
      critical_failure: criticalFailure,
      complication_rule: glitchRule,
      critical_failure_rule: criticalFailureRule,
      critical_success_rule: criticalSuccessRule,
    };
  }

  if (kind === "banded_sum") {
    const { sum } = applySignModifier(ctx.values, sign, modifier);

    const bands = Array.isArray(p.bands) ? p.bands : [];
    const hit = bands.find(
      (band: any) =>
        typeof band?.min === "number" &&
        typeof band?.max === "number" &&
        sum >= band.min &&
        sum <= band.max,
    );

    return {
      kind: "banded_sum",
      total: sum,
      label: hit?.label ?? p.defaultLabel ?? "—",
    };
  }

  if (kind === "highest_of_pool") {
    const naturalValues = Array.isArray(ctx.values) ? ctx.values : [];
    const kept = naturalValues.length > 0 ? Math.max(...naturalValues) : 0;
    const final = kept * sign + modifier;

    const compare: "gte" | "lte" = p.compare === "lte" ? "lte" : "gte";

    const critSuccessFaces = Array.isArray(p.crit_success_faces)
      ? p.crit_success_faces.map(Number)
      : p.critSuccess != null
        ? [Number(p.critSuccess)]
        : [];

    const critFailureFaces = Array.isArray(p.crit_failure_faces)
      ? p.crit_failure_faces.map(Number)
      : p.critFailure != null
        ? [Number(p.critFailure)]
        : [];

    const threshold =
      p.success_threshold != null
        ? Number(p.success_threshold)
        : p.successThreshold != null
          ? Number(p.successThreshold)
          : null;

    if (critSuccessFaces.includes(kept)) {
      return {
        kind: "highest_of_pool",
        kept,
        natural_values: naturalValues,
        threshold,
        final,
        compare,
        outcome: "crit_success",
      };
    }

    if (critFailureFaces.includes(kept)) {
      return {
        kind: "highest_of_pool",
        kept,
        natural_values: naturalValues,
        threshold,
        final,
        compare,
        outcome: "crit_failure",
      };
    }

    if (threshold == null) {
      return {
        kind: "highest_of_pool",
        kept,
        natural_values: naturalValues,
        threshold: null,
        final,
        compare,
        outcome: "success",
      };
    }

    const isSuccess =
      compare === "lte" ? final <= threshold : final >= threshold;

    return {
      kind: "highest_of_pool",
      kept,
      natural_values: naturalValues,
      threshold,
      final,
      compare,
      outcome: isSuccess ? "success" : "failure",
    };
  }

  if (kind === "table_lookup") {
    const v = ctx.values[0] ?? 0;
    const ranges = Array.isArray(p.ranges)
      ? p.ranges
      : Array.isArray(p.mapping)
        ? p.mapping
        : [];

    const hit = ranges.find(
      (r: any) =>
        typeof r?.min === "number" &&
        typeof r?.max === "number" &&
        v >= r.min &&
        v <= r.max,
    );

    return {
      kind: "table_lookup",
      value: v,
      label: hit?.label ?? p.defaultLabel ?? "—",
    };
  }

  if (kind === "pipeline") {
    const params: PipelineParams = {
      steps: Array.isArray(p.steps) ? p.steps : [],
      output: p.output,
      crit_success_faces: Array.isArray(p.crit_success_faces)
        ? p.crit_success_faces
        : undefined,
      crit_failure_faces: Array.isArray(p.crit_failure_faces)
        ? p.crit_failure_faces
        : undefined,
      success_threshold:
        p.success_threshold == null ? undefined : Number(p.success_threshold),
      compare: p.compare === "lte" ? "lte" : "gte",

      complication_faces: Array.isArray(p.complication_faces)
        ? p.complication_faces.map(Number).filter(Number.isFinite)
        : undefined,

      complication_rule:
        p.complication_rule === "any" ||
          p.complication_rule === "gt_successes" ||
          p.complication_rule === "gte_successes" ||
          p.complication_rule === "zero_successes" ||
          p.complication_rule === "gt_half_dice" ||
          p.complication_rule === "gte_half_dice" ||
          p.complication_rule === "gt_half_successes" ||
          p.complication_rule === "gte_half_successes" ||
          p.complication_rule === "none"
          ? p.complication_rule
          : undefined,

      critical_failure_rule:
        p.critical_failure_rule === "zero_successes" ||
          p.critical_failure_rule === "all_complication_faces" ||
          p.critical_failure_rule === "complications_gt_successes" ||
          p.critical_failure_rule === "complications_gte_successes" ||
          p.critical_failure_rule === "complication_and_zero_successes" ||
          p.critical_failure_rule === "complication_and_failed_threshold" ||
          p.critical_failure_rule === "none"
          ? p.critical_failure_rule
          : undefined,

      critical_success_rule:
        p.critical_success_rule === "successes_gte_threshold" ||
          p.critical_success_rule === "all_dice_successes" ||
          p.critical_success_rule === "all_dice_max_faces" ||
          p.critical_success_rule === "any_max_face" ||
          p.critical_success_rule === "any_critical_face" ||
          p.critical_success_rule === "explosion_chain_critical" ||
          p.critical_success_rule === "none"
          ? p.critical_success_rule
          : undefined,

      critical_success_threshold:
        p.critical_success_threshold == null
          ? undefined
          : Number(p.critical_success_threshold),

      critical_success_faces: Array.isArray(p.critical_success_faces)
        ? p.critical_success_faces.map(Number).filter(Number.isFinite)
        : undefined,

      degree_target:
        p.degree_target == null ? undefined : Number(p.degree_target),

      degree_compare: p.degree_compare === "lte" ? "lte" : "gte",

      degree_step: p.degree_step == null ? undefined : Number(p.degree_step),

      degree_crit_success_min:
        p.degree_crit_success_min == null
          ? undefined
          : Number(p.degree_crit_success_min),

      degree_crit_success_max:
        p.degree_crit_success_max == null
          ? undefined
          : Number(p.degree_crit_success_max),

      degree_crit_failure_min:
        p.degree_crit_failure_min == null
          ? undefined
          : Number(p.degree_crit_failure_min),

      degree_crit_failure_max:
        p.degree_crit_failure_max == null
          ? undefined
          : Number(p.degree_crit_failure_max),
    };

    return runPipeline(ctx.values, ctx, params);
  }

  if (kind === "lowest_of_pool") {
    const naturalValues = Array.isArray(ctx.values) ? ctx.values : [];
    const kept = naturalValues.length > 0 ? Math.min(...naturalValues) : 0;
    const final = kept * sign + modifier;

    const compare: "gte" | "lte" = p.compare === "lte" ? "lte" : "gte";

    const critSuccessFaces = Array.isArray(p.crit_success_faces)
      ? p.crit_success_faces.map(Number)
      : p.critSuccess != null
        ? [Number(p.critSuccess)]
        : [];

    const critFailureFaces = Array.isArray(p.crit_failure_faces)
      ? p.crit_failure_faces.map(Number)
      : p.critFailure != null
        ? [Number(p.critFailure)]
        : [];

    const threshold =
      p.success_threshold != null
        ? Number(p.success_threshold)
        : p.successThreshold != null
          ? Number(p.successThreshold)
          : null;

    if (critSuccessFaces.includes(kept)) {
      return {
        kind: "lowest_of_pool",
        kept,
        natural_values: naturalValues,
        threshold,
        final,
        compare,
        outcome: "crit_success",
      };
    }

    if (critFailureFaces.includes(kept)) {
      return {
        kind: "lowest_of_pool",
        kept,
        natural_values: naturalValues,
        threshold,
        final,
        compare,
        outcome: "crit_failure",
      };
    }

    if (threshold == null) {
      return {
        kind: "lowest_of_pool",
        kept,
        natural_values: naturalValues,
        threshold: null,
        final,
        compare,
        outcome: "success",
      };
    }

    const isSuccess =
      compare === "lte" ? final <= threshold : final >= threshold;

    return {
      kind: "lowest_of_pool",
      kept,
      natural_values: naturalValues,
      threshold,
      final,
      compare,
      outcome: isSuccess ? "success" : "failure",
    };
  }

  if (kind === "keep_highest_n") {
    const naturalValues = Array.isArray(ctx.values) ? ctx.values : [];
    const keep = Math.max(0, Number(p.keep ?? 0));
    const resultMode: "sum" | "values" =
      p.result_mode === "values" ? "values" : "sum";

    const kept = [...naturalValues].sort((a, b) => b - a).slice(0, keep);

    const final =
      resultMode === "values"
        ? kept
        : kept.reduce((acc, value) => acc + value, 0) * sign + modifier;

    return {
      kind: "keep_highest_n",
      kept,
      natural_values: naturalValues,
      final,
      result_mode: resultMode,
    };
  }

  if (kind === "keep_lowest_n") {
    const naturalValues = Array.isArray(ctx.values) ? ctx.values : [];
    const keep = Math.max(0, Number(p.keep ?? 0));
    const resultMode: "sum" | "values" =
      p.result_mode === "values" ? "values" : "sum";

    const kept = [...naturalValues].sort((a, b) => a - b).slice(0, keep);

    const final =
      resultMode === "values"
        ? kept
        : kept.reduce((acc, value) => acc + value, 0) * sign + modifier;

    return {
      kind: "keep_lowest_n",
      kept,
      natural_values: naturalValues,
      final,
      result_mode: resultMode,
    };
  }

  if (kind === "drop_highest_n") {
    const naturalValues = Array.isArray(ctx.values) ? ctx.values : [];
    const drop = Math.max(0, Number(p.drop ?? 0));
    const resultMode: "sum" | "values" =
      p.result_mode === "values" ? "values" : "sum";

    const remaining = [...naturalValues].sort((a, b) => b - a).slice(drop);

    const final =
      resultMode === "values"
        ? remaining
        : remaining.reduce((acc, value) => acc + value, 0) * sign + modifier;

    return {
      kind: "drop_highest_n",
      remaining,
      natural_values: naturalValues,
      final,
      result_mode: resultMode,
    };
  }

  if (kind === "drop_lowest_n") {
    const naturalValues = Array.isArray(ctx.values) ? ctx.values : [];
    const drop = Math.max(0, Number(p.drop ?? 0));
    const resultMode: "sum" | "values" =
      p.result_mode === "values" ? "values" : "sum";

    const remaining = [...naturalValues].sort((a, b) => a - b).slice(drop);

    const final =
      resultMode === "values"
        ? remaining
        : remaining.reduce((acc, value) => acc + value, 0) * sign + modifier;

    return {
      kind: "drop_lowest_n",
      remaining,
      natural_values: naturalValues,
      final,
      result_mode: resultMode,
    };
  }

  return { kind: "unknown", message: `Règle inconnue: ${kind}` };
}
