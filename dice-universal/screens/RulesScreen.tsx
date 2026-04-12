// dice-universal\screens\RulesScreen.tsx

import { View, Text, Pressable } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useRulesData } from "../features/rules/hooks/useRulesData";
import { useHumanRuleEditor } from "../features/rules/hooks/useHumanRuleEditor";
import { HumanRuleEditorModal } from "../features/rules/components/HumanRuleEditorModal";
import { RulesListSection } from "../features/rules/components/RulesListSection";
import { useRulesScreenActions } from "../features/rules/hooks/useRulesScreenActions";

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
  } = useHumanRuleEditor();

  const { handleSave, handleDeleteRule } = useRulesScreenActions({
    editingRule,
    getRulePayload,
    saveRule,
    removeRule,
    closeEditor,
  });

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

      <Pressable
        onPress={openCreate}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text style={{ fontWeight: "600" }}>Créer une règle</Text>
      </Pressable>

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
      />
    </View>
  );
}