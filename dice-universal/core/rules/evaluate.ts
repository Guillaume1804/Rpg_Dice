import { getRule } from "./registry";
import type { RuleInput, RuleResult } from "./types";

// parse JSON safe
function safeParse(json: string | null | undefined): any {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function evaluateRule(mode: string, paramsJson: string, input: RuleInput): RuleResult {
  const evaluator = getRule(mode);
  if (!evaluator) {
    return { kind: "unknown", message: `Règle inconnue: ${mode}` };
  }
  const params = safeParse(paramsJson);
  return evaluator(params, input);
}