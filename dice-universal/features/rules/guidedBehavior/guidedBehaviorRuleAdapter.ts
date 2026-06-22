// dice-universal/features/rules/guidedBehavior/guidedBehaviorRuleAdapter.ts

import type { RuleRow } from "../../../data/repositories/rulesRepo";
import {
    DEFAULT_GUIDED_BEHAVIOR_DRAFT,
    type GuidedBehaviorApplicationMode,
    type GuidedBehaviorDraft,
    type GuidedBehaviorIntent,
    type GuidedBehaviorPrimaryOutput,
} from "./types";
import { applyIntentDefaultsToDraft } from "./guidedBehaviorDefaults";
import { resolveGuidedBehaviorScope } from "./resolveGuidedBehaviorScope";

function safeParseJson(value: string | null | undefined): any {
    try {
        return JSON.parse(value || "{}");
    } catch {
        return {};
    }
}

function parseSupportedSides(value: string | null | undefined) {
    const parsed = safeParseJson(value);

    if (!Array.isArray(parsed)) {
        return "all" as const;
    }

    const sides = parsed.map(Number).filter((side) => Number.isFinite(side) && side > 0);

    if (sides.length === 0) {
        return "all" as const;
    }

    return { sides };
}

function isGuidedBehaviorIntent(value: unknown): value is GuidedBehaviorIntent {
    return (
        value === "sum" ||
        value === "check" ||
        value === "degrees" ||
        value === "success_pool" ||
        value === "keep_drop" ||
        value === "table" ||
        value === "advanced"
    );
}

function isGuidedBehaviorApplicationMode(
    value: unknown,
): value is GuidedBehaviorApplicationMode {
    return value === "auto" || value === "single_entry" || value === "whole_roll";
}

function isGuidedBehaviorPrimaryOutput(
    value: unknown,
): value is GuidedBehaviorPrimaryOutput {
    return (
        value === "total" ||
        value === "outcome" ||
        value === "successes" ||
        value === "degrees" ||
        value === "table_label" ||
        value === "kept_values" ||
        value === "pipeline_final"
    );
}

function inferIntentFromRule(rule: RuleRow): GuidedBehaviorIntent {
    const key = rule.behavior_key ?? rule.kind;

    switch (key) {
        case "sum_total":
        case "sum":
            return "sum";

        case "single_check":
            return "check";

        case "threshold_degrees":
            return "degrees";

        case "success_pool":
            return "success_pool";

        case "table_lookup":
        case "banded_sum":
            return "table";

        case "keep_highest_n":
        case "keep_lowest_n":
        case "drop_highest_n":
        case "drop_lowest_n":
            return "keep_drop";

        case "custom_pipeline":
        case "pipeline":
        default:
            return "advanced";
    }
}

function applyRuleParamsToDraft(
    draft: GuidedBehaviorDraft,
    rule: RuleRow,
): GuidedBehaviorDraft {
    const params = safeParseJson(rule.params_json);

    if (rule.kind === "single_check") {
        return {
            ...draft,
            reading: {
                ...draft.reading,
                mode: "single_check",
                compare: params.compare === "lte" ? "lte" : "gte",
                successThreshold:
                    params.success_threshold == null ? "" : String(params.success_threshold),
            },
            events: {
                ...draft.events,
                criticalSuccess: {
                    ...draft.events.criticalSuccess,
                    enabled:
                        Array.isArray(params.crit_success_faces) &&
                        params.crit_success_faces.length > 0,
                    rule:
                        Array.isArray(params.crit_success_faces) &&
                            params.crit_success_faces.length > 0
                            ? "any_critical_face"
                            : "none",
                    faces: Array.isArray(params.crit_success_faces)
                        ? params.crit_success_faces.join(", ")
                        : "",
                },
                criticalFailure: {
                    ...draft.events.criticalFailure,
                    enabled:
                        Array.isArray(params.crit_failure_faces) &&
                        params.crit_failure_faces.length > 0,
                    rule:
                        Array.isArray(params.crit_failure_faces) &&
                            params.crit_failure_faces.length > 0
                            ? "all_special_failures"
                            : "none",
                    faces: Array.isArray(params.crit_failure_faces)
                        ? params.crit_failure_faces.join(", ")
                        : "",
                },
            },
        };
    }

    if (rule.kind === "threshold_degrees") {
        return {
            ...draft,
            reading: {
                ...draft.reading,
                mode: "threshold_degrees",
                compare: params.compare === "gte" ? "gte" : "lte",
                targetValue:
                    params.target_value == null ? draft.reading.targetValue : String(params.target_value),
                degreeStep:
                    params.degree_step == null ? draft.reading.degreeStep : String(params.degree_step),
            },
        };
    }

    if (rule.kind === "success_pool") {
        return {
            ...draft,
            reading: {
                ...draft.reading,
                mode: "success_pool",
                successAtOrAbove:
                    params.success_at_or_above == null
                        ? draft.reading.successAtOrAbove
                        : String(params.success_at_or_above),
                failFaces: Array.isArray(params.fail_faces)
                    ? params.fail_faces.join(", ")
                    : draft.reading.failFaces,
            },
            events: {
                ...draft.events,
                complication: {
                    ...draft.events.complication,
                    enabled: params.glitch_rule != null && params.glitch_rule !== "none",
                    rule: params.glitch_rule ?? "none",
                },
            },
        };
    }

    if (rule.kind === "table_lookup") {
        return {
            ...draft,
            reading: {
                ...draft.reading,
                mode: "table_lookup",
                tableRanges: Array.isArray(params.ranges)
                    ? params.ranges.map((range: any) => ({
                        min: String(range?.min ?? ""),
                        max: String(range?.max ?? ""),
                        label: String(range?.label ?? ""),
                    }))
                    : draft.reading.tableRanges,
            },
        };
    }

    if (rule.kind === "pipeline") {
        return applyPipelineParamsToDraft(draft, params);
    }

    return draft;
}

function applyPipelineParamsToDraft(
    draft: GuidedBehaviorDraft,
    params: any,
): GuidedBehaviorDraft {
    const steps = Array.isArray(params.steps) ? params.steps : [];

    let next = { ...draft };

    for (const step of steps) {
        if (step?.op === "reroll") {
            next = {
                ...next,
                transforms: {
                    ...next.transforms,
                    reroll: {
                        ...next.transforms.reroll,
                        enabled: true,
                        faces: Array.isArray(step.faces) ? step.faces.join(", ") : "",
                        once: step.once !== false,
                        maxRerollsPerDie:
                            step.max_rerolls == null ? "" : String(step.max_rerolls),
                    },
                },
            };
        }

        if (step?.op === "explode") {
            next = {
                ...next,
                transforms: {
                    ...next.transforms,
                    explode: {
                        ...next.transforms.explode,
                        enabled: true,
                        faces: Array.isArray(step.faces) ? step.faces.join(", ") : "",
                        maxExplosionsPerDie:
                            step.max_explosions == null ? "" : String(step.max_explosions),
                    },
                },
            };
        }

        if (
            step?.op === "keep_highest" ||
            step?.op === "keep_lowest" ||
            step?.op === "drop_highest" ||
            step?.op === "drop_lowest"
        ) {
            const mode =
                step.op === "keep_highest"
                    ? "keep_highest"
                    : step.op === "keep_lowest"
                        ? "keep_lowest"
                        : step.op === "drop_highest"
                            ? "drop_highest"
                            : "drop_lowest";

            next = {
                ...next,
                transforms: {
                    ...next.transforms,
                    keepDrop: {
                        ...next.transforms.keepDrop,
                        mode,
                        count: step.n == null ? "1" : String(step.n),
                    },
                },
            };
        }

        if (step?.op === "count_successes") {
            next = {
                ...next,
                reading: {
                    ...next.reading,
                    mode: "success_pool",
                    successAtOrAbove:
                        step.at_or_above == null ? "5" : String(step.at_or_above),
                },
            };
        }

        if (step?.op === "lookup") {
            next = {
                ...next,
                reading: {
                    ...next.reading,
                    mode: "table_lookup",
                    tableRanges: Array.isArray(step.ranges)
                        ? step.ranges.map((range: any) => ({
                            min: String(range?.min ?? ""),
                            max: String(range?.max ?? ""),
                            label: String(range?.label ?? ""),
                        }))
                        : next.reading.tableRanges,
                },
            };
        }
    }

    if (params.critical_success_rule && params.critical_success_rule !== "none") {
        next = {
            ...next,
            events: {
                ...next.events,
                criticalSuccess: {
                    ...next.events.criticalSuccess,
                    enabled: true,
                    rule: params.critical_success_rule,
                    threshold:
                        params.critical_success_threshold == null
                            ? ""
                            : String(params.critical_success_threshold),
                    faces: Array.isArray(params.critical_success_faces)
                        ? params.critical_success_faces.join(", ")
                        : "",
                },
            },
        };
    }

    if (params.critical_failure_rule && params.critical_failure_rule !== "none") {
        next = {
            ...next,
            events: {
                ...next.events,
                criticalFailure: {
                    ...next.events.criticalFailure,
                    enabled: true,
                    rule: params.critical_failure_rule,
                    faces: Array.isArray(params.crit_failure_faces)
                        ? params.crit_failure_faces.join(", ")
                        : "",
                },
            },
        };
    }

    if (params.complication_rule && params.complication_rule !== "none") {
        next = {
            ...next,
            events: {
                ...next.events,
                complication: {
                    ...next.events.complication,
                    enabled: true,
                    rule: params.complication_rule,
                    faces: Array.isArray(params.complication_faces)
                        ? params.complication_faces.join(", ")
                        : "",
                },
            },
        };
    }

    return next;
}

export function isRuleEditableWithGuidedBuilder(rule: RuleRow) {
    const schema = safeParseJson(rule.ui_schema_json);

    return schema?.builder === "guided_behavior_v1" || rule.kind === "pipeline";
}

export function createGuidedBehaviorDraftFromRule(
    rule: RuleRow,
): GuidedBehaviorDraft {
    const schema = safeParseJson(rule.ui_schema_json);

    const intent = isGuidedBehaviorIntent(schema.intent)
        ? schema.intent
        : inferIntentFromRule(rule);

    const base = applyIntentDefaultsToDraft(
        {
            ...DEFAULT_GUIDED_BEHAVIOR_DRAFT,
            name: rule.name,
            description: typeof schema.description === "string" ? schema.description : "",
            diceCompatibility: parseSupportedSides(rule.supported_sides_json),
            applicationMode: isGuidedBehaviorApplicationMode(schema.applicationMode)
                ? schema.applicationMode
                : "auto",
            scope: rule.scope,
        } as any,
        intent,
    );

    const withMetadata: GuidedBehaviorDraft = {
        ...base,
        name: rule.name,
        description: typeof schema.description === "string" ? schema.description : "",
        diceCompatibility: parseSupportedSides(rule.supported_sides_json),
        applicationMode: isGuidedBehaviorApplicationMode(schema.applicationMode)
            ? schema.applicationMode
            : base.applicationMode,
        resolvedScope: rule.scope,
        output: {
            ...base.output,
            primary: isGuidedBehaviorPrimaryOutput(schema.output?.primary)
                ? schema.output.primary
                : base.output.primary,
        },
    };

    const fromParams = applyRuleParamsToDraft(withMetadata, rule);

    return {
        ...fromParams,
        resolvedScope: resolveGuidedBehaviorScope(fromParams),
    };
}