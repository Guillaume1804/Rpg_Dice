// dice-universal\screens\RulesScreen.tsx

import { View, Text, Pressable } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useRulesData } from "../features/rules/hooks/useRulesData";
import { useHumanRuleEditor } from "../features/rules/hooks/useHumanRuleEditor";
import { HumanRuleEditorModal } from "../features/rules/components/HumanRuleEditorModal";
import { RulesListSection } from "../features/rules/components/RulesListSection";
import { useRulesScreenActions } from "../features/rules/hooks/useRulesScreenActions";

import { CreateRuleWizardModal } from "../features/rules/ruleWizard/CreateRuleWizardModal";
import { useRuleWizard } from "../features/rules/ruleWizard/useRuleWizard";
import { useRuleWizardPreview } from "../features/rules/ruleWizard/useRuleWizardPreview";

export default function RulesScreen() {
  const db = useDb();

  const {
    error,
    systemRules,
    customRules,
    saveRule,
    removeRule,
  } = useRulesData({ db });

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
    openCreate,
    openEdit,
    closeEditor,
    updateForm,
    updateRangeRow,
    addRangeRow,
    removeRangeRow,
    getRulePayload,
    computePreview,
    setScope,
    setSupportedSidesText,
  } = useHumanRuleEditor();

  const { handleSave, handleDeleteRule } = useRulesScreenActions({
    editingRule,
    getRulePayload,
    saveRule,
    removeRule,
    closeEditor,
  });

  const ruleWizard = useRuleWizard();

  const ruleWizardPreview = useRuleWizardPreview({
    buildPayload: ruleWizard.buildPayload,
    deps: [ruleWizard.draft],
  });

  async function handleCreateFromWizard() {
    try {
      const payload = ruleWizard.buildPayload();

      await saveRule({
        editingRule: null,
        payload: {
          ...payload,
          supported_sides_json: payload.supported_sides_json ?? "[]",
        },
      });

      ruleWizard.close();
    } catch (err) {
      console.error(err);
    }
  }

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Erreur</Text>
        <Text style={{ marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Règles</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          onPress={ruleWizard.open}
          style={{ flex: 1, padding: 12, borderWidth: 1, borderRadius: 10 }}
        >
          <Text style={{ fontWeight: "700" }}>✨ Création guidée</Text>
        </Pressable>

        <Pressable
          onPress={openCreate}
          style={{ flex: 1, padding: 12, borderWidth: 1, borderRadius: 10 }}
        >
          <Text style={{ fontWeight: "600" }}>⚙️ Avancé</Text>
        </Pressable>
      </View>

      <RulesListSection
        systemRules={systemRules}
        customRules={customRules}
        onEditRule={openEdit}
        onDeleteRule={handleDeleteRule}
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
        onComputePreview={computePreview}
        onClose={closeEditor}
        onSave={handleSave}
        onSetScope={setScope}
        onSetSupportedSidesText={setSupportedSidesText}
      />

      <CreateRuleWizardModal
        visible={ruleWizard.visible}
        step={ruleWizard.step}
        stepIndex={ruleWizard.stepIndex}
        totalSteps={ruleWizard.totalSteps}
        draft={ruleWizard.draft}
        error={ruleWizard.error}
        onClose={ruleWizard.close}
        onBack={ruleWizard.goBack}
        onNext={ruleWizard.goNext}
        onSubmit={handleCreateFromWizard}
        onUpdateDraft={ruleWizard.updateDraft}
        onSetScope={ruleWizard.setScope}
        onSetBehaviorKey={ruleWizard.setBehaviorKey}
        onUpdateRangeRow={ruleWizard.updateRangeRow}
        onAddRangeRow={ruleWizard.addRangeRow}
        onRemoveRangeRow={ruleWizard.removeRangeRow}
        previewValuesText={ruleWizardPreview.valuesText}
        previewSidesText={ruleWizardPreview.sidesText}
        previewModifierText={ruleWizardPreview.modifierText}
        previewSignText={ruleWizardPreview.signText}
        previewResult={ruleWizardPreview.previewResult}
        onChangePreviewValuesText={ruleWizardPreview.setValuesText}
        onChangePreviewSidesText={ruleWizardPreview.setSidesText}
        onChangePreviewModifierText={ruleWizardPreview.setModifierText}
        onChangePreviewSignText={ruleWizardPreview.setSignText}
      />
    </View>
  );
}