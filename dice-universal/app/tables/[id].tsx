import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useDb } from "../../data/db/DbProvider";
import { evaluateRule } from "../../core/rules/evaluate";

import type { ProfileRow } from "../../data/repositories/profilesRepo";

import { useTableDetailData } from "../../features/tables/hooks/useTableDetailData";
import { TableProfilesSection } from "../../features/tables/components/TableProfilesSection";
import { TableProfileModals } from "../../features/tables/components/TableProfileModals";
import { TableGroupModals } from "../../features/tables/components/TableGroupModals";
import { TableDieModals } from "../../features/tables/components/TableDieModals";
import { TableRenameModal } from "../../features/tables/components/TableRenameModal";

import { useTableDetailActions } from "../../features/tables/hooks/useTableDetailActions";
import { TableDetailHeader } from "../../features/tables/components/TableDetailHeader";
import { useTableDetailUi } from "../../features/tables/hooks/useTableDetailUi";

import { CreateActionWizardModal } from "../../features/tables/actionWizard/CreateActionWizardModal";
import { useCreateActionWizard } from "../../features/tables/actionWizard/useCreateActionWizard";
import { useCreateActionFromWizard } from "../../features/tables/actionWizard/useCreateActionFromWizard";

import { getCompatibleRulesForContext } from "../../features/rules/helpers/ruleCompatibility";
import { isLocalRule } from "../../data/repositories/rulesRepo";

import { useHumanRuleEditor } from "../../features/rules/hooks/useHumanRuleEditor";
import { HumanRuleEditorModal } from "../../features/rules/components/HumanRuleEditorModal";
import { useRulesData } from "../../features/rules/hooks/useRulesData";

type FreeRollResult = {
  naturalValues: number[];
  signedValues: number[];
  baseTotal: number;
  totalWithModifier: number;
  finalTotal: number;
  evalResult: any | null;
  ruleName: string;
  sides: number;
  qty: number;
  modifier: number;
  sign: number;
};

export default function TableDetailScreen() {
  const db = useDb();
  const {
    saveRule,
  } = useRulesData({ db });
  const { id } = useLocalSearchParams<{ id: string }>();

  const tableId = useMemo(() => (typeof id === "string" ? id : ""), [id]);

  const {
    showEditModal,
    editingRule,
    form,
    previewValues,
    previewSides,
    previewModifier,
    previewSign,
    previewResult,
    formError,
    setPreviewValues,
    setPreviewSides,
    setPreviewModifier,
    setPreviewSign,
    openCreateFromWizard,
    closeEditor,
    updateForm,
    updateRangeRow,
    addRangeRow,
    removeRangeRow,
    setScope,
    setSupportedSidesText,
    getRulePayload,
    computePreview,
  } = useHumanRuleEditor();

  const {
    renameValue,
    setRenameValue,
    showRenameModal,
    setShowRenameModal,

    showCreateProfileModal,
    setShowCreateProfileModal,
    newProfileName,
    setNewProfileName,

    showRenameProfileModal,
    setShowRenameProfileModal,
    editingProfile,
    setEditingProfile,
    renameProfileValue,
    setRenameProfileValue,

    showRenameGroupModal,
    setShowRenameGroupModal,
    editingGroup,
    setEditingGroup,
    renameGroupValue,
    setRenameGroupValue,

    showEditGroupRuleModal,
    setShowEditGroupRuleModal,
    editingGroupForRule,
    setEditingGroupForRule,
    selectedGroupRuleId,
    setSelectedGroupRuleId,

    showCreateDieModal,
    setShowCreateDieModal,
    targetGroupForNewDie,
    // setTargetGroupForNewDie,
    newDieSides,
    setNewDieSides,
    newDieQty,
    setNewDieQty,
    newDieModifier,
    setNewDieModifier,
    newDieSign,
    setNewDieSign,
    newDieRuleId,
    setNewDieRuleId,

    editingDie,
    setEditingDie,
    editDieSides,
    setEditDieSides,
    editDieQty,
    setEditDieQty,
    editDieModifier,
    setEditDieModifier,
    editDieSign,
    setEditDieSign,
    selectedRuleId,
    setSelectedRuleId,

    resetCreateProfileForm,
    resetCreateDieForm,
    openRenameProfileModal,
    openRenameGroupModal,
    openEditGroupRuleModal,
    openEditDieModal,

    openRenameTableModal,
    closeRenameTableModal,

    openCreateProfileModal,
    closeCreateProfileModal,

    closeRenameProfileModal,
    closeRenameGroupModal,
    closeEditGroupRuleModal,
    openCreateDieModal,
    closeCreateDieModal,
    closeEditDieModal,

    showCreateActionWizard,
    targetProfileForActionWizard,
    openCreateActionWizard,
    closeCreateActionWizard,
  } = useTableDetailUi();

  const {
    table,
    profiles,
    error,
    load,
    getRuleName,
    modernRules,
    legacyRules,
  } = useTableDetailData({
    db,
    tableId,
  });

  const {
    submitRenameTable,
    submitCreateProfile,
    submitRenameProfile,
    submitDeleteProfile,
    submitRenameGroup,
    submitEditGroupRule,
    submitDeleteGroup,
    submitCreateDie,
    submitEditDie,
    submitDeleteDie,
  } = useTableDetailActions({
    db,
    table,
    load,
    tableUi: {
      renameValue,
      setShowRenameModal,
    },
    profileUi: {
      newProfileName,
      resetCreateProfileForm,
      setShowCreateProfileModal,
      editingProfile,
      renameProfileValue,
      setShowRenameProfileModal,
      setEditingProfile,
      setRenameProfileValue,
    },
    groupUi: {
      editingGroup,
      renameGroupValue,
      setShowRenameGroupModal,
      setEditingGroup,
      setRenameGroupValue,
      editingGroupForRule,
      selectedGroupRuleId,
      setShowEditGroupRuleModal,
      setEditingGroupForRule,
      setSelectedGroupRuleId,
    },
    dieUi: {
      targetGroupForNewDie,
      newDieSides,
      newDieQty,
      newDieModifier,
      newDieSign,
      newDieRuleId,
      resetCreateDieForm,
      setShowCreateDieModal,
      editingDie,
      editDieSides,
      editDieQty,
      editDieModifier,
      editDieSign,
      selectedRuleId,
      setEditingDie,
      setSelectedRuleId,
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

  const {
    submitError: wizardSubmitError,
    submit: submitWizardAction,
    resetSubmitState: resetWizardSubmitState,
  } = useCreateActionFromWizard({
    db,
    tableId,
    tableName: table?.name ?? "",
    profile: targetProfileForActionWizard,
    reload: load,
    onSuccess: () => {
      closeWizardState();
      closeCreateActionWizard();
    },
  });

  const [freeDieSides, setFreeDieSides] = useState("6");
  const [freeDieQty, setFreeDieQty] = useState("1");
  const [freeDieModifier, setFreeDieModifier] = useState("0");
  const [freeDieSign, setFreeDieSign] = useState<"1" | "-1">("1");
  const [freeRuleId, setFreeRuleId] = useState<string | null>(null);

  const [freeRollResult, setFreeRollResult] = useState<FreeRollResult | null>(null);
  const [freeRollError, setFreeRollError] = useState<string | null>(null);
  const [pendingFreeRollPrefill, setPendingFreeRollPrefill] = useState(false);

  const compatibleRulesForWizard = useMemo(() => {
    if (!wizardDraft.behaviorType || !wizardDraft.die.sides) {
      return [];
    }

    const wantedScope =
      wizardDraft.behaviorType === "success_pool" ? "group" : "entry";

    const allRules = [...modernRules, ...legacyRules];

    const compatible = getCompatibleRulesForContext(allRules, {
      scope: wantedScope,
      sides: [wizardDraft.die.sides],
    });

    return [...compatible].sort((a, b) => {
      const aLocal = isLocalRule(a);
      const bLocal = isLocalRule(b);

      if (aLocal !== bLocal) {
        return aLocal ? -1 : 1;
      }

      const aCustom = a.is_system !== 1;
      const bCustom = b.is_system !== 1;

      if (aCustom !== bCustom) {
        return aCustom ? -1 : 1;
      }

      return a.name.localeCompare(b.name, "fr");
    });
  }, [
    wizardDraft.behaviorType,
    wizardDraft.die.sides,
    modernRules,
    legacyRules,
  ]);

  const compatibleRulesForFreeRoll = useMemo(() => {
    const sides = Number(freeDieSides);

    if (!Number.isFinite(sides) || sides <= 0) {
      return [];
    }

    const allRules = [...modernRules, ...legacyRules];

    const compatible = getCompatibleRulesForContext(allRules, {
      scope: "entry",
      sides: [sides],
    });

    return [...compatible].sort((a, b) => {
      const aLocal = isLocalRule(a);
      const bLocal = isLocalRule(b);

      if (aLocal !== bLocal) {
        return aLocal ? -1 : 1;
      }

      const aCustom = a.is_system !== 1;
      const bCustom = b.is_system !== 1;

      if (aCustom !== bCustom) {
        return aCustom ? -1 : 1;
      }

      return a.name.localeCompare(b.name, "fr");
    });
  }, [freeDieSides, modernRules, legacyRules]);

  const selectedFreeRule = useMemo(() => {
    if (!freeRuleId) return null;
    return compatibleRulesForFreeRoll.find((rule) => rule.id === freeRuleId) ?? null;
  }, [compatibleRulesForFreeRoll, freeRuleId]);

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Erreur</Text>
        <Text style={{ marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

  if (!table) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          Table introuvable
        </Text>
        <Text style={{ marginTop: 8, opacity: 0.7 }}>id: {tableId}</Text>
      </View>
    );
  }

  const isSystem = table.is_system === 1;
  const currentTableName = table.name;

  function handleOpenCreateActionWizard(profile: ProfileRow) {
    resetWizardSubmitState();
    openCreateActionWizard(profile);
    openWizardState();

    const shouldApplyFreeRollPrefill = pendingFreeRollPrefill && freeRollResult;

    if (shouldApplyFreeRollPrefill) {
      applyFreeRollPrefillToWizard();
      setPendingFreeRollPrefill(false);
    }
  }

  function handleCloseCreateActionWizard() {
    resetWizardSubmitState();
    closeWizardState();
    closeCreateActionWizard();
  }

  async function handleSubmitCreateActionWizard() {
    const ok = await submitWizardAction(wizardDraft);
    if (!ok) return;
  }

  function handleOpenAdvancedRuleEditor() {
    handleCloseCreateActionWizard();
    openCreateFromWizard(wizardDraft, currentTableName);
  }

  const actionWizardError = wizardSubmitError ?? wizardError;

  function clearFreeRollFeedback() {
    setFreeRollResult(null);
    setFreeRollError(null);
    setPendingFreeRollPrefill(false);
  }

  function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function extractNumericFinalFromEval(res: any): number | null {
    if (!res) return null;

    if (res.kind === "sum" && typeof res.total === "number") return res.total;
    if (res.kind === "d20" && typeof res.final === "number") return res.final;
    if (res.kind === "pipeline" && typeof res.final === "number") return res.final;

    return null;
  }

  function formatValueList(values: number[]) {
    if (!values || values.length === 0) return "—";
    return values.join(" + ");
  }

  function getFreeRollPrefillSummary() {
    const sides = Number(freeDieSides);
    const qty = Number(freeDieQty);
    const modifier = Number(freeDieModifier);
    const sign = freeDieSign === "-1" ? -1 : 1;

    const parts = [`${qty}d${sides}`];

    if (modifier !== 0) {
      parts.push(`${modifier > 0 ? "+" : ""}${modifier}`);
    }

    if (sign === -1) {
      parts.push("négatif");
    }

    if (selectedFreeRule?.name) {
      parts.push(selectedFreeRule.name);
    } else {
      parts.push("Somme (par défaut)");
    }

    return parts.join(" • ");
  }

  function cancelFreeRollPrefill() {
    setPendingFreeRollPrefill(false);
  }

  function getWizardBehaviorTypeFromFreeRoll():
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
    if (!selectedFreeRule) {
      return Number(freeDieSides) === 20 ? "single_check" : "sum_total";
    }

    if (selectedFreeRule.kind === "sum") return "sum_total";
    if (selectedFreeRule.kind === "d20") return "single_check";
    if (selectedFreeRule.kind === "pool") return "success_pool";
    if (selectedFreeRule.kind === "table_lookup") return "table_lookup";

    if (selectedFreeRule.kind === "pipeline") {
      try {
        const parsed = JSON.parse(selectedFreeRule.params_json || "{}");
        const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
        const firstOp = typeof steps[0]?.op === "string" ? steps[0].op : null;

        if (firstOp === "keep_highest") {
          return Number(steps[0]?.n) === 1 ? "highest_of_pool" : "keep_highest_n";
        }

        if (firstOp === "keep_lowest") {
          return Number(steps[0]?.n) === 1 ? "lowest_of_pool" : "keep_lowest_n";
        }

        if (firstOp === "drop_highest") return "drop_highest_n";
        if (firstOp === "drop_lowest") return "drop_lowest_n";

        if (parsed.output === "lookup_label" || parsed.output === "lookup_value") {
          return "table_lookup";
        }

        if (parsed.output === "successes") {
          return "success_pool";
        }

        return "sum_total";
      } catch {
        return "sum_total";
      }
    }

    return "sum_total";
  }

  function applyFreeRollPrefillToWizard() {
    const sides = Number(freeDieSides);
    const qty = Number(freeDieQty);
    const modifier = Number(freeDieModifier);
    const sign = freeDieSign === "-1" ? -1 : 1;

    const behaviorType = getWizardBehaviorTypeFromFreeRoll();

    setWizardBehaviorType(behaviorType);

    updateWizardDie("sides", Number.isFinite(sides) && sides > 0 ? sides : 6);
    updateWizardDie("qty", Number.isFinite(qty) && qty > 0 ? qty : 1);
    updateWizardDie("modifier", Number.isFinite(modifier) ? modifier : 0);
    updateWizardDie("sign", sign);

    updateWizardDraft("creationMode", "auto");
    updateWizardDraft("selectedRuleId", selectedFreeRule?.id ?? null);
  }

  function handleRollFreeAction() {
    clearFreeRollFeedback();

    const sides = Number(freeDieSides);
    const qty = Number(freeDieQty);
    const modifier = Number(freeDieModifier);
    const sign = freeDieSign === "-1" ? -1 : 1;

    if (!Number.isFinite(sides) || sides <= 0) {
      setFreeRollError("Dé invalide.");
      return;
    }

    if (!Number.isFinite(qty) || qty <= 0) {
      setFreeRollError("La quantité doit être supérieure à 0.");
      return;
    }

    if (!Number.isFinite(modifier)) {
      setFreeRollError("Le modificateur est invalide.");
      return;
    }

    const naturalValues = Array.from({ length: qty }, () => randInt(1, sides));
    const signedValues = naturalValues.map((value) => value * sign);
    const baseTotal = signedValues.reduce((acc, value) => acc + value, 0);
    const totalWithModifier = baseTotal + modifier;

    const appliedRule = selectedFreeRule ?? {
      id: "default-sum",
      name: "Somme (par défaut)",
      kind: "sum",
      params_json: "{}",
    };

    const evalResult = evaluateRule(appliedRule.kind, appliedRule.params_json, {
      values: naturalValues,
      sides,
      modifier,
      sign,
    });

    const numericFinal = extractNumericFinalFromEval(evalResult);
    const finalTotal = numericFinal ?? totalWithModifier;

    setFreeRollResult({
      naturalValues,
      signedValues,
      baseTotal,
      totalWithModifier,
      finalTotal,
      evalResult,
      ruleName: appliedRule.name,
      sides,
      qty,
      modifier,
      sign,
    });
  }


  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <TableDetailHeader
        tableName={table.name}
        isSystem={isSystem}
        onRenameTable={() => openRenameTableModal(table.name)}
        onCreateProfile={openCreateProfileModal}
      />

      <ScrollView>
        <View
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            gap: 10,
          }}
        >
          <Text style={{ fontWeight: "800", fontSize: 16 }}>
            Jet libre (dans cette table)
          </Text>

          <Text style={{ opacity: 0.7 }}>
            Lance des dés rapidement avec les règles de cette table, puis enregistre si besoin.
          </Text>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>Dé</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {["4", "6", "8", "10", "12", "20", "100"].map((sides) => (
                <Pressable
                  key={sides}
                  onPress={() => {
                    setFreeDieSides(sides);
                    setFreeRuleId(null);
                    clearFreeRollFeedback();
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderRadius: 10,
                    opacity: freeDieSides === sides ? 1 : 0.7,
                  }}
                >
                  <Text>{`d${sides}`}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>Quantité</Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Pressable
                onPress={() => {
                  const next = Math.max(1, Number(freeDieQty) - 1);
                  setFreeDieQty(String(next));
                  clearFreeRollFeedback();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderWidth: 1,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontWeight: "800", fontSize: 18 }}>−</Text>
              </Pressable>

              <View
                style={{
                  minWidth: 64,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "700" }}>{freeDieQty}</Text>
              </View>

              <Pressable
                onPress={() => {
                  const next = Math.min(99, Number(freeDieQty) + 1);
                  setFreeDieQty(String(next));
                  clearFreeRollFeedback();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderWidth: 1,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontWeight: "800", fontSize: 18 }}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>Règle compatible</Text>

            {compatibleRulesForFreeRoll.length > 0 ? (
              <View style={{ gap: 8 }}>
                <Pressable
                  onPress={() => {
                    setFreeRuleId(null);
                    clearFreeRollFeedback();
                  }}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 10,
                    opacity: freeRuleId === null ? 1 : 0.7,
                  }}
                >
                  <Text style={{ fontWeight: freeRuleId === null ? "700" : "400" }}>
                    Aucune règle
                  </Text>
                </Pressable>

                {compatibleRulesForFreeRoll.slice(0, 4).map((rule) => (
                  <Pressable
                    key={rule.id}
                    onPress={() => {
                      setFreeRuleId(rule.id);
                      clearFreeRollFeedback();
                    }}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                      opacity: freeRuleId === rule.id ? 1 : 0.7,
                    }}
                  >
                    <Text style={{ fontWeight: freeRuleId === rule.id ? "700" : "400" }}>
                      {rule.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={{ opacity: 0.6 }}>
                Aucune règle compatible trouvée pour ce dé.
              </Text>
            )}
          </View>

          <View style={{ gap: 8 }}>
            <Pressable
              onPress={handleRollFreeAction}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "800" }}>Lancer</Text>
            </Pressable>

            {freeRollError ? (
              <Text style={{ color: "#b00020" }}>{freeRollError}</Text>
            ) : null}
          </View>

          {freeRollResult ? (
            <View
              style={{
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                gap: 8,
              }}
            >
              <Text style={{ fontWeight: "800", fontSize: 15 }}>
                Résultat du jet
              </Text>

              <Text style={{ opacity: 0.72 }}>
                {freeRollResult.qty}d{freeRollResult.sides}
                {freeRollResult.modifier !== 0
                  ? ` ${freeRollResult.modifier > 0 ? "+" : ""}${freeRollResult.modifier}`
                  : ""}
                {freeRollResult.sign === -1 ? " • négatif" : ""}
              </Text>

              <Text style={{ opacity: 0.72 }}>
                Règle : {freeRollResult.ruleName}
              </Text>

              {freeRollResult.evalResult?.kind === "sum" ? (
                <>
                  <Text style={{ fontSize: 22, fontWeight: "800" }}>
                    {freeRollResult.evalResult.total}
                  </Text>

                  <Text style={{ opacity: 0.72 }}>
                    ({formatValueList(freeRollResult.signedValues)})
                  </Text>
                </>
              ) : null}

              {freeRollResult.evalResult?.kind === "d20" ? (
                <>
                  <Text style={{ opacity: 0.72 }}>
                    Naturel : {freeRollResult.evalResult.natural}
                  </Text>

                  <Text style={{ fontWeight: "700" }}>
                    Issue : {freeRollResult.evalResult.outcome}
                  </Text>

                  {freeRollResult.evalResult.threshold != null ? (
                    <Text style={{ opacity: 0.72 }}>
                      Seuil : {freeRollResult.evalResult.threshold}
                    </Text>
                  ) : null}

                  <Text style={{ fontSize: 22, fontWeight: "800" }}>
                    Final : {freeRollResult.evalResult.final}
                  </Text>
                </>
              ) : null}

              {freeRollResult.evalResult?.kind === "pool" ? (
                <>
                  <Text style={{ opacity: 0.72 }}>
                    Jets : {formatValueList(freeRollResult.naturalValues)}
                  </Text>

                  <Text style={{ fontWeight: "700" }}>
                    Issue : {freeRollResult.evalResult.outcome}
                  </Text>

                  <Text>
                    Succès : {freeRollResult.evalResult.successes}
                  </Text>

                  <Text>
                    Faces critiques : {freeRollResult.evalResult.ones}
                  </Text>
                </>
              ) : null}

              {freeRollResult.evalResult?.kind === "table_lookup" ? (
                <>
                  <Text style={{ opacity: 0.72 }}>
                    Valeur : {freeRollResult.evalResult.value}
                  </Text>

                  <Text style={{ fontWeight: "700", fontSize: 18 }}>
                    {freeRollResult.evalResult.label}
                  </Text>
                </>
              ) : null}

              {freeRollResult.evalResult?.kind === "pipeline" ? (
                <>
                  <Text style={{ opacity: 0.72 }}>
                    Valeurs : {formatValueList(freeRollResult.evalResult.values ?? [])}
                  </Text>

                  <Text style={{ opacity: 0.72 }}>
                    Conservés : {formatValueList(freeRollResult.evalResult.kept ?? [])}
                  </Text>

                  {freeRollResult.evalResult.meta?.outcome ? (
                    <Text style={{ fontWeight: "700" }}>
                      Issue : {freeRollResult.evalResult.meta.outcome}
                    </Text>
                  ) : null}

                  {freeRollResult.evalResult.final != null ? (
                    <Text style={{ fontSize: 22, fontWeight: "800" }}>
                      Final : {freeRollResult.evalResult.final}
                    </Text>
                  ) : null}
                </>
              ) : null}

              {freeRollResult.evalResult?.kind === "unknown" ? (
                <>
                  <Text style={{ fontWeight: "700" }}>
                    {freeRollResult.evalResult.message}
                  </Text>

                  <Text style={{ fontSize: 22, fontWeight: "800" }}>
                    {freeRollResult.finalTotal}
                  </Text>
                </>
              ) : null}

              {!isSystem ? (
                <View style={{ gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1 }}>
                  {!pendingFreeRollPrefill ? (
                    <Pressable
                      onPress={() => setPendingFreeRollPrefill(true)}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderRadius: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "800" }}>
                        Utiliser ce jet pour une nouvelle action
                      </Text>
                    </Pressable>
                  ) : (
                    <View
                      style={{
                        borderWidth: 1,
                        borderRadius: 10,
                        padding: 12,
                        gap: 8,
                      }}
                    >
                      <Text style={{ fontWeight: "800" }}>
                        Jet prêt à être transformé en action
                      </Text>

                      <Text style={{ opacity: 0.72 }}>
                        {getFreeRollPrefillSummary()}
                      </Text>

                      <Text style={{ opacity: 0.72 }}>
                        Descends maintenant dans les profils puis appuie sur “Créer une action”.
                      </Text>

                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        <Pressable
                          onPress={cancelFreeRollPrefill}
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderWidth: 1,
                            borderRadius: 10,
                          }}
                        >
                          <Text style={{ fontWeight: "700" }}>Annuler</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              ) : null}

            </View>
          ) : null}

          <Text style={{ opacity: 0.5 }}>
            Lancez pour tester une logique de dé dans cette table.
          </Text>
        </View>

        {pendingFreeRollPrefill ? (
          <View
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              gap: 8,
            }}
          >
            <Text style={{ fontWeight: "800" }}>
              Création d’action à partir du jet libre
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Jet sélectionné : {getFreeRollPrefillSummary()}
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Choisis maintenant le profil sur lequel créer l’action.
            </Text>

            <Pressable
              onPress={cancelFreeRollPrefill}
              style={{
                alignSelf: "flex-start",
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontWeight: "700" }}>Annuler</Text>
            </Pressable>
          </View>
        ) : null}

        <TableProfilesSection
          profiles={profiles}
          isSystem={isSystem}
          getRuleName={getRuleName}
          onRenameProfile={openRenameProfileModal}
          onCreateGroup={handleOpenCreateActionWizard}
          onDeleteProfile={submitDeleteProfile}
          onRenameGroup={openRenameGroupModal}
          onEditGroupRule={openEditGroupRuleModal}
          onCreateDie={openCreateDieModal}
          onDeleteGroup={submitDeleteGroup}
          onEditDie={openEditDieModal}
          onDeleteDie={submitDeleteDie}
        />
      </ScrollView>

      <TableRenameModal
        visible={showRenameModal}
        value={renameValue}
        onChangeValue={setRenameValue}
        onClose={closeRenameTableModal}
        onSubmit={submitRenameTable}
      />

      <TableGroupModals
        modernRules={modernRules}
        legacyRules={legacyRules}
        showRenameGroupModal={showRenameGroupModal}
        renameGroupValue={renameGroupValue}
        onChangeRenameGroupValue={setRenameGroupValue}
        onCloseRenameGroupModal={closeRenameGroupModal}
        onSubmitRenameGroup={submitRenameGroup}
        showEditGroupRuleModal={showEditGroupRuleModal}
        editingGroupForRule={editingGroupForRule}
        selectedGroupRuleId={selectedGroupRuleId}
        onSelectGroupRuleId={setSelectedGroupRuleId}
        onCloseEditGroupRuleModal={closeEditGroupRuleModal}
        onSubmitEditGroupRule={submitEditGroupRule}
      />

      <TableProfileModals
        showCreateProfileModal={showCreateProfileModal}
        newProfileName={newProfileName}
        onChangeNewProfileName={setNewProfileName}
        onCloseCreateProfileModal={closeCreateProfileModal}
        onSubmitCreateProfile={submitCreateProfile}
        showRenameProfileModal={showRenameProfileModal}
        renameProfileValue={renameProfileValue}
        onChangeRenameProfileValue={setRenameProfileValue}
        onCloseRenameProfileModal={closeRenameProfileModal}
        onSubmitRenameProfile={submitRenameProfile}
      />

      <TableDieModals
        showCreateDieModal={showCreateDieModal}
        targetGroupForNewDie={targetGroupForNewDie}
        newDieSides={newDieSides}
        newDieQty={newDieQty}
        newDieModifier={newDieModifier}
        newDieSign={newDieSign}
        newDieRuleId={newDieRuleId}
        modernRules={modernRules}
        legacyRules={legacyRules}
        onChangeNewDieSides={setNewDieSides}
        onChangeNewDieQty={setNewDieQty}
        onChangeNewDieModifier={setNewDieModifier}
        onChangeNewDieSign={setNewDieSign}
        onChangeNewDieRuleId={setNewDieRuleId}
        onCloseCreateDieModal={closeCreateDieModal}
        onSubmitCreateDie={submitCreateDie}
        editingDie={editingDie}
        editDieSides={editDieSides}
        editDieQty={editDieQty}
        editDieModifier={editDieModifier}
        editDieSign={editDieSign}
        selectedRuleId={selectedRuleId}
        onChangeEditDieSides={setEditDieSides}
        onChangeEditDieQty={setEditDieQty}
        onChangeEditDieModifier={setEditDieModifier}
        onChangeEditDieSign={setEditDieSign}
        onChangeSelectedRuleId={setSelectedRuleId}
        onCloseEditDieModal={closeEditDieModal}
        onSubmitEditDie={submitEditDie}
      />

      <CreateActionWizardModal
        visible={showCreateActionWizard && wizardVisible}
        step={wizardStep}
        stepIndex={wizardStepIndex}
        totalSteps={wizardTotalSteps}
        draft={wizardDraft}
        error={actionWizardError}
        compatibleRules={compatibleRulesForWizard}
        onClose={handleCloseCreateActionWizard}
        onBack={goWizardBack}
        onNext={goWizardNext}
        onSubmit={handleSubmitCreateActionWizard}
        onUpdateDraft={updateWizardDraft}
        onUpdateDie={updateWizardDie}
        onSelectRuleId={(ruleId) => updateWizardDraft("selectedRuleId", ruleId)}
        onSelectCreationMode={(mode) => updateWizardDraft("creationMode", mode)}
        onOpenAdvancedRuleEditor={handleOpenAdvancedRuleEditor}
        onUpdateRangeRow={updateWizardRangeRow}
        onAddRangeRow={addWizardRangeRow}
        onRemoveRangeRow={removeWizardRangeRow}
        onSetBehaviorType={setWizardBehaviorType}
      />

      <HumanRuleEditorModal
        visible={showEditModal}
        editingRule={editingRule}
        form={form}
        formError={formError}
        previewValues={previewValues}
        previewSides={previewSides}
        previewModifier={previewModifier}
        previewSign={previewSign}
        previewResult={previewResult}
        onChangePreviewValues={setPreviewValues}
        onChangePreviewSides={setPreviewSides}
        onChangePreviewModifier={setPreviewModifier}
        onChangePreviewSign={setPreviewSign}
        onUpdateForm={updateForm}
        onUpdateRangeRow={updateRangeRow}
        onAddRangeRow={addRangeRow}
        onRemoveRangeRow={removeRangeRow}
        onSetScope={setScope}
        onSetSupportedSidesText={setSupportedSidesText}
        onComputePreview={computePreview}
        onClose={closeEditor}
        onSave={async () => {
          const payload = getRulePayload();

          await saveRule({
            editingRule: null,
            payload,
          });

          closeEditor();
          await load();
        }}
      />
    </View>
  );
}
