// dice-universal/features/roll3d/components/Roll3DLauncherSurface.tsx

import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { View } from "react-native";

import { useRoll3DLauncher } from "../hooks/useRoll3DLauncher";
import { DiceTable3D } from "./DiceTable3D";
import { Roll3DDiceSelector } from "./Roll3DDiceSelector";
import { Roll3DResultOverlay } from "./Roll3DResultOverlay";
import { Roll3DRollButton } from "./Roll3DRollButton";

type Roll3DLauncherSurfaceProps = {
  height?: number;
  maxDice?: number;
};

export function Roll3DLauncherSurface({
  height = 300,
  maxDice = 99,
}: Roll3DLauncherSurfaceProps) {
  const launcher = useRoll3DLauncher({
    maxDice,
  });

  const { resetLauncher } = launcher;

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetLauncher();
      };
    }, [resetLauncher]),
  );

  return (
    <View
      style={{
        width: "100%",
        gap: 10,
      }}
    >
      <DiceTable3D
        height={height}
        diceInstances={launcher.diceInstances}
        rollRequestId={launcher.rollRequestId}
        onPhysicsRollSettled={launcher.completeRollAfterPhysics}
      />

      <View
        style={{
          gap: 8,
        }}
      >
        <Roll3DDiceSelector
          selectedSides={launcher.selectedSides}
          diceCount={launcher.diceCount}
          maxDice={launcher.maxDice}
          onSelectSides={launcher.addDie}
          onClearDice={launcher.clearDice}
        />

        <Roll3DRollButton
          diceCount={launcher.diceCount}
          onPress={launcher.rollDice}
        />

        <Roll3DResultOverlay
          visible={!!launcher.latestResult}
          result={launcher.latestResult}
          onClose={launcher.clearResult}
          onRollAgain={launcher.rollDice}
        />
      </View>
    </View>
  );
}
