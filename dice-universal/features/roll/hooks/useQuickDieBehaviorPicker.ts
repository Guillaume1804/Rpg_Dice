// dice-universal/features/roll/hooks/useQuickDieBehaviorPicker.ts

import { useMemo, useState } from "react";
import {
  RULE_BEHAVIOR_VERTICAL_SLICE_ORDER,
  getRuleBehaviorDefinition,
  getRuleBehaviorVerticalSliceLabel,
  getVisibleRuleBehaviorsByVerticalSlice,
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
  categoryLabel?: string;
  variant: QuickBehaviorPickerVariant;
};

function isBehaviorCompatibleWithSides(params: {
  behaviorKey: RuleBehaviorKey;
  sides: number;
}) {
  const definition = getRuleBehaviorDefinition(params.behaviorKey);
  if (!definition) return false;

  if (!definition.supportedSides || definition.supportedSides.length === 0) {
    return true;
  }

  return definition.supportedSides.includes(params.sides);
}

function buildQuickBehaviorOptionsForSides(
  sides: number,
): QuickBehaviorPickerOption[] {
  const options: QuickBehaviorPickerOption[] = [];

  for (const slice of RULE_BEHAVIOR_VERTICAL_SLICE_ORDER) {
    const categoryLabel = getRuleBehaviorVerticalSliceLabel(slice);

    if (slice === "keep_drop") {
      const shouldShowKeepDrop = isBehaviorCompatibleWithSides({
        behaviorKey: "custom_pipeline",
        sides,
      });

      if (shouldShowKeepDrop) {
        options.push({
          optionId: "keep_drop_pipeline",
          behaviorKey: "custom_pipeline",
          context: "quick_roll",
          enabled: true,
          label: "Garder / retirer des dés",
          description:
            "Garde ou retire les meilleurs ou les plus faibles dés, puis calcule le résultat.",
          categoryLabel,
          variant: "keep_drop",
        });
      }

      continue;
    }

    const visibleBehaviors = getVisibleRuleBehaviorsByVerticalSlice(slice);

    for (const behavior of visibleBehaviors) {
      if (
        !isBehaviorCompatibleWithSides({
          behaviorKey: behavior.key,
          sides,
        })
      ) {
        continue;
      }

      options.push({
        optionId: behavior.key,
        behaviorKey: behavior.key,
        context: "quick_roll",
        enabled: true,
        label: behavior.label,
        description: behavior.description,
        categoryLabel,
        variant: "default",
      });
    }
  }

  return options.filter(
    (option, index, list) =>
      list.findIndex((item) => item.optionId === option.optionId) === index,
  );
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
    return buildQuickBehaviorOptionsForSides(editingDieSides);
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
