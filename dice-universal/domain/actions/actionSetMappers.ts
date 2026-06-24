import type {
    GroupDieRow,
    GroupRow,
} from "../../data/repositories/groupsRepo";
import type { RuleRow } from "../../data/repositories/rulesRepo";
import type { ActionEntry, ActionSet } from "./actionSetModel";
import type { BehaviorRef } from "../behaviors/behaviorModel";

function mapRuleRowToBehaviorRef(rule: RuleRow | null | undefined): BehaviorRef | null {
    if (!rule) return null;

    return {
        id: rule.id,
        name: rule.name,
        kind: rule.kind,
        paramsJson: rule.params_json,
        scope: rule.scope,
    };
}

function formatTechnicalEntryLabel(params: {
    sign: 1 | -1;
    quantity: number;
    sides: number;
    modifier: number;
}) {
    const signPrefix = params.sign === -1 ? "- " : "";
    const modifierLabel =
        params.modifier > 0
            ? ` + ${params.modifier}`
            : params.modifier < 0
                ? ` - ${Math.abs(params.modifier)}`
                : "";

    return `${signPrefix}${params.quantity}d${params.sides}${modifierLabel}`;
}

export function mapGroupDieRowToActionEntry(params: {
    die: GroupDieRow;
    actionSetId: string;
    rulesMap: Record<string, RuleRow>;
}): ActionEntry {
    const { die, actionSetId, rulesMap } = params;

    const behavior = die.rule_id ? mapRuleRowToBehaviorRef(rulesMap[die.rule_id]) : null;

    return {
        id: die.id,
        actionSetId,
        label: die.label ?? null,
        sides: die.sides,
        quantity: die.qty,
        modifier: die.modifier ?? 0,
        sign: die.sign === -1 ? -1 : 1,
        behavior,
    };
}

export function mapGroupRowToActionSet(params: {
    group: GroupRow;
    dice: GroupDieRow[];
    rulesMap: Record<string, RuleRow>;
}): ActionSet {
    const { group, dice, rulesMap } = params;

    const behavior = group.rule_id
        ? mapRuleRowToBehaviorRef(rulesMap[group.rule_id])
        : null;

    return {
        id: group.id,
        profileId: group.profile_id,
        name: group.name,
        behavior,
        entries: dice.map((die) =>
            mapGroupDieRowToActionEntry({
                die,
                actionSetId: group.id,
                rulesMap,
            }),
        ),
    };
}

export function getActionEntryTechnicalLabel(entry: ActionEntry) {
    return formatTechnicalEntryLabel({
        sign: entry.sign,
        quantity: entry.quantity,
        sides: entry.sides,
        modifier: entry.modifier,
    });
}