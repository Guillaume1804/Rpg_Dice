// dice-universal\features\roll\hooks\useQuickBehaviorConfigModal.ts

import { useState } from "react";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import {
  DEFAULT_QUICK_RANGES,
  buildQuickBehaviorDefaultValues,
} from "../helpers/quickBehaviorConfig";
import { getRuleBehaviorDefinition } from "../../../core/rules/behaviorRegistry";

type Scope = "entry" | "group";
type RangeRow = { min: string; max: string; label: string };

function applyFieldDefault(
  key: string,
  value: string,
  setters: {
    setConfigKeepCount: (value: string) => void;
    setConfigDropCount: (value: string) => void;
    setConfigResultMode: (value: string) => void;
    setConfigCompare: (value: "gte" | "lte") => void;
    setConfigSuccessThreshold: (value: string) => void;
    setConfigCritSuccessFaces: (value: string) => void;
    setConfigCritFailureFaces: (value: string) => void;
    setConfigSuccessAtOrAbove: (value: string) => void;
    setConfigFailFaces: (value: string) => void;
    setConfigGlitchRule: (value: string) => void;
    setConfigTargetValue: (value: string) => void;
    setConfigDegreeStep: (value: string) => void;
    setConfigCritSuccessMin: (value: string) => void;
    setConfigCritSuccessMax: (value: string) => void;
    setConfigCritFailureMin: (value: string) => void;
    setConfigCritFailureMax: (value: string) => void;
  },
) {
  switch (key) {
    case "keepCount":
      setters.setConfigKeepCount(value);
      break;

    case "dropCount":
      setters.setConfigDropCount(value);
      break;

    case "resultMode":
      setters.setConfigResultMode(value === "values" ? "values" : "sum");
      break;

    case "compare":
      setters.setConfigCompare(value === "lte" ? "lte" : "gte");
      break;

    case "successThreshold":
      setters.setConfigSuccessThreshold(value);
      break;

    case "critSuccessFaces":
      setters.setConfigCritSuccessFaces(value);
      break;

    case "critFailureFaces":
      setters.setConfigCritFailureFaces(value);
      break;

    case "successAtOrAbove":
      setters.setConfigSuccessAtOrAbove(value);
      break;

    case "failFaces":
      setters.setConfigFailFaces(value);
      break;

    case "glitchRule":
      setters.setConfigGlitchRule(value);
      break;

    case "targetValue":
      setters.setConfigTargetValue(value);
      break;

    case "degreeStep":
      setters.setConfigDegreeStep(value);
      break;

    case "critSuccessMin":
      setters.setConfigCritSuccessMin(value);
      break;

    case "critSuccessMax":
      setters.setConfigCritSuccessMax(value);
      break;

    case "critFailureMin":
      setters.setConfigCritFailureMin(value);
      break;

    case "critFailureMax":
      setters.setConfigCritFailureMax(value);
      break;
  }
}

function getFieldValue(params: {
  key: string;
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
  configTargetValue: string;
  configDegreeStep: string;
  configCritSuccessMin: string;
  configCritSuccessMax: string;
  configCritFailureMin: string;
  configCritFailureMax: string;
}) {
  switch (params.key) {
    case "keepCount":
      return params.configKeepCount;

    case "dropCount":
      return params.configDropCount;

    case "resultMode":
      return params.configResultMode;

    case "compare":
      return params.configCompare;

    case "successThreshold":
      return params.configSuccessThreshold;

    case "critSuccessFaces":
      return params.configCritSuccessFaces;

    case "critFailureFaces":
      return params.configCritFailureFaces;

    case "successAtOrAbove":
      return params.configSuccessAtOrAbove;

    case "failFaces":
      return params.configFailFaces;

    case "glitchRule":
      return params.configGlitchRule;

    case "targetValue":
      return params.configTargetValue;

    case "degreeStep":
      return params.configDegreeStep;

    case "critSuccessMin":
      return params.configCritSuccessMin;

    case "critSuccessMax":
      return params.configCritSuccessMax;

    case "critFailureMin":
      return params.configCritFailureMin;

    case "critFailureMax":
      return params.configCritFailureMax;

    default:
      return "";
  }
}

function hasAtLeastOneValidRange(ranges: RangeRow[]) {
  return ranges.some(
    (row) =>
      Number.isFinite(Number(row.min)) &&
      Number.isFinite(Number(row.max)) &&
      row.label.trim().length > 0,
  );
}

export function useQuickBehaviorConfigModal() {
  const [visible, setVisible] = useState(false);

  const [pendingBehaviorKey, setPendingBehaviorKey] =
    useState<RuleBehaviorKey | null>(null);
  const [pendingBehaviorLabel, setPendingBehaviorLabel] = useState("");
  const [pendingBehaviorScope, setPendingBehaviorScope] =
    useState<Scope>("entry");

  const [configKeepCount, setConfigKeepCount] = useState("2");
  const [configDropCount, setConfigDropCount] = useState("1");
  const [configResultMode, setConfigResultMode] = useState("sum");

  const [configCompare, setConfigCompare] = useState<"gte" | "lte">("gte");
  const [configSuccessThreshold, setConfigSuccessThreshold] = useState("");
  const [configCritSuccessFaces, setConfigCritSuccessFaces] = useState("");
  const [configCritFailureFaces, setConfigCritFailureFaces] = useState("");

  const [configTargetValue, setConfigTargetValue] = useState("65");
  const [configDegreeStep, setConfigDegreeStep] = useState("10");
  const [configCritSuccessMin, setConfigCritSuccessMin] = useState("1");
  const [configCritSuccessMax, setConfigCritSuccessMax] = useState("5");
  const [configCritFailureMin, setConfigCritFailureMin] = useState("95");
  const [configCritFailureMax, setConfigCritFailureMax] = useState("100");

  const [configSuccessAtOrAbove, setConfigSuccessAtOrAbove] = useState("5");
  const [configFailFaces, setConfigFailFaces] = useState("1");
  const [configGlitchRule, setConfigGlitchRule] = useState("ones_gt_successes");

  const [configRanges, setConfigRanges] =
    useState<RangeRow[]>(DEFAULT_QUICK_RANGES);
  const [pipelineRerollFaces, setPipelineRerollFaces] = useState("");
  const [pipelineRerollOnce, setPipelineRerollOnce] = useState(true);
  const [pipelineExplodeFaces, setPipelineExplodeFaces] = useState("");

  const [pipelineMaxRerolls, setPipelineMaxRerolls] = useState("");
  const [pipelineMaxExplosions, setPipelineMaxExplosions] = useState("");

  const [pipelineKeepHighest, setPipelineKeepHighest] = useState("");
  const [pipelineKeepLowest, setPipelineKeepLowest] = useState("");
  const [pipelineDropHighest, setPipelineDropHighest] = useState("");
  const [pipelineDropLowest, setPipelineDropLowest] = useState("");

  const [pipelineCountSuccessAtOrAbove, setPipelineCountSuccessAtOrAbove] =
    useState("");
  const [pipelineCountEqualFaces, setPipelineCountEqualFaces] = useState("");
  const [pipelineCountRangeMin, setPipelineCountRangeMin] = useState("");
  const [pipelineCountRangeMax, setPipelineCountRangeMax] = useState("");

  const [pipelineOutput, setPipelineOutput] = useState<
    | "sum"
    | "successes"
    | "count_equal"
    | "count_range"
    | "first_value"
    | "values"
  >("sum");

  const [pipelineSuccessThreshold, setPipelineSuccessThreshold] = useState("");
  const [pipelineCompare, setPipelineCompare] = useState<"gte" | "lte">("gte");
  const [pipelineCritSuccessFaces, setPipelineCritSuccessFaces] = useState("");
  const [pipelineCritFailureFaces, setPipelineCritFailureFaces] = useState("");

  const [pipelineComplicationFaces, setPipelineComplicationFaces] =
    useState("");
  const [pipelineComplicationRule, setPipelineComplicationRule] = useState<
    "none" | "any" | "gt_successes" | "gte_successes" | "zero_successes"
  >("none");

  function resetPipelineConfig() {
    setPipelineRerollFaces("");
    setPipelineRerollOnce(true);
    setPipelineExplodeFaces("");
    setPipelineMaxRerolls("");
    setPipelineMaxExplosions("");

    setPipelineKeepHighest("");
    setPipelineKeepLowest("");
    setPipelineDropHighest("");
    setPipelineDropLowest("");

    setPipelineCountSuccessAtOrAbove("");
    setPipelineCountEqualFaces("");
    setPipelineCountRangeMin("");
    setPipelineCountRangeMax("");

    setPipelineOutput("sum");
    setPipelineSuccessThreshold("");
    setPipelineCompare("gte");
    setPipelineCritSuccessFaces("");
    setPipelineCritFailureFaces("");
    setPipelineComplicationFaces("");
    setPipelineComplicationRule("none");
  }

  function open(params: {
    behaviorKey: RuleBehaviorKey;
    label: string;
    scope: Scope;
  }) {
    setPendingBehaviorKey(params.behaviorKey);
    setPendingBehaviorLabel(params.label);
    setPendingBehaviorScope(params.scope);

    const behavior = getRuleBehaviorDefinition(params.behaviorKey);

    setConfigKeepCount("2");
    setConfigDropCount("1");
    setConfigResultMode("sum");
    setConfigCompare("gte");
    setConfigSuccessThreshold("");
    setConfigCritSuccessFaces("");
    setConfigCritFailureFaces("");
    setConfigSuccessAtOrAbove("5");
    setConfigFailFaces("1");
    setConfigGlitchRule("ones_gt_successes");
    setConfigRanges(DEFAULT_QUICK_RANGES);
    resetPipelineConfig();
    setConfigTargetValue("65");
    setConfigDegreeStep("10");
    setConfigCritSuccessMin("1");
    setConfigCritSuccessMax("5");
    setConfigCritFailureMin("95");
    setConfigCritFailureMax("100");

    if (behavior) {
      for (const field of behavior.fields) {
        if (field.type === "ranges") {
          setConfigRanges(field.defaultValue);
          continue;
        }

        applyFieldDefault(field.key, field.defaultValue, {
          setConfigKeepCount,
          setConfigDropCount,
          setConfigResultMode,
          setConfigCompare,
          setConfigSuccessThreshold,
          setConfigCritSuccessFaces,
          setConfigCritFailureFaces,
          setConfigSuccessAtOrAbove,
          setConfigFailFaces,
          setConfigGlitchRule,
          setConfigTargetValue,
          setConfigDegreeStep,
          setConfigCritSuccessMin,
          setConfigCritSuccessMax,
          setConfigCritFailureMin,
          setConfigCritFailureMax,
        });
      }
    }

    setVisible(true);
  }

  function close() {
    setVisible(false);
    setPendingBehaviorKey(null);
    setPendingBehaviorLabel("");
    setPendingBehaviorScope("entry");

    setConfigKeepCount("2");
    setConfigDropCount("1");
    setConfigResultMode("sum");

    setConfigCompare("gte");
    setConfigSuccessThreshold("");
    setConfigCritSuccessFaces("");
    setConfigCritFailureFaces("");

    setConfigSuccessAtOrAbove("5");
    setConfigFailFaces("1");
    setConfigGlitchRule("ones_gt_successes");
    setConfigRanges(DEFAULT_QUICK_RANGES);
    resetPipelineConfig();
    setConfigTargetValue("65");
    setConfigDegreeStep("10");
    setConfigCritSuccessMin("1");
    setConfigCritSuccessMax("5");
    setConfigCritFailureMin("95");
    setConfigCritFailureMax("100");
  }

  function updateRange(
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) {
    setConfigRanges((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  }

  function isValid() {
    if (!pendingBehaviorKey) return false;

    const behavior = getRuleBehaviorDefinition(pendingBehaviorKey);
    if (!behavior) return false;
    if (pendingBehaviorKey === "custom_pipeline") {
      const numericFields = [
        pipelineMaxRerolls,
        pipelineMaxExplosions,
        pipelineKeepHighest,
        pipelineKeepLowest,
        pipelineDropHighest,
        pipelineDropLowest,
        pipelineCountSuccessAtOrAbove,
        pipelineCountRangeMin,
        pipelineCountRangeMax,
        pipelineSuccessThreshold,
      ];

      for (const value of numericFields) {
        if (value.trim() !== "" && !Number.isFinite(Number(value))) {
          return false;
        }
      }

      const positiveIntegerFields = [pipelineMaxRerolls, pipelineMaxExplosions];

      for (const value of positiveIntegerFields) {
        if (value.trim() !== "" && Number(value) <= 0) {
          return false;
        }
      }

      return true;
    }

    for (const field of behavior.fields) {
      if (field.type === "ranges") {
        if (!hasAtLeastOneValidRange(configRanges)) return false;
        continue;
      }

      if (field.type === "number") {
        const value = getFieldValue({
          key: field.key,
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
          configTargetValue,
          configDegreeStep,
          configCritSuccessMin,
          configCritSuccessMax,
          configCritFailureMin,
          configCritFailureMax,
        });

        if (value.trim() === "") {
          if (field.defaultValue.trim() !== "") return false;
          continue;
        }

        if (!Number.isFinite(Number(value))) return false;

        if (
          (field.key === "keepCount" ||
            field.key === "dropCount" ||
            field.key === "degreeStep") &&
          Number(value) <= 0
        ) {
          return false;
        }
      }
    }

    return true;
  }

  function buildDefaultValues() {
    if (!pendingBehaviorKey) return undefined;

    if (pendingBehaviorKey === "custom_pipeline") {
      return {
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
      };
    }

    return buildQuickBehaviorDefaultValues({
      behaviorKey: pendingBehaviorKey,
      keepCount: configKeepCount,
      dropCount: configDropCount,
      resultMode: configResultMode,
      compare: configCompare,
      successThreshold: configSuccessThreshold,
      critSuccessFaces: configCritSuccessFaces,
      critFailureFaces: configCritFailureFaces,
      successAtOrAbove: configSuccessAtOrAbove,
      failFaces: configFailFaces,
      glitchRule: configGlitchRule,
      ranges: configRanges,
      targetValue: configTargetValue,
      degreeStep: configDegreeStep,
      critSuccessMin: configCritSuccessMin,
      critSuccessMax: configCritSuccessMax,
      critFailureMin: configCritFailureMin,
      critFailureMax: configCritFailureMax,
    });
  }

  return {
    visible,
    pendingBehaviorKey,
    pendingBehaviorLabel,
    pendingBehaviorScope,

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

    setConfigKeepCount,
    setConfigDropCount,
    setConfigResultMode,
    setConfigCompare,
    setConfigSuccessThreshold,
    setConfigCritSuccessFaces,
    setConfigCritFailureFaces,
    setConfigSuccessAtOrAbove,
    setConfigFailFaces,
    setConfigGlitchRule,

    open,
    close,
    updateRange,
    isValid,
    buildDefaultValues,

    configTargetValue,
    configDegreeStep,
    configCritSuccessMin,
    configCritSuccessMax,
    configCritFailureMin,
    configCritFailureMax,

    setConfigTargetValue,
    setConfigDegreeStep,
    setConfigCritSuccessMin,
    setConfigCritSuccessMax,
    setConfigCritFailureMin,
    setConfigCritFailureMax,

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

    setPipelineRerollFaces,
    setPipelineRerollOnce,
    setPipelineExplodeFaces,
    setPipelineMaxRerolls,
    setPipelineMaxExplosions,
    setPipelineKeepHighest,
    setPipelineKeepLowest,
    setPipelineDropHighest,
    setPipelineDropLowest,
    setPipelineCountSuccessAtOrAbove,
    setPipelineCountEqualFaces,
    setPipelineCountRangeMin,
    setPipelineCountRangeMax,
    setPipelineOutput,
    setPipelineSuccessThreshold,
    setPipelineCompare,
    setPipelineCritSuccessFaces,
    setPipelineCritFailureFaces,
    setPipelineComplicationFaces,
    setPipelineComplicationRule,
  };
}
