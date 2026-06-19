import type {
    GuidedBehaviorApplicationMode,
    GuidedBehaviorDiceCompatibility,
    GuidedBehaviorDraft,
    GuidedBehaviorIntent,
    GuidedBehaviorPrimaryOutput,
    GuidedBehaviorReadingMode,
} from "./types";

export function getDefaultReadingModeForIntent(
    intent: GuidedBehaviorIntent,
): GuidedBehaviorReadingMode {
    switch (intent) {
        case "sum":
            return "sum";
        case "check":
            return "single_check";
        case "degrees":
            return "threshold_degrees";
        case "success_pool":
            return "success_pool";
        case "table":
            return "table_lookup";
        case "keep_drop":
            return "sum";
        case "advanced":
        default:
            return "sum";
    }
}

export function getDefaultPrimaryOutputForIntent(
    intent: GuidedBehaviorIntent,
): GuidedBehaviorPrimaryOutput {
    switch (intent) {
        case "sum":
            return "total";
        case "check":
            return "outcome";
        case "degrees":
            return "degrees";
        case "success_pool":
            return "successes";
        case "table":
            return "table_label";
        case "keep_drop":
            return "kept_values";
        case "advanced":
        default:
            return "pipeline_final";
    }
}

export function getDefaultApplicationModeForIntent(
    intent: GuidedBehaviorIntent,
): GuidedBehaviorApplicationMode {
    switch (intent) {
        case "success_pool":
            return "whole_roll";
        case "table":
            return "whole_roll";
        case "sum":
        case "check":
        case "degrees":
        case "keep_drop":
            return "single_entry";
        case "advanced":
        default:
            return "auto";
    }
}

export function getDefaultDiceCompatibilityForIntent(
    intent: GuidedBehaviorIntent,
): GuidedBehaviorDiceCompatibility {
    switch (intent) {
        case "degrees":
            return { sides: [100] };
        case "check":
            return { sides: [20] };
        case "success_pool":
            return { sides: [6] };
        default:
            return "all";
    }
}

export function applyIntentDefaultsToDraft(
    draft: GuidedBehaviorDraft,
    intent: GuidedBehaviorIntent,
): GuidedBehaviorDraft {
    return {
        ...draft,
        intent,
        diceCompatibility: getDefaultDiceCompatibilityForIntent(intent),
        applicationMode: getDefaultApplicationModeForIntent(intent),
        reading: {
            ...draft.reading,
            mode: getDefaultReadingModeForIntent(intent),
        },
        output: {
            ...draft.output,
            primary: getDefaultPrimaryOutputForIntent(intent),
        },
    };
}