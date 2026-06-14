// dice-universal\features\roll3d\components\Roll3DActionEntryAdjustmentCard.tsx

import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  getRuleBehaviorDefinition,
  type RuleBehaviorField,
  type RuleBehaviorKey,
} from "../../../core/rules/behaviorRegistry";
import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DActionEntryAdjustment } from "../types";

export type Roll3DAdjustmentSection = "dice" | "behavior" | "all";

type Roll3DActionEntryAdjustmentCardProps = {
  adjustment: Roll3DActionEntryAdjustment;
  compact?: boolean;
  hideHeader?: boolean;
  section?: Roll3DAdjustmentSection;
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

type RangesBehaviorField = RuleBehaviorField & {
  type: "ranges";
  paramsKey: "ranges" | "bands";
  defaultValue: { min: string; max: string; label: string }[];
};

type EditableBehaviorField =
  | NumberBehaviorField
  | SelectBehaviorField
  | TextBehaviorField
  | RangesBehaviorField;

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

function isRangesBehaviorField(
  field: RuleBehaviorField,
): field is RangesBehaviorField {
  return field.type === "ranges";
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
    isFacesTextField(field) ||
    isRangesBehaviorField(field)
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
        borderRadius: 999,
        borderWidth: 1,
        borderColor: disabled
          ? "rgba(255,255,255,0.06)"
          : "rgba(232, 200, 120, 0.18)",
        backgroundColor: disabled
          ? "rgba(255,255,255,0.025)"
          : pressed
            ? "rgba(232, 200, 120, 0.12)"
            : "rgba(255,255,255,0.045)",
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
          fontSize: 20,
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
        flexBasis: 146,
        minWidth: 146,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.065)",
        backgroundColor: "rgba(255,255,255,0.032)",
        padding: 8,
        gap: 6,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: "rgba(255,255,255,0.46)",
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
            minWidth: 54,
            height: 34,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.22)",
            backgroundColor: "rgba(232, 200, 120, 0.105)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10,
          }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={{
              color: premium.colors.accent.primary,
              fontSize: 16,
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

type Roll3DRangeParamValue = {
  min: number;
  max: number;
  label: string;
};

function parseRangeNumber(value: unknown, fallback: number) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function parseRangesValue(
  rawValue: unknown,
  fallback: { min: string; max: string; label: string }[],
): Roll3DRangeParamValue[] {
  const sourceRanges = Array.isArray(rawValue) ? rawValue : fallback;

  return sourceRanges
    .map((range, index) => {
      if (!range || typeof range !== "object") {
        return null;
      }

      const candidate = range as {
        min?: unknown;
        max?: unknown;
        label?: unknown;
      };

      const fallbackRange = fallback[index] ?? {
        min: "1",
        max: "1",
        label: "Palier",
      };

      const min = parseRangeNumber(candidate.min, Number(fallbackRange.min));
      const max = parseRangeNumber(candidate.max, Number(fallbackRange.max));

      return {
        min,
        max,
        label:
          typeof candidate.label === "string" &&
          candidate.label.trim().length > 0
            ? candidate.label
            : fallbackRange.label,
      };
    })
    .filter((range): range is Roll3DRangeParamValue => !!range);
}

function getRangesParamValue(params: {
  field: RangesBehaviorField;
  baseParams: Record<string, unknown>;
  overrideParams: Record<string, unknown>;
}) {
  const { field, baseParams, overrideParams } = params;
  const paramsKey = getFieldParamsKey(field);

  const rawValue =
    overrideParams[paramsKey] ?? baseParams[paramsKey] ?? field.defaultValue;

  return parseRangesValue(rawValue, field.defaultValue);
}

function getRangesNumberBounds(params: {
  behaviorKind: string;
  adjustment: Roll3DActionEntryAdjustment;
}) {
  const { behaviorKind, adjustment } = params;

  if (behaviorKind === "table_lookup") {
    return {
      min: 1,
      max: adjustment.sides,
    };
  }

  if (behaviorKind === "banded_sum") {
    const diceCount = Math.max(1, Math.floor(adjustment.qty));
    const maxNaturalSum = diceCount * adjustment.sides;

    return {
      min: -999,
      max: Math.max(999, maxNaturalSum + Math.abs(adjustment.modifier)),
    };
  }

  return {
    min: -999,
    max: 999,
  };
}

function createNumberRange(min: number, max: number) {
  const start = Math.min(min, max);
  const end = Math.max(min, max);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function isCriticalSuccessParamsKey(paramsKey: string) {
  return (
    paramsKey.includes("crit_success") || paramsKey.includes("critical_success")
  );
}

function isCriticalFailureParamsKey(paramsKey: string) {
  return (
    paramsKey.includes("crit_failure") || paramsKey.includes("critical_failure")
  );
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

  if (paramsKey === "success_at_or_above" || paramsKey === "successAtOrAbove") {
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

  const rangeValue = isFailureCritical
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
              {isFailureCritical
                ? `${min} à ${currentFace}`
                : `${currentFace} à ${max}`}
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

function BehaviorRangesParamSection({
  field,
  behaviorKind,
  adjustment,
  value,
  onChange,
}: {
  field: RangesBehaviorField;
  behaviorKind: string;
  adjustment: Roll3DActionEntryAdjustment;
  value: Roll3DRangeParamValue[];
  onChange: (value: Roll3DRangeParamValue[]) => void;
}) {
  const premium = usePremiumTheme();

  const bounds = getRangesNumberBounds({
    behaviorKind,
    adjustment,
  });

  const updateRange = (
    rangeIndex: number,
    patch: Partial<Roll3DRangeParamValue>,
  ) => {
    const nextValue = value.map((range, index) => {
      if (index !== rangeIndex) {
        return range;
      }

      const nextMin =
        patch.min != null
          ? clampNumber(patch.min, bounds.min, bounds.max)
          : range.min;

      const nextMax =
        patch.max != null
          ? clampNumber(patch.max, bounds.min, bounds.max)
          : range.max;

      return {
        ...range,
        ...patch,
        min: Math.min(nextMin, nextMax),
        max: Math.max(nextMin, nextMax),
        label: patch.label != null ? patch.label : range.label,
      };
    });

    onChange(nextValue);
  };

  return (
    <View
      style={{
        width: "100%",
        gap: 8,
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
          {field.label}
        </Text>

        <Text
          style={{
            color: premium.colors.text.secondary,
            fontSize: 10,
            fontWeight: "800",
            lineHeight: 14,
          }}
        >
          Ajustement rapide des paliers existants
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        {value.map((range, index) => (
          <View
            key={`range-${field.paramsKey}-${index}`}
            style={{
              borderRadius: premium.radius.lg,
              borderWidth: 1,
              borderColor: premium.colors.border.subtle,
              backgroundColor: "rgba(255,255,255,0.045)",
              padding: 9,
              gap: 8,
            }}
          >
            <Text
              style={{
                color: premium.colors.accent.primary,
                fontSize: 10,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}
            >
              Palier {index + 1}
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <StepperRow
                label="Min"
                value={`${range.min}`}
                minusDisabled={range.min <= bounds.min}
                onMinus={() =>
                  updateRange(index, {
                    min: range.min - 1,
                  })
                }
                onPlus={() =>
                  updateRange(index, {
                    min: range.min + 1,
                  })
                }
              />

              <StepperRow
                label="Max"
                value={`${range.max}`}
                minusDisabled={range.max <= bounds.min}
                onMinus={() =>
                  updateRange(index, {
                    max: range.max - 1,
                  })
                }
                onPlus={() =>
                  updateRange(index, {
                    max: range.max + 1,
                  })
                }
              />
            </View>

            <View style={{ gap: 5 }}>
              <Text
                style={{
                  color: premium.colors.text.muted,
                  fontSize: 9,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.7,
                }}
              >
                Résultat / label
              </Text>

              <TextInput
                value={range.label}
                onChangeText={(nextLabel) =>
                  updateRange(index, {
                    label: nextLabel,
                  })
                }
                placeholder="Ex: Bas, Moyen, Haut..."
                placeholderTextColor="rgba(255,255,255,0.28)"
                style={{
                  minHeight: 38,
                  borderRadius: premium.radius.md,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.10)",
                  backgroundColor: "rgba(0,0,0,0.22)",
                  color: premium.colors.text.primary,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  fontSize: 12,
                  fontWeight: "800",
                }}
              />
            </View>
          </View>
        ))}
      </View>

      <Text
        style={{
          color: premium.colors.text.muted,
          fontSize: 9,
          fontWeight: "700",
          lineHeight: 13,
        }}
      >
        Pour ajouter ou supprimer des paliers, utilise l’atelier Comportements.
      </Text>
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
  const definition = registryKey
    ? getRuleBehaviorDefinition(registryKey)
    : null;

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
          Réglages de règle
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
        gap: 7,
        paddingTop: 1,
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
          gap: 7,
        }}
      >
        {editableFields.map((field) => {
          const paramsKey = getFieldParamsKey(field);

          if (isRangesBehaviorField(field)) {
            const value = getRangesParamValue({
              field,
              baseParams,
              overrideParams,
            });

            return (
              <BehaviorRangesParamSection
                key={paramsKey}
                field={field}
                behaviorKind={behavior.kind}
                adjustment={adjustment}
                value={value}
                onChange={(nextValue) =>
                  onChangeBehaviorParam({
                    paramsKey,
                    value: nextValue,
                  })
                }
              />
            );
          }

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
  hideHeader = false,
  section = "all",
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

  const showDiceSection = section === "dice" || section === "all";
  const showBehaviorSection = section === "behavior" || section === "all";

  const helperText =
    section === "dice"
      ? "Ajuste les dés, le bonus ou le malus avant de revenir à la table."
      : section === "behavior"
        ? "Ajuste la règle de résolution sans modifier l’action sauvegardée."
        : "Mode expert : tous les réglages rapides disponibles pour ce jet.";

  return (
    <View
      style={{
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.075)",
        backgroundColor: "rgba(255,255,255,0.025)",
        padding: compact ? 8 : 10,
        gap: 7,
      }}
    >
      {!hideHeader ? (
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
                fontSize: 13,
                fontWeight: "900",
                marginTop: 1,
              }}
            >
              {adjustment.entryLabel}
            </Text>

            <Text
              numberOfLines={1}
              style={{
                color: premium.colors.text.secondary,
                fontSize: 9,
                fontWeight: "800",
                marginTop: 1,
              }}
            >
              {adjustment.actionName}
            </Text>
          </View>

          <SmallButton label="×" variant="danger" onPress={onClose} />
        </View>
      ) : null}

      <ScrollView
        style={{
          maxHeight: compact ? 264 : 380,
        }}
        contentContainerStyle={{
          gap: 7,
          paddingBottom: 2,
        }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View
          style={{
            borderRadius: 18,
            borderWidth: 0,
            backgroundColor: "rgba(255,255,255,0.035)",
            paddingHorizontal: 10,
            paddingVertical: 8,
            gap: 2,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.secondary,
              fontSize: 9,
              fontWeight: "800",
            }}
          >
            Jet de base · {adjustment.technicalLabel}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.secondary,
              fontSize: 9,
              fontWeight: "800",
            }}
          >
            Règle active · {adjustment.detail}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.muted,
              fontSize: 8,
              fontWeight: "700",
              marginTop: 1,
            }}
          >
            Ces réglages s’appliquent au prochain lancer.
          </Text>
        </View>

        {showDiceSection ? (
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
              label="Bonus / malus"
              value={modifierLabel}
              onMinus={() => onChangeModifier(-1)}
              onPlus={() => onChangeModifier(1)}
            />

            <View
              style={{
                flexGrow: 0,
                flexShrink: 0,
                flexBasis: 82,
                minWidth: 82,
                borderRadius: 22,
                borderWidth: 1,
                borderColor:
                  adjustment.sign === -1
                    ? "rgba(239, 111, 145, 0.24)"
                    : "rgba(136, 211, 154, 0.22)",
                backgroundColor:
                  adjustment.sign === -1
                    ? "rgba(239, 111, 145, 0.08)"
                    : "rgba(136, 211, 154, 0.07)",
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
        ) : null}

        {showBehaviorSection ? (
          <BehaviorParamsSection
            adjustment={adjustment}
            onChangeBehaviorParam={onChangeBehaviorParam}
          />
        ) : null}

        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 9,
            fontWeight: "800",
            lineHeight: 13,
          }}
        >
          {helperText}
        </Text>
      </ScrollView>
    </View>
  );
}
