// dice-universal\features\roll3d\components\Roll3DActionEntryAdjustmentCard.tsx

import { Pressable, ScrollView, Text, View } from "react-native";

import {
  getRuleBehaviorDefinition,
  type RuleBehaviorField,
  type RuleBehaviorKey,
} from "../../../core/rules/behaviorRegistry";
import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DActionEntryAdjustment } from "../types";

type Roll3DActionEntryAdjustmentCardProps = {
  adjustment: Roll3DActionEntryAdjustment;
  compact?: boolean;
  onChangeQty: (delta: number) => void;
  onChangeModifier: (delta: number) => void;
  onToggleSign: () => void;
  onChangeBehaviorParam: (params: {
    paramsKey: string;
    value: unknown;
  }) => void;
  onClose: () => void;
};

type NumberBehaviorField = RuleBehaviorField & {
  type: "number";
  defaultValue: string;
  placeholder?: string;
};

type SelectBehaviorField = RuleBehaviorField & {
  type: "select";
  defaultValue: string;
  options: { value: string; label: string }[];
};

type TextBehaviorField = RuleBehaviorField & {
  type: "text";
  defaultValue: string;
  placeholder?: string;
};

type EditableBehaviorField =
  | NumberBehaviorField
  | SelectBehaviorField
  | TextBehaviorField;

type KeepDropPipelineMode =
  | "keep_highest"
  | "keep_lowest"
  | "drop_highest"
  | "drop_lowest";

type KeepDropPipelineConfig = {
  mode: KeepDropPipelineMode;
  count: number;
  resultMode: "sum" | "values";
};

function isNumberBehaviorField(
  field: RuleBehaviorField,
): field is NumberBehaviorField {
  return field.type === "number";
}

function isSelectBehaviorField(
  field: RuleBehaviorField,
): field is SelectBehaviorField {
  return field.type === "select";
}

function isTextBehaviorField(
  field: RuleBehaviorField,
): field is TextBehaviorField {
  return field.type === "text";
}

function isFacesTextField(
  field: RuleBehaviorField,
): field is TextBehaviorField {
  if (!isTextBehaviorField(field)) {
    return false;
  }

  const paramsKey = getFieldParamsKey(field);

  return paramsKey.includes("faces") || paramsKey.includes("face");
}

function isEditableBehaviorField(
  field: RuleBehaviorField,
): field is EditableBehaviorField {
  return (
    isNumberBehaviorField(field) ||
    isSelectBehaviorField(field) ||
    isFacesTextField(field)
  );
}

function SmallButton({
  label,
  disabled,
  variant = "default",
  onPress,
}: {
  label: string;
  disabled?: boolean;
  variant?: "default" | "accent" | "danger";
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  const isAccent = variant === "accent";
  const isDanger = variant === "danger";

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 34,
        minWidth: 38,
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: disabled
          ? premium.colors.border.subtle
          : isAccent
            ? premium.colors.border.accent
            : isDanger
              ? "rgba(239, 111, 145, 0.34)"
              : premium.colors.border.subtle,
        backgroundColor: disabled
          ? premium.colors.surface.disabled
          : isAccent
            ? premium.colors.accent.soft
            : isDanger
              ? premium.colors.state.failureSoft
              : pressed
                ? premium.colors.surface.pressed
                : premium.colors.surface.secondary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        opacity: disabled ? 0.42 : pressed ? 0.78 : 1,
        transform: [
          { scale: pressed && !disabled ? premium.animation.pressScale : 1 },
        ],
      })}
    >
      <Text
        style={{
          color: disabled
            ? premium.colors.text.muted
            : isAccent
              ? premium.colors.accent.primary
              : isDanger
                ? premium.colors.state.failure
                : premium.colors.text.secondary,
          fontSize: 11,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StepperButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 34,
        height: 34,
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: disabled
          ? premium.colors.border.subtle
          : premium.colors.border.accent,
        backgroundColor: disabled
          ? premium.colors.surface.disabled
          : pressed
            ? premium.colors.surface.pressed
            : "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.42 : pressed ? 0.78 : 1,
        transform: [
          {
            scale: pressed && !disabled ? premium.animation.pressScale : 1,
          },
        ],
      })}
    >
      <Text
        style={{
          color: disabled
            ? premium.colors.text.muted
            : premium.colors.accent.primary,
          fontSize: 18,
          fontWeight: "900",
          lineHeight: 20,
          includeFontPadding: false,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StepperRow({
  label,
  value,
  onMinus,
  onPlus,
  minusDisabled,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  minusDisabled?: boolean;
}) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 164,
        minWidth: 164,
        borderRadius: premium.radius.lg,
        borderWidth: 1,
        borderColor: premium.colors.border.subtle,
        backgroundColor: "rgba(255,255,255,0.045)",
        padding: 8,
        gap: 6,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: premium.colors.text.muted,
          fontSize: 9,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
      >
        {label}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <StepperButton label="−" disabled={minusDisabled} onPress={onMinus} />

        <View
          style={{
            flex: 1,
            minWidth: 48,
            height: 34,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.18)",
            backgroundColor: "rgba(232, 200, 120, 0.08)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 8,
          }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={{
              color: premium.colors.accent.primary,
              fontSize: 15,
              fontWeight: "900",
              lineHeight: 18,
              includeFontPadding: false,
              textAlign: "center",
            }}
          >
            {value}
          </Text>
        </View>

        <StepperButton label="+" onPress={onPlus} />
      </View>
    </View>
  );
}

function safeParseParams(paramsJson: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(paramsJson || "{}");

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return {};
  } catch {
    return {};
  }
}

function getPipelineKeepDropConfig(
  params: Record<string, unknown>,
): KeepDropPipelineConfig | null {
  const steps = Array.isArray(params.steps) ? params.steps : [];

  const keepDropStep = steps.find((step) => {
    if (!step || typeof step !== "object") {
      return false;
    }

    const op = (step as { op?: unknown }).op;

    return (
      op === "keep_highest" ||
      op === "keep_lowest" ||
      op === "drop_highest" ||
      op === "drop_lowest"
    );
  }) as { op?: KeepDropPipelineMode; n?: unknown } | undefined;

  if (!keepDropStep?.op) {
    return null;
  }

  const count = Number(keepDropStep.n ?? 1);
  const output = params.output;

  return {
    mode: keepDropStep.op,
    count: Number.isFinite(count) && count > 0 ? count : 1,
    resultMode: output === "values" ? "values" : "sum",
  };
}

function updatePipelineKeepDropParams(params: {
  baseParams: Record<string, unknown>;
  nextConfig: KeepDropPipelineConfig;
}) {
  const { baseParams, nextConfig } = params;
  const steps = Array.isArray(baseParams.steps) ? baseParams.steps : [];

  const nextSteps = steps.map((step) => {
    if (!step || typeof step !== "object") {
      return step;
    }

    const currentStep = step as Record<string, unknown>;
    const op = currentStep.op;

    if (
      op === "keep_highest" ||
      op === "keep_lowest" ||
      op === "drop_highest" ||
      op === "drop_lowest"
    ) {
      return {
        ...currentStep,
        op: nextConfig.mode,
        n: nextConfig.count,
      };
    }

    return step;
  });

  return {
    steps: nextSteps,
    output: nextConfig.resultMode,
  };
}

function getFieldParamsKey(field: RuleBehaviorField) {
  return field.paramsKey ?? field.key;
}

function getRoll3DBehaviorRegistryKey(kind: string): RuleBehaviorKey | null {
  const normalizedKindMap: Record<string, RuleBehaviorKey> = {
    sum: "sum_total",
    sum_total: "sum_total",

    single_check: "single_check",
    d20: "single_check",

    threshold_degrees: "threshold_degrees",

    success_pool: "success_pool",
    pool: "success_pool",

    table_lookup: "table_lookup",
    banded_sum: "banded_sum",

    highest_of_pool: "highest_of_pool",
    lowest_of_pool: "lowest_of_pool",

    keep_highest: "keep_highest_n",
    keep_highest_n: "keep_highest_n",

    keep_lowest: "keep_lowest_n",
    keep_lowest_n: "keep_lowest_n",

    drop_highest: "drop_highest_n",
    drop_highest_n: "drop_highest_n",

    drop_lowest: "drop_lowest_n",
    drop_lowest_n: "drop_lowest_n",

    pipeline: "custom_pipeline",
    custom_pipeline: "custom_pipeline",
  };

  return normalizedKindMap[kind] ?? null;
}

function getNumberParamValue(params: {
  field: NumberBehaviorField;
  baseParams: Record<string, unknown>;
  overrideParams: Record<string, unknown>;
}) {
  const { field, baseParams, overrideParams } = params;
  const paramsKey = getFieldParamsKey(field);

  const rawValue =
    overrideParams[paramsKey] ??
    baseParams[paramsKey] ??
    (field.defaultValue.length > 0 ? field.defaultValue : "0");

  const numericValue = Number(rawValue);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function getSelectParamValue(params: {
  field: SelectBehaviorField;
  baseParams: Record<string, unknown>;
  overrideParams: Record<string, unknown>;
}) {
  const { field, baseParams, overrideParams } = params;
  const paramsKey = getFieldParamsKey(field);

  const rawValue =
    overrideParams[paramsKey] ?? baseParams[paramsKey] ?? field.defaultValue;

  return String(rawValue);
}

function parseFacesValue(rawValue: unknown): number[] {
  if (Array.isArray(rawValue)) {
    return rawValue.map(Number).filter(Number.isFinite);
  }

  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return [rawValue];
  }

  if (typeof rawValue === "string") {
    return rawValue
      .split(",")
      .map((part) => Number(part.trim()))
      .filter(Number.isFinite);
  }

  return [];
}

function createNumberRange(min: number, max: number) {
  const start = Math.min(min, max);
  const end = Math.max(min, max);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function isCriticalSuccessParamsKey(paramsKey: string) {
  return paramsKey.includes("crit_success") || paramsKey.includes("critical_success");
}

function isCriticalFailureParamsKey(paramsKey: string) {
  return paramsKey.includes("crit_failure") || paramsKey.includes("critical_failure");
}

function getFacesParamValue(params: {
  field: TextBehaviorField;
  baseParams: Record<string, unknown>;
  overrideParams: Record<string, unknown>;
}) {
  const { field, baseParams, overrideParams } = params;
  const paramsKey = getFieldParamsKey(field);

  const rawValue =
    overrideParams[paramsKey] ?? baseParams[paramsKey] ?? field.defaultValue;

  const faces = parseFacesValue(rawValue);

  if (faces.length > 0) {
    return faces;
  }

  const defaultFaces = parseFacesValue(field.defaultValue);

  return defaultFaces.length > 0 ? defaultFaces : [1];
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function getBehaviorNumberParamBounds(params: {
  paramsKey: string;
  adjustment: Roll3DActionEntryAdjustment;
}) {
  const { paramsKey, adjustment } = params;

  const diceMax = adjustment.sides;
  const diceCount = Math.max(1, Math.floor(adjustment.qty));

  if (
    paramsKey === "success_at_or_above" ||
    paramsKey === "successAtOrAbove"
  ) {
    return {
      min: 1,
      max: diceMax,
    };
  }

  if (
    paramsKey.includes("threshold") ||
    paramsKey.includes("target") ||
    paramsKey.includes("value")
  ) {
    return {
      min: 1,
      max: diceMax + Math.max(0, Math.abs(adjustment.modifier)),
    };
  }

  if (paramsKey.includes("degree_step")) {
    return {
      min: 1,
      max: diceMax,
    };
  }

  if (
    paramsKey.includes("crit_success") ||
    paramsKey.includes("crit_failure") ||
    paramsKey.includes("face")
  ) {
    return {
      min: 1,
      max: diceMax,
    };
  }

  if (paramsKey === "keep" || paramsKey === "drop") {
    return {
      min: 1,
      max: diceCount,
    };
  }

  return {
    min: 0,
    max: 999,
  };
}

function BehaviorNumberParamRow({
  field,
  value,
  min,
  max,
  onChange,
}: {
  field: NumberBehaviorField;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const step = 1;

  const safeValue = clampNumber(value, min, max);

  return (
    <StepperRow
      label={field.label}
      value={`${safeValue}`}
      minusDisabled={safeValue <= min}
      onMinus={() => onChange(clampNumber(safeValue - step, min, max))}
      onPlus={() => onChange(clampNumber(safeValue + step, min, max))}
    />
  );
}

function BehaviorFacesParamRow({
  field,
  paramsKey,
  value,
  min,
  max,
  onChange,
}: {
  field: TextBehaviorField;
  paramsKey: string;
  value: number[];
  min: number;
  max: number;
  onChange: (value: number[]) => void;
}) {
  const premium = usePremiumTheme();

  const sortedValue = [...value]
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  const firstValue = sortedValue[0] ?? min;
  const lastValue = sortedValue[sortedValue.length - 1] ?? firstValue;

  const isFailureCritical = isCriticalFailureParamsKey(paramsKey);
  const isSuccessCritical = isCriticalSuccessParamsKey(paramsKey);

  const currentFace = clampNumber(
    isSuccessCritical ? firstValue : lastValue,
    min,
    max,
  );

  const exactValue = [currentFace];

  const rangeValue =
    isFailureCritical
      ? createNumberRange(min, currentFace)
      : isSuccessCritical
        ? createNumberRange(currentFace, max)
        : exactValue;

  const isRangeAvailable = isFailureCritical || isSuccessCritical;

  const isRangeSelected =
    isRangeAvailable &&
    sortedValue.length === rangeValue.length &&
    sortedValue.every((face, index) => face === rangeValue[index]);

  const displayValue = isRangeSelected
    ? isFailureCritical
      ? `${min}–${currentFace}`
      : `${currentFace}–${max}`
    : `${currentFace}`;

  const applyExact = () => {
    onChange(exactValue);
  };

  const applyRange = () => {
    onChange(rangeValue);
  };

  const updateFace = (nextFace: number) => {
    const clampedFace = clampNumber(nextFace, min, max);

    if (isRangeSelected) {
      if (isFailureCritical) {
        onChange(createNumberRange(min, clampedFace));
        return;
      }

      if (isSuccessCritical) {
        onChange(createNumberRange(clampedFace, max));
        return;
      }
    }

    onChange([clampedFace]);
  };

  return (
    <View
      style={{
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 164,
        minWidth: 164,
        gap: 6,
      }}
    >
      <StepperRow
        label={field.label}
        value={displayValue}
        minusDisabled={currentFace <= min}
        onMinus={() => updateFace(currentFace - 1)}
        onPlus={() => updateFace(currentFace + 1)}
      />

      {isRangeAvailable ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <Pressable
            onPress={applyExact}
            style={({ pressed }) => ({
              borderRadius: premium.radius.pill,
              borderWidth: 1,
              borderColor: !isRangeSelected
                ? premium.colors.border.accent
                : premium.colors.border.subtle,
              backgroundColor: !isRangeSelected
                ? premium.colors.accent.soft
                : pressed
                  ? premium.colors.surface.pressed
                  : "rgba(255,255,255,0.045)",
              paddingHorizontal: 9,
              paddingVertical: 6,
              opacity: pressed ? 0.78 : 1,
            })}
          >
            <Text
              style={{
                color: !isRangeSelected
                  ? premium.colors.accent.primary
                  : premium.colors.text.secondary,
                fontSize: 9,
                fontWeight: "900",
              }}
            >
              Seulement {currentFace}
            </Text>
          </Pressable>

          <Pressable
            onPress={applyRange}
            style={({ pressed }) => ({
              borderRadius: premium.radius.pill,
              borderWidth: 1,
              borderColor: isRangeSelected
                ? premium.colors.border.accent
                : premium.colors.border.subtle,
              backgroundColor: isRangeSelected
                ? premium.colors.accent.soft
                : pressed
                  ? premium.colors.surface.pressed
                  : "rgba(255,255,255,0.045)",
              paddingHorizontal: 9,
              paddingVertical: 6,
              opacity: pressed ? 0.78 : 1,
            })}
          >
            <Text
              style={{
                color: isRangeSelected
                  ? premium.colors.accent.primary
                  : premium.colors.text.secondary,
                fontSize: 9,
                fontWeight: "900",
              }}
            >
              {isFailureCritical ? `${min} à ${currentFace}` : `${currentFace} à ${max}`}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function BehaviorSelectParamRow({
  field,
  value,
  onChange,
}: {
  field: SelectBehaviorField;
  value: string;
  onChange: (value: string) => void;
}) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        gap: 6,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: premium.colors.text.muted,
          fontSize: 9,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
      >
        {field.label}
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {field.options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => ({
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: selected
                  ? premium.colors.border.accent
                  : premium.colors.border.subtle,
                backgroundColor: selected
                  ? premium.colors.accent.soft
                  : pressed
                    ? premium.colors.surface.pressed
                    : "rgba(255,255,255,0.045)",
                paddingHorizontal: 10,
                paddingVertical: 7,
                opacity: pressed ? 0.78 : 1,
                transform: [
                  {
                    scale: pressed ? premium.animation.pressScale : 1,
                  },
                ],
              })}
            >
              <Text
                style={{
                  color: selected
                    ? premium.colors.accent.primary
                    : premium.colors.text.secondary,
                  fontSize: 10,
                  fontWeight: "900",
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function BehaviorKeepDropPipelineSection({
  adjustment,
  baseParams,
  overrideParams,
  onChangeBehaviorParam,
}: {
  adjustment: Roll3DActionEntryAdjustment;
  baseParams: Record<string, unknown>;
  overrideParams: Record<string, unknown>;
  onChangeBehaviorParam: (params: {
    paramsKey: string;
    value: unknown;
  }) => void;
}) {
  const premium = usePremiumTheme();

  const maxCount = Math.max(1, Math.floor(adjustment.qty));

  const currentParams = {
    ...baseParams,
    ...overrideParams,
  };

  const config = getPipelineKeepDropConfig(currentParams);

  if (!config) {
    return null;
  }

  const updateConfig = (nextConfig: KeepDropPipelineConfig) => {
    const nextOverride = updatePipelineKeepDropParams({
      baseParams: currentParams,
      nextConfig,
    });

    onChangeBehaviorParam({
      paramsKey: "steps",
      value: nextOverride.steps,
    });

    onChangeBehaviorParam({
      paramsKey: "output",
      value: nextOverride.output,
    });
  };

  const modeOptions: { value: KeepDropPipelineMode; label: string }[] = [
    { value: "keep_highest", label: "Garder meilleurs" },
    { value: "keep_lowest", label: "Garder pires" },
    { value: "drop_highest", label: "Retirer meilleurs" },
    { value: "drop_lowest", label: "Retirer pires" },
  ];

  return (
    <View
      style={{
        gap: 9,
      }}
    >
      <View style={{ gap: 2 }}>
        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 9,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Paramètres du comportement
        </Text>

        <Text
          style={{
            color: premium.colors.text.secondary,
            fontSize: 10,
            fontWeight: "800",
            lineHeight: 14,
          }}
        >
          Garder / retirer des dés
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {modeOptions.map((option) => {
          const selected = option.value === config.mode;

          return (
            <Pressable
              key={option.value}
              onPress={() =>
                updateConfig({
                  ...config,
                  mode: option.value,
                })
              }
              style={({ pressed }) => ({
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: selected
                  ? premium.colors.border.accent
                  : premium.colors.border.subtle,
                backgroundColor: selected
                  ? premium.colors.accent.soft
                  : pressed
                    ? premium.colors.surface.pressed
                    : "rgba(255,255,255,0.045)",
                paddingHorizontal: 10,
                paddingVertical: 7,
                opacity: pressed ? 0.78 : 1,
                transform: [
                  {
                    scale: pressed ? premium.animation.pressScale : 1,
                  },
                ],
              })}
            >
              <Text
                style={{
                  color: selected
                    ? premium.colors.accent.primary
                    : premium.colors.text.secondary,
                  fontSize: 10,
                  fontWeight: "900",
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <StepperRow
        label={
          config.mode.startsWith("keep")
            ? "Nombre de dés à garder"
            : "Nombre de dés à retirer"
        }
        value={`${clampNumber(config.count, 1, maxCount)}`}
        minusDisabled={config.count <= 1}
        onMinus={() =>
          updateConfig({
            ...config,
            count: clampNumber(config.count - 1, 1, maxCount),
          })
        }
        onPlus={() =>
          updateConfig({
            ...config,
            count: clampNumber(config.count + 1, 1, maxCount),
          })
        }
      />

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {[
          { value: "sum", label: "Somme" },
          { value: "values", label: "Valeurs" },
        ].map((option) => {
          const selected = option.value === config.resultMode;

          return (
            <Pressable
              key={option.value}
              onPress={() =>
                updateConfig({
                  ...config,
                  resultMode: option.value as "sum" | "values",
                })
              }
              style={({ pressed }) => ({
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: selected
                  ? premium.colors.border.accent
                  : premium.colors.border.subtle,
                backgroundColor: selected
                  ? premium.colors.accent.soft
                  : pressed
                    ? premium.colors.surface.pressed
                    : "rgba(255,255,255,0.045)",
                paddingHorizontal: 10,
                paddingVertical: 7,
                opacity: pressed ? 0.78 : 1,
              })}
            >
              <Text
                style={{
                  color: selected
                    ? premium.colors.accent.primary
                    : premium.colors.text.secondary,
                  fontSize: 10,
                  fontWeight: "900",
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function BehaviorParamsSection({
  adjustment,
  onChangeBehaviorParam,
}: {
  adjustment: Roll3DActionEntryAdjustment;
  onChangeBehaviorParam: (params: {
    paramsKey: string;
    value: unknown;
  }) => void;
}) {
  const premium = usePremiumTheme();

  const behavior =
    adjustment.behaviorParamsTarget === "group"
      ? adjustment.groupBehavior
      : adjustment.behavior;

  if (!behavior) {
    return null;
  }

  const registryKey = getRoll3DBehaviorRegistryKey(behavior.kind);
  const definition = registryKey ? getRuleBehaviorDefinition(registryKey) : null;

  if (!definition) {
    return (
      <View style={{ gap: 4 }}>
        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 9,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Paramètres du comportement
        </Text>

        <Text
          style={{
            color: premium.colors.text.secondary,
            fontSize: 10,
            fontWeight: "800",
            lineHeight: 14,
          }}
        >
          Ce comportement n’expose pas encore de réglages rapides dans Roll3D.
        </Text>
      </View>
    );
  }

  const baseParams = safeParseParams(behavior.rule.params_json);
  const overrideParams = adjustment.behaviorParamsOverride ?? {};
  const keepDropPipelineConfig = getPipelineKeepDropConfig({
    ...baseParams,
    ...overrideParams,
  });

  if (definition.key === "custom_pipeline") {
    if (keepDropPipelineConfig) {
      return (
        <BehaviorKeepDropPipelineSection
          adjustment={adjustment}
          baseParams={baseParams}
          overrideParams={overrideParams}
          onChangeBehaviorParam={onChangeBehaviorParam}
        />
      );
    }

    return (
      <View style={{ gap: 4 }}>
        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 9,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Paramètres du comportement
        </Text>

        <Text
          style={{
            color: premium.colors.text.secondary,
            fontSize: 10,
            fontWeight: "800",
            lineHeight: 14,
          }}
        >
          Pipeline avancé : édition complète prévue dans la page Comportements.
        </Text>
      </View>
    );
  }

  const editableFields = definition.fields.filter(isEditableBehaviorField);

  if (editableFields.length === 0) {
    return (
      <View style={{ gap: 4 }}>
        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 9,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Paramètres du comportement
        </Text>

        <Text
          style={{
            color: premium.colors.text.secondary,
            fontSize: 10,
            fontWeight: "800",
            lineHeight: 14,
          }}
        >
          Ce comportement sera configurable depuis la page Comportements.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        gap: 8,
        paddingTop: 2,
      }}
    >
      <View style={{ gap: 2 }}>
        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 9,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Paramètres du comportement
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: premium.colors.text.secondary,
            fontSize: 10,
            fontWeight: "800",
          }}
        >
          {definition.label}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "stretch",
          gap: 8,
        }}
      >
        {editableFields.map((field) => {
          const paramsKey = getFieldParamsKey(field);

          if (isNumberBehaviorField(field)) {
            const value = getNumberParamValue({
              field,
              baseParams,
              overrideParams,
            });

            const bounds = getBehaviorNumberParamBounds({
              paramsKey,
              adjustment,
            });

            return (
              <BehaviorNumberParamRow
                key={paramsKey}
                field={field}
                value={value}
                min={bounds.min}
                max={bounds.max}
                onChange={(nextValue) =>
                  onChangeBehaviorParam({
                    paramsKey,
                    value: nextValue,
                  })
                }
              />
            );
          }

          if (isFacesTextField(field)) {
            const value = getFacesParamValue({
              field,
              baseParams,
              overrideParams,
            });

            return (
              <BehaviorFacesParamRow
                key={paramsKey}
                field={field}
                paramsKey={paramsKey}
                value={value}
                min={1}
                max={adjustment.sides}
                onChange={(nextValue) =>
                  onChangeBehaviorParam({
                    paramsKey,
                    value: nextValue,
                  })
                }
              />
            );
          }

          if (isSelectBehaviorField(field)) {
            const value = getSelectParamValue({
              field,
              baseParams,
              overrideParams,
            });

            return (
              <View
                key={paramsKey}
                style={{
                  width: "100%",
                }}
              >
                <BehaviorSelectParamRow
                  field={field}
                  value={value}
                  onChange={(nextValue) =>
                    onChangeBehaviorParam({
                      paramsKey,
                      value: nextValue,
                    })
                  }
                />
              </View>
            );
          }

          return null;
        })}
      </View>
    </View>
  );
}

export function Roll3DActionEntryAdjustmentCard({
  adjustment,
  compact = true,
  onChangeQty,
  onChangeModifier,
  onToggleSign,
  onChangeBehaviorParam,
  onClose,
}: Roll3DActionEntryAdjustmentCardProps) {
  const premium = usePremiumTheme();

  const modifierLabel =
    adjustment.modifier >= 0
      ? `+${adjustment.modifier}`
      : `${adjustment.modifier}`;

  const signLabel = adjustment.sign === -1 ? "−" : "+";

  return (
    <View
      style={{
        borderRadius: premium.radius.xl,
        borderWidth: 1,
        borderColor: "rgba(232, 200, 120, 0.18)",
        backgroundColor: "rgba(5, 6, 11, 0.72)",
        padding: compact ? 9 : 11,
        gap: 9,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.muted,
              fontSize: 9,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.9,
            }}
          >
            Ajuster l’entrée
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.accent.primary,
              fontSize: 14,
              fontWeight: "900",
              marginTop: 2,
            }}
          >
            {adjustment.entryLabel}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.secondary,
              fontSize: 10,
              fontWeight: "800",
              marginTop: 2,
            }}
          >
            {adjustment.actionName}
          </Text>
        </View>

        <SmallButton label="×" variant="danger" onPress={onClose} />
      </View>

      <ScrollView
        style={{
          maxHeight: compact ? 310 : 420,
        }}
        contentContainerStyle={{
          gap: 9,
          paddingBottom: 2,
        }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View
          style={{
            gap: 2,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.secondary,
              fontSize: 10,
              fontWeight: "800",
            }}
          >
            Base : {adjustment.technicalLabel}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.secondary,
              fontSize: 10,
              fontWeight: "800",
            }}
          >
            Comportement : {adjustment.detail}
          </Text>

          <Text
            style={{
              color: premium.colors.text.muted,
              fontSize: 9,
              fontWeight: "700",
              lineHeight: 13,
            }}
          >
            Ces réglages seront appliqués au moment du lancer.
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "stretch",
            gap: 8,
          }}
        >
          <StepperRow
            label="Quantité"
            value={`${adjustment.qty}`}
            minusDisabled={adjustment.qty <= 1}
            onMinus={() => onChangeQty(-1)}
            onPlus={() => onChangeQty(1)}
          />

          <StepperRow
            label="Modif. entrée"
            value={modifierLabel}
            onMinus={() => onChangeModifier(-1)}
            onPlus={() => onChangeModifier(1)}
          />

          <View
            style={{
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: 96,
              minWidth: 96,
              borderRadius: premium.radius.lg,
              borderWidth: 1,
              borderColor:
                adjustment.sign === -1
                  ? "rgba(239, 111, 145, 0.32)"
                  : "rgba(136, 211, 154, 0.28)",
              backgroundColor:
                adjustment.sign === -1
                  ? premium.colors.state.failureSoft
                  : premium.colors.state.successSoft,
              padding: 8,
              gap: 6,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: premium.colors.text.muted,
                fontSize: 9,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}
            >
              Signe
            </Text>

            <SmallButton
              label={signLabel}
              variant={adjustment.sign === -1 ? "danger" : "accent"}
              onPress={onToggleSign}
            />
          </View>
        </View>

        <BehaviorParamsSection
          adjustment={adjustment}
          onChangeBehaviorParam={onChangeBehaviorParam}
        />

        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 9,
            fontWeight: "800",
            lineHeight: 13,
          }}
        >
          Appuie sur LANCER pour jeter cette entrée ajustée.
        </Text>
      </ScrollView>

    </View>
  );
}
