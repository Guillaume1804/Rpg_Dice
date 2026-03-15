import { View, Text, Pressable } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useRulesData } from "../features/rules/hooks/useRulesData";
import { useRulesEditor } from "../features/rules/hooks/useRulesEditor";
import { RulesEditorModal } from "../features/rules/components/RulesEditorModal";
import { RulesListSection } from "../features/rules/components/RulesListSection";
import { useRulesScreenActions } from "../features/rules/hooks/useRulesScreenActions";

export default function RulesScreen() {
  const db = useDb();

  const {
    error,
    pipelineRules,
    legacyRules,
    saveRule,
    removeRule,
  } = useRulesData({ db });

  const {
    showEditModal,

    editingRule,
    formName,
    setFormName,

    pipeOutput,
    setPipeOutput,
    successThreshold,
    setSuccessThreshold,
    critSuccessFaces,
    setCritSuccessFaces,
    critFailureFaces,
    setCritFailureFaces,

    steps,
    keepN,
    setKeepN,
    successAt,
    setSuccessAt,
    takeIndex,
    setTakeIndex,
    facesInput,
    setFacesInput,
    rangeMin,
    setRangeMin,
    rangeMax,
    setRangeMax,
    ranges,
    setRanges,

    previewValues,
    setPreviewValues,
    previewSides,
    setPreviewSides,
    previewModifier,
    setPreviewModifier,
    previewSign,
    setPreviewSign,
    previewResult,

    toFacesArray,
    getParamsJson,
    openCreate,
    openEdit,
    closeEditor,
    applyPreset,
    addStep,
    removeStepAt,
    moveStepUp,
    moveStepDown,
    computePreview,
  } = useRulesEditor();

  const { handleSave, handleDeleteRule } = useRulesScreenActions({
    editingRule,
    formName,
    getParamsJson,
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

      <Pressable onPress={openCreate} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
        <Text style={{ fontWeight: "600" }}>Créer une règle (pipeline)</Text>
      </Pressable>

      <RulesListSection
        pipelineRules={pipelineRules}
        legacyRules={legacyRules}
        onEditRule={openEdit}
        onDeleteRule={handleDeleteRule}
      />

      <RulesEditorModal
        visible={showEditModal}
        editingRule={editingRule}
        formName={formName}
        onChangeFormName={setFormName}
        pipeOutput={pipeOutput}
        onChangePipeOutput={setPipeOutput}
        successThreshold={successThreshold}
        onChangeSuccessThreshold={setSuccessThreshold}
        critSuccessFaces={critSuccessFaces}
        onChangeCritSuccessFaces={setCritSuccessFaces}
        critFailureFaces={critFailureFaces}
        onChangeCritFailureFaces={setCritFailureFaces}
        steps={steps}
        keepN={keepN}
        onChangeKeepN={setKeepN}
        successAt={successAt}
        onChangeSuccessAt={setSuccessAt}
        takeIndex={takeIndex}
        onChangeTakeIndex={setTakeIndex}
        facesInput={facesInput}
        onChangeFacesInput={setFacesInput}
        rangeMin={rangeMin}
        onChangeRangeMin={setRangeMin}
        rangeMax={rangeMax}
        onChangeRangeMax={setRangeMax}
        ranges={ranges}
        onChangeRanges={setRanges}
        previewValues={previewValues}
        onChangePreviewValues={setPreviewValues}
        previewSides={previewSides}
        onChangePreviewSides={setPreviewSides}
        previewModifier={previewModifier}
        onChangePreviewModifier={setPreviewModifier}
        previewSign={previewSign}
        onChangePreviewSign={setPreviewSign}
        previewResult={previewResult}
        toFacesArray={toFacesArray}
        onApplyPreset={applyPreset}
        onAddStep={addStep}
        onRemoveStepAt={removeStepAt}
        onMoveStepUp={moveStepUp}
        onMoveStepDown={moveStepDown}
        onComputePreview={computePreview}
        onClose={closeEditor}
        onSave={handleSave}
      />
    </View>
  );
}