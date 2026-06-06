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
        height,
        position: "relative",
        overflow: "hidden",
        borderRadius: 0,
        backgroundColor: "#050713",
      }}
    >
      <DiceTable3D
        height={height}
        diceInstances={launcher.diceInstances}
        rollRequestId={launcher.rollRequestId}
        onPhysicsRollSettled={launcher.completeRollAfterPhysics}
      />

      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 28,
          gap: 10,
          zIndex: 5,
        }}
      >
        <View
          style={{
            borderRadius: 24,
            backgroundColor: "rgba(5, 7, 19, 0.78)",
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.16)",
            padding: 8,
          }}
        >
          <Roll3DDiceSelector
            selectedSides={launcher.selectedSides}
            diceCount={launcher.diceCount}
            maxDice={launcher.maxDice}
            onSelectSides={launcher.addDie}
            onClearDice={launcher.clearDice}
          />
        </View>

        <Roll3DRollButton
          diceCount={launcher.diceCount}
          onPress={launcher.rollDice}
        />
      </View>

      <Roll3DResultOverlay
        visible={!!launcher.latestResult}
        result={launcher.latestResult}
        onClose={launcher.clearResult}
        onRollAgain={launcher.rollDice}
      />
    </View>
  );
}
