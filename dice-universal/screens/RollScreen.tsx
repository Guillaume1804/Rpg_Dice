// NOTE ARCHITECTURE / TRANSITION :
// -----------------------------------------------------------------------------
// RollScreen n’est plus l’écran produit officiel de lancement.
//
// Historiquement, cet écran gérait à la fois :
// - la session active ;
// - les tables et profils ;
// - les actions sauvegardées ;
// - les jets libres ;
// - le jet préparé ;
// - l’édition des dés ;
// - la sauvegarde / mise à jour / variante d’action ;
// - la configuration rapide des comportements ;
// - le lancer ;
// - l’affichage du résultat.
//
// Depuis la refonte Roll3D / Préparation du jeu :
// - Roll3D devient l’écran officiel de lancement ;
// - GamePreparationScreen devient l’écran officiel de préparation ;
// - RollScreen reste une implémentation legacy temporaire utilisée par
//   GamePreparationScreen.
//
// Les fonctionnalités de préparation encore présentes ici doivent être
// extraites progressivement vers des hooks/composants dédiés à la Préparation.
//
// Les fonctions de lancer et d’affichage de résultat présentes ici ne sont plus
// le rendu final cible. Elles servent uniquement de prévisualisation technique
// ou de transition, tant que Roll3D et le Result Reveal System n’ont pas absorbé
// toute la logique nécessaire.
//
// Règle importante :
// ne pas ajouter de nouvelle responsabilité produit majeure dans ce fichier.
// Toute nouvelle logique durable doit aller dans :
// - domain/* pour le modèle métier ;
// - features/roll3d/* pour le lancement Roll3D ;
// - features/rollResult/* pour le futur rendu commun des résultats ;
// - features/preparation/* pour la préparation du jeu.
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";

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

import { PreparedRollSaveSheet } from "../features/roll/components/PreparedRollSaveSheet";

import { useArcaneLayout } from "../theme/useArcaneLayout";
import { useArcaneTheme } from "../theme/ArcaneThemeProvider";

import {
  SessionMenuModal,
  type SessionMenuItem,
} from "../features/roll/components/SessionMenuModal";

import { ActionRail } from "../features/roll/components/ActionRail";

import { PreparedRollEditSheet } from "../features/roll/components/PreparedRollEditSheet";

import { useDraftTableActions } from "../features/roll/hooks/useDraftTableActions";
import { useQuickRollDraft } from "../features/roll/hooks/useQuickRollDraft";
import { useRollTableData } from "../features/roll/hooks/useRollTableData";

import { rollGroup, type GroupRollResult } from "../core/roll/roll";
import { evaluateRule } from "../core/rules/evaluate";

import { buildDraftTempRuleFromPreset } from "../features/roll/helpers/buildDraftTempRuleFromPreset";

import { QuickBehaviorConfigModal } from "../features/roll/components/QuickBehaviorConfigModal";
import { QuickDieBehaviorPickerModal } from "../features/roll/components/QuickDieBehaviorPickerModal";
import { useQuickBehaviorConfigModal } from "../features/roll/hooks/useQuickBehaviorConfigModal";
import { useQuickDieBehaviorPicker } from "../features/roll/hooks/useQuickDieBehaviorPicker";
import {
  formatDraftGroupDiceLabel,
  formatSavedActionDetail,
  getRuleSummaryFromRuleId,
  getRuleSummaryFromTempRule,
} from "../features/roll/helpers/rollDisplaySummary";
import { behaviorNeedsSelectionConfig } from "../features/roll/helpers/quickBehaviorConfig";

import {
  PremiumDiceWheel,
  PremiumPreparedRollCard,
  PremiumResultCard,
  PremiumRollButton,
  PremiumRollScreenBackground,
  PremiumSessionHeader,
} from "../features/roll/premium";

import { runPremiumTiming } from "../theme/premium/premiumAnimation";
import { usePremiumTheme } from "../theme/premium/usePremiumTheme";

import type {
  Roll3DDieSource,
} from "../features/roll3d/types";

import {
  createRoll3DDraftFromDice,
} from "../features/roll3d/logic/roll3DDraft";
import { createRoll3DHandoff } from "../features/roll3d/logic/roll3DHandoff";

import {
  animatePreparationLayout,
  countFreeDiceBySides,
  createEmptyTablesSessionMenuItem,
  createFreeModeSessionMenuItem,
  createLoadingTablesSessionMenuItem,
  createNoProfileSessionMenuItem,
  createPreparedPreviewRollRule,
  createRoll3DBehaviorRefFromRuleLike,
  createRoll3DDiceInputsFromPreparedGroup,
  findDraftGroupById,
  findStandardQuickGroup,
  formatPreparedCardDieLabel,
  mapPreparedEditDiceToPreparedCardLines,
  resetPreparationSessionUiState,
  resetPreparedRollUiState,
  resolvePreparedRuleId,
  showDuplicateActionNameWarning,
  STANDARD_DICE_SIDES,
  validateActionHasDice,
  validateRequiredActionName,
  validateSourceActionFound,
  validateUserEditableTable,
  type PreparedRoll,
  type PreparationSaveTarget,
  type PreparationSaveTargetParams,
} from "../features/preparation";

export default function RollScreen() {
  const layout = useArcaneLayout();
  const { theme, styles } = useArcaneTheme();
  const premium = usePremiumTheme();

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

  const [preparedRoll, setPreparedRoll] = useState<PreparedRoll | null>(null);
  const [latestResult, setLatestResult] = useState<GroupRollResult | null>(
    null,
  );
  const [showPreparedEditSheet, setShowPreparedEditSheet] = useState(false);

  const resetOverlayAnim = useRef(new Animated.Value(0)).current;
  const resetSpinnerAnim = useRef(new Animated.Value(0)).current;
  const resultAppearAnim = useRef(new Animated.Value(1)).current;

  const [isResettingPreparedRoll, setIsResettingPreparedRoll] = useState(false);

  const [showTableSessionMenu, setShowTableSessionMenu] = useState(false);
  const [showProfileSessionMenu, setShowProfileSessionMenu] = useState(false);

  const [showActionDraftSaveMenu, setShowActionDraftSaveMenu] = useState(false);
  const [actionCopyName, setActionCopyName] = useState("");
  const [freeSaveActionName, setFreeSaveActionName] = useState("");

  const [allTables, setAllTables] = useState<TableRow[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  const db = useDb();
  const { activeTableId, setActiveTableId, clearActiveTableId } =
    useActiveTable();
  const [, setResults] = useState<GroupRollResult[]>([]);
  const [, setShowSaveOptions] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newProfileName, setNewProfileName] = useState("Profil principal");
  const [availableSaveTargets, setAvailableSaveTargets] = useState<
    PreparationSaveTarget[]
  >([]);
  const [loadingSaveTargets, setLoadingSaveTargets] = useState(false);
  const [, setShowAdvanced] = useState(false);
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

  const [focusedPreparedLineIndex, setFocusedPreparedLineIndex] = useState<
    number | null
  >(null);

  const quickBehaviorConfig = useQuickBehaviorConfigModal();

  const { revision, notifyDataChanged } = useDataRefresh();

  const tableId = useMemo(
    () =>
      typeof activeTableId === "string" && activeTableId.length > 0
        ? activeTableId
        : "",
    [activeTableId],
  );

  const { table, profiles, rulesMap, availableRules, error, reloadGroups } =
    useRollTableData({
      db,
      tableId,
    });

  const reloadTables = useCallback(async () => {
    setLoadingTables(true);

    try {
      const rows = await listTables(db);
      setAllTables(rows);
    } finally {
      setLoadingTables(false);
    }
  }, [db]);

  useEffect(() => {
    void reloadTables();
  }, [reloadTables, revision]);

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
    setDraftResults,
    selectedDraftGroupId,
    setSelectedDraftGroupId,

    resetDraftEditorState,
    resetDraftState,
    getNonEmptyDraftGroups,

    addQuickStandardDie,
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
    clearDraft,
  } = useQuickRollDraft({
    db,
    table,
    availableRules,
  });

  const quickDieBehaviorPicker = useQuickDieBehaviorPicker({
    addQuickPresetDie,
    quickBehaviorConfig,
    availableRules,
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

  const {
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
    resetDraftEditorState();
  }, [
    clearDraft,
    resetDraftEditorState,
    setDraftResults,
    setSelectedDraftGroupId,
  ]);

  function handleClearPreparedRoll() {
    if (isResettingPreparedRoll) return;

    setIsResettingPreparedRoll(true);
    resetOverlayAnim.setValue(0);

    runPremiumTiming(premium, resetOverlayAnim, {
      toValue: 1,
      duration: premium.animation.feedback,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        animatePreparationLayout();

        resetFreeDraftState();

        resetPreparedRollUiState({
          setPreparedRoll,
          setLatestResult,
          setShowPreparedEditSheet,
          setQuickModifier,
          setFocusedPreparedLineIndex,
        });

        requestAnimationFrame(() => {
          setTimeout(() => {
            runPremiumTiming(premium, resetOverlayAnim, {
              toValue: 0,
              duration: premium.animation.entrance,
              useNativeDriver: true,
            }).start(() => {
              setIsResettingPreparedRoll(false);
            });
          }, 220);
        });
      }, 260);
    });
  }

  async function handleRollPreparedLine(index: number) {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup) return;

    const die = editablePreparedDraftGroup.dice[index];
    if (!die) return;

    const tempRule = die.rule_temp as any | null | undefined;
    const dbRule = die.rule_id ? rulesMap[die.rule_id] : null;
    const sourceRule = tempRule ?? dbRule;

    const rule = createPreparedPreviewRollRule({
      sourceRule,
      fallbackId: `temp-line-rule-${index}`,
    });

    const lineLabel = formatPreparedCardDieLabel({
      sides: die.sides,
      qty: die.qty,
      modifier: die.modifier ?? 0,
      sign: die.sign ?? 1,
    });

    const result = rollGroup({
      groupId: `${editablePreparedDraftGroup.id}-line-${index}`,
      label: `Ligne seule — ${lineLabel}`,
      entries: [
        {
          entryId: `${editablePreparedDraftGroup.id}-line-${index}-entry`,
          sides: die.sides,
          qty: die.qty,
          modifier: die.modifier ?? 0,
          sign: die.sign ?? 1,
          rule,
        },
      ],
      groupRule: null,
      evaluateRule,
    });

    setLatestResult(result);
  }

  function handleFocusPreparedLine(index: number) {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup?.dice[index]) return;

    setFocusedPreparedLineIndex(index);
  }

  function handleClearFocusedPreparedLine() {
    setFocusedPreparedLineIndex(null);
  }

  function handleLaunchPreparedInRoll3D() {
    if (!editablePreparedDraftGroup) {
      return;
    }

    const source: Roll3DDieSource =
      preparedRoll?.source === "action_draft" ? "action" : "prepared";

    const dice = createRoll3DDiceInputsFromPreparedGroup({
      group: editablePreparedDraftGroup,
      source,
      focusedLineIndex: focusedPreparedLineIndex,
      rulesMap,
    });

    if (dice.length === 0) {
      return;
    }

    const groupRuleSource =
      (editablePreparedDraftGroup as any).rule_temp ??
      (editablePreparedDraftGroup.rule_id
        ? rulesMap[editablePreparedDraftGroup.rule_id]
        : null);

    const groupBehavior = createRoll3DBehaviorRefFromRuleLike(groupRuleSource);

    const draft = createRoll3DDraftFromDice(dice, {
      groupBehavior,
    });

    const handoffId = createRoll3DHandoff({
      label:
        focusedPreparedLine?.label ??
        editablePreparedDraftGroup.name ??
        "Jet préparé",
      draft,
    });

    router.replace({
      pathname: "/roll",
      params: {
        handoffId,
      },
    });
  }

  async function handleOpenSaveDraftModal() {
    const nonEmptyGroups = getNonEmptyDraftGroups();
    if (nonEmptyGroups.length === 0) return;

    setLoadingSaveTargets(true);

    try {
      const targets = await getAvailableSaveTargets();
      setAvailableSaveTargets(targets);
      const defaultActionName =
        editablePreparedDraftGroup?.name?.trim() || "Jet rapide";

      setNewTableName(`Nouvelle table (${new Date().toLocaleDateString()})`);
      setNewProfileName("Profil principal");
      setFreeSaveActionName(defaultActionName);
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

  async function handleSaveDraftTarget(params: PreparationSaveTargetParams) {
    try {
      const trimmedActionName = freeSaveActionName.trim();

      const sourceGroupId = editablePreparedDraftGroup?.id ?? null;

      const actionNameValidation = validateRequiredActionName(trimmedActionName);

      if (!actionNameValidation.valid) {
        Alert.alert("Nom d’action obligatoire", actionNameValidation.message);
        return;
      }

      if (params.mode === "new_table_new_profile") {
        const result = await createNewTableFromName(
          params.tableName ?? "",
          params.profileName ?? "Profil principal",
          {
            actionNameOverride: trimmedActionName,
            sourceGroupId,
          },
        );

        await reloadTables();

        if (result?.tableId) {
          await reloadGroups(result.tableId);
        }

        notifyDataChanged();

        setSelectedProfileId(null);
        return;
      }

      if (params.mode === "existing_table_new_profile") {
        if (!params.tableId) {
          throw new Error("Table cible manquante.");
        }

        const result = await appendDraftToExistingTableNewProfile(
          params.tableId,
          params.profileName ?? "Profil principal",
          {
            actionNameOverride: trimmedActionName,
            sourceGroupId,
          },
        );

        await reloadTables();
        await reloadGroups(result?.tableId ?? params.tableId);

        notifyDataChanged();

        if (result?.profileId) {
          setSelectedProfileId(result.profileId);
        }

        return;
      }

      if (!params.tableId || !params.profileId) {
        throw new Error("Table ou profil cible manquant.");
      }

      const result = await appendDraftToExistingProfile(
        params.tableId,
        params.profileId,
        {
          actionNameOverride: trimmedActionName,
          sourceGroupId,
        },
      );

      await reloadTables();
      await reloadGroups(result?.tableId ?? params.tableId);

      notifyDataChanged();

      setSelectedProfileId(result?.profileId ?? params.profileId);
    } catch (error) {
      if (await showDuplicateActionNameWarning(error)) {
        return;
      }

      throw error;
    }
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

    if (
      preparedRoll?.source === "action" ||
      preparedRoll?.source === "action_draft"
    ) {
      resetFreeDraftState();
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

    animatePreparationLayout();

    const draftGroupId = loadSavedGroupIntoDraft({
      group: {
        id: action.group.id,
        name: action.group.name,
        rule_id: action.group.rule_id,
      },
      dice: action.dice.map((die) => ({
        label: die.label ?? null,
        sides: die.sides,
        qty: die.qty,
        modifier: die.modifier ?? 0,
        sign: die.sign ?? 1,
        rule_id: die.rule_id ?? null,
      })) as any,
      draftName: action.group.name,
    });

    setQuickModifier(0);
    setSelectedDraftGroupId(draftGroupId);

    setPreparedRoll({
      source: "action_draft",
      profileId: activeProfile.id,
      groupId,
      draftGroupId,
      label: action.group.name,
    });

    setLatestResult(null);
    setShowPreparedEditSheet(false);
    setFocusedPreparedLineIndex(null);
  }

  function handleAddQuickStandardDie(sides: number) {
    animatePreparationLayout();

    if (
      preparedRoll?.source === "action" ||
      preparedRoll?.source === "action_draft"
    ) {
      resetFreeDraftState();
    }

    addQuickStandardDie(sides, {
      modifier: quickModifier,
    });

    setPreparedRoll({ source: "free" });
    setLatestResult(null);

    if (
      preparedRoll?.source === "action" ||
      preparedRoll?.source === "action_draft"
    ) {
      setFocusedPreparedLineIndex(null);
    }

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
    setShowPreparedEditSheet(true);
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
  }

  function handleRenamePreparedDie(index: number, label: string) {
    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      return;
    }

    if (!editablePreparedDraftGroup) return;

    setDraftGroups((currentGroups) =>
      currentGroups.map((group) => {
        if (group.id !== editablePreparedDraftGroup.id) {
          return group;
        }

        return {
          ...group,
          dice: group.dice.map((die, dieIndex) =>
            dieIndex === index
              ? {
                ...die,
                label,
              }
              : die,
          ),
        };
      }),
    );

    setLatestResult(null);
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

    quickBehaviorConfig.close();

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

    setFocusedPreparedLineIndex((current) => {
      if (current == null) return null;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
  }

  const handleClearActiveSession = useCallback(async (): Promise<void> => {
    animatePreparationLayout();

    await clearActiveTableId();
    notifyDataChanged();

    resetDraftState();
    resetPreparationSessionUiState({
      setPreparedRoll,
      setLatestResult,
      setShowPreparedEditSheet,
      setQuickModifier,
      setFocusedPreparedLineIndex,
      setSelectedProfileId,
      setResults,
      setShowTableSessionMenu,
      setShowProfileSessionMenu,
    });
  }, [clearActiveTableId, resetDraftState, notifyDataChanged]);

  const handleSelectActiveTable = useCallback(
    async (nextTableId: string): Promise<void> => {
      animatePreparationLayout();

      await setActiveTableId(nextTableId);
      notifyDataChanged();

      resetDraftState();
      resetPreparationSessionUiState({
        setPreparedRoll,
        setLatestResult,
        setShowPreparedEditSheet,
        setQuickModifier,
        setFocusedPreparedLineIndex,
        setSelectedProfileId,
        setResults,
        setShowTableSessionMenu,
        setShowProfileSessionMenu,
      });
    },
    [setActiveTableId, resetDraftState, notifyDataChanged],
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

    const tableValidation = validateUserEditableTable({
      tableIsSystem: table.is_system === 1,
      action: "update",
    });

    if (!tableValidation.valid) {
      console.warn(tableValidation.message);
      return;
    }

    const diceValidation = validateActionHasDice({
      diceCount: editablePreparedDraftGroup.dice.length,
    });

    if (!diceValidation.valid) {
      console.warn(diceValidation.message);
      return;
    }

    const profileEntry = profiles.find(
      (entry) => entry.profile.id === preparedRoll.profileId,
    );

    const sourceAction = profileEntry?.groups.find(
      (entry) => entry.group.id === preparedRoll.groupId,
    );

    const sourceActionValidation = validateSourceActionFound({
      found: !!sourceAction,
    });

    if (!sourceActionValidation.valid) {
      console.warn(sourceActionValidation.message);
      return;
    }

    if (!sourceAction) {
      console.warn("Action source introuvable.");
      return;
    }

    try {
      animatePreparationLayout();

      const resolvedGroupRuleId = await resolvePreparedRuleId(
        db,
        editablePreparedDraftGroup.rule_id ?? null,
        (editablePreparedDraftGroup as any).rule_temp ?? null,
      );

      await updateGroupName(
        db,
        preparedRoll.groupId,
        editablePreparedDraftGroup.name.trim() || preparedRoll.label,
      );

      await updateGroupRuleId(db, preparedRoll.groupId, resolvedGroupRuleId);

      for (const die of sourceAction.dice) {
        await deleteGroupDie(db, die.id);
      }

      for (const die of editablePreparedDraftGroup.dice) {
        const resolvedDieRuleId = await resolvePreparedRuleId(
          db,
          die.rule_id ?? null,
          (die as any).rule_temp ?? null,
        );

        await createGroupDie(db, {
          groupId: preparedRoll.groupId,
          label: (die as any).label ?? null,
          sides: die.sides,
          qty: die.qty,
          modifier: die.modifier ?? 0,
          sign: die.sign ?? 1,
          rule_id: resolvedDieRuleId,
        });
      }

      await reloadGroups(table.id);
      notifyDataChanged();

      setSelectedProfileId(preparedRoll.profileId);

      setPreparedRoll({
        ...preparedRoll,
        label: editablePreparedDraftGroup.name.trim() || preparedRoll.label,
      });

      setLatestResult(null);
      setShowActionDraftSaveMenu(false);
    } catch (error) {
      if (await showDuplicateActionNameWarning(error)) {
        return;
      }

      throw error;
    }
  }

  function handlePrepareCreateActionCopyName() {
    if (preparedRoll?.source !== "action_draft") return;
    if (!editablePreparedDraftGroup) return;

    setActionCopyName(
      `${editablePreparedDraftGroup.name || preparedRoll.label} — variante`,
    );
  }

  async function handleCreateActionCopyFromDraft() {
    if (preparedRoll?.source !== "action_draft") return;
    if (!editablePreparedDraftGroup) return;
    if (!table) return;

    const tableValidation = validateUserEditableTable({
      tableIsSystem: table.is_system === 1,
      action: "create",
    });

    if (!tableValidation.valid) {
      console.warn(tableValidation.message);
      return;
    }

    const diceValidation = validateActionHasDice({
      diceCount: editablePreparedDraftGroup.dice.length,
    });

    if (!diceValidation.valid) {
      console.warn(diceValidation.message);
      return;
    }

    const trimmedName = actionCopyName.trim();

    const actionNameValidation = validateRequiredActionName(trimmedName);

    if (!actionNameValidation.valid) {
      console.warn(actionNameValidation.message);
      return;
    }

    const newActionName = trimmedName;

    try {
      animatePreparationLayout();

      const resolvedGroupRuleId = await resolvePreparedRuleId(
        db,
        editablePreparedDraftGroup.rule_id ?? null,
        (editablePreparedDraftGroup as any).rule_temp ?? null,
      );

      const newGroupId = await createGroup(db, {
        profileId: preparedRoll.profileId,
        name: newActionName,
        rule_id: resolvedGroupRuleId,
      });

      for (const die of editablePreparedDraftGroup.dice) {
        const resolvedDieRuleId = await resolvePreparedRuleId(
          db,
          die.rule_id ?? null,
          (die as any).rule_temp ?? null,
        );

        await createGroupDie(db, {
          groupId: newGroupId,
          label: (die as any).label ?? null,
          sides: die.sides,
          qty: die.qty,
          modifier: die.modifier ?? 0,
          sign: die.sign ?? 1,
          rule_id: resolvedDieRuleId,
        });
      }

      await reloadGroups(table.id);
      notifyDataChanged();

      setSelectedProfileId(preparedRoll.profileId);

      setPreparedRoll({
        source: "action_draft",
        profileId: preparedRoll.profileId,
        groupId: newGroupId,
        draftGroupId: editablePreparedDraftGroup.id,
        label: newActionName,
      });

      setLatestResult(null);
      setShowActionDraftSaveMenu(false);
      setActionCopyName("");
    } catch (error) {
      if (await showDuplicateActionNameWarning(error)) {
        return;
      }

      throw error;
    }
  }

  const preparedQuickRollDetail = useMemo(
    () => formatDraftGroupDiceLabel(editablePreparedDraftGroup, rulesMap),
    [editablePreparedDraftGroup, rulesMap],
  );

  const preparedQuickEditDice = useMemo(
    () =>
      editablePreparedDraftGroup?.dice.map((die) => ({
        label: (die as any).label ?? null,
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
      mapPreparedEditDiceToPreparedCardLines({
        dice: preparedQuickEditDice,
        draftGroupId: editablePreparedDraftGroup?.id,
      }),
    [preparedQuickEditDice, editablePreparedDraftGroup?.id],
  );

  const focusedPreparedLine =
    focusedPreparedLineIndex != null
      ? (preparedCardLines[focusedPreparedLineIndex] ?? null)
      : null;

  const isFocusedLineMode = !!focusedPreparedLine;

  useEffect(() => {
    if (focusedPreparedLineIndex == null) return;

    if (
      preparedRoll?.source !== "free" &&
      preparedRoll?.source !== "action_draft"
    ) {
      setFocusedPreparedLineIndex(null);
      return;
    }

    const diceCount = editablePreparedDraftGroup?.dice.length ?? 0;

    if (focusedPreparedLineIndex < 0 || focusedPreparedLineIndex >= diceCount) {
      setFocusedPreparedLineIndex(null);
    }
  }, [focusedPreparedLineIndex, preparedRoll, editablePreparedDraftGroup]);

  const freeDiceCountsBySides = useMemo(() => {
    if (preparedRoll?.source !== "free") {
      return {};
    }

    return countFreeDiceBySides(standardPreparedQuickGroup?.dice);
  }, [preparedRoll?.source, standardPreparedQuickGroup]);

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

  useEffect(() => {
    if (!latestResult) {
      resultAppearAnim.setValue(1);
      return;
    }

    resultAppearAnim.setValue(0);

    runPremiumTiming(premium, resultAppearAnim, {
      toValue: 1,
      duration: premium.animation.normal,
      useNativeDriver: true,
    }).start();
  }, [latestResult, resultAppearAnim, premium]);

  const isFreeIdleCockpit = !hasActiveTable && !hasPreparedRoll && !hasResult;
  const isTableIdleCockpit = hasActiveTable && !hasPreparedRoll && !hasResult;

  const isResultCockpit = hasResult;
  const isFullCockpit = hasActiveTable && hasPreparedRoll && hasResult;

  const screenTopPadding = isVerySmallScreen
    ? layout.insets.top + 2
    : isCompactScreen
      ? layout.insets.top + 4
      : layout.insets.top + theme.spacing.xs;

  const screenBottomSafePadding = Math.max(
    layout.insets.bottom + theme.spacing.md,
    theme.spacing.xl,
  );

  const cockpitBottomPadding =
    cockpitDensity === "tight"
      ? Math.max(layout.insets.bottom + 10, 18)
      : cockpitDensity === "compact"
        ? Math.max(layout.insets.bottom + 12, 22)
        : Math.max(layout.insets.bottom + 14, 26);

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

  useEffect(() => {
    if (preparedRoll?.source !== "free") return;

    if (!hasPreparedQuickRoll) {
      setPreparedRoll(null);
      setLatestResult(null);
      setShowPreparedEditSheet(false);
    }
  }, [hasPreparedQuickRoll, preparedRoll]);

  useEffect(() => {
    if (!isResettingPreparedRoll) {
      resetSpinnerAnim.setValue(0);
      return;
    }

    resetSpinnerAnim.setValue(0);

    if (premium.animation.normal <= 0) {
      return;
    }

    const loop = Animated.loop(
      Animated.timing(resetSpinnerAnim, {
        toValue: 1,
        duration: premium.animation.slow * 2.4,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [isResettingPreparedRoll, resetSpinnerAnim, premium]);

  const tableSessionMenuItems = useMemo<SessionMenuItem[]>(() => {
    const freeModeItem = createFreeModeSessionMenuItem({
      activeTableId,
      onPress: async (): Promise<void> => {
        if (!activeTableId) {
          setShowTableSessionMenu(false);
          return;
        }

        await handleClearActiveSession();
      },
    });

    const loadingItem = createLoadingTablesSessionMenuItem();
    const emptyItem = createEmptyTablesSessionMenuItem();

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
              animatePreparationLayout();

              setSelectedProfileId(entry.profile.id);
              setShowProfileSessionMenu(false);
            },
          }),
        )
        : [createNoProfileSessionMenuItem()],
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
            paddingBottom: Math.max(
              layout.insets.bottom + theme.spacing.md,
              theme.spacing.lg,
            ),
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
        position: "relative",
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    >
      <PremiumRollScreenBackground />

      <View
        style={{
          flex: 1,
          zIndex: 1,
          paddingTop: screenTopPadding,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: 0,
        }}
      >
        {/* Zone haute fixe */}
        <View
          style={{
            alignSelf: "center",
            width: "100%",
            maxWidth: layout.maxContentWidth,
            zIndex: 10,
            paddingBottom: isVerySmallScreen ? 2 : 4,
          }}
        >
          <PremiumSessionHeader
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
            paddingBottom: cockpitBottomPadding,
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
            {/* Résultat temporaire de prévisualisation.
            Le rendu final de résultat doit migrer vers Roll3D. */}

            <Animated.View
              style={{
                opacity: resultAppearAnim,
                transform: [
                  {
                    translateY: resultAppearAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                  {
                    scale: resultAppearAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.985, 1],
                    }),
                  },
                ],
              }}
            >
              <PremiumResultCard result={latestResult} />
            </Animated.View>

            <View style={{ marginTop: adaptiveResultToDiceOverlap }}>
              <PremiumDiceWheel
                dice={[...STANDARD_DICE_SIDES]}
                countsBySides={freeDiceCountsBySides}
                modifierValue={quickModifier}
                onIncrementModifier={handleIncrementQuickModifier}
                onDecrementModifier={handleDecrementQuickModifier}
                onPressDie={handleAddQuickStandardDie}
                onLongPressDie={quickDieBehaviorPicker.open}
              />
            </View>

            <View style={{ marginTop: adaptiveDiceToPreparedOverlap }}>
              <PremiumPreparedRollCard
                title={
                  hasPreparedRoll
                    ? (preparedCardName ?? "Jet préparé")
                    : "Jet préparé"
                }
                name={preparedCardName}
                detail={preparedCardDetail}
                lines={preparedCardLines}
                isEmpty={!hasPreparedRoll}
                focusedLineIndex={focusedPreparedLineIndex}
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
                onRollLine={
                  (preparedRoll?.source === "free" ||
                    preparedRoll?.source === "action_draft") &&
                    hasPreparedRoll
                    ? handleRollPreparedLine
                    : undefined
                }
                onClear={
                  hasPreparedRoll && !isResettingPreparedRoll
                    ? handleClearPreparedRoll
                    : undefined
                }
                onSave={
                  (preparedRoll?.source === "free" ||
                    preparedRoll?.source === "action_draft") &&
                    hasPreparedRoll
                    ? handleOpenPreparedSave
                    : undefined
                }
                onRenameLine={
                  (preparedRoll?.source === "free" ||
                    preparedRoll?.source === "action_draft") &&
                    hasPreparedRoll
                    ? handleRenamePreparedDie
                    : undefined
                }
                onFocusLine={
                  (preparedRoll?.source === "free" ||
                    preparedRoll?.source === "action_draft") &&
                    hasPreparedRoll
                    ? handleFocusPreparedLine
                    : undefined
                }
              />
            </View>
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
            paddingBottom: screenBottomSafePadding,
          }}
        >
          <PremiumRollButton
            disabled={!hasPreparedRoll}
            focusedLine={isFocusedLineMode}
            focusedLineLabel={focusedPreparedLine?.label ?? null}
            onClearFocusedLine={handleClearFocusedPreparedLine}
            onPress={handleLaunchPreparedInRoll3D}
            label={isFocusedLineMode ? "LANCER LA LIGNE EN 3D" : "LANCER EN 3D"}
            disabledLabel="AJOUTE DES DÉS"
          />
        </View>
      </View>

      {hasActiveTable
        ? (() => {
          const floatingAnchorRight = layout.horizontalPadding + 2;

          const floatingAnchorBottom =
            screenBottomSafePadding +
            (isFocusedLineMode
              ? 104
              : hasPreparedRoll || hasResult
                ? 84
                : 118);

          const floatingTopLimit =
            screenTopPadding + (isVerySmallScreen ? 76 : 88);

          const floatingBottomLimit = Math.max(layout.insets.bottom + 14, 34);

          return (
            <View
              pointerEvents="box-none"
              style={{
                position: "absolute",
                right: floatingAnchorRight,
                bottom: floatingAnchorBottom,
                zIndex: 35,
                elevation: 35,
              }}
            >
              <ActionRail
                profileName={activeProfile?.name ?? null}
                actions={actionRailItems}
                selectedActionId={
                  preparedRoll?.source === "action"
                    ? preparedRoll.groupId
                    : null
                }
                onPrepareAction={handlePrepareSavedAction}
                floatingAnchorRight={floatingAnchorRight}
                floatingAnchorBottom={floatingAnchorBottom}
                floatingTopLimit={floatingTopLimit}
                floatingBottomLimit={floatingBottomLimit}
              />
            </View>
          );
        })()
        : null}

      <Animated.View
        pointerEvents={isResettingPreparedRoll ? "auto" : "none"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 80,
          elevation: 80,
          backgroundColor: "rgba(0, 0, 0, 0.94)",
          opacity: resetOverlayAnim,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            opacity: resetOverlayAnim,
            transform: [
              {
                scale: resetOverlayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1],
                }),
              },
            ],
          }}
        >
          <Animated.View
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              borderWidth: 3,
              borderColor: "rgba(217, 160, 55, 0.22)",
              borderTopColor: theme.colors.accent,
              transform: [
                {
                  rotate: resetSpinnerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
          />

          <Text
            style={{
              color: theme.colors.accent,
              fontSize: 13,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 1.4,
            }}
          >
            Réinitialisation du jet
          </Text>
        </Animated.View>
      </Animated.View>

      <PreparedRollSaveSheet
        visible={showNameModal || showActionDraftSaveMenu}
        source={
          showNameModal
            ? "free"
            : showActionDraftSaveMenu
              ? "action_draft"
              : null
        }
        defaultTableId={table?.id ?? null}
        defaultProfileId={activeProfile?.id ?? null}
        initialTableName={newTableName}
        initialProfileName={newProfileName}
        availableTargets={availableSaveTargets}
        loadingTargets={loadingSaveTargets}
        freeActionName={freeSaveActionName}
        onChangeFreeActionName={setFreeSaveActionName}
        actionLabel={
          preparedRoll?.source === "action_draft" ? preparedRoll.label : null
        }
        tableIsSystem={table?.is_system === 1}
        copyName={actionCopyName}
        onChangeCopyName={setActionCopyName}
        onPrepareCopyName={handlePrepareCreateActionCopyName}
        onClose={() => {
          closeCreateTableModal();
          setShowActionDraftSaveMenu(false);
          setActionCopyName("");
          setFreeSaveActionName("");
        }}
        onConfirmFreeSave={handleSaveDraftTarget}
        onUpdateExistingAction={handleUpdateExistingActionFromDraft}
        onCreateActionCopy={handleCreateActionCopyFromDraft}
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
            const shouldReturnToMainScreen =
              preparedBehaviorFlowOrigin === "tile";

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
              const editingDieSides = quickDieBehaviorPicker.editingDieSides;

              quickBehaviorConfig.close();

              setPreparedEditMode("behavior_picker");

              if (editingDieSides != null) {
                quickDieBehaviorPicker.open(editingDieSides);
              }
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
        onBackFromBehaviorConfig={() => {
          const shouldReturnToMainScreen =
            preparedBehaviorFlowOrigin === "tile";

          const editingDieSides = quickDieBehaviorPicker.editingDieSides;

          quickBehaviorConfig.close();
          quickDieBehaviorPicker.close();

          if (shouldReturnToMainScreen) {
            setPreparedEditMode("dice");
            setPreparedBehaviorTargetIndex(null);
            setDraftBehaviorTarget(null);
            setPreparedBehaviorFlowOrigin(null);
            setShowPreparedEditSheet(false);
            return;
          }

          setPreparedEditMode("behavior_picker");

          if (editingDieSides != null) {
            quickDieBehaviorPicker.open(editingDieSides);
          }
        }}
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
