// dice-universal/domain/preparation/preparationMappers.ts

import type { ProfileWithGroups } from "../../features/tables/hooks/useTableDetailData";
import type { RuleRow } from "../../data/repositories/rulesRepo";
import type { ActionSet } from "../actions/actionSetModel";
import { mapGroupRowToActionSet } from "../actions/actionSetMappers";

export function createRuleMap(rules: RuleRow[]): Record<string, RuleRow> {
    return Object.fromEntries(rules.map((rule) => [rule.id, rule]));
}

export function mapProfileWithGroupsToActionSets(params: {
    profileEntry: ProfileWithGroups;
    rulesMap: Record<string, RuleRow>;
}): ActionSet[] {
    const { profileEntry, rulesMap } = params;

    return profileEntry.groups.map(({ group, dice }) =>
        mapGroupRowToActionSet({
            group,
            dice,
            rulesMap,
        }),
    );
}

export function mapProfilesWithGroupsToActionSets(params: {
    profiles: ProfileWithGroups[];
    rules: RuleRow[];
}): Record<string, ActionSet[]> {
    const { profiles, rules } = params;
    const rulesMap = createRuleMap(rules);

    return Object.fromEntries(
        profiles.map((profileEntry) => [
            profileEntry.profile.id,
            mapProfileWithGroupsToActionSets({
                profileEntry,
                rulesMap,
            }),
        ]),
    );
}