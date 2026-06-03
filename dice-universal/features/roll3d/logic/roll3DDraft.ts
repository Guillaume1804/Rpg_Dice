// dice-universal/features/roll3d/logic/roll3DDraft.ts

import type { Roll3DDraft, Roll3DDieInstance, Roll3DDieSides } from "../types";
import { createRoll3DId } from "./roll3DRandom";

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
): Roll3DDieInstance {
  return {
    id: createRoll3DId("roll-3d-die"),
    sides,
    createdAt: Date.now(),
    sign: 1,
    modifier: 0,
    source: "free",
    behavior: null,
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
