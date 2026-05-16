// dice-universal\screens\RollScreen.tsx

import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";

import { useDataRefresh } from "../data/state/DataRefreshProvider";

import {
  listTables,
  type TableRow,
} from "../data/repositories/tablesRepo";

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
import { QuickQtyModal } from "../features/roll/components/QuickQtyModal";
import { QuickDieBehaviorPickerModal } from "../features/roll/components/QuickDieBehaviorPickerModal";
import { useQuickBehaviorConfigModal } from "../features/roll/hooks/useQuickBehaviorConfigModal";
import { useQuickQtyModal } from "../features/roll/hooks/useQuickQtyModal";
import { useQuickDieBehaviorPicker } from "../features/roll/hooks/useQuickDieBehaviorPicker";
import {
  formatDraftGroupDiceLabel,
  formatSavedActionDetail,
  getDraftGroupBehaviorSummary,
  getRuleSummaryFromRuleId,
  getRuleSummaryFromTempRule,
  type DraftGroupSummary,
} from "../features/roll/helpers/rollDisplaySummary";

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
  };

export default function RollScreen() {
  const layout = useArcaneLayout();
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const { height: windowHeight } = useWindowDimensions();

  const isVerySmallScreen = windowHeight < 760;
  const isCompactScreen = windowHeight < 820;

  const compactSpacing = layout.isSmallHeight ? 4 : 6;

  const resultToDiceOverlap = layout.isSmallHeight ? -18 : -14;
  const diceToPreparedOverlap = layout.isSmallHeight ? -24 : -20;
  const preparedToActionsOverlap = layout.isSmallHeight ? -10 : -8;

  const advancedSpacing = layout.isSmallHeight
    ? theme.spacing.sm
    : theme.spacing.md;

  const [preparedRoll, setPreparedRoll] = useState<PreparedRoll | null>(null);
  const [latestResult, setLatestResult] = useState<GroupRollResult | null>(
    null,
  );
  const [showPreparedEditSheet, setShowPreparedEditSheet] = useState(false);
  const [showTableSessionMenu, setShowTableSessionMenu] = useState(false);
  const [showProfileSessionMenu, setShowProfileSessionMenu] = useState(false);
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
    getNonEmptyDraftGroups,

    addDraftGroup,
    // addDieToDraft,
    addQuickStandardDie,
    addQuickPresetDie,
    // updateDraftDieQty,
    updateDraftDieEntry,
    adjustDraftDieQty,
    replaceDraftDieWithQtySplit,
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

    // applyTempRuleToSides,
    // clearTempRuleFromSides,
    // clearAllTempRules,

    // applyTempRuleToSelectedGroup,
    // clearTempRuleFromSelectedGroup,
  } = useQuickRollDraft({
    db,
    table,
    availableRules,
  });

  const quickDieBehaviorPicker = useQuickDieBehaviorPicker({
    addQuickPresetDie,
    quickBehaviorConfig,
  });

  const quickQtyModal = useQuickQtyModal({
    draftGroups,
    availableRules,
    adjustDraftDieQty,
    updateDraftDieEntry,
    replaceDraftDieWithQtySplit,
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

  function handleClearQuickRoll() {
    clearDraft();

    if (preparedRoll?.source === "free") {
      setPreparedRoll(null);
      setLatestResult(null);
      setShowPreparedEditSheet(false);
    }
  }

  function handleClearPreparedRoll() {
    if (preparedRoll?.source === "free") {
      clearDraft();
    }

    setPreparedRoll(null);
    setLatestResult(null);
    setShowPreparedEditSheet(false);
  }

  async function handleRollPrepared() {
    if (!preparedRoll) return;

    if (preparedRoll.source === "free") {
      const group = preparedQuickGroup;

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

    const createdGroupId = addQuickPresetDie(
      quickDieBehaviorPicker.editingDieSides,
      {
        scope: quickBehaviorConfig.pendingBehaviorScope,
        rule: tempRule,
      },
    );

    setSelectedDraftGroupId(createdGroupId);
    setPreparedRoll({ source: "free" });
    setLatestResult(null);

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

    setPreparedRoll({
      source: "action",
      profileId: activeProfile.id,
      groupId,
      label: action.group.name,
    });
    setLatestResult(null);
  }

  function handleAddQuickStandardDie(sides: number) {
    addQuickStandardDie(sides);
    setPreparedRoll({ source: "free" });
    setLatestResult(null);
  }

  function handleOpenPreparedEdit() {
    if (preparedRoll?.source !== "free") return;
    if (!preparedQuickGroup) return;

    setShowPreparedEditSheet(true);
  }

  function handleClosePreparedEdit() {
    setShowPreparedEditSheet(false);
  }

  function handleAdjustPreparedDieQty(index: number, delta: number) {
    if (preparedRoll?.source !== "free") return;
    if (!preparedQuickGroup) return;

    adjustDraftDieQty(preparedQuickGroup.id, index, delta);
    setLatestResult(null);
  }

  function handleEditPreparedDie(index: number) {
    if (preparedRoll?.source !== "free") return;
    if (!preparedQuickGroup) return;

    const die = preparedQuickGroup.dice[index];
    if (!die) return;

    quickQtyModal.open(
      preparedQuickGroup.id,
      index,
      die.qty,
      die.modifier ?? 0,
    );
  }

  function handleRemovePreparedDie(index: number) {
    if (preparedRoll?.source !== "free") return;
    if (!preparedQuickGroup) return;

    removeDraftDie(preparedQuickGroup.id, index);
    setLatestResult(null);
  }

  async function handleClearActiveSession() {
    await clearActiveTableId();
    setSelectedProfileId(null);
    setResults([]);
    setPreparedRoll(null);
    setLatestResult(null);
    setShowPreparedEditSheet(false);
    setShowTableSessionMenu(false);
    setShowProfileSessionMenu(false);
  }

  async function handleSelectActiveTable(nextTableId: string) {
    await setActiveTableId(nextTableId);

    setSelectedProfileId(null);
    setResults([]);
    setPreparedRoll(null);
    setLatestResult(null);
    setShowPreparedEditSheet(false);
    setShowTableSessionMenu(false);
    setShowProfileSessionMenu(false);
  }

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

  const preparedQuickRollDetail = useMemo(
    () => formatDraftGroupDiceLabel(preparedQuickGroup, rulesMap),
    [preparedQuickGroup, rulesMap],
  );

  const preparedQuickEditDice = useMemo(() => {
    const groupBehaviorSummary = getDraftGroupBehaviorSummary(
      preparedQuickGroup,
      rulesMap,
    );

    return (
      preparedQuickGroup?.dice.map((die) => ({
        sides: die.sides,
        qty: die.qty,
        modifier: die.modifier ?? 0,
        sign: die.sign ?? 1,
        ruleLabel:
          getRuleSummaryFromTempRule(die.rule_temp) ??
          getRuleSummaryFromRuleId(die.rule_id, rulesMap) ??
          groupBehaviorSummary,
      })) ?? []
    );
  }, [preparedQuickGroup, rulesMap]);

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
    preparedRoll?.source === "free"
      ? hasPreparedQuickRoll
        ? (preparedQuickGroup?.name ?? "Jet libre")
        : null
      : preparedRoll?.source === "action"
        ? preparedRoll.label
        : null;

  const preparedCardDetail =
    preparedRoll?.source === "free"
      ? preparedQuickRollDetail
      : preparedRoll?.source === "action"
        ? preparedActionDetail
        : null;

  const hasPreparedRoll = !!preparedCardName && !!preparedCardDetail;

  const hasResult = !!latestResult;
  const hasActionRail = hasActiveTable;

  const isFreeIdleCockpit = !hasActiveTable && !hasPreparedRoll && !hasResult;
  const isTableIdleCockpit = hasActiveTable && !hasPreparedRoll && !hasResult;
  const isIdleCockpit = isFreeIdleCockpit || isTableIdleCockpit;

  const isFullCockpit = hasActiveTable && hasPreparedRoll && hasResult;
  const shouldCompressCockpit =
    isVerySmallScreen || isCompactScreen || hasActiveTable || hasPreparedRoll || hasResult;

  const screenTopPadding = isVerySmallScreen
    ? layout.insets.top + 2
    : isCompactScreen
      ? layout.insets.top + 4
      : layout.insets.top + theme.spacing.xs;

  const adaptiveContentGap = shouldCompressCockpit
    ? layout.isSmallHeight
      ? 2
      : 4
    : 8;

  const adaptiveResultToDiceOverlap = isTableIdleCockpit
    ? layout.isSmallHeight
      ? -22
      : -18
    : isFreeIdleCockpit
      ? layout.isSmallHeight
        ? -14
        : -10
      : resultToDiceOverlap;

  const adaptiveDiceToPreparedOverlap = isTableIdleCockpit
    ? layout.isSmallHeight
      ? -30
      : -26
    : isFreeIdleCockpit
      ? layout.isSmallHeight
        ? -22
        : -18
      : diceToPreparedOverlap;

  const adaptivePreparedToActionsOverlap = hasActiveTable
    ? layout.isSmallHeight
      ? -14
      : -12
    : isFullCockpit
      ? preparedToActionsOverlap
      : -6;

  const cockpitTopLift = isTableIdleCockpit
    ? layout.isSmallHeight
      ? -4
      : -8
    : isFreeIdleCockpit
      ? layout.isSmallHeight
        ? 0
        : 4
      : 0;

  const stickyButtonTopSpacing = hasActiveTable
    ? layout.isSmallHeight
      ? 2
      : 4
    : isIdleCockpit
      ? layout.isSmallHeight
        ? 4
        : 8
      : 2;

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
  }, [activeTableId, allTables, loadingTables]);

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

      <ScrollView
        style={{ flex: 1 }}
        scrollEnabled={showAdvanced}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: screenTopPadding,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: theme.spacing.xs,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            alignSelf: "center",
            width: "100%",
            maxWidth: layout.maxContentWidth,
            gap: adaptiveContentGap,
          }}
        >
          <View
            style={{
              flex: isFreeIdleCockpit ? 1 : undefined,
              justifyContent: isFreeIdleCockpit ? "center" : "flex-start",
              gap: adaptiveContentGap,
              transform: [
                {
                  translateY: isFreeIdleCockpit
                    ? layout.isSmallHeight
                      ? -8
                      : -14
                    : cockpitTopLift,
                },
              ],
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

            <ResultPanel result={latestResult} />

            <View style={{ marginTop: adaptiveResultToDiceOverlap }}>
              <FreeDicePad
                dice={STANDARD_DICE}
                countsBySides={freeDiceCountsBySides}
                onPressDie={handleAddQuickStandardDie}
                onLongPressDie={quickDieBehaviorPicker.open}
              />
            </View>

            <View style={{ marginTop: adaptiveDiceToPreparedOverlap }}>
              <PreparedRollCard
                name={preparedCardName}
                detail={preparedCardDetail}
                isEmpty={!hasPreparedRoll}
                onEdit={
                  preparedRoll?.source === "free" && hasPreparedRoll
                    ? handleOpenPreparedEdit
                    : undefined
                }
                onClear={hasPreparedRoll ? handleClearPreparedRoll : undefined}
                onSave={
                  preparedRoll?.source === "free" && hasPreparedRoll
                    ? handleOpenSaveDraftModal
                    : undefined
                }
              />
            </View>

            {hasActiveTable ? (
              <View style={{ marginTop: adaptivePreparedToActionsOverlap }}>
                <ActionRail
                  profileName={activeProfile?.name ?? null}
                  actions={actionRailItems}
                  selectedActionId={
                    preparedRoll?.source === "action" ? preparedRoll.groupId : null
                  }
                  onPrepareAction={handlePrepareSavedAction}
                />
              </View>
            ) : null}
          </View>

          <View
            style={{
              marginTop: isFreeIdleCockpit
                ? layout.isSmallHeight
                  ? 10
                  : 14
                : stickyButtonTopSpacing,
              marginBottom: 0,
            }}
          >
            <StickyRollButton
              disabled={!hasPreparedRoll}
              onPress={handleRollPrepared}
            />
          </View>

          {showAdvanced ? (
            <View style={{ marginTop: advancedSpacing }}>
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
                onEditQuickDieQty={quickQtyModal.open}
                onAdjustQuickDieQty={quickQtyModal.adjust}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

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

      {/*
      <Pressable
        onPress={() => setShowAdvanced((v) => !v)}
        style={({ pressed }) => ({
          position: "absolute",
          right: layout.horizontalPadding + 4,
          bottom: layout.bottomBarHeight + 88,
          width: 56,
          height: 56,
          borderWidth: 1,
          borderColor: showAdvanced ? theme.colors.arcane : theme.colors.border,
          borderRadius: theme.radius.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: showAdvanced
            ? theme.colors.arcane
            : theme.colors.surfaceAlt,
          opacity: pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
          ...theme.shadow.button,
        })}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            lineHeight: 30,
            color: showAdvanced ? theme.colors.white : theme.colors.text,
          }}
        >
          +
        </Text>
      </Pressable>
      */}

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

      <QuickDieBehaviorPickerModal
        visible={quickDieBehaviorPicker.visible}
        editingDieSides={quickDieBehaviorPicker.editingDieSides}
        behaviors={quickDieBehaviorPicker.behaviors}
        getDefinition={quickDieBehaviorPicker.getDefinition}
        onSelectBehavior={quickDieBehaviorPicker.select}
        onClose={quickDieBehaviorPicker.close}
      />

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
        configRanges={quickBehaviorConfig.configRanges}
        onChangeKeepCount={quickBehaviorConfig.setConfigKeepCount}
        onChangeDropCount={quickBehaviorConfig.setConfigDropCount}
        onChangeResultMode={quickBehaviorConfig.setConfigResultMode}
        onChangeCompare={quickBehaviorConfig.setConfigCompare}
        onChangeSuccessThreshold={quickBehaviorConfig.setConfigSuccessThreshold}
        onChangeCritSuccessFaces={quickBehaviorConfig.setConfigCritSuccessFaces}
        onChangeCritFailureFaces={quickBehaviorConfig.setConfigCritFailureFaces}
        onChangeSuccessAtOrAbove={quickBehaviorConfig.setConfigSuccessAtOrAbove}
        onChangeFailFaces={quickBehaviorConfig.setConfigFailFaces}
        onChangeGlitchRule={quickBehaviorConfig.setConfigGlitchRule}
        onUpdateRange={quickBehaviorConfig.updateRange}
        onClose={quickBehaviorConfig.close}
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
        pipelineSuccessThreshold={quickBehaviorConfig.pipelineSuccessThreshold}
        pipelineCompare={quickBehaviorConfig.pipelineCompare}
        pipelineCritSuccessFaces={quickBehaviorConfig.pipelineCritSuccessFaces}
        pipelineCritFailureFaces={quickBehaviorConfig.pipelineCritFailureFaces}
        pipelineComplicationFaces={
          quickBehaviorConfig.pipelineComplicationFaces
        }
        pipelineComplicationRule={quickBehaviorConfig.pipelineComplicationRule}
        onChangePipelineRerollFaces={quickBehaviorConfig.setPipelineRerollFaces}
        onChangePipelineRerollOnce={quickBehaviorConfig.setPipelineRerollOnce}
        onChangePipelineExplodeFaces={
          quickBehaviorConfig.setPipelineExplodeFaces
        }
        onChangePipelineMaxRerolls={quickBehaviorConfig.setPipelineMaxRerolls}
        onChangePipelineMaxExplosions={
          quickBehaviorConfig.setPipelineMaxExplosions
        }
        onChangePipelineKeepHighest={quickBehaviorConfig.setPipelineKeepHighest}
        onChangePipelineKeepLowest={quickBehaviorConfig.setPipelineKeepLowest}
        onChangePipelineDropHighest={quickBehaviorConfig.setPipelineDropHighest}
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
      />

      <PreparedRollEditSheet
        visible={showPreparedEditSheet}
        title="Modifier le jet libre"
        dice={preparedQuickEditDice}
        onClose={handleClosePreparedEdit}
        onAdjustDieQty={handleAdjustPreparedDieQty}
        onEditDie={handleEditPreparedDie}
        onRemoveDie={handleRemovePreparedDie}
      />

      <QuickQtyModal
        visible={quickQtyModal.visible}
        qtyValue={quickQtyModal.qtyValue}
        modifierValue={quickQtyModal.modifierValue}
        onChangeQtyValue={quickQtyModal.setQtyValue}
        onChangeModifierValue={quickQtyModal.setModifierValue}
        onClose={quickQtyModal.close}
        onSave={quickQtyModal.save}
      />
    </View>
  );
}
