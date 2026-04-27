import type { RuleBehaviorKey as ActionBehaviorType } from "../../../core/rules/behaviorRegistry";

export function getBehaviorLabel(
  behaviorType: ActionBehaviorType | null,
): string {
  switch (behaviorType) {
    case "single_check":
      return "Test simple";

    case "success_pool":
      return "Pool de succès";

    case "sum_total":
      return "Somme totale";

    case "banded_sum":
      return "Somme par paliers";

    case "highest_of_pool":
      return "Meilleur dé";

    case "lowest_of_pool":
      return "Pire dé";

    case "keep_highest_n":
      return "Garder les meilleurs dés";

    case "keep_lowest_n":
      return "Garder les pires dés";

    case "drop_highest_n":
      return "Retirer les meilleurs dés";

    case "drop_lowest_n":
      return "Retirer les pires dés";

    case "table_lookup":
      return "Table d’intervalles";

    default:
      return "Règle personnalisée";
  }
}

export function buildCanonicalLocalRuleName(
  tableName: string,
  behaviorType: ActionBehaviorType | null,
): string {
  const safeTableName = tableName.trim();
  const behaviorLabel = getBehaviorLabel(behaviorType);

  if (!safeTableName) {
    return behaviorLabel;
  }

  return `${safeTableName} - ${behaviorLabel}`;
}