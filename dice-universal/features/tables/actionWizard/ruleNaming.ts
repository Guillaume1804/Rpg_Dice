import type { RuleBehaviorKey as ActionBehaviorType } from "../../../core/rules/behaviorRegistry";

export function getBehaviorLabel(
  behaviorType: ActionBehaviorType | null,
): string {
  switch (behaviorType) {
    case "sum_total":
      return "Somme simple";

    case "single_check":
      return "Test avec seuil";

    case "threshold_degrees":
      return "Seuil avec degrés";

    case "success_pool":
      return "Pool de succès";

    case "table_lookup":
      return "Table / Paliers";

    case "banded_sum":
      return "Résultat par paliers";

    case "highest_of_pool":
      return "Meilleur dé";

    case "lowest_of_pool":
      return "Plus faible dé";

    case "keep_highest_n":
      return "Garder les meilleurs dés";

    case "keep_lowest_n":
      return "Garder les plus faibles dés";

    case "drop_highest_n":
      return "Retirer les meilleurs dés";

    case "drop_lowest_n":
      return "Retirer les plus faibles dés";

    case "custom_pipeline":
      return "Pipeline personnalisé";

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
