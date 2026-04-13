import type { RuleRow, RuleScope } from "../../../data/repositories/rulesRepo";
import { parseSupportedSides } from "../../../data/repositories/rulesRepo";

export type RuleCompatibilityContext = {
  scope: "entry" | "group";
  sides: number[];
};

function matchesScope(
  ruleScope: RuleScope,
  wantedScope: "entry" | "group",
): boolean {
  if (ruleScope === "both") return true;
  return ruleScope === wantedScope;
}

function matchesSides(ruleSides: number[], contextSides: number[]): boolean {
  // Convention :
  // [] = règle universelle, compatible avec tous les dés
  if (ruleSides.length === 0) return true;

  // Cas simple : un seul type de dé
  if (contextSides.length === 1) {
    return ruleSides.includes(contextSides[0]);
  }

  // Cas groupe : tous les dés du contexte doivent être couverts
  return contextSides.every((side) => ruleSides.includes(side));
}

export function isRuleCompatibleWithContext(
  rule: RuleRow,
  context: RuleCompatibilityContext,
): boolean {
  if (!matchesScope(rule.scope, context.scope)) {
    return false;
  }

  const ruleSides = parseSupportedSides(rule);
  return matchesSides(ruleSides, context.sides);
}

export function rankRuleForContext(
  rule: RuleRow,
  context: RuleCompatibilityContext,
): number {
  let score = 0;

  // priorité au scope exact
  if (rule.scope === context.scope) {
    score += 4;
  } else if (rule.scope === "both") {
    score += 2;
  }

  const ruleSides = parseSupportedSides(rule);

  // règle universelle = utile, mais moins prioritaire qu'une vraie règle ciblée
  if (ruleSides.length === 0) {
    score += 1;
  } else if (
    context.sides.length === 1 &&
    ruleSides.includes(context.sides[0])
  ) {
    score += 4;
  } else if (
    context.sides.length > 1 &&
    context.sides.every((side) => ruleSides.includes(side))
  ) {
    score += 3;
  }

  // petit bonus aux règles système
  if (rule.is_system === 1) {
    score += 1;
  }

  return score;
}

export function sortRulesForContext(
  rules: RuleRow[],
  context: RuleCompatibilityContext,
): RuleRow[] {
  return [...rules].sort((a, b) => {
    const scoreDiff =
      rankRuleForContext(b, context) - rankRuleForContext(a, context);

    if (scoreDiff !== 0) return scoreDiff;

    return a.name.localeCompare(b.name, "fr");
  });
}

export function getCompatibleRulesForContext(
  rules: RuleRow[],
  context: RuleCompatibilityContext,
): RuleRow[] {
  return sortRulesForContext(
    rules.filter((rule) => isRuleCompatibleWithContext(rule, context)),
    context,
  );
}

export function getRulesForScope(
  rules: RuleRow[],
  scope: "entry" | "group",
): RuleRow[] {
  return [...rules]
    .filter((rule) => rule.scope === scope || rule.scope === "both")
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}