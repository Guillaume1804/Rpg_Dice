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

  const rollDice = useCallback(() => {
    if (diceInstances.length === 0) return;

    setLatestResult(buildOfficialRoll3DSummary(diceInstances));
    setRollRequestId((current) => current + 1);
  }, [diceInstances]);

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
      rollDice,
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
      rollDice,
    ],
  );
}
