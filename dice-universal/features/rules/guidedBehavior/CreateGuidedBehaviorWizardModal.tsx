import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type {
  GuidedBehaviorApplicationMode,
  GuidedBehaviorDraft,
  GuidedBehaviorIntent,
  GuidedBehaviorReadingMode,
} from "./types";
import {
  getGuidedBehaviorApplicationLabel,
  getRuleScopeUserLabel,
} from "./resolveGuidedBehaviorScope";
import {
  getGuidedBehaviorStepDescription,
  getGuidedBehaviorStepTitle,
  type GuidedBehaviorWizardStep,
} from "./useGuidedBehaviorWizard";

type Props = {
  visible: boolean;
  step: GuidedBehaviorWizardStep;
  stepIndex: number;
  totalSteps: number;
  draft: GuidedBehaviorDraft;
  error: string | null;

  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;

  onUpdateIdentity: (params: { name?: string; description?: string }) => void;
  onSetIntent: (intent: GuidedBehaviorIntent) => void;
  onSetDiceCompatibility: (
    diceCompatibility: GuidedBehaviorDraft["diceCompatibility"],
  ) => void;
  onSetApplicationMode: (
    applicationMode: GuidedBehaviorApplicationMode,
  ) => void;

  onUpdateReroll: (
    patch: Partial<GuidedBehaviorDraft["transforms"]["reroll"]>,
  ) => void;
  onUpdateExplode: (
    patch: Partial<GuidedBehaviorDraft["transforms"]["explode"]>,
  ) => void;
  onUpdateKeepDrop: (
    patch: Partial<GuidedBehaviorDraft["transforms"]["keepDrop"]>,
  ) => void;

  onUpdateReading: (patch: Partial<GuidedBehaviorDraft["reading"]>) => void;
  onSetReadingMode: (mode: GuidedBehaviorReadingMode) => void;
  onUpdateTableRange: (
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) => void;
  onAddTableRange: () => void;
  onRemoveTableRange: (index: number) => void;

  onUpdateCriticalSuccess: (
    patch: Partial<GuidedBehaviorDraft["events"]["criticalSuccess"]>,
  ) => void;
  onUpdateCriticalFailure: (
    patch: Partial<GuidedBehaviorDraft["events"]["criticalFailure"]>,
  ) => void;
  onUpdateComplication: (
    patch: Partial<GuidedBehaviorDraft["events"]["complication"]>,
  ) => void;

  onUpdateOutput: (patch: Partial<GuidedBehaviorDraft["output"]>) => void;

  onOpenPreview?: () => void;
};

const CLASSIC_DICE = [4, 6, 8, 10, 12, 20, 100];

function diceCompatibilityToText(
  diceCompatibility: GuidedBehaviorDraft["diceCompatibility"],
) {
  if (diceCompatibility === "all") return "Tous les dés";
  return diceCompatibility.sides.map((side) => `d${side}`).join(", ");
}

function isDiceSelected(
  diceCompatibility: GuidedBehaviorDraft["diceCompatibility"],
  side: number,
) {
  if (diceCompatibility === "all") return false;
  return diceCompatibility.sides.includes(side);
}

function toggleDiceSide(
  diceCompatibility: GuidedBehaviorDraft["diceCompatibility"],
  side: number,
): GuidedBehaviorDraft["diceCompatibility"] {
  if (diceCompatibility === "all") {
    return { sides: [side] };
  }

  const exists = diceCompatibility.sides.includes(side);
  const sides = exists
    ? diceCompatibility.sides.filter((item) => item !== side)
    : [...diceCompatibility.sides, side];

  return { sides };
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

function StepProgress({
  stepIndex,
  totalSteps,
}: {
  stepIndex: number;
  totalSteps: number;
}) {
  const premium = usePremiumTheme();

  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const active = index <= stepIndex;

        return (
          <View
            key={index}
            style={{
              flex: 1,
              height: 6,
              borderRadius: premium.radius.pill,
              borderWidth: 1,
              borderColor: active
                ? "rgba(232, 200, 120, 0.34)"
                : "rgba(255,255,255,0.08)",
              backgroundColor: active
                ? "rgba(232, 200, 120, 0.18)"
                : "rgba(255,255,255,0.04)",
            }}
          />
        );
      })}
    </View>
  );
}

function PillButton({
  label,
  onPress,
  variant = "default",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent" | "danger";
  disabled?: boolean;
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
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: disabled ? 0.38 : pressed ? 0.82 : 1,
        transform: [
          { scale: pressed && !disabled ? premium.animation.pressScale : 1 },
        ],
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

function FieldLabel({ children }: { children: string }) {
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

function Input({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
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
      multiline={multiline}
      style={{
        minHeight: multiline ? 78 : 46,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        borderRadius: premium.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "rgba(255,255,255,0.055)",
        color: "rgba(255,255,255,0.92)",
        fontSize: 15,
        fontWeight: "800",
        textAlignVertical: multiline ? "top" : "center",
      }}
    />
  );
}

function Section({
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

function ChoiceCard({
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
            ? "rgba(232, 200, 120, 0.32)"
            : "rgba(255,255,255,0.08)",
          backgroundColor: selected
            ? "rgba(232, 200, 120, 0.105)"
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
      </View>
    </Pressable>
  );
}

function SwitchRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => ({
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          borderRadius: 20,
          borderWidth: 1,
          borderColor: enabled
            ? "rgba(232, 200, 120, 0.30)"
            : "rgba(255,255,255,0.08)",
          backgroundColor: enabled
            ? "rgba(232, 200, 120, 0.09)"
            : "rgba(255,255,255,0.04)",
          padding: 12,
          gap: 5,
        }}
      >
        <Text
          style={{
            color: enabled
              ? premium.colors.accent.primary
              : "rgba(255,255,255,0.90)",
            fontSize: 14,
            fontWeight: "900",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 11,
            lineHeight: 16,
            fontWeight: "700",
          }}
        >
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const premium = usePremiumTheme();

  return (
    <View style={{ gap: premium.spacing.sm }}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </View>
  );
}

function DiceSelector({
  draft,
  onSetDiceCompatibility,
}: {
  draft: GuidedBehaviorDraft;
  onSetDiceCompatibility: Props["onSetDiceCompatibility"];
}) {
  const premium = usePremiumTheme();
  const isAll = draft.diceCompatibility === "all";

  return (
    <View style={{ gap: premium.spacing.sm }}>
      <ChoiceCard
        title="Tous les dés"
        description="Le comportement pourra être utilisé avec n’importe quel dé."
        selected={isAll}
        onPress={() => onSetDiceCompatibility("all")}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {CLASSIC_DICE.map((side) => {
          const selected = isDiceSelected(draft.diceCompatibility, side);

          return (
            <Pressable
              key={side}
              onPress={() =>
                onSetDiceCompatibility(
                  toggleDiceSide(draft.diceCompatibility, side),
                )
              }
              style={({ pressed }) => ({
                opacity: pressed ? 0.82 : 1,
                transform: [
                  { scale: pressed ? premium.animation.pressScale : 1 },
                ],
              })}
            >
              <View
                style={{
                  minWidth: 54,
                  minHeight: 40,
                  borderRadius: premium.radius.pill,
                  borderWidth: 1,
                  borderColor: selected
                    ? "rgba(232, 200, 120, 0.32)"
                    : "rgba(255,255,255,0.09)",
                  backgroundColor: selected
                    ? "rgba(232, 200, 120, 0.12)"
                    : "rgba(255,255,255,0.05)",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 12,
                }}
              >
                <Text
                  style={{
                    color: selected
                      ? premium.colors.accent.primary
                      : "rgba(255,255,255,0.68)",
                    fontSize: 12,
                    fontWeight: "900",
                  }}
                >
                  d{side}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text
        style={{
          color: "rgba(255,255,255,0.56)",
          fontSize: 12,
          fontWeight: "700",
          lineHeight: 17,
        }}
      >
        Sélection actuelle : {diceCompatibilityToText(draft.diceCompatibility)}
      </Text>
    </View>
  );
}

function renderIdentityStep(
  draft: GuidedBehaviorDraft,
  onUpdateIdentity: Props["onUpdateIdentity"],
) {
  return (
    <Section
      title="Nom du comportement"
      description="Donne un nom simple et reconnaissable. La description servira plus tard à expliquer tes comportements personnalisés."
    >
      <FieldGroup label="Nom">
        <Input
          value={draft.name}
          onChangeText={(name) => onUpdateIdentity({ name })}
          placeholder="Ex : Pool D6 avec complication"
        />
      </FieldGroup>

      <FieldGroup label="Description">
        <Input
          value={draft.description}
          onChangeText={(description) => onUpdateIdentity({ description })}
          placeholder="Ex : Compte les succès sur 5+ et détecte les complications."
          multiline
        />
      </FieldGroup>
    </Section>
  );
}

function renderIntentStep(
  draft: GuidedBehaviorDraft,
  onSetIntent: Props["onSetIntent"],
) {
  const options: Array<{
    key: GuidedBehaviorIntent;
    title: string;
    description: string;
  }> = [
    {
      key: "sum",
      title: "Additionner des dés",
      description: "Pour les jets simples : total des dés + modificateur.",
    },
    {
      key: "check",
      title: "Réussir contre un seuil",
      description: "Pour les tests type d20, difficulté, réussite ou échec.",
    },
    {
      key: "degrees",
      title: "Seuil avec degrés",
      description: "Pour les tests type d100 avec marge ou degrés.",
    },
    {
      key: "success_pool",
      title: "Compter des succès",
      description:
        "Pour les pools de dés où chaque dé peut produire un succès.",
    },
    {
      key: "keep_drop",
      title: "Garder ou retirer des dés",
      description: "Pour avantage, désavantage, meilleurs dés ou plus faibles.",
    },
    {
      key: "table",
      title: "Lire une table ou un palier",
      description: "Pour transformer un total en résultat textuel.",
    },
    {
      key: "advanced",
      title: "Combiner plusieurs effets",
      description:
        "Pour relances, explosions, complications et logique avancée.",
    },
  ];

  return (
    <Section
      title="Intention principale"
      description="Choisis ce que le comportement doit faire en priorité. Tu pourras ajouter des effets ensuite."
    >
      {options.map((option) => (
        <ChoiceCard
          key={option.key}
          title={option.title}
          description={option.description}
          selected={draft.intent === option.key}
          onPress={() => onSetIntent(option.key)}
        />
      ))}
    </Section>
  );
}

function renderDiceStep(
  draft: GuidedBehaviorDraft,
  onSetDiceCompatibility: Props["onSetDiceCompatibility"],
) {
  return (
    <Section
      title="Dés concernés"
      description="Choisis les dés compatibles avec ce comportement. Pour un comportement très spécifique, limite les dés disponibles."
    >
      <DiceSelector
        draft={draft}
        onSetDiceCompatibility={onSetDiceCompatibility}
      />
    </Section>
  );
}

function renderTransformsStep(
  draft: GuidedBehaviorDraft,
  props: Pick<Props, "onUpdateReroll" | "onUpdateExplode" | "onUpdateKeepDrop">,
) {
  return (
    <View style={{ gap: 12 }}>
      <Section
        title="Relances"
        description="Permet de relancer certaines faces avant de lire le résultat."
      >
        <SwitchRow
          title="Relancer certaines faces"
          description="Ex : relancer les 1."
          enabled={draft.transforms.reroll.enabled}
          onToggle={() =>
            props.onUpdateReroll({
              enabled: !draft.transforms.reroll.enabled,
            })
          }
        />

        {draft.transforms.reroll.enabled ? (
          <>
            <FieldGroup label="Faces à relancer">
              <Input
                value={draft.transforms.reroll.faces}
                onChangeText={(faces) => props.onUpdateReroll({ faces })}
                placeholder="Ex : 1"
              />
            </FieldGroup>

            <FieldGroup label="Maximum par dé">
              <Input
                value={draft.transforms.reroll.maxRerollsPerDie}
                onChangeText={(maxRerollsPerDie) =>
                  props.onUpdateReroll({ maxRerollsPerDie })
                }
                placeholder="Vide = pas de limite"
                keyboardType="number-pad"
              />
            </FieldGroup>
          </>
        ) : null}
      </Section>

      <Section
        title="Explosions"
        description="Permet d’ajouter un nouveau dé quand certaines faces sortent."
      >
        <SwitchRow
          title="Faire exploser certaines faces"
          description="Ex : sur un 6, ajouter un nouveau dé."
          enabled={draft.transforms.explode.enabled}
          onToggle={() =>
            props.onUpdateExplode({
              enabled: !draft.transforms.explode.enabled,
            })
          }
        />

        {draft.transforms.explode.enabled ? (
          <>
            <FieldGroup label="Faces d’explosion">
              <Input
                value={draft.transforms.explode.faces}
                onChangeText={(faces) => props.onUpdateExplode({ faces })}
                placeholder="Ex : 6"
              />
            </FieldGroup>

            <FieldGroup label="Maximum par dé">
              <Input
                value={draft.transforms.explode.maxExplosionsPerDie}
                onChangeText={(maxExplosionsPerDie) =>
                  props.onUpdateExplode({ maxExplosionsPerDie })
                }
                placeholder="Vide = pas de limite"
                keyboardType="number-pad"
              />
            </FieldGroup>
          </>
        ) : null}
      </Section>

      <Section
        title="Garder / retirer"
        description="Permet de garder ou retirer les meilleurs ou plus faibles dés."
      >
        <ChoiceCard
          title="Aucun"
          selected={draft.transforms.keepDrop.mode === "none"}
          onPress={() => props.onUpdateKeepDrop({ mode: "none" })}
        />

        <ChoiceCard
          title="Garder les meilleurs"
          selected={draft.transforms.keepDrop.mode === "keep_highest"}
          onPress={() => props.onUpdateKeepDrop({ mode: "keep_highest" })}
        />

        <ChoiceCard
          title="Garder les plus faibles"
          selected={draft.transforms.keepDrop.mode === "keep_lowest"}
          onPress={() => props.onUpdateKeepDrop({ mode: "keep_lowest" })}
        />

        <ChoiceCard
          title="Retirer les meilleurs"
          selected={draft.transforms.keepDrop.mode === "drop_highest"}
          onPress={() => props.onUpdateKeepDrop({ mode: "drop_highest" })}
        />

        <ChoiceCard
          title="Retirer les plus faibles"
          selected={draft.transforms.keepDrop.mode === "drop_lowest"}
          onPress={() => props.onUpdateKeepDrop({ mode: "drop_lowest" })}
        />

        {draft.transforms.keepDrop.mode !== "none" ? (
          <FieldGroup label="Nombre de dés">
            <Input
              value={draft.transforms.keepDrop.count}
              onChangeText={(count) => props.onUpdateKeepDrop({ count })}
              placeholder="Ex : 1"
              keyboardType="number-pad"
            />
          </FieldGroup>
        ) : null}
      </Section>
    </View>
  );
}

function renderReadingStep(
  draft: GuidedBehaviorDraft,
  props: Pick<
    Props,
    | "onSetReadingMode"
    | "onUpdateReading"
    | "onUpdateTableRange"
    | "onAddTableRange"
    | "onRemoveTableRange"
  >,
) {
  return (
    <View style={{ gap: 12 }}>
      <Section
        title="Lire le résultat"
        description="Choisis comment le lancer doit être interprété une fois les dés obtenus."
      >
        <ChoiceCard
          title="Somme simple"
          description="Additionner les dés et modificateurs."
          selected={draft.reading.mode === "sum"}
          onPress={() => props.onSetReadingMode("sum")}
        />

        <ChoiceCard
          title="Test avec seuil"
          description="Comparer le total à une difficulté."
          selected={draft.reading.mode === "single_check"}
          onPress={() => props.onSetReadingMode("single_check")}
        />

        <ChoiceCard
          title="Seuil avec degrés"
          description="Comparer à une cible et calculer une marge."
          selected={draft.reading.mode === "threshold_degrees"}
          onPress={() => props.onSetReadingMode("threshold_degrees")}
        />

        <ChoiceCard
          title="Pool de succès"
          description="Compter les dés qui atteignent un seuil."
          selected={draft.reading.mode === "success_pool"}
          onPress={() => props.onSetReadingMode("success_pool")}
        />

        <ChoiceCard
          title="Table / Paliers"
          description="Associer une valeur à une plage."
          selected={draft.reading.mode === "table_lookup"}
          onPress={() => props.onSetReadingMode("table_lookup")}
        />
      </Section>

      {draft.reading.mode === "single_check" ? (
        <Section title="Paramètres du seuil">
          <FieldGroup label="Seuil de réussite">
            <Input
              value={draft.reading.successThreshold}
              onChangeText={(successThreshold) =>
                props.onUpdateReading({ successThreshold })
              }
              placeholder="Ex : 15"
              keyboardType="number-pad"
            />
          </FieldGroup>
        </Section>
      ) : null}

      {draft.reading.mode === "threshold_degrees" ? (
        <Section title="Paramètres des degrés">
          <FieldGroup label="Cible">
            <Input
              value={draft.reading.targetValue}
              onChangeText={(targetValue) =>
                props.onUpdateReading({ targetValue })
              }
              placeholder="Ex : 50"
              keyboardType="number-pad"
            />
          </FieldGroup>

          <FieldGroup label="Pas de degré">
            <Input
              value={draft.reading.degreeStep}
              onChangeText={(degreeStep) =>
                props.onUpdateReading({ degreeStep })
              }
              placeholder="Ex : 10"
              keyboardType="number-pad"
            />
          </FieldGroup>
        </Section>
      ) : null}

      {draft.reading.mode === "success_pool" ? (
        <Section title="Paramètres du pool">
          <FieldGroup label="Succès à partir de">
            <Input
              value={draft.reading.successAtOrAbove}
              onChangeText={(successAtOrAbove) =>
                props.onUpdateReading({ successAtOrAbove })
              }
              placeholder="Ex : 5"
              keyboardType="number-pad"
            />
          </FieldGroup>

          <FieldGroup label="Faces de complication">
            <Input
              value={draft.reading.failFaces}
              onChangeText={(failFaces) => props.onUpdateReading({ failFaces })}
              placeholder="Ex : 1"
            />
          </FieldGroup>
        </Section>
      ) : null}

      {draft.reading.mode === "table_lookup" ? (
        <Section title="Paliers">
          {draft.reading.tableRanges.map((range, index) => (
            <View key={index} style={{ gap: 8 }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.92)",
                  fontWeight: "900",
                }}
              >
                Palier {index + 1}
              </Text>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    value={range.min}
                    onChangeText={(value) =>
                      props.onUpdateTableRange(index, "min", value)
                    }
                    placeholder="Min"
                    keyboardType="number-pad"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Input
                    value={range.max}
                    onChangeText={(value) =>
                      props.onUpdateTableRange(index, "max", value)
                    }
                    placeholder="Max"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Input
                value={range.label}
                onChangeText={(value) =>
                  props.onUpdateTableRange(index, "label", value)
                }
                placeholder="Libellé"
              />

              <PillButton
                label="Supprimer"
                onPress={() => props.onRemoveTableRange(index)}
                variant="danger"
              />
            </View>
          ))}

          <PillButton
            label="+ Ajouter un palier"
            onPress={props.onAddTableRange}
            variant="accent"
          />
        </Section>
      ) : null}
    </View>
  );
}

function renderEventsStep(
  draft: GuidedBehaviorDraft,
  props: Pick<
    Props,
    | "onUpdateCriticalSuccess"
    | "onUpdateCriticalFailure"
    | "onUpdateComplication"
  >,
) {
  return (
    <View style={{ gap: 12 }}>
      <Section title="Réussite critique">
        <SwitchRow
          title="Activer la réussite critique"
          description="Permet de marquer certains résultats comme exceptionnels."
          enabled={draft.events.criticalSuccess.enabled}
          onToggle={() =>
            props.onUpdateCriticalSuccess({
              enabled: !draft.events.criticalSuccess.enabled,
            })
          }
        />

        {draft.events.criticalSuccess.enabled ? (
          <FieldGroup label="Faces critiques">
            <Input
              value={draft.events.criticalSuccess.faces}
              onChangeText={(faces) => props.onUpdateCriticalSuccess({ faces })}
              placeholder="Ex : 20 ou 19,20"
            />
          </FieldGroup>
        ) : null}
      </Section>

      <Section title="Échec critique">
        <SwitchRow
          title="Activer l’échec critique"
          description="Permet de marquer certains résultats comme catastrophiques."
          enabled={draft.events.criticalFailure.enabled}
          onToggle={() =>
            props.onUpdateCriticalFailure({
              enabled: !draft.events.criticalFailure.enabled,
            })
          }
        />

        {draft.events.criticalFailure.enabled ? (
          <FieldGroup label="Faces critiques">
            <Input
              value={draft.events.criticalFailure.faces}
              onChangeText={(faces) => props.onUpdateCriticalFailure({ faces })}
              placeholder="Ex : 1"
            />
          </FieldGroup>
        ) : null}
      </Section>

      <Section title="Complication">
        <SwitchRow
          title="Activer les complications"
          description="Permet de détecter les faces problématiques, comme les 1 dans un pool."
          enabled={draft.events.complication.enabled}
          onToggle={() =>
            props.onUpdateComplication({
              enabled: !draft.events.complication.enabled,
            })
          }
        />

        {draft.events.complication.enabled ? (
          <FieldGroup label="Faces de complication">
            <Input
              value={draft.events.complication.faces}
              onChangeText={(faces) => props.onUpdateComplication({ faces })}
              placeholder="Ex : 1"
            />
          </FieldGroup>
        ) : null}
      </Section>
    </View>
  );
}

function renderApplicationStep(
  draft: GuidedBehaviorDraft,
  onSetApplicationMode: Props["onSetApplicationMode"],
) {
  const options: Array<{
    key: GuidedBehaviorApplicationMode;
    title: string;
    description: string;
  }> = [
    {
      key: "auto",
      title: "Automatique",
      description:
        "L’application choisit selon la logique du comportement. Recommandé.",
    },
    {
      key: "single_entry",
      title: "Une ligne de dés",
      description: "Ex : 2d6 + 3, 1d20, 4d6 garder 3.",
    },
    {
      key: "whole_roll",
      title: "Tout le jet",
      description: "Ex : compter les succès sur tout un pool.",
    },
  ];

  return (
    <Section
      title="Application du comportement"
      description="Cette étape remplace l’ancien choix technique Entrée / Groupe / Les deux."
    >
      {options.map((option) => (
        <ChoiceCard
          key={option.key}
          title={option.title}
          description={option.description}
          selected={draft.applicationMode === option.key}
          onPress={() => onSetApplicationMode(option.key)}
        />
      ))}

      <Text
        style={{
          color: "rgba(255,255,255,0.58)",
          fontSize: 12,
          fontWeight: "700",
          lineHeight: 17,
        }}
      >
        Application actuelle :{" "}
        {getGuidedBehaviorApplicationLabel(draft.applicationMode)}. Conversion
        technique : {getRuleScopeUserLabel(draft.resolvedScope)}.
      </Text>
    </Section>
  );
}

function renderSummaryStep(draft: GuidedBehaviorDraft) {
  return (
    <Section
      title="Résumé"
      description="Vérifie la configuration avant de créer le comportement."
    >
      <Text style={{ color: "rgba(255,255,255,0.92)", fontWeight: "900" }}>
        Nom : {draft.name || "—"}
      </Text>

      <Text style={{ color: "rgba(255,255,255,0.62)", fontWeight: "700" }}>
        Description : {draft.description || "—"}
      </Text>

      <Text style={{ color: "rgba(255,255,255,0.62)", fontWeight: "700" }}>
        Dés : {diceCompatibilityToText(draft.diceCompatibility)}
      </Text>

      <Text style={{ color: "rgba(255,255,255,0.62)", fontWeight: "700" }}>
        Lecture : {draft.reading.mode}
      </Text>

      <Text style={{ color: "rgba(255,255,255,0.62)", fontWeight: "700" }}>
        Application : {getGuidedBehaviorApplicationLabel(draft.applicationMode)}
      </Text>

      <Text style={{ color: "rgba(255,255,255,0.62)", fontWeight: "700" }}>
        Sortie principale : {draft.output.primary}
      </Text>
    </Section>
  );
}

export function CreateGuidedBehaviorWizardModal({
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
  onUpdateIdentity,
  onSetIntent,
  onSetDiceCompatibility,
  onSetApplicationMode,
  onUpdateReroll,
  onUpdateExplode,
  onUpdateKeepDrop,
  onUpdateReading,
  onSetReadingMode,
  onUpdateTableRange,
  onAddTableRange,
  onRemoveTableRange,
  onUpdateCriticalSuccess,
  onUpdateCriticalFailure,
  onUpdateComplication,
  onUpdateOutput,
  onOpenPreview,
}: Props) {
  const premium = usePremiumTheme();

  if (!visible) return null;

  const isLastStep = stepIndex === totalSteps - 1;

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
            pointerEvents="none"
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ flex: 1, gap: premium.spacing.xs }}>
                <WizardHeaderPill label="Création guidée · Comportement" />

                <Text
                  style={{
                    color: "rgba(255,255,255,0.96)",
                    fontSize: 24,
                    fontWeight: "900",
                    letterSpacing: -0.35,
                  }}
                >
                  {getGuidedBehaviorStepTitle(step)}
                </Text>

                <Text
                  style={{
                    color: "rgba(255,255,255,0.60)",
                    fontSize: 12,
                    fontWeight: "700",
                    lineHeight: 17,
                  }}
                >
                  {getGuidedBehaviorStepDescription(step)} · Étape{" "}
                  {stepIndex + 1}/{totalSteps}
                </Text>
              </View>

              {onOpenPreview ? (
                <PillButton label="Aperçu" onPress={onOpenPreview} />
              ) : null}
            </View>

            <StepProgress stepIndex={stepIndex} totalSteps={totalSteps} />
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
            {step === "identity"
              ? renderIdentityStep(draft, onUpdateIdentity)
              : null}

            {step === "intent" ? renderIntentStep(draft, onSetIntent) : null}

            {step === "dice"
              ? renderDiceStep(draft, onSetDiceCompatibility)
              : null}

            {step === "transforms"
              ? renderTransformsStep(draft, {
                  onUpdateReroll,
                  onUpdateExplode,
                  onUpdateKeepDrop,
                })
              : null}

            {step === "reading"
              ? renderReadingStep(draft, {
                  onSetReadingMode,
                  onUpdateReading,
                  onUpdateTableRange,
                  onAddTableRange,
                  onRemoveTableRange,
                })
              : null}

            {step === "events"
              ? renderEventsStep(draft, {
                  onUpdateCriticalSuccess,
                  onUpdateCriticalFailure,
                  onUpdateComplication,
                })
              : null}

            {step === "application"
              ? renderApplicationStep(draft, onSetApplicationMode)
              : null}

            {step === "summary" ? renderSummaryStep(draft) : null}
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
            <PillButton label="Annuler" onPress={onClose} />

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: premium.spacing.sm,
              }}
            >
              {stepIndex > 0 ? (
                <PillButton label="Retour" onPress={onBack} />
              ) : null}

              <PillButton
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
