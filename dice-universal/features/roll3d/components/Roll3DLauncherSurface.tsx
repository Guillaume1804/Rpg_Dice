// dice-universal/features/roll3d/components/Roll3DLauncherSurface.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useDb } from "../../../data/db/DbProvider";
import { useActiveTable } from "../../../data/state/ActiveTableProvider";
import { useDataRefresh } from "../../../data/state/DataRefreshProvider";
import { useRollTableData } from "../../roll/hooks/useRollTableData";
import { formatSavedActionDetail } from "../../roll/helpers/rollDisplaySummary";

import { useRoll3DLauncher } from "../hooks/useRoll3DLauncher";
import { DiceTable3D } from "./DiceTable3D";
import { Roll3DControlDock } from "./Roll3DControlDock";
import { Roll3DResultOverlay } from "./Roll3DResultOverlay";
import { consumeRoll3DHandoff } from "../logic/roll3DHandoff";
import { createRoll3DDiceInputsFromSavedActionEntry } from "../logic/roll3DActionDraft";
import type { Roll3DDieSides } from "../types";
import {
  appendDiceToRoll3DDraft,
  createRoll3DDraftFromDice,
} from "../logic/roll3DDraft";

type Roll3DLauncherSurfaceProps = {
  height?: number;
  maxDice?: number;
  handoffId?: string | string[];
};

export function Roll3DLauncherSurface({
  height = 300,
  maxDice = 99,
  handoffId,
}: Roll3DLauncherSurfaceProps) {
  const launcher = useRoll3DLauncher({
    maxDice,
  });

  const {
    resetLauncher,
    loadDraft,
    addDie,
    clearDice,
    rollDice,
    completeRollAfterPhysics,
    clearResult,
  } = launcher;

  const db = useDb();
  const { activeTableId } = useActiveTable();
  const { revision } = useDataRefresh();

  const tableId = useMemo(
    () =>
      typeof activeTableId === "string" && activeTableId.length > 0
        ? activeTableId
        : "",
    [activeTableId],
  );

  const { profiles, rulesMap, reloadGroups } = useRollTableData({
    db,
    tableId,
  });

  const [isRolling, setIsRolling] = useState(false);
  const [skipRollRequestId, setSkipRollRequestId] = useState(0);
  const [sceneVersion, setSceneVersion] = useState(0);

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  const [selectedSetEntryId, setSelectedSetEntryId] = useState<string | null>(
    null,
  );
  const [setInsertMode, setSetInsertMode] = useState<"replace" | "append">(
    "replace",
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsRolling(false);
        setSkipRollRequestId(0);
        setSelectedSetId(null);
        setSelectedSetEntryId(null);
        resetLauncher();
      };
    }, [resetLauncher]),
  );

  useEffect(() => {
    if (!tableId) {
      setSelectedProfileId(null);
      setSelectedSetId(null);
      setSelectedSetEntryId(null);
      return;
    }

    void reloadGroups(tableId);
  }, [revision, tableId, reloadGroups]);

  useEffect(() => {
    if (profiles.length === 0) {
      setSelectedProfileId(null);
      setSelectedSetId(null);
      setSelectedSetEntryId(null);
      return;
    }

    const profileExists = profiles.some(
      (entry) => entry.profile.id === selectedProfileId,
    );

    if (!profileExists) {
      setSelectedProfileId(profiles[0].profile.id);
      setSelectedSetId(null);
      setSelectedSetEntryId(null);
    }
  }, [profiles, selectedProfileId]);

  const activeProfileEntry = useMemo(() => {
    if (profiles.length === 0) {
      return null;
    }

    return (
      profiles.find((entry) => entry.profile.id === selectedProfileId) ??
      profiles[0] ??
      null
    );
  }, [profiles, selectedProfileId]);

  const setItems = useMemo(
    () =>
      activeProfileEntry?.groups.map(({ group, dice }) => ({
        id: group.id,
        name: group.name,
        detail: formatSavedActionDetail({
          group,
          dice,
          rulesMap,
        }),
        entries: dice.map((die) => ({
          id: die.id,
          label: `${die.sign === -1 ? "- " : ""}${die.qty}d${die.sides}${
            die.modifier !== 0
              ? ` ${die.modifier > 0 ? "+" : "-"} ${Math.abs(die.modifier)}`
              : ""
          }`,
          detail: die.rule_id
            ? (rulesMap[die.rule_id]?.name ?? "Comportement")
            : "Somme simple",
        })),
      })) ?? [],
    [activeProfileEntry, rulesMap],
  );

  useEffect(() => {
    const payload = consumeRoll3DHandoff(handoffId);

    if (!payload) {
      return;
    }

    setIsRolling(false);
    setSkipRollRequestId(0);
    setSelectedSetId(null);
    setSelectedSetEntryId(null);

    /**
     * Important :
     * on force une nouvelle scène Three/GLView quand un jet arrive depuis
     * Préparation. Ça évite de réutiliser une scène 3D dans un état instable
     * après navigation + injection de draft.
     */
    setSceneVersion((current) => current + 1);

    loadDraft(payload.draft);
  }, [handoffId, loadDraft]);

  const handleSelectFreeDie = useCallback(
    (sides: Roll3DDieSides) => {
      setSelectedSetId(null);
      setSelectedSetEntryId(null);
      addDie(sides);
    },
    [addDie],
  );

  const handleClearDice = useCallback(() => {
    setIsRolling(false);
    setSkipRollRequestId(0);
    setSelectedSetId(null);
    setSelectedSetEntryId(null);
    clearDice();
  }, [clearDice]);

  const handleSelectSet = useCallback((setId: string) => {
    if (!setId) {
      setSelectedSetId(null);
      setSelectedSetEntryId(null);
      return;
    }

    setSelectedSetId(setId);
    setSelectedSetEntryId(null);
  }, []);

  const handleSelectSetEntry = useCallback(
    (params: { setId: string; entryId: string }) => {
      const selectedSet = activeProfileEntry?.groups.find(
        (entry) => entry.group.id === params.setId,
      );

      const selectedDie = selectedSet?.dice.find(
        (die) => die.id === params.entryId,
      );

      if (!selectedSet || !selectedDie) {
        return;
      }

      const entryDraft = createRoll3DDiceInputsFromSavedActionEntry({
        group: selectedSet.group,
        die: selectedDie,
        rulesMap,
        source: "action",
      });

      if (entryDraft.dice.length === 0) {
        return;
      }

      setIsRolling(false);
      setSkipRollRequestId(0);
      setSelectedSetId(params.setId);
      setSelectedSetEntryId(params.entryId);

      if (setInsertMode === "replace") {
        const draft = createRoll3DDraftFromDice(entryDraft.dice, {
          groupBehavior: entryDraft.groupBehavior,
        });

        setSceneVersion((current) => current + 1);
        loadDraft(draft);
        return;
      }

      const nextDraft = appendDiceToRoll3DDraft(
        launcher.draft,
        entryDraft.dice,
        {
          maxDice: launcher.maxDice,
          groupBehavior: entryDraft.groupBehavior,
        },
      );

      setSceneVersion((current) => current + 1);
      loadDraft(nextDraft);
    },
    [
      activeProfileEntry,
      launcher.draft,
      launcher.maxDice,
      loadDraft,
      rulesMap,
      setInsertMode,
    ],
  );

  const handleRollPress = useCallback(() => {
    if (launcher.diceCount <= 0 || isRolling) {
      return;
    }

    setIsRolling(true);
    rollDice();
  }, [isRolling, launcher.diceCount, rollDice]);

  const handlePhysicsRollSettled = useCallback(() => {
    setIsRolling(false);
    completeRollAfterPhysics();
  }, [completeRollAfterPhysics]);

  const handleSkipRolling = useCallback(() => {
    if (!isRolling) {
      return;
    }

    setSkipRollRequestId((current) => current + 1);
  }, [isRolling]);

  const handleCloseResult = useCallback(() => {
    clearResult();
    setIsRolling(false);
    setSkipRollRequestId(0);
  }, [clearResult]);

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
        key={`roll-3d-table-${sceneVersion}`}
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
            zIndex: 5,
          }}
        >
          <Roll3DControlDock
            compact
            selectedSides={launcher.selectedSides}
            diceCount={launcher.diceCount}
            maxDice={launcher.maxDice}
            rollDisabled={isRolling}
            profileName={activeProfileEntry?.profile.name ?? null}
            sets={setItems}
            onSelectSides={handleSelectFreeDie}
            onClearDice={handleClearDice}
            selectedSetId={selectedSetId}
            selectedSetEntryId={selectedSetEntryId}
            setInsertMode={setInsertMode}
            onSelectSet={handleSelectSet}
            onSelectSetEntry={handleSelectSetEntry}
            onChangeSetInsertMode={setSetInsertMode}
            onRoll={handleRollPress}
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
