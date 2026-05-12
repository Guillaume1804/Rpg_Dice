import { useMemo, useState } from "react";
import {
  RULE_BEHAVIORS,
  getRuleBehaviorDefinition,
  type RuleBehaviorKey,
} from "../../../core/rules/behaviorRegistry";
import { buildDraftTempRuleFromPreset } from "../helpers/buildDraftTempRuleFromPreset";
import { behaviorNeedsSelectionConfig } from "../helpers/quickBehaviorConfig";

export type QuickBehaviorPickerOption = {
  optionId: string;
  behaviorKey: RuleBehaviorKey;
  context: "quick_roll";
  enabled: boolean;
  label?: string;
  description?: string;
  variant?: "default" | "keep_drop";
};

export function useQuickDieBehaviorPicker({
  addQuickPresetDie,
  quickBehaviorConfig,
}: any) {
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

    const visibleBehaviors = RULE_BEHAVIORS.filter((behavior) => {
      if (behavior.visibleInQuickPicker !== true) return false;

      if (!behavior.supportedSides) return true;
      return behavior.supportedSides.includes(editingDieSides);
    }).map((behavior) => ({
      optionId: behavior.key,
      behaviorKey: behavior.key,
      context: "quick_roll" as const,
      enabled: true,
      variant: "default" as const,
    }));

    const customPipelineIndex = visibleBehaviors.findIndex(
      (behavior) => behavior.behaviorKey === "custom_pipeline",
    );

    const keepDropOption: QuickBehaviorPickerOption = {
      optionId: "keep_drop_pipeline",
      behaviorKey: "custom_pipeline",
      context: "quick_roll",
      enabled: true,
      label: "Garder / Retirer des dés",
      description:
        "Garde ou retire les meilleurs ou les plus faibles dés, puis calcule le résultat.",
      variant: "keep_drop",
    };

    if (customPipelineIndex >= 0) {
      return [
        ...visibleBehaviors.slice(0, customPipelineIndex),
        keepDropOption,
        ...visibleBehaviors.slice(customPipelineIndex),
      ];
    }

    return [...visibleBehaviors, keepDropOption];
  }, [editingDieSides]);

  function getDefinition(behaviorKey: RuleBehaviorKey) {
    return getRuleBehaviorDefinition(behaviorKey);
  }

  function select(option: QuickBehaviorPickerOption) {
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
        variant: option.variant ?? "default",
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

    addQuickPresetDie(editingDieSides, {
      scope: quickScope,
      rule: tempRule,
    });

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