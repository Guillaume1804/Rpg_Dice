// RollScreen.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";

import { RollModals } from "../features/roll/components/RollModals";
import { QuickRollSection } from "../features/roll/components/QuickRollSection";
import { TableActionSection } from "../features/roll/components/TableActionSection";

import { useDraftTableActions } from "../features/roll/hooks/useDraftTableActions";
import { useRollExecution } from "../features/roll/hooks/useRollExecution";
import { useQuickRollDraft } from "../features/roll/hooks/useQuickRollDraft";
import { useRollTableData } from "../features/roll/hooks/useRollTableData";

import { CreateActionWizardModal } from "../features/tables/actionWizard/CreateActionWizardModal";
import { useCreateActionWizard } from "../features/tables/actionWizard/useCreateActionWizard";
import { useCreateActionFromWizard } from "../features/tables/actionWizard/useCreateActionFromWizard";
import type { ProfileRow } from "../data/repositories/profilesRepo";

import { rollGroup, GroupRollResult } from "../core/roll/roll";
import { evaluateRule } from "../core/rules/evaluate";

import {
  getBehaviorsForContext,
  getBehaviorDefaults,
} from "../core/rules/getBehaviorsForContext";

import { getActionWizardBehaviors } from "../core/rules/behaviorCatalog";
import { buildDraftTempRuleFromPreset } from "../features/roll/helpers/buildDraftTempRuleFromPreset";

import type { RuleBehaviorKey } from "../core/rules/behaviorCatalog";

export default function RollScreen() {
  type RollMode = "quick" | "table";
  type BehaviorModalSource = "quick_roll" | "table_quick" | null;

  const [mode, setMode] = useState<RollMode>("quick");

  const db = useDb();
  const { activeTableId, setActiveTableId } = useActiveTable();

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
  const [editingDieSides, setEditingDieSides] = useState<number | null>(null);
  const [showDieRuleModal, setShowDieRuleModal] = useState(false);

  const [showBehaviorConfigModal, setShowBehaviorConfigModal] = useState(false);
  const [pendingBehaviorKey, setPendingBehaviorKey] =
    useState<RuleBehaviorKey | null>(null);
  const [pendingBehaviorLabel, setPendingBehaviorLabel] = useState("");
  const [pendingBehaviorScope, setPendingBehaviorScope] = useState<
    "entry" | "group"
  >("entry");

  const [configKeepCount, setConfigKeepCount] = useState("2");
  const [configDropCount, setConfigDropCount] = useState("1");
  const [configResultMode, setConfigResultMode] = useState("sum");

  const [configCompare, setConfigCompare] = useState<"gte" | "lte">("gte");
  const [configSuccessThreshold, setConfigSuccessThreshold] = useState("");
  const [configCritSuccessFaces, setConfigCritSuccessFaces] = useState("");
  const [configCritFailureFaces, setConfigCritFailureFaces] = useState("");

  const [configSuccessAtOrAbove, setConfigSuccessAtOrAbove] = useState("5");
  const [configFailFaces, setConfigFailFaces] = useState("1");
  const [configGlitchRule, setConfigGlitchRule] = useState("ones_gt_successes");

  const [tableQuickSides, setTableQuickSides] = useState<number>(6);
  const [tableQuickQty, setTableQuickQty] = useState<number>(1);
  const [tableQuickModifier, setTableQuickModifier] = useState<number>(0);
  const [tableQuickBehaviorKey, setTableQuickBehaviorKey] =
    useState<RuleBehaviorKey | null>(null);
  const [tableQuickTempRule, setTableQuickTempRule] = useState<ReturnType<
    typeof buildDraftTempRuleFromPreset
  > | null>(null);
  const [tableQuickResult, setTableQuickResult] =
    useState<GroupRollResult | null>(null);

  const [configRanges, setConfigRanges] = useState<
    { min: string; max: string; label: string }[]
  >([
    { min: "1", max: "3", label: "Bas" },
    { min: "4", max: "6", label: "Moyen" },
    { min: "7", max: "10", label: "Haut" },
  ]);

  const [showQuickQtyModal, setShowQuickQtyModal] = useState(false);
  const [editingQuickQtyGroupId, setEditingQuickQtyGroupId] = useState<
    string | null
  >(null);
  const [editingQuickQtyIndex, setEditingQuickQtyIndex] = useState<
    number | null
  >(null);
  const [quickQtyValue, setQuickQtyValue] = useState("");
  const [quickEntryModifierValue, setQuickEntryModifierValue] = useState("0");

  const [behaviorModalSource, setBehaviorModalSource] =
    useState<BehaviorModalSource>(null);

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

  const {
    visible: wizardVisible,
    step: wizardStep,
    stepIndex: wizardStepIndex,
    totalSteps: wizardTotalSteps,
    draft: wizardDraft,
    error: wizardError,
    open: openWizardState,
    close: closeWizardState,
    goNext: goWizardNext,
    goBack: goWizardBack,
    updateDraft: updateWizardDraft,
    updateDie: updateWizardDie,
    updateRangeRow: updateWizardRangeRow,
    addRangeRow: addWizardRangeRow,
    removeRangeRow: removeWizardRangeRow,
    setBehaviorType: setWizardBehaviorType,
  } = useCreateActionWizard();

  function handleClearQuickRoll() {
    clearDraft();
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

  function handleOpenDieConfig(sides: number) {
    setBehaviorModalSource("quick_roll");
    setEditingDieSides(sides);
    setShowDieRuleModal(true);
  }

  function handleOpenQuickQtyEditor(
    groupId: string,
    index: number,
    currentQty: number,
    currentModifier: number,
  ) {
    setEditingQuickQtyGroupId(groupId);
    setEditingQuickQtyIndex(index);
    setQuickQtyValue(String(currentQty));
    setQuickEntryModifierValue(String(currentModifier));
    setShowQuickQtyModal(true);
  }

  function handleCloseQuickQtyEditor() {
    setShowQuickQtyModal(false);
    setEditingQuickQtyGroupId(null);
    setEditingQuickQtyIndex(null);
    setQuickQtyValue("");
    setQuickEntryModifierValue("0");
  }

  function handleAdjustQuickDieQty(
    groupId: string,
    index: number,
    delta: number,
  ) {
    adjustDraftDieQty(groupId, index, delta);
  }

  function handleSaveQuickQtyEditor() {
    if (editingQuickQtyGroupId == null || editingQuickQtyIndex == null) return;

    const qty = Number(quickQtyValue);
    const modifier = Number(quickEntryModifierValue);

    if (!Number.isFinite(qty) || qty <= 0) return;
    if (!Number.isFinite(modifier)) return;

    const targetGroup = draftGroups.find(
      (g) => g.id === editingQuickQtyGroupId,
    );
    const targetDie = targetGroup?.dice[editingQuickQtyIndex];

    if (!targetDie) return;

    const resolvedRuleKind =
      targetDie.rule_temp?.kind ??
      (targetDie.rule_id
        ? (availableRules.find((rule) => rule.id === targetDie.rule_id)?.kind ??
          null)
        : null);

    const shouldSplit =
      resolvedRuleKind === "single_check" || resolvedRuleKind === "d20";

    if (shouldSplit) {
      replaceDraftDieWithQtySplit(
        editingQuickQtyGroupId,
        editingQuickQtyIndex,
        qty,
        modifier,
      );
    } else {
      updateDraftDieEntry(editingQuickQtyGroupId, editingQuickQtyIndex, {
        qty,
        modifier,
      });
    }

    handleCloseQuickQtyEditor();
  }

  function getWizardBehaviorTypeFromDraftRule(
    rule: {
      kind: string;
      params_json: string;
      behavior_key?: string | null;
    } | null,
  ):
    | "single_check"
    | "table_lookup"
    | "success_pool"
    | "sum_total"
    | "highest_of_pool"
    | "lowest_of_pool"
    | "keep_highest_n"
    | "keep_lowest_n"
    | "drop_highest_n"
    | "drop_lowest_n"
    | "banded_sum" {
    if (!rule) return "sum_total";

    if (rule.behavior_key) {
      return rule.behavior_key as
        | "single_check"
        | "table_lookup"
        | "success_pool"
        | "sum_total"
        | "highest_of_pool"
        | "lowest_of_pool"
        | "keep_highest_n"
        | "keep_lowest_n"
        | "drop_highest_n"
        | "drop_lowest_n"
        | "banded_sum";
    }

    if (rule.kind === "sum") return "sum_total";
    if (rule.kind === "single_check") return "single_check";
    if (rule.kind === "success_pool") return "success_pool";
    if (rule.kind === "table_lookup") return "table_lookup";
    if (rule.kind === "banded_sum") return "banded_sum";
    if (rule.kind === "highest_of_pool") return "highest_of_pool";
    if (rule.kind === "lowest_of_pool") return "lowest_of_pool";
    if (rule.kind === "keep_highest_n") return "keep_highest_n";
    if (rule.kind === "keep_lowest_n") return "keep_lowest_n";
    if (rule.kind === "drop_highest_n") return "drop_highest_n";
    if (rule.kind === "drop_lowest_n") return "drop_lowest_n";

    return "sum_total";
  }

  function handleSaveQuickRollAsAction() {
    if (!table || !selectedProfile) return;

    const resolvedRule = tableQuickTempRule ? tableQuickTempRule : null;

    const behaviorType = getWizardBehaviorTypeFromDraftRule(resolvedRule);

    resetWizardSubmitState();
    openWizardState();

    updateWizardDraft("name", `Action rapide ${tableQuickSides}`);
    setWizardBehaviorType(behaviorType);

    updateWizardDie("sides", tableQuickSides);
    updateWizardDie("qty", tableQuickQty);
    updateWizardDie("modifier", tableQuickModifier);
    updateWizardDie("sign", 1);

    updateWizardDraft("selectedRuleId", resolvedRule?.id ?? null);
    updateWizardDraft("creationMode", "auto");
  }

  function getCurrentQuickGroup() {
    if (draftGroups.length === 0) return null;

    return (
      draftGroups.find((group) => group.id === selectedDraftGroupId) ??
      draftGroups[0] ??
      null
    );
  }

  function getQuickDraftSummary(): string | null {
    const currentGroup = getCurrentQuickGroup();
    if (!currentGroup || currentGroup.dice.length === 0) return null;

    const diceLabel = currentGroup.dice
      .map((die) => {
        const modifier =
          die.modifier && die.modifier !== 0
            ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}`
            : "";

        return `${die.qty}d${die.sides}${modifier}`;
      })
      .join(" + ");

    return `${currentGroup.name} • ${diceLabel}`;
  }

  function handleOpenQuickBuilder() {
    setMode("quick");
    setShowAdvanced(true);
  }

  async function handleRollQuickDraftFromTable() {
    const currentGroup = getCurrentQuickGroup();
    if (!currentGroup) return;

    await rollSingleDraftGroup(currentGroup.id);
  }

  async function handleSubmitCreateActionWizard() {
    const ok = await submitWizardAction(wizardDraft);
    if (!ok) return;
  }

  function resetTableQuickResult() {
    setTableQuickResult(null);
  }

  function resetTableQuickDraft() {
    setTableQuickSides(6);
    setTableQuickQty(1);
    setTableQuickModifier(0);
    setTableQuickBehaviorKey(null);
    setTableQuickTempRule(null);
    setTableQuickResult(null);
  }

  function handleSelectTableQuickDie(sides: number) {
    setTableQuickSides(sides);
    setTableQuickBehaviorKey(null);
    setTableQuickTempRule(null);
    resetTableQuickResult();
  }

  function handleSelectTableQuickBehavior(params: {
    behaviorKey: RuleBehaviorKey;
    label: string;
    scope: "entry" | "group";
  }) {
    const defaults = getBehaviorDefaults(params.behaviorKey, "quick_roll");

    const tempRule = buildDraftTempRuleFromPreset({
      preset: {
        key: params.behaviorKey,
        label: params.label,
        scope: params.scope,
        behaviorKey: params.behaviorKey,
        defaultValues: defaults,
      },
      sides: tableQuickSides,
      actionName: params.label,
    });

    setTableQuickBehaviorKey(params.behaviorKey);
    setTableQuickTempRule(tempRule);
    resetTableQuickResult();
  }

  function handleAdjustTableQuickQty(delta: number) {
    setTableQuickQty((prev) => Math.max(1, prev + delta));
    resetTableQuickResult();
  }

  function handleOpenTableQuickBehaviorPicker() {
    setBehaviorModalSource("table_quick");
    setEditingDieSides(tableQuickSides);
    setShowDieRuleModal(true);
  }

  function handleRollTableQuickAction() {
    const rule = tableQuickTempRule
      ? {
          id: tableQuickTempRule.id,
          name: tableQuickTempRule.name,
          kind: tableQuickTempRule.kind,
          params_json: tableQuickTempRule.params_json,
        }
      : null;

    const result = rollGroup({
      groupId: "table-quick-action",
      label: selectedProfile
        ? `Action rapide — ${selectedProfile.name}`
        : "Action rapide",
      entries: [
        {
          entryId: "table-quick-entry",
          sides: tableQuickSides,
          qty: tableQuickQty,
          modifier: tableQuickModifier,
          sign: 1,
          rule,
        },
      ],
      groupRule: null,
      evaluateRule,
    });

    setTableQuickResult(result);
  }

  function behaviorNeedsSelectionConfig(behaviorKey: RuleBehaviorKey): boolean {
    return (
      behaviorKey === "keep_highest_n" ||
      behaviorKey === "keep_lowest_n" ||
      behaviorKey === "drop_highest_n" ||
      behaviorKey === "drop_lowest_n" ||
      behaviorKey === "single_check" ||
      behaviorKey === "success_pool" ||
      behaviorKey === "table_lookup" ||
      behaviorKey === "banded_sum"
    );
  }

  function getDefaultRanges(
    behaviorKey: RuleBehaviorKey,
  ): { min: string; max: string; label: string }[] {
    const defaults = getBehaviorDefaults(behaviorKey, "quick_roll");
    const ranges = defaults?.ranges;

    if (!Array.isArray(ranges)) {
      return [
        { min: "1", max: "3", label: "Bas" },
        { min: "4", max: "6", label: "Moyen" },
        { min: "7", max: "10", label: "Haut" },
      ];
    }

    const parsed = ranges
      .map((row) => {
        if (!row || typeof row !== "object") return null;

        const candidate = row as {
          min?: unknown;
          max?: unknown;
          label?: unknown;
        };

        if (
          typeof candidate.min !== "string" ||
          typeof candidate.max !== "string" ||
          typeof candidate.label !== "string"
        ) {
          return null;
        }

        return {
          min: candidate.min,
          max: candidate.max,
          label: candidate.label,
        };
      })
      .filter(
        (row): row is { min: string; max: string; label: string } =>
          row !== null,
      );

    if (parsed.length === 0) {
      return [
        { min: "1", max: "3", label: "Bas" },
        { min: "4", max: "6", label: "Moyen" },
        { min: "7", max: "10", label: "Haut" },
      ];
    }

    return parsed;
  }

  function openBehaviorConfig(params: {
    behaviorKey: RuleBehaviorKey;
    label: string;
    scope: "entry" | "group";
  }) {
    setPendingBehaviorKey(params.behaviorKey);
    setPendingBehaviorLabel(params.label);
    setPendingBehaviorScope(params.scope);

    const defaults = getBehaviorDefaults(params.behaviorKey, "quick_roll");

    if (
      params.behaviorKey === "table_lookup" ||
      params.behaviorKey === "banded_sum"
    ) {
      setConfigRanges(getDefaultRanges(params.behaviorKey));
    }

    if (
      params.behaviorKey === "keep_highest_n" ||
      params.behaviorKey === "keep_lowest_n"
    ) {
      setConfigKeepCount(
        typeof defaults?.keepCount === "string" ? defaults.keepCount : "2",
      );
    }

    if (
      params.behaviorKey === "drop_highest_n" ||
      params.behaviorKey === "drop_lowest_n"
    ) {
      setConfigDropCount(
        typeof defaults?.dropCount === "string" ? defaults.dropCount : "1",
      );
    }

    if (params.behaviorKey === "single_check") {
      setConfigCompare(defaults?.compare === "lte" ? "lte" : "gte");
      setConfigSuccessThreshold(
        typeof defaults?.successThreshold === "string"
          ? defaults.successThreshold
          : "",
      );
      setConfigCritSuccessFaces(
        typeof defaults?.critSuccessFaces === "string"
          ? defaults.critSuccessFaces
          : "",
      );
      setConfigCritFailureFaces(
        typeof defaults?.critFailureFaces === "string"
          ? defaults.critFailureFaces
          : "",
      );
    }

    if (params.behaviorKey === "success_pool") {
      setConfigSuccessAtOrAbove(
        typeof defaults?.successAtOrAbove === "string"
          ? defaults.successAtOrAbove
          : "5",
      );
      setConfigFailFaces(
        typeof defaults?.failFaces === "string" ? defaults.failFaces : "1",
      );
      setConfigGlitchRule(
        typeof defaults?.glitchRule === "string"
          ? defaults.glitchRule
          : "ones_gt_successes",
      );
    }

    setConfigResultMode(
      typeof defaults?.resultMode === "string" ? defaults.resultMode : "sum",
    );

    setShowBehaviorConfigModal(true);
  }

  function closeBehaviorConfigModal() {
    setShowBehaviorConfigModal(false);
    setPendingBehaviorKey(null);
    setPendingBehaviorLabel("");
    setPendingBehaviorScope("entry");
    setBehaviorModalSource(null);

    setConfigKeepCount("2");
    setConfigDropCount("1");
    setConfigResultMode("sum");

    setConfigCompare("gte");
    setConfigSuccessThreshold("");
    setConfigCritSuccessFaces("");
    setConfigCritFailureFaces("");

    setConfigSuccessAtOrAbove("5");
    setConfigFailFaces("1");
    setConfigGlitchRule("ones_gt_successes");
    setConfigRanges([
      { min: "1", max: "3", label: "Bas" },
      { min: "4", max: "6", label: "Moyen" },
      { min: "7", max: "10", label: "Haut" },
    ]);
  }

  function buildPendingBehaviorDefaultValues() {
    if (!pendingBehaviorKey) return undefined;

    const baseDefaults =
      getBehaviorDefaults(pendingBehaviorKey, "quick_roll") ?? {};

    if (
      pendingBehaviorKey === "keep_highest_n" ||
      pendingBehaviorKey === "keep_lowest_n"
    ) {
      return {
        ...baseDefaults,
        keepCount: configKeepCount,
        resultMode: configResultMode,
      };
    }

    if (
      pendingBehaviorKey === "drop_highest_n" ||
      pendingBehaviorKey === "drop_lowest_n"
    ) {
      return {
        ...baseDefaults,
        dropCount: configDropCount,
        resultMode: configResultMode,
      };
    }

    if (pendingBehaviorKey === "single_check") {
      return {
        ...baseDefaults,
        compare: configCompare,
        successThreshold: configSuccessThreshold,
        critSuccessFaces: configCritSuccessFaces,
        critFailureFaces: configCritFailureFaces,
      };
    }

    if (pendingBehaviorKey === "success_pool") {
      return {
        ...baseDefaults,
        successAtOrAbove: configSuccessAtOrAbove,
        failFaces: configFailFaces,
        glitchRule: configGlitchRule,
      };
    }

    if (
      pendingBehaviorKey === "table_lookup" ||
      pendingBehaviorKey === "banded_sum"
    ) {
      return {
        ...baseDefaults,
        ranges: configRanges,
      };
    }

    return baseDefaults;
  }

  function handleConfirmBehaviorConfig() {
    if (!pendingBehaviorKey || editingDieSides == null) return;

    if (
      (pendingBehaviorKey === "keep_highest_n" ||
        pendingBehaviorKey === "keep_lowest_n") &&
      (!Number.isFinite(Number(configKeepCount)) ||
        Number(configKeepCount) <= 0)
    ) {
      return;
    }

    if (
      (pendingBehaviorKey === "drop_highest_n" ||
        pendingBehaviorKey === "drop_lowest_n") &&
      (!Number.isFinite(Number(configDropCount)) ||
        Number(configDropCount) <= 0)
    ) {
      return;
    }

    if (
      pendingBehaviorKey === "single_check" &&
      configSuccessThreshold.trim() !== "" &&
      !Number.isFinite(Number(configSuccessThreshold))
    ) {
      return;
    }

    if (
      pendingBehaviorKey === "success_pool" &&
      !Number.isFinite(Number(configSuccessAtOrAbove))
    ) {
      return;
    }

    if (
      pendingBehaviorKey === "table_lookup" ||
      pendingBehaviorKey === "banded_sum"
    ) {
      const hasValidRange = configRanges.some(
        (row) =>
          Number.isFinite(Number(row.min)) &&
          Number.isFinite(Number(row.max)) &&
          row.label.trim().length > 0,
      );

      if (!hasValidRange) {
        return;
      }
    }

    const tempRule = buildDraftTempRuleFromPreset({
      preset: {
        key: pendingBehaviorKey,
        label: pendingBehaviorLabel,
        scope: pendingBehaviorScope,
        behaviorKey: pendingBehaviorKey,
        defaultValues: buildPendingBehaviorDefaultValues(),
      },
      sides: editingDieSides,
      actionName: pendingBehaviorLabel,
    });

    if (behaviorModalSource === "table_quick") {
      setTableQuickBehaviorKey(pendingBehaviorKey);
      setTableQuickTempRule(tempRule);
      resetTableQuickResult();
    } else if (behaviorModalSource === "quick_roll") {
      addQuickPresetDie(editingDieSides, {
        scope: pendingBehaviorScope,
        rule: tempRule,
      });
    }

    closeBehaviorConfigModal();
    setShowDieRuleModal(false);
    setEditingDieSides(null);
    setBehaviorModalSource(null);
  }

  const compatibleQuickBehaviors = useMemo(() => {
    if (editingDieSides == null) return [];

    const all = getBehaviorsForContext("quick_roll");

    return all.filter((b) => {
      const def = getActionWizardBehaviors().find(
        (d) => d.key === b.behaviorKey,
      );

      if (!def?.supportedSides) return true;

      return def.supportedSides.includes(editingDieSides);
    });
  }, [editingDieSides]);

  const hasActiveTable = !!table;

  const selectedProfile = useMemo<ProfileRow | null>(() => {
    if (!selectedProfileId) return null;

    const found =
      profiles.find((p) => p.profile.id === selectedProfileId)?.profile ?? null;

    return found;
  }, [profiles, selectedProfileId]);

  function updateConfigRange(
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) {
    setConfigRanges((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  }

  const {
    submitError: wizardSubmitError,
    submit: submitWizardAction,
    resetSubmitState: resetWizardSubmitState,
  } = useCreateActionFromWizard({
    db,
    tableId,
    tableName: table?.name ?? "",
    profile: selectedProfile,
    reload: reloadGroups,
    onSuccess: () => {
      closeWizardState();
    },
  });

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Erreur</Text>
        <Text style={{ marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {hasActiveTable ? (
          <View
            style={{
              padding: 14,
              borderWidth: 1,
              borderRadius: 14,
            }}
          >
            <Text style={{ opacity: 0.72 }}>Table active</Text>
            <Text style={{ marginTop: 4, fontSize: 24, fontWeight: "900" }}>
              {table.name}
            </Text>
          </View>
        ) : null}

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
            activeProfile={selectedProfile}
            tableQuickSides={tableQuickSides}
            tableQuickQty={tableQuickQty}
            tableQuickModifier={tableQuickModifier}
            tableQuickBehaviorLabel={tableQuickTempRule?.name ?? null}
            tableQuickResult={tableQuickResult}
            onSelectTableQuickDie={handleSelectTableQuickDie}
            onAdjustTableQuickQty={handleAdjustTableQuickQty}
            onOpenTableQuickBehaviorPicker={handleOpenTableQuickBehaviorPicker}
            onRollTableQuickAction={handleRollTableQuickAction}
            onSaveQuickRollAsAction={handleSaveQuickRollAsAction}
          />
        )}

        {mode === "quick" && (
          <QuickRollSection
            simplified={true}
            title={hasActiveTable ? "Jet libre" : "Jet"}
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
            onAddQuickStandardDie={addQuickStandardDie}
            onSelectDraftGroup={setSelectedDraftGroupId}
            onRenameDraftGroup={openRenameDraftGroupModal}
            onEditDraftGroupRule={openDraftGroupRuleEditor}
            onRemoveDraftGroup={removeDraftGroup}
            onEditDraftDie={openDraftEditor}
            onOpenDieConfig={handleOpenDieConfig}
            onRemoveDraftDie={removeDraftDie}
            onRollDraft={rollDraft}
            onRollQuickGroup={rollSingleDraftGroup}
            onClearQuickGroup={clearDraftGroup}
            onClearDraft={handleClearQuickRoll}
            onReplaceCurrentTable={replaceCurrentTable}
            onCreateNewTable={handleOpenSaveDraftModal}
            availableRules={availableRules}
            onEditQuickDieQty={handleOpenQuickQtyEditor}
            onAdjustQuickDieQty={handleAdjustQuickDieQty}
          />
        )}

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
        style={{
          position: "absolute",
          right: 20,
          bottom: 90,
          width: 56,
          height: 56,
          borderWidth: 1,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "700", lineHeight: 30 }}>
          +
        </Text>
      </Pressable>

      {showDieRuleModal && editingDieSides !== null ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 14,
              padding: 16,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800" }}>
              Configurer d{editingDieSides}
            </Text>

            <Text style={{ opacity: 0.7 }}>
              Choisis un preset de règle compatible avec ce dé.
            </Text>

            <ScrollView
              style={{ maxHeight: 320 }}
              contentContainerStyle={{ gap: 8 }}
              showsVerticalScrollIndicator={true}
            >
              {compatibleQuickBehaviors.map((behavior) => {
                const def = getActionWizardBehaviors().find(
                  (d) => d.key === behavior.behaviorKey,
                );

                if (!def) return null;

                const defaults = getBehaviorDefaults(
                  behavior.behaviorKey,
                  "quick_roll",
                );

                const quickScope = def.scope === "group" ? "group" : "entry";

                return (
                  <Pressable
                    key={behavior.behaviorKey}
                    onPress={() => {
                      if (editingDieSides == null) return;

                      if (behaviorNeedsSelectionConfig(behavior.behaviorKey)) {
                        openBehaviorConfig({
                          behaviorKey: behavior.behaviorKey,
                          label: def.label,
                          scope: quickScope,
                        });
                        return;
                      }

                      const tempRule = buildDraftTempRuleFromPreset({
                        preset: {
                          key: behavior.behaviorKey,
                          label: def.label,
                          description: def.description,
                          scope: quickScope,
                          behaviorKey: behavior.behaviorKey,
                          defaultValues: defaults,
                        },
                        sides: editingDieSides,
                        actionName: def.label,
                      });

                      if (behaviorModalSource === "table_quick") {
                        setTableQuickBehaviorKey(behavior.behaviorKey);
                        setTableQuickTempRule(tempRule);
                        resetTableQuickResult();
                      } else if (behaviorModalSource === "quick_roll") {
                        addQuickPresetDie(editingDieSides, {
                          scope: quickScope,
                          rule: tempRule,
                        });
                      }

                      setShowDieRuleModal(false);
                      setEditingDieSides(null);
                      setBehaviorModalSource(null);
                    }}
                    style={{
                      padding: 12,
                      borderWidth: 1,
                      borderRadius: 10,
                      gap: 4,
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>{def.label}</Text>
                    {def.description ? (
                      <Text style={{ opacity: 0.7 }}>{def.description}</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={() => {
                setShowDieRuleModal(false);
                setEditingDieSides(null);
                setBehaviorModalSource(null);
              }}
              style={{
                marginTop: 4,
                alignItems: "center",
              }}
            >
              <Text style={{ opacity: 0.6 }}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {showBehaviorConfigModal ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 14,
              padding: 16,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800" }}>
              Configurer {pendingBehaviorLabel}
            </Text>

            {(pendingBehaviorKey === "keep_highest_n" ||
              pendingBehaviorKey === "keep_lowest_n") && (
              <>
                <Text style={{ opacity: 0.72 }}>
                  Combien de dés veux-tu garder ?
                </Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <TextInput
                    value={configKeepCount}
                    onChangeText={setConfigKeepCount}
                    keyboardType="number-pad"
                    placeholder="Nombre à garder"
                    style={{ fontSize: 16 }}
                  />
                </View>
              </>
            )}

            {(pendingBehaviorKey === "drop_highest_n" ||
              pendingBehaviorKey === "drop_lowest_n") && (
              <>
                <Text style={{ opacity: 0.72 }}>
                  Combien de dés veux-tu retirer ?
                </Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <TextInput
                    value={configDropCount}
                    onChangeText={setConfigDropCount}
                    keyboardType="number-pad"
                    placeholder="Nombre à retirer"
                    style={{ fontSize: 16 }}
                  />
                </View>
              </>
            )}

            {pendingBehaviorKey === "single_check" && (
              <>
                <Text style={{ opacity: 0.72 }}>Type de comparaison</Text>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[
                    { key: "gte", label: "≥ seuil" },
                    { key: "lte", label: "≤ seuil" },
                  ].map((option) => (
                    <Pressable
                      key={option.key}
                      onPress={() =>
                        setConfigCompare(option.key as "gte" | "lte")
                      }
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderRadius: 10,
                        opacity: configCompare === option.key ? 1 : 0.7,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight:
                            configCompare === option.key ? "700" : "400",
                        }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={{ opacity: 0.72 }}>Seuil de réussite</Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <TextInput
                    value={configSuccessThreshold}
                    onChangeText={setConfigSuccessThreshold}
                    keyboardType="number-pad"
                    placeholder="Ex: 15"
                    style={{ fontSize: 16 }}
                  />
                </View>

                <Text style={{ opacity: 0.72 }}>
                  Faces de critique réussite (optionnel)
                </Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <TextInput
                    value={configCritSuccessFaces}
                    onChangeText={setConfigCritSuccessFaces}
                    placeholder="Ex: 20"
                    style={{ fontSize: 16 }}
                  />
                </View>

                <Text style={{ opacity: 0.72 }}>
                  Faces d’échec critique (optionnel)
                </Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <TextInput
                    value={configCritFailureFaces}
                    onChangeText={setConfigCritFailureFaces}
                    placeholder="Ex: 1"
                    style={{ fontSize: 16 }}
                  />
                </View>
              </>
            )}

            {pendingBehaviorKey === "success_pool" && (
              <>
                <Text style={{ opacity: 0.72 }}>Seuil de succès</Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <TextInput
                    value={configSuccessAtOrAbove}
                    onChangeText={setConfigSuccessAtOrAbove}
                    keyboardType="number-pad"
                    placeholder="Ex: 5"
                    style={{ fontSize: 16 }}
                  />
                </View>

                <Text style={{ opacity: 0.72 }}>Faces d’échec spécial</Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <TextInput
                    value={configFailFaces}
                    onChangeText={setConfigFailFaces}
                    placeholder="Ex: 1"
                    style={{ fontSize: 16 }}
                  />
                </View>

                <Text style={{ opacity: 0.72 }}>Règle de complication</Text>

                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {[
                    { key: "none", label: "Aucune" },
                    {
                      key: "ones_gt_successes",
                      label: "1 > succès",
                    },
                    {
                      key: "ones_gte_successes",
                      label: "1 ≥ succès",
                    },
                  ].map((option) => (
                    <Pressable
                      key={option.key}
                      onPress={() => setConfigGlitchRule(option.key)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderRadius: 10,
                        opacity: configGlitchRule === option.key ? 1 : 0.7,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight:
                            configGlitchRule === option.key ? "700" : "400",
                        }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {(pendingBehaviorKey === "keep_highest_n" ||
              pendingBehaviorKey === "keep_lowest_n" ||
              pendingBehaviorKey === "drop_highest_n" ||
              pendingBehaviorKey === "drop_lowest_n") && (
              <>
                <Text style={{ opacity: 0.72 }}>Mode de résultat</Text>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["sum", "list"].map((mode) => (
                    <Pressable
                      key={mode}
                      onPress={() => setConfigResultMode(mode)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderRadius: 10,
                        opacity: configResultMode === mode ? 1 : 0.7,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: configResultMode === mode ? "700" : "400",
                        }}
                      >
                        {mode === "sum" ? "Somme" : "Liste"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {(pendingBehaviorKey === "table_lookup" ||
              pendingBehaviorKey === "banded_sum") && (
              <>
                <Text style={{ opacity: 0.72 }}>Plages de résultats</Text>

                <View style={{ gap: 8 }}>
                  {configRanges.map((row, index) => (
                    <View
                      key={`${pendingBehaviorKey}-range-${index}`}
                      style={{
                        borderWidth: 1,
                        borderRadius: 10,
                        padding: 10,
                        gap: 8,
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>
                        Plage {index + 1}
                      </Text>

                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <View
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                          }}
                        >
                          <TextInput
                            value={row.min}
                            onChangeText={(value) =>
                              updateConfigRange(index, "min", value)
                            }
                            keyboardType="number-pad"
                            placeholder="Min"
                            style={{ fontSize: 16 }}
                          />
                        </View>

                        <View
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                          }}
                        >
                          <TextInput
                            value={row.max}
                            onChangeText={(value) =>
                              updateConfigRange(index, "max", value)
                            }
                            keyboardType="number-pad"
                            placeholder="Max"
                            style={{ fontSize: 16 }}
                          />
                        </View>
                      </View>

                      <View
                        style={{
                          borderWidth: 1,
                          borderRadius: 10,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                        }}
                      >
                        <TextInput
                          value={row.label}
                          onChangeText={(value) =>
                            updateConfigRange(index, "label", value)
                          }
                          placeholder="Label"
                          style={{ fontSize: 16 }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Pressable
                onPress={closeBehaviorConfigModal}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmBehaviorConfig}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Valider</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {showQuickQtyModal ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 14,
              padding: 16,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800" }}>
              Modifier la quantité
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Saisis le nombre de dés voulu.
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={quickQtyValue}
                onChangeText={setQuickQtyValue}
                keyboardType="number-pad"
                placeholder="Quantité"
                style={{ fontSize: 16 }}
              />
            </View>

            <Text style={{ opacity: 0.72 }}>
              Modificateur appliqué à cette entrée uniquement.
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={quickEntryModifierValue}
                onChangeText={setQuickEntryModifierValue}
                keyboardType="numbers-and-punctuation"
                placeholder="Modificateur"
                style={{ fontSize: 16 }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Pressable
                onPress={handleCloseQuickQtyEditor}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveQuickQtyEditor}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Valider</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      <CreateActionWizardModal
        visible={wizardVisible}
        step={wizardStep}
        stepIndex={wizardStepIndex}
        totalSteps={wizardTotalSteps}
        draft={wizardDraft}
        error={wizardSubmitError ?? wizardError}
        compatibleRules={[]}
        onClose={closeWizardState}
        onBack={goWizardBack}
        onNext={goWizardNext}
        onSubmit={handleSubmitCreateActionWizard}
        onUpdateDraft={updateWizardDraft}
        onUpdateDie={updateWizardDie}
        onSelectRuleId={(ruleId) => updateWizardDraft("selectedRuleId", ruleId)}
        onSelectCreationMode={(mode) => updateWizardDraft("creationMode", mode)}
        onOpenAdvancedRuleEditor={() => {}}
        onUpdateRangeRow={updateWizardRangeRow}
        onAddRangeRow={addWizardRangeRow}
        onRemoveRangeRow={removeWizardRangeRow}
        onSetBehaviorType={setWizardBehaviorType}
      />
    </View>
  );
}
