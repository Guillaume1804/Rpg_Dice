// RollScreen.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";

import { useDataRefresh } from "../data/state/DataRefreshProvider";

import { RollModals } from "../features/roll/components/RollModals";
import { QuickRollSection } from "../features/roll/components/QuickRollSection";
import { TableActionSection } from "../features/roll/components/TableActionSection";

import { arcane } from "../theme/arcaneTheme";
import { useArcaneLayout } from "../theme/useArcaneLayout";
import { arcaneStyles } from "../theme/arcaneStyles";

import { SessionBar } from "../features/roll/components/SessionBar";
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

import { GroupRollResult, rollGroup } from "../core/roll/roll";
import { evaluateRule } from "../core/rules/evaluate";

import { buildDraftTempRuleFromPreset } from "../features/roll/helpers/buildDraftTempRuleFromPreset";

import { QuickBehaviorConfigModal } from "../features/roll/components/QuickBehaviorConfigModal";
import { QuickQtyModal } from "../features/roll/components/QuickQtyModal";
import { QuickDieBehaviorPickerModal } from "../features/roll/components/QuickDieBehaviorPickerModal";
import { useQuickBehaviorConfigModal } from "../features/roll/hooks/useQuickBehaviorConfigModal";
import { useQuickQtyModal } from "../features/roll/hooks/useQuickQtyModal";
import { useQuickDieBehaviorPicker } from "../features/roll/hooks/useQuickDieBehaviorPicker";

type DraftDieSummary = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
};

type DraftGroupSummary = {
  id: string;
  name: string;
  dice: DraftDieSummary[];
};

function formatSignedModifier(modifier?: number) {
  const safeModifier = Number.isFinite(modifier) ? Number(modifier) : 0;

  if (safeModifier === 0) return "";

  return ` ${safeModifier > 0 ? "+" : "-"} ${Math.abs(safeModifier)}`;
}

function formatDraftDieLabel(die: DraftDieSummary) {
  const sign = die.sign === -1 ? "- " : "";
  return `${sign}${die.qty}d${die.sides}${formatSignedModifier(die.modifier)}`;
}

function formatDraftGroupDiceLabel(group: DraftGroupSummary | null) {
  if (!group || group.dice.length === 0) return null;

  return group.dice.map(formatDraftDieLabel).join(" + ");
}

function findStandardQuickGroup(groups: DraftGroupSummary[]) {
  return (
    groups.find(
      (group) =>
        group.name === "Jet libre" &&
        group.dice.length > 0,
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

type SavedActionDieSummary = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
};

type SavedActionGroupSummary = {
  rule_id?: string | null;
};

type RuleNameMap = Record<
  string,
  {
    name: string;
  }
>;

function formatSavedActionDiceLabel(dice: SavedActionDieSummary[]) {
  if (dice.length === 0) return "Aucun dé";

  return dice
    .map((die) => {
      const sign = die.sign === -1 ? "- " : "";
      return `${sign}${die.qty}d${die.sides}${formatSignedModifier(
        die.modifier,
      )}`;
    })
    .join(" + ");
}

function getSavedActionBehaviorLabel(params: {
  group: SavedActionGroupSummary;
  dice: SavedActionDieSummary[];
  rulesMap: RuleNameMap;
}) {
  if (params.group.rule_id && params.rulesMap[params.group.rule_id]) {
    return params.rulesMap[params.group.rule_id].name;
  }

  const firstDieRuleId = params.dice.find((die) => die.rule_id)?.rule_id;

  if (firstDieRuleId && params.rulesMap[firstDieRuleId]) {
    return params.rulesMap[firstDieRuleId].name;
  }

  return "Somme simple";
}

function formatSavedActionDetail(params: {
  group: SavedActionGroupSummary;
  dice: SavedActionDieSummary[];
  rulesMap: RuleNameMap;
}) {
  const diceLabel = formatSavedActionDiceLabel(params.dice);
  const behaviorLabel = getSavedActionBehaviorLabel(params);

  return `${diceLabel} · ${behaviorLabel}`;
}

export default function RollScreen() {
  type RollMode = "quick" | "table";
  const layout = useArcaneLayout();

  const [mode, setMode] = useState<RollMode>("quick");
  const [preparedRoll, setPreparedRoll] = useState<PreparedRoll | null>(null);
  const [latestResult, setLatestResult] = useState<GroupRollResult | null>(null);
  const [showPreparedEditSheet, setShowPreparedEditSheet] = useState(false);

  const db = useDb();
  const { activeTableId, setActiveTableId, clearActiveTableId } =
    useActiveTable();
  const [results, setResults] = useState<GroupRollResult[]>([]);
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

  const [tableQuickSides, setTableQuickSides] = useState(20);
  const [tableQuickQty, setTableQuickQty] = useState(1);
  const [tableQuickModifier] = useState(0);
  const [tableQuickResult, setTableQuickResult] =
    useState<GroupRollResult | null>(null);

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
    if (profiles.length === 0) {
      setSelectedProfileId(null);
      return;
    }

    const exists = profiles.some((p) => p.profile.id === selectedProfileId);
    if (!exists) {
      setSelectedProfileId(profiles[0].profile.id);
    }
  }, [profiles, selectedProfileId]);

  useEffect(() => {
    if (!table) {
      setMode("quick");
    }
  }, [table]);

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

  const { rollSavedTable, rollSavedProfile, rollSavedGroup } = useRollExecution(
    {
      db,
      table,
      profiles,
      rulesMap,
      setResults,
    },
  );

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

    const createdGroupId = addQuickPresetDie(quickDieBehaviorPicker.editingDieSides, {
      scope: quickBehaviorConfig.pendingBehaviorScope,
      rule: tempRule,
    });

    setSelectedDraftGroupId(createdGroupId);
    setPreparedRoll({ source: "free" });
    setLatestResult(null);
    setMode("quick");

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
    setMode("quick");
  }

  function handleCycleProfile() {
    if (profiles.length <= 1) return;

    const currentIndex = profiles.findIndex(
      (entry) => entry.profile.id === selectedProfileId,
    );

    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeCurrentIndex + 1) % profiles.length;

    setSelectedProfileId(profiles[nextIndex].profile.id);
  }

  function handleAddQuickStandardDie(sides: number) {
    addQuickStandardDie(sides);
    setPreparedRoll({ source: "free" });
    setLatestResult(null);
    setMode("quick");
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
    () => formatDraftGroupDiceLabel(preparedQuickGroup),
    [preparedQuickGroup],
  );

  const preparedQuickEditDice = useMemo(
    () =>
      preparedQuickGroup?.dice.map((die) => ({
        sides: die.sides,
        qty: die.qty,
        modifier: die.modifier ?? 0,
        sign: die.sign ?? 1,
        ruleLabel: null,
      })) ?? [],
    [preparedQuickGroup],
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
    preparedRoll?.source === "free"
      ? hasPreparedQuickRoll
        ? preparedQuickGroup?.name ?? "Jet libre"
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

  function handleAdjustTableQuickQty(delta: number) {
    setTableQuickQty((current) => Math.max(1, current + delta));
  }

  function handleRollTableQuickAction() {
    if (!activeProfile) return;

    const result = rollGroup({
      groupId: `table-quick-${activeProfile.id}`,
      label: `Jet rapide — ${activeProfile.name}`,
      entries: [
        {
          entryId: `table-quick-entry-${Date.now()}`,
          sides: tableQuickSides,
          qty: tableQuickQty,
          modifier: tableQuickModifier,
          sign: 1,
          rule: null,
        },
      ],
      groupRule: null,
      evaluateRule,
    });

    setTableQuickResult(result);
  }

  function handleSaveQuickRollAsAction() {
    // Temporaire : on reconnectera cette sauvegarde proprement ensuite.
    setMode("quick");
  }

  useEffect(() => {
    if (preparedRoll?.source !== "free") return;

    if (!hasPreparedQuickRoll) {
      setPreparedRoll(null);
      setLatestResult(null);
      setShowPreparedEditSheet(false);
    }
  }, [hasPreparedQuickRoll, preparedRoll]);

  if (error) {
    return (
      <View
        style={[
          arcaneStyles.screen,
          {
            paddingTop: layout.insets.top + arcane.spacing.lg,
            paddingHorizontal: layout.horizontalPadding,
            justifyContent: "center",
          },
        ]}
      >
        <Text style={arcaneStyles.sectionTitle}>Erreur</Text>
        <Text style={[arcaneStyles.muted, { marginTop: arcane.spacing.sm }]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={arcaneStyles.screen}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: layout.insets.top + arcane.spacing.md,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: layout.scrollBottomPadding,
          alignSelf: "center",
          width: "100%",
          maxWidth: layout.maxContentWidth,
        }}
        showsVerticalScrollIndicator={false}
      >
        <SessionBar
          tableName={table?.name ?? null}
          activeProfileName={activeProfile?.name ?? null}
          hasActiveTable={hasActiveTable}
          profileCount={profiles.length}
          onPressProfile={handleCycleProfile}
          onClearTable={async () => {
            await clearActiveTableId();
            setSelectedProfileId(null);
            setResults([]);
            setTableQuickResult(null);
            setPreparedRoll(null);
            setLatestResult(null);
            setShowPreparedEditSheet(false);
            setMode("quick");
          }}
        />

        {hasActiveTable ? (
          <View style={{ marginTop: 12 }}>
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

        <View style={{ marginTop: 12 }}>
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

        <View style={{ marginTop: 12 }}>
          <ResultPanel result={latestResult} />
        </View>

        {/*    
        <View
          style={{
            flexDirection: "row",
            marginTop: 12,
            borderWidth: 1,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <Pressable
            onPress={() => setMode("quick")}
            style={{
              flex: 1,
              padding: 10,
              alignItems: "center",
              backgroundColor: mode === "quick" ? "#ddd" : "transparent",
            }}
          >
            <Text style={{ fontWeight: "600" }}>⚡ Rapide</Text>
          </Pressable>

          <Pressable
            onPress={() => setMode("table")}
            disabled={!hasActiveTable}
            style={{
              flex: 1,
              padding: 10,
              alignItems: "center",
              opacity: hasActiveTable ? 1 : 0.3,
              backgroundColor: mode === "table" ? "#ddd" : "transparent",
            }}
          >
            <Text style={{ fontWeight: "600" }}>🎮 Table</Text>
          </Pressable>
        </View>
        
        {mode === "table" && hasActiveTable && (
          <TableActionSection
            profiles={profiles}
            selectedProfileId={selectedProfileId}
            results={results}
            onSelectProfile={setSelectedProfileId}
            onRollProfile={rollSavedProfile}
            onRollGroup={rollSavedGroup}
            onRollAll={rollSavedTable}
            activeProfile={activeProfile}
            tableQuickSides={tableQuickSides}
            tableQuickQty={tableQuickQty}
            tableQuickModifier={tableQuickModifier}
            tableQuickBehaviorLabel={null}
            tableQuickResult={tableQuickResult}
            onSelectTableQuickDie={setTableQuickSides}
            onAdjustTableQuickQty={handleAdjustTableQuickQty}
            onOpenTableQuickBehaviorPicker={() => { }}
            onRollTableQuickAction={handleRollTableQuickAction}
            onSaveQuickRollAsAction={handleSaveQuickRollAsAction}
          />
        )}
        */}

        <View style={{ marginTop: arcane.spacing.md }}>
          <FreeDicePad
            dice={STANDARD_DICE}
            countsBySides={freeDiceCountsBySides}
            onPressDie={handleAddQuickStandardDie}
            onLongPressDie={quickDieBehaviorPicker.open}
          />
        </View>

        {showAdvanced ? (
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
      </ScrollView>

      <Pressable
        onPress={() => setShowAdvanced((v) => !v)}
        style={({ pressed }) => ({
          position: "absolute",
          right: layout.horizontalPadding + 4,
          bottom: layout.bottomBarHeight + 16,
          width: 56,
          height: 56,
          borderWidth: 1,
          borderColor: showAdvanced
            ? arcane.colors.arcane
            : arcane.colors.border,
          borderRadius: arcane.radius.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: showAdvanced
            ? arcane.colors.arcane
            : arcane.colors.surfaceAlt,
          opacity: pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
          ...arcane.shadow.button,
        })}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            lineHeight: 30,
            color: showAdvanced ? arcane.colors.white : arcane.colors.text,
          }}
        >
          +
        </Text>
      </Pressable>

      <StickyRollButton
        disabled={!hasPreparedRoll}
        onPress={handleRollPrepared}
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
