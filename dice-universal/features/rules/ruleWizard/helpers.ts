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

    if (draft.behaviorKey === "single_check") {
        return {
            name: draft.name.trim(),
            kind: "single_check",
            scope: draft.scope,
            supported_sides_json,
            params_json: JSON.stringify({
                compare: draft.compare,
                success_threshold:
                    draft.successThreshold.trim() === ""
                        ? null
                        : Number(draft.successThreshold),
                crit_success_faces: parseNumberList(draft.critSuccessFaces),
                crit_failure_faces: parseNumberList(draft.critFailureFaces),
            }),
        };
    }

    if (draft.behaviorKey === "success_pool") {
        return {
            name: draft.name.trim(),
            kind: "success_pool",
            scope: draft.scope,
            supported_sides_json,
            params_json: JSON.stringify({
                success_at_or_above: Number(draft.successAtOrAbove),
                fail_faces: parseNumberList(draft.failFaces),
                glitch_rule: draft.glitchRule,
            }),
        };
    }

    if (draft.behaviorKey === "table_lookup") {
        return {
            name: draft.name.trim(),
            kind: "table_lookup",
            scope: draft.scope,
            supported_sides_json,
            params_json: JSON.stringify({
                ranges: parseRanges(draft),
                defaultLabel: "Normal",
            }),
        };
    }

    if (draft.behaviorKey === "banded_sum") {
        return {
            name: draft.name.trim(),
            kind: "banded_sum",
            scope: draft.scope,
            supported_sides_json,
            params_json: JSON.stringify({
                bands: parseRanges(draft),
                defaultLabel: "—",
            }),
        };
    }

    if (draft.behaviorKey === "sum_total") {
        return {
            name: draft.name.trim(),
            kind: "sum",
            scope: draft.scope,
            supported_sides_json,
            params_json: JSON.stringify({}),
        };
    }

    if (
        draft.behaviorKey === "keep_highest_n" ||
        draft.behaviorKey === "keep_lowest_n"
    ) {
        return {
            name: draft.name.trim(),
            kind: draft.behaviorKey,
            scope: draft.scope,
            supported_sides_json,
            params_json: JSON.stringify({
                keep: Number(draft.keepCount),
                result_mode: draft.resultMode === "values" ? "values" : "sum",
            }),
        };
    }

    if (
        draft.behaviorKey === "drop_highest_n" ||
        draft.behaviorKey === "drop_lowest_n"
    ) {
        return {
            name: draft.name.trim(),
            kind: draft.behaviorKey,
            scope: draft.scope,
            supported_sides_json,
            params_json: JSON.stringify({
                drop: Number(draft.dropCount),
                result_mode: draft.resultMode === "values" ? "values" : "sum",
            }),
        };
    }

    return {
        name: draft.name.trim(),
        kind: draft.behaviorKey,
        scope: draft.scope,
        supported_sides_json,
        params_json: JSON.stringify({}),
    };
}