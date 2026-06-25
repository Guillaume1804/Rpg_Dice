// dice-universal/features/preparation/utils/preparationRulePersistence.ts

import type { useDb } from "../../../data/db/DbProvider";
import { createRule } from "../../../data/repositories/rulesRepo";

export type PreparedTempRuleLike = {
    id?: string;
    name?: string;
    kind?: string;
    params_json?: string;
    paramsJson?: string;
};

export async function resolvePreparedRuleId(
    db: ReturnType<typeof useDb>,
    ruleId?: string | null,
    ruleTemp?: PreparedTempRuleLike | null,
): Promise<string | null> {
    if (ruleId) {
        return ruleId;
    }

    if (!ruleTemp) {
        return null;
    }

    return createRule(db, {
        name: ruleTemp.name ?? "Comportement personnalisé",
        kind: ruleTemp.kind ?? "pipeline",
        params_json:
            typeof ruleTemp.params_json === "string"
                ? ruleTemp.params_json
                : typeof ruleTemp.paramsJson === "string"
                    ? ruleTemp.paramsJson
                    : "{}",
        is_system: 0,
    });
}