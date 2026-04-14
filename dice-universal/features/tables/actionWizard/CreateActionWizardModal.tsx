import { Modal, Pressable, Text, View } from "react-native";
import type { ActionWizardDraft, ActionWizardStep } from "./types";
import { ActionWizardStepName } from "./steps/ActionWizardStepName";
import { ActionWizardStepType } from "./steps/ActionWizardStepType";
import { ActionWizardStepDice } from "./steps/ActionWizardStepDice";
import { ActionWizardStepBehavior } from "./steps/ActionWizardStepBehavior";
import { ActionWizardStepSummary } from "./steps/ActionWizardStepSummary";

type Props = {
  visible: boolean;
  step: ActionWizardStep;
  stepIndex: number;
  totalSteps: number;
  draft: ActionWizardDraft;
  error: string | null;

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
  onSetBehaviorType: (value: NonNullable<ActionWizardDraft["behaviorType"]>) => void;
};

function getStepTitle(step: ActionWizardStep) {
  if (step === "name") return "Nom";
  if (step === "type") return "Type";
  if (step === "dice") return "Dés";
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
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            maxHeight: "92%",
            gap: 12,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 18, fontWeight: "800" }}>
              Créer une action
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Étape {stepIndex + 1} / {totalSteps} — {getStepTitle(step)}
            </Text>

            <View
              style={{
                flexDirection: "row",
                gap: 6,
                marginTop: 4,
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
                    opacity: index <= stepIndex ? 1 : 0.35,
                  }}
                />
              ))}
            </View>
          </View>

          <View
            style={{
              flex: 1,
              minHeight: 280,
            }}
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
          </View>

          {error ? (
            <View
              style={{
                padding: 10,
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <Text>{error}</Text>
            </View>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
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
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                >
                  <Text>Retour</Text>
                </Pressable>
              ) : null}

              {!isLastStep ? (
                <Pressable
                  onPress={onNext}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
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
                    paddingHorizontal: 12,
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