// dice-universal/features/rules/ruleWizard/useRuleWizard.ts

import { useMemo, useState } from "react";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import { createDefaultRuleWizardDraft } from "./defaults";
import {
    buildRulePayloadFromRuleWizard,
    validateRuleWizardStep,
} from "./helpers";
import type { RuleWizardDraft, RuleWizardScope, RuleWizardStep } from "./types";

import { getRuleBehaviorDefinition } from "../../../core/rules/behaviorRegistry";

const STEP_ORDER: RuleWizardStep[] = [
    "name",
    "dice",
    "behavior",
    "scope",
    "summary",
];

export function useRuleWizard() {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState<RuleWizardStep>("name");
    const [draft, setDraft] = useState<RuleWizardDraft>(
        createDefaultRuleWizardDraft(),
    );
    const [error, setError] = useState<string | null>(null);

    function open() {
        setDraft(createDefaultRuleWizardDraft());
        setStep("name");
        setError(null);
        setVisible(true);
    }

    function close() {
        setVisible(false);
        setStep("name");
        setDraft(createDefaultRuleWizardDraft());
        setError(null);
    }

    function updateDraft<K extends keyof RuleWizardDraft>(
        key: K,
        value: RuleWizardDraft[K],
    ) {
        setDraft((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function setScope(scope: RuleWizardScope) {
        updateDraft("scope", scope);
    }

    function applyFieldDefault(
        draft: RuleWizardDraft,
        key: string,
        value: string,
    ): RuleWizardDraft {
        switch (key) {
            case "compare":
                return {
                    ...draft,
                    compare: value === "lte" ? "lte" : "gte",
                };

            case "successThreshold":
                return { ...draft, successThreshold: value };

            case "critSuccessFaces":
                return { ...draft, critSuccessFaces: value };

            case "critFailureFaces":
                return { ...draft, critFailureFaces: value };

            case "successAtOrAbove":
                return { ...draft, successAtOrAbove: value };

            case "failFaces":
                return { ...draft, failFaces: value };

            case "glitchRule":
                return { ...draft, glitchRule: value };

            case "keepCount":
                return { ...draft, keepCount: value };

            case "dropCount":
                return { ...draft, dropCount: value };

            case "resultMode":
                return {
                    ...draft,
                    resultMode: value === "values" ? "values" : "sum",
                };

            default:
                return draft;
        }
    }

    function setBehaviorKey(behaviorKey: RuleBehaviorKey) {
        const behavior = getRuleBehaviorDefinition(behaviorKey);

        setDraft((prev) => {
            let next: RuleWizardDraft = {
                ...prev,
                behaviorKey,
            };

            if (!behavior) {
                return next;
            }

            next = {
                ...next,
                scope: behavior.defaultScope,
            };

            if (behavior.supportedSides && behavior.supportedSides.length > 0) {
                next = {
                    ...next,
                    supportedSidesText: behavior.supportedSides.join(","),
                };
            }

            for (const field of behavior.fields) {
                if (field.type === "ranges") {
                    next = {
                        ...next,
                        ranges: field.defaultValue,
                    };
                    continue;
                }

                next = applyFieldDefault(next, field.key, field.defaultValue);
            }

            return next;
        });
    }

    function updateRangeRow(
        index: number,
        key: "min" | "max" | "label",
        value: string,
    ) {
        setDraft((prev) => ({
            ...prev,
            ranges: prev.ranges.map((row, i) =>
                i === index ? { ...row, [key]: value } : row,
            ),
        }));
    }

    function addRangeRow() {
        setDraft((prev) => ({
            ...prev,
            ranges: [...prev.ranges, { min: "", max: "", label: "" }],
        }));
    }

    function removeRangeRow(index: number) {
        setDraft((prev) => ({
            ...prev,
            ranges: prev.ranges.filter((_, i) => i !== index),
        }));
    }

    function goNext() {
        const validationError = validateRuleWizardStep(step, draft);

        if (validationError) {
            setError(validationError);
            return false;
        }

        setError(null);

        const currentIndex = STEP_ORDER.indexOf(step);
        if (currentIndex < STEP_ORDER.length - 1) {
            setStep(STEP_ORDER[currentIndex + 1]);
        }

        return true;
    }

    function goBack() {
        setError(null);

        const currentIndex = STEP_ORDER.indexOf(step);
        if (currentIndex > 0) {
            setStep(STEP_ORDER[currentIndex - 1]);
        }
    }

    function buildPayload() {
        return buildRulePayloadFromRuleWizard(draft);
    }

    const stepIndex = useMemo(() => STEP_ORDER.indexOf(step), [step]);

    return {
        visible,
        step,
        stepIndex,
        totalSteps: STEP_ORDER.length,
        draft,
        error,

        open,
        close,
        goNext,
        goBack,

        updateDraft,
        setScope,
        setBehaviorKey,
        updateRangeRow,
        addRangeRow,
        removeRangeRow,

        buildPayload,
    };
}