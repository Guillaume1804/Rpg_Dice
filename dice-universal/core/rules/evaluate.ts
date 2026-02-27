export type D20Params = {
  critSuccess: number;    // 20
  critFailure: number;    // 1
  successThreshold: number | null; // ex: 15, sinon null
};

export type PoolParams = {
  sides: number;                 // 6
  successAtOrAbove: number;      // 4
  critFailureFace: number;       // 1
  glitchRule: "ones_gt_successes"; // pour l’instant
};

export type RulesetMode = "d20" | "pool";

export type Ruleset = {
  mode: RulesetMode;
  params: any; // on parse selon le mode
};

export type Evaluation =
  | { kind: "none" }
  | { kind: "d20"; outcome: "crit_success" | "crit_failure" | "success" | "failure"; threshold?: number | null }
  | { kind: "pool"; successes: number; ones: number; outcome: "success" | "failure" | "glitch" | "crit_glitch" };

export function evaluateRoll(mode: RulesetMode, params: any, values: number[]): Evaluation {
  if (mode === "d20") {
    const p = params as D20Params;
    const v = values[0] ?? 0;

    if (v === p.critSuccess) return { kind: "d20", outcome: "crit_success", threshold: p.successThreshold ?? null };
    if (v === p.critFailure) return { kind: "d20", outcome: "crit_failure", threshold: p.successThreshold ?? null };

    // Si pas de seuil, on ne peut pas dire success/failure de façon objective
    if (p.successThreshold == null) return { kind: "d20", outcome: "success", threshold: null };

    return {
      kind: "d20",
      outcome: v >= p.successThreshold ? "success" : "failure",
      threshold: p.successThreshold,
    };
  }

  // mode === "pool"
  const p = params as PoolParams;
  const successes = values.filter((v) => v >= p.successAtOrAbove).length;
  const ones = values.filter((v) => v === p.critFailureFace).length;

  // règle glitch style Shadowrun :
  // glitch si ones > successes, crit glitch si en plus successes == 0
  if (p.glitchRule === "ones_gt_successes" && ones > successes) {
    return {
      kind: "pool",
      successes,
      ones,
      outcome: successes === 0 ? "crit_glitch" : "glitch",
    };
  }

  return {
    kind: "pool",
    successes,
    ones,
    outcome: successes > 0 ? "success" : "failure",
  };
}