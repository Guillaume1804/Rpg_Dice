// dice-universal\features\roll\hooks\useQuickDieBehaviorPicker.ts

import { useMemo, useState } from "react";
import {
  RULE_BEHAVIORS,
  getRuleBehaviorDefinition,
  type RuleBehaviorKey,
} from "../../../core/rules/behaviorRegistry";
import { buildDraftTempRuleFromPreset } from "../helpers/buildDraftTempRuleFromPreset";
import { behaviorNeedsSelectionConfig } from "../helpers/quickBehaviorConfig";

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

  const behaviors = useMemo(() => {
    if (editingDieSides == null) return [];

    return RULE_BEHAVIORS.filter((behavior) => {
      if (!behavior.supportedSides) return true;
      return behavior.supportedSides.includes(editingDieSides);
    }).map((behavior) => ({
      behaviorKey: behavior.key,
      context: "quick_roll" as const,
      enabled: true,
    }));
  }, [editingDieSides]);

  function getDefinition(behaviorKey: RuleBehaviorKey) {
    return getRuleBehaviorDefinition(behaviorKey);
  }

  function select(behaviorKey: RuleBehaviorKey) {
    if (editingDieSides == null) return;

    const def = getDefinition(behaviorKey);
    if (!def) return;

    const quickScope = def.defaultScope === "group" ? "group" : "entry";

    if (behaviorNeedsSelectionConfig(behaviorKey)) {
      quickBehaviorConfig.open({
        behaviorKey,
        label: def.label,
        scope: quickScope,
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
        label: def.label,
        description: def.description,
        scope: quickScope,
        behaviorKey,
        defaultValues,
      },
      sides: editingDieSides,
      actionName: def.label,
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
