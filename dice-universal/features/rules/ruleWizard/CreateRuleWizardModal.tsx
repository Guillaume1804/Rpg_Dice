import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";

import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import type { RuleWizardDraft, RuleWizardScope, RuleWizardStep } from "./types";

import {
  RULE_BEHAVIOR_VERTICAL_SLICE_ORDER,
  getRuleBehaviorVerticalSlice,
  getRuleBehaviorVerticalSliceLabel,
  getVisibleRuleBehaviorsByVerticalSlice,
} from "../../../core/rules/behaviorRegistry";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

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

    case "threshold_degrees":
      return [
        `Résultat : ${formatOutcome(res.outcome)}`,
        `Jet : ${res.roll}`,
        `Final : ${res.final}`,
        `Marge : ${res.margin}`,
        `Degrés : ${res.degrees}`,
      ].join("\n");

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

function getStepTitle(step: RuleWizardStep) {
  switch (step) {
    case "name":
      return "Nommer";
    case "behavior":
      return "Choisir";
    case "dice":
      return "Dés compatibles";
    case "scope":
      return "Portée";
    case "summary":
      return "Résumé";
    default:
      return "Étape";
  }
}

function getStepDescription(step: RuleWizardStep) {
  switch (step) {
    case "name":
      return "Donne un nom clair au comportement.";
    case "behavior":
      return "Choisis comment le jet doit être interprété.";
    case "dice":
      return "Définis les dés compatibles.";
    case "scope":
      return "Choisis où ce comportement peut s’appliquer.";
    case "summary":
      return "Vérifie et teste avant sauvegarde.";
    default:
      return "";
  }
}

function getBehaviorOptions() {
  return RULE_BEHAVIOR_VERTICAL_SLICE_ORDER.flatMap((slice) =>
    getVisibleRuleBehaviorsByVerticalSlice(slice).map((behavior) => ({
      ...behavior,
      categoryLabel: getRuleBehaviorVerticalSliceLabel(
        getRuleBehaviorVerticalSlice(behavior.key),
      ),
    })),
  );
}

function getScopeDisplayLabel(scope: RuleWizardScope) {
  if (scope === "entry") return "Entrée";
  if (scope === "group") return "Groupe";
  return "Entrée ou groupe";
}

function getSupportedDiceDisplayLabel(value: string) {
  const text = value.trim();

  if (!text || text.toLowerCase() === "all") {
    return "Tous les dés";
  }

  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.startsWith("d") ? item : `d${item}`))
    .join(", ");
}

function WizardHeaderPill({ label }: { label: string }) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: "rgba(232, 200, 120, 0.28)",
        backgroundColor: "rgba(232, 200, 120, 0.09)",
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <Text
        style={{
          color: premium.colors.accent.primary,
          fontSize: 9,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.85,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function WizardStepDot({ active }: { active: boolean }) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        flex: 1,
        height: 6,
        borderWidth: 1,
        borderColor: active
          ? "rgba(232, 200, 120, 0.34)"
          : "rgba(255,255,255,0.08)",
        borderRadius: premium.radius.pill,
        backgroundColor: active
          ? "rgba(232, 200, 120, 0.18)"
          : "rgba(255,255,255,0.04)",
        opacity: active ? 1 : 0.62,
      }}
    />
  );
}

function WizardPillButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent" | "danger";
}) {
  const premium = usePremiumTheme();

  const borderColor =
    variant === "accent"
      ? "rgba(232, 200, 120, 0.30)"
      : variant === "danger"
        ? "rgba(239, 111, 145, 0.34)"
        : "rgba(255,255,255,0.10)";

  const backgroundColor =
    variant === "accent"
      ? "rgba(232, 200, 120, 0.12)"
      : variant === "danger"
        ? "rgba(239, 111, 145, 0.08)"
        : "rgba(255,255,255,0.055)";

  const color =
    variant === "accent"
      ? premium.colors.accent.primary
      : variant === "danger"
        ? premium.colors.state.failure
        : "rgba(255,255,255,0.70)";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          minHeight: 42,
          borderWidth: 1,
          borderColor,
          borderRadius: premium.radius.pill,
          backgroundColor,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 14,
        }}
      >
        <Text
          style={{
            color,
            fontSize: 12,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.7,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function WizardFieldLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: "rgba(255,255,255,0.58)",
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.55,
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
  const premium = usePremiumTheme();

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(255,255,255,0.32)"
      selectionColor={premium.colors.accent.primary}
      keyboardType={keyboardType}
      editable={editable}
      style={{
        minHeight: 46,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        borderRadius: premium.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "rgba(255,255,255,0.055)",
        color: "rgba(255,255,255,0.92)",
        fontSize: 15,
        fontWeight: "800",
        opacity: editable ? 1 : 0.55,
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
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.045)",
        paddingHorizontal: 13,
        paddingVertical: 13,
        gap: premium.spacing.sm,
      }}
    >
      <Text
        style={{
          color: "rgba(255,255,255,0.94)",
          fontSize: 16,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      {description ? (
        <Text
          style={{
            color: "rgba(255,255,255,0.56)",
            fontSize: 12,
            fontWeight: "700",
            lineHeight: 17,
          }}
        >
          {description}
        </Text>
      ) : null}

      {children}
    </View>
  );
}

function WizardInputGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const premium = usePremiumTheme();

  return (
    <View style={{ gap: premium.spacing.sm }}>
      <WizardFieldLabel>{label}</WizardFieldLabel>
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
  const premium = usePremiumTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          borderRadius: 20,
          borderWidth: 1,
          borderColor: selected
            ? "rgba(232, 200, 120, 0.30)"
            : "rgba(255,255,255,0.08)",
          backgroundColor: selected
            ? "rgba(232, 200, 120, 0.10)"
            : "rgba(255,255,255,0.045)",
          paddingHorizontal: 12,
          paddingVertical: 11,
          gap: 5,
        }}
      >
        <Text
          style={{
            color: selected
              ? premium.colors.accent.primary
              : "rgba(255,255,255,0.92)",
            fontSize: 14,
            fontWeight: "900",
          }}
        >
          {title}
        </Text>

        {description ? (
          <Text
            style={{
              color: "rgba(255,255,255,0.56)",
              fontSize: 11,
              fontWeight: "700",
              lineHeight: 16,
            }}
          >
            {description}
          </Text>
        ) : null}

        {selected ? (
          <Text
            style={{
              color: premium.colors.accent.primary,
              fontSize: 10,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.65,
              marginTop: 2,
            }}
          >
            Sélectionné
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function BehaviorChoiceCard({
  title,
  description,
  categoryLabel,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  categoryLabel: string;
  selected: boolean;
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          borderRadius: 22,
          borderWidth: 1,
          borderColor: selected
            ? "rgba(232, 200, 120, 0.34)"
            : "rgba(255,255,255,0.08)",
          backgroundColor: selected
            ? "rgba(232, 200, 120, 0.105)"
            : "rgba(255,255,255,0.045)",
          paddingHorizontal: 13,
          paddingVertical: 12,
          gap: 6,
        }}
      >
        <Text
          style={{
            color: selected
              ? premium.colors.accent.primary
              : "rgba(255,255,255,0.58)",
            fontSize: 10,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.75,
          }}
        >
          {categoryLabel}
        </Text>

        <Text
          style={{
            color: selected
              ? premium.colors.accent.primary
              : "rgba(255,255,255,0.94)",
            fontSize: 15,
            fontWeight: "900",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: "rgba(255,255,255,0.56)",
            fontSize: 11,
            fontWeight: "700",
            lineHeight: 16,
          }}
        >
          {description}
        </Text>
      </View>
    </Pressable>
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
  const premium = usePremiumTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.82 : selected ? 1 : 0.78,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          minHeight: 38,
          borderWidth: 1,
          borderColor: selected
            ? "rgba(232, 200, 120, 0.30)"
            : "rgba(255,255,255,0.09)",
          borderRadius: premium.radius.pill,
          backgroundColor: selected
            ? "rgba(232, 200, 120, 0.12)"
            : "rgba(255,255,255,0.05)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 13,
        }}
      >
        <Text
          style={{
            color: selected
              ? premium.colors.accent.primary
              : "rgba(255,255,255,0.66)",
            fontSize: 11,
            fontWeight: "900",
          }}
        >
          {label}
        </Text>
      </View>
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
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.04)",
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: premium.spacing.sm,
      }}
    >
      <Text
        style={{
          color: "rgba(255,255,255,0.92)",
          fontWeight: "900",
        }}
      >
        Plage {index + 1}
      </Text>

      <View style={{ flexDirection: "row", gap: premium.spacing.sm }}>
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
          placeholder="Ex : Réussite partielle"
        />
      </WizardInputGroup>

      <WizardPillButton
        label="Supprimer cette plage"
        onPress={() => onRemoveRangeRow(index)}
        variant="danger"
      />
    </View>
  );
}

function renderCommonBehaviorFields(params: {
  selectedBehavior: ReturnType<typeof getBehaviorOptions>[number];
  draft: RuleWizardDraft;
  onUpdateDraft: Props["onUpdateDraft"];
  onUpdateRangeRow: Props["onUpdateRangeRow"];
  onAddRangeRow: () => void;
  onRemoveRangeRow: Props["onRemoveRangeRow"];
}) {
  const {
    selectedBehavior,
    draft,
    onUpdateDraft,
    onUpdateRangeRow,
    onAddRangeRow,
    onRemoveRangeRow,
  } = params;

  if (selectedBehavior.key === "sum_total") {
    return (
      <WizardSection
        title="Somme simple"
        description="Aucune configuration nécessaire."
      >
        <Text
          style={{
            color: "rgba(255,255,255,0.62)",
            fontSize: 12,
            fontWeight: "700",
            lineHeight: 17,
          }}
        >
          Ce comportement additionne simplement les dés et les modificateurs.
          C’est le comportement standard pour les jets sans interprétation
          spéciale.
        </Text>
      </WizardSection>
    );
  }

  return (
    <WizardSection
      title="Paramètres"
      description="Renseigne uniquement les valeurs nécessaires à ce comportement."
    >
      {selectedBehavior.fields.map((field) => {
        if (field.type === "text" || field.type === "number") {
          return (
            <WizardInputGroup key={field.key} label={field.label}>
              <WizardInput
                value={String(draft[field.key as keyof RuleWizardDraft] ?? "")}
                onChangeText={(value) =>
                  onUpdateDraft(
                    field.key as keyof RuleWizardDraft,
                    value as RuleWizardDraft[keyof RuleWizardDraft],
                  )
                }
                placeholder={field.placeholder ?? ""}
                keyboardType={
                  field.type === "number" ? "number-pad" : "default"
                }
              />
            </WizardInputGroup>
          );
        }

        if (field.type === "select") {
          return (
            <WizardInputGroup key={field.key} label={field.label}>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {field.options.map((option) => {
                  const selected =
                    draft[field.key as keyof RuleWizardDraft] === option.value;

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
            <WizardInputGroup key={field.key} label={field.label}>
              <View style={{ gap: 10 }}>
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
  const premium = usePremiumTheme();

  if (!visible) return null;

  const isLastStep = stepIndex === totalSteps - 1;
  const behaviorOptions = getBehaviorOptions();

  const selectedBehavior =
    behaviorOptions.find((behavior) => behavior.key === draft.behaviorKey) ??
    null;

  const scopeOptions = [
    {
      key: "entry",
      label: "Entrée de dés",
      description: "S’applique à une ligne précise, comme 1d20 + 3 ou 2d6.",
    },
    {
      key: "group",
      label: "Groupe complet",
      description:
        "S’applique au jet entier, utile pour les pools ou résultats globaux.",
    },
    {
      key: "both",
      label: "Entrée ou groupe",
      description: "Comportement réutilisable dans les deux contextes.",
    },
  ].filter((option) =>
    selectedBehavior
      ? selectedBehavior.allowedScopes.includes(option.key as RuleWizardScope)
      : true,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.72)",
          justifyContent: "center",
          padding: premium.spacing.md,
        }}
      >
        <View
          style={{
            maxHeight: "92%",
            borderRadius: 30,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.18)",
            backgroundColor: "rgba(6, 8, 18, 0.98)",
            padding: premium.spacing.md,
            gap: premium.spacing.md,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              top: -90,
              right: -80,
              width: 190,
              height: 190,
              borderRadius: 999,
              backgroundColor: "rgba(232, 200, 120, 0.075)",
            }}
          />

          <View style={{ gap: premium.spacing.xs }}>
            <WizardHeaderPill label="Création guidée · Comportement" />

            <Text
              style={{
                color: "rgba(255,255,255,0.96)",
                fontSize: 24,
                fontWeight: "900",
                letterSpacing: -0.35,
              }}
            >
              {getStepTitle(step)}
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.60)",
                fontSize: 12,
                fontWeight: "700",
                lineHeight: 17,
              }}
            >
              {getStepDescription(step)} · Étape {stepIndex + 1}/{totalSteps}
            </Text>

            <View
              style={{
                flexDirection: "row",
                gap: 6,
                marginTop: premium.spacing.xs,
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
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(239, 111, 145, 0.34)",
                backgroundColor: "rgba(239, 111, 145, 0.08)",
                padding: 12,
              }}
            >
              <Text
                style={{
                  color: premium.colors.state.failure,
                  fontWeight: "900",
                }}
              >
                {error}
              </Text>
            </View>
          ) : null}

          <ScrollView
            contentContainerStyle={{
              gap: premium.spacing.md,
              paddingBottom: premium.spacing.sm,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === "name" ? (
              <WizardSection
                title="Nom du comportement"
                description="Choisis un nom simple. Ce comportement pourra ensuite être réutilisé dans tes tables, profils et actions."
              >
                <WizardFieldLabel>Nom</WizardFieldLabel>

                <WizardInput
                  value={draft.name}
                  onChangeText={(value) => onUpdateDraft("name", value)}
                  placeholder="Ex : Somme simple, Test D20 DD 15, Pool D6"
                />
              </WizardSection>
            ) : null}

            {step === "behavior" ? (
              <>
                <WizardSection
                  title="Type de comportement"
                  description="Choisis la façon dont le jet sera lu. Les comportements simples demandent peu ou pas de réglages."
                >
                  {behaviorOptions.map((option) => (
                    <BehaviorChoiceCard
                      key={option.key}
                      title={option.label}
                      description={option.description}
                      categoryLabel={option.categoryLabel}
                      selected={draft.behaviorKey === option.key}
                      onPress={() => onSetBehaviorKey(option.key)}
                    />
                  ))}
                </WizardSection>

                {selectedBehavior
                  ? renderCommonBehaviorFields({
                      selectedBehavior,
                      draft,
                      onUpdateDraft,
                      onUpdateRangeRow,
                      onAddRangeRow,
                      onRemoveRangeRow,
                    })
                  : null}
              </>
            ) : null}

            {step === "dice" ? (
              <WizardSection
                title="Dés compatibles"
                description="Indique les dés autorisés. Laisse “all” pour rendre le comportement utilisable avec tous les dés."
              >
                <WizardFieldLabel>Faces compatibles</WizardFieldLabel>

                <WizardInput
                  value={draft.supportedSidesText}
                  editable={!selectedBehavior?.supportedSides}
                  onChangeText={(value) =>
                    onUpdateDraft("supportedSidesText", value)
                  }
                  placeholder="Ex : all, 20, 6,10,100"
                />

                {selectedBehavior?.supportedSides ? (
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.58)",
                      fontSize: 12,
                      fontWeight: "700",
                      lineHeight: 17,
                    }}
                  >
                    Déterminé automatiquement par le comportement sélectionné.
                  </Text>
                ) : null}
              </WizardSection>
            ) : null}

            {step === "scope" ? (
              <WizardSection
                title="Portée du comportement"
                description="Choisis si ce comportement s’applique à une entrée de dés, à un groupe complet, ou aux deux."
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

            {step === "summary" ? (
              <WizardSection
                title="Résumé"
                description="Vérifie les informations avant de créer le comportement."
              >
                <View style={{ gap: premium.spacing.sm }}>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.94)",
                      fontWeight: "900",
                    }}
                  >
                    Nom : {draft.name || "—"}
                  </Text>

                  <Text
                    style={{
                      color: "rgba(255,255,255,0.62)",
                      fontWeight: "700",
                    }}
                  >
                    Type : {selectedBehavior?.label ?? "—"}
                  </Text>

                  <Text
                    style={{
                      color: "rgba(255,255,255,0.62)",
                      fontWeight: "700",
                    }}
                  >
                    Famille : {selectedBehavior?.categoryLabel ?? "—"}
                  </Text>

                  <Text
                    style={{
                      color: "rgba(255,255,255,0.62)",
                      fontWeight: "700",
                    }}
                  >
                    Portée : {getScopeDisplayLabel(draft.scope)}
                  </Text>

                  <Text
                    style={{
                      color: "rgba(255,255,255,0.62)",
                      fontWeight: "700",
                    }}
                  >
                    Dés compatibles :{" "}
                    {getSupportedDiceDisplayLabel(draft.supportedSidesText)}
                  </Text>
                </View>
              </WizardSection>
            ) : null}

            <WizardSection
              title="Aperçu du comportement"
              description="Teste des valeurs fictives pour vérifier que le comportement produit une lecture cohérente."
            >
              <WizardFieldLabel>Valeurs</WizardFieldLabel>

              <WizardInput
                value={previewValuesText}
                onChangeText={onChangePreviewValuesText}
                placeholder="Ex : 12 ou 5,6,2"
              />

              <WizardFieldLabel>Type de dé</WizardFieldLabel>

              <WizardInput
                value={previewSidesText}
                onChangeText={onChangePreviewSidesText}
                placeholder="Ex : 20"
                keyboardType="number-pad"
              />

              <WizardFieldLabel>Modificateur</WizardFieldLabel>

              <WizardInput
                value={previewModifierText}
                onChangeText={onChangePreviewModifierText}
                placeholder="Ex : 0"
                keyboardType="numbers-and-punctuation"
              />

              <WizardFieldLabel>Signe</WizardFieldLabel>

              <View style={{ flexDirection: "row", gap: premium.spacing.sm }}>
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
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  backgroundColor: "rgba(255,255,255,0.045)",
                  padding: 12,
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.50)",
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  Résultat
                </Text>

                <Text
                  style={{
                    color: "rgba(255,255,255,0.88)",
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
              gap: premium.spacing.sm,
            }}
          >
            <WizardPillButton label="Annuler" onPress={onClose} />

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: premium.spacing.sm,
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
    </Modal>
  );
}
