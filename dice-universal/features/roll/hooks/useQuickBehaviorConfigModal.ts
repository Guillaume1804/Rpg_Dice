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

  const [configSuccessAtOrAbove, setConfigSuccessAtOrAbove] = useState("5");
  const [configFailFaces, setConfigFailFaces] = useState("1");
  const [configGlitchRule, setConfigGlitchRule] = useState("ones_gt_successes");

  const [configRanges, setConfigRanges] =
    useState<RangeRow[]>(DEFAULT_QUICK_RANGES);

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
        });

        if (value.trim() === "") {
          if (field.defaultValue.trim() !== "") return false;
          continue;
        }

        if (!Number.isFinite(Number(value))) return false;

        if (
          (field.key === "keepCount" || field.key === "dropCount") &&
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
  };
}
