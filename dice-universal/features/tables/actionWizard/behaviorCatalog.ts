import {
  getActionWizardBehaviors,
  type RuleBehaviorDefinition,
  type RuleBehaviorKey,
} from "../../../core/rules/behaviorCatalog";

export type ActionBehaviorType = RuleBehaviorKey;

export type ActionBehaviorDefinition = RuleBehaviorDefinition;

export const ACTION_BEHAVIOR_CATALOG: ActionBehaviorDefinition[] =
  getActionWizardBehaviors();