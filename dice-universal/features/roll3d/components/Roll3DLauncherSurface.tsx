// dice-universal/features/roll3d/components/Roll3DLauncherSurface.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { useDb } from "../../../data/db/DbProvider";
import { useActiveTable } from "../../../data/state/ActiveTableProvider";
import { useDataRefresh } from "../../../data/state/DataRefreshProvider";
import { useRollTableData } from "../../roll/hooks/useRollTableData";
import { formatSavedActionDetail } from "../../roll/helpers/rollDisplaySummary";

import {
  listTables,
  type TableRow,
} from "../../../data/repositories/tablesRepo";

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

import {
  createGroupFromDraft,
  type DraftDie,
} from "../../../data/repositories/draftSaveRepo";
import {
  updateGroupDie,
  updateGroupRuleId,
  isDuplicateGroupNameError,
} from "../../../data/repositories/groupsRepo";
import {
  createRule,
  findCanonicalLocalRule,
  getRuleById,
} from "../../../data/repositories/rulesRepo";
import type { Db } from "../../../data/db/database";
import { getRoll3DAvailableDiceSidesForTable } from "../logic/roll3DAvailableDice";

type Roll3DLauncherSurfaceProps = {
  height?: number;
  maxDice?: number;
  handoffId?: string | string[];
};

function safeParseRuleParams(paramsJson: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(paramsJson || "{}");

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return {};
  } catch {
    return {};
  }
}

function hasBehaviorParamsOverride(
  override: Roll3DActionEntryAdjustment["behaviorParamsOverride"],
) {
  return !!override && Object.keys(override).length > 0;
}

function getAdjustedEntryLabelForSave(adjustment: Roll3DActionEntryAdjustment) {
  return adjustment.entryLabel.trim() &&
    adjustment.entryLabel.trim() !== adjustment.technicalLabel.trim()
    ? adjustment.entryLabel.trim()
    : null;
}

async function resolveAdjustedRuleIdForSave(params: {
  db: Db;
  tableId: string;
  adjustment: Roll3DActionEntryAdjustment;
  target: "entry" | "group";
}): Promise<string | null> {
  const { db, tableId, adjustment, target } = params;

  const behavior =
    target === "entry" ? adjustment.behavior : adjustment.groupBehavior;

  if (!behavior) {
    return null;
  }

  const override =
    adjustment.behaviorParamsTarget === target
      ? adjustment.behaviorParamsOverride
      : undefined;

  if (!hasBehaviorParamsOverride(override)) {
    return behavior.id;
  }

  const fullRule = await getRuleById(db, behavior.id);

  const baseParams = safeParseRuleParams(
    fullRule?.params_json ?? behavior.rule.params_json,
  );

  const nextParams = {
    ...baseParams,
    ...override,
  };

  const nextParamsJson = JSON.stringify(nextParams);
  const behaviorKey =
    fullRule?.behavior_key ?? fullRule?.kind ?? behavior.kind ?? null;

  const supportedSidesJson =
    fullRule?.supported_sides_json ?? JSON.stringify([adjustment.sides]);

  const scope = fullRule?.scope ?? target;

  const existingCanonicalRule = await findCanonicalLocalRule(db, {
    tableId,
    behavior_key: behaviorKey,
    params_json: nextParamsJson,
    scope,
    supported_sides_json: supportedSidesJson,
  });

  if (existingCanonicalRule) {
    return existingCanonicalRule.id;
  }

  return createRule(db, {
    table_id: tableId,
    name: fullRule?.name ?? behavior.label,
    kind: fullRule?.kind ?? behavior.kind,
    behavior_key: behaviorKey,
    category: fullRule?.category ?? null,
    params_json: nextParamsJson,
    ui_schema_json: fullRule?.ui_schema_json ?? null,
    is_system: 0,
    supported_sides_json: supportedSidesJson,
    scope,
    usage_kind: "generated",
  });
}

async function buildAdjustedDraftDieForSave(params: {
  db: Db;
  tableId: string;
  adjustment: Roll3DActionEntryAdjustment;
}): Promise<DraftDie> {
  const { db, tableId, adjustment } = params;

  const entryRuleId = await resolveAdjustedRuleIdForSave({
    db,
    tableId,
    adjustment,
    target: "entry",
  });

  return {
    label: getAdjustedEntryLabelForSave(adjustment),
    sides: adjustment.sides,
    qty: adjustment.qty,
    modifier: adjustment.modifier,
    sign: adjustment.sign,
    rule_id: entryRuleId,
  };
}

async function resolveAdjustedGroupRuleIdForSave(params: {
  db: Db;
  tableId: string;
  adjustment: Roll3DActionEntryAdjustment;
}): Promise<string | null> {
  return resolveAdjustedRuleIdForSave({
    db: params.db,
    tableId: params.tableId,
    adjustment: params.adjustment,
    target: "group",
  });
}

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
  const { activeTableId, setActiveTableId } = useActiveTable();
  const { revision, notifyDataChanged } = useDataRefresh();

  const tableId = useMemo(
    () =>
      typeof activeTableId === "string" && activeTableId.length > 0
        ? activeTableId
        : "",
    [activeTableId],
  );

  const { table, profiles, rulesMap, reloadGroups } = useRollTableData({
    db,
    tableId,
  });

  const availableDiceSides = useMemo(
    () => getRoll3DAvailableDiceSidesForTable(table),
    [table],
  );

  useEffect(() => {
    if (availableDiceSides.length === 0) {
      return;
    }

    if (availableDiceSides.includes(launcher.selectedSides)) {
      return;
    }

    // Pour l’instant, on ne change pas encore automatiquement selectedSides
    // car useRoll3DLauncher ne semble pas exposer de setter direct.
    // Ce cas sera utile quand les tables limiteront vraiment les dés disponibles.
  }, [availableDiceSides, launcher.selectedSides]);

  const [isRolling, setIsRolling] = useState(false);
  const [skipRollRequestId, setSkipRollRequestId] = useState(0);
  const [sceneVersion, setSceneVersion] = useState(0);

  const [availableTables, setAvailableTables] = useState<TableRow[]>([]);
  const [isChangingTable, setIsChangingTable] = useState(false);

  const [pendingAdjustmentLaunch, setPendingAdjustmentLaunch] = useState<{
    requestId: number;
    expectedDraftId: string;
    expectedDiceCount: number;
    createdAt: number;
  } | null>(null);

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

  const [
    lastAppliedActionEntryAdjustment,
    setLastAppliedActionEntryAdjustment,
  ] = useState<Roll3DActionEntryAdjustment | null>(null);

  const [showSaveAdjustedActionModal, setShowSaveAdjustedActionModal] =
    useState(false);

  const [newAdjustedActionName, setNewAdjustedActionName] = useState("");

  const [isSavingAdjustedAction, setIsSavingAdjustedAction] = useState(false);
  const [saveAdjustedActionError, setSaveAdjustedActionError] = useState<
    string | null
  >(null);

  const reloadAvailableTables = useCallback(async () => {
    const tables = await listTables(db);
    setAvailableTables(tables);
  }, [db]);

  useEffect(() => {
    void reloadAvailableTables();
  }, [revision, reloadAvailableTables]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsRolling(false);
        setSkipRollRequestId(0);
        setPendingAdjustmentLaunch(null);
        setSelectedActionId(null);
        setSelectedActionEntryId(null);
        setActionEntryAdjustment(null);
        setLastAppliedActionEntryAdjustment(null);
        resetLauncher();
      };
    }, [resetLauncher]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!tableId) {
        return;
      }

      void reloadGroups(tableId);
    }, [tableId, reloadGroups]),
  );

  useEffect(() => {
    setSelectedActionId(null);
    setSelectedActionEntryId(null);
    setActionEntryAdjustment(null);
    setLastAppliedActionEntryAdjustment(null);
    setPendingAdjustmentLaunch(null);

    if (!tableId) {
      setSelectedProfileId(null);
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
      setLastAppliedActionEntryAdjustment(null);
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
      setLastAppliedActionEntryAdjustment(null);
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

  const profileOptions = useMemo(
    () =>
      profiles.map((entry) => ({
        id: entry.profile.id,
        name: entry.profile.name,
        actionCount: entry.groups.length,
      })),
    [profiles],
  );

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
    setPendingAdjustmentLaunch(null);
    setSelectedActionId(null);
    setSelectedActionEntryId(null);
    setActionEntryAdjustment(null);
    setLastAppliedActionEntryAdjustment(null);

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
      setLastAppliedActionEntryAdjustment(null);
      addDie(sides);
    },
    [addDie],
  );

  const handleClearDice = useCallback(() => {
    setIsRolling(false);
    setSkipRollRequestId(0);
    setPendingAdjustmentLaunch(null);
    setSelectedActionId(null);
    setSelectedActionEntryId(null);
    setActionEntryAdjustment(null);
    setLastAppliedActionEntryAdjustment(null);
    clearDice();
  }, [clearDice]);

  const resetRoll3DTransientState = useCallback(() => {
    setIsRolling(false);
    setSkipRollRequestId(0);
    setPendingAdjustmentLaunch(null);
    setSelectedActionId(null);
    setSelectedActionEntryId(null);
    setActionEntryAdjustment(null);
    setLastAppliedActionEntryAdjustment(null);
    setShowSaveAdjustedActionModal(false);
    setNewAdjustedActionName("");
    setSaveAdjustedActionError(null);
    setIsSavingAdjustedAction(false);
    clearResult();
  }, [clearResult]);

  const handleSelectTable = useCallback(
    async (nextTableId: string) => {
      if (!nextTableId || nextTableId === tableId || isChangingTable) {
        return;
      }

      const tableExists = availableTables.some(
        (entry) => entry.id === nextTableId,
      );

      if (!tableExists) {
        return;
      }

      setIsChangingTable(true);

      try {
        resetRoll3DTransientState();
        resetLauncher();

        setSelectedProfileId(null);
        setSceneVersion((current) => current + 1);

        await setActiveTableId(nextTableId);
        await reloadGroups(nextTableId);
        notifyDataChanged();
      } finally {
        setIsChangingTable(false);
      }
    },
    [
      tableId,
      isChangingTable,
      availableTables,
      resetRoll3DTransientState,
      resetLauncher,
      setActiveTableId,
      reloadGroups,
      notifyDataChanged,
    ],
  );

  const handleSelectProfile = useCallback(
    (profileId: string) => {
      if (!profileId || profileId === selectedProfileId) {
        return;
      }

      const profileExists = profiles.some(
        (entry) => entry.profile.id === profileId,
      );

      if (!profileExists) {
        return;
      }

      setSelectedProfileId(profileId);
      setSelectedActionId(null);
      setSelectedActionEntryId(null);
      setActionEntryAdjustment(null);
      setLastAppliedActionEntryAdjustment(null);
      setPendingAdjustmentLaunch(null);
      setShowSaveAdjustedActionModal(false);
      setNewAdjustedActionName("");
      setSaveAdjustedActionError(null);
      setIsSavingAdjustedAction(false);

      clearResult();
      setIsRolling(false);
      setSkipRollRequestId(0);
    },
    [selectedProfileId, profiles, clearResult],
  );

  const handleSelectAction = useCallback((actionId: string) => {
    if (!actionId) {
      setSelectedActionId(null);
      setSelectedActionEntryId(null);
      setActionEntryAdjustment(null);
      setLastAppliedActionEntryAdjustment(null);
      return;
    }

    setSelectedActionId(actionId);
    setSelectedActionEntryId(null);
    setActionEntryAdjustment(null);
    setLastAppliedActionEntryAdjustment(null);
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
      setPendingAdjustmentLaunch(null);

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
      setLastAppliedActionEntryAdjustment(null);

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
      setLastAppliedActionEntryAdjustment(null);
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

  const handleChangeActionEntryBehaviorParam = useCallback(
    (params: { paramsKey: string; value: unknown }) => {
      setActionEntryAdjustment((current) => {
        if (!current) return current;

        return {
          ...current,
          behaviorParamsOverride: {
            ...(current.behaviorParamsOverride ?? {}),
            [params.paramsKey]: params.value,
          },
        };
      });
    },
    [],
  );

  const handleCloseActionEntryAdjustment = useCallback(() => {
    setActionEntryAdjustment(null);
  }, []);

  const launchPendingActionEntryAdjustment = useCallback(() => {
    if (!actionEntryAdjustment || isRolling || pendingAdjustmentLaunch) {
      return false;
    }

    const entryDraft = createRoll3DDiceInputsFromActionEntryAdjustment({
      adjustment: actionEntryAdjustment,
      source: "action",
    });

    if (entryDraft.dice.length === 0) {
      return false;
    }

    const draft = createRoll3DDraftFromDice(entryDraft.dice, {
      groupBehavior: entryDraft.groupBehavior,
    });

    setIsRolling(false);
    setSkipRollRequestId(0);
    setSelectedActionId(actionEntryAdjustment.actionId);
    setSelectedActionEntryId(actionEntryAdjustment.entryId);

    /**
     * Important :
     * à partir de maintenant, l’ajustement devient le draft normal de la table.
     * On ferme donc le mode "ajustement en attente" pour que Relancer
     * repasse dans le flux standard Roll3D.
     */
    setLastAppliedActionEntryAdjustment(actionEntryAdjustment);
    setActionEntryAdjustment(null);

    const requestId = Date.now();

    /**
     * Important :
     * un lancer ajusté remplace toujours le draft de la table.
     * On force donc une scène fraîche à chaque fois pour éviter les états Three/GL
     * où les dés sont visibles mais où le rollRequest n’est pas consommé.
     */
    setSceneVersion((current) => current + 1);

    loadDraft(draft);

    setPendingAdjustmentLaunch({
      requestId,
      expectedDraftId: draft.id,
      expectedDiceCount: entryDraft.dice.length,
      createdAt: requestId,
    });

    return true;
  }, [actionEntryAdjustment, isRolling, pendingAdjustmentLaunch, loadDraft]);

  useEffect(() => {
    if (!pendingAdjustmentLaunch) {
      return;
    }

    if (isRolling) {
      return;
    }

    const draftIsLoaded =
      launcher.draft.id === pendingAdjustmentLaunch.expectedDraftId;

    if (!draftIsLoaded) {
      return;
    }

    const hasExpectedDice =
      launcher.diceCount === pendingAdjustmentLaunch.expectedDiceCount;

    const hasSomeDice = launcher.diceCount > 0;

    /**
     * Cas normal : le draft chargé contient exactement le nombre de dés attendu.
     * Cas toléré : le draft est bien le bon et contient des dés, même si le count
     * n’est pas exactement celui attendu. On évite ainsi un blocage permanent.
     */
    if (!hasExpectedDice && !hasSomeDice) {
      return;
    }

    const timeoutId = setTimeout(
      () => {
        setPendingAdjustmentLaunch(null);
        setIsRolling(true);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            rollDice();
          });
        });
      },
      hasExpectedDice ? 260 : 520,
    );

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    pendingAdjustmentLaunch,
    isRolling,
    launcher.draft.id,
    launcher.diceCount,
    rollDice,
  ]);

  useEffect(() => {
    if (!pendingAdjustmentLaunch) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setPendingAdjustmentLaunch((current) => {
        if (!current) {
          return current;
        }

        if (current.requestId !== pendingAdjustmentLaunch.requestId) {
          return current;
        }

        if (__DEV__) {
          console.warn("[Roll3D] pending adjusted launch recovered", {
            expectedDraftId: current.expectedDraftId,
            expectedDiceCount: current.expectedDiceCount,
            currentDraftId: launcher.draft.id,
            currentDiceCount: launcher.diceCount,
          });
        }

        setIsRolling(false);
        return null;
      });
    }, 2200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pendingAdjustmentLaunch, launcher.draft.id, launcher.diceCount]);

  const handleRollPress = useCallback(() => {
    if (isRolling || pendingAdjustmentLaunch) {
      return;
    }

    /**
     * Cas spécial :
     * une entrée est en cours d’ajustement.
     * Le bouton LANCER doit d’abord convertir cet ajustement en draft normal,
     * puis lancer après stabilisation.
     */
    if (actionEntryAdjustment) {
      const launchedAdjustment = launchPendingActionEntryAdjustment();

      if (launchedAdjustment) {
        return;
      }
    }

    /**
     * Cas normal :
     * aucun ajustement en attente.
     * On relance simplement le draft actuellement présent sur la table.
     */
    if (launcher.diceCount <= 0) {
      return;
    }

    setLastAppliedActionEntryAdjustment(null);
    setIsRolling(true);
    rollDice();
  }, [
    isRolling,
    pendingAdjustmentLaunch,
    actionEntryAdjustment,
    launchPendingActionEntryAdjustment,
    launcher.diceCount,
    rollDice,
  ]);

  const handleRollAgain = useCallback(() => {
    /**
     * Relancer doit toujours utiliser le draft déjà présent sur la table.
     * Il ne doit jamais rouvrir / réutiliser une ancienne intention d’ajustement.
     */
    setActionEntryAdjustment(null);
    setPendingAdjustmentLaunch(null);

    if (isRolling || launcher.diceCount <= 0) {
      return;
    }

    setIsRolling(true);
    rollDice();
  }, [isRolling, launcher.diceCount, rollDice]);

  const handleSaveAdjustedAction = useCallback(() => {
    if (!lastAppliedActionEntryAdjustment) {
      return;
    }

    setNewAdjustedActionName(
      `${lastAppliedActionEntryAdjustment.actionName} — variante`,
    );

    setSaveAdjustedActionError(null);
    setShowSaveAdjustedActionModal(true);
  }, [lastAppliedActionEntryAdjustment]);

  const handleRequestUpdateExistingAdjustedAction = useCallback(async () => {
    if (!lastAppliedActionEntryAdjustment || !tableId) {
      return;
    }

    setIsSavingAdjustedAction(true);
    setSaveAdjustedActionError(null);

    try {
      const adjustment = lastAppliedActionEntryAdjustment;

      const entryRuleId = await resolveAdjustedRuleIdForSave({
        db,
        tableId,
        adjustment,
        target: "entry",
      });

      const groupRuleId = await resolveAdjustedGroupRuleIdForSave({
        db,
        tableId,
        adjustment,
      });

      await updateGroupDie(db, adjustment.entryId, {
        label: getAdjustedEntryLabelForSave(adjustment),
        sides: adjustment.sides,
        qty: adjustment.qty,
        modifier: adjustment.modifier,
        sign: adjustment.sign,
        rule_id: entryRuleId,
      });

      if (adjustment.behaviorParamsTarget === "group") {
        await updateGroupRuleId(db, adjustment.actionId, groupRuleId);
      }

      await reloadGroups(tableId);
      notifyDataChanged();

      setShowSaveAdjustedActionModal(false);
      setSaveAdjustedActionError(null);
      setLastAppliedActionEntryAdjustment(null);
      clearResult();
      setIsRolling(false);
      setSkipRollRequestId(0);
      setPendingAdjustmentLaunch(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour cette action.";

      setSaveAdjustedActionError(message);
    } finally {
      setIsSavingAdjustedAction(false);
    }
  }, [
    db,
    tableId,
    lastAppliedActionEntryAdjustment,
    reloadGroups,
    notifyDataChanged,
    clearResult,
  ]);

  const handleRequestSaveAdjustedActionAsNew = useCallback(async () => {
    if (!lastAppliedActionEntryAdjustment || !tableId || !activeProfileEntry) {
      return;
    }

    const safeName = newAdjustedActionName.trim();

    if (!safeName) {
      setSaveAdjustedActionError(
        "Le nom de la nouvelle action est obligatoire.",
      );
      return;
    }

    setIsSavingAdjustedAction(true);
    setSaveAdjustedActionError(null);

    try {
      const adjustment = lastAppliedActionEntryAdjustment;

      const draftDie = await buildAdjustedDraftDieForSave({
        db,
        tableId,
        adjustment,
      });

      const groupRuleId =
        adjustment.behaviorParamsTarget === "group"
          ? await resolveAdjustedGroupRuleIdForSave({
              db,
              tableId,
              adjustment,
            })
          : null;

      const newGroupId = await createGroupFromDraft(db, {
        profileId: activeProfileEntry.profile.id,
        groupName: safeName,
        groupRuleId,
        draftDice: [draftDie],
      });

      await reloadGroups(tableId);
      notifyDataChanged();

      setSelectedActionId(newGroupId);
      setSelectedActionEntryId(null);
      setShowSaveAdjustedActionModal(false);
      setSaveAdjustedActionError(null);
      setLastAppliedActionEntryAdjustment(null);
      clearResult();
      setIsRolling(false);
      setSkipRollRequestId(0);
      setPendingAdjustmentLaunch(null);
    } catch (error) {
      const message = isDuplicateGroupNameError(error)
        ? error.message
        : error instanceof Error
          ? error.message
          : "Impossible de créer cette nouvelle action.";

      setSaveAdjustedActionError(message);
    } finally {
      setIsSavingAdjustedAction(false);
    }
  }, [
    db,
    tableId,
    activeProfileEntry,
    lastAppliedActionEntryAdjustment,
    newAdjustedActionName,
    reloadGroups,
    notifyDataChanged,
    clearResult,
  ]);

  const handleCloseSaveAdjustedActionModal = useCallback(() => {
    setShowSaveAdjustedActionModal(false);
  }, []);

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
    setPendingAdjustmentLaunch(null);
    setLastAppliedActionEntryAdjustment(null);
  }, [clearResult]);

  const shouldShowControls = !isRolling && !launcher.latestResult;

  const pendingAdjustmentDiceCount = actionEntryAdjustment
    ? Math.max(1, Math.floor(actionEntryAdjustment.qty))
    : 0;

  const effectiveDiceCount =
    pendingAdjustmentDiceCount > 0
      ? pendingAdjustmentDiceCount
      : launcher.diceCount;

  useEffect(() => {
    if (lastAppliedActionEntryAdjustment) {
      return;
    }

    setShowSaveAdjustedActionModal(false);
    setNewAdjustedActionName("");
    setSaveAdjustedActionError(null);
    setIsSavingAdjustedAction(false);
  }, [lastAppliedActionEntryAdjustment]);

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
            availableDiceSides={availableDiceSides}
            diceCount={effectiveDiceCount}
            maxDice={launcher.maxDice}
            rollDisabled={isRolling || !!pendingAdjustmentLaunch}
            tableName={table?.name ?? null}
            tables={availableTables}
            selectedTableId={tableId || null}
            profileName={activeProfileEntry?.profile.name ?? null}
            profiles={profileOptions}
            selectedProfileId={activeProfileEntry?.profile.id ?? null}
            actions={actionItems}
            onSelectProfile={handleSelectProfile}
            onSelectSides={handleSelectFreeDie}
            onSelectTable={handleSelectTable}
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
            onChangeActionEntryBehaviorParam={
              handleChangeActionEntryBehaviorParam
            }
            onCloseActionEntryAdjustment={handleCloseActionEntryAdjustment}
          />
        </View>
      ) : null}

      <Roll3DResultOverlay
        visible={!!launcher.latestResult}
        result={launcher.latestResult}
        canSaveAdjustedAction={!!lastAppliedActionEntryAdjustment}
        onClose={handleCloseResult}
        onRollAgain={handleRollAgain}
        onSaveAdjustedAction={handleSaveAdjustedAction}
      />

      <Roll3DAdjustedActionSaveModal
        visible={
          showSaveAdjustedActionModal && !!lastAppliedActionEntryAdjustment
        }
        adjustment={lastAppliedActionEntryAdjustment}
        newActionName={newAdjustedActionName}
        isSaving={isSavingAdjustedAction}
        errorMessage={saveAdjustedActionError}
        onChangeNewActionName={setNewAdjustedActionName}
        onClose={handleCloseSaveAdjustedActionModal}
        onUpdateExisting={handleRequestUpdateExistingAdjustedAction}
        onSaveAsNew={handleRequestSaveAdjustedActionAsNew}
      />
    </View>
  );
}

function Roll3DAdjustedActionSaveModal({
  visible,
  adjustment,
  newActionName,
  isSaving,
  errorMessage,
  onChangeNewActionName,
  onClose,
  onUpdateExisting,
  onSaveAsNew,
}: {
  visible: boolean;
  adjustment: Roll3DActionEntryAdjustment | null;
  newActionName: string;
  isSaving: boolean;
  errorMessage: string | null;
  onChangeNewActionName: (value: string) => void;
  onClose: () => void;
  onUpdateExisting: () => void;
  onSaveAsNew: () => void;
}) {
  if (!adjustment) {
    return null;
  }

  const canSaveAsNew = newActionName.trim().length > 0 && !isSaving;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.66)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 18,
          paddingVertical: 28,
        }}
      >
        <Pressable
          onPress={() => {
            return;
          }}
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.22)",
            backgroundColor: "rgba(12, 14, 24, 0.98)",
            padding: 18,
          }}
        >
          <Text
            style={{
              color: "rgba(232, 200, 120, 0.94)",
              fontSize: 11,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Sauvegarder ce réglage
          </Text>

          <Text
            style={{
              color: "rgba(255,255,255,0.94)",
              fontSize: 20,
              fontWeight: "900",
              marginTop: 8,
            }}
          >
            {adjustment.actionName}
          </Text>

          <Text
            style={{
              color: "rgba(255,255,255,0.58)",
              fontSize: 12,
              fontWeight: "700",
              lineHeight: 18,
              marginTop: 6,
            }}
          >
            Entrée : {adjustment.entryLabel} · {adjustment.qty}d
            {adjustment.sides}
            {adjustment.modifier !== 0
              ? ` ${adjustment.modifier > 0 ? "+" : "-"} ${Math.abs(
                  adjustment.modifier,
                )}`
              : ""}
          </Text>

          <View
            style={{
              marginTop: 14,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.045)",
              padding: 12,
              gap: 8,
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.78)",
                fontSize: 12,
                fontWeight: "900",
              }}
            >
              Que veux-tu faire ?
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.52)",
                fontSize: 11,
                fontWeight: "700",
                lineHeight: 16,
              }}
            >
              Tu peux écraser volontairement l’action actuelle ou créer une
              nouvelle action avec ces réglages.
            </Text>
          </View>

          <Pressable
            onPress={onUpdateExisting}
            disabled={isSaving}
            style={({ pressed }) => ({
              marginTop: 14,
              opacity: isSaving ? 0.42 : pressed ? 0.78 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            })}
          >
            <View
              style={{
                minHeight: 46,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(232, 200, 120, 0.24)",
                backgroundColor: "rgba(232, 200, 120, 0.10)",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 12,
              }}
            >
              <Text
                style={{
                  color: "rgba(232, 200, 120, 0.96)",
                  fontSize: 12,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  textAlign: "center",
                }}
              >
                {isSaving
                  ? "Sauvegarde..."
                  : "Mettre à jour l’action existante"}
              </Text>
            </View>
          </Pressable>

          <View
            style={{
              marginTop: 12,
              gap: 8,
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.62)",
                fontSize: 10,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Nouvelle action
            </Text>

            <TextInput
              value={newActionName}
              onChangeText={onChangeNewActionName}
              placeholder="Nom de la nouvelle action"
              placeholderTextColor="rgba(255,255,255,0.28)"
              selectTextOnFocus
              style={{
                minHeight: 46,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.10)",
                backgroundColor: "rgba(0,0,0,0.24)",
                color: "rgba(255,255,255,0.94)",
                paddingHorizontal: 14,
                fontSize: 13,
                fontWeight: "800",
              }}
            />

            <Pressable
              disabled={!canSaveAsNew}
              onPress={onSaveAsNew}
              style={({ pressed }) => ({
                opacity: !canSaveAsNew ? 0.42 : pressed ? 0.78 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              })}
            >
              <View
                style={{
                  minHeight: 46,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(136, 211, 154, 0.32)",
                  backgroundColor: "rgba(136, 211, 154, 0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 12,
                }}
              >
                <Text
                  style={{
                    color: "rgba(136, 211, 154, 0.96)",
                    fontSize: 12,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    textAlign: "center",
                  }}
                >
                  {isSaving
                    ? "Sauvegarde..."
                    : "Enregistrer comme nouvelle action"}
                </Text>
              </View>
            </Pressable>
          </View>

          {errorMessage ? (
            <View
              style={{
                marginTop: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(239, 111, 145, 0.28)",
                backgroundColor: "rgba(239, 111, 145, 0.10)",
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  color: "rgba(239, 111, 145, 0.96)",
                  fontSize: 11,
                  fontWeight: "800",
                  lineHeight: 16,
                }}
              >
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              marginTop: 14,
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <View
              style={{
                minHeight: 42,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.045)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.66)",
                  fontSize: 12,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Annuler
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
