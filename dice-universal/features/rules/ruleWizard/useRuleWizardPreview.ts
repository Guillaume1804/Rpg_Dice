// dice-universal/features/rules/ruleWizard/useRuleWizardPreview.ts

import { useMemo, useState } from "react";
import { evaluateRule } from "../../../core/rules/evaluate";

type PreviewPayload = {
    kind: string;
    params_json: string;
};

type Params = {
    buildPayload: () => PreviewPayload;
    deps?: unknown[];
};

export function useRuleWizardPreview({ buildPayload, deps }: Params) {
    const [valuesText, setValuesText] = useState("12");
    const [sidesText, setSidesText] = useState("20");
    const [modifierText, setModifierText] = useState("0");
    const [signText, setSignText] = useState<"1" | "-1">("1");

    const previewResult = useMemo(() => {
        try {
            const payload = buildPayload();

            const values = valuesText
                .split(",")
                .map((value) => Number(value.trim()))
                .filter(Number.isFinite);

            const sides = Number(sidesText);
            const modifier = Number(modifierText);
            const sign = signText === "-1" ? -1 : 1;

            if (values.length === 0) return null;
            if (!Number.isFinite(sides) || sides <= 0) return null;
            if (!Number.isFinite(modifier)) return null;

            return evaluateRule(payload.kind, payload.params_json, {
                values,
                sides,
                modifier,
                sign,
            });
        } catch {
            return null;
        }
    }, [buildPayload, valuesText, sidesText, modifierText, signText, ...(deps ?? [])]);

    return {
        valuesText,
        setValuesText,
        sidesText,
        setSidesText,
        modifierText,
        setModifierText,
        signText,
        setSignText,
        previewResult,
    };
}