import { useState } from "react";
import type { Db } from "../../../data/db/database";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import { createRule } from "../../../data/repositories/rulesRepo";
import { createGroup, createGroupDie } from "../../../data/repositories/groupsRepo";
import { buildRulePayloadFromActionWizard } from "./helpers";
import type { ActionWizardDraft } from "./types";

type Params = {
    db: Db;
    tableId: string;
    profile: ProfileRow | null;
    reload: () => Promise<void>;
    onSuccess?: () => void;
};

export function useCreateActionFromWizard({
    db,
    tableId,
    profile,
    reload,
    onSuccess,
}: Params) {
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    async function submit(draft: ActionWizardDraft) {
        if (!profile) {
            setSubmitError("Aucun profil cible sélectionné.");
            return false;
        }

        if (!tableId) {
            setSubmitError("Table cible introuvable.");
            return false;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            const rulePayload = buildRulePayloadFromActionWizard(draft);

            const ruleId = await createRule(db, {
                name: rulePayload.name,
                kind: rulePayload.kind,
                params_json: rulePayload.params_json,
                is_system: 0,
                supported_sides_json: rulePayload.supported_sides_json,
                scope: rulePayload.scope,
            });

            const shouldAttachRuleToGroup = rulePayload.scope === "group";
            const shouldAttachRuleToDie = rulePayload.scope !== "group";

            const groupId = await createGroup(db, {
                profileId: profile.id,
                name: draft.name.trim(),
                rule_id: shouldAttachRuleToGroup ? ruleId : null,
            });

            await createGroupDie(db, {
                groupId: groupId,
                sides: draft.die.sides ?? 6,
                qty: draft.die.qty,
                modifier: draft.die.modifier,
                sign: draft.die.sign,
                rule_id: shouldAttachRuleToDie ? ruleId : null,
            });

            await reload();
            onSuccess?.();

            return true;
        } catch (e: any) {
            setSubmitError(e?.message ?? "Erreur lors de la création de l’action.");
            return false;
        } finally {
            setSubmitting(false);
        }
    }

    function resetSubmitState() {
        setSubmitError(null);
    }

    return {
        submitting,
        submitError,
        submit,
        resetSubmitState,
    };
}