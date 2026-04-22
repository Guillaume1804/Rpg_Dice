import { buildRuleFromBehavior } from "../../../core/rules/buildRuleFromBehavior";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorCatalog";
import type { RuleUsageKind } from "../../../data/repositories/rulesRepo";

export type QuickRulePresetScope = "entry" | "group";

export type QuickRulePresetDefinition = {
  key: string;
  label: string;
  description?: string;
  scope: QuickRulePresetScope;
  supportedSides?: number[];
  behaviorKey: RuleBehaviorKey;
  defaultValues?: Record<string, unknown>;
};

export type DraftTempRule = {
  id: string;
  name: string;
  kind: string;
  behavior_key: string | null;
  category: string | null;
  params_json: string;
  ui_schema_json: string | null;
  usage_kind: RuleUsageKind;
};

function readString(
  values: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = values?.[key];
  return typeof value === "string" ? value : undefined;
}

function readCompare(
  values: Record<string, unknown> | undefined,
): "gte" | "lte" | undefined {
  const value = values?.compare;
  return value === "gte" || value === "lte" ? value : undefined;
}

function readRanges(
  values: Record<string, unknown> | undefined,
  key: string,
):
  | {
      min: string;
      max: string;
      label: string;
    }[]
  | undefined {
  const value = values?.[key];
  if (!Array.isArray(value)) return undefined;

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const row = item as {
        min?: unknown;
        max?: unknown;
        label?: unknown;
      };

      if (
        typeof row.min !== "string" ||
        typeof row.max !== "string" ||
        typeof row.label !== "string"
      ) {
        return null;
      }

      return {
        min: row.min,
        max: row.max,
        label: row.label,
      };
    })
    .filter(
      (
        row,
      ): row is {
        min: string;
        max: string;
        label: string;
      } => row !== null,
    );
}

export function buildDraftTempRuleFromPreset(params: {
  preset: QuickRulePresetDefinition;
  sides: number;
  actionName?: string;
}): DraftTempRule {
  const { preset, sides, actionName } = params;

  const built = buildRuleFromBehavior({
    actionName: actionName ?? preset.label,
    behaviorKey: preset.behaviorKey,
    sides,
    compare: readCompare(preset.defaultValues),
    successThreshold: readString(preset.defaultValues, "successThreshold"),
    critSuccessFaces: readString(preset.defaultValues, "critSuccessFaces"),
    critFailureFaces: readString(preset.defaultValues, "critFailureFaces"),
    successAtOrAbove: readString(preset.defaultValues, "successAtOrAbove"),
    failFaces: readString(preset.defaultValues, "failFaces"),
    glitchRule: readString(preset.defaultValues, "glitchRule"),
    ranges: readRanges(preset.defaultValues, "ranges"),
    keepCount: readString(preset.defaultValues, "keepCount"),
    dropCount: readString(preset.defaultValues, "dropCount"),
    resultMode: readString(preset.defaultValues, "resultMode"),
  });

  return {
    id: `temp-rule-${preset.key}-${sides}`,
    name: built.name,
    kind: built.kind,
    behavior_key: built.behavior_key,
    category: built.category,
    params_json: built.params_json,
    ui_schema_json: built.ui_schema_json,
    usage_kind: built.usage_kind,
  };
}
