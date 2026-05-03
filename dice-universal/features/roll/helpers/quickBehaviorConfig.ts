// dice-universal/features/roll/helpers/quickBehaviorConfig.ts

import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import { getRuleBehaviorDefinition } from "../../../core/rules/behaviorRegistry";

export const DEFAULT_QUICK_RANGES = [
  { min: "1", max: "3", label: "Bas" },
  { min: "4", max: "6", label: "Moyen" },
  { min: "7", max: "10", label: "Haut" },
];

type RangeRow = { min: string; max: string; label: string };

export function behaviorNeedsSelectionConfig(
  behaviorKey: RuleBehaviorKey,
): boolean {
  if (behaviorKey === "custom_pipeline") return true;

  const behavior = getRuleBehaviorDefinition(behaviorKey);
  return !!behavior && behavior.fields.length > 0;
}

export function getDefaultRangesForBehavior(
  behaviorKey: RuleBehaviorKey,
): RangeRow[] {
  const behavior = getRuleBehaviorDefinition(behaviorKey);
  const rangeField = behavior?.fields.find((field) => field.type === "ranges");

  if (!rangeField || rangeField.type !== "ranges") {
    return DEFAULT_QUICK_RANGES;
  }

  return rangeField.defaultValue.length > 0
    ? rangeField.defaultValue
    : DEFAULT_QUICK_RANGES;
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
  ranges: RangeRow[];
  targetValue: string;
  degreeStep: string;
  critSuccessMin: string;
  critSuccessMax: string;
  critFailureMin: string;
  critFailureMax: string;
}) {
  const behavior = getRuleBehaviorDefinition(params.behaviorKey);

  if (!behavior) {
    return {};
  }

  const values: Record<string, unknown> = {};

  for (const field of behavior.fields) {
    if (field.type === "ranges") {
      values[field.key] = params.ranges;
      continue;
    }

    switch (field.key) {
      case "keepCount":
        values[field.key] = params.keepCount;
        break;

      case "dropCount":
        values[field.key] = params.dropCount;
        break;

      case "resultMode":
        values[field.key] = params.resultMode;
        break;

      case "compare":
        values[field.key] = params.compare;
        break;

      case "successThreshold":
        values[field.key] = params.successThreshold;
        break;

      case "critSuccessFaces":
        values[field.key] = params.critSuccessFaces;
        break;

      case "critFailureFaces":
        values[field.key] = params.critFailureFaces;
        break;

      case "successAtOrAbove":
        values[field.key] = params.successAtOrAbove;
        break;

      case "failFaces":
        values[field.key] = params.failFaces;
        break;

      case "glitchRule":
        values[field.key] = params.glitchRule;
        break;

      case "targetValue":
        values[field.key] = params.targetValue;
        break;

      case "degreeStep":
        values[field.key] = params.degreeStep;
        break;

      case "critSuccessMin":
        values[field.key] = params.critSuccessMin;
        break;

      case "critSuccessMax":
        values[field.key] = params.critSuccessMax;
        break;

      case "critFailureMin":
        values[field.key] = params.critFailureMin;
        break;

      case "critFailureMax":
        values[field.key] = params.critFailureMax;
        break;

      default:
        values[field.key] = field.defaultValue;
        break;
    }
  }

  return values;
}
