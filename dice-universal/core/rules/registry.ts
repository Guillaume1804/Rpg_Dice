// core/rules/registry.ts

import type { RuleEvaluator, UniversalRuleParams } from "./types";

const registry = new Map<string, RuleEvaluator<any>>();

export function registerRule<TParams = UniversalRuleParams>(
  mode: string,
  evaluator: RuleEvaluator<TParams>,
) {
  registry.set(mode, evaluator as RuleEvaluator<any>);
}

export function getRule(mode: string): RuleEvaluator<any> | null {
  return registry.get(mode) ?? null;
}