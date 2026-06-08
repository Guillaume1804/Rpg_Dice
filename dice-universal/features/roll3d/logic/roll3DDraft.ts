// dice-universal/features/roll3d/logic/roll3DDraft.ts

import type {
  Roll3DDraft,
  Roll3DDieBehaviorRef,
  Roll3DDieInstance,
  Roll3DDieSides,
  Roll3DDieSign,
  Roll3DDieSource,
} from "../types";
import { createRoll3DId } from "./roll3DRandom";

type CreateRoll3DDieInstanceOptions = {
  rollEntryId?: string;
  sign?: Roll3DDieSign;
  modifier?: number;
  source?: Roll3DDieSource;
  behavior?: Roll3DDieBehaviorRef | null;
};

export type CreateRoll3DDieInput = {
  rollEntryId?: string;
  sides: Roll3DDieSides;
  sign?: Roll3DDieSign;
  modifier?: number;
  source?: Roll3DDieSource;
  behavior?: Roll3DDieBehaviorRef | null;
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
        }),
      ),
    ],
  };
}
