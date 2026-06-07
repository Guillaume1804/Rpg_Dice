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
  sign?: Roll3DDieSign;
  modifier?: number;
  source?: Roll3DDieSource;
  behavior?: Roll3DDieBehaviorRef | null;
};

export type CreateRoll3DDieInput = {
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
  };
}

export function createRoll3DDieInstance(
  sides: Roll3DDieSides,
  options: CreateRoll3DDieInstanceOptions = {},
): Roll3DDieInstance {
  return {
    id: createRoll3DId("roll-3d-die"),
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
): Roll3DDraft {
  const now = Date.now();

  return {
    id: createRoll3DId("roll-3d-draft"),
    createdAt: now,
    updatedAt: now,
    dice: dice.map((die) =>
      createRoll3DDieInstance(die.sides, {
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
  };
}
