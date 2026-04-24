// dice-universal/features/roll/helpers/quickBehaviorConfig.ts

import type { RuleBehaviorKey } from "../../../core/rules/behaviorCatalog";
import { getBehaviorDefaults } from "../../../core/rules/getBehaviorsForContext";

export const DEFAULT_QUICK_RANGES = [
  { min: "1", max: "3", label: "Bas" },
  { min: "4", max: "6", label: "Moyen" },
  { min: "7", max: "10", label: "Haut" },
];

export function behaviorNeedsSelectionConfig(
  behaviorKey: RuleBehaviorKey,
): boolean {
  return (
    behaviorKey === "keep_highest_n" ||
    behaviorKey === "keep_lowest_n" ||
    behaviorKey === "drop_highest_n" ||
    behaviorKey === "drop_lowest_n" ||
    behaviorKey === "single_check" ||
    behaviorKey === "success_pool" ||
    behaviorKey === "table_lookup" ||
    behaviorKey === "banded_sum"
  );
}

export function getDefaultRangesForBehavior(
  behaviorKey: RuleBehaviorKey,
): { min: string; max: string; label: string }[] {
  const defaults = getBehaviorDefaults(behaviorKey, "quick_roll");
  const ranges = defaults?.ranges;

  if (!Array.isArray(ranges)) {
    return DEFAULT_QUICK_RANGES;
  }

  const parsed = ranges
    .map((row) => {
      if (!row || typeof row !== "object") return null;

      const candidate = row as {
        min?: unknown;
        max?: unknown;
        label?: unknown;
      };

      if (
        typeof candidate.min !== "string" ||
        typeof candidate.max !== "string" ||
        typeof candidate.label !== "string"
      ) {
        return null;
      }

      return {
        min: candidate.min,
        max: candidate.max,
        label: candidate.label,
      };
    })
    .filter(
      (row): row is { min: string; max: string; label: string } =>
        row !== null,
    );

  return parsed.length > 0 ? parsed : DEFAULT_QUICK_RANGES;
}

export function buildQuickBehaviorDefaultValues(params: {
  behaviorKey: RuleBehaviorKey;
  keepCount: string;
  dropCount: string;
  resultMode: string;
  compare: "gte" | "lte";
  successThreshold: string;
  critSuccessFaces: string;
  critFailureFaces: string;
  successAtOrAbove: string;
  failFaces: string;
  glitchRule: string;
  ranges: { min: string; max: string; label: string }[];
}) {
  const baseDefaults =
    getBehaviorDefaults(params.behaviorKey, "quick_roll") ?? {};

  if (
    params.behaviorKey === "keep_highest_n" ||
    params.behaviorKey === "keep_lowest_n"
  ) {
    return {
      ...baseDefaults,
      keepCount: params.keepCount,
      resultMode: params.resultMode,
    };
  }

  if (
    params.behaviorKey === "drop_highest_n" ||
    params.behaviorKey === "drop_lowest_n"
  ) {
    return {
      ...baseDefaults,
      dropCount: params.dropCount,
      resultMode: params.resultMode,
    };
  }

  if (params.behaviorKey === "single_check") {
    return {
      ...baseDefaults,
      compare: params.compare,
      successThreshold: params.successThreshold,
      critSuccessFaces: params.critSuccessFaces,
      critFailureFaces: params.critFailureFaces,
    };
  }

  if (params.behaviorKey === "success_pool") {
    return {
      ...baseDefaults,
      successAtOrAbove: params.successAtOrAbove,
      failFaces: params.failFaces,
      glitchRule: params.glitchRule,
    };
  }

  if (
    params.behaviorKey === "table_lookup" ||
    params.behaviorKey === "banded_sum"
  ) {
    return {
      ...baseDefaults,
      ranges: params.ranges,
    };
  }

  return baseDefaults;
}