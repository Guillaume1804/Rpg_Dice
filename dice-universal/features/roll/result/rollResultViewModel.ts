// dice-universal/features/roll/result/rollResultViewModel.ts

import type { GroupRollResult } from "../../../core/roll/roll";
import { renderRollResult } from "../renderers/rollResultRenderer";

export type RollVisualTone =
    | "neutral"
    | "success"
    | "failure"
    | "crit_success"
    | "crit_failure"
    | "complication";

export type RollResultViewModel = {
    title: string;
    mainValue: string;
    subtitle: string;
    tone: RollVisualTone;
    detailsLabel: string;
    eventTags: string[];
};

function getPrimaryEvalResult(result: GroupRollResult) {
    return (
        result.group_eval_result ??
        result.entries.find((entry) => entry.eval_result)?.eval_result ??
        null
    );
}

function getEvalOutcome(result: any | null | undefined): string | null {
    if (!result) return null;

    if (typeof result.outcome === "string") return result.outcome;
    if (typeof result.meta?.outcome === "string") return result.meta.outcome;

    return null;
}

function getEvalMeta(result: any | null | undefined) {
    if (!result) return {};

    return result.kind === "pipeline" ? (result.meta ?? {}) : result;
}

function mapRenderedToneToVisualTone(
    tone: "neutral" | "success" | "failure" | "warning" | "critical" | undefined,
): RollVisualTone {
    if (tone === "critical") return "crit_success";
    if (tone === "success") return "success";
    if (tone === "failure") return "failure";
    if (tone === "warning") return "complication";
    return "neutral";
}

function collectEventTags(result: GroupRollResult): string[] {
    const tags: string[] = [];

    const allEvalResults = [
        result.group_eval_result,
        ...result.entries.map((entry) => entry.eval_result),
    ].filter(Boolean);

    let successCount: number | null = null;
    let complicationCount: number | null = null;
    let degreeCount: number | null = null;
    let explosionCount = 0;
    let rerollCount = 0;

    for (const evalResult of allEvalResults) {
        const outcome = getEvalOutcome(evalResult);
        const meta = getEvalMeta(evalResult);

        if (outcome === "crit_success") {
            tags.push("Réussite critique");
        }

        if (outcome === "crit_failure") {
            tags.push("Échec critique");
        }

        if (outcome === "crit_glitch") {
            tags.push("Échec critique + complication");
        }

        if (outcome === "glitch") {
            tags.push("Complication");
        }

        if (typeof meta.successes === "number") {
            successCount = Math.max(successCount ?? 0, meta.successes);
        }

        if (typeof evalResult?.successes === "number") {
            successCount = Math.max(successCount ?? 0, evalResult.successes);
        }

        if (typeof meta.complications === "number") {
            complicationCount = Math.max(complicationCount ?? 0, meta.complications);
        }

        if (typeof evalResult?.fail_count === "number") {
            complicationCount = Math.max(
                complicationCount ?? 0,
                evalResult.fail_count,
            );
        }

        if (typeof meta.degrees?.degrees === "number") {
            degreeCount = Math.max(degreeCount ?? 0, meta.degrees.degrees);
        }

        if (Array.isArray(meta.steps)) {
            explosionCount += meta.steps.filter(
                (step: any) => step.op === "explode_one",
            ).length;

            rerollCount += meta.steps.filter(
                (step: any) => step.op === "reroll_one",
            ).length;
        }
    }

    if (successCount != null) {
        tags.push(`${successCount} succès`);
    }

    if (complicationCount != null && complicationCount > 0) {
        tags.push(`${complicationCount} face${complicationCount > 1 ? "s" : ""} spéciale${complicationCount > 1 ? "s" : ""}`);
    }

    if (degreeCount != null) {
        tags.push(`${degreeCount} degré${degreeCount > 1 ? "s" : ""}`);
    }

    if (explosionCount > 0) {
        tags.push(`${explosionCount} explosion${explosionCount > 1 ? "s" : ""}`);
    }

    if (rerollCount > 0) {
        tags.push(`${rerollCount} relance${rerollCount > 1 ? "s" : ""}`);
    }

    return Array.from(new Set(tags));
}

function inferToneFromEvents(tags: string[]): RollVisualTone | null {
    if (tags.some((tag) => tag.includes("Échec critique"))) {
        return "crit_failure";
    }

    if (tags.some((tag) => tag.includes("Réussite critique"))) {
        return "crit_success";
    }

    if (tags.some((tag) => tag.includes("Complication"))) {
        return "complication";
    }

    return null;
}

export function buildRollResultViewModel(
    result: GroupRollResult | null,
): RollResultViewModel {
    if (!result) {
        return {
            title: "Prêt à lancer",
            mainValue: "—",
            subtitle: "Compose ton jet, puis lance les dés.",
            tone: "neutral",
            detailsLabel: "Détails",
            eventTags: [],
        };
    }

    const primaryEvalResult = getPrimaryEvalResult(result);
    const rendered = renderRollResult(primaryEvalResult);
    const eventTags = collectEventTags(result);
    const eventTone = inferToneFromEvents(eventTags);

    if (!rendered) {
        return {
            title: "Résultat brut",
            mainValue: String(result.total),
            subtitle: `${result.entries.length} ligne${result.entries.length > 1 ? "s" : ""} · total final`,
            tone: eventTone ?? "neutral",
            detailsLabel: "Détails",
            eventTags,
        };
    }

    return {
        title: rendered.title,
        mainValue: rendered.summary,
        subtitle: `Total global : ${result.total} · ${result.entries.length} entrée${result.entries.length > 1 ? "s" : ""}`,
        tone: eventTone ?? mapRenderedToneToVisualTone(rendered.tone),
        detailsLabel: "Détails",
        eventTags,
    };
}