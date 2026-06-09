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
import {
  createRoll3DActionEntryAdjustmentFromSavedActionEntry,
  createRoll3DDiceInputsFromActionEntryAdjustment,
  createRoll3DDiceInputsFromSavedActionEntry,
} from "../logic/roll3DActionDraft";
import type {
  Roll3DActionEntryAdjustment,
  Roll3DActionEntryInsertMode,
  Roll3DDieSides,
} from "../types";
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
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  const [selectedActionEntryId, setSelectedActionEntryId] = useState<
    string | null
  >(null);

  const [actionEntryInsertMode, setActionEntryInsertMode] =
    useState<Roll3DActionEntryInsertMode>("replace");

  const [actionEntryAdjustment, setActionEntryAdjustment] =
    useState<Roll3DActionEntryAdjustment | null>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsRolling(false);
        setSkipRollRequestId(0);
        setSelectedActionId(null);
        setSelectedActionEntryId(null);
        setActionEntryAdjustment(null);
        resetLauncher();
      };
    }, [resetLauncher]),
  );

  useEffect(() => {
    if (!tableId) {
      setSelectedProfileId(null);
      setSelectedActionId(null);
      setSelectedActionEntryId(null);
      setActionEntryAdjustment(null);
      return;
    }

    void reloadGroups(tableId);
  }, [revision, tableId, reloadGroups]);

  useEffect(() => {
    if (profiles.length === 0) {
      setSelectedProfileId(null);
      setSelectedActionId(null);
      setSelectedActionEntryId(null);
      setActionEntryAdjustment(null);
      return;
    }

    const profileExists = profiles.some(
      (entry) => entry.profile.id === selectedProfileId,
    );

    if (!profileExists) {
      setSelectedProfileId(profiles[0].profile.id);
      setSelectedActionId(null);
      setSelectedActionEntryId(null);
      setActionEntryAdjustment(null);
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

  const actionItems = useMemo(
    () =>
      activeProfileEntry?.groups.map(({ group, dice }) => ({
        id: group.id,
        name: group.name,
        detail: formatSavedActionDetail({
          group,
          dice,
          rulesMap,
        }),
        entries: dice.map((die) => {
          const technicalLabel = `${die.sign === -1 ? "- " : ""}${die.qty}d${die.sides}${
            die.modifier !== 0
              ? ` ${die.modifier > 0 ? "+" : "-"} ${Math.abs(die.modifier)}`
              : ""
          }`;

          const customLabel =
            typeof die.label === "string" && die.label.trim().length > 0
              ? die.label.trim()
              : null;

          return {
            id: die.id,
            label: customLabel ?? technicalLabel,
            detail: die.rule_id
              ? `${technicalLabel} · ${rulesMap[die.rule_id]?.name ?? "Comportement"}`
              : `${technicalLabel} · Somme simple`,
          };
        }),
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
    setSelectedActionId(null);
    setSelectedActionEntryId(null);
    setActionEntryAdjustment(null);

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
      setSelectedActionId(null);
      setSelectedActionEntryId(null);
      setActionEntryAdjustment(null);
      addDie(sides);
    },
    [addDie],
  );

  const handleClearDice = useCallback(() => {
    setIsRolling(false);
    setSkipRollRequestId(0);
    setSelectedActionId(null);
    setSelectedActionEntryId(null);
    setActionEntryAdjustment(null);
    clearDice();
  }, [clearDice]);

  const handleSelectAction = useCallback((actionId: string) => {
    if (!actionId) {
      setSelectedActionId(null);
      setSelectedActionEntryId(null);
      setActionEntryAdjustment(null);
      return;
    }

    setSelectedActionId(actionId);
    setSelectedActionEntryId(null);
    setActionEntryAdjustment(null);
  }, []);

  const applyActionEntryDraft = useCallback(
    (
      entryDraft: ReturnType<typeof createRoll3DDiceInputsFromSavedActionEntry>,
      mode: Roll3DActionEntryInsertMode,
    ) => {
      if (entryDraft.dice.length === 0) {
        return;
      }

      setIsRolling(false);
      setSkipRollRequestId(0);

      if (mode === "replace") {
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
    [launcher.draft, launcher.maxDice, loadDraft],
  );

  const handleSelectActionEntry = useCallback(
    (params: { actionId: string; entryId: string }) => {
      const selectedAction = activeProfileEntry?.groups.find(
        (entry) => entry.group.id === params.actionId,
      );

      const selectedDie = selectedAction?.dice.find(
        (die) => die.id === params.entryId,
      );

      if (!selectedAction || !selectedDie) {
        return;
      }

      const entryDraft = createRoll3DDiceInputsFromSavedActionEntry({
        group: selectedAction.group,
        die: selectedDie,
        rulesMap,
        source: "action",
      });

      if (entryDraft.dice.length === 0) {
        return;
      }

      setSelectedActionId(params.actionId);
      setSelectedActionEntryId(params.entryId);
      setActionEntryAdjustment(null);

      applyActionEntryDraft(entryDraft, actionEntryInsertMode);
    },
    [
      activeProfileEntry,
      rulesMap,
      actionEntryInsertMode,
      applyActionEntryDraft,
    ],
  );

  const handleAdjustActionEntry = useCallback(
    (params: { actionId: string; entryId: string }) => {
      const selectedAction = activeProfileEntry?.groups.find(
        (entry) => entry.group.id === params.actionId,
      );

      const selectedDie = selectedAction?.dice.find(
        (die) => die.id === params.entryId,
      );

      if (!selectedAction || !selectedDie) {
        return;
      }

      const adjustment = createRoll3DActionEntryAdjustmentFromSavedActionEntry({
        group: selectedAction.group,
        die: selectedDie,
        rulesMap,
      });

      if (!adjustment) {
        return;
      }

      setSelectedActionId(params.actionId);
      setSelectedActionEntryId(params.entryId);
      setActionEntryAdjustment(adjustment);
    },
    [activeProfileEntry, rulesMap],
  );

  const handleChangeActionEntryAdjustmentQty = useCallback(
    (delta: number) => {
      setActionEntryAdjustment((current) => {
        if (!current) return current;

        return {
          ...current,
          qty: Math.max(1, Math.min(maxDice, current.qty + delta)),
        };
      });
    },
    [maxDice],
  );

  const handleChangeActionEntryAdjustmentModifier = useCallback(
    (delta: number) => {
      setActionEntryAdjustment((current) => {
        if (!current) return current;

        return {
          ...current,
          modifier: Math.max(-99, Math.min(99, current.modifier + delta)),
        };
      });
    },
    [],
  );

  const handleToggleActionEntryAdjustmentSign = useCallback(() => {
    setActionEntryAdjustment((current) => {
      if (!current) return current;

      return {
        ...current,
        sign: current.sign === -1 ? 1 : -1,
      };
    });
  }, []);

  const handleApplyActionEntryAdjustment = useCallback(
    (mode: Roll3DActionEntryInsertMode) => {
      if (!actionEntryAdjustment) {
        return;
      }

      const entryDraft = createRoll3DDiceInputsFromActionEntryAdjustment({
        adjustment: actionEntryAdjustment,
        source: "action",
      });

      setSelectedActionId(actionEntryAdjustment.actionId);
      setSelectedActionEntryId(actionEntryAdjustment.entryId);

      applyActionEntryDraft(entryDraft, mode);
    },
    [actionEntryAdjustment, applyActionEntryDraft],
  );

  const handleCloseActionEntryAdjustment = useCallback(() => {
    setActionEntryAdjustment(null);
  }, []);

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
            actions={actionItems}
            onSelectSides={handleSelectFreeDie}
            onClearDice={handleClearDice}
            selectedActionId={selectedActionId}
            selectedActionEntryId={selectedActionEntryId}
            actionEntryInsertMode={actionEntryInsertMode}
            onSelectAction={handleSelectAction}
            onSelectActionEntry={handleSelectActionEntry}
            onChangeActionEntryInsertMode={setActionEntryInsertMode}
            onRoll={handleRollPress}
            actionEntryAdjustment={actionEntryAdjustment}
            onAdjustActionEntry={handleAdjustActionEntry}
            onChangeActionEntryAdjustmentQty={
              handleChangeActionEntryAdjustmentQty
            }
            onChangeActionEntryAdjustmentModifier={
              handleChangeActionEntryAdjustmentModifier
            }
            onToggleActionEntryAdjustmentSign={
              handleToggleActionEntryAdjustmentSign
            }
            onApplyActionEntryAdjustment={handleApplyActionEntryAdjustment}
            onCloseActionEntryAdjustment={handleCloseActionEntryAdjustment}
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
