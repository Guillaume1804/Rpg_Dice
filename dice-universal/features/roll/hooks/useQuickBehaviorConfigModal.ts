import { useState } from "react";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorCatalog";
import { getBehaviorDefaults } from "../../../core/rules/getBehaviorsForContext";
import {
  DEFAULT_QUICK_RANGES,
  getDefaultRangesForBehavior,
  buildQuickBehaviorDefaultValues,
} from "../helpers/quickBehaviorConfig";

type Scope = "entry" | "group";

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
  const [configGlitchRule, setConfigGlitchRule] =
    useState("ones_gt_successes");

  const [configRanges, setConfigRanges] =
    useState<{ min: string; max: string; label: string }[]>(
      DEFAULT_QUICK_RANGES,
    );

  function open(params: {
    behaviorKey: RuleBehaviorKey;
    label: string;
    scope: Scope;
  }) {
    setPendingBehaviorKey(params.behaviorKey);
    setPendingBehaviorLabel(params.label);
    setPendingBehaviorScope(params.scope);

    const defaults = getBehaviorDefaults(params.behaviorKey, "quick_roll");

    if (
      params.behaviorKey === "table_lookup" ||
      params.behaviorKey === "banded_sum"
    ) {
      setConfigRanges(getDefaultRangesForBehavior(params.behaviorKey));
    }

    if (
      params.behaviorKey === "keep_highest_n" ||
      params.behaviorKey === "keep_lowest_n"
    ) {
      setConfigKeepCount(
        typeof defaults?.keepCount === "string" ? defaults.keepCount : "2",
      );
    }

    if (
      params.behaviorKey === "drop_highest_n" ||
      params.behaviorKey === "drop_lowest_n"
    ) {
      setConfigDropCount(
        typeof defaults?.dropCount === "string" ? defaults.dropCount : "1",
      );
    }

    if (params.behaviorKey === "single_check") {
      setConfigCompare(defaults?.compare === "lte" ? "lte" : "gte");
      setConfigSuccessThreshold(
        typeof defaults?.successThreshold === "string"
          ? defaults.successThreshold
          : "",
      );
      setConfigCritSuccessFaces(
        typeof defaults?.critSuccessFaces === "string"
          ? defaults.critSuccessFaces
          : "",
      );
      setConfigCritFailureFaces(
        typeof defaults?.critFailureFaces === "string"
          ? defaults.critFailureFaces
          : "",
      );
    }

    if (params.behaviorKey === "success_pool") {
      setConfigSuccessAtOrAbove(
        typeof defaults?.successAtOrAbove === "string"
          ? defaults.successAtOrAbove
          : "5",
      );
      setConfigFailFaces(
        typeof defaults?.failFaces === "string" ? defaults.failFaces : "1",
      );
      setConfigGlitchRule(
        typeof defaults?.glitchRule === "string"
          ? defaults.glitchRule
          : "ones_gt_successes",
      );
    }

    setConfigResultMode(
      typeof defaults?.resultMode === "string" ? defaults.resultMode : "sum",
    );

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

    if (
      (pendingBehaviorKey === "keep_highest_n" ||
        pendingBehaviorKey === "keep_lowest_n") &&
      (!Number.isFinite(Number(configKeepCount)) ||
        Number(configKeepCount) <= 0)
    ) {
      return false;
    }

    if (
      (pendingBehaviorKey === "drop_highest_n" ||
        pendingBehaviorKey === "drop_lowest_n") &&
      (!Number.isFinite(Number(configDropCount)) ||
        Number(configDropCount) <= 0)
    ) {
      return false;
    }

    if (
      pendingBehaviorKey === "single_check" &&
      configSuccessThreshold.trim() !== "" &&
      !Number.isFinite(Number(configSuccessThreshold))
    ) {
      return false;
    }

    if (
      pendingBehaviorKey === "success_pool" &&
      !Number.isFinite(Number(configSuccessAtOrAbove))
    ) {
      return false;
    }

    if (
      pendingBehaviorKey === "table_lookup" ||
      pendingBehaviorKey === "banded_sum"
    ) {
      return configRanges.some(
        (row) =>
          Number.isFinite(Number(row.min)) &&
          Number.isFinite(Number(row.max)) &&
          row.label.trim().length > 0,
      );
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