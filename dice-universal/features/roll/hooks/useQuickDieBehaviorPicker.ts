import { useMemo, useState } from "react";
import {
    getBehaviorsForContext,
    getBehaviorDefaults,
} from "../../../core/rules/getBehaviorsForContext";
import { getActionWizardBehaviors } from "../../../core/rules/behaviorCatalog";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorCatalog";
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

        return getBehaviorsForContext("quick_roll").filter((behavior) => {
            const def = getActionWizardBehaviors().find(
                (item) => item.key === behavior.behaviorKey,
            );

            if (!def?.supportedSides) return true;

            return def.supportedSides.includes(editingDieSides);
        });
    }, [editingDieSides]);

    function getDefinition(behaviorKey: RuleBehaviorKey) {
        return (
            getActionWizardBehaviors().find((def) => def.key === behaviorKey) ?? null
        );
    }

    function select(behaviorKey: RuleBehaviorKey) {
        if (editingDieSides == null) return;

        const def = getDefinition(behaviorKey);
        if (!def) return;

        const defaults = getBehaviorDefaults(behaviorKey, "quick_roll");
        const quickScope = def.scope === "group" ? "group" : "entry";

        if (behaviorNeedsSelectionConfig(behaviorKey)) {
            quickBehaviorConfig.open({
                behaviorKey,
                label: def.label,
                scope: quickScope,
            });
            return;
        }

        const tempRule = buildDraftTempRuleFromPreset({
            preset: {
                key: behaviorKey,
                label: def.label,
                description: def.description,
                scope: quickScope,
                behaviorKey,
                defaultValues: defaults,
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