// dice-universal/features/roll3d/hooks/useRoll3DLauncher.ts

import { useCallback, useMemo, useState } from "react";

import type { Roll3DDraft, Roll3DDieSides, Roll3DRollSummary } from "../types";
import { buildOfficialRoll3DSummary } from "../logic/roll3DEngine";
import {
  addDieToRoll3DDraft,
  clearRoll3DDraft,
  createEmptyRoll3DDraft,
} from "../logic/roll3DDraft";

type UseRoll3DLauncherParams = {
  maxDice?: number;
};

export function useRoll3DLauncher({
  maxDice = 12,
}: UseRoll3DLauncherParams = {}) {
  const [selectedSides, setSelectedSides] = useState<Roll3DDieSides>(20);
  const [draft, setDraft] = useState<Roll3DDraft>(() =>
    createEmptyRoll3DDraft(),
  );
  const [rollRequestId, setRollRequestId] = useState(0);

  const [latestResult, setLatestResult] = useState<Roll3DRollSummary | null>(
    null,
  );

  const diceInstances = draft.dice;
  const diceCount = diceInstances.length;
  const isFull = diceCount >= maxDice;
  const hasDice = diceCount > 0;

  const addDie = useCallback(
    (sides: Roll3DDieSides) => {
      setSelectedSides(sides);

      setDraft((currentDraft) => {
        if (currentDraft.dice.length >= maxDice) {
          return currentDraft;
        }

        setLatestResult(null);

        return addDieToRoll3DDraft({
          draft: currentDraft,
          sides,
          maxDice,
        });
      });
    },
    [maxDice],
  );

  const clearDice = useCallback(() => {
    setDraft((currentDraft) => clearRoll3DDraft(currentDraft));
    setLatestResult(null);
  }, []);

  const resetLauncher = useCallback(() => {
    setDraft(createEmptyRoll3DDraft());
    setLatestResult(null);
    setRollRequestId(0);
  }, []);

  const loadDraft = useCallback((nextDraft: Roll3DDraft) => {
    setDraft(nextDraft);
    setSelectedSides(nextDraft.dice[0]?.sides ?? 20);
    setLatestResult(null);
    setRollRequestId(0);
  }, []);

  const clearResult = useCallback(() => {
    setLatestResult(null);
  }, []);

  const rollDice = useCallback(() => {
    if (draft.dice.length === 0) return;

    setLatestResult(null);
    setRollRequestId((current) => current + 1);
  }, [draft.dice.length]);

  const completeRollAfterPhysics = useCallback(() => {
    if (draft.dice.length === 0) return;

    setLatestResult(buildOfficialRoll3DSummary(draft));
  }, [draft]);

  return useMemo(
    () => ({
      selectedSides,
      draft,
      diceInstances,
      diceCount,
      maxDice,
      isFull,
      hasDice,
      latestResult,
      rollRequestId,
      addDie,
      clearDice,
      resetLauncher,
      loadDraft,
      clearResult,
      rollDice,
      completeRollAfterPhysics,
    }),
    [
      selectedSides,
      draft,
      diceInstances,
      diceCount,
      maxDice,
      isFull,
      hasDice,
      latestResult,
      rollRequestId,
      addDie,
      clearDice,
      resetLauncher,
      loadDraft,
      clearResult,
      rollDice,
      completeRollAfterPhysics,
    ],
  );
}
