export type BehaviorScope = "entry" | "group" | "both";

export type BehaviorUsageKind =
    | "system_template"
    | "user_template"
    | "generated"
    | "legacy";

export type BehaviorDefinition = {
    id: string;
    tableId: string | null;
    name: string;
    kind: string;
    behaviorKey: string | null;
    category: string | null;
    paramsJson: string;
    uiSchemaJson: string | null;
    isSystem: boolean;
    supportedSidesJson: string | null;
    scope: BehaviorScope;
    usageKind: BehaviorUsageKind | string | null;
};

export type BehaviorRef = {
    id: string;
    name: string;
    kind: string;
    paramsJson: string;
    scope?: BehaviorScope;
};