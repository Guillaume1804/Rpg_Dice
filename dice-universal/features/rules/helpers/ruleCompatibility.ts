import type { RuleRow, RuleScope } from "../../../data/repositories/rulesRepo";
import { parseSupportedSides } from "../../../data/repositories/rulesRepo";

export type RuleCompatibilityContext = {
  scope: "entry" | "group";
  sides: number[];
};

const FLEXIBLE_RULE_KINDS = new Set([
  "pipeline",
  "highest_of_pool",
  "lowest_of_pool",
  "keep_highest_n",
  "keep_lowest_n",
  "drop_highest_n",
  "drop_lowest_n",
  "banded_sum",
]);

function isFlexibleRuleKind(kind: string): boolean {
  return FLEXIBLE_RULE_KINDS.has(kind);
}

function matchesScope(
  ruleScope: RuleScope,
  wantedScope: "entry" | "group",
): boolean {
  if (ruleScope === "both") return true;
  return ruleScope === wantedScope;
}

function matchesSides(ruleSides: number[], contextSides: number[]): boolean {
  // [] = règle universelle
  if (ruleSides.length === 0) return true;

  if (contextSides.length === 0) return true;

  // Cas simple
  if (contextSides.length === 1) {
    return ruleSides.includes(contextSides[0]);
  }

  // Cas groupe
  return contextSides.every((side) => ruleSides.includes(side));
}

export function isRuleCompatibleWithContext(
  rule: RuleRow,
  context: RuleCompatibilityContext,
): boolean {
  const flexibleKind = isFlexibleRuleKind(rule.kind);

  // Scope
  if (!matchesScope(rule.scope, context.scope)) {
    // Tolérance pour certaines règles avancées
    if (!flexibleKind) {
      return false;
    }
  }

  const ruleSides = parseSupportedSides(rule);

  // Sides
  if (!matchesSides(ruleSides, context.sides)) {
    // Tolérance pour règles avancées / pipelines
    if (!flexibleKind) {
      return false;
    }
  }

  return true;
}

export function rankRuleForContext(
  rule: RuleRow,
  context: RuleCompatibilityContext,
): number {
  let score = 0;

  const flexibleKind = isFlexibleRuleKind(rule.kind);
  const ruleSides = parseSupportedSides(rule);

  // Scope exact > both > flexible toléré
  if (rule.scope === context.scope) {
    score += 5;
  } else if (rule.scope === "both") {
    score += 3;
  } else if (flexibleKind) {
    score += 1;
  }

  // Sides ciblés > universels > flexibles tolérés
  if (ruleSides.length === 0) {
    score += 2;
  } else if (
    context.sides.length === 1 &&
    ruleSides.includes(context.sides[0])
  ) {
    score += 5;
  } else if (
    context.sides.length > 1 &&
    context.sides.every((side) => ruleSides.includes(side))
  ) {
    score += 4;
  } else if (flexibleKind) {
    score += 1;
  }

  // Bonus léger aux règles locales/custom
  if (rule.is_system !== 1) {
    score += 2;
  }

  // Petit bonus règles système
  if (rule.is_system === 1) {
    score += 1;
  }

  // Léger bonus pipeline/modernes pour les rendre visibles
  if (flexibleKind) {
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
    .filter((rule) => {
      if (rule.scope === scope || rule.scope === "both") return true;
      return isFlexibleRuleKind(rule.kind);
    })
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
