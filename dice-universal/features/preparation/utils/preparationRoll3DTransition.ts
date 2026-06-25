// dice-universal/features/preparation/utils/preparationRoll3DTransition.ts

import type {
    Roll3DDieBehaviorRef,
    Roll3DDieSource,
} from "../../roll3d/types";
import type { CreateRoll3DDieInput } from "../../roll3d/logic/roll3DDraft";
import type { DraftGroupSummary } from "../../roll/helpers/rollDisplaySummary";

import {
    toRoll3DDieSides,
    toRoll3DDieSign,
} from "./preparationRollHelpers";

export function createRoll3DBehaviorRefFromRuleLike(
    sourceRule: any | null | undefined,
): Roll3DDieBehaviorRef | null {
    if (!sourceRule) {
        return null;
    }

    const id = String(sourceRule.id ?? `roll-3d-temp-rule-${Date.now()}`);
    const name = String(sourceRule.name ?? "Comportement");
    const kind = String(sourceRule.kind ?? "sum");

    const paramsJson =
        typeof sourceRule.params_json === "string"
            ? sourceRule.params_json
            : typeof sourceRule.paramsJson === "string"
                ? sourceRule.paramsJson
                : JSON.stringify(sourceRule.params_json ?? {});

    return {
        id,
        label: name,
        kind,
        rule: {
            id,
            name,
            kind,
            params_json: paramsJson,
        },
    };
}

export function createRoll3DDiceInputsFromPreparedGroup(params: {
    group: DraftGroupSummary;
    source: Roll3DDieSource;
    focusedLineIndex: number | null;
    rulesMap: Record<string, any>;
}): CreateRoll3DDieInput[] {
    const { group, source, focusedLineIndex, rulesMap } = params;

    const diceToSend =
        focusedLineIndex != null
            ? group.dice
                .map((die, index) => ({ die, index }))
                .filter((entry) => entry.index === focusedLineIndex)
            : group.dice.map((die, index) => ({ die, index }));

    const result: CreateRoll3DDieInput[] = [];

    for (const { die, index: lineIndex } of diceToSend) {
        const sides = toRoll3DDieSides(die.sides);

        if (!sides) {
            continue;
        }

        const qty = Math.max(1, Math.floor(die.qty ?? 1));
        const sign = toRoll3DDieSign(die.sign);
        const modifier = Number.isFinite(die.modifier ?? 0)
            ? (die.modifier ?? 0)
            : 0;

        const sourceRule =
            (die as any).rule_temp ?? (die.rule_id ? rulesMap[die.rule_id] : null);

        const behavior = createRoll3DBehaviorRefFromRuleLike(sourceRule);

        const rollEntryId = `${group.id}-line-${lineIndex}`;

        for (let index = 0; index < qty; index += 1) {
            result.push({
                rollEntryId,
                sides,
                sign,
                /**
                 * Important :
                 * Tous les dés visuels d’une même ligne partagent le même rollEntryId.
                 * Le moteur officiel les regroupera donc en une seule entrée qty=N.
                 * Le modificateur reste porté par le premier dé visuel seulement.
                 */
                modifier: index === 0 ? modifier : 0,
                source,
                behavior,
            });
        }
    }

    return result;
}