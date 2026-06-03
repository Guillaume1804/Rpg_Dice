// dice-universal/features/roll3d/logic/roll3DRandom.ts

import type { Roll3DDieSides } from "../types";

export function createRoll3DId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function roll3DDieValue(sides: Roll3DDieSides) {
  return Math.floor(Math.random() * sides) + 1;
}
