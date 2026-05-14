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

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

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
  const { theme } = useArcaneTheme();

  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: isAccent ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.pill,
        backgroundColor: isAccent
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
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
  const { theme, styles } = useArcaneTheme();
  
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
          padding: theme.spacing.md,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 720,
            maxHeight: "92%",
            backgroundColor: theme.colors.surface,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: theme.colors.accent,
            overflow: "hidden",
            ...theme.shadow.card,
          }}
        >
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingTop: theme.spacing.md,
              paddingBottom: theme.spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
              gap: theme.spacing.sm,
              backgroundColor: theme.colors.backgroundElevated,
            }}
          >
            <Text
              style={{
                color: theme.colors.textSubtle,
                fontSize: theme.typography.tiny,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Assistant d’action
            </Text>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 22,
                fontWeight: "900",
                letterSpacing: -0.3,
              }}
            >
              Créer une action
            </Text>

            <Text style={styles.muted}>
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
                      borderRadius: theme.radius.pill,
                      borderWidth: 1,
                      borderColor: isDoneOrCurrent
                        ? theme.colors.accent
                        : theme.colors.border,
                      backgroundColor: isDoneOrCurrent
                        ? theme.colors.accentSoft
                        : theme.colors.surfaceAlt,
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
              padding: theme.spacing.md,
              gap: theme.spacing.md,
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
                  ...styles.cardSoft,
                  borderColor: theme.colors.failure,
                  backgroundColor: theme.colors.failureSoft,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.text,
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
              gap: theme.spacing.sm,
              paddingHorizontal: theme.spacing.md,
              paddingTop: theme.spacing.sm,
              paddingBottom: theme.spacing.md,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.backgroundElevated,
            }}
          >
            <WizardButton label="Annuler" onPress={onClose} />

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: theme.spacing.sm,
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
