import type { RuleScope } from "../../../data/repositories/rulesRepo";
import type {
    ActionWizardDraft,
    ActionWizardStep,
} from "./types";

export type BuiltActionRulePayload = {
    name: string;
    kind: string;
    params_json: string;
    supported_sides_json: string;
    scope: RuleScope;
};

function parseNumberList(value: string): number[] {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => Number(item))
        .filter((n) => Number.isFinite(n));
}

function parseValidRanges(draft: ActionWizardDraft) {
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

export function validateActionWizardStep(
    step: ActionWizardStep,
    draft: ActionWizardDraft,
): string | null {
    if (step === "name") {
        if (!draft.name.trim()) {
            return "Le nom de l’action est obligatoire.";
        }
        return null;
    }

    if (step === "type") {
        if (!draft.behaviorType) {
            return "Choisis un type d’action.";
        }
        return null;
    }

    if (step === "dice") {
        if (!draft.die.sides || draft.die.sides <= 0) {
            return "Le type de dé est obligatoire.";
        }

        if (!Number.isFinite(draft.die.qty) || draft.die.qty <= 0) {
            return "La quantité doit être supérieure à 0.";
        }

        if (!Number.isFinite(draft.die.modifier)) {
            return "Le modificateur est invalide.";
        }

        return null;
    }

    if (step === "behavior") {
        if (!draft.behaviorType) {
            return "Choisis un type d’action.";
        }

        if (
            draft.behaviorType === "single_check" ||
            draft.behaviorType === "highest_of_pool" ||
            draft.behaviorType === "lowest_of_pool"
        ) {
            if (
                draft.successThreshold.trim() !== "" &&
                !Number.isFinite(Number(draft.successThreshold))
            ) {
                return "Le seuil doit être un nombre valide.";
            }

            return null;
        }

        if (draft.behaviorType === "success_pool") {
            if (!Number.isFinite(Number(draft.successAtOrAbove))) {
                return "Le seuil de réussite du pool doit être un nombre valide.";
            }

            return null;
        }

        if (
            draft.behaviorType === "keep_highest_n" ||
            draft.behaviorType === "keep_lowest_n"
        ) {
            const keepCount = Number(draft.keepCount);
            if (!Number.isFinite(keepCount) || keepCount <= 0) {
                return "Le nombre de dés à garder doit être supérieur à 0.";
            }

            if (keepCount > draft.die.qty) {
                return "Tu ne peux pas garder plus de dés que tu n’en lances.";
            }

            return null;
        }

        if (
            draft.behaviorType === "drop_highest_n" ||
            draft.behaviorType === "drop_lowest_n"
        ) {
            const dropCount = Number(draft.dropCount);
            if (!Number.isFinite(dropCount) || dropCount <= 0) {
                return "Le nombre de dés à retirer doit être supérieur à 0.";
            }

            if (dropCount >= draft.die.qty) {
                return "Tu dois conserver au moins un dé après retrait.";
            }

            return null;
        }

        if (
            draft.behaviorType === "banded_sum" ||
            draft.behaviorType === "table_lookup"
        ) {
            const hasValidRange = draft.ranges.some(
                (row) =>
                    Number.isFinite(Number(row.min)) &&
                    Number.isFinite(Number(row.max)) &&
                    row.label.trim().length > 0,
            );

            if (!hasValidRange) {
                return "Ajoute au moins une plage valide.";
            }

            return null;
        }

        if (draft.behaviorType === "sum_total") {
            return null;
        }
    }

    return null;
}

export function buildRulePayloadFromActionWizard(
    draft: ActionWizardDraft,
): BuiltActionRulePayload {
    if (!draft.behaviorType) {
        throw new Error("Type d’action manquant.");
    }

    if (!draft.name.trim()) {
        throw new Error("Le nom de l’action est obligatoire.");
    }

    if (!draft.die.sides || draft.die.sides <= 0) {
        throw new Error("Le type de dé est obligatoire.");
    }

    const supported_sides_json = JSON.stringify([draft.die.sides]);

    if (draft.behaviorType === "single_check") {
        const threshold =
            draft.successThreshold.trim() === ""
                ? null
                : Number(draft.successThreshold);

        return {
            name: `${draft.name.trim()} — règle`,
            kind: "single_check",
            params_json: JSON.stringify({
                compare: draft.compare,
                success_threshold: threshold,
                crit_success_faces: parseNumberList(draft.critSuccessFaces),
                crit_failure_faces: parseNumberList(draft.critFailureFaces),
            }),
            supported_sides_json,
            scope: "entry",
        };
    }

    if (draft.behaviorType === "success_pool") {
        return {
            name: `${draft.name.trim()} — règle`,
            kind: "success_pool",
            params_json: JSON.stringify({
                success_at_or_above: Number(draft.successAtOrAbove),
                fail_faces: parseNumberList(draft.failFaces),
                glitch_rule: draft.glitchRule,
            }),
            supported_sides_json,
            scope: "group",
        };
    }

    if (draft.behaviorType === "sum_total") {
        return {
            name: `${draft.name.trim()} — règle`,
            kind: "sum",
            params_json: JSON.stringify({}),
            supported_sides_json,
            scope: "entry",
        };
    }

    if (draft.behaviorType === "banded_sum") {
        return {
            name: `${draft.name.trim()} — règle`,
            kind: "banded_sum",
            params_json: JSON.stringify({
                bands: parseValidRanges(draft),
                defaultLabel: "—",
            }),
            supported_sides_json,
            scope: "entry",
        };
    }

    if (draft.behaviorType === "highest_of_pool") {
        const threshold =
            draft.successThreshold.trim() === ""
                ? null
                : Number(draft.successThreshold);

        return {
            name: `${draft.name.trim()} — règle`,
            kind: "highest_of_pool",
            params_json: JSON.stringify({
                compare: draft.compare,
                success_threshold: threshold,
                crit_success_faces: parseNumberList(draft.critSuccessFaces),
                crit_failure_faces: parseNumberList(draft.critFailureFaces),
            }),
            supported_sides_json,
            scope: "entry",
        };
    }

    if (draft.behaviorType === "lowest_of_pool") {
        const threshold =
            draft.successThreshold.trim() === ""
                ? null
                : Number(draft.successThreshold);

        return {
            name: `${draft.name.trim()} — règle`,
            kind: "lowest_of_pool",
            params_json: JSON.stringify({
                compare: draft.compare,
                success_threshold: threshold,
                crit_success_faces: parseNumberList(draft.critSuccessFaces),
                crit_failure_faces: parseNumberList(draft.critFailureFaces),
            }),
            supported_sides_json,
            scope: "entry",
        };
    }

    if (draft.behaviorType === "keep_highest_n") {
        return {
            name: `${draft.name.trim()} — règle`,
            kind: "keep_highest_n",
            params_json: JSON.stringify({
                keep: Number(draft.keepCount),
                result_mode: draft.resultMode,
            }),
            supported_sides_json,
            scope: "entry",
        };
    }

    if (draft.behaviorType === "keep_lowest_n") {
        return {
            name: `${draft.name.trim()} — règle`,
            kind: "keep_lowest_n",
            params_json: JSON.stringify({
                keep: Number(draft.keepCount),
                result_mode: draft.resultMode,
            }),
            supported_sides_json,
            scope: "entry",
        };
    }

    if (draft.behaviorType === "drop_highest_n") {
        return {
            name: `${draft.name.trim()} — règle`,
            kind: "drop_highest_n",
            params_json: JSON.stringify({
                drop: Number(draft.dropCount),
                result_mode: draft.resultMode,
            }),
            supported_sides_json,
            scope: "entry",
        };
    }

    if (draft.behaviorType === "drop_lowest_n") {
        return {
            name: `${draft.name.trim()} — règle`,
            kind: "drop_lowest_n",
            params_json: JSON.stringify({
                drop: Number(draft.dropCount),
                result_mode: draft.resultMode,
            }),
            supported_sides_json,
            scope: "entry",
        };
    }

    return {
        name: `${draft.name.trim()} — règle`,
        kind: "table_lookup",
        params_json: JSON.stringify({
            ranges: parseValidRanges(draft),
            defaultLabel: "—",
        }),
        supported_sides_json,
        scope: "entry",
    };
}

export function buildActionWizardSummary(
    draft: ActionWizardDraft,
): string {
    const dieLabel = draft.die.sides
        ? `${draft.die.qty}d${draft.die.sides}`
        : "dé non défini";

    if (draft.behaviorType === "single_check") {
        return `${draft.name} • ${dieLabel} • test simple`;
    }

    if (draft.behaviorType === "success_pool") {
        return `${draft.name} • ${dieLabel} • pool de succès`;
    }

    if (draft.behaviorType === "sum_total") {
        return `${draft.name} • ${dieLabel} • somme totale`;
    }

    if (draft.behaviorType === "banded_sum") {
        return `${draft.name} • ${dieLabel} • somme par paliers`;
    }

    if (draft.behaviorType === "highest_of_pool") {
        return `${draft.name} • ${dieLabel} • meilleur dé`;
    }

    if (draft.behaviorType === "lowest_of_pool") {
        return `${draft.name} • ${dieLabel} • pire dé`;
    }

    if (draft.behaviorType === "keep_highest_n") {
        return `${draft.name} • ${dieLabel} • garder ${draft.keepCount} meilleurs`;
    }

    if (draft.behaviorType === "keep_lowest_n") {
        return `${draft.name} • ${dieLabel} • garder ${draft.keepCount} pires`;
    }

    if (draft.behaviorType === "drop_highest_n") {
        return `${draft.name} • ${dieLabel} • retirer ${draft.dropCount} meilleurs`;
    }

    if (draft.behaviorType === "drop_lowest_n") {
        return `${draft.name} • ${dieLabel} • retirer ${draft.dropCount} pires`;
    }

    if (draft.behaviorType === "table_lookup") {
        return `${draft.name} • ${dieLabel} • table d’intervalles`;
    }

    return draft.name || "Nouvelle action";
}