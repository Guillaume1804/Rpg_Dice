import { BEHAVIOR_CONTEXTS, BehaviorContextKey } from "./behaviorContexts";

export function getBehaviorsForContext(context: BehaviorContextKey) {
  return BEHAVIOR_CONTEXTS.filter((b) => b.contexts[context]?.enabled);
}

export function getBehaviorDefaults(
  behaviorKey: string,
  context: BehaviorContextKey,
): Record<string, unknown> | undefined {
  const found = BEHAVIOR_CONTEXTS.find((b) => b.behaviorKey === behaviorKey);

  return found?.contexts[context]?.defaultValues;
}
