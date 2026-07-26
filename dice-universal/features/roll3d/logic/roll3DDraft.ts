// dice-universal/features/roll3d/logic/roll3DDraft.ts

import type {
  Roll3DDraft,
  Roll3DActionEntryValueSource,
  Roll3DDieBehaviorRef,
  Roll3DDieInstance,
  Roll3DDieSides,
  Roll3DDieSign,
  Roll3DDieSource,
  Roll3DEntryPresentationMeta,
} from "../types";
import { createRoll3DId } from "./roll3DRandom";

type CreateRoll3DDieInstanceOptions = {
  rollEntryId?: string;
  sign?: Roll3DDieSign;
  modifier?: number;
  source?: Roll3DDieSource;
  behavior?: Roll3DDieBehaviorRef | null;
  valueSources?: Roll3DActionEntryValueSource[];
  rollEntryMeta?: Roll3DEntryPresentationMeta | null;
};

export type CreateRoll3DDieInput = {
  rollEntryId?: string;
  sides: Roll3DDieSides;
  sign?: Roll3DDieSign;
  modifier?: number;
  source?: Roll3DDieSource;
  behavior?: Roll3DDieBehaviorRef | null;
  valueSources?: Roll3DActionEntryValueSource[];
  rollEntryMeta?: Roll3DEntryPresentationMeta | null;
};

export type Roll3DSavableDraftLine = {
  /**
   * Identifiant stable de la ligne logique dans le draft courant.
   *
   * Pour une ligne sauvegardée, il dépend notamment du rollEntryId.
   * Pour des dés libres, il dépend de leurs caractéristiques communes.
   */
  key: string;

  rollEntryId: string;
  label: string | null;
  sides: Roll3DDieSides;
  qty: number;
  modifier: number;
  sign: Roll3DDieSign;
  ruleId: string | null;
  behaviorLabel: string | null;
  source: Roll3DDieSource;
};

export function createEmptyRoll3DDraft(): Roll3DDraft {
  const now = Date.now();

  return {
    id: createRoll3DId("roll-3d-draft"),
    createdAt: now,
    updatedAt: now,
    dice: [],
    groupBehavior: null,
  };
}

export function createRoll3DDieInstance(
  sides: Roll3DDieSides,
  options: CreateRoll3DDieInstanceOptions = {},
): Roll3DDieInstance {
  const rollEntryId = options.rollEntryId ?? createRoll3DId("roll-3d-entry");

  return {
    id: createRoll3DId("roll-3d-die"),
    rollEntryId,
    sides,
    createdAt: Date.now(),
    sign: options.sign ?? 1,
    modifier: options.modifier ?? 0,
    source: options.source ?? "free",
    behavior: options.behavior ?? null,
    rollEntryMeta: options.rollEntryMeta ?? null,
    valueSources: options.valueSources ?? [],
  };
}

export function createRoll3DDraftFromDice(
  dice: CreateRoll3DDieInput[],
  options: {
    groupBehavior?: Roll3DDieBehaviorRef | null;
  } = {},
): Roll3DDraft {
  const now = Date.now();

  return {
    id: createRoll3DId("roll-3d-draft"),
    createdAt: now,
    updatedAt: now,
    groupBehavior: options.groupBehavior ?? null,
    dice: dice.map((die) =>
      createRoll3DDieInstance(die.sides, {
        rollEntryId: die.rollEntryId,
        sign: die.sign,
        modifier: die.modifier,
        source: die.source,
        behavior: die.behavior,
        rollEntryMeta: die.rollEntryMeta,
        valueSources: die.valueSources,
      }),
    ),
  };
}

export function addDieToRoll3DDraft(params: {
  draft: Roll3DDraft;
  sides: Roll3DDieSides;
  maxDice: number;
}): Roll3DDraft {
  const { draft, sides, maxDice } = params;

  if (draft.dice.length >= maxDice) {
    return draft;
  }

  return {
    ...draft,
    updatedAt: Date.now(),
    dice: [...draft.dice, createRoll3DDieInstance(sides)],
  };
}

export function clearRoll3DDraft(draft: Roll3DDraft): Roll3DDraft {
  return {
    ...draft,
    updatedAt: Date.now(),
    dice: [],
    groupBehavior: null,
  };
}

export function appendDiceToRoll3DDraft(
  draft: Roll3DDraft,
  dice: CreateRoll3DDieInput[],
  options: {
    maxDice?: number;
    groupBehavior?: Roll3DDieBehaviorRef | null;
  } = {},
): Roll3DDraft {
  const maxDice = options.maxDice ?? 99;
  const remainingSlots = Math.max(0, maxDice - draft.dice.length);

  if (remainingSlots <= 0) {
    return draft;
  }

  const diceToAppend = dice.slice(0, remainingSlots);

  return {
    ...draft,
    updatedAt: Date.now(),
    groupBehavior: options.groupBehavior ?? draft.groupBehavior,
    dice: [
      ...draft.dice,
      ...diceToAppend.map((die) =>
        createRoll3DDieInstance(die.sides, {
          rollEntryId: die.rollEntryId,
          sign: die.sign,
          modifier: die.modifier,
          source: die.source,
          behavior: die.behavior,
          rollEntryMeta: die.rollEntryMeta,
          valueSources: die.valueSources,
        }),
      ),
    ],
  };
}

function getRoll3DSavableLineLabel(die: Roll3DDieInstance): string | null {
  const entryLabel = die.rollEntryMeta?.entryLabel?.trim() ?? "";
  const technicalLabel = die.rollEntryMeta?.technicalLabel?.trim() ?? "";

  if (!entryLabel) {
    return null;
  }

  if (technicalLabel && entryLabel === technicalLabel) {
    return null;
  }

  return entryLabel;
}

function getRoll3DSavableLineKey(die: Roll3DDieInstance): string {
  const behaviorId = die.behavior?.id ?? "no-rule";
  const label = getRoll3DSavableLineLabel(die) ?? "no-label";

  /**
   * Les dés libres sont créés avec un rollEntryId individuel.
   * On les regroupe donc par caractéristiques pour sauvegarder :
   *
   * 5 dés d6 libres
   * → une seule ligne 5d6
   */
  if (die.source === "free") {
    return ["free", die.sides, die.sign, die.modifier, behaviorId, label].join(
      ":",
    );
  }

  /**
   * Les dés provenant d’une Main ou d’une entrée préparée partagent
   * normalement leur rollEntryId. On conserve cette séparation logique.
   *
   * On ajoute aussi les caractéristiques au cas où un draft incohérent
   * contiendrait plusieurs configurations sous le même rollEntryId.
   */
  return [
    "entry",
    die.rollEntryId,
    die.sides,
    die.sign,
    die.modifier,
    behaviorId,
    label,
  ].join(":");
}

export function createRoll3DSavableLinesFromDraft(
  draft: Roll3DDraft,
): Roll3DSavableDraftLine[] {
  const linesMap = new Map<string, Roll3DSavableDraftLine>();

  for (const die of draft.dice) {
    const key = getRoll3DSavableLineKey(die);
    const existingLine = linesMap.get(key);

    if (existingLine) {
      existingLine.qty += 1;
      continue;
    }

    linesMap.set(key, {
      key,
      rollEntryId: die.rollEntryId,
      label: getRoll3DSavableLineLabel(die),
      sides: die.sides,
      qty: 1,
      modifier: die.modifier,
      sign: die.sign,
      ruleId: die.behavior?.id ?? null,
      behaviorLabel: die.behavior?.label ?? null,
      source: die.source,
    });
  }

  return Array.from(linesMap.values());
}

export function updateRoll3DDraftLine(params: {
  draft: Roll3DDraft;
  lineKey: string;
  maxDice: number;
  qty?: number;
  modifier?: number;
  sign?: Roll3DDieSign;
}): Roll3DDraft {
  const { draft, lineKey, maxDice } = params;

  const firstMatchingIndex = draft.dice.findIndex(
    (die) => getRoll3DSavableLineKey(die) === lineKey,
  );

  if (firstMatchingIndex < 0) {
    return draft;
  }

  const matchingDice = draft.dice.filter(
    (die) => getRoll3DSavableLineKey(die) === lineKey,
  );

  const prototype = matchingDice[0];

  if (!prototype) {
    return draft;
  }

  const otherDice = draft.dice.filter(
    (die) => getRoll3DSavableLineKey(die) !== lineKey,
  );

  const maximumLineQuantity = Math.max(1, maxDice - otherDice.length);

  const requestedQuantity =
    params.qty == null
      ? matchingDice.length
      : Math.max(1, Math.floor(params.qty));

  const nextQuantity = Math.min(requestedQuantity, maximumLineQuantity);

  const nextModifier =
    params.modifier == null
      ? prototype.modifier
      : Math.max(-99, Math.min(99, Math.floor(params.modifier)));

  const nextSign = params.sign ?? prototype.sign;

  const nextLineDice = matchingDice.slice(0, nextQuantity).map((die) => ({
    ...die,
    modifier: nextModifier,
    sign: nextSign,
  }));

  while (nextLineDice.length < nextQuantity) {
    nextLineDice.push(
      createRoll3DDieInstance(prototype.sides, {
        /**
         * Une ligne sauvegardée ou préparée doit conserver son identité logique.
         * Un dé libre peut recevoir un nouvel identifiant individuel puisque
         * son regroupement ne dépend pas du rollEntryId.
         */
        rollEntryId:
          prototype.source === "free" ? undefined : prototype.rollEntryId,
        sign: nextSign,
        modifier: nextModifier,
        source: prototype.source,
        behavior: prototype.behavior,
        rollEntryMeta: prototype.rollEntryMeta,
        valueSources: prototype.valueSources,
      }),
    );
  }

  const diceBeforeLine = draft.dice
    .slice(0, firstMatchingIndex)
    .filter((die) => getRoll3DSavableLineKey(die) !== lineKey);

  const diceAfterLine = draft.dice
    .slice(firstMatchingIndex)
    .filter((die) => getRoll3DSavableLineKey(die) !== lineKey);

  return {
    ...draft,
    updatedAt: Date.now(),
    dice: [...diceBeforeLine, ...nextLineDice, ...diceAfterLine],
  };
}

export function removeRoll3DDraftLine(params: {
  draft: Roll3DDraft;
  lineKey: string;
}): Roll3DDraft {
  const nextDice = params.draft.dice.filter(
    (die) => getRoll3DSavableLineKey(die) !== params.lineKey,
  );

  if (nextDice.length === params.draft.dice.length) {
    return params.draft;
  }

  return {
    ...params.draft,
    updatedAt: Date.now(),
    dice: nextDice,
    groupBehavior: nextDice.length > 0 ? params.draft.groupBehavior : null,
  };
}

function areRoll3DBehaviorRefsEqual(
  current: Roll3DDieBehaviorRef | null,
  next: Roll3DDieBehaviorRef | null,
): boolean {
  if (!current && !next) {
    return true;
  }

  if (!current || !next) {
    return false;
  }

  return (
    current.id === next.id &&
    current.label === next.label &&
    current.kind === next.kind &&
    current.rule.id === next.rule.id &&
    current.rule.kind === next.rule.kind &&
    current.rule.name === next.rule.name &&
    current.rule.params_json === next.rule.params_json
  );
}

export function updateRoll3DDraftLineBehavior(params: {
  draft: Roll3DDraft;
  lineKey: string;
  behavior: Roll3DDieBehaviorRef | null;
}): Roll3DDraft {
  let hasMatchingDice = false;
  let hasChanged = false;

  const nextDice = params.draft.dice.map((die) => {
    if (getRoll3DSavableLineKey(die) !== params.lineKey) {
      return die;
    }

    hasMatchingDice = true;

    if (areRoll3DBehaviorRefsEqual(die.behavior, params.behavior)) {
      return die;
    }

    hasChanged = true;

    return {
      ...die,
      behavior: params.behavior,
    };
  });

  if (!hasMatchingDice || !hasChanged) {
    return params.draft;
  }

  return {
    ...params.draft,
    updatedAt: Date.now(),
    dice: nextDice,
  };
}
