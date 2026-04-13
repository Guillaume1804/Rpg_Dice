export type ActionBehaviorType =
    | "single_check"
    | "success_pool"
    | "banded_sum"
    | "highest_of_pool"
    | "table_lookup";

export type ActionDieDraft = {
    sides: number | null;
    qty: number;
    modifier: number;
    sign: 1 | -1;
};

export type ActionRangeDraft = {
    min: string;
    max: string;
    label: string;
};

export type ActionWizardDraft = {
    name: string;
    behaviorType: ActionBehaviorType | null;

    die: ActionDieDraft;

    compare: "gte" | "lte";
    successThreshold: string;
    critSuccessFaces: string;
    critFailureFaces: string;

    successAtOrAbove: string;
    failFaces: string;
    glitchRule: "ones_gt_successes" | "ones_gte_successes" | "none";

    ranges: ActionRangeDraft[];
};

export type ActionWizardStep =
    | "name"
    | "type"
    | "dice"
    | "behavior"
    | "summary";