// dice-universal/features/roll3d/hooks/useRoll3DLauncher.ts

import { useCallback, useMemo, useState } from "react";

import type {
  Roll3DDieInstance,
  Roll3DDieSides,
  Roll3DRollSummary,
} from "../types";
import { buildRoll3DSummary, createRoll3DId } from "../logic/roll3DRandom";

type UseRoll3DLauncherParams = {
  maxDice?: number;
};

export function useRoll3DLauncher({
  maxDice = 12,
}: UseRoll3DLauncherParams = {}) {
  const [selectedSides, setSelectedSides] = useState<Roll3DDieSides>(20);
  const [diceInstances, setDiceInstances] = useState<Roll3DDieInstance[]>([]);
  const [rollRequestId, setRollRequestId] = useState(0);

  const [latestResult, setLatestResult] = useState<Roll3DRollSummary | null>(
    null,
  );

  const diceCount = diceInstances.length;
  const isFull = diceCount >= maxDice;
  const hasDice = diceCount > 0;

  const addDie = useCallback(
    (sides: Roll3DDieSides) => {
      setSelectedSides(sides);

      setDiceInstances((current) => {
        if (current.length >= maxDice) {
          return current;
        }

        setLatestResult(null);

        return [
          ...current,
          {
            id: createRoll3DId("roll-3d-die"),
            sides,
            createdAt: Date.now(),
          },
        ];
      });
    },
    [maxDice],
  );

  const clearDice = useCallback(() => {
    setDiceInstances([]);
    setLatestResult(null);
  }, []);

  const rollDice = useCallback(() => {
    if (diceInstances.length === 0) return;

    setLatestResult(buildRoll3DSummary(diceInstances));
    setRollRequestId((current) => current + 1);
  }, [diceInstances]);

  return useMemo(
    () => ({
      selectedSides,
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
