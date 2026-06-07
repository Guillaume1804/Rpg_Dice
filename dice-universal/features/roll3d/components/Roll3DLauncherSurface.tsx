// dice-universal/features/roll3d/components/Roll3DLauncherSurface.tsx

import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Pressable, Text, View } from "react-native";

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

  const [isRolling, setIsRolling] = useState(false);
  const [skipRollRequestId, setSkipRollRequestId] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsRolling(false);
        setSkipRollRequestId(0);
        resetLauncher();
      };
    }, [resetLauncher]),
  );

  const handleRollPress = useCallback(() => {
    if (launcher.diceCount <= 0 || isRolling) {
      return;
    }

    setIsRolling(true);
    launcher.rollDice();
  }, [isRolling, launcher]);

  const handlePhysicsRollSettled = useCallback(() => {
    setIsRolling(false);
    launcher.completeRollAfterPhysics();
  }, [launcher]);

  const handleSkipRolling = useCallback(() => {
    if (!isRolling) {
      return;
    }

    setSkipRollRequestId((current) => current + 1);
  }, [isRolling]);

  const handleClearDice = useCallback(() => {
    setIsRolling(false);
    setSkipRollRequestId(0);
    launcher.clearDice();
  }, [launcher]);

  const handleCloseResult = useCallback(() => {
    launcher.clearResult();
    setIsRolling(false);
    setSkipRollRequestId(0);
  }, [launcher]);

  const shouldShowControls = !isRolling && !launcher.latestResult;

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
        skipRollRequestId={skipRollRequestId}
        onPhysicsRollSettled={handlePhysicsRollSettled}
      />

      {isRolling ? (
        <Pressable
          onPress={handleSkipRolling}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 4,
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: 18,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(232, 200, 120, 0.18)",
              backgroundColor: "rgba(5, 7, 19, 0.42)",
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                color: "rgba(232, 200, 120, 0.86)",
                fontSize: 10,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 1.1,
              }}
            >
              Touchez pour révéler
            </Text>
          </View>
        </Pressable>
      ) : null}

      {shouldShowControls ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: 18,
            gap: 8,
            zIndex: 5,
          }}
        >
          <View
            style={{
              borderRadius: 26,
              backgroundColor: "rgba(5, 7, 19, 0.48)",
              borderWidth: 1,
              borderColor: "rgba(232, 200, 120, 0.12)",
              padding: 5,
            }}
          >
            <Roll3DDiceSelector
              compact
              selectedSides={launcher.selectedSides}
              diceCount={launcher.diceCount}
              maxDice={launcher.maxDice}
              onSelectSides={launcher.addDie}
              onClearDice={handleClearDice}
            />
          </View>

          <Roll3DRollButton
            compact
            disabled={isRolling}
            diceCount={launcher.diceCount}
            onPress={handleRollPress}
          />
        </View>
      ) : null}

      <Roll3DResultOverlay
        visible={!!launcher.latestResult}
        result={launcher.latestResult}
        onClose={handleCloseResult}
        onRollAgain={handleRollPress}
      />
    </View>
  );
}
