// dice-universal/features/roll/hooks/useQuickDieBehaviorPicker.ts

import { useMemo, useState } from "react";
import {
  RULE_BEHAVIOR_VERTICAL_SLICE_ORDER,
  getRuleBehaviorDefinition,
  getRuleBehaviorVerticalSliceLabel,
  getVisibleRuleBehaviorsByVerticalSlice,
  type RuleBehaviorKey,
} from "../../../core/rules/behaviorRegistry";

import {
  parseSupportedSides,
  type RuleRow,
} from "../../../data/repositories/rulesRepo";

import { buildDraftTempRuleFromPreset } from "../helpers/buildDraftTempRuleFromPreset";
import { behaviorNeedsSelectionConfig } from "../helpers/quickBehaviorConfig";
import type { QuickPresetSelection } from "./useQuickRollDraft";

export type QuickBehaviorPickerVariant = "default" | "keep_drop";

export type QuickBehaviorPickerOption = {
  optionId: string;
  behaviorKey: RuleBehaviorKey;
  context: "quick_roll" | "saved_rule";
  enabled: boolean;
  label?: string;
  description?: string;
  categoryLabel?: string;
  variant: QuickBehaviorPickerVariant;
  sourceRule?: RuleRow;
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

function getBehaviorKeyFromRule(rule: RuleRow): RuleBehaviorKey {
  const key = rule.behavior_key ?? rule.kind;

  switch (key) {
    case "sum_total":
    case "single_check":
    case "threshold_degrees":
    case "success_pool":
    case "table_lookup":
    case "banded_sum":
    case "highest_of_pool":
    case "lowest_of_pool":
    case "keep_highest_n":
    case "keep_lowest_n":
    case "drop_highest_n":
    case "drop_lowest_n":
    case "custom_pipeline":
      return key;

    case "sum":
      return "sum_total";

    case "pipeline":
      return "custom_pipeline";

    default:
      return "custom_pipeline";
  }
}

function isRuleCompatibleWithSides(rule: RuleRow, sides: number) {
  const supportedSides = parseSupportedSides(rule);

  if (supportedSides.length === 0) {
    return true;
  }

  return supportedSides.includes(sides);
}

function getSavedRuleCategoryLabel(rule: RuleRow) {
  if (rule.kind === "pipeline") return "Mes comportements avancés";
  if (rule.kind === "success_pool") return "Mes pools";
  if (rule.kind === "threshold_degrees") return "Mes degrés";
  if (rule.kind === "single_check") return "Mes seuils";
  if (rule.kind === "table_lookup" || rule.kind === "banded_sum") {
    return "Mes paliers";
  }

  return "Mes comportements";
}

function getSavedRuleDescription(rule: RuleRow) {
  if (rule.kind === "pipeline") {
    return "Comportement personnalisé avancé créé dans l’atelier.";
  }

  if (rule.kind === "success_pool") {
    return "Pool de succès personnalisé créé dans l’atelier.";
  }

  if (rule.kind === "threshold_degrees") {
    return "Test avec degrés personnalisé créé dans l’atelier.";
  }

  if (rule.kind === "single_check") {
    return "Test avec seuil personnalisé créé dans l’atelier.";
  }

  if (rule.kind === "sum") {
    return "Somme simple personnalisée créée dans l’atelier.";
  }

  return "Comportement personnalisé créé dans l’atelier.";
}

function buildSavedRuleOptionsForSides(params: {
  sides: number;
  availableRules: RuleRow[];
}): QuickBehaviorPickerOption[] {
  const { sides, availableRules } = params;

  return availableRules
    .filter((rule) => rule.is_system !== 1)
    .filter((rule) => isRuleCompatibleWithSides(rule, sides))
    .map((rule) => ({
      optionId: `saved-rule:${rule.id}`,
      behaviorKey: getBehaviorKeyFromRule(rule),
      context: "saved_rule" as const,
      enabled: true,
      label: rule.name,
      description: getSavedRuleDescription(rule),
      categoryLabel: getSavedRuleCategoryLabel(rule),
      variant: "default" as const,
      sourceRule: rule,
    }));
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
  availableRules = [],
  onApplyPresetToExistingDraftDie,
}: {
  addQuickPresetDie: (sides: number, preset: QuickPresetSelection) => string;
  quickBehaviorConfig: any;
  availableRules?: RuleRow[];
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

    const systemOptions = buildQuickBehaviorOptionsForSides(editingDieSides);

    const savedRuleOptions = buildSavedRuleOptionsForSides({
      sides: editingDieSides,
      availableRules,
    });

    return [...systemOptions, ...savedRuleOptions];
  }, [availableRules, editingDieSides]);

  function getDefinition(behaviorKey: RuleBehaviorKey) {
    return getRuleBehaviorDefinition(behaviorKey);
  }

  function select(option: QuickBehaviorPickerOption) {
    if (!option.enabled) return;
    if (editingDieSides == null) return;

    if (option.sourceRule) {
      const sourceRule = option.sourceRule;

      const quickScope =
        sourceRule.scope === "group"
          ? "group"
          : sourceRule.scope === "both"
            ? "entry"
            : "entry";

      const preset: QuickPresetSelection = {
        scope: quickScope,
        rule: {
          id: sourceRule.id,
          name: sourceRule.name,
          kind: sourceRule.kind,
          params_json: sourceRule.params_json,
        } as QuickPresetSelection["rule"],
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
      return;
    }

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
