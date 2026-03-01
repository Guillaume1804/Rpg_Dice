import type { RuleEvaluator } from "./types";

const registry = new Map<string, RuleEvaluator>();

export function registerRule(mode: string, evaluator: RuleEvaluator) {
  registry.set(mode, evaluator);
}

export function getRule(mode: string): RuleEvaluator | null {
  return registry.get(mode) ?? null;
}