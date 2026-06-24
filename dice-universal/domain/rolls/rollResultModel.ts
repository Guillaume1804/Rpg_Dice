export type RollOutcome =
    | "success"
    | "failure"
    | "critical_success"
    | "critical_failure"
    | "complication"
    | "neutral"
    | "mixed";

export type RollEventType =
    | "sum"
    | "modifier"
    | "success"
    | "failure"
    | "critical_success"
    | "critical_failure"
    | "complication"
    | "success_pool"
    | "degrees"
    | "keep_drop"
    | "pipeline"
    | "table_lookup"
    | "group_behavior"
    | "explosion"
    | "reroll";

export type RollPresentationEvent = {
    type: RollEventType;
    label: string;
    severity: "positive" | "negative" | "warning" | "neutral";
};

export type RollPresentationSection = {
    id: string;
    title: string;
    subtitle?: string;
    rows: {
        label: string;
        value: string;
        detail?: string;
    }[];
};

export type RollPresentation = {
    title: string;
    subtitle?: string;
    outcome: RollOutcome;
    primaryValue: string;
    primaryLabel: string;
    events: RollPresentationEvent[];
    sections: RollPresentationSection[];
};