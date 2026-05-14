// dice-universal/features/roll/components/QuickBehaviorConfigModal.tsx

import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import {
  getRuleBehaviorDefinition,
  type RuleBehaviorKey,
} from "../../../core/rules/behaviorRegistry";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

type RangeRow = { min: string; max: string; label: string };

type Props = {
  visible: boolean;
  pendingBehaviorKey: RuleBehaviorKey | null;
  pendingBehaviorLabel: string;
  pendingConfigVariant: "default" | "keep_drop";

  keepDropMode: "keep" | "drop";
  keepDropTarget: "highest" | "lowest";
  keepDropCount: string;

  configKeepCount: string;
  configDropCount: string;
  configResultMode: string;
  configCompare: "gte" | "lte";
  configSuccessThreshold: string;
  configCritSuccessFaces: string;
  configCritFailureFaces: string;
  configSuccessAtOrAbove: string;
  configFailFaces: string;
  configGlitchRule: string;
  configRanges: RangeRow[];

  pipelineRerollFaces: string;
  pipelineRerollOnce: boolean;
  pipelineExplodeFaces: string;

  pipelineMaxRerolls: string;
  pipelineMaxExplosions: string;

  pipelineKeepHighest: string;
  pipelineKeepLowest: string;
  pipelineDropHighest: string;
  pipelineDropLowest: string;

  pipelineCountSuccessAtOrAbove: string;
  pipelineCountEqualFaces: string;
  pipelineCountRangeMin: string;
  pipelineCountRangeMax: string;

  pipelineOutput:
    | "sum"
    | "successes"
    | "count_equal"
    | "count_range"
    | "first_value"
    | "values";

  pipelineSuccessThreshold: string;
  pipelineCompare: "gte" | "lte";
  pipelineCritSuccessFaces: string;
  pipelineCritFailureFaces: string;
  pipelineComplicationFaces: string;
  pipelineComplicationRule:
    | "none"
    | "any"
    | "gt_successes"
    | "gte_successes"
    | "zero_successes";

  configTargetValue: string;
  configDegreeStep: string;
  configCritSuccessMin: string;
  configCritSuccessMax: string;
  configCritFailureMin: string;
  configCritFailureMax: string;

  onChangeTargetValue: (value: string) => void;
  onChangeDegreeStep: (value: string) => void;
  onChangeCritSuccessMin: (value: string) => void;
  onChangeCritSuccessMax: (value: string) => void;
  onChangeCritFailureMin: (value: string) => void;
  onChangeCritFailureMax: (value: string) => void;

  onChangeKeepCount: (value: string) => void;
  onChangeDropCount: (value: string) => void;
  onChangeResultMode: (value: string) => void;
  onChangeCompare: (value: "gte" | "lte") => void;
  onChangeSuccessThreshold: (value: string) => void;
  onChangeCritSuccessFaces: (value: string) => void;
  onChangeCritFailureFaces: (value: string) => void;
  onChangeSuccessAtOrAbove: (value: string) => void;
  onChangeFailFaces: (value: string) => void;
  onChangeGlitchRule: (value: string) => void;
  onUpdateRange: (
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) => void;

  onChangePipelineRerollFaces: (value: string) => void;
  onChangePipelineRerollOnce: (value: boolean) => void;
  onChangePipelineExplodeFaces: (value: string) => void;

  onChangePipelineMaxRerolls: (value: string) => void;
  onChangePipelineMaxExplosions: (value: string) => void;

  onChangePipelineKeepHighest: (value: string) => void;
  onChangePipelineKeepLowest: (value: string) => void;
  onChangePipelineDropHighest: (value: string) => void;
  onChangePipelineDropLowest: (value: string) => void;

  onChangePipelineCountSuccessAtOrAbove: (value: string) => void;
  onChangePipelineCountEqualFaces: (value: string) => void;
  onChangePipelineCountRangeMin: (value: string) => void;
  onChangePipelineCountRangeMax: (value: string) => void;

  onChangePipelineOutput: (
    value:
      | "sum"
      | "successes"
      | "count_equal"
      | "count_range"
      | "first_value"
      | "values",
  ) => void;

  onChangePipelineSuccessThreshold: (value: string) => void;
  onChangePipelineCompare: (value: "gte" | "lte") => void;
  onChangePipelineCritSuccessFaces: (value: string) => void;
  onChangePipelineCritFailureFaces: (value: string) => void;

  onChangePipelineComplicationFaces: (value: string) => void;
  onChangePipelineComplicationRule: (
    value: "none" | "any" | "gt_successes" | "gte_successes" | "zero_successes",
  ) => void;

  onChangeKeepDropMode: (value: "keep" | "drop") => void;
  onChangeKeepDropTarget: (value: "highest" | "lowest") => void;
  onChangeKeepDropCount: (value: string) => void;

  onClose: () => void;
  onConfirm: () => void;
};

function SectionTitle({ children }: { children: string }) {
    const { theme } = useArcaneTheme();
  return (
    <Text
      style={{
        color: theme.colors.textSubtle,
        fontSize: theme.typography.tiny,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}
    >
      {children}
    </Text>
  );
}

function FieldLabel({ children }: { children: string }) {
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

function ConfigInput(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?:
    | "default"
    | "numeric"
    | "number-pad"
    | "numbers-and-punctuation";
}) {
    const { theme } = useArcaneTheme();
  return (
    <View style={{ gap: 6 }}>
      <FieldLabel>{props.label}</FieldLabel>

      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={theme.colors.textSubtle}
        keyboardType={props.keyboardType ?? "numbers-and-punctuation"}
        style={{
          color: theme.colors.text,
          backgroundColor: theme.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: 12,
          paddingVertical: 11,
          fontSize: 16,
        }}
      />
    </View>
  );
}

function ChoiceButton({
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
        paddingHorizontal: 12,
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
          fontWeight: selected ? "900" : "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ActionButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent";
}) {
  const isAccent = variant === "accent";
  const { theme } = useArcaneTheme();

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

function ConfigSection({
  title,
  children,
}: {
  title: string;
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
      <SectionTitle>{title}</SectionTitle>
      {children}
    </View>
  );
}

export function QuickBehaviorConfigModal({
  visible,
  pendingBehaviorKey,
  pendingBehaviorLabel,
  pendingConfigVariant,

  keepDropMode,
  keepDropTarget,
  keepDropCount,

  configKeepCount,
  configDropCount,
  configResultMode,
  configCompare,
  configSuccessThreshold,
  configCritSuccessFaces,
  configCritFailureFaces,
  configSuccessAtOrAbove,
  configFailFaces,
  configGlitchRule,
  configRanges,

  configTargetValue,
  configDegreeStep,
  configCritSuccessMin,
  configCritSuccessMax,
  configCritFailureMin,
  configCritFailureMax,

  pipelineRerollFaces,
  pipelineRerollOnce,
  pipelineExplodeFaces,
  pipelineMaxRerolls,
  pipelineMaxExplosions,
  pipelineKeepHighest,
  pipelineKeepLowest,
  pipelineDropHighest,
  pipelineDropLowest,
  pipelineCountSuccessAtOrAbove,
  pipelineCountEqualFaces,
  pipelineCountRangeMin,
  pipelineCountRangeMax,
  pipelineOutput,
  pipelineSuccessThreshold,
  pipelineCompare,
  pipelineCritSuccessFaces,
  pipelineCritFailureFaces,
  pipelineComplicationFaces,
  pipelineComplicationRule,

  onChangeTargetValue,
  onChangeDegreeStep,
  onChangeCritSuccessMin,
  onChangeCritSuccessMax,
  onChangeCritFailureMin,
  onChangeCritFailureMax,

  onChangeKeepCount,
  onChangeDropCount,
  onChangeResultMode,
  onChangeCompare,
  onChangeSuccessThreshold,
  onChangeCritSuccessFaces,
  onChangeCritFailureFaces,
  onChangeSuccessAtOrAbove,
  onChangeFailFaces,
  onChangeGlitchRule,
  onUpdateRange,
  onChangePipelineRerollFaces,
  onChangePipelineRerollOnce,
  onChangePipelineExplodeFaces,
  onChangePipelineMaxRerolls,
  onChangePipelineMaxExplosions,
  onChangePipelineKeepHighest,
  onChangePipelineKeepLowest,
  onChangePipelineDropHighest,
  onChangePipelineDropLowest,
  onChangePipelineCountSuccessAtOrAbove,
  onChangePipelineCountEqualFaces,
  onChangePipelineCountRangeMin,
  onChangePipelineCountRangeMax,
  onChangePipelineOutput,
  onChangePipelineSuccessThreshold,
  onChangePipelineCompare,
  onChangePipelineCritSuccessFaces,
  onChangePipelineCritFailureFaces,
  onChangePipelineComplicationFaces,
  onChangePipelineComplicationRule,

  onChangeKeepDropMode,
  onChangeKeepDropTarget,
  onChangeKeepDropCount,

  onClose,
  onConfirm,
}: Props) {
  const { theme, styles } = useArcaneTheme();
  
  if (!visible) return null;

  const behavior = pendingBehaviorKey
    ? getRuleBehaviorDefinition(pendingBehaviorKey)
    : null;

  function getFieldValue(key: string) {
    switch (key) {
      case "keepCount":
        return configKeepCount;
      case "dropCount":
        return configDropCount;
      case "resultMode":
        return configResultMode;
      case "compare":
        return configCompare;
      case "successThreshold":
        return configSuccessThreshold;
      case "critSuccessFaces":
        return configCritSuccessFaces;
      case "critFailureFaces":
        return configCritFailureFaces;
      case "successAtOrAbove":
        return configSuccessAtOrAbove;
      case "failFaces":
        return configFailFaces;
      case "glitchRule":
        return configGlitchRule;
      case "targetValue":
        return configTargetValue;
      case "degreeStep":
        return configDegreeStep;
      case "critSuccessMin":
        return configCritSuccessMin;
      case "critSuccessMax":
        return configCritSuccessMax;
      case "critFailureMin":
        return configCritFailureMin;
      case "critFailureMax":
        return configCritFailureMax;
      default:
        return "";
    }
  }

  function setFieldValue(key: string, value: string) {
    switch (key) {
      case "keepCount":
        onChangeKeepCount(value);
        return;
      case "dropCount":
        onChangeDropCount(value);
        return;
      case "resultMode":
        onChangeResultMode(value === "values" ? "values" : "sum");
        return;
      case "compare":
        onChangeCompare(value === "lte" ? "lte" : "gte");
        return;
      case "successThreshold":
        onChangeSuccessThreshold(value);
        return;
      case "critSuccessFaces":
        onChangeCritSuccessFaces(value);
        return;
      case "critFailureFaces":
        onChangeCritFailureFaces(value);
        return;
      case "successAtOrAbove":
        onChangeSuccessAtOrAbove(value);
        return;
      case "failFaces":
        onChangeFailFaces(value);
        return;
      case "glitchRule":
        onChangeGlitchRule(value);
        return;
      case "targetValue":
        onChangeTargetValue(value);
        return;
      case "degreeStep":
        onChangeDegreeStep(value);
        return;
      case "critSuccessMin":
        onChangeCritSuccessMin(value);
        return;
      case "critSuccessMax":
        onChangeCritSuccessMax(value);
        return;
      case "critFailureMin":
        onChangeCritFailureMin(value);
        return;
      case "critFailureMax":
        onChangeCritFailureMax(value);
        return;
      default:
        return;
    }
  }

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.64)",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <View
        style={{
          ...styles.card,
          gap: theme.spacing.md,
          borderColor: theme.colors.accent,
          maxHeight: "92%",
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={styles.sectionTitle}>
            Configurer {pendingBehaviorLabel}
          </Text>

          <Text style={styles.muted}>
            Ajuste la façon dont ce jet sera interprété au moment du lancer.
          </Text>
        </View>

        {!behavior ? (
          <View style={styles.cardSoft}>
            <Text style={styles.muted}>
              Aucun comportement sélectionné.
            </Text>
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={{ gap: theme.spacing.md }}
          showsVerticalScrollIndicator
        >
          {pendingBehaviorKey === "custom_pipeline" &&
          pendingConfigVariant === "keep_drop" ? (
            <>
              <ConfigSection title="Garder / retirer">
                <FieldLabel>Action</FieldLabel>

                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  <ChoiceButton
                    label="Garder"
                    selected={keepDropMode === "keep"}
                    onPress={() => onChangeKeepDropMode("keep")}
                  />

                  <ChoiceButton
                    label="Retirer"
                    selected={keepDropMode === "drop"}
                    onPress={() => onChangeKeepDropMode("drop")}
                  />
                </View>

                <FieldLabel>Cible</FieldLabel>

                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  <ChoiceButton
                    label="Les meilleurs dés"
                    selected={keepDropTarget === "highest"}
                    onPress={() => onChangeKeepDropTarget("highest")}
                  />

                  <ChoiceButton
                    label="Les plus faibles dés"
                    selected={keepDropTarget === "lowest"}
                    onPress={() => onChangeKeepDropTarget("lowest")}
                  />
                </View>

                <ConfigInput
                  label="Nombre de dés"
                  value={keepDropCount}
                  onChangeText={onChangeKeepDropCount}
                  placeholder="Ex: 1"
                  keyboardType="number-pad"
                />
              </ConfigSection>

              <ConfigSection title="Résultat">
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  <ChoiceButton
                    label="Somme"
                    selected={pipelineOutput === "sum"}
                    onPress={() => onChangePipelineOutput("sum")}
                  />

                  <ChoiceButton
                    label="Valeurs"
                    selected={pipelineOutput === "values"}
                    onPress={() => onChangePipelineOutput("values")}
                  />
                </View>
              </ConfigSection>
            </>
          ) : pendingBehaviorKey === "custom_pipeline" ? (
            <>
              <ConfigSection title="Relances et explosions">
                <ConfigInput
                  label="Relancer les faces"
                  value={pipelineRerollFaces}
                  onChangeText={onChangePipelineRerollFaces}
                  placeholder="Ex: 1 ou 1,2"
                />

                <ChoiceButton
                  label={`Relance une seule fois : ${
                    pipelineRerollOnce ? "Oui" : "Non"
                  }`}
                  selected={pipelineRerollOnce}
                  onPress={() =>
                    onChangePipelineRerollOnce(!pipelineRerollOnce)
                  }
                />

                <ConfigInput
                  label="Nombre maximum de relances par dé"
                  value={pipelineMaxRerolls}
                  onChangeText={onChangePipelineMaxRerolls}
                  placeholder="Vide = limite moteur"
                  keyboardType="number-pad"
                />

                <ConfigInput
                  label="Explosion sur les faces"
                  value={pipelineExplodeFaces}
                  onChangeText={onChangePipelineExplodeFaces}
                  placeholder="Ex: 6"
                />

                <ConfigInput
                  label="Nombre maximum d’explosions par dé"
                  value={pipelineMaxExplosions}
                  onChangeText={onChangePipelineMaxExplosions}
                  placeholder="Vide = limite moteur"
                  keyboardType="number-pad"
                />
              </ConfigSection>

              <ConfigSection title="Garder / retirer">
                <ConfigInput
                  label="Garder les meilleurs"
                  value={pipelineKeepHighest}
                  onChangeText={onChangePipelineKeepHighest}
                  placeholder="Ex: 2"
                  keyboardType="number-pad"
                />

                <ConfigInput
                  label="Garder les plus faibles"
                  value={pipelineKeepLowest}
                  onChangeText={onChangePipelineKeepLowest}
                  placeholder="Ex: 2"
                  keyboardType="number-pad"
                />

                <ConfigInput
                  label="Retirer les meilleurs"
                  value={pipelineDropHighest}
                  onChangeText={onChangePipelineDropHighest}
                  placeholder="Ex: 1"
                  keyboardType="number-pad"
                />

                <ConfigInput
                  label="Retirer les plus faibles"
                  value={pipelineDropLowest}
                  onChangeText={onChangePipelineDropLowest}
                  placeholder="Ex: 1"
                  keyboardType="number-pad"
                />
              </ConfigSection>

              <ConfigSection title="Comptage">
                <ConfigInput
                  label="Faces de complication"
                  value={pipelineComplicationFaces}
                  onChangeText={onChangePipelineComplicationFaces}
                  placeholder="Ex: 1 ou 1,2"
                />

                <FieldLabel>Règle de complication</FieldLabel>

                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  <ChoiceButton
                    label="Aucune"
                    selected={pipelineComplicationRule === "none"}
                    onPress={() => onChangePipelineComplicationRule("none")}
                  />

                  <ChoiceButton
                    label="Dès qu’il y en a"
                    selected={pipelineComplicationRule === "any"}
                    onPress={() => onChangePipelineComplicationRule("any")}
                  />

                  <ChoiceButton
                    label="> succès"
                    selected={pipelineComplicationRule === "gt_successes"}
                    onPress={() =>
                      onChangePipelineComplicationRule("gt_successes")
                    }
                  />

                  <ChoiceButton
                    label="≥ succès"
                    selected={pipelineComplicationRule === "gte_successes"}
                    onPress={() =>
                      onChangePipelineComplicationRule("gte_successes")
                    }
                  />

                  <ChoiceButton
                    label="Si zéro succès"
                    selected={pipelineComplicationRule === "zero_successes"}
                    onPress={() =>
                      onChangePipelineComplicationRule("zero_successes")
                    }
                  />
                </View>

                <ConfigInput
                  label="Compter les succès à partir de"
                  value={pipelineCountSuccessAtOrAbove}
                  onChangeText={onChangePipelineCountSuccessAtOrAbove}
                  placeholder="Ex: 5"
                  keyboardType="number-pad"
                />

                <ConfigInput
                  label="Compter les faces exactes"
                  value={pipelineCountEqualFaces}
                  onChangeText={onChangePipelineCountEqualFaces}
                  placeholder="Ex: 1 ou 6,10"
                />

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <ConfigInput
                      label="Plage min"
                      value={pipelineCountRangeMin}
                      onChangeText={onChangePipelineCountRangeMin}
                      placeholder="Ex: 2"
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <ConfigInput
                      label="Plage max"
                      value={pipelineCountRangeMax}
                      onChangeText={onChangePipelineCountRangeMax}
                      placeholder="Ex: 5"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </ConfigSection>

              <ConfigSection title="Sortie du pipeline">
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  <ChoiceButton
                    label="Somme"
                    selected={pipelineOutput === "sum"}
                    onPress={() => onChangePipelineOutput("sum")}
                  />

                  <ChoiceButton
                    label="Succès"
                    selected={pipelineOutput === "successes"}
                    onPress={() => onChangePipelineOutput("successes")}
                  />

                  <ChoiceButton
                    label="Faces exactes"
                    selected={pipelineOutput === "count_equal"}
                    onPress={() => onChangePipelineOutput("count_equal")}
                  />

                  <ChoiceButton
                    label="Plage"
                    selected={pipelineOutput === "count_range"}
                    onPress={() => onChangePipelineOutput("count_range")}
                  />

                  <ChoiceButton
                    label="Première valeur"
                    selected={pipelineOutput === "first_value"}
                    onPress={() => onChangePipelineOutput("first_value")}
                  />

                  <ChoiceButton
                    label="Valeurs"
                    selected={pipelineOutput === "values"}
                    onPress={() => onChangePipelineOutput("values")}
                  />
                </View>
              </ConfigSection>

              <ConfigSection title="Succès / critiques optionnels">
                <ConfigInput
                  label="Seuil final"
                  value={pipelineSuccessThreshold}
                  onChangeText={onChangePipelineSuccessThreshold}
                  placeholder="Ex: 10"
                  keyboardType="number-pad"
                />

                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  <ChoiceButton
                    label="≥ seuil"
                    selected={pipelineCompare === "gte"}
                    onPress={() => onChangePipelineCompare("gte")}
                  />

                  <ChoiceButton
                    label="≤ seuil"
                    selected={pipelineCompare === "lte"}
                    onPress={() => onChangePipelineCompare("lte")}
                  />
                </View>

                <ConfigInput
                  label="Faces de réussite critique"
                  value={pipelineCritSuccessFaces}
                  onChangeText={onChangePipelineCritSuccessFaces}
                  placeholder="Ex: 20"
                />

                <ConfigInput
                  label="Faces d’échec critique"
                  value={pipelineCritFailureFaces}
                  onChangeText={onChangePipelineCritFailureFaces}
                  placeholder="Ex: 1"
                />
              </ConfigSection>
            </>
          ) : null}

          {pendingBehaviorKey !== "custom_pipeline" &&
            behavior?.fields.map((field) => {
              if (field.type === "text" || field.type === "number") {
                return (
                  <ConfigSection key={field.key} title={field.label}>
                    <ConfigInput
                      label={field.label}
                      value={getFieldValue(field.key)}
                      onChangeText={(value) => setFieldValue(field.key, value)}
                      keyboardType={
                        field.type === "number" ? "number-pad" : "default"
                      }
                      placeholder={field.placeholder}
                    />
                  </ConfigSection>
                );
              }

              if (field.type === "select") {
                return (
                  <ConfigSection key={field.key} title={field.label}>
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                    >
                      {field.options.map((option) => (
                        <ChoiceButton
                          key={option.value}
                          label={option.label}
                          selected={getFieldValue(field.key) === option.value}
                          onPress={() => setFieldValue(field.key, option.value)}
                        />
                      ))}
                    </View>
                  </ConfigSection>
                );
              }

              if (field.type === "ranges") {
                return (
                  <ConfigSection key={field.key} title={field.label}>
                    {configRanges.map((row, index) => (
                      <View
                        key={`${pendingBehaviorKey}-range-${index}`}
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

                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <View style={{ flex: 1 }}>
                            <ConfigInput
                              label="Min"
                              value={row.min}
                              onChangeText={(value) =>
                                onUpdateRange(index, "min", value)
                              }
                              placeholder="Min"
                              keyboardType="number-pad"
                            />
                          </View>

                          <View style={{ flex: 1 }}>
                            <ConfigInput
                              label="Max"
                              value={row.max}
                              onChangeText={(value) =>
                                onUpdateRange(index, "max", value)
                              }
                              placeholder="Max"
                              keyboardType="number-pad"
                            />
                          </View>
                        </View>

                        <ConfigInput
                          label="Libellé"
                          value={row.label}
                          onChangeText={(value) =>
                            onUpdateRange(index, "label", value)
                          }
                          placeholder="Label"
                          keyboardType="default"
                        />
                      </View>
                    ))}
                  </ConfigSection>
                );
              }

              return null;
            })}
        </ScrollView>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: theme.spacing.sm,
          }}
        >
          <ActionButton label="Annuler" onPress={onClose} />
          <ActionButton label="Valider" onPress={onConfirm} variant="accent" />
        </View>
      </View>
    </View>
  );
}
