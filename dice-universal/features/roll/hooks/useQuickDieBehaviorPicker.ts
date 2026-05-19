import { useMemo, useState } from "react";
import {
  RULE_BEHAVIORS,
  getRuleBehaviorDefinition,
  type RuleBehaviorKey,
} from "../../../core/rules/behaviorRegistry";
import { buildDraftTempRuleFromPreset } from "../helpers/buildDraftTempRuleFromPreset";
import { behaviorNeedsSelectionConfig } from "../helpers/quickBehaviorConfig";
import type { QuickPresetSelection } from "./useQuickRollDraft";

export type QuickBehaviorPickerVariant = "default" | "keep_drop";

export type QuickBehaviorPickerOption = {
  optionId: string;
  behaviorKey: RuleBehaviorKey;
  context: "quick_roll";
  enabled: boolean;
  label?: string;
  description?: string;
  variant: QuickBehaviorPickerVariant;
};

const QUICK_BEHAVIOR_ORDER: string[] = [
  "single_check",
  "threshold_degrees",
  "success_pool",
  "table_lookup",
  "keep_drop_pipeline",
  "custom_pipeline",
];

function isBehaviorCompatibleWithSides(params: {
  behaviorKey: RuleBehaviorKey;
  sides: number;
}) {
  const definition = getRuleBehaviorDefinition(params.behaviorKey);
  if (!definition) return false;

  if (!definition.supportedSides) return true;

  return definition.supportedSides.includes(params.sides);
}

function sortQuickOptions(
  options: QuickBehaviorPickerOption[],
): QuickBehaviorPickerOption[] {
  return [...options].sort((a, b) => {
    const aIndex = QUICK_BEHAVIOR_ORDER.indexOf(a.optionId);
    const bIndex = QUICK_BEHAVIOR_ORDER.indexOf(b.optionId);

    const safeAIndex = aIndex >= 0 ? aIndex : QUICK_BEHAVIOR_ORDER.length;
    const safeBIndex = bIndex >= 0 ? bIndex : QUICK_BEHAVIOR_ORDER.length;

    return safeAIndex - safeBIndex;
  });
}

export function useQuickDieBehaviorPicker({
  addQuickPresetDie,
  quickBehaviorConfig,
  onApplyPresetToExistingDraftDie,
}: {
  addQuickPresetDie: (sides: number, preset: QuickPresetSelection) => string;
  quickBehaviorConfig: any;
  onApplyPresetToExistingDraftDie?: (
    sides: number,
    preset: QuickPresetSelection,
  ) => boolean;
}) {
  const [editingDieSides, setEditingDieSides] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  function open(sides: number) {
    setEditingDieSides(sides);
    setVisible(true);
  }

  function close() {
    setVisible(false);
    setEditingDieSides(null);
  }

  const behaviors = useMemo<QuickBehaviorPickerOption[]>(() => {
    if (editingDieSides == null) return [];

    const visibleBehaviors: QuickBehaviorPickerOption[] = RULE_BEHAVIORS.filter(
      (behavior) => {
        if (behavior.visibleInQuickPicker === false) return false;

        if (!behavior.supportedSides) return true;

        return behavior.supportedSides.includes(editingDieSides);
      },
    ).map((behavior) => ({
      optionId: behavior.key,
      behaviorKey: behavior.key,
      context: "quick_roll" as const,
      enabled: true,
      variant: "default" as const,
    }));

    const shouldShowKeepDrop = isBehaviorCompatibleWithSides({
      behaviorKey: "custom_pipeline",
      sides: editingDieSides,
    });

    const keepDropOption: QuickBehaviorPickerOption = {
      optionId: "keep_drop_pipeline",
      behaviorKey: "custom_pipeline",
      context: "quick_roll",
      enabled: shouldShowKeepDrop,
      label: "Garder / Retirer des dés",
      description:
        "Garde ou retire les meilleurs ou les plus faibles dés, puis calcule le résultat.",
      variant: "keep_drop",
    };

    const options = shouldShowKeepDrop
      ? [...visibleBehaviors, keepDropOption]
      : visibleBehaviors;

    const uniqueOptions = options.filter(
      (option, index, list) =>
        list.findIndex((item) => item.optionId === option.optionId) === index,
    );

    return sortQuickOptions(uniqueOptions);
  }, [editingDieSides]);

  function getDefinition(behaviorKey: RuleBehaviorKey) {
    return getRuleBehaviorDefinition(behaviorKey);
  }

  function select(option: QuickBehaviorPickerOption) {
    if (!option.enabled) return;
    if (editingDieSides == null) return;

    const behaviorKey = option.behaviorKey;
    const def = getDefinition(behaviorKey);
    if (!def) return;

    const quickScope =
      option.variant === "keep_drop"
        ? "entry"
        : def.defaultScope === "group"
          ? "group"
          : "entry";

    const label = option.label ?? def.label;
    const description = option.description ?? def.description;

    if (
      option.variant === "keep_drop" ||
      behaviorNeedsSelectionConfig(behaviorKey)
    ) {
      quickBehaviorConfig.open({
        behaviorKey,
        label,
        scope: quickScope,
        variant: option.variant,
      });
      return;
    }

    const defaultValues: Record<string, unknown> = {};

    for (const field of def.fields) {
      defaultValues[field.key] = field.defaultValue;
    }

    const tempRule = buildDraftTempRuleFromPreset({
      preset: {
        key: behaviorKey,
        label,
        description,
        scope: quickScope,
        behaviorKey,
        defaultValues,
      },
      sides: editingDieSides,
      actionName: label,
    });

    const preset: QuickPresetSelection = {
      scope: quickScope,
      rule: tempRule,
    };

    const wasAppliedToExistingDie = onApplyPresetToExistingDraftDie?.(
      editingDieSides,
      preset,
    );

    if (wasAppliedToExistingDie) {
      close();
      return;
    }

    addQuickPresetDie(editingDieSides, preset);

    close();
  }

  return {
    visible,
    editingDieSides,
    behaviors,
    open,
    close,
    select,
    getDefinition,
  };
}
