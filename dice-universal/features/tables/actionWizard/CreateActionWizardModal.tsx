import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import type { ActionWizardDraft, ActionWizardStep } from "./types";
import { ActionWizardStepName } from "./steps/ActionWizardStepName";
import { ActionWizardStepType } from "./steps/ActionWizardStepType";
import { ActionWizardStepDice } from "./steps/ActionWizardStepDice";
import { ActionWizardStepRuleChoice } from "./steps/ActionWizardStepRuleChoice";
import { ActionWizardStepBehavior } from "./steps/ActionWizardStepBehavior";
import { ActionWizardStepSummary } from "./steps/ActionWizardStepSummary";

type Props = {
  visible: boolean;
  step: ActionWizardStep;
  stepIndex: number;
  totalSteps: number;
  draft: ActionWizardDraft;
  error: string | null;

  compatibleRules: RuleRow[];
  onSelectRuleId: (ruleId: string | null) => void;
  onSelectCreationMode: (mode: "auto" | "advanced") => void;
  onOpenAdvancedRuleEditor: () => void;

  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;

  onUpdateDraft: <K extends keyof ActionWizardDraft>(
    key: K,
    value: ActionWizardDraft[K],
  ) => void;

  onUpdateDie: <K extends keyof ActionWizardDraft["die"]>(
    key: K,
    value: ActionWizardDraft["die"][K],
  ) => void;

  onUpdateRangeRow: (
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) => void;

  onAddRangeRow: () => void;
  onRemoveRangeRow: (index: number) => void;
  onSetBehaviorType: (
    value: NonNullable<ActionWizardDraft["behaviorType"]>,
  ) => void;
};

function getStepTitle(step: ActionWizardStep) {
  if (step === "name") return "Nom";
  if (step === "type") return "Type";
  if (step === "dice") return "Dés";
  if (step === "rule_choice") return "Règle";
  if (step === "behavior") return "Comportement";
  return "Résumé";
}

export function CreateActionWizardModal({
  visible,
  step,
  stepIndex,
  totalSteps,
  draft,
  error,
  onClose,
  onBack,
  onNext,
  onSubmit,
  onUpdateDraft,
  onUpdateDie,
  onUpdateRangeRow,
  onAddRangeRow,
  onRemoveRangeRow,
  onSetBehaviorType,
  compatibleRules,
  onSelectRuleId,
  onSelectCreationMode,
  onOpenAdvancedRuleEditor,
}: Props) {
  const isFirstStep = stepIndex <= 0;
  const isLastStep = step === "summary";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 720,
            maxHeight: "92%",
            backgroundColor: "white",
            borderRadius: 16,
            borderWidth: 1,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "800" }}>
              Créer une action
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Étape {stepIndex + 1} / {totalSteps} — {getStepTitle(step)}
            </Text>

            <View
              style={{
                flexDirection: "row",
                gap: 6,
              }}
            >
              {Array.from({ length: totalSteps }).map((_, index) => (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    opacity: index <= stepIndex ? 1 : 0.25,
                  }}
                />
              ))}
            </View>
          </View>

          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{
              padding: 16,
              gap: 12,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {step === "name" ? (
              <ActionWizardStepName
                value={draft.name}
                onChangeValue={(value) => onUpdateDraft("name", value)}
              />
            ) : null}

            {step === "type" ? (
              <ActionWizardStepType
                value={draft.behaviorType}
                onSelect={onSetBehaviorType}
              />
            ) : null}

            {step === "dice" ? (
              <ActionWizardStepDice
                die={draft.die}
                onChangeSides={(value) => onUpdateDie("sides", value)}
                onChangeQty={(value) => onUpdateDie("qty", value)}
                onChangeModifier={(value) => onUpdateDie("modifier", value)}
                onChangeSign={(value) => onUpdateDie("sign", value)}
              />
            ) : null}

            {step === "rule_choice" ? (
              <ActionWizardStepRuleChoice
                rules={compatibleRules}
                selectedRuleId={draft.selectedRuleId}
                creationMode={draft.creationMode}
                onSelectRule={onSelectRuleId}
                onSelectCreationMode={onSelectCreationMode}
              />
            ) : null}

            {step === "behavior" ? (
              <ActionWizardStepBehavior
                draft={draft}
                onUpdateDraft={onUpdateDraft}
                onUpdateRangeRow={onUpdateRangeRow}
                onAddRangeRow={onAddRangeRow}
                onRemoveRangeRow={onRemoveRangeRow}
              />
            ) : null}

            {step === "summary" ? (
              <ActionWizardStepSummary draft={draft} />
            ) : null}

            {error ? (
              <View
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 12,
                }}
              >
                <Text>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 16,
              borderTopWidth: 1,
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <Text>Annuler</Text>
            </Pressable>

            <View style={{ flexDirection: "row", gap: 8 }}>
              {!isFirstStep ? (
                <Pressable
                  onPress={onBack}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                >
                  <Text>Retour</Text>
                </Pressable>
              ) : null}

              {!isLastStep ? (
                <Pressable
                  onPress={() => {
                    if (
                      step === "rule_choice" &&
                      draft.creationMode === "advanced"
                    ) {
                      onOpenAdvancedRuleEditor();
                      return;
                    }

                    onNext();
                  }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>Suivant</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={onSubmit}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>Créer</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
