// dice-universal/features/roll/components/QuickBehaviorConfigModal.tsx

import { useMemo } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import {
  getRuleBehaviorDefinition,
  type RuleBehaviorKey,
} from "../../../core/rules/behaviorRegistry";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

type RangeRow = { min: string; max: string; label: string };

type ConfigMode = "simple" | "advanced" | "pipeline" | "keep_drop";

function getConfigModeMeta(params: {
  pendingBehaviorKey: RuleBehaviorKey | null;
  pendingConfigVariant: "default" | "keep_drop";
}): {
  mode: ConfigMode;
  label: string;
  title: string;
  description: string;
} {
  if (params.pendingBehaviorKey === "custom_pipeline") {
    if (params.pendingConfigVariant === "keep_drop") {
      return {
        mode: "keep_drop",
        label: "Réglage rapide",
        title: "Garder ou retirer des dés",
        description:
          "Configure seulement quels dés conserver ou retirer. Idéal pour un jet rapide sans ouvrir tout le moteur avancé.",
      };
    }

    return {
      mode: "pipeline",
      label: "Mode avancé",
      title: "Pipeline personnalisé",
      description:
        "Combine relances, explosions, dés gardés, comptage, seuils, critiques et complications.",
    };
  }

  if (
    params.pendingBehaviorKey === "single_check" ||
    params.pendingBehaviorKey === "success_pool" ||
    params.pendingBehaviorKey === "sum_total"
  ) {
    return {
      mode: "simple",
      label: "Réglage simple",
      title: "Comportement direct",
      description:
        "Ajuste uniquement les paramètres essentiels pour interpréter ce jet.",
    };
  }

  return {
    mode: "advanced",
    label: "Réglage spécialisé",
    title: "Comportement spécifique",
    description:
      "Ce comportement ajoute une logique plus précise au jet, sans passer par le pipeline complet.",
  };
}

type Props = {
  presentation?: "modal" | "inline";
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
  onAddRange: () => void;
  onRemoveRange: (index: number) => void;

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
        letterSpacing: 0.9,
      }}
    >
      ✦ {children}
    </Text>
  );
}

function FieldLabel({ children }: { children: string }) {
  const { theme } = useArcaneTheme();

  return (
    <Text
      style={{
        color: theme.colors.textMuted,
        fontSize: theme.typography.small,
        fontWeight: "900",
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
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <FieldLabel>{props.label}</FieldLabel>

      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={theme.colors.textSubtle}
        keyboardType={props.keyboardType ?? "numbers-and-punctuation"}
        selectionColor={theme.colors.accent}
        style={{
          minHeight: 48,
          color: theme.colors.text,
          backgroundColor: rollTheme.cockpit.panelAlt,
          borderWidth: 1,
          borderColor: rollTheme.cockpit.borderSoft,
          borderRadius: theme.radius.md,
          paddingHorizontal: 12,
          paddingVertical: 11,
          fontSize: 16,
          fontWeight: "700",
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
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 13,
        borderWidth: 1,
        borderColor: selected
          ? theme.colors.accent
          : rollTheme.cockpit.borderSoft,
        borderRadius: theme.radius.pill,
        backgroundColor: selected
          ? theme.colors.accentSoft
          : rollTheme.cockpit.panelAlt,
        opacity: pressed ? 0.84 : selected ? 1 : 0.86,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: selected ? theme.colors.accent : theme.colors.textMuted,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {selected ? "✓ " : ""}
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
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 11,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: isAccent
          ? theme.colors.accent
          : rollTheme.cockpit.borderSoft,
        borderRadius: theme.radius.pill,
        backgroundColor: isAccent
          ? theme.colors.accentSoft
          : rollTheme.cockpit.panelAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        shadowColor: isAccent ? rollTheme.cockpit.glow : theme.colors.black,
        shadowOpacity: isAccent ? 0.2 : 0,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 },
        elevation: isAccent ? 3 : 0,
      })}
    >
      <Text
        style={{
          color: isAccent ? theme.colors.accent : theme.colors.text,
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
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  return (
    <View
      style={{
        ...styles.cardSoft,
        gap: theme.spacing.sm,
        borderColor: rollTheme.cockpit.borderSoft,
        backgroundColor: rollTheme.cockpit.panelAlt,
      }}
    >
      <SectionTitle>{title}</SectionTitle>

      {description ? (
        <Text
          style={{
            color: theme.colors.textMuted,
            lineHeight: 19,
            fontWeight: "600",
          }}
        >
          {description}
        </Text>
      ) : null}

      {children}
    </View>
  );
}

function ModeIntroCard({
  label,
  title,
  description,
  mode,
}: {
  label: string;
  title: string;
  description: string;
  mode: ConfigMode;
}) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const icon =
    mode === "pipeline"
      ? "⚙️"
      : mode === "keep_drop"
        ? "🎯"
        : mode === "advanced"
          ? "✦"
          : "🎲";

  const borderColor =
    mode === "pipeline"
      ? theme.colors.arcane
      : mode === "keep_drop"
        ? theme.colors.accent
        : rollTheme.cockpit.borderSoft;

  const backgroundColor =
    mode === "pipeline"
      ? theme.colors.arcaneSoft
      : mode === "keep_drop"
        ? theme.colors.accentSoft
        : rollTheme.cockpit.panelAlt;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor,
        borderRadius: theme.radius.lg,
        backgroundColor,
        padding: theme.spacing.md,
        gap: theme.spacing.xs,
      }}
    >
      <Text
        style={{
          color: theme.colors.textSubtle,
          fontSize: theme.typography.tiny,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.9,
        }}
      >
        {icon} {label}
      </Text>

      <Text
        style={{
          color: theme.colors.text,
          fontSize: 17,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: theme.colors.textMuted,
          lineHeight: 19,
          fontWeight: "600",
        }}
      >
        {description}
      </Text>
    </View>
  );
}

export function QuickBehaviorConfigModal({
  presentation = "modal",
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
  onAddRange,
  onRemoveRange,
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
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  if (!visible) return null;

  const behavior = pendingBehaviorKey
    ? getRuleBehaviorDefinition(pendingBehaviorKey)
    : null;

  const configMode = getConfigModeMeta({
    pendingBehaviorKey,
    pendingConfigVariant,
  });

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

  const content = (
    <View
      style={{
        ...styles.card,
        gap: theme.spacing.md,
        borderColor: theme.colors.accent,
        backgroundColor: rollTheme.cockpit.panel,
        borderRadius: rollTheme.layout.cockpitRadius,
        maxHeight: presentation === "modal" ? "92%" : undefined,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -60,
          right: -54,
          width: 160,
          height: 160,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.glow,
          opacity: 0.18,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -76,
          left: -66,
          width: 170,
          height: 170,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.magicGlow,
          opacity: 0.12,
        }}
      />

      <View style={{ gap: theme.spacing.xs }}>
        <Text
          style={{
            color: theme.colors.textSubtle,
            fontSize: theme.typography.tiny,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.9,
          }}
        >
          ✦ Configuration rapide
        </Text>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 22,
            fontWeight: "900",
            letterSpacing: -0.3,
          }}
        >
          {pendingBehaviorLabel || "Comportement du jet"}
        </Text>

        <Text
          style={{
            color: theme.colors.textMuted,
            lineHeight: 20,
            fontWeight: "600",
          }}
        >
          Ajuste la façon dont ce jet sera interprété au moment du lancer.
        </Text>
      </View>

      {!behavior ? (
        <View style={styles.cardSoft}>
          <Text style={styles.muted}>Aucun comportement sélectionné.</Text>
        </View>
      ) : null}

      <ModeIntroCard
        label={configMode.label}
        title={configMode.title}
        description={configMode.description}
        mode={configMode.mode}
      />

      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.md,
          paddingBottom: theme.spacing.sm,
        }}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {pendingBehaviorKey === "custom_pipeline" &&
        pendingConfigVariant === "keep_drop" ? (
          <>
            <ConfigSection
              title="Garder / retirer"
              description="Choisis rapidement si le jet conserve ou retire certains dés avant de produire le résultat."
            >
              <FieldLabel>Action</FieldLabel>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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

            <ConfigSection
              title="Résultat"
              description="Détermine si le jet final renvoie une somme ou les valeurs conservées."
            >
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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
            <ConfigSection
              title="Relances et explosions"
              description="Déclenche des relances ou des dés supplémentaires selon certaines faces."
            >
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
                onPress={() => onChangePipelineRerollOnce(!pipelineRerollOnce)}
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

            <ConfigSection
              title="Garder / retirer"
              description="Choisis quels dés sont conservés ou retirés avant le résultat final."
            >
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

            <ConfigSection
              title="Comptage"
              description="Configure les options de comptage pour les résultats des dés."
            >
              <ConfigInput
                label="Faces de complication"
                value={pipelineComplicationFaces}
                onChangeText={onChangePipelineComplicationFaces}
                placeholder="Ex: 1 ou 1,2"
              />

              <FieldLabel>Règle de complication</FieldLabel>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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

            <ConfigSection
              title="Sortie du pipeline"
              description="Configure la manière dont les résultats du pipeline sont présentés."
            >
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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

            <ConfigSection
              title="Succès / critiques optionnels"
              description="Configure les options pour les succès et les critiques."
            >
              <ConfigInput
                label="Seuil final"
                value={pipelineSuccessThreshold}
                onChangeText={onChangePipelineSuccessThreshold}
                placeholder="Ex: 10"
                keyboardType="number-pad"
              />

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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

        {pendingBehaviorKey !== "custom_pipeline" && behavior ? (
          <ConfigSection
            title="Paramètres du comportement"
            description="Ces réglages suffisent pour configurer ce type de jet. Les options avancées restent réservées au pipeline personnalisé."
          >
            <View style={{ gap: theme.spacing.md }}>
              {behavior.fields.map((field) => {
                if (field.type === "text" || field.type === "number") {
                  return (
                    <ConfigInput
                      key={field.key}
                      label={field.label}
                      value={getFieldValue(field.key)}
                      onChangeText={(value) => setFieldValue(field.key, value)}
                      keyboardType={
                        field.type === "number" ? "number-pad" : "default"
                      }
                      placeholder={field.placeholder}
                    />
                  );
                }

                if (field.type === "select") {
                  return (
                    <View key={field.key} style={{ gap: theme.spacing.sm }}>
                      <FieldLabel>{field.label}</FieldLabel>

                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {field.options.map((option) => (
                          <ChoiceButton
                            key={option.value}
                            label={option.label}
                            selected={getFieldValue(field.key) === option.value}
                            onPress={() =>
                              setFieldValue(field.key, option.value)
                            }
                          />
                        ))}
                      </View>
                    </View>
                  );
                }

                if (field.type === "ranges") {
                  return (
                    <View key={field.key} style={{ gap: theme.spacing.sm }}>
                      <FieldLabel>{field.label}</FieldLabel>

                      {configRanges.map((row, index) => (
                        <View
                          key={`${pendingBehaviorKey}-range-${index}`}
                          style={{
                            ...styles.cardSoft,
                            gap: theme.spacing.sm,
                            borderColor: rollTheme.cockpit.borderSoft,
                            backgroundColor: rollTheme.cockpit.panel,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
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

                            <Pressable
                              onPress={() => onRemoveRange(index)}
                              disabled={configRanges.length <= 1}
                              style={({ pressed }) => ({
                                paddingVertical: 6,
                                paddingHorizontal: 10,
                                borderRadius: theme.radius.pill,
                                borderWidth: 1,
                                borderColor:
                                  configRanges.length <= 1
                                    ? "rgba(145, 113, 255, 0.14)"
                                    : "rgba(255, 92, 122, 0.52)",
                                backgroundColor:
                                  configRanges.length <= 1
                                    ? "rgba(32, 41, 88, 0.28)"
                                    : "rgba(255, 92, 122, 0.1)",
                                opacity: pressed
                                  ? 0.78
                                  : configRanges.length <= 1
                                    ? 0.45
                                    : 1,
                              })}
                            >
                              <Text
                                style={{
                                  color:
                                    configRanges.length <= 1
                                      ? theme.colors.textSubtle
                                      : theme.colors.failure,
                                  fontSize: theme.typography.tiny,
                                  fontWeight: "900",
                                }}
                              >
                                Supprimer
                              </Text>
                            </Pressable>
                          </View>

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
                      <Pressable
                        onPress={onAddRange}
                        style={({ pressed }) => ({
                          alignSelf: "flex-start",
                          paddingVertical: 9,
                          paddingHorizontal: 13,
                          borderRadius: theme.radius.pill,
                          borderWidth: 1,
                          borderColor: theme.colors.accent,
                          backgroundColor: pressed
                            ? "rgba(217, 160, 55, 0.2)"
                            : "rgba(217, 160, 55, 0.12)",
                          opacity: pressed ? 0.84 : 1,
                        })}
                      >
                        <Text
                          style={{
                            color: theme.colors.accent,
                            fontSize: theme.typography.small,
                            fontWeight: "900",
                          }}
                        >
                          + Ajouter une plage
                        </Text>
                      </Pressable>
                    </View>
                  );
                }

                return null;
              })}
            </View>
          </ConfigSection>
        ) : null}
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
  );

  if (presentation === "inline") {
    return content;
  }

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.72)",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {content}
    </View>
  );
}
