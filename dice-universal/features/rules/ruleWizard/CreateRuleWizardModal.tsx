// dice-universal/features/rules/ruleWizard/CreateRuleWizardModal.tsx

import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  type KeyboardTypeOptions,
} from "react-native";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import type { RuleWizardDraft, RuleWizardScope, RuleWizardStep } from "./types";

import { RULE_BEHAVIORS } from "../../../core/rules/behaviorRegistry";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

type Props = {
  visible: boolean;
  step: RuleWizardStep;
  stepIndex: number;
  totalSteps: number;
  draft: RuleWizardDraft;
  error: string | null;

  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;

  onUpdateDraft: <K extends keyof RuleWizardDraft>(
    key: K,
    value: RuleWizardDraft[K],
  ) => void;

  onSetScope: (scope: RuleWizardScope) => void;
  onSetBehaviorKey: (behaviorKey: RuleBehaviorKey) => void;
  onUpdateRangeRow: (
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) => void;
  onAddRangeRow: () => void;
  onRemoveRangeRow: (index: number) => void;

  previewValuesText: string;
  previewSidesText: string;
  previewModifierText: string;
  previewSignText: "1" | "-1";
  previewResult: unknown | null;

  onChangePreviewValuesText: (value: string) => void;
  onChangePreviewSidesText: (value: string) => void;
  onChangePreviewModifierText: (value: string) => void;
  onChangePreviewSignText: (value: "1" | "-1") => void;
};

function formatOutcome(outcome: string) {
  switch (outcome) {
    case "crit_success":
      return "Réussite critique";
    case "crit_failure":
      return "Échec critique";
    case "success":
      return "Réussite";
    case "failure":
      return "Échec";
    case "glitch":
      return "Complication";
    case "crit_glitch":
      return "Complication critique";
    default:
      return outcome;
  }
}

function formatPreviewResult(result: unknown): string {
  if (!result || typeof result !== "object") {
    return "Aucun résultat testable.";
  }

  const res = result as any;

  switch (res.kind) {
    case "sum":
      return `Total : ${res.total}`;

    case "single_check":
      return [
        `Résultat : ${formatOutcome(res.outcome)}`,
        `Naturel : ${res.natural}`,
        `Final : ${res.final}`,
        res.threshold != null ? `Seuil : ${res.threshold}` : null,
      ]
        .filter(Boolean)
        .join("\n");

    case "success_pool":
      return [
        `Résultat : ${formatOutcome(res.outcome)}`,
        `Succès : ${res.successes}`,
        `Échecs spéciaux : ${res.fail_count}`,
      ].join("\n");

    case "table_lookup":
      return [`Valeur : ${res.value}`, `Résultat : ${res.label}`].join("\n");

    case "banded_sum":
      return [`Total : ${res.total}`, `Palier : ${res.label}`].join("\n");

    case "highest_of_pool":
      return [
        `Résultat : ${formatOutcome(res.outcome)}`,
        `Jets : ${res.natural_values?.join(" + ")}`,
        `Gardé : ${res.kept}`,
        `Final : ${res.final}`,
      ].join("\n");

    case "lowest_of_pool":
      return [
        `Résultat : ${formatOutcome(res.outcome)}`,
        `Jets : ${res.natural_values?.join(" + ")}`,
        `Gardé : ${res.kept}`,
        `Final : ${res.final}`,
      ].join("\n");

    case "keep_highest_n":
    case "keep_lowest_n":
      return [
        `Jets : ${res.natural_values?.join(" + ")}`,
        `Gardés : ${res.kept?.join(" + ")}`,
        `Résultat : ${Array.isArray(res.final) ? res.final.join(" + ") : res.final}`,
      ].join("\n");

    case "drop_highest_n":
    case "drop_lowest_n":
      return [
        `Jets : ${res.natural_values?.join(" + ")}`,
        `Restants : ${res.remaining?.join(" + ")}`,
        `Résultat : ${Array.isArray(res.final) ? res.final.join(" + ") : res.final}`,
      ].join("\n");

    case "pipeline":
      return [
        `Jets : ${res.values?.join(" + ")}`,
        `Conservés : ${res.kept?.join(" + ")}`,
        res.final != null ? `Final : ${res.final}` : null,
        res.meta?.outcome
          ? `Résultat : ${formatOutcome(res.meta.outcome)}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

    default:
      return "Résultat non formaté.";
  }
}

function WizardPillButton({
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

function WizardStepDot({ active }: { active: boolean }) {
  const { theme } = useArcaneTheme();
  return (
    <View
      style={{
        flex: 1,
        height: 6,
        borderWidth: 1,
        borderColor: active ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.pill,
        backgroundColor: active
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: active ? 1 : 0.55,
      }}
    />
  );
}

function WizardFieldLabel({ children }: { children: string }) {
  const { theme } = useArcaneTheme();
  return (
    <Text
      style={{
        color: theme.colors.textMuted,
        fontWeight: "800",
      }}
    >
      {children}
    </Text>
  );
}

function WizardInput({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  editable = true,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
}) {
  const { theme } = useArcaneTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSubtle}
      selectionColor={theme.colors.accent}
      keyboardType={keyboardType}
      editable={editable}
      style={{
        minHeight: 48,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 11,
        backgroundColor: theme.colors.surfaceAlt,
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: "700",
        opacity: editable ? 1 : 0.62,
      }}
    />
  );
}

function WizardSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { theme, styles } = useArcaneTheme();
  return (
    <View
      style={{
        ...styles.cardSoft,
        gap: theme.spacing.sm,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      {description ? (
        <Text
          style={{
            color: theme.colors.textMuted,
            lineHeight: 19,
          }}
        >
          {description}
        </Text>
      ) : null}

      {children}
    </View>
  );
}

function WizardChoiceCard({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme, styles } = useArcaneTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...styles.cardSoft,
        gap: theme.spacing.xs,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        backgroundColor: selected
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 15,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {title}
      </Text>

      {description ? (
        <Text
          style={{
            color: theme.colors.textMuted,
            lineHeight: 19,
          }}
        >
          {description}
        </Text>
      ) : null}

      {selected ? (
        <Text
          style={{
            color: theme.colors.accent,
            fontWeight: "900",
            marginTop: 2,
          }}
        >
          Sélectionné
        </Text>
      ) : null}
    </Pressable>
  );
}

function BehaviorChoiceCard({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme, styles } = useArcaneTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...styles.cardSoft,
        gap: theme.spacing.xs,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        backgroundColor: selected
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: theme.spacing.sm,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: selected ? "900" : "800",
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: theme.colors.textMuted,
              lineHeight: 19,
            }}
          >
            {description}
          </Text>
        </View>

        {selected ? (
          <View
            style={{
              paddingVertical: 5,
              paddingHorizontal: 9,
              borderWidth: 1,
              borderColor: theme.colors.accent,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.accentSoft,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 12,
                fontWeight: "900",
              }}
            >
              Actif
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function WizardInputGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { theme } = useArcaneTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <WizardFieldLabel>{label}</WizardFieldLabel>
      {children}
    </View>
  );
}

function WizardChoicePill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useArcaneTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.pill,
        backgroundColor: selected
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.84 : selected ? 1 : 0.78,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function WizardRangeCard({
  index,
  row,
  onUpdateRangeRow,
  onRemoveRangeRow,
}: {
  index: number;
  row: RuleWizardDraft["ranges"][number];
  onUpdateRangeRow: (
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) => void;
  onRemoveRangeRow: (index: number) => void;
}) {
  const { theme, styles } = useArcaneTheme();
  return (
    <View
      style={{
        ...styles.cardSoft,
        gap: theme.spacing.sm,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: "900",
        }}
      >
        Plage {index + 1}
      </Text>

      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <WizardInputGroup label="Min">
            <WizardInput
              value={row.min}
              onChangeText={(value) => onUpdateRangeRow(index, "min", value)}
              placeholder="Min"
              keyboardType="number-pad"
            />
          </WizardInputGroup>
        </View>

        <View style={{ flex: 1 }}>
          <WizardInputGroup label="Max">
            <WizardInput
              value={row.max}
              onChangeText={(value) => onUpdateRangeRow(index, "max", value)}
              placeholder="Max"
              keyboardType="number-pad"
            />
          </WizardInputGroup>
        </View>
      </View>

      <WizardInputGroup label="Libellé">
        <WizardInput
          value={row.label}
          onChangeText={(value) => onUpdateRangeRow(index, "label", value)}
          placeholder="Ex: Réussite partielle"
        />
      </WizardInputGroup>

      <Pressable
        onPress={() => onRemoveRangeRow(index)}
        style={({ pressed }) => ({
          alignSelf: "flex-start",
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: theme.colors.failure,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.failureSoft,
          opacity: pressed ? 0.84 : 1,
        })}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontWeight: "900",
          }}
        >
          Supprimer cette plage
        </Text>
      </Pressable>
    </View>
  );
}

export function CreateRuleWizardModal({
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
  onSetScope,
  onSetBehaviorKey,
  onUpdateRangeRow,
  onAddRangeRow,
  onRemoveRangeRow,

  previewValuesText,
  previewSidesText,
  previewModifierText,
  previewSignText,
  previewResult,
  onChangePreviewValuesText,
  onChangePreviewSidesText,
  onChangePreviewModifierText,
  onChangePreviewSignText,
}: Props) {
  const { theme, styles } = useArcaneTheme();
  if (!visible) return null;

  const isLastStep = stepIndex === totalSteps - 1;

  const selectedBehavior = RULE_BEHAVIORS.find(
    (behavior) => behavior.key === draft.behaviorKey,
  );

  const scopeOptions = [
    {
      key: "entry",
      label: "Un dé / une entrée",
      description: "Ex: 1d20 contre une difficulté.",
    },
    {
      key: "group",
      label: "Une action complète",
      description: "Ex: pool de dés ou somme globale.",
    },
    {
      key: "both",
      label: "Les deux",
      description: "Règle utilisable dans les deux contextes.",
    },
  ].filter((option) =>
    selectedBehavior
      ? selectedBehavior.allowedScopes.includes(option.key as RuleWizardScope)
      : true,
  );

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.68)",
        justifyContent: "center",
        padding: theme.spacing.md,
      }}
    >
      <View
        style={{
          ...styles.card,
          gap: theme.spacing.md,
          maxHeight: "92%",
          borderColor: theme.colors.accent,
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            style={{
              color: theme.colors.textSubtle,
              fontSize: theme.typography.tiny,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Création guidée
          </Text>

          <Text style={styles.sectionTitle}>Créer une règle</Text>

          <Text style={styles.muted}>
            Étape {stepIndex + 1}/{totalSteps}
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 6,
              marginTop: theme.spacing.xs,
            }}
          >
            {Array.from({ length: totalSteps }).map((_, index) => (
              <WizardStepDot key={index} active={index <= stepIndex} />
            ))}
          </View>
        </View>

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

        <ScrollView
          contentContainerStyle={{
            gap: theme.spacing.md,
            paddingBottom: theme.spacing.sm,
          }}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          {step === "name" ? (
            <WizardSection
              title="Nom de la règle"
              description="Donne un nom clair à cette règle pour la retrouver facilement dans l’atelier."
            >
              <WizardFieldLabel>Nom</WizardFieldLabel>

              <WizardInput
                value={draft.name}
                onChangeText={(value) => onUpdateDraft("name", value)}
                placeholder="Ex: Test D20 difficulté 15"
              />
            </WizardSection>
          ) : null}

          {step === "scope" ? (
            <WizardSection
              title="Portée de la règle"
              description="Choisis si cette règle s’applique à une entrée de dés, à une action complète, ou aux deux."
            >
              {scopeOptions.map((option) => (
                <WizardChoiceCard
                  key={option.key}
                  title={option.label}
                  description={option.description}
                  selected={draft.scope === option.key}
                  onPress={() => onSetScope(option.key as RuleWizardScope)}
                />
              ))}
            </WizardSection>
          ) : null}

          {step === "dice" ? (
            <WizardSection
              title="Dés compatibles"
              description="Indique les types de dés utilisables avec cette règle. Tu peux écrire une liste séparée par des virgules, ou “all” pour tous les dés."
            >
              <WizardFieldLabel>Faces compatibles</WizardFieldLabel>

              <WizardInput
                value={draft.supportedSidesText}
                editable={!selectedBehavior?.supportedSides}
                onChangeText={(value) =>
                  onUpdateDraft("supportedSidesText", value)
                }
                placeholder="Ex: 20 ou 6,10,100 ou all"
              />

              {selectedBehavior?.supportedSides ? (
                <Text style={styles.muted}>
                  Déterminé automatiquement par le comportement sélectionné.
                </Text>
              ) : null}
            </WizardSection>
          ) : null}

          {step === "behavior" ? (
            <>
              <WizardSection
                title="Comportement"
                description="Choisis la logique principale de cette règle. Les paramètres précis apparaîtront ensuite selon le comportement sélectionné."
              >
                {RULE_BEHAVIORS.map((option) => (
                  <BehaviorChoiceCard
                    key={option.key}
                    title={option.label}
                    description={option.description}
                    selected={draft.behaviorKey === option.key}
                    onPress={() => onSetBehaviorKey(option.key)}
                  />
                ))}
              </WizardSection>

              {selectedBehavior ? (
                <>
                  {draft.behaviorKey === "custom_pipeline" ? (
                    <>
                      <WizardSection
                        title="Pipeline personnalisé"
                        description="Combine plusieurs opérations : relances, explosions, dés gardés, comptage, seuils, critiques et complications."
                      >
                        <Text style={styles.muted}>
                          Les champs laissés vides sont ignorés. Cela permet de
                          composer une règle avancée sans devoir tout
                          renseigner.
                        </Text>
                      </WizardSection>

                      <WizardSection title="Relances">
                        <WizardInputGroup label="Relancer les faces">
                          <WizardInput
                            value={draft.pipelineRerollFaces}
                            onChangeText={(value) =>
                              onUpdateDraft("pipelineRerollFaces", value)
                            }
                            placeholder="Ex: 1 ou 1,2"
                          />
                        </WizardInputGroup>

                        <WizardInputGroup label="Mode de relance">
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            <WizardChoicePill
                              label="Une seule fois"
                              selected={draft.pipelineRerollOnce}
                              onPress={() =>
                                onUpdateDraft("pipelineRerollOnce", true)
                              }
                            />

                            <WizardChoicePill
                              label="Tant que possible"
                              selected={!draft.pipelineRerollOnce}
                              onPress={() =>
                                onUpdateDraft("pipelineRerollOnce", false)
                              }
                            />
                          </View>
                        </WizardInputGroup>

                        <WizardInputGroup label="Max relances par dé">
                          <WizardInput
                            value={draft.pipelineMaxRerollsPerDie}
                            onChangeText={(value) =>
                              onUpdateDraft("pipelineMaxRerollsPerDie", value)
                            }
                            placeholder="Optionnel, ex: 2"
                            keyboardType="number-pad"
                          />
                        </WizardInputGroup>
                      </WizardSection>

                      <WizardSection title="Explosions">
                        <WizardInputGroup label="Explosion sur les faces">
                          <WizardInput
                            value={draft.pipelineExplodeFaces}
                            onChangeText={(value) =>
                              onUpdateDraft("pipelineExplodeFaces", value)
                            }
                            placeholder="Ex: 6 ou 10"
                          />
                        </WizardInputGroup>

                        <WizardInputGroup label="Max explosions par dé">
                          <WizardInput
                            value={draft.pipelineMaxExplosionsPerDie}
                            onChangeText={(value) =>
                              onUpdateDraft(
                                "pipelineMaxExplosionsPerDie",
                                value,
                              )
                            }
                            placeholder="Optionnel, ex: 3"
                            keyboardType="number-pad"
                          />
                        </WizardInputGroup>
                      </WizardSection>

                      <WizardSection
                        title="Garder / retirer"
                        description="Contrôle les dés conservés ou exclus avant la sortie finale."
                      >
                        <WizardInputGroup label="Garder les meilleurs dés">
                          <WizardInput
                            value={draft.pipelineKeepHighest}
                            onChangeText={(value) =>
                              onUpdateDraft("pipelineKeepHighest", value)
                            }
                            placeholder="Ex: 2"
                            keyboardType="number-pad"
                          />
                        </WizardInputGroup>

                        <WizardInputGroup label="Garder les plus faibles dés">
                          <WizardInput
                            value={draft.pipelineKeepLowest}
                            onChangeText={(value) =>
                              onUpdateDraft("pipelineKeepLowest", value)
                            }
                            placeholder="Ex: 2"
                            keyboardType="number-pad"
                          />
                        </WizardInputGroup>

                        <WizardInputGroup label="Retirer les meilleurs dés">
                          <WizardInput
                            value={draft.pipelineDropHighest}
                            onChangeText={(value) =>
                              onUpdateDraft("pipelineDropHighest", value)
                            }
                            placeholder="Ex: 1"
                            keyboardType="number-pad"
                          />
                        </WizardInputGroup>

                        <WizardInputGroup label="Retirer les plus faibles dés">
                          <WizardInput
                            value={draft.pipelineDropLowest}
                            onChangeText={(value) =>
                              onUpdateDraft("pipelineDropLowest", value)
                            }
                            placeholder="Ex: 1"
                            keyboardType="number-pad"
                          />
                        </WizardInputGroup>
                      </WizardSection>

                      <WizardSection
                        title="Comptage"
                        description="Transforme les dés en succès, faces exactes ou résultats dans une plage."
                      >
                        <WizardInputGroup label="Compter les succès à partir de">
                          <WizardInput
                            value={draft.pipelineCountSuccessAtOrAbove}
                            onChangeText={(value) =>
                              onUpdateDraft(
                                "pipelineCountSuccessAtOrAbove",
                                value,
                              )
                            }
                            placeholder="Ex: 5"
                            keyboardType="number-pad"
                          />
                        </WizardInputGroup>

                        <WizardInputGroup label="Compter les faces exactes">
                          <WizardInput
                            value={draft.pipelineCountEqualFaces}
                            onChangeText={(value) =>
                              onUpdateDraft("pipelineCountEqualFaces", value)
                            }
                            placeholder="Ex: 1 ou 6,10"
                          />
                        </WizardInputGroup>

                        <View
                          style={{
                            flexDirection: "row",
                            gap: theme.spacing.sm,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <WizardInputGroup label="Plage min">
                              <WizardInput
                                value={draft.pipelineCountRangeMin}
                                onChangeText={(value) =>
                                  onUpdateDraft("pipelineCountRangeMin", value)
                                }
                                placeholder="Ex: 2"
                                keyboardType="number-pad"
                              />
                            </WizardInputGroup>
                          </View>

                          <View style={{ flex: 1 }}>
                            <WizardInputGroup label="Plage max">
                              <WizardInput
                                value={draft.pipelineCountRangeMax}
                                onChangeText={(value) =>
                                  onUpdateDraft("pipelineCountRangeMax", value)
                                }
                                placeholder="Ex: 5"
                                keyboardType="number-pad"
                              />
                            </WizardInputGroup>
                          </View>
                        </View>
                      </WizardSection>

                      <WizardSection
                        title="Seuil final"
                        description="Optionnel : compare la sortie finale à une difficulté."
                      >
                        <WizardInputGroup label="Seuil final">
                          <WizardInput
                            value={draft.pipelineSuccessThreshold}
                            onChangeText={(value) =>
                              onUpdateDraft("pipelineSuccessThreshold", value)
                            }
                            placeholder="Optionnel, ex: 3"
                            keyboardType="number-pad"
                          />
                        </WizardInputGroup>

                        <WizardInputGroup label="Comparaison">
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            <WizardChoicePill
                              label="≥ seuil"
                              selected={draft.pipelineCompare === "gte"}
                              onPress={() =>
                                onUpdateDraft("pipelineCompare", "gte")
                              }
                            />

                            <WizardChoicePill
                              label="≤ seuil"
                              selected={draft.pipelineCompare === "lte"}
                              onPress={() =>
                                onUpdateDraft("pipelineCompare", "lte")
                              }
                            />
                          </View>
                        </WizardInputGroup>
                      </WizardSection>

                      <WizardSection
                        title="Critiques et complications"
                        description="Optionnel : ajoute des signaux spéciaux au résultat."
                      >
                        <WizardInputGroup label="Faces de réussite critique">
                          <WizardInput
                            value={draft.pipelineCritSuccessFaces}
                            onChangeText={(value) =>
                              onUpdateDraft("pipelineCritSuccessFaces", value)
                            }
                            placeholder="Ex: 6 ou 20"
                          />
                        </WizardInputGroup>

                        <WizardInputGroup label="Faces d’échec critique">
                          <WizardInput
                            value={draft.pipelineCritFailureFaces}
                            onChangeText={(value) =>
                              onUpdateDraft("pipelineCritFailureFaces", value)
                            }
                            placeholder="Ex: 1"
                          />
                        </WizardInputGroup>

                        <WizardInputGroup label="Faces de complication">
                          <WizardInput
                            value={draft.pipelineComplicationFaces}
                            onChangeText={(value) =>
                              onUpdateDraft("pipelineComplicationFaces", value)
                            }
                            placeholder="Ex: 1 ou 1,2"
                          />
                        </WizardInputGroup>

                        <WizardInputGroup label="Règle de complication">
                          <View style={{ gap: theme.spacing.sm }}>
                            {[
                              { key: "none", label: "Aucune complication" },
                              {
                                key: "any",
                                label: "Si au moins une face ciblée apparaît",
                              },
                              {
                                key: "gt_successes",
                                label: "Si complications > succès",
                              },
                              {
                                key: "gte_successes",
                                label: "Si complications ≥ succès",
                              },
                              {
                                key: "zero_successes",
                                label: "Si aucune réussite",
                              },
                            ].map((option) => (
                              <WizardChoiceCard
                                key={option.key}
                                title={option.label}
                                selected={
                                  draft.pipelineComplicationRule === option.key
                                }
                                onPress={() =>
                                  onUpdateDraft(
                                    "pipelineComplicationRule",
                                    option.key as RuleWizardDraft["pipelineComplicationRule"],
                                  )
                                }
                              />
                            ))}
                          </View>
                        </WizardInputGroup>
                      </WizardSection>

                      <WizardSection
                        title="Sortie finale"
                        description="Choisis ce que la règle renvoie après toutes les opérations."
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          {[
                            { key: "sum", label: "Somme" },
                            { key: "values", label: "Valeurs" },
                            { key: "successes", label: "Succès" },
                            { key: "count_equal", label: "Faces exactes" },
                            { key: "count_range", label: "Plage" },
                            { key: "first_value", label: "Première valeur" },
                          ].map((option) => (
                            <WizardChoicePill
                              key={option.key}
                              label={option.label}
                              selected={draft.pipelineOutput === option.key}
                              onPress={() =>
                                onUpdateDraft(
                                  "pipelineOutput",
                                  option.key as RuleWizardDraft["pipelineOutput"],
                                )
                              }
                            />
                          ))}
                        </View>
                      </WizardSection>
                    </>
                  ) : null}

                  {draft.behaviorKey !== "custom_pipeline" ? (
                    <WizardSection
                      title="Paramètres"
                      description="Renseigne les valeurs nécessaires pour ce comportement."
                    >
                      {selectedBehavior.fields.map((field) => {
                        if (field.type === "text" || field.type === "number") {
                          return (
                            <WizardInputGroup
                              key={field.key}
                              label={field.label}
                            >
                              <WizardInput
                                value={String(
                                  draft[field.key as keyof RuleWizardDraft] ??
                                    "",
                                )}
                                onChangeText={(value) =>
                                  onUpdateDraft(
                                    field.key as keyof RuleWizardDraft,
                                    value as RuleWizardDraft[keyof RuleWizardDraft],
                                  )
                                }
                                placeholder={field.placeholder ?? ""}
                                keyboardType={
                                  field.type === "number"
                                    ? "number-pad"
                                    : "default"
                                }
                              />
                            </WizardInputGroup>
                          );
                        }

                        if (field.type === "select") {
                          return (
                            <WizardInputGroup
                              key={field.key}
                              label={field.label}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  flexWrap: "wrap",
                                  gap: 8,
                                }}
                              >
                                {field.options.map((option) => {
                                  const selected =
                                    draft[
                                      field.key as keyof RuleWizardDraft
                                    ] === option.value;

                                  return (
                                    <WizardChoicePill
                                      key={option.value}
                                      label={option.label}
                                      selected={selected}
                                      onPress={() =>
                                        onUpdateDraft(
                                          field.key as keyof RuleWizardDraft,
                                          option.value as RuleWizardDraft[keyof RuleWizardDraft],
                                        )
                                      }
                                    />
                                  );
                                })}
                              </View>
                            </WizardInputGroup>
                          );
                        }

                        if (field.type === "ranges") {
                          return (
                            <WizardInputGroup
                              key={field.key}
                              label={field.label}
                            >
                              <View style={{ gap: theme.spacing.sm }}>
                                {draft.ranges.map((row, index) => (
                                  <WizardRangeCard
                                    key={`range-${index}`}
                                    index={index}
                                    row={row}
                                    onUpdateRangeRow={onUpdateRangeRow}
                                    onRemoveRangeRow={onRemoveRangeRow}
                                  />
                                ))}

                                <WizardPillButton
                                  label="+ Ajouter une plage"
                                  onPress={onAddRangeRow}
                                  variant="accent"
                                />
                              </View>
                            </WizardInputGroup>
                          );
                        }

                        return null;
                      })}
                    </WizardSection>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}

          {step === "summary" ? (
            <WizardSection
              title="Résumé"
              description="Vérifie les informations avant de créer la règle."
            >
              <View style={{ gap: theme.spacing.sm }}>
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  Nom : {draft.name || "—"}
                </Text>

                <Text
                  style={{ color: theme.colors.textMuted, fontWeight: "700" }}
                >
                  Portée : {draft.scope}
                </Text>

                <Text
                  style={{ color: theme.colors.textMuted, fontWeight: "700" }}
                >
                  Dés : {draft.supportedSidesText || "—"}
                </Text>

                <Text
                  style={{ color: theme.colors.textMuted, fontWeight: "700" }}
                >
                  Comportement : {draft.behaviorKey ?? "—"}
                </Text>
              </View>
            </WizardSection>
          ) : null}

          <WizardSection
            title="Test rapide"
            description="Simule quelques valeurs pour vérifier que la règle produit le résultat attendu."
          >
            <WizardFieldLabel>Valeurs</WizardFieldLabel>
            <WizardInput
              value={previewValuesText}
              onChangeText={onChangePreviewValuesText}
              placeholder="Ex: 12 ou 5,6,2"
            />

            <WizardFieldLabel>Faces du dé</WizardFieldLabel>
            <WizardInput
              value={previewSidesText}
              onChangeText={onChangePreviewSidesText}
              placeholder="Ex: 20"
              keyboardType="number-pad"
            />

            <WizardFieldLabel>Modificateur</WizardFieldLabel>
            <WizardInput
              value={previewModifierText}
              onChangeText={onChangePreviewModifierText}
              placeholder="Ex: 0"
              keyboardType="numbers-and-punctuation"
            />

            <WizardFieldLabel>Signe</WizardFieldLabel>

            <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <WizardPillButton
                label="Positif"
                onPress={() => onChangePreviewSignText("1")}
                variant={previewSignText === "1" ? "accent" : "default"}
              />

              <WizardPillButton
                label="Négatif"
                onPress={() => onChangePreviewSignText("-1")}
                variant={previewSignText === "-1" ? "accent" : "default"}
              />
            </View>

            <View
              style={{
                ...styles.cardSoft,
                backgroundColor: theme.colors.surfaceAlt,
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
                Résultat
              </Text>

              <Text
                style={{
                  color: theme.colors.text,
                  marginTop: theme.spacing.xs,
                  lineHeight: 20,
                  fontWeight: "700",
                }}
              >
                {formatPreviewResult(previewResult)}
              </Text>
            </View>
          </WizardSection>
        </ScrollView>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: theme.spacing.sm,
          }}
        >
          <WizardPillButton label="Annuler" onPress={onClose} />

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: theme.spacing.sm,
            }}
          >
            {stepIndex > 0 ? (
              <WizardPillButton label="Retour" onPress={onBack} />
            ) : null}

            <WizardPillButton
              label={isLastStep ? "Créer" : "Suivant"}
              onPress={isLastStep ? onSubmit : onNext}
              variant="accent"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
