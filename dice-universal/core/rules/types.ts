export type RuleInput = {
  // valeurs brutes sorties des dés (après roll)
  values: number[];
  // info utile si besoin
  sides?: number;
};

export type RuleResult =
  | { kind: "sum"; total: number }
  | { kind: "d20"; value: number; outcome: "crit_success" | "crit_failure" | "success" | "failure"; threshold: number | null }
  | { kind: "pool"; successes: number; ones: number; outcome: "crit_glitch" | "glitch" | "success" | "failure" }
  | { kind: "table_lookup"; value: number; label: string }
  | { kind: "unknown"; message: string };

export type RuleEvaluator = (params: any, input: RuleInput) => RuleResult;