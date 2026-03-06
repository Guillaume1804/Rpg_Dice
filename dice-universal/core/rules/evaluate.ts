// core/rules/evaluate.ts

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
      kind: "d20";
      outcome: "crit_success" | "crit_failure" | "success" | "failure";
      threshold: number | null;
      natural: number;
      final: number;
    }
  | {
      kind: "pool";
      outcome: "success" | "failure" | "glitch" | "crit_glitch";
      successes: number;
      ones: number;
    }
  | { kind: "table_lookup"; label: string; value: number }
  | {
      kind: "pipeline";
      values: number[];
      kept: number[];
      final: number | null;
      meta: any;
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
  | { op: "lookup"; ranges: { min: number; max: number; label: string }[] }
  | { op: "sum" };

export type PipelineParams = {
  steps: PipelineStep[];

  /**
   * Détermine ce que représente la sortie finale
   * - sum           => somme des kept avec sign/modifier
   * - successes     => utilise meta.successes
   * - count_equal   => utilise meta.count_equal
   * - count_range   => utilise meta.count_range
   * - first_value   => 1ère valeur de kept
   * - values        => garde les valeurs, final sera null
   * - lookup_label  => texte lookup, final null
   * - lookup_value  => valeur lookup, final numérique si dispo
   */
  output?:
    | "sum"
    | "successes"
    | "count_equal"
    | "count_range"
    | "first_value"
    | "values"
    | "lookup_label"
    | "lookup_value";

  // critique / seuil génériques
  crit_success_faces?: number[];
  crit_failure_faces?: number[];
  success_threshold?: number | null;
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cloneArray(arr: number[]) {
  return [...arr];
}

function runPipeline(
  initialNatural: number[],
  ctx: EvalContext,
  params: PipelineParams
): RuleResult {
  const sign = ctx.sign ?? 1;
  const modifier = ctx.modifier ?? 0;
  const sides = ctx.sides;

  let kept = cloneArray(initialNatural);

  const meta: any = {
    steps: [],
    successes: undefined,
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
      const maxR = step.max_rerolls ?? 100;
      let rerolls = 0;

      const next: number[] = [];

      for (const v of kept) {
        let cur = v;
        let localRerolls = 0;

        while (faces.has(cur) && rerolls < maxR) {
          rerolls++;
          localRerolls++;
          cur = randInt(1, sides);
          if (step.once) break;
        }

        next.push(cur);

        if (localRerolls > 0) {
          meta.steps.push({
            op: "reroll_one",
            from: v,
            to: cur,
            rerolls: localRerolls,
          });
        }
      }

      kept = next;
      meta.steps.push({ op: step.op, kept: cloneArray(kept) });
      continue;
    }

    if (step.op === "explode") {
      const faces = new Set(step.faces || []);
      const maxE = step.max_explosions ?? 100;
      let explosions = 0;

      const next: number[] = [];

      for (const v of kept) {
        next.push(v);

        let cur = v;
        while (faces.has(cur) && explosions < maxE) {
          explosions++;
          cur = randInt(1, sides);
          next.push(cur);
          meta.steps.push({
            op: "explode_one",
            trigger: v,
            extra: cur,
          });
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

  // Gestion succès / échec générique si on a un seuil ET une sortie numérique
  if (params.success_threshold != null && final != null) {
    const naturalFirst = initialNatural[0] ?? 0;
    const critSuccessFaces = new Set(params.crit_success_faces || []);
    const critFailureFaces = new Set(params.crit_failure_faces || []);

    if (critSuccessFaces.has(naturalFirst)) {
      return {
        kind: "pipeline",
        values: initialNatural,
        kept,
        final,
        meta: { ...meta, outcome: "crit_success" },
      };
    }

    if (critFailureFaces.has(naturalFirst)) {
      return {
        kind: "pipeline",
        values: initialNatural,
        kept,
        final,
        meta: { ...meta, outcome: "crit_failure" },
      };
    }

    const ok = final >= params.success_threshold;
    return {
      kind: "pipeline",
      values: initialNatural,
      kept,
      final,
      meta: { ...meta, outcome: ok ? "success" : "failure" },
    };
  }

  return {
    kind: "pipeline",
    values: initialNatural,
    kept,
    final,
    meta,
  };
}

// --------------------------------------------------
// PUBLIC API
// --------------------------------------------------

export function evaluateRule(kind: string, params_json: string, ctx: EvalContext): RuleResult {
  const p = safeParse(params_json);
  const sign = ctx.sign ?? 1;
  const modifier = ctx.modifier ?? 0;

  if (kind === "sum") {
    const { sum } = applySignModifier(ctx.values, sign, modifier);
    return { kind: "sum", total: sum, values: ctx.values };
  }

  if (kind === "d20") {
    // d20 historique : crit sur NATURAL, succès sur (natural + mod) vs threshold
    const natural = ctx.values[0] ?? 0;
    const final = natural * sign + modifier;

    const critSuccess = Number(p.critSuccess ?? 20);
    const critFailure = Number(p.critFailure ?? 1);
    const threshold = p.successThreshold == null ? null : Number(p.successThreshold);

    if (natural === critSuccess) {
      return { kind: "d20", outcome: "crit_success", threshold, natural, final };
    }

    if (natural === critFailure) {
      return { kind: "d20", outcome: "crit_failure", threshold, natural, final };
    }

    if (threshold == null) {
      return { kind: "d20", outcome: "success", threshold: null, natural, final };
    }

    return {
      kind: "d20",
      outcome: final >= threshold ? "success" : "failure",
      threshold,
      natural,
      final,
    };
  }

  if (kind === "pool") {
    const at = Number(p.successAtOrAbove ?? 4);
    const critFace = Number(p.critFailureFace ?? 1);
    const glitchRule = String(p.glitchRule ?? "ones_gt_successes");

    const values = ctx.values;
    const successes = values.filter((v) => v >= at).length;
    const ones = values.filter((v) => v === critFace).length;

    const isGlitch =
      glitchRule === "ones_gte_successes" ? ones >= successes : ones > successes;

    const outcome =
      successes > 0
        ? isGlitch
          ? "glitch"
          : "success"
        : isGlitch
        ? "crit_glitch"
        : "failure";

    return { kind: "pool", outcome, successes, ones };
  }

  if (kind === "table_lookup") {
    const v = ctx.values[0] ?? 0;
    const mapping = Array.isArray(p.mapping) ? p.mapping : [];
    const hit = mapping.find(
      (r: any) =>
        typeof r?.min === "number" &&
        typeof r?.max === "number" &&
        v >= r.min &&
        v <= r.max
    );

    return { kind: "table_lookup", value: v, label: hit?.label ?? "—" };
  }

  if (kind === "pipeline") {
    const params: PipelineParams = {
      steps: Array.isArray(p.steps) ? p.steps : [],
      output: p.output,
      crit_success_faces: Array.isArray(p.crit_success_faces) ? p.crit_success_faces : undefined,
      crit_failure_faces: Array.isArray(p.crit_failure_faces) ? p.crit_failure_faces : undefined,
      success_threshold:
        p.success_threshold == null ? undefined : Number(p.success_threshold),
    };

    return runPipeline(ctx.values, ctx, params);
  }

  return { kind: "unknown", message: `Règle inconnue: ${kind}` };
}