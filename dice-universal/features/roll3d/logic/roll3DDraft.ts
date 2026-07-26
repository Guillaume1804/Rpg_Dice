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
  rollEntryId: string;
  label: string | null;
  sides: Roll3DDieSides;
  qty: number;
  modifier: number;
  sign: Roll3DDieSign;
  ruleId: string | null;
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

function getRoll3DSavableLineLabel(
  die: Roll3DDieInstance,
): string | null {
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
    return [
      "free",
      die.sides,
      die.sign,
      die.modifier,
      behaviorId,
      label,
    ].join(":");
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
      rollEntryId: die.rollEntryId,
      label: getRoll3DSavableLineLabel(die),
      sides: die.sides,
      qty: 1,
      modifier: die.modifier,
      sign: die.sign,
      ruleId: die.behavior?.id ?? null,
      source: die.source,
    });
  }

  return Array.from(linesMap.values());
}