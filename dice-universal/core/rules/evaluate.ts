// core/rules/evaluate.ts

export type EvalContext = {
  // valeurs naturelles (1..sides), déjà mappées sur l'entrée de dé
  values: number[];
  sides: number;

  // infos entrée (optionnelles selon appelant)
  modifier?: number;
  sign?: number; // +1 / -1
};

type RuleResult =
  | { kind: "sum"; total: number; values: number[] }
  | { kind: "d20"; outcome: "crit_success" | "crit_failure" | "success" | "failure"; threshold: number | null; natural: number; final: number }
  | { kind: "pool"; outcome: "success" | "failure" | "glitch" | "crit_glitch"; successes: number; ones: number }
  | { kind: "table_lookup"; label: string; value: number }
  | { kind: "pipeline"; values: number[]; kept: number[]; final: number; meta: any }
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

// -------------------- PIPELINE ENGINE --------------------

type PipelineStep =
  | { op: "keep_highest"; n: number }
  | { op: "keep_lowest"; n: number }
  | { op: "drop_highest"; n: number }
  | { op: "drop_lowest"; n: number }
  | { op: "reroll"; faces: number[]; once?: boolean; max_rerolls?: number }
  | { op: "explode"; faces: number[]; max_explosions?: number }
  | { op: "count_successes"; at_or_above: number }
  | { op: "lookup"; ranges: { min: number; max: number; label: string }[] }
  | { op: "sum" }
  | { op: "take"; index: number }; // ex: prendre 1er dé

type PipelineParams = {
  steps: PipelineStep[];
  // comment produire le final
  output?: "sum" | "successes" | "lookup_label" | "values";
  // d20-style threshold/crit mais généralisable à n'importe quel dé
  crit_success_faces?: number[]; // ex: [20] ou [10] ou [100]
  crit_failure_faces?: number[]; // ex: [1]
  success_threshold?: number | null; // si output=sum, seuil sur final
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ⚠️ explode/reroll ont besoin de relancer : on accepte sides dans ctx
function runPipeline(initialNatural: number[], ctx: EvalContext, params: PipelineParams): RuleResult {
  const sign = ctx.sign ?? 1;
  const modifier = ctx.modifier ?? 0;
  const sides = ctx.sides;

  let natural = [...initialNatural]; // toujours naturel ici (1..sides)
  let kept = [...natural];

  const meta: any = { steps: [] };

  const applyKeep = (arr: number[]) => {
    kept = arr;
  };

  for (const step of params.steps || []) {
    if (step.op === "keep_highest") {
      const sorted = [...kept].sort((a, b) => b - a);
      applyKeep(sorted.slice(0, Math.max(0, step.n)));
      meta.steps.push({ op: step.op, kept: [...kept] });
      continue;
    }

    if (step.op === "keep_lowest") {
      const sorted = [...kept].sort((a, b) => a - b);
      applyKeep(sorted.slice(0, Math.max(0, step.n)));
      meta.steps.push({ op: step.op, kept: [...kept] });
      continue;
    }

    if (step.op === "drop_highest") {
      const sorted = [...kept].sort((a, b) => b - a);
      applyKeep(sorted.slice(Math.max(0, step.n)));
      meta.steps.push({ op: step.op, kept: [...kept] });
      continue;
    }

    if (step.op === "drop_lowest") {
      const sorted = [...kept].sort((a, b) => a - b);
      applyKeep(sorted.slice(Math.max(0, step.n)));
      meta.steps.push({ op: step.op, kept: [...kept] });
      continue;
    }

    if (step.op === "take") {
      const idx = Math.max(0, step.index);
      applyKeep(kept[idx] == null ? [] : [kept[idx]]);
      meta.steps.push({ op: step.op, kept: [...kept] });
      continue;
    }

    if (step.op === "reroll") {
      const faces = new Set(step.faces || []);
      const maxR = step.max_rerolls ?? 100;
      let rerolls = 0;

      const next: number[] = [];
      for (const v of kept) {
        let cur = v;
        let did = false;

        while (faces.has(cur) && rerolls < maxR) {
          rerolls++;
          cur = randInt(1, sides);
          did = true;
          if (step.once) break;
        }

        next.push(cur);
        if (did) meta.steps.push({ op: "reroll_one", from: v, to: cur });
      }

      kept = next;
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
          meta.steps.push({ op: "explode_one", on: v, extra: cur });
        }
      }

      kept = next;
      continue;
    }

    if (step.op === "count_successes") {
      const at = step.at_or_above ?? 0;
      const successes = kept.filter((x) => x >= at).length;
      meta.successes = successes;
      meta.steps.push({ op: step.op, at_or_above: at, successes });
      continue;
    }

    if (step.op === "lookup") {
      // on prend la première valeur (ou sum si vide)
      const v = kept.length ? kept[0] : 0;
      const hit = (step.ranges || []).find((r) => v >= r.min && v <= r.max);
      meta.lookup = { value: v, label: hit?.label ?? "—" };
      meta.steps.push({ op: step.op, value: v, label: meta.lookup.label });
      continue;
    }

    if (step.op === "sum") {
      // juste un marqueur, le sum final est calculé à la fin
      meta.steps.push({ op: step.op });
      continue;
    }
  }

  // final = somme des kept avec sign + modifier
  const { sum } = applySignModifier(kept, sign, modifier);

  // option: success/failure généralisé
  if (params.success_threshold != null) {
    const naturalFirst = initialNatural[0] ?? 0;
    const final = sum;
    const critSuccessFaces = new Set(params.crit_success_faces || []);
    const critFailureFaces = new Set(params.crit_failure_faces || []);

    if (critSuccessFaces.has(naturalFirst)) {
      return { kind: "pipeline", values: initialNatural, kept, final, meta: { ...meta, outcome: "crit_success" } };
    }
    if (critFailureFaces.has(naturalFirst)) {
      return { kind: "pipeline", values: initialNatural, kept, final, meta: { ...meta, outcome: "crit_failure" } };
    }

    const ok = final >= params.success_threshold;
    return { kind: "pipeline", values: initialNatural, kept, final, meta: { ...meta, outcome: ok ? "success" : "failure" } };
  }

  return { kind: "pipeline", values: initialNatural, kept, final: sum, meta };
}

// -------------------- PUBLIC API --------------------

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

    if (natural === critSuccess) return { kind: "d20", outcome: "crit_success", threshold, natural, final };
    if (natural === critFailure) return { kind: "d20", outcome: "crit_failure", threshold, natural, final };
    if (threshold == null) return { kind: "d20", outcome: "success", threshold: null, natural, final }; // "résultat"
    return { kind: "d20", outcome: final >= threshold ? "success" : "failure", threshold, natural, final };
  }

  if (kind === "pool") {
    const at = Number(p.successAtOrAbove ?? 4);
    const critFace = Number(p.critFailureFace ?? 1);
    const glitchRule = String(p.glitchRule ?? "ones_gt_successes");

    const values = ctx.values; // pool = naturel (sign/mod pas pertinent ici en général)
    const successes = values.filter((v) => v >= at).length;
    const ones = values.filter((v) => v === critFace).length;

    const isGlitch =
      glitchRule === "ones_gte_successes" ? ones >= successes :
      ones > successes;

    const outcome =
      successes > 0
        ? (isGlitch ? "glitch" : "success")
        : (isGlitch ? "crit_glitch" : "failure");

    return { kind: "pool", outcome, successes, ones };
  }

  if (kind === "table_lookup") {
    // mapping par ranges : { mapping: [{min,max,label}, ...] }
    const v = ctx.values[0] ?? 0;
    const mapping = Array.isArray(p.mapping) ? p.mapping : [];
    const hit = mapping.find((r: any) => typeof r?.min === "number" && typeof r?.max === "number" && v >= r.min && v <= r.max);
    return { kind: "table_lookup", value: v, label: hit?.label ?? "—" };
  }

  if (kind === "pipeline") {
    const params: PipelineParams = {
      steps: Array.isArray(p.steps) ? p.steps : [],
      output: p.output,
      crit_success_faces: Array.isArray(p.crit_success_faces) ? p.crit_success_faces : undefined,
      crit_failure_faces: Array.isArray(p.crit_failure_faces) ? p.crit_failure_faces : undefined,
      success_threshold: p.success_threshold == null ? undefined : Number(p.success_threshold),
    };
    return runPipeline(ctx.values, ctx, params);
  }

  return { kind: "unknown", message: `Règle inconnue: ${kind}` };
}