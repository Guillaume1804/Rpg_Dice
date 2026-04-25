// dice-universal/features/rules/ruleWizard/helpers.ts

import type { RuleWizardDraft, RuleWizardStep } from "./types";

import { RULE_BEHAVIORS } from "../../../core/rules/behaviorRegistry";

function parseNumberList(value: string): number[] {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map(Number)
        .filter(Number.isFinite);
}

function parseSupportedSides(value: string): number[] {
    if (value.trim().toLowerCase() === "all") return [];

    return parseNumberList(value).filter((side) => side > 0);
}

function parseRanges(draft: RuleWizardDraft) {
    return draft.ranges
        .map((row) => ({
            min: Number(row.min),
            max: Number(row.max),
            label: row.label.trim(),
        }))
        .filter(
            (row) =>
                Number.isFinite(row.min) &&
                Number.isFinite(row.max) &&
                row.label.length > 0,
        );
}

function getBehaviorDefinition(behaviorKey: RuleWizardDraft["behaviorKey"]) {
    if (!behaviorKey) return null;
    return RULE_BEHAVIORS.find((behavior) => behavior.key === behaviorKey) ?? null;
}

export function validateRuleWizardStep(
    step: RuleWizardStep,
    draft: RuleWizardDraft,
): string | null {
    if (step === "name" && !draft.name.trim()) {
        return "Le nom de la règle est obligatoire.";
    }

    if (step === "dice") {
        const sides = parseSupportedSides(draft.supportedSidesText);
        const isAll = draft.supportedSidesText.trim().toLowerCase() === "all";

        if (!isAll && sides.length === 0) {
            return "Indique au moins un type de dé, par exemple 20 ou 6,10,100.";
        }
    }

    if (step === "behavior" && !draft.behaviorKey) {
        return "Choisis un comportement de règle.";
    }

    if (step === "behavior" && draft.behaviorKey === "single_check") {
        if (
            draft.successThreshold.trim() !== "" &&
            !Number.isFinite(Number(draft.successThreshold))
        ) {
            return "Le seuil doit être un nombre valide.";
        }
    }

    if (step === "behavior" && draft.behaviorKey === "success_pool") {
        if (!Number.isFinite(Number(draft.successAtOrAbove))) {
            return "Le seuil de succès doit être un nombre valide.";
        }
    }

    if (
        step === "behavior" &&
        (draft.behaviorKey === "table_lookup" ||
            draft.behaviorKey === "banded_sum")
    ) {
        if (parseRanges(draft).length === 0) {
            return "Ajoute au moins une plage valide.";
        }
    }

    if (
        step === "behavior" &&
        (draft.behaviorKey === "keep_highest_n" ||
            draft.behaviorKey === "keep_lowest_n")
    ) {
        if (!Number.isFinite(Number(draft.keepCount)) || Number(draft.keepCount) <= 0) {
            return "Le nombre de dés à garder doit être supérieur à 0.";
        }
    }

    if (
        step === "behavior" &&
        (draft.behaviorKey === "drop_highest_n" ||
            draft.behaviorKey === "drop_lowest_n")
    ) {
        if (!Number.isFinite(Number(draft.dropCount)) || Number(draft.dropCount) <= 0) {
            return "Le nombre de dés à retirer doit être supérieur à 0.";
        }
    }

    return null;
}

export function buildRulePayloadFromRuleWizard(draft: RuleWizardDraft) {
    const behaviorDefinition = getBehaviorDefinition(draft.behaviorKey);

    if (!draft.behaviorKey || !behaviorDefinition) {
        throw new Error("Comportement manquant.");
    }

    const supportedSides = parseSupportedSides(draft.supportedSidesText);
    const supported_sides_json =
        draft.supportedSidesText.trim().toLowerCase() === "all"
            ? null
            : JSON.stringify(supportedSides);

    const params: Record<string, unknown> = {};

    for (const field of behaviorDefinition.fields) {
        const paramsKey = field.paramsKey ?? field.key;

        if (field.type === "ranges") {
            params[paramsKey] = parseRanges(draft);
            continue;
        }

        const rawValue = draft[field.key as keyof RuleWizardDraft];

        if (field.type === "number") {
            const textValue = String(rawValue ?? "").trim();
            params[paramsKey] = textValue === "" ? null : Number(textValue);
            continue;
        }

        if (
            field.key === "critSuccessFaces" ||
            field.key === "critFailureFaces" ||
            field.key === "failFaces"
        ) {
            params[paramsKey] = parseNumberList(String(rawValue ?? ""));
            continue;
        }

        params[paramsKey] = rawValue;
    }

    if (draft.behaviorKey === "table_lookup") {
        params.defaultLabel = "Normal";
    }

    if (draft.behaviorKey === "banded_sum") {
        params.defaultLabel = "—";
    }

    return {
        name: draft.name.trim(),
        kind: behaviorDefinition.kind,
        scope: draft.scope,
        supported_sides_json,
        params_json: JSON.stringify(params),
    };
}