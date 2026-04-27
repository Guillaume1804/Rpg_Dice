// dice-universal/features/rules/ruleWizard/types.ts

import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";

export type RuleWizardStep =
    | "name"
    | "scope"
    | "dice"
    | "behavior"
    | "summary";

export type RuleWizardScope = "entry" | "group" | "both";

export type RuleWizardDraft = {
    name: string;
    scope: RuleWizardScope;
    behaviorKey: RuleBehaviorKey | null;
    supportedSidesText: string;

    compare: "gte" | "lte";
    successThreshold: string;
    critSuccessFaces: string;
    critFailureFaces: string;

    successAtOrAbove: string;
    failFaces: string;
    glitchRule: string;

    keepCount: string;
    dropCount: string;
    resultMode: string;

    ranges: { min: string; max: string; label: string }[];
};