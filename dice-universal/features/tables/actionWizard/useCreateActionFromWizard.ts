// dice-universal\features\tables\actionWizard\useCreateActionFromWizard.ts

import { useState } from "react";
import type { Db } from "../../../data/db/database";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import {
  createRule,
  findCanonicalLocalRule,
} from "../../../data/repositories/rulesRepo";
import {
  createGroup,
  createGroupDie,
} from "../../../data/repositories/groupsRepo";
import { buildCanonicalLocalRuleName } from "./ruleNaming";
import type { ActionWizardDraft } from "./types";
import { buildRuleFromBehavior } from "../../../core/rules/buildRuleFromBehavior";
import { getRuleBehaviorDefinition } from "../../../core/rules/behaviorRegistry";

type Params = {
  db: Db;
  tableId: string;
  tableName: string;
  profile: ProfileRow | null;
  reload: () => Promise<void>;
  onSuccess?: () => void;
};

function resolveRuleScopeFromDraft(
  draft: ActionWizardDraft,
): "entry" | "group" | "both" {
  if (!draft.behaviorType) return "entry";

  const behavior = getRuleBehaviorDefinition(draft.behaviorType);
  if (!behavior) return "entry";

  return behavior.defaultScope;
}

function getValidDice(draft: ActionWizardDraft) {
  const dice = draft.dice.length > 0 ? draft.dice : [draft.die];

  return dice.filter(
    (die) =>
      die.sides != null &&
      Number.isFinite(die.sides) &&
      die.sides > 0 &&
      Number.isFinite(die.qty) &&
      die.qty > 0,
  );
}

export function useCreateActionFromWizard({
  db,
  tableId,
  tableName,
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

    if (!draft.behaviorType) {
      setSubmitError("Type d’action manquant.");
      return false;
    }

    const validDice = getValidDice(draft);

    if (validDice.length === 0) {
      setSubmitError("Ajoute au moins un dé valide.");
      return false;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      let ruleId: string;
      let ruleScope: "entry" | "group" | "both";

      if (draft.selectedRuleId) {
        ruleId = draft.selectedRuleId;
        ruleScope = resolveRuleScopeFromDraft(draft);
      } else {
        const firstDie = validDice[0];

        const rulePayload = buildRuleFromBehavior({
          actionName: draft.name,
          behaviorKey: draft.behaviorType,
          sides: firstDie.sides ?? 6,
          compare: draft.compare,
          successThreshold: draft.successThreshold,
          critSuccessFaces: draft.critSuccessFaces,
          critFailureFaces: draft.critFailureFaces,
          targetValue: draft.targetValue,
          degreeStep: draft.degreeStep,
          critSuccessMin: draft.critSuccessMin,
          critSuccessMax: draft.critSuccessMax,
          critFailureMin: draft.critFailureMin,
          critFailureMax: draft.critFailureMax,
          successAtOrAbove: draft.successAtOrAbove,
          failFaces: draft.failFaces,
          glitchRule: draft.glitchRule,
          ranges: draft.ranges,
          keepCount: draft.keepCount,
          dropCount: draft.dropCount,
          resultMode: draft.resultMode,
        });

        const existingCanonicalRule = await findCanonicalLocalRule(db, {
          tableId,
          behavior_key: rulePayload.behavior_key,
          params_json: rulePayload.params_json,
          scope: rulePayload.scope,
          supported_sides_json: rulePayload.supported_sides_json,
        });

        if (existingCanonicalRule) {
          ruleId = existingCanonicalRule.id;
          ruleScope = existingCanonicalRule.scope;
        } else {
          const canonicalRuleName = buildCanonicalLocalRuleName(
            tableName,
            draft.behaviorType,
          );

          ruleId = await createRule(db, {
            table_id: tableId,
            name: canonicalRuleName,
            kind: rulePayload.kind,
            behavior_key: rulePayload.behavior_key,
            category: rulePayload.category,
            params_json: rulePayload.params_json,
            ui_schema_json: rulePayload.ui_schema_json,
            is_system: 0,
            supported_sides_json: rulePayload.supported_sides_json,
            scope: rulePayload.scope,
            usage_kind: rulePayload.usage_kind,
          });

          ruleScope = rulePayload.scope;
        }
      }

      const shouldAttachRuleToGroup = ruleScope === "group";
      const shouldAttachRuleToDie = ruleScope !== "group";

      const groupId = await createGroup(db, {
        profileId: profile.id,
        name: draft.name.trim(),
        rule_id: shouldAttachRuleToGroup ? ruleId : null,
      });

      for (const die of validDice) {
        await createGroupDie(db, {
          groupId,
          sides: die.sides ?? 6,
          qty: die.qty,
          modifier: die.modifier,
          sign: die.sign,
          rule_id: shouldAttachRuleToDie ? ruleId : null,
        });
      }

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
