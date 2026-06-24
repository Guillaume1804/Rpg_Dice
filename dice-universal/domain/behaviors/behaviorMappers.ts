// dice-universal/domain/behaviors/behaviorMappers.ts

import type { RuleRow } from "../../data/repositories/rulesRepo";
import type {
    BehaviorDefinition,
    BehaviorRef,
    BehaviorScope,
    BehaviorUsageKind,
} from "./behaviorModel";

function normalizeBehaviorScope(value: RuleRow["scope"]): BehaviorScope {
    if (value === "group") return "group";
    if (value === "both") return "both";
    return "entry";
}

function normalizeBehaviorUsageKind(
    value: RuleRow["usage_kind"],
): BehaviorUsageKind | string | null {
    if (value === "system_template") return "system_template";
    if (value === "user_template") return "user_template";
    if (value === "generated") return "generated";
    if (value === "legacy") return "legacy";

    return value ?? null;
}

export function mapRuleRowToBehaviorDefinition(
    rule: RuleRow,
): BehaviorDefinition {
    return {
        id: rule.id,
        tableId: rule.table_id ?? null,
        name: rule.name,
        kind: rule.kind,
        behaviorKey: rule.behavior_key ?? null,
        category: rule.category ?? null,
        paramsJson: rule.params_json,
        uiSchemaJson: rule.ui_schema_json ?? null,
        isSystem: rule.is_system === 1,
        supportedSidesJson: rule.supported_sides_json ?? null,
        scope: normalizeBehaviorScope(rule.scope),
        usageKind: normalizeBehaviorUsageKind(rule.usage_kind),
    };
}

export function mapRuleRowToBehaviorRef(
    rule: RuleRow | null | undefined,
): BehaviorRef | null {
    if (!rule) return null;

    return {
        id: rule.id,
        name: rule.name,
        kind: rule.kind,
        paramsJson: rule.params_json,
        scope: normalizeBehaviorScope(rule.scope),
    };
}

export function mapRulesToBehaviorDefinitions(
    rules: RuleRow[],
): BehaviorDefinition[] {
    return rules.map(mapRuleRowToBehaviorDefinition);
}

export function createBehaviorMap(
    rules: RuleRow[],
): Record<string, BehaviorDefinition> {
    return Object.fromEntries(
        rules.map((rule) => {
            const behavior = mapRuleRowToBehaviorDefinition(rule);
            return [behavior.id, behavior];
        }),
    );
}

export function createBehaviorRefMap(
    rules: RuleRow[],
): Record<string, BehaviorRef> {
    return Object.fromEntries(
        rules.map((rule) => {
            const behavior = mapRuleRowToBehaviorRef(rule);

            if (!behavior) {
                return [rule.id, null];
            }

            return [rule.id, behavior];
        }).filter((entry): entry is [string, BehaviorRef] => entry[1] !== null),
    );
}