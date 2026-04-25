// dice-universal/features/rules/ruleWizard/defaults.ts

import type { RuleWizardDraft } from "./types";

export const DEFAULT_RULE_RANGES = [
    { min: "1", max: "3", label: "Bas" },
    { min: "4", max: "6", label: "Moyen" },
    { min: "7", max: "10", label: "Haut" },
];

export function createDefaultRuleWizardDraft(): RuleWizardDraft {
    return {
        name: "",
        scope: "entry",
        behaviorKey: null,
        supportedSidesText: "20",

        compare: "gte",
        successThreshold: "",
        critSuccessFaces: "",
        critFailureFaces: "",

        successAtOrAbove: "5",
        failFaces: "1",
        glitchRule: "ones_gt_successes",

        keepCount: "2",
        dropCount: "1",
        resultMode: "sum",

        ranges: DEFAULT_RULE_RANGES,
    };
}