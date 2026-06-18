import type {
  GuidedBehaviorApplicationMode,
  GuidedBehaviorCriticalFailureRule,
  GuidedBehaviorCriticalSuccessRule,
  GuidedBehaviorDraft,
  GuidedBehaviorPrimaryOutput,
} from "./types";

export type GuidedBehaviorContextOption<T extends string> = {
  key: T;
  label: string;
  description: string;
  recommended?: boolean;
  advanced?: boolean;
};

export type GuidedBehaviorContextWarning = {
  level: "info" | "warning";
  title: string;
  message: string;
};

export type GuidedBehaviorContext = {
  isCompositeBehavior: boolean;
  recommendedApplicationMode: GuidedBehaviorApplicationMode;
  primaryOutputOptions: GuidedBehaviorContextOption<GuidedBehaviorPrimaryOutput>[];
  criticalSuccessOptions: GuidedBehaviorContextOption<GuidedBehaviorCriticalSuccessRule>[];
  criticalFailureOptions: GuidedBehaviorContextOption<GuidedBehaviorCriticalFailureRule>[];
  warnings: GuidedBehaviorContextWarning[];
  summaryHints: string[];
};

function hasReroll(draft: GuidedBehaviorDraft) {
  return draft.transforms.reroll.enabled;
}

function hasExplosion(draft: GuidedBehaviorDraft) {
  return draft.transforms.explode.enabled;
}

function hasKeepDrop(draft: GuidedBehaviorDraft) {
  return draft.transforms.keepDrop.mode !== "none";
}

function hasTransform(draft: GuidedBehaviorDraft) {
  return hasReroll(draft) || hasExplosion(draft) || hasKeepDrop(draft);
}

function isPoolReading(draft: GuidedBehaviorDraft) {
  return draft.reading.mode === "success_pool";
}

function isDegreesReading(draft: GuidedBehaviorDraft) {
  return draft.reading.mode === "threshold_degrees";
}

function isCheckReading(draft: GuidedBehaviorDraft) {
  return draft.reading.mode === "single_check";
}

function isTableReading(draft: GuidedBehaviorDraft) {
  return draft.reading.mode === "table_lookup";
}

function getRecommendedApplicationMode(
  draft: GuidedBehaviorDraft,
): GuidedBehaviorApplicationMode {
  if (draft.applicationMode !== "auto") {
    return draft.applicationMode;
  }

  if (isPoolReading(draft)) {
    return "whole_roll";
  }

  if (isTableReading(draft) && draft.output.primary === "table_label") {
    return "whole_roll";
  }

  if (hasKeepDrop(draft)) {
    return "single_entry";
  }

  if (hasReroll(draft) || hasExplosion(draft)) {
    return "single_entry";
  }

  return "single_entry";
}

function getPrimaryOutputOptions(
  draft: GuidedBehaviorDraft,
): GuidedBehaviorContextOption<GuidedBehaviorPrimaryOutput>[] {
  const options: GuidedBehaviorContextOption<GuidedBehaviorPrimaryOutput>[] =
    [];

  if (draft.reading.mode === "sum") {
    options.push({
      key: "total",
      label: "Total",
      description: "Afficher le total final du jet.",
      recommended: true,
    });
  }

  if (isCheckReading(draft)) {
    options.push({
      key: "outcome",
      label: "Réussite / échec",
      description: "Afficher d’abord si le test est réussi ou raté.",
      recommended: true,
    });

    options.push({
      key: "total",
      label: "Total",
      description: "Afficher le total final comme information principale.",
    });
  }

  if (isDegreesReading(draft)) {
    options.push({
      key: "degrees",
      label: "Degrés",
      description: "Afficher les degrés ou la marge comme résultat principal.",
      recommended: true,
    });

    options.push({
      key: "outcome",
      label: "Réussite / échec",
      description: "Afficher d’abord l’état du test.",
    });
  }

  if (isPoolReading(draft)) {
    options.push({
      key: "successes",
      label: "Succès",
      description: "Afficher le nombre de succès obtenus.",
      recommended: true,
    });
  }

  if (isTableReading(draft)) {
    options.push({
      key: "table_label",
      label: "Résultat de table",
      description: "Afficher le libellé du palier trouvé.",
      recommended: true,
    });

    options.push({
      key: "total",
      label: "Valeur utilisée",
      description: "Afficher la valeur qui a servi à lire la table.",
    });
  }

  if (hasKeepDrop(draft)) {
    options.push({
      key: "kept_values",
      label: "Dés gardés",
      description: "Afficher les dés conservés après garder/retirer.",
      recommended: draft.intent === "keep_drop",
    });
  }

  if (hasTransform(draft) || draft.intent === "advanced") {
    options.push({
      key: "pipeline_final",
      label: "Résultat avancé",
      description:
        "Afficher le résultat final après transformations, lecture et événements spéciaux.",
      advanced: true,
      recommended: draft.intent === "advanced",
    });
  }

  const unique = new Map<
    GuidedBehaviorPrimaryOutput,
    GuidedBehaviorContextOption<GuidedBehaviorPrimaryOutput>
  >();

  for (const option of options) {
    const existing = unique.get(option.key);

    if (!existing) {
      unique.set(option.key, option);
      continue;
    }

    unique.set(option.key, {
      ...existing,
      recommended: existing.recommended || option.recommended,
      advanced: existing.advanced || option.advanced,
    });
  }

  return Array.from(unique.values());
}

function getCriticalSuccessOptions(
  draft: GuidedBehaviorDraft,
): GuidedBehaviorContextOption<GuidedBehaviorCriticalSuccessRule>[] {
  const options: GuidedBehaviorContextOption<GuidedBehaviorCriticalSuccessRule>[] =
    [
      {
        key: "none",
        label: "Aucune réussite critique",
        description: "Ne pas détecter de réussite critique.",
      },
    ];

  if (isCheckReading(draft) || isDegreesReading(draft)) {
    options.push({
      key: "any_critical_face",
      label: "Face critique",
      description: "Réussite critique si une face précise apparaît.",
      recommended: true,
    });

    options.push({
      key: "any_max_face",
      label: "Face maximale",
      description: "Réussite critique si le dé affiche sa valeur maximale.",
    });
  }

  if (isPoolReading(draft)) {
    options.push({
      key: "successes_gte_threshold",
      label: "Nombre de succès élevé",
      description: "Réussite critique si le nombre de succès atteint un seuil.",
      recommended: true,
    });

    options.push({
      key: "all_dice_successes",
      label: "Tous les dés réussissent",
      description: "Réussite critique si tous les dés du pool sont des succès.",
    });
  }

  if (hasExplosion(draft)) {
    options.push({
      key: "any_critical_face",
      label: "Face critique, explosions comprises",
      description:
        "Permettra de tenir compte des dés générés par explosion dans la détection critique.",
      advanced: true,
      recommended: true,
    });

    options.push({
      key: "all_dice_max_faces",
      label: "Chaîne explosive critique",
      description:
        "Base future pour les règles du type : explosion sur face critique puis nouvelle face critique.",
      advanced: true,
    });
  }

  if (hasKeepDrop(draft)) {
    options.push({
      key: "all_dice_successes",
      label: "Tous les dés gardés réussissent",
      description:
        "Base future pour une réussite critique calculée après garder/retirer.",
      advanced: true,
    });
  }

  const unique = new Map<
    GuidedBehaviorCriticalSuccessRule,
    GuidedBehaviorContextOption<GuidedBehaviorCriticalSuccessRule>
  >();

  for (const option of options) {
    const existing = unique.get(option.key);

    if (!existing) {
      unique.set(option.key, option);
      continue;
    }

    unique.set(option.key, {
      ...existing,
      label: option.label,
      description: option.description,
      recommended: existing.recommended || option.recommended,
      advanced: existing.advanced || option.advanced,
    });
  }

  return Array.from(unique.values());
}

function getCriticalFailureOptions(
  draft: GuidedBehaviorDraft,
): GuidedBehaviorContextOption<GuidedBehaviorCriticalFailureRule>[] {
  const options: GuidedBehaviorContextOption<GuidedBehaviorCriticalFailureRule>[] =
    [
      {
        key: "none",
        label: "Aucun échec critique",
        description: "Ne pas détecter d’échec critique.",
      },
    ];

  if (isCheckReading(draft) || isDegreesReading(draft)) {
    options.push({
      key: "complication_and_failure",
      label: "Complication + échec",
      description:
        "Échec critique si le jet échoue et déclenche aussi une complication.",
      recommended: draft.events.complication.enabled,
    });
  }

  if (isPoolReading(draft)) {
    options.push({
      key: "zero_successes",
      label: "Aucun succès",
      description: "Échec critique si aucun succès n’est obtenu.",
      recommended: true,
    });

    options.push({
      key: "special_failures_gt_successes",
      label: "Complications > succès",
      description:
        "Échec critique si les faces problématiques dépassent les succès.",
      advanced: true,
    });

    options.push({
      key: "complication_and_zero_successes",
      label: "Complication + aucun succès",
      description:
        "Échec critique si une complication apparaît et qu’aucun succès n’est obtenu.",
      advanced: true,
    });
  }

  if (hasReroll(draft)) {
    options.push({
      key: "all_special_failures",
      label: "Tous les résultats finaux problématiques",
      description:
        "Base future pour vérifier les faces après relances, pas seulement le jet initial.",
      advanced: true,
    });
  }

  const unique = new Map<
    GuidedBehaviorCriticalFailureRule,
    GuidedBehaviorContextOption<GuidedBehaviorCriticalFailureRule>
  >();

  for (const option of options) {
    const existing = unique.get(option.key);

    if (!existing) {
      unique.set(option.key, option);
      continue;
    }

    unique.set(option.key, {
      ...existing,
      label: option.label,
      description: option.description,
      recommended: existing.recommended || option.recommended,
      advanced: existing.advanced || option.advanced,
    });
  }

  return Array.from(unique.values());
}

function getWarnings(
  draft: GuidedBehaviorDraft,
): GuidedBehaviorContextWarning[] {
  const warnings: GuidedBehaviorContextWarning[] = [];

  if (
    hasExplosion(draft) &&
    !draft.transforms.explode.maxExplosionsPerDie.trim()
  ) {
    warnings.push({
      level: "info",
      title: "Explosion sans limite",
      message:
        "Pour éviter des chaînes très longues, tu pourras définir une limite d’explosions par dé.",
    });
  }

  if (hasReroll(draft) && !draft.transforms.reroll.maxRerollsPerDie.trim()) {
    warnings.push({
      level: "info",
      title: "Relance sans limite",
      message:
        "Une limite peut être utile pour certains systèmes afin d’éviter des relances infinies.",
    });
  }

  if (isPoolReading(draft) && draft.events.complication.enabled) {
    warnings.push({
      level: "info",
      title: "Pool avec complication",
      message:
        "Les options de complication peuvent dépendre du nombre de dés, du nombre de succès ou des deux.",
    });
  }

  if (hasExplosion(draft) && draft.events.criticalSuccess.enabled) {
    warnings.push({
      level: "info",
      title: "Critique et explosion",
      message:
        "Une étape future permettra de préciser si les dés explosés comptent dans la réussite critique.",
    });
  }

  return warnings;
}

function getSummaryHints(draft: GuidedBehaviorDraft): string[] {
  const hints: string[] = [];

  if (hasReroll(draft)) {
    hints.push(`Relance des faces ${draft.transforms.reroll.faces || "—"}.`);
  }

  if (hasExplosion(draft)) {
    hints.push(`Explosion sur ${draft.transforms.explode.faces || "—"}.`);
  }

  if (hasKeepDrop(draft)) {
    hints.push(
      `Garder/retirer : ${draft.transforms.keepDrop.mode}, quantité ${draft.transforms.keepDrop.count}.`,
    );
  }

  if (isPoolReading(draft)) {
    hints.push(`Succès à partir de ${draft.reading.successAtOrAbove || "—"}.`);
  }

  if (isTableReading(draft)) {
    hints.push(`${draft.reading.tableRanges.length} palier(s) configuré(s).`);
  }

  if (draft.events.criticalSuccess.enabled) {
    hints.push("Réussite critique activée.");
  }

  if (draft.events.criticalFailure.enabled) {
    hints.push("Échec critique activé.");
  }

  if (draft.events.complication.enabled) {
    hints.push("Complications activées.");
  }

  return hints;
}

export function getGuidedBehaviorContext(
  draft: GuidedBehaviorDraft,
): GuidedBehaviorContext {
  const isCompositeBehavior =
    draft.intent === "advanced" ||
    hasTransform(draft) ||
    draft.events.criticalSuccess.enabled ||
    draft.events.criticalFailure.enabled ||
    draft.events.complication.enabled;

  return {
    isCompositeBehavior,
    recommendedApplicationMode: getRecommendedApplicationMode(draft),
    primaryOutputOptions: getPrimaryOutputOptions(draft),
    criticalSuccessOptions: getCriticalSuccessOptions(draft),
    criticalFailureOptions: getCriticalFailureOptions(draft),
    warnings: getWarnings(draft),
    summaryHints: getSummaryHints(draft),
  };
}
