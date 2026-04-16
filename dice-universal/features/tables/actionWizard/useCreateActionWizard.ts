import { useMemo, useState } from "react";
import {
    createDefaultActionWizardDraft,
    getDefaultDieForBehavior,
} from "./defaults";
import { validateActionWizardStep } from "./helpers";
import type { ActionBehaviorType } from "./behaviorCatalog";
import type { ActionWizardDraft, ActionWizardStep } from "./types";

const STEP_ORDER: ActionWizardStep[] = [
    "name",
    "type",
    "dice",
    "behavior",
    "summary",
];

export function useCreateActionWizard() {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState<ActionWizardStep>("name");
    const [draft, setDraft] = useState<ActionWizardDraft>(
        createDefaultActionWizardDraft(),
    );
    const [error, setError] = useState<string | null>(null);

    function open() {
        setDraft(createDefaultActionWizardDraft());
        setStep("name");
        setError(null);
        setVisible(true);
    }

    function close() {
        setVisible(false);
        setStep("name");
        setDraft(createDefaultActionWizardDraft());
        setError(null);
    }

    function updateDraft<K extends keyof ActionWizardDraft>(
        key: K,
        value: ActionWizardDraft[K],
    ) {
        setDraft((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function updateDie<K extends keyof ActionWizardDraft["die"]>(
        key: K,
        value: ActionWizardDraft["die"][K],
    ) {
        setDraft((prev) => ({
            ...prev,
            die: {
                ...prev.die,
                [key]: value,
            },
        }));
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

    function setBehaviorType(behaviorType: ActionBehaviorType) {
        setDraft((prev) => ({
            ...prev,
            behaviorType,
            die: getDefaultDieForBehavior(behaviorType),
        }));
    }

    function goNext() {
        const validationError = validateActionWizardStep(step, draft);
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
        updateDie,
        updateRangeRow,
        addRangeRow,
        removeRangeRow,
        setBehaviorType,
    };
}