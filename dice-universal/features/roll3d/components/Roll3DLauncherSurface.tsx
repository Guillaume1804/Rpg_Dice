// dice-universal/features/roll3d/components/Roll3DLauncherSurface.tsx

import { useState } from "react";
import { View } from "react-native";

import { DiceTable3D } from "./DiceTable3D";
import { Roll3DDiceSelector } from "./Roll3DDiceSelector";
import type { Roll3DDieInstance, Roll3DDieSides } from "../types";
import { Roll3DRollButton } from "./Roll3DRollButton";

type Roll3DLauncherSurfaceProps = {
  height?: number;
  maxDice?: number;
};

export function Roll3DLauncherSurface({
  height = 300,
  maxDice = 12,
}: Roll3DLauncherSurfaceProps) {
  const [selectedSides, setSelectedSides] = useState<Roll3DDieSides>(20);

  const [diceInstances, setDiceInstances] = useState<Roll3DDieInstance[]>([]);

  const [rollRequestId, setRollRequestId] = useState(0);

  function handleAddDie(sides: Roll3DDieSides) {
    setSelectedSides(sides);

    setDiceInstances((current) => {
      if (current.length >= maxDice) {
        return current;
      }

      return [
        ...current,
        {
          id: `roll-3d-die-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,
          sides,
          createdAt: Date.now(),
        },
      ];
    });
  }

  function handleClearDice() {
    setDiceInstances([]);
  }

  function handleRollDice() {
    if (diceInstances.length === 0) return;

    setRollRequestId((current) => current + 1);
  }

  return (
    <View
      style={{
        width: "100%",
        gap: 10,
      }}
    >
      <DiceTable3D
        height={height}
        diceInstances={diceInstances}
        rollRequestId={rollRequestId}
      />

      <Roll3DRollButton
        diceCount={diceInstances.length}
        onPress={handleRollDice}
      />

      <Roll3DDiceSelector
        selectedSides={selectedSides}
        diceCount={diceInstances.length}
        maxDice={maxDice}
        onSelectSides={handleAddDie}
        onClearDice={handleClearDice}
      />
    </View>
  );
}
