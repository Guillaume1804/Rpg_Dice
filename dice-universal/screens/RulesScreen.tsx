// dice-universal/screens/RulesScreen.tsx

import { View, Text, Pressable } from "react-native";
import { useDb } from "../data/db/DbProvider";

import { useDataRefresh } from "../data/state/DataRefreshProvider";

import { useRulesData } from "../features/rules/hooks/useRulesData";
import { useHumanRuleEditor } from "../features/rules/hooks/useHumanRuleEditor";
import { HumanRuleEditorModal } from "../features/rules/components/HumanRuleEditorModal";
import { RulesListSection } from "../features/rules/components/RulesListSection";
import { useRulesScreenActions } from "../features/rules/hooks/useRulesScreenActions";

import { CreateRuleWizardModal } from "../features/rules/ruleWizard/CreateRuleWizardModal";
import { useRuleWizard } from "../features/rules/ruleWizard/useRuleWizard";
import { useRuleWizardPreview } from "../features/rules/ruleWizard/useRuleWizardPreview";

import { arcane } from "../theme/arcaneTheme";
import { arcaneStyles } from "../theme/arcaneStyles";
import { useArcaneLayout } from "../theme/useArcaneLayout";

function ActionButton({
  title,
  description,
  onPress,
  variant = "default",
}: {
  title: string;
  description: string;
  onPress: () => void;
  variant?: "default" | "accent";
}) {
  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 150,
        padding: arcane.spacing.md,
        borderWidth: 1,
        borderColor: isAccent ? arcane.colors.accent : arcane.colors.border,
        borderRadius: arcane.radius.lg,
        backgroundColor: isAccent
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          marginTop: 4,
          color: arcane.colors.textMuted,
          lineHeight: 19,
        }}
      >
        {description}
      </Text>
    </Pressable>
  );
}

export default function RulesScreen() {
  const db = useDb();
  const layout = useArcaneLayout();

  const { notifyDataChanged } = useDataRefresh();

  const { error, systemRules, customRules, saveRule, removeRule } =
    useRulesData({ db });

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
    notifyDataChanged,
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
      notifyDataChanged();
    } catch (err) {
      console.error(err);
    }
  }

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
        <View style={arcaneStyles.card}>
          <Text style={arcaneStyles.sectionTitle}>Erreur</Text>

          <Text
            style={[
              arcaneStyles.muted,
              {
                marginTop: arcane.spacing.sm,
              },
            ]}
          >
            {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={arcaneStyles.screen}>
      <View
        style={{
          flex: 1,
          paddingTop: layout.insets.top + arcane.spacing.md,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: layout.insets.bottom + arcane.spacing.md,
          alignSelf: "center",
          width: "100%",
          maxWidth: layout.maxContentWidth,
          gap: arcane.spacing.md,
        }}
      >
        <View style={{ gap: arcane.spacing.xs }}>
          <Text
            style={{
              color: arcane.colors.text,
              fontSize: 28,
              fontWeight: "900",
              letterSpacing: -0.4,
            }}
          >
            Règles
          </Text>

          <Text style={arcaneStyles.muted}>
            Crée, consulte et organise les comportements de résolution utilisés
            par tes tables, profils et actions.
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: arcane.spacing.sm,
          }}
        >
          <ActionButton
            title="✨ Création guidée"
            description="Créer une règle étape par étape."
            onPress={ruleWizard.open}
            variant="accent"
          />

          <ActionButton
            title="⚙️ Avancé"
            description="Ouvrir l’éditeur complet."
            onPress={openCreate}
          />
        </View>

        <View style={{ flex: 1 }}>
          <RulesListSection
            systemRules={systemRules}
            customRules={customRules}
            onEditRule={openEdit}
            onDeleteRule={handleDeleteRule}
          />
        </View>

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
    </View>
  );
}
