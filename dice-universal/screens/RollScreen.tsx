// dice-universal\screens\RollScreen.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";

import { useDataRefresh } from "../data/state/DataRefreshProvider";

import { listTables, type TableRow } from "../data/repositories/tablesRepo";
import {
  createGroup,
  createGroupDie,
  deleteGroupDie,
  updateGroupName,
  updateGroupRuleId,
} from "../data/repositories/groupsRepo";

import { RollModals } from "../features/roll/components/RollModals";
import { QuickRollSection } from "../features/roll/components/QuickRollSection";

import { useArcaneLayout } from "../theme/useArcaneLayout";
import { useArcaneTheme } from "../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../theme/rollScreenTheme";

import { SessionBar } from "../features/roll/components/SessionBar";
import {
  SessionMenuModal,
  type SessionMenuItem,
} from "../features/roll/components/SessionMenuModal";

import { PreparedRollCard } from "../features/roll/components/PreparedRollCard";
import { ActionRail } from "../features/roll/components/ActionRail";
import { StickyRollButton } from "../features/roll/components/StickyRollButton";
import { ResultPanel } from "../features/roll/components/ResultPanel";
import { PreparedRollEditSheet } from "../features/roll/components/PreparedRollEditSheet";
import { FreeDicePad } from "../features/roll/components/FreeDicePad";

import { useDraftTableActions } from "../features/roll/hooks/useDraftTableActions";
import { useRollExecution } from "../features/roll/hooks/useRollExecution";
import { useQuickRollDraft } from "../features/roll/hooks/useQuickRollDraft";
import { useRollTableData } from "../features/roll/hooks/useRollTableData";

import type { GroupRollResult } from "../core/roll/roll";

import { buildDraftTempRuleFromPreset } from "../features/roll/helpers/buildDraftTempRuleFromPreset";

import { QuickBehaviorConfigModal } from "../features/roll/components/QuickBehaviorConfigModal";
import { QuickDieBehaviorPickerModal } from "../features/roll/components/QuickDieBehaviorPickerModal";
import { useQuickBehaviorConfigModal } from "../features/roll/hooks/useQuickBehaviorConfigModal";
import { useQuickDieBehaviorPicker } from "../features/roll/hooks/useQuickDieBehaviorPicker";
import {
  formatDraftGroupDiceLabel,
  formatSavedActionDetail,
  // getDraftGroupBehaviorSummary,
  getRuleSummaryFromRuleId,
  getRuleSummaryFromTempRule,
  type DraftGroupSummary,
} from "../features/roll/helpers/rollDisplaySummary";
import { behaviorNeedsSelectionConfig } from "../features/roll/helpers/quickBehaviorConfig";

function findStandardQuickGroup(groups: DraftGroupSummary[]) {
  return (
    groups.find(
      (group) => group.name === "Jet libre" && group.dice.length > 0,
    ) ?? null
  );
}

function findDraftGroupById(
  groups: DraftGroupSummary[],
  groupId: string | null,
) {
  if (!groupId) return null;

  return groups.find((group) => group.id === groupId) ?? null;
}

type PreparedRoll =
  | {
    source: "free";
  }
  | {
    source: "action";
    profileId: string;
    groupId: string;
    label: string;
  }
  | {
    source: "action_draft";
    profileId: string;
    groupId: string;
    draftGroupId: string;
    label: string;
  };

function animateCockpitLayout() {
  LayoutAnimation.configureNext({
    duration: 180,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}

function formatPreparedCardModifier(modifier?: number) {
  const safeModifier = Number.isFinite(modifier ?? 0) ? (modifier ?? 0) : 0;

  if (safeModifier === 0) return "";

  return ` ${safeModifier > 0 ? "+" : "-"} ${Math.abs(safeModifier)}`;
}

function formatPreparedCardDieLabel(die: {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
}) {
  return `${die.qty}d${die.sides}${formatPreparedCardModifier(die.modifier)}`;
}

export default function RollScreen() {
  const layout = useArcaneLayout();
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const { height: windowHeight } = useWindowDimensions();

  const isVerySmallScreen = windowHeight < 760;
  const isCompactScreen = windowHeight < 820;

  const cockpitDensity = isVerySmallScreen
    ? "tight"
    : isCompactScreen
      ? "compact"
      : "comfortable";

  const baseStageGap =
    cockpitDensity === "tight" ? 0 : cockpitDensity === "compact" ? 2 : 4;

  const resultToDiceOverlap =
    cockpitDensity === "tight" ? -14 : cockpitDensity === "compact" ? -12 : -8;

  const diceToPreparedOverlap =
    cockpitDensity === "tight" ? -18 : cockpitDensity === "compact" ? -16 : -12;

  const preparedToActionsOverlap =
    cockpitDensity === "tight" ? -8 : cockpitDensity === "compact" ? -6 : -4;

  const [preparedRoll, setPreparedRoll] = useState<PreparedRoll | null>(null);
  const [latestResult, setLatestResult] = useState<GroupRollResult | null>(
    null,
  );
  const [showPreparedEditSheet, setShowPreparedEditSheet] = useState(false);
  const [showPreparedAddDicePicker, setShowPreparedAddDicePicker] =
    useState(false);
  const [showTableSessionMenu, setShowTableSessionMenu] = useState(false);
  const [showProfileSessionMenu, setShowProfileSessionMenu] = useState(false);

  const [showActionDraftSaveMenu, setShowActionDraftSaveMenu] = useState(false);
  const [showActionCopyNameModal, setShowActionCopyNameModal] = useState(false);
  const [actionCopyName, setActionCopyName] = useState("");

  const [allTables, setAllTables] = useState<TableRow[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  const db = useDb();
  const { activeTableId, setActiveTableId, clearActiveTableId } =
    useActiveTable();
  const [, setResults] = useState<GroupRollResult[]>([]);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newProfileName, setNewProfileName] = useState("Profil principal");
  const [availableSaveTargets, setAvailableSaveTargets] = useState<
    {
      table: {
        id: string;
        name: string;
        is_system: number;
      };
      profiles: {
        id: string;
        name: string;
      }[];
    }[]
  >([]);
  const [loadingSaveTargets, setLoadingSaveTargets] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );

  const [quickModifier, setQuickModifier] = useState(0);
  const [draftBehaviorTarget, setDraftBehaviorTarget] = useState<{
    groupId: string;
    index: number;
  } | null>(null);
  const [preparedEditMode, setPreparedEditMode] = useState<
    "dice" | "behavior_picker" | "behavior_config"
  >("dice");

  const [preparedBehaviorTargetIndex, setPreparedBehaviorTargetIndex] =
    useState<number | null>(null);

  const [preparedBehaviorFlowOrigin, setPreparedBehaviorFlowOrigin] = useState<
    "global" | "tile" | null
  >(null);

  const quickBehaviorConfig = useQuickBehaviorConfigModal();

  const { revision } = useDataRefresh();

  const STANDARD_DICE = [4, 6, 8, 10, 12, 20, 100];

  const tableId = useMemo(
    () =>
      typeof activeTableId === "string" && activeTableId.length > 0
        ? activeTableId
        : "",
    [activeTableId],
  );

  const {
    table,
    profiles,
    rulesMap,
    availableRules,
    modernRules,
    legacyRules,
    error,
    reloadGroups,
  } = useRollTableData({
    db,
    tableId,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadTables() {
      setLoadingTables(true);

      try {
        const rows = await listTables(db);

        if (!cancelled) {
          setAllTables(rows);
        }
      } finally {
        if (!cancelled) {
          setLoadingTables(false);
        }
      }
    }

    loadTables();

    return () => {
      cancelled = true;
    };
  }, [db, revision]);

  useEffect(() => {
    if (profiles.length === 0) {
      setSelectedProfileId(null);
      return;
    }

    const exists = profiles.some((p) => p.profile.id === selectedProfileId);
    if (!exists) {
      setSelectedProfileId(profiles[0].profile.id);
    }
  }, [profiles, selectedProfileId]);

  const {
    draftGroups,
    setDraftGroups,
    draftResults,
    setDraftResults,
    selectedDraftGroupId,
    setSelectedDraftGroupId,

    showRenameDraftGroupModal,
    renameDraftGroupValue,
    setRenameDraftGroupValue,

    showDraftGroupRuleModal,
    closeDraftGroupRuleModal,
    draftGroupRuleSelection,
    setDraftGroupRuleSelection,

    editingDraftGroupId,
    editingDraftIndex,
    draftEditModifier,
    setDraftEditModifier,
    draftEditSign,
    setDraftEditSign,
    draftEditRuleId,
    setDraftEditRuleId,
    draftEditSides,
    setDraftEditSides,
    draftEditQty,
    setDraftEditQty,

    resetDraftEditorState,
    resetDraftState,
    getNonEmptyDraftGroups,

    addDraftGroup,
    addQuickStandardDie,
    addDieLineToDraftGroup,
    addQuickPresetDie,
    loadSavedGroupIntoDraft,
    updateDraftGroupName,

    applyPresetToDraftDie,
    clearDraftDieBehavior,
    clearDraftGroupBehavior,
    adjustDraftDieQty,
    adjustDraftDieModifier,
    toggleDraftDieSign,

    removeDraftDie,
    removeDraftGroup,
    clearDraft,

    openRenameDraftGroupModal,
    closeRenameDraftGroupModal,
    saveRenameDraftGroup,

    openDraftEditor,
    saveDraftEditor,

    openDraftGroupRuleEditor,
    saveDraftGroupRuleEditor,

    rollDraft,
    rollSingleDraftGroup,
    clearDraftGroup,
  } = useQuickRollDraft({
    db,
    table,
    availableRules,
  });

  const quickDieBehaviorPicker = useQuickDieBehaviorPicker({
    addQuickPresetDie,
    quickBehaviorConfig,
    onApplyPresetToExistingDraftDie: (_sides, preset) => {
      if (!draftBehaviorTarget) return false;

      const shouldReturnToMainScreen = preparedBehaviorFlowOrigin === "tile";

      applyPresetToDraftDie(
        draftBehaviorTarget.groupId,
        draftBehaviorTarget.index,
        preset,
      );

      setLatestResult(null);
      setDraftBehaviorTarget(null);
      setPreparedBehaviorTargetIndex(null);
      setPreparedEditMode("dice");
      setPreparedBehaviorFlowOrigin(null);

      if (preparedRoll?.source === "action_draft") {
        setPreparedRoll(preparedRoll);
      } else {
        setPreparedRoll({ source: "free" });
      }

      if (shouldReturnToMainScreen) {
        setShowPreparedEditSheet(false);
      }

      return true;
    },
  });

  const { rollSavedGroup } = useRollExecution({
    db,
    table,
    profiles,
    rulesMap,
    setResults,
  });

  const {
    replaceCurrentTable,
    // openCreateTableModal,
    createNewTableFromName,
    appendDraftToExistingTableNewProfile,
    appendDraftToExistingProfile,
    getAvailableSaveTargets,
    closeCreateTableModal,
  } = useDraftTableActions({
    db,
    table,
    getNonEmptyDraftGroups,
    reloadGroups,
    setShowSaveOptions,
    setShowNameModal,
    setNewTableName,
    setActiveTableId,
    resetDraftAfterCreate: () => {
      setDraftGroups([]);
      setDraftResults([]);
      setSelectedDraftGroupId(null);
      setDraftGroupRuleSelection(null);
      setShowAdvanced(false);
      setShowNameModal(false);
      setShowSaveOptions(false);
      setNewTableName("");
      setNewProfileName("Profil principal");
      setAvailableSaveTargets([]);
      setLoadingSaveTargets(false);
    },
  });

  useEffect(() => {
    if (!tableId) return;

    reloadGroups();
  }, [revision, tableId, reloadGroups]);

  useEffect(() => {
    if (preparedRoll?.source !== "action") return;

    const stillExists = profiles.some((profileEntry) =>
      profileEntry.groups.some(
        (entry) => entry.group.id === preparedRoll.groupId,
      ),
    );

    if (!stillExists) {
      setPreparedRoll(null);
      setLatestResult(null);
    }
  }, [profiles, preparedRoll]);

  const resetFreeDraftState = useCallback((): void => {
    clearDraft();
    setDraftResults([]);
    setSelectedDraftGroupId(null);
    setDraftGroupRuleSelection(null);
    resetDraftEditorState();
  }, [
    clearDraft,
    resetDraftEditorState,
    setDraftGroupRuleSelection,
    setDraftResults,
    setSelectedDraftGroupId,
  ]);

  function handleClearQuickRoll() {
    animateCockpitLayout();

    resetFreeDraftState();

    if (preparedRoll?.source === "free") {
      setPreparedRoll(null);
      setLatestResult(null);
      setShowPreparedEditSheet(false);
    }
  }

  function handleClearPreparedRoll() {
    animateCockpitLayout();

    resetFreeDraftState();

    setPreparedRoll(null);
    setLatestResult(null);
    setShowPreparedEditSheet(false);
    setQuickModifier(0);
    setShowPreparedAddDicePicker(false);
  }

  async function handleRollPrepared() {
    if (!preparedRoll) return;

    if (
      preparedRoll.source === "free" ||
      preparedRoll.source === "action_draft"
    ) {
      const group = editablePreparedDraftGroup;

      if (!group) return;

      const result = await rollSingleDraftGroup(group.id);
      setLatestResult(result);
      return;
    }

    if (preparedRoll.source === "action") {
      const result = await rollSavedGroup(
        preparedRoll.profileId,
        preparedRoll.groupId,
      );

      setLatestResult(result);
    }
  }

  async function handleOpenSaveDraftModal() {
    const nonEmptyGroups = getNonEmptyDraftGroups();
    if (nonEmptyGroups.length === 0) return;

    setLoadingSaveTargets(true);

    try {
      const targets = await getAvailableSaveTargets();
      setAvailableSaveTargets(targets);
      setNewTableName(`Nouvelle table (${new Date().toLocaleDateString()})`);
      setNewProfileName("Profil principal");
      setShowSaveOptions(false);
      setShowNameModal(true);
    } finally {
      setLoadingSaveTargets(false);
    }
  }

  function handleOpenPreparedSave() {
    if (preparedRoll?.source === "free") {
      void handleOpenSaveDraftModal();
      return;
    }

    if (preparedRoll?.source === "action_draft") {
      setShowActionDraftSaveMenu(true);
    }
  }

  async function handleSaveDraftTarget(params: {
    mode:
    | "new_table_new_profile"
    | "existing_table_new_profile"
    | "existing_table_existing_profile";
    tableName?: string;
    profileName?: string;
    tableId?: string;
    profileId?: string;
  }) {
    if (params.mode === "new_table_new_profile") {
      await createNewTableFromName(
        params.tableName ?? "",
        params.profileName ?? "Profil principal",
      );
      return;
    }

    if (params.mode === "existing_table_new_profile") {
      if (!params.tableId) {
        throw new Error("Table cible manquante.");
      }

      await appendDraftToExistingTableNewProfile(
        params.tableId,
        params.profileName ?? "Profil principal",
      );
      return;
    }

    if (!params.tableId || !params.profileId) {
      throw new Error("Table ou profil cible manquant.");
    }

    await appendDraftToExistingProfile(params.tableId, params.profileId);
  }

  function handleConfirmBehaviorConfig() {
    if (!quickBehaviorConfig.pendingBehaviorKey) {
      console.warn("Aucun comportement en attente.");
      return;
    }

    if (quickDieBehaviorPicker.editingDieSides == null) {
      console.warn("Aucun dé cible pour le comportement.");
      return;
    }

    if (!quickBehaviorConfig.isValid()) {
      console.warn("Configuration de comportement invalide.");
      return;
    }

    if (preparedRoll?.source === "action") {
      resetFreeDraftState();
    }

    const tempRule = buildDraftTempRuleFromPreset({
      preset: {
        key: quickBehaviorConfig.pendingBehaviorKey,
        label: quickBehaviorConfig.pendingBehaviorLabel,
        scope: quickBehaviorConfig.pendingBehaviorScope,
        behaviorKey: quickBehaviorConfig.pendingBehaviorKey,
        defaultValues: quickBehaviorConfig.buildDefaultValues(),
      },
      sides: quickDieBehaviorPicker.editingDieSides,
      actionName: quickBehaviorConfig.pendingBehaviorLabel,
    });

    const preset = {
      scope: quickBehaviorConfig.pendingBehaviorScope,
      rule: tempRule,
    };

    if (draftBehaviorTarget) {
      const shouldReturnToMainScreen = preparedBehaviorFlowOrigin === "tile";

      applyPresetToDraftDie(
        draftBehaviorTarget.groupId,
        draftBehaviorTarget.index,
        preset,
      );

      setLatestResult(null);
      setDraftBehaviorTarget(null);
      setPreparedBehaviorTargetIndex(null);
      setPreparedEditMode("dice");
      setPreparedBehaviorFlowOrigin(null);

      if (preparedRoll?.source === "action_draft") {
        setPreparedRoll(preparedRoll);
      } else {
        setPreparedRoll({ source: "free" });
      }

      quickBehaviorConfig.close();
      quickDieBehaviorPicker.close();

      if (shouldReturnToMainScreen) {
        setShowPreparedEditSheet(false);
      }

      return;
    }

    const createdGroupId = addQuickPresetDie(
      quickDieBehaviorPicker.editingDieSides,
      preset,
    );

    setSelectedDraftGroupId(createdGroupId);
    setPreparedRoll({ source: "free" });
    setLatestResult(null);
    setDraftBehaviorTarget(null);

    quickBehaviorConfig.close();
    quickDieBehaviorPicker.close();
  }

  const hasActiveTable = !!table;

  const activeProfile =
    profiles.find((entry) => entry.profile.id === selectedProfileId)?.profile ??
    profiles[0]?.profile ??
    null;

  const activeProfileEntry =
    profiles.find((entry) => entry.profile.id === activeProfile?.id) ?? null;

  const actionRailItems = useMemo(
    () =>
      activeProfileEntry?.groups.map(({ group, dice }) => ({
        id: group.id,
        name: group.name,
        detail: formatSavedActionDetail({
          group,
          dice,
          rulesMap,
        }),
      })) ?? [],
    [activeProfileEntry, rulesMap],
  );

  function handlePrepareSavedAction(groupId: string) {
    if (!activeProfile) return;

    const action = activeProfileEntry?.groups.find(
      (entry) => entry.group.id === groupId,
    );

    if (!action) return;

    animateCockpitLayout();

    const draftGroupId = loadSavedGroupIntoDraft({
      group: {
        id: action.group.id,
        name: action.group.name,
        rule_id: action.group.rule_id,
      },
      dice: action.dice.map((die) => ({
        sides: die.sides,
        qty: die.qty,
        modifier: die.modifier ?? 0,
        sign: die.sign ?? 1,
        rule_id: die.rule_id ?? null,
      })),
      draftName: action.group.name,
    });

    setQuickModifier(0);

    setPreparedRoll({
      source: "action_draft",
      profileId: activeProfile.id,
      groupId,
      draftGroupId,
      label: action.group.name,
    });

    setLatestResult(null);
    setShowPreparedEditSheet(false);
  }

  function handleAddQuickStandardDie(sides: number) {
    animateCockpitLayout();

    if (preparedRoll?.source === "action") {
      resetFreeDraftState();
    }

    addQuickStandardDie(sides, {
      modifier: quickModifier,
    });

    setPreparedRoll({ source: "free" });
    setLatestResult(null);
    setShowPreparedEditSheet(false);
    setQuickModifier(0);
  }

  function handleIncrementQuickModifier() {
    setQuickModifier((value) => Math.min(value + 1, 99));
  }

  function handleDecrementQuickModifier() {
    setQuickModifier((value) => Math.max(value - 1, -99));
  }

  function handleOpenPreparedEdit() {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup) return;

    setPreparedEditMode("dice");
    setPreparedBehaviorTargetIndex(null);
    setShowPreparedAddDicePicker(false);
    setShowPreparedEditSheet(true);
  }

  function handleTogglePreparedAddDicePicker() {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup) return;

    setShowPreparedAddDicePicker((value) => !value);
  }

  function handleAddPreparedDieLine(sides: number) {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup) return;

    animateCockpitLayout();

    addDieLineToDraftGroup(editablePreparedDraftGroup.id, sides);

    setPreparedRoll(
      preparedRoll?.source === "action_draft"
        ? preparedRoll
        : { source: "free" },
    );

    setLatestResult(null);
    setShowPreparedAddDicePicker(false);
  }

  function handleChangePreparedRollName(value: string) {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup) return;

    updateDraftGroupName(editablePreparedDraftGroup.id, value);
    setLatestResult(null);
  }

  function handleClosePreparedEdit() {
    setPreparedEditMode("dice");
    setPreparedBehaviorTargetIndex(null);
    setDraftBehaviorTarget(null);
    setPreparedBehaviorFlowOrigin(null);

    quickDieBehaviorPicker.close();
    quickBehaviorConfig.close();

    setShowPreparedEditSheet(false);
    setShowPreparedAddDicePicker(false);
  }

  function handleAdjustPreparedDieQty(index: number, delta: number) {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup) return;

    adjustDraftDieQty(editablePreparedDraftGroup.id, index, delta);
    setLatestResult(null);
  }

  function handleAdjustPreparedDieModifier(index: number, delta: number) {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup) return;

    adjustDraftDieModifier(editablePreparedDraftGroup.id, index, delta);
    setLatestResult(null);
  }

  function handleTogglePreparedDieSign(index: number) {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup) return;

    toggleDraftDieSign(editablePreparedDraftGroup.id, index);
    setLatestResult(null);
  }

  function handleConfigurePreparedDieBehavior(
    index: number,
    origin: "global" | "tile" = "global",
  ) {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup) return;

    const die = editablePreparedDraftGroup.dice[index];
    if (!die) return;

    setPreparedBehaviorFlowOrigin(origin);

    setDraftBehaviorTarget({
      groupId: editablePreparedDraftGroup.id,
      index,
    });

    setPreparedBehaviorTargetIndex(index);
    setPreparedEditMode("behavior_picker");
    setShowPreparedEditSheet(true);

    quickDieBehaviorPicker.open(die.sides);
  }

  function handleConfigurePreparedDieBehaviorFromGlobal(index: number) {
    handleConfigurePreparedDieBehavior(index, "global");
  }

  function handleConfigurePreparedDieBehaviorFromTile(index: number) {
    handleConfigurePreparedDieBehavior(index, "tile");
  }

  function handleClearPreparedDieBehavior(index: number) {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup) return;

    const die = editablePreparedDraftGroup.dice[index];
    if (!die) return;

    const hasDieBehavior = !!die.rule_id || !!die.rule_temp;
    const hasGroupBehavior =
      !!editablePreparedDraftGroup.rule_id ||
      !!editablePreparedDraftGroup.rule_temp;

    if (hasDieBehavior) {
      clearDraftDieBehavior(editablePreparedDraftGroup.id, index);
      setLatestResult(null);
      return;
    }

    if (hasGroupBehavior) {
      clearDraftGroupBehavior(editablePreparedDraftGroup.id);
      setLatestResult(null);
    }
  }

  function handleRemovePreparedDie(index: number) {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup) return;

    removeDraftDie(editablePreparedDraftGroup.id, index);
    setLatestResult(null);
  }

  const handleClearActiveSession = useCallback(async (): Promise<void> => {
    animateCockpitLayout();

    await clearActiveTableId();

    resetDraftState();
    setQuickModifier(0);
    setSelectedProfileId(null);
    setResults([]);
    setPreparedRoll(null);
    setLatestResult(null);
    setShowPreparedEditSheet(false);
    setShowTableSessionMenu(false);
    setShowProfileSessionMenu(false);
  }, [clearActiveTableId, resetDraftState]);

  const handleSelectActiveTable = useCallback(
    async (nextTableId: string): Promise<void> => {
      animateCockpitLayout();

      await setActiveTableId(nextTableId);

      resetDraftState();
      setQuickModifier(0);
      setSelectedProfileId(null);
      setResults([]);
      setPreparedRoll(null);
      setLatestResult(null);
      setShowPreparedEditSheet(false);
      setShowTableSessionMenu(false);
      setShowProfileSessionMenu(false);
    },
    [setActiveTableId, resetDraftState],
  );

  const standardPreparedQuickGroup = useMemo(
    () => findStandardQuickGroup(draftGroups),
    [draftGroups],
  );

  const selectedPreparedQuickGroup = useMemo(
    () => findDraftGroupById(draftGroups, selectedDraftGroupId),
    [draftGroups, selectedDraftGroupId],
  );

  const preparedQuickGroup = useMemo(() => {
    if (selectedPreparedQuickGroup?.dice.length) {
      return selectedPreparedQuickGroup;
    }

    return standardPreparedQuickGroup;
  }, [selectedPreparedQuickGroup, standardPreparedQuickGroup]);

  const editablePreparedDraftGroup = useMemo(() => {
    if (preparedRoll?.source === "action_draft") {
      return findDraftGroupById(draftGroups, preparedRoll.draftGroupId);
    }

    if (preparedRoll?.source === "free") {
      return preparedQuickGroup;
    }

    return null;
  }, [preparedRoll, draftGroups, preparedQuickGroup]);

  async function handleUpdateExistingActionFromDraft() {
    if (preparedRoll?.source !== "action_draft") return;
    if (!editablePreparedDraftGroup) return;
    if (!table) return;

    if (table.is_system === 1) {
      console.warn("Impossible de modifier une action d’une table système.");
      return;
    }

    if (editablePreparedDraftGroup.dice.length === 0) {
      console.warn("Impossible de sauvegarder une action sans dé.");
      return;
    }

    const profileEntry = profiles.find(
      (entry) => entry.profile.id === preparedRoll.profileId,
    );

    const sourceAction = profileEntry?.groups.find(
      (entry) => entry.group.id === preparedRoll.groupId,
    );

    if (!sourceAction) {
      console.warn("Action source introuvable.");
      return;
    }

    animateCockpitLayout();

    await updateGroupName(
      db,
      preparedRoll.groupId,
      editablePreparedDraftGroup.name.trim() || preparedRoll.label,
    );

    await updateGroupRuleId(
      db,
      preparedRoll.groupId,
      editablePreparedDraftGroup.rule_id ?? null,
    );

    for (const die of sourceAction.dice) {
      await deleteGroupDie(db, die.id);
    }

    for (const die of editablePreparedDraftGroup.dice) {
      await createGroupDie(db, {
        groupId: preparedRoll.groupId,
        sides: die.sides,
        qty: die.qty,
        modifier: die.modifier ?? 0,
        sign: die.sign ?? 1,
        rule_id: die.rule_id ?? null,
      });
    }

    await reloadGroups();

    setPreparedRoll({
      ...preparedRoll,
      label: editablePreparedDraftGroup.name.trim() || preparedRoll.label,
    });

    setLatestResult(null);
    setShowActionDraftSaveMenu(false);
  }

  function handleOpenCreateActionCopyNameModal() {
    if (preparedRoll?.source !== "action_draft") return;
    if (!editablePreparedDraftGroup) return;

    setActionCopyName(
      `${editablePreparedDraftGroup.name || preparedRoll.label} — variante`,
    );

    setShowActionDraftSaveMenu(false);
    setShowActionCopyNameModal(true);
  }

  async function handleCreateActionCopyFromDraft() {
    if (preparedRoll?.source !== "action_draft") return;
    if (!editablePreparedDraftGroup) return;
    if (!table) return;

    if (table.is_system === 1) {
      console.warn("Impossible d’ajouter une action dans une table système.");
      return;
    }

    if (editablePreparedDraftGroup.dice.length === 0) {
      console.warn("Impossible de sauvegarder une action sans dé.");
      return;
    }

    const trimmedName = actionCopyName.trim();

    if (!trimmedName) {
      console.warn("Le nom de la nouvelle action est obligatoire.");
      return;
    }

    const newActionName = trimmedName;

    animateCockpitLayout();

    const newGroupId = await createGroup(db, {
      profileId: preparedRoll.profileId,
      name: newActionName,
      rule_id: editablePreparedDraftGroup.rule_id ?? null,
    });

    for (const die of editablePreparedDraftGroup.dice) {
      await createGroupDie(db, {
        groupId: newGroupId,
        sides: die.sides,
        qty: die.qty,
        modifier: die.modifier ?? 0,
        sign: die.sign ?? 1,
        rule_id: die.rule_id ?? null,
      });
    }

    await reloadGroups();

    setPreparedRoll({
      source: "action_draft",
      profileId: preparedRoll.profileId,
      groupId: newGroupId,
      draftGroupId: editablePreparedDraftGroup.id,
      label: newActionName,
    });

    setLatestResult(null);
    setShowActionDraftSaveMenu(false);
    setShowActionCopyNameModal(false);
    setActionCopyName("");
  }

  const preparedQuickRollDetail = useMemo(
    () => formatDraftGroupDiceLabel(editablePreparedDraftGroup, rulesMap),
    [editablePreparedDraftGroup, rulesMap],
  );

  const preparedQuickEditDice = useMemo(
    () =>
      editablePreparedDraftGroup?.dice.map((die) => ({
        sides: die.sides,
        qty: die.qty,
        modifier: die.modifier ?? 0,
        sign: die.sign ?? 1,
        ruleLabel:
          getRuleSummaryFromTempRule(die.rule_temp) ??
          getRuleSummaryFromRuleId(die.rule_id, rulesMap) ??
          "Somme simple",
      })) ?? [],
    [editablePreparedDraftGroup, rulesMap],
  );

  const preparedCardLines = useMemo(
    () =>
      preparedQuickEditDice.map((die, index) => {
        const ruleLabel = die.ruleLabel ?? "Somme simple";
        const hasBehavior = ruleLabel !== "Somme simple";

        return {
          id: `${editablePreparedDraftGroup?.id ?? "prepared"}-${index}-${die.sides}`,
          label: formatPreparedCardDieLabel(die),
          detail: ruleLabel,
          sign: die.sign ?? 1,
          sides: die.sides,
          qty: die.qty,
          modifier: die.modifier ?? 0,
          hasBehavior,
        };
      }),
    [preparedQuickEditDice, editablePreparedDraftGroup?.id],
  );

  const freeDiceCountsBySides = useMemo(() => {
    const counts: Record<number, number> = {};

    for (const die of standardPreparedQuickGroup?.dice ?? []) {
      counts[die.sides] = (counts[die.sides] ?? 0) + die.qty;
    }

    return counts;
  }, [standardPreparedQuickGroup]);

  const hasPreparedQuickRoll = !!preparedQuickRollDetail;

  const preparedActionEntry = useMemo(() => {
    if (preparedRoll?.source !== "action") return null;

    const profileEntry = profiles.find(
      (entry) => entry.profile.id === preparedRoll.profileId,
    );

    return (
      profileEntry?.groups.find(
        (entry) => entry.group.id === preparedRoll.groupId,
      ) ?? null
    );
  }, [preparedRoll, profiles]);

  const preparedActionDetail = useMemo(() => {
    if (!preparedActionEntry) return null;

    return formatSavedActionDetail({
      group: preparedActionEntry.group,
      dice: preparedActionEntry.dice,
      rulesMap,
    });
  }, [preparedActionEntry, rulesMap]);

  const preparedCardName =
    preparedRoll?.source === "free" || preparedRoll?.source === "action_draft"
      ? hasPreparedQuickRoll
        ? (editablePreparedDraftGroup?.name ?? "Jet préparé")
        : null
      : preparedRoll?.source === "action"
        ? preparedRoll.label
        : null;

  const preparedCardDetail =
    preparedRoll?.source === "free" || preparedRoll?.source === "action_draft"
      ? preparedQuickRollDetail
      : preparedRoll?.source === "action"
        ? preparedActionDetail
        : null;

  const hasPreparedRoll = !!preparedCardName && !!preparedCardDetail;

  const hasResult = !!latestResult;

  const isFreeIdleCockpit = !hasActiveTable && !hasPreparedRoll && !hasResult;
  const isTableIdleCockpit = hasActiveTable && !hasPreparedRoll && !hasResult;

  const isFreePreparedCockpit =
    !hasActiveTable && hasPreparedRoll && !hasResult;
  const isTablePreparedCockpit =
    hasActiveTable && hasPreparedRoll && !hasResult;
  const isResultCockpit = hasResult;
  const isFullCockpit = hasActiveTable && hasPreparedRoll && hasResult;

  const screenTopPadding = isVerySmallScreen
    ? layout.insets.top + 2
    : isCompactScreen
      ? layout.insets.top + 4
      : layout.insets.top + theme.spacing.xs;

  /**
   * La scène centrale ne doit pas changer de logique à chaque état.
   * On ajuste seulement des micro-valeurs.
   */
  const cockpitStageJustify: "center" | "space-evenly" =
    isFreeIdleCockpit || isTableIdleCockpit ? "center" : "space-evenly";

  const cockpitStageScale =
    cockpitDensity === "tight" ? 0.965 : isFullCockpit ? 0.985 : 1;

  const cockpitStageTranslateY = isFreeIdleCockpit
    ? cockpitDensity === "tight"
      ? -4
      : -6
    : isTableIdleCockpit
      ? cockpitDensity === "tight"
        ? -5
        : -7
      : isResultCockpit
        ? cockpitDensity === "tight"
          ? -3
          : -2
        : 0;

  const adaptiveContentGap =
    isResultCockpit || hasActiveTable || hasPreparedRoll
      ? baseStageGap
      : baseStageGap + 2;

  const adaptiveResultToDiceOverlap = isFreeIdleCockpit
    ? resultToDiceOverlap
    : isTableIdleCockpit
      ? resultToDiceOverlap - 2
      : isResultCockpit
        ? resultToDiceOverlap - 2
        : resultToDiceOverlap;

  const adaptiveDiceToPreparedOverlap = isFreeIdleCockpit
    ? diceToPreparedOverlap
    : isTableIdleCockpit
      ? diceToPreparedOverlap - 4
      : hasPreparedRoll
        ? diceToPreparedOverlap
        : diceToPreparedOverlap - 2;

  const adaptivePreparedToActionsOverlap = hasActiveTable
    ? preparedToActionsOverlap
    : 0;

  useEffect(() => {
    if (preparedRoll?.source !== "free") return;

    if (!hasPreparedQuickRoll) {
      setPreparedRoll(null);
      setLatestResult(null);
      setShowPreparedEditSheet(false);
    }
  }, [hasPreparedQuickRoll, preparedRoll]);

  const tableSessionMenuItems = useMemo<SessionMenuItem[]>(() => {
    const freeModeItem: SessionMenuItem = {
      id: "free-mode",
      label: "Mode libre",
      description: activeTableId
        ? "Revenir aux jets libres, sans table active."
        : "Tu es déjà en mode libre.",
      icon: "🎲",
      selected: !activeTableId,
      disabled: !activeTableId,
      danger: !!activeTableId,
      onPress: async (): Promise<void> => {
        if (!activeTableId) {
          setShowTableSessionMenu(false);
          return;
        }

        await handleClearActiveSession();
      },
    };

    const loadingItem: SessionMenuItem = {
      id: "loading-tables",
      label: "Chargement des tables…",
      description: "Récupération des tables disponibles.",
      icon: "⌛",
      disabled: true,
      onPress: (): void => {
        return;
      },
    };

    const emptyItem: SessionMenuItem = {
      id: "no-tables",
      label: "Aucune table disponible",
      description: "Crée une table depuis l’écran Tables.",
      icon: "◇",
      disabled: true,
      onPress: (): void => {
        return;
      },
    };

    const tableItems: SessionMenuItem[] = allTables.map(
      (tableRow): SessionMenuItem => {
        const isSelected = tableRow.id === activeTableId;

        return {
          id: tableRow.id,
          label: tableRow.name,
          description: isSelected
            ? "Table actuellement active."
            : tableRow.is_system === 1
              ? "Table système disponible."
              : "Table personnalisée disponible.",
          icon: tableRow.is_system === 1 ? "🏰" : "📘",
          selected: isSelected,
          onPress: async (): Promise<void> => {
            if (isSelected) {
              setShowTableSessionMenu(false);
              return;
            }

            await handleSelectActiveTable(tableRow.id);
          },
        };
      },
    );

    if (loadingTables) {
      return [freeModeItem, loadingItem];
    }

    if (tableItems.length === 0) {
      return [freeModeItem, emptyItem];
    }

    return [freeModeItem, ...tableItems];
  }, [
    activeTableId,
    allTables,
    loadingTables,
    handleClearActiveSession,
    handleSelectActiveTable,
  ]);

  const profileSessionMenuItems = useMemo<SessionMenuItem[]>(
    () =>
      profiles.length > 0
        ? profiles.map(
          (entry): SessionMenuItem => ({
            id: entry.profile.id,
            label: entry.profile.name,
            description:
              entry.profile.id === activeProfile?.id
                ? "Profil actuellement actif."
                : "Activer ce profil pour ses actions rapides.",
            icon: entry.profile.id === activeProfile?.id ? "✦" : "◇",
            selected: entry.profile.id === activeProfile?.id,
            onPress: (): void => {
              animateCockpitLayout();

              setSelectedProfileId(entry.profile.id);
              setShowProfileSessionMenu(false);
            },
          }),
        )
        : [
          {
            id: "no-profile",
            label: "Aucun profil disponible",
            description: "Active une table contenant des profils.",
            icon: "◇",
            disabled: true,
            onPress: (): void => {
              return;
            },
          },
        ],
    [profiles, activeProfile?.id],
  );

  const actionDraftSaveMenuItems: SessionMenuItem[] = [
    {
      id: "update-existing-action",
      label: "Mettre à jour l’action",
      description:
        table?.is_system === 1
          ? "Impossible sur une table système."
          : "Remplace l’action existante par cette version modifiée.",
      icon: "💾",
      disabled: table?.is_system === 1,
      onPress: async (): Promise<void> => {
        await handleUpdateExistingActionFromDraft();
      },
    },
    {
      id: "create-action-copy",
      label: "Créer une copie modifiée",
      description:
        table?.is_system === 1
          ? "Impossible sur une table système."
          : "Crée une nouvelle action sans écraser l’originale.",
      icon: "✦",
      disabled: table?.is_system === 1,
      onPress: (): void => {
        handleOpenCreateActionCopyNameModal();
      },
    },
  ];

  if (error) {
    return (
      <View
        style={[
          styles.screen,
          {
            paddingTop: layout.insets.top + theme.spacing.lg,
            paddingHorizontal: layout.horizontalPadding,
            justifyContent: "center",
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Erreur</Text>
        <Text style={[styles.muted, { marginTop: theme.spacing.sm }]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        ...styles.screen,
        backgroundColor: rollTheme.cockpit.background,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -90,
          right: -90,
          width: 230,
          height: 230,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.magicGlow,
          opacity: 0.16,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -110,
          bottom: 90,
          width: 260,
          height: 260,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.glow,
          opacity: 0.11,
        }}
      />

      <View
        style={{
          flex: 1,
          paddingTop: screenTopPadding,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: theme.spacing.xs,
        }}
      >
        {/* Zone haute fixe */}
        <View
          style={{
            alignSelf: "center",
            width: "100%",
            maxWidth: layout.maxContentWidth,
            zIndex: 10,
          }}
        >
          <SessionBar
            tableName={table?.name ?? null}
            activeProfileName={activeProfile?.name ?? null}
            hasActiveTable={hasActiveTable}
            profileCount={profiles.length}
            onPressTableMenu={() => setShowTableSessionMenu(true)}
            onPressProfileMenu={() => setShowProfileSessionMenu(true)}
          />
        </View>

        {/* Zone centrale dynamique */}
        <View
          style={{
            flex: 1,
            alignSelf: "center",
            width: "100%",
            maxWidth: layout.maxContentWidth,
            justifyContent: cockpitStageJustify,
            paddingTop: cockpitDensity === "tight" ? 0 : 3,
            paddingBottom: cockpitDensity === "tight" ? 8 : 12,
            overflow: "visible",
          }}
        >
          <View
            style={{
              gap: adaptiveContentGap,
              transform: [
                { translateY: cockpitStageTranslateY },
                { scale: cockpitStageScale },
              ],
            }}
          >
            <ResultPanel result={latestResult} />

            <View style={{ marginTop: adaptiveResultToDiceOverlap }}>
              <FreeDicePad
                dice={STANDARD_DICE}
                countsBySides={freeDiceCountsBySides}
                modifierValue={quickModifier}
                onIncrementModifier={handleIncrementQuickModifier}
                onDecrementModifier={handleDecrementQuickModifier}
                onPressDie={handleAddQuickStandardDie}
                onLongPressDie={quickDieBehaviorPicker.open}
              />
            </View>

            <View style={{ marginTop: adaptiveDiceToPreparedOverlap }}>
              <PreparedRollCard
                title={hasPreparedRoll ? (preparedCardName ?? "Jet préparé") : "Jet préparé"}
                name={preparedCardName}
                detail={preparedCardDetail}
                lines={preparedCardLines}
                isEmpty={!hasPreparedRoll}
                onEdit={
                  (preparedRoll?.source === "free" ||
                    preparedRoll?.source === "action_draft") &&
                    hasPreparedRoll
                    ? handleOpenPreparedEdit
                    : undefined
                }
                onAdjustLineQty={
                  (preparedRoll?.source === "free" ||
                    preparedRoll?.source === "action_draft") &&
                    hasPreparedRoll
                    ? handleAdjustPreparedDieQty
                    : undefined
                }
                onAdjustLineModifier={
                  (preparedRoll?.source === "free" ||
                    preparedRoll?.source === "action_draft") &&
                    hasPreparedRoll
                    ? handleAdjustPreparedDieModifier
                    : undefined
                }
                onToggleLineSign={
                  (preparedRoll?.source === "free" ||
                    preparedRoll?.source === "action_draft") &&
                    hasPreparedRoll
                    ? handleTogglePreparedDieSign
                    : undefined
                }
                onRemoveLine={
                  (preparedRoll?.source === "free" ||
                    preparedRoll?.source === "action_draft") &&
                    hasPreparedRoll
                    ? handleRemovePreparedDie
                    : undefined
                }
                onConfigureLineBehavior={
                  (preparedRoll?.source === "free" ||
                    preparedRoll?.source === "action_draft") &&
                    hasPreparedRoll
                    ? handleConfigurePreparedDieBehaviorFromTile
                    : undefined
                }
                onClear={hasPreparedRoll ? handleClearPreparedRoll : undefined}
                onSave={
                  (preparedRoll?.source === "free" ||
                    preparedRoll?.source === "action_draft") &&
                    hasPreparedRoll
                    ? handleOpenPreparedSave
                    : undefined
                }
              />
              {showPreparedAddDicePicker ? (
                <View
                  style={{
                    marginTop: 8,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: "rgba(217, 160, 55, 0.34)",
                    backgroundColor: "rgba(13, 19, 43, 0.86)",
                    padding: 10,
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.textSubtle,
                      fontSize: 10,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Ajouter une ligne de dés
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {STANDARD_DICE.map((sides) => (
                      <Pressable
                        key={`prepared-add-d${sides}`}
                        onPress={() => handleAddPreparedDieLine(sides)}
                        style={({ pressed }) => ({
                          minWidth: 52,
                          minHeight: 42,
                          borderRadius: theme.radius.pill,
                          borderWidth: 1,
                          borderColor: pressed
                            ? theme.colors.accent
                            : "rgba(145, 113, 255, 0.22)",
                          backgroundColor: pressed
                            ? "rgba(217, 160, 55, 0.18)"
                            : "rgba(32, 41, 88, 0.52)",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: pressed ? 0.86 : 1,
                          transform: [{ scale: pressed ? 0.96 : 1 }],
                        })}
                      >
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontSize: 13,
                            fontWeight: "900",
                          }}
                        >
                          d{sides}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>

            {hasActiveTable ? (
              <View style={{ marginTop: adaptivePreparedToActionsOverlap }}>
                <ActionRail
                  profileName={activeProfile?.name ?? null}
                  actions={actionRailItems}
                  selectedActionId={
                    preparedRoll?.source === "action"
                      ? preparedRoll.groupId
                      : null
                  }
                  onPrepareAction={handlePrepareSavedAction}
                />
              </View>
            ) : null}
          </View>
        </View>

        {/* Zone basse fixe */}
        <View
          style={{
            alignSelf: "center",
            width: "100%",
            maxWidth: layout.maxContentWidth,
            zIndex: 10,
            paddingTop: isVerySmallScreen ? 2 : 4,
          }}
        >
          <StickyRollButton
            disabled={!hasPreparedRoll}
            onPress={handleRollPrepared}
          />
        </View>
      </View>

      {showAdvanced ? (
        <View
          style={{
            position: "absolute",
            left: layout.horizontalPadding,
            right: layout.horizontalPadding,
            top: screenTopPadding + 72,
            bottom: theme.spacing.md,
            zIndex: 50,
            borderRadius: rollTheme.layout.cockpitRadius,
            backgroundColor: "rgba(7, 12, 31, 0.96)",
            borderWidth: 1,
            borderColor: "rgba(145, 113, 255, 0.24)",
            overflow: "hidden",
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: theme.spacing.md,
            }}
          >
            <QuickRollSection
              simplified={true}
              hideInternalRollControls={true}
              hideDicePicker={true}
              hideStandardQuickGroup={true}
              title="Action temporaire"
              standardDice={STANDARD_DICE}
              draftGroups={draftGroups}
              draftResults={draftResults}
              selectedDraftGroupId={selectedDraftGroupId}
              tableIsSystem={table?.is_system === 1}
              showSaveOptions={showSaveOptions}
              showAdvanced={showAdvanced}
              onToggleSaveOptions={() => setShowSaveOptions((v) => !v)}
              onToggleAdvanced={() => setShowAdvanced((v) => !v)}
              onAddDraftGroup={addDraftGroup}
              onAddQuickStandardDie={handleAddQuickStandardDie}
              onSelectDraftGroup={setSelectedDraftGroupId}
              onRenameDraftGroup={openRenameDraftGroupModal}
              onEditDraftGroupRule={openDraftGroupRuleEditor}
              onRemoveDraftGroup={removeDraftGroup}
              onEditDraftDie={openDraftEditor}
              onOpenDieConfig={quickDieBehaviorPicker.open}
              onRemoveDraftDie={removeDraftDie}
              onRollDraft={rollDraft}
              onRollQuickGroup={rollSingleDraftGroup}
              onClearQuickGroup={clearDraftGroup}
              onClearDraft={handleClearQuickRoll}
              onReplaceCurrentTable={replaceCurrentTable}
              onCreateNewTable={handleOpenSaveDraftModal}
              availableRules={availableRules}
              onAdjustQuickDieQty={adjustDraftDieQty}
            />
          </ScrollView>
        </View>
      ) : null}

      <RollModals
        draftGroups={draftGroups}
        editingDraftGroupId={editingDraftGroupId}
        editingDraftIndex={editingDraftIndex}
        draftEditSign={draftEditSign}
        draftEditSides={draftEditSides}
        draftEditQty={draftEditQty}
        draftEditModifier={draftEditModifier}
        draftEditRuleId={draftEditRuleId}
        modernRules={modernRules}
        legacyRules={legacyRules}
        onChangeSign={setDraftEditSign}
        onChangeSides={setDraftEditSides}
        onChangeQty={setDraftEditQty}
        onChangeModifier={setDraftEditModifier}
        onChangeRuleId={setDraftEditRuleId}
        onCancelDraftEditor={resetDraftEditorState}
        onSaveDraftEditor={saveDraftEditor}
        showDraftGroupRuleModal={showDraftGroupRuleModal}
        draftGroupRuleSelection={draftGroupRuleSelection}
        onSelectDraftGroupRule={setDraftGroupRuleSelection}
        onCancelDraftGroupRule={closeDraftGroupRuleModal}
        onSaveDraftGroupRule={saveDraftGroupRuleEditor}
        showRenameDraftGroupModal={showRenameDraftGroupModal}
        renameDraftGroupValue={renameDraftGroupValue}
        onChangeRenameDraftGroupValue={setRenameDraftGroupValue}
        onCancelRenameDraftGroup={closeRenameDraftGroupModal}
        onSaveRenameDraftGroup={saveRenameDraftGroup}
        showNameModal={showNameModal}
        newTableName={newTableName}
        newProfileName={newProfileName}
        availableSaveTargets={availableSaveTargets}
        loadingSaveTargets={loadingSaveTargets}
        onCancelNewTable={closeCreateTableModal}
        onSaveDraftTarget={handleSaveDraftTarget}
      />

      <SessionMenuModal
        visible={showTableSessionMenu}
        title="Table de session"
        subtitle="Choisis le contexte actif du jet."
        items={tableSessionMenuItems}
        onClose={() => setShowTableSessionMenu(false)}
      />

      <SessionMenuModal
        visible={showProfileSessionMenu}
        title="Profil actif"
        subtitle="Choisis le profil utilisé pour les actions rapides."
        items={profileSessionMenuItems}
        onClose={() => setShowProfileSessionMenu(false)}
      />

      <SessionMenuModal
        visible={showActionDraftSaveMenu}
        title="Sauvegarder l’action"
        subtitle="Choisis comment conserver cette version modifiée."
        items={actionDraftSaveMenuItems}
        onClose={() => setShowActionDraftSaveMenu(false)}
      />

      {showActionCopyNameModal ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.72)",
            justifyContent: "center",
            padding: 18,
            zIndex: 90,
          }}
        >
          <View
            style={{
              borderRadius: rollTheme.layout.cockpitRadius,
              borderWidth: 1,
              borderColor: "rgba(217, 160, 55, 0.7)",
              backgroundColor: rollTheme.cockpit.panel,
              padding: theme.spacing.md,
              gap: theme.spacing.md,
              overflow: "hidden",
              ...theme.shadow.card,
            }}
          >
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: -70,
                right: -60,
                width: 170,
                height: 170,
                borderRadius: 999,
                backgroundColor: rollTheme.cockpit.glow,
                opacity: 0.16,
              }}
            />

            <View style={{ gap: theme.spacing.xs }}>
              <Text
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: theme.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.9,
                }}
              >
                ✦ Nouvelle action
              </Text>

              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 22,
                  fontWeight: "900",
                  letterSpacing: -0.3,
                }}
              >
                Nommer la copie
              </Text>

              <Text
                style={{
                  color: theme.colors.textMuted,
                  lineHeight: 20,
                  fontWeight: "600",
                }}
              >
                Cette copie sera ajoutée au profil actif sans modifier l’action
                d’origine.
              </Text>
            </View>

            <TextInput
              value={actionCopyName}
              onChangeText={setActionCopyName}
              placeholder="Nom de la nouvelle action"
              placeholderTextColor={theme.colors.textSubtle}
              selectionColor={theme.colors.accent}
              autoFocus
              style={{
                minHeight: 52,
                color: theme.colors.text,
                backgroundColor: rollTheme.cockpit.panelAlt,
                borderWidth: 1,
                borderColor: rollTheme.cockpit.borderSoft,
                borderRadius: theme.radius.lg,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 17,
                fontWeight: "800",
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: theme.spacing.sm,
              }}
            >
              <Pressable
                onPress={() => {
                  setShowActionCopyNameModal(false);
                  setActionCopyName("");
                }}
                style={({ pressed }) => ({
                  paddingVertical: 11,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: rollTheme.cockpit.borderSoft,
                  borderRadius: theme.radius.pill,
                  backgroundColor: pressed
                    ? theme.colors.surfaceSoft
                    : rollTheme.cockpit.panelAlt,
                  opacity: pressed ? 0.84 : 1,
                })}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                  }}
                >
                  Annuler
                </Text>
              </Pressable>

              <Pressable
                onPress={handleCreateActionCopyFromDraft}
                disabled={actionCopyName.trim().length === 0}
                style={({ pressed }) => ({
                  paddingVertical: 11,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor:
                    actionCopyName.trim().length === 0
                      ? rollTheme.cockpit.borderSoft
                      : theme.colors.accent,
                  borderRadius: theme.radius.pill,
                  backgroundColor:
                    actionCopyName.trim().length === 0
                      ? "rgba(32, 41, 88, 0.36)"
                      : pressed
                        ? "rgba(217, 160, 55, 0.2)"
                        : theme.colors.accentSoft,
                  opacity: pressed
                    ? 0.84
                    : actionCopyName.trim().length === 0
                      ? 0.5
                      : 1,
                })}
              >
                <Text
                  style={{
                    color:
                      actionCopyName.trim().length === 0
                        ? theme.colors.textSubtle
                        : theme.colors.accent,
                    fontWeight: "900",
                  }}
                >
                  Créer la copie
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {!showPreparedEditSheet ? (
        <QuickDieBehaviorPickerModal
          visible={quickDieBehaviorPicker.visible}
          editingDieSides={quickDieBehaviorPicker.editingDieSides}
          behaviors={quickDieBehaviorPicker.behaviors}
          getDefinition={quickDieBehaviorPicker.getDefinition}
          onSelectBehavior={quickDieBehaviorPicker.select}
          onClose={() => {
            setDraftBehaviorTarget(null);
            setPreparedBehaviorTargetIndex(null);
            quickDieBehaviorPicker.close();
          }}
        />
      ) : null}

      {!showPreparedEditSheet ? (
        <QuickBehaviorConfigModal
          visible={quickBehaviorConfig.visible}
          pendingBehaviorKey={quickBehaviorConfig.pendingBehaviorKey}
          pendingBehaviorLabel={quickBehaviorConfig.pendingBehaviorLabel}
          pendingConfigVariant={quickBehaviorConfig.pendingConfigVariant}
          keepDropMode={quickBehaviorConfig.keepDropMode}
          keepDropTarget={quickBehaviorConfig.keepDropTarget}
          keepDropCount={quickBehaviorConfig.keepDropCount}
          onChangeKeepDropMode={quickBehaviorConfig.setKeepDropMode}
          onChangeKeepDropTarget={quickBehaviorConfig.setKeepDropTarget}
          onChangeKeepDropCount={quickBehaviorConfig.setKeepDropCount}
          configKeepCount={quickBehaviorConfig.configKeepCount}
          configDropCount={quickBehaviorConfig.configDropCount}
          configResultMode={quickBehaviorConfig.configResultMode}
          configCompare={quickBehaviorConfig.configCompare}
          configSuccessThreshold={quickBehaviorConfig.configSuccessThreshold}
          configCritSuccessFaces={quickBehaviorConfig.configCritSuccessFaces}
          configCritFailureFaces={quickBehaviorConfig.configCritFailureFaces}
          configTargetValue={quickBehaviorConfig.configTargetValue}
          configDegreeStep={quickBehaviorConfig.configDegreeStep}
          configCritSuccessMin={quickBehaviorConfig.configCritSuccessMin}
          configCritSuccessMax={quickBehaviorConfig.configCritSuccessMax}
          configCritFailureMin={quickBehaviorConfig.configCritFailureMin}
          configCritFailureMax={quickBehaviorConfig.configCritFailureMax}
          onChangeTargetValue={quickBehaviorConfig.setConfigTargetValue}
          onChangeDegreeStep={quickBehaviorConfig.setConfigDegreeStep}
          onChangeCritSuccessMin={quickBehaviorConfig.setConfigCritSuccessMin}
          onChangeCritSuccessMax={quickBehaviorConfig.setConfigCritSuccessMax}
          onChangeCritFailureMin={quickBehaviorConfig.setConfigCritFailureMin}
          onChangeCritFailureMax={quickBehaviorConfig.setConfigCritFailureMax}
          configSuccessAtOrAbove={quickBehaviorConfig.configSuccessAtOrAbove}
          configFailFaces={quickBehaviorConfig.configFailFaces}
          configGlitchRule={quickBehaviorConfig.configGlitchRule}
          configCriticalFailureRule={
            quickBehaviorConfig.configCriticalFailureRule
          }
          configCriticalSuccessRule={
            quickBehaviorConfig.configCriticalSuccessRule
          }
          configCriticalSuccessThreshold={
            quickBehaviorConfig.configCriticalSuccessThreshold
          }
          configCriticalSuccessFaces={
            quickBehaviorConfig.configCriticalSuccessFaces
          }
          configRanges={quickBehaviorConfig.configRanges}
          onChangeKeepCount={quickBehaviorConfig.setConfigKeepCount}
          onChangeDropCount={quickBehaviorConfig.setConfigDropCount}
          onChangeResultMode={quickBehaviorConfig.setConfigResultMode}
          onChangeCompare={quickBehaviorConfig.setConfigCompare}
          onChangeSuccessThreshold={
            quickBehaviorConfig.setConfigSuccessThreshold
          }
          onChangeCritSuccessFaces={
            quickBehaviorConfig.setConfigCritSuccessFaces
          }
          onChangeCritFailureFaces={
            quickBehaviorConfig.setConfigCritFailureFaces
          }
          onChangeSuccessAtOrAbove={
            quickBehaviorConfig.setConfigSuccessAtOrAbove
          }
          onChangeFailFaces={quickBehaviorConfig.setConfigFailFaces}
          onChangeGlitchRule={quickBehaviorConfig.setConfigGlitchRule}
          onChangeCriticalFailureRule={
            quickBehaviorConfig.setConfigCriticalFailureRule
          }
          onChangeCriticalSuccessRule={
            quickBehaviorConfig.setConfigCriticalSuccessRule
          }
          onChangeCriticalSuccessThreshold={
            quickBehaviorConfig.setConfigCriticalSuccessThreshold
          }
          onChangeCriticalSuccessFaces={
            quickBehaviorConfig.setConfigCriticalSuccessFaces
          }
          onUpdateRange={quickBehaviorConfig.updateRange}
          onAddRange={quickBehaviorConfig.addRange}
          onRemoveRange={quickBehaviorConfig.removeRange}
          onClose={() => {
            setDraftBehaviorTarget(null);
            quickBehaviorConfig.close();
          }}
          onConfirm={handleConfirmBehaviorConfig}
          pipelineRerollFaces={quickBehaviorConfig.pipelineRerollFaces}
          pipelineRerollOnce={quickBehaviorConfig.pipelineRerollOnce}
          pipelineExplodeFaces={quickBehaviorConfig.pipelineExplodeFaces}
          pipelineMaxRerolls={quickBehaviorConfig.pipelineMaxRerolls}
          pipelineMaxExplosions={quickBehaviorConfig.pipelineMaxExplosions}
          pipelineKeepHighest={quickBehaviorConfig.pipelineKeepHighest}
          pipelineKeepLowest={quickBehaviorConfig.pipelineKeepLowest}
          pipelineDropHighest={quickBehaviorConfig.pipelineDropHighest}
          pipelineDropLowest={quickBehaviorConfig.pipelineDropLowest}
          pipelineCountSuccessAtOrAbove={
            quickBehaviorConfig.pipelineCountSuccessAtOrAbove
          }
          pipelineCountEqualFaces={quickBehaviorConfig.pipelineCountEqualFaces}
          pipelineCountRangeMin={quickBehaviorConfig.pipelineCountRangeMin}
          pipelineCountRangeMax={quickBehaviorConfig.pipelineCountRangeMax}
          pipelineOutput={quickBehaviorConfig.pipelineOutput}
          pipelineSuccessThreshold={
            quickBehaviorConfig.pipelineSuccessThreshold
          }
          pipelineCompare={quickBehaviorConfig.pipelineCompare}
          pipelineCritSuccessFaces={
            quickBehaviorConfig.pipelineCritSuccessFaces
          }
          pipelineCritFailureFaces={
            quickBehaviorConfig.pipelineCritFailureFaces
          }
          pipelineComplicationFaces={
            quickBehaviorConfig.pipelineComplicationFaces
          }
          pipelineComplicationRule={
            quickBehaviorConfig.pipelineComplicationRule
          }
          pipelineCriticalFailureRule={
            quickBehaviorConfig.pipelineCriticalFailureRule
          }
          pipelineCriticalSuccessRule={
            quickBehaviorConfig.pipelineCriticalSuccessRule
          }
          pipelineCriticalSuccessThreshold={
            quickBehaviorConfig.pipelineCriticalSuccessThreshold
          }
          pipelineCriticalSuccessFaces={
            quickBehaviorConfig.pipelineCriticalSuccessFaces
          }
          pipelineDegreeTarget={quickBehaviorConfig.pipelineDegreeTarget}
          pipelineDegreeCompare={quickBehaviorConfig.pipelineDegreeCompare}
          pipelineDegreeStep={quickBehaviorConfig.pipelineDegreeStep}
          pipelineDegreeCritSuccessMin={
            quickBehaviorConfig.pipelineDegreeCritSuccessMin
          }
          pipelineDegreeCritSuccessMax={
            quickBehaviorConfig.pipelineDegreeCritSuccessMax
          }
          pipelineDegreeCritFailureMin={
            quickBehaviorConfig.pipelineDegreeCritFailureMin
          }
          pipelineDegreeCritFailureMax={
            quickBehaviorConfig.pipelineDegreeCritFailureMax
          }
          onChangePipelineRerollFaces={
            quickBehaviorConfig.setPipelineRerollFaces
          }
          onChangePipelineRerollOnce={quickBehaviorConfig.setPipelineRerollOnce}
          onChangePipelineExplodeFaces={
            quickBehaviorConfig.setPipelineExplodeFaces
          }
          onChangePipelineMaxRerolls={quickBehaviorConfig.setPipelineMaxRerolls}
          onChangePipelineMaxExplosions={
            quickBehaviorConfig.setPipelineMaxExplosions
          }
          onChangePipelineKeepHighest={
            quickBehaviorConfig.setPipelineKeepHighest
          }
          onChangePipelineKeepLowest={quickBehaviorConfig.setPipelineKeepLowest}
          onChangePipelineDropHighest={
            quickBehaviorConfig.setPipelineDropHighest
          }
          onChangePipelineDropLowest={quickBehaviorConfig.setPipelineDropLowest}
          onChangePipelineCountSuccessAtOrAbove={
            quickBehaviorConfig.setPipelineCountSuccessAtOrAbove
          }
          onChangePipelineCountEqualFaces={
            quickBehaviorConfig.setPipelineCountEqualFaces
          }
          onChangePipelineCountRangeMin={
            quickBehaviorConfig.setPipelineCountRangeMin
          }
          onChangePipelineCountRangeMax={
            quickBehaviorConfig.setPipelineCountRangeMax
          }
          onChangePipelineOutput={quickBehaviorConfig.setPipelineOutput}
          onChangePipelineSuccessThreshold={
            quickBehaviorConfig.setPipelineSuccessThreshold
          }
          onChangePipelineCompare={quickBehaviorConfig.setPipelineCompare}
          onChangePipelineCritSuccessFaces={
            quickBehaviorConfig.setPipelineCritSuccessFaces
          }
          onChangePipelineCritFailureFaces={
            quickBehaviorConfig.setPipelineCritFailureFaces
          }
          onChangePipelineComplicationFaces={
            quickBehaviorConfig.setPipelineComplicationFaces
          }
          onChangePipelineComplicationRule={
            quickBehaviorConfig.setPipelineComplicationRule
          }
          onChangePipelineCriticalFailureRule={
            quickBehaviorConfig.setPipelineCriticalFailureRule
          }
          onChangePipelineCriticalSuccessRule={
            quickBehaviorConfig.setPipelineCriticalSuccessRule
          }
          onChangePipelineCriticalSuccessThreshold={
            quickBehaviorConfig.setPipelineCriticalSuccessThreshold
          }
          onChangePipelineCriticalSuccessFaces={
            quickBehaviorConfig.setPipelineCriticalSuccessFaces
          }
          onChangePipelineDegreeTarget={
            quickBehaviorConfig.setPipelineDegreeTarget
          }
          onChangePipelineDegreeCompare={
            quickBehaviorConfig.setPipelineDegreeCompare
          }
          onChangePipelineDegreeStep={quickBehaviorConfig.setPipelineDegreeStep}
          onChangePipelineDegreeCritSuccessMin={
            quickBehaviorConfig.setPipelineDegreeCritSuccessMin
          }
          onChangePipelineDegreeCritSuccessMax={
            quickBehaviorConfig.setPipelineDegreeCritSuccessMax
          }
          onChangePipelineDegreeCritFailureMin={
            quickBehaviorConfig.setPipelineDegreeCritFailureMin
          }
          onChangePipelineDegreeCritFailureMax={
            quickBehaviorConfig.setPipelineDegreeCritFailureMax
          }
        />
      ) : null}

      <PreparedRollEditSheet
        visible={showPreparedEditSheet}
        title={
          preparedEditMode === "behavior_picker"
            ? "Choisir un comportement"
            : preparedEditMode === "behavior_config"
              ? "Configurer le comportement"
              : preparedRoll?.source === "action_draft"
                ? "Modifier l’action"
                : "Modifier le jet libre"
        }
        mode={preparedEditMode}
        nameValue={editablePreparedDraftGroup?.name ?? ""}
        onChangeNameValue={handleChangePreparedRollName}
        dice={preparedQuickEditDice}
        behaviorPickerData={{
          targetDieIndex: preparedBehaviorTargetIndex,
          targetDieSides: quickDieBehaviorPicker.editingDieSides,
          behaviors: quickDieBehaviorPicker.behaviors,
          getDefinition: quickDieBehaviorPicker.getDefinition,
          onSelectBehavior: (option) => {
            const needsConfig =
              option.variant === "keep_drop" ||
              behaviorNeedsSelectionConfig(option.behaviorKey);

            quickDieBehaviorPicker.select(option);

            if (needsConfig) {
              setPreparedEditMode("behavior_config");
              return;
            }

            setPreparedEditMode("dice");
          },
          onBack: () => {
            const shouldReturnToMainScreen = preparedBehaviorFlowOrigin === "tile";

            setPreparedEditMode("dice");
            setPreparedBehaviorTargetIndex(null);
            setDraftBehaviorTarget(null);
            setPreparedBehaviorFlowOrigin(null);

            quickDieBehaviorPicker.close();
            quickBehaviorConfig.close();

            if (shouldReturnToMainScreen) {
              setShowPreparedEditSheet(false);
            }
          },
        }}
        behaviorConfigPanel={
          <QuickBehaviorConfigModal
            presentation="inline"
            visible={
              preparedEditMode === "behavior_config" &&
              quickBehaviorConfig.visible
            }
            pendingBehaviorKey={quickBehaviorConfig.pendingBehaviorKey}
            pendingBehaviorLabel={quickBehaviorConfig.pendingBehaviorLabel}
            pendingConfigVariant={quickBehaviorConfig.pendingConfigVariant}
            keepDropMode={quickBehaviorConfig.keepDropMode}
            keepDropTarget={quickBehaviorConfig.keepDropTarget}
            keepDropCount={quickBehaviorConfig.keepDropCount}
            onChangeKeepDropMode={quickBehaviorConfig.setKeepDropMode}
            onChangeKeepDropTarget={quickBehaviorConfig.setKeepDropTarget}
            onChangeKeepDropCount={quickBehaviorConfig.setKeepDropCount}
            configKeepCount={quickBehaviorConfig.configKeepCount}
            configDropCount={quickBehaviorConfig.configDropCount}
            configResultMode={quickBehaviorConfig.configResultMode}
            configCompare={quickBehaviorConfig.configCompare}
            configSuccessThreshold={quickBehaviorConfig.configSuccessThreshold}
            configCritSuccessFaces={quickBehaviorConfig.configCritSuccessFaces}
            configCritFailureFaces={quickBehaviorConfig.configCritFailureFaces}
            configTargetValue={quickBehaviorConfig.configTargetValue}
            configDegreeStep={quickBehaviorConfig.configDegreeStep}
            configCritSuccessMin={quickBehaviorConfig.configCritSuccessMin}
            configCritSuccessMax={quickBehaviorConfig.configCritSuccessMax}
            configCritFailureMin={quickBehaviorConfig.configCritFailureMin}
            configCritFailureMax={quickBehaviorConfig.configCritFailureMax}
            onChangeTargetValue={quickBehaviorConfig.setConfigTargetValue}
            onChangeDegreeStep={quickBehaviorConfig.setConfigDegreeStep}
            onChangeCritSuccessMin={quickBehaviorConfig.setConfigCritSuccessMin}
            onChangeCritSuccessMax={quickBehaviorConfig.setConfigCritSuccessMax}
            onChangeCritFailureMin={quickBehaviorConfig.setConfigCritFailureMin}
            onChangeCritFailureMax={quickBehaviorConfig.setConfigCritFailureMax}
            configSuccessAtOrAbove={quickBehaviorConfig.configSuccessAtOrAbove}
            configFailFaces={quickBehaviorConfig.configFailFaces}
            configGlitchRule={quickBehaviorConfig.configGlitchRule}
            configCriticalFailureRule={
              quickBehaviorConfig.configCriticalFailureRule
            }
            configCriticalSuccessRule={
              quickBehaviorConfig.configCriticalSuccessRule
            }
            configCriticalSuccessThreshold={
              quickBehaviorConfig.configCriticalSuccessThreshold
            }
            configCriticalSuccessFaces={
              quickBehaviorConfig.configCriticalSuccessFaces
            }
            configRanges={quickBehaviorConfig.configRanges}
            onChangeKeepCount={quickBehaviorConfig.setConfigKeepCount}
            onChangeDropCount={quickBehaviorConfig.setConfigDropCount}
            onChangeResultMode={quickBehaviorConfig.setConfigResultMode}
            onChangeCompare={quickBehaviorConfig.setConfigCompare}
            onChangeSuccessThreshold={
              quickBehaviorConfig.setConfigSuccessThreshold
            }
            onChangeCritSuccessFaces={
              quickBehaviorConfig.setConfigCritSuccessFaces
            }
            onChangeCritFailureFaces={
              quickBehaviorConfig.setConfigCritFailureFaces
            }
            onChangeSuccessAtOrAbove={
              quickBehaviorConfig.setConfigSuccessAtOrAbove
            }
            onChangeFailFaces={quickBehaviorConfig.setConfigFailFaces}
            onChangeGlitchRule={quickBehaviorConfig.setConfigGlitchRule}
            onChangeCriticalFailureRule={
              quickBehaviorConfig.setConfigCriticalFailureRule
            }
            onChangeCriticalSuccessRule={
              quickBehaviorConfig.setConfigCriticalSuccessRule
            }
            onChangeCriticalSuccessThreshold={
              quickBehaviorConfig.setConfigCriticalSuccessThreshold
            }
            onChangeCriticalSuccessFaces={
              quickBehaviorConfig.setConfigCriticalSuccessFaces
            }
            onUpdateRange={quickBehaviorConfig.updateRange}
            onAddRange={quickBehaviorConfig.addRange}
            onRemoveRange={quickBehaviorConfig.removeRange}
            onClose={() => {
              const shouldReturnToMainScreen = preparedBehaviorFlowOrigin === "tile";

              quickBehaviorConfig.close();

              if (shouldReturnToMainScreen) {
                setPreparedEditMode("dice");
                setPreparedBehaviorTargetIndex(null);
                setDraftBehaviorTarget(null);
                setPreparedBehaviorFlowOrigin(null);
                setShowPreparedEditSheet(false);
                return;
              }

              setPreparedEditMode("behavior_picker");
            }}
            onConfirm={handleConfirmBehaviorConfig}
            pipelineRerollFaces={quickBehaviorConfig.pipelineRerollFaces}
            pipelineRerollOnce={quickBehaviorConfig.pipelineRerollOnce}
            pipelineExplodeFaces={quickBehaviorConfig.pipelineExplodeFaces}
            pipelineMaxRerolls={quickBehaviorConfig.pipelineMaxRerolls}
            pipelineMaxExplosions={quickBehaviorConfig.pipelineMaxExplosions}
            pipelineKeepHighest={quickBehaviorConfig.pipelineKeepHighest}
            pipelineKeepLowest={quickBehaviorConfig.pipelineKeepLowest}
            pipelineDropHighest={quickBehaviorConfig.pipelineDropHighest}
            pipelineDropLowest={quickBehaviorConfig.pipelineDropLowest}
            pipelineCountSuccessAtOrAbove={
              quickBehaviorConfig.pipelineCountSuccessAtOrAbove
            }
            pipelineCountEqualFaces={
              quickBehaviorConfig.pipelineCountEqualFaces
            }
            pipelineCountRangeMin={quickBehaviorConfig.pipelineCountRangeMin}
            pipelineCountRangeMax={quickBehaviorConfig.pipelineCountRangeMax}
            pipelineOutput={quickBehaviorConfig.pipelineOutput}
            pipelineSuccessThreshold={
              quickBehaviorConfig.pipelineSuccessThreshold
            }
            pipelineCompare={quickBehaviorConfig.pipelineCompare}
            pipelineCritSuccessFaces={
              quickBehaviorConfig.pipelineCritSuccessFaces
            }
            pipelineCritFailureFaces={
              quickBehaviorConfig.pipelineCritFailureFaces
            }
            pipelineComplicationFaces={
              quickBehaviorConfig.pipelineComplicationFaces
            }
            pipelineComplicationRule={
              quickBehaviorConfig.pipelineComplicationRule
            }
            pipelineCriticalFailureRule={
              quickBehaviorConfig.pipelineCriticalFailureRule
            }
            pipelineCriticalSuccessRule={
              quickBehaviorConfig.pipelineCriticalSuccessRule
            }
            pipelineCriticalSuccessThreshold={
              quickBehaviorConfig.pipelineCriticalSuccessThreshold
            }
            pipelineCriticalSuccessFaces={
              quickBehaviorConfig.pipelineCriticalSuccessFaces
            }
            pipelineDegreeTarget={quickBehaviorConfig.pipelineDegreeTarget}
            pipelineDegreeCompare={quickBehaviorConfig.pipelineDegreeCompare}
            pipelineDegreeStep={quickBehaviorConfig.pipelineDegreeStep}
            pipelineDegreeCritSuccessMin={
              quickBehaviorConfig.pipelineDegreeCritSuccessMin
            }
            pipelineDegreeCritSuccessMax={
              quickBehaviorConfig.pipelineDegreeCritSuccessMax
            }
            pipelineDegreeCritFailureMin={
              quickBehaviorConfig.pipelineDegreeCritFailureMin
            }
            pipelineDegreeCritFailureMax={
              quickBehaviorConfig.pipelineDegreeCritFailureMax
            }
            onChangePipelineRerollFaces={
              quickBehaviorConfig.setPipelineRerollFaces
            }
            onChangePipelineRerollOnce={
              quickBehaviorConfig.setPipelineRerollOnce
            }
            onChangePipelineExplodeFaces={
              quickBehaviorConfig.setPipelineExplodeFaces
            }
            onChangePipelineMaxRerolls={
              quickBehaviorConfig.setPipelineMaxRerolls
            }
            onChangePipelineMaxExplosions={
              quickBehaviorConfig.setPipelineMaxExplosions
            }
            onChangePipelineKeepHighest={
              quickBehaviorConfig.setPipelineKeepHighest
            }
            onChangePipelineKeepLowest={
              quickBehaviorConfig.setPipelineKeepLowest
            }
            onChangePipelineDropHighest={
              quickBehaviorConfig.setPipelineDropHighest
            }
            onChangePipelineDropLowest={
              quickBehaviorConfig.setPipelineDropLowest
            }
            onChangePipelineCountSuccessAtOrAbove={
              quickBehaviorConfig.setPipelineCountSuccessAtOrAbove
            }
            onChangePipelineCountEqualFaces={
              quickBehaviorConfig.setPipelineCountEqualFaces
            }
            onChangePipelineCountRangeMin={
              quickBehaviorConfig.setPipelineCountRangeMin
            }
            onChangePipelineCountRangeMax={
              quickBehaviorConfig.setPipelineCountRangeMax
            }
            onChangePipelineOutput={quickBehaviorConfig.setPipelineOutput}
            onChangePipelineSuccessThreshold={
              quickBehaviorConfig.setPipelineSuccessThreshold
            }
            onChangePipelineCompare={quickBehaviorConfig.setPipelineCompare}
            onChangePipelineCritSuccessFaces={
              quickBehaviorConfig.setPipelineCritSuccessFaces
            }
            onChangePipelineCritFailureFaces={
              quickBehaviorConfig.setPipelineCritFailureFaces
            }
            onChangePipelineComplicationFaces={
              quickBehaviorConfig.setPipelineComplicationFaces
            }
            onChangePipelineComplicationRule={
              quickBehaviorConfig.setPipelineComplicationRule
            }
            onChangePipelineCriticalFailureRule={
              quickBehaviorConfig.setPipelineCriticalFailureRule
            }
            onChangePipelineCriticalSuccessRule={
              quickBehaviorConfig.setPipelineCriticalSuccessRule
            }
            onChangePipelineCriticalSuccessThreshold={
              quickBehaviorConfig.setPipelineCriticalSuccessThreshold
            }
            onChangePipelineCriticalSuccessFaces={
              quickBehaviorConfig.setPipelineCriticalSuccessFaces
            }
            onChangePipelineDegreeTarget={
              quickBehaviorConfig.setPipelineDegreeTarget
            }
            onChangePipelineDegreeCompare={
              quickBehaviorConfig.setPipelineDegreeCompare
            }
            onChangePipelineDegreeStep={
              quickBehaviorConfig.setPipelineDegreeStep
            }
            onChangePipelineDegreeCritSuccessMin={
              quickBehaviorConfig.setPipelineDegreeCritSuccessMin
            }
            onChangePipelineDegreeCritSuccessMax={
              quickBehaviorConfig.setPipelineDegreeCritSuccessMax
            }
            onChangePipelineDegreeCritFailureMin={
              quickBehaviorConfig.setPipelineDegreeCritFailureMin
            }
            onChangePipelineDegreeCritFailureMax={
              quickBehaviorConfig.setPipelineDegreeCritFailureMax
            }
          />
        }
        onClose={handleClosePreparedEdit}
        onAdjustDieQty={handleAdjustPreparedDieQty}
        onAdjustDieModifier={handleAdjustPreparedDieModifier}
        onToggleDieSign={handleTogglePreparedDieSign}
        onRemoveDie={handleRemovePreparedDie}
        onConfigureDieBehavior={handleConfigurePreparedDieBehaviorFromGlobal}
        onClearDieBehavior={handleClearPreparedDieBehavior}
      />
    </View>
  );
}
