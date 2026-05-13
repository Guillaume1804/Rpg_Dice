// dice-universal/features/tables/actionWizard/CreateActionWizardModal.tsx

import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import type {
  ActionDieDraft,
  ActionWizardDraft,
  ActionWizardStep,
} from "./types";
import { ActionWizardStepName } from "./steps/ActionWizardStepName";
import { ActionWizardStepType } from "./steps/ActionWizardStepType";
import { ActionWizardStepDice } from "./steps/ActionWizardStepDice";
import { ActionWizardStepRuleChoice } from "./steps/ActionWizardStepRuleChoice";
import { ActionWizardStepBehavior } from "./steps/ActionWizardStepBehavior";
import { ActionWizardStepSummary } from "./steps/ActionWizardStepSummary";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

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

  onUpdateDieAt: <K extends keyof ActionDieDraft>(
    index: number,
    key: K,
    value: ActionDieDraft[K],
  ) => void;

  onAddDie: () => void;
  onRemoveDie: (index: number) => void;

  onUpdateRangeRow: (
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) => void;

  onAddRangeRow: () => void;
  onRemoveRangeRow: (index: number) => void;
  onSetBehaviorType: (
    value: NonNullable<ActionWizardDraft["behaviorType"]>,
    variant?: ActionWizardDraft["behaviorVariant"],
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

function WizardButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent";
}) {
  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: isAccent ? arcane.colors.accent : arcane.colors.border,
        borderRadius: arcane.radius.pill,
        backgroundColor: isAccent
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
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
  onUpdateDieAt,
  onAddDie,
  onRemoveDie,
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
          backgroundColor: "rgba(0,0,0,0.68)",
          justifyContent: "center",
          alignItems: "center",
          padding: arcane.spacing.md,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 720,
            maxHeight: "92%",
            backgroundColor: arcane.colors.surface,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: arcane.colors.accent,
            overflow: "hidden",
            ...arcane.shadow.card,
          }}
        >
          <View
            style={{
              paddingHorizontal: arcane.spacing.md,
              paddingTop: arcane.spacing.md,
              paddingBottom: arcane.spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: arcane.colors.border,
              gap: arcane.spacing.sm,
              backgroundColor: arcane.colors.backgroundElevated,
            }}
          >
            <Text
              style={{
                color: arcane.colors.textSubtle,
                fontSize: arcane.typography.tiny,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Assistant d’action
            </Text>

            <Text
              style={{
                color: arcane.colors.text,
                fontSize: 22,
                fontWeight: "900",
                letterSpacing: -0.3,
              }}
            >
              Créer une action
            </Text>

            <Text style={arcaneStyles.muted}>
              Étape {stepIndex + 1} / {totalSteps} — {getStepTitle(step)}
            </Text>

            <View style={{ flexDirection: "row", gap: 6 }}>
              {Array.from({ length: totalSteps }).map((_, index) => {
                const isDoneOrCurrent = index <= stepIndex;

                return (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      height: 7,
                      borderRadius: arcane.radius.pill,
                      borderWidth: 1,
                      borderColor: isDoneOrCurrent
                        ? arcane.colors.accent
                        : arcane.colors.border,
                      backgroundColor: isDoneOrCurrent
                        ? arcane.colors.accentSoft
                        : arcane.colors.surfaceAlt,
                      opacity: isDoneOrCurrent ? 1 : 0.55,
                    }}
                  />
                );
              })}
            </View>
          </View>

          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{
              padding: arcane.spacing.md,
              gap: arcane.spacing.md,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
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
                variant={draft.behaviorVariant}
                onSelect={onSetBehaviorType}
              />
            ) : null}

            {step === "dice" ? (
              <ActionWizardStepDice
                dice={draft.dice}
                onChangeDie={onUpdateDieAt}
                onAddDie={onAddDie}
                onRemoveDie={onRemoveDie}
                fallbackDie={draft.die}
                onChangeFallbackDie={onUpdateDie}
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
                  ...arcaneStyles.cardSoft,
                  borderColor: arcane.colors.failure,
                  backgroundColor: arcane.colors.failureSoft,
                }}
              >
                <Text
                  style={{
                    color: arcane.colors.text,
                    fontWeight: "800",
                  }}
                >
                  {error}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: arcane.spacing.sm,
              paddingHorizontal: arcane.spacing.md,
              paddingTop: arcane.spacing.sm,
              paddingBottom: arcane.spacing.md,
              borderTopWidth: 1,
              borderTopColor: arcane.colors.border,
              backgroundColor: arcane.colors.backgroundElevated,
            }}
          >
            <WizardButton label="Annuler" onPress={onClose} />

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: arcane.spacing.sm,
              }}
            >
              {!isFirstStep ? (
                <WizardButton label="Retour" onPress={onBack} />
              ) : null}

              {!isLastStep ? (
                <WizardButton
                  label="Suivant"
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
                  variant="accent"
                />
              ) : (
                <WizardButton
                  label="Créer"
                  onPress={onSubmit}
                  variant="accent"
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
