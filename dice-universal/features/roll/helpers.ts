import type { RuleRow } from "../../data/repositories/rulesRepo";

export function getRuleName(rule: any | null) {
  return rule?.name ?? "Somme (par défaut)";
}

export function getRuleNameFromId(
  ruleId: string | null | undefined,
  availableRules: RuleRow[]
) {
  if (!ruleId) return "Somme (par défaut)";
  return availableRules.find((r) => r.id === ruleId)?.name ?? "Règle introuvable";
}

export function getSignLabel(sign?: number) {
  return (sign ?? 1) === -1 ? "-" : "+";
}

export function formatRuleResult(res: any): string {
  if (!res) return "";

  if (res.kind === "sum") return `Somme = ${res.total}`;

  if (res.kind === "pipeline") {
    const outcome = res?.meta?.outcome != null ? ` | outcome: ${res.meta.outcome}` : "";
    return `Pipeline = ${res.final}${outcome}`;
  }

  if (res.kind === "d20") {
    if (res.outcome === "crit_success") return "Réussite critique";
    if (res.outcome === "crit_failure") return "Échec critique";
    if (res.threshold == null) return "Résultat";
    return res.outcome === "success" ? "Réussite" : "Échec";
  }

  if (res.kind === "pool") {
    const label =
      res.outcome === "crit_glitch"
        ? "Échec critique (glitch)"
        : res.outcome === "glitch"
        ? "Glitch"
        : res.outcome === "success"
        ? "Réussite"
        : "Échec";
    return `${label} — succès: ${res.successes} / ones: ${res.ones}`;
  }

  if (res.kind === "table_lookup") return res.label;
  if (res.kind === "unknown") return res.message;

  return "";
}