import type { RuleFamilyKey } from "../config/ruleFamilies";

export type RuleRangeFormRow = {
  min: string;
  max: string;
  label: string;
};

export type RuleFormState = {
  name: string;
  family: RuleFamilyKey;
  compare: "gte" | "lte";
  successThreshold: string;
  critSuccessFaces: string;
  critFailureFaces: string;
  successAtOrAbove: string;
  failFaces: string;
  glitchRule: "ones_gt_successes" | "ones_gte_successes" | "none";
  ranges: RuleRangeFormRow[];
};

export function createDefaultRuleFormState(): RuleFormState {
  return {
    name: "",
    family: "single_check",
    compare: "gte",
    successThreshold: "",
    critSuccessFaces: "",
    critFailureFaces: "",
    successAtOrAbove: "5",
    failFaces: "1",
    glitchRule: "ones_gt_successes",
    ranges: [
      { min: "1", max: "3", label: "Bas" },
      { min: "4", max: "6", label: "Moyen" },
      { min: "7", max: "10", label: "Haut" },
    ],
  };
}

function parseNumberList(value: string): number[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((n) => Number.isFinite(n));
}

export function buildRulePayloadFromForm(state: RuleFormState): {
  name: string;
  kind: string;
  params_json: string;
} {
  const name = state.name.trim();

  if (!name) {
    throw new Error("Le nom de la règle est obligatoire.");
  }

  if (state.family === "single_check") {
    const threshold =
      state.successThreshold.trim() === ""
        ? null
        : Number(state.successThreshold);

    if (threshold !== null && !Number.isFinite(threshold)) {
      throw new Error("Le seuil doit être un nombre valide.");
    }

    return {
      name,
      kind: "single_check",
      params_json: JSON.stringify({
        compare: state.compare,
        success_threshold: threshold,
        crit_success_faces: parseNumberList(state.critSuccessFaces),
        crit_failure_faces: parseNumberList(state.critFailureFaces),
      }),
    };
  }

  if (state.family === "success_pool") {
    const successAtOrAbove = Number(state.successAtOrAbove);

    if (!Number.isFinite(successAtOrAbove)) {
      throw new Error("Le seuil de réussite du pool doit être un nombre valide.");
    }

    return {
      name,
      kind: "success_pool",
      params_json: JSON.stringify({
        success_at_or_above: successAtOrAbove,
        fail_faces: parseNumberList(state.failFaces),
        glitch_rule: state.glitchRule,
      }),
    };
  }

  if (state.family === "banded_sum") {
    const bands = state.ranges
      .map((row) => ({
        min: Number(row.min),
        max: Number(row.max),
        label: row.label.trim(),
      }))
      .filter(
        (row) =>
          Number.isFinite(row.min) &&
          Number.isFinite(row.max) &&
          row.label.length > 0,
      );

    if (bands.length === 0) {
      throw new Error("Ajoute au moins un palier valide.");
    }

    return {
      name,
      kind: "banded_sum",
      params_json: JSON.stringify({
        bands,
        defaultLabel: "—",
      }),
    };
  }

  if (state.family === "highest_of_pool") {
    const threshold =
      state.successThreshold.trim() === ""
        ? null
        : Number(state.successThreshold);

    if (threshold !== null && !Number.isFinite(threshold)) {
      throw new Error("Le seuil doit être un nombre valide.");
    }

    return {
      name,
      kind: "highest_of_pool",
      params_json: JSON.stringify({
        compare: state.compare,
        success_threshold: threshold,
        crit_success_faces: parseNumberList(state.critSuccessFaces),
        crit_failure_faces: parseNumberList(state.critFailureFaces),
      }),
    };
  }

  const ranges = state.ranges
    .map((row) => ({
      min: Number(row.min),
      max: Number(row.max),
      label: row.label.trim(),
    }))
    .filter(
      (row) =>
        Number.isFinite(row.min) &&
        Number.isFinite(row.max) &&
        row.label.length > 0,
    );

  if (ranges.length === 0) {
    throw new Error("Ajoute au moins une plage valide.");
  }

  return {
    name,
    kind: "table_lookup",
    params_json: JSON.stringify({
      ranges,
      defaultLabel: "—",
    }),
  };
}

export function fillRuleFormFromExistingRule(rule: {
  name: string;
  kind: string;
  params_json: string;
}): RuleFormState {
  const base = createDefaultRuleFormState();

  let parsed: any = {};
  try {
    parsed = JSON.parse(rule.params_json || "{}");
  } catch {
    parsed = {};
  }

  if (rule.kind === "single_check") {
    return {
      ...base,
      name: rule.name,
      family: "single_check",
      compare: parsed.compare === "lte" ? "lte" : "gte",
      successThreshold:
        parsed.success_threshold == null ? "" : String(parsed.success_threshold),
      critSuccessFaces: Array.isArray(parsed.crit_success_faces)
        ? parsed.crit_success_faces.join(", ")
        : "",
      critFailureFaces: Array.isArray(parsed.crit_failure_faces)
        ? parsed.crit_failure_faces.join(", ")
        : "",
    };
  }

  if (rule.kind === "success_pool") {
    return {
      ...base,
      name: rule.name,
      family: "success_pool",
      successAtOrAbove:
        parsed.success_at_or_above == null
          ? "5"
          : String(parsed.success_at_or_above),
      failFaces: Array.isArray(parsed.fail_faces)
        ? parsed.fail_faces.join(", ")
        : "1",
      glitchRule:
        parsed.glitch_rule === "ones_gte_successes" ||
        parsed.glitch_rule === "none"
          ? parsed.glitch_rule
          : "ones_gt_successes",
    };
  }

  if (rule.kind === "banded_sum") {
    return {
      ...base,
      name: rule.name,
      family: "banded_sum",
      ranges: Array.isArray(parsed.bands)
        ? parsed.bands.map((row: any) => ({
            min: String(row?.min ?? ""),
            max: String(row?.max ?? ""),
            label: String(row?.label ?? ""),
          }))
        : base.ranges,
    };
  }

  if (rule.kind === "highest_of_pool") {
    return {
      ...base,
      name: rule.name,
      family: "highest_of_pool",
      compare: parsed.compare === "lte" ? "lte" : "gte",
      successThreshold:
        parsed.success_threshold == null ? "" : String(parsed.success_threshold),
      critSuccessFaces: Array.isArray(parsed.crit_success_faces)
        ? parsed.crit_success_faces.join(", ")
        : "",
      critFailureFaces: Array.isArray(parsed.crit_failure_faces)
        ? parsed.crit_failure_faces.join(", ")
        : "",
    };
  }

  return {
    ...base,
    name: rule.name,
    family: "table_lookup",
    ranges: Array.isArray(parsed.ranges)
      ? parsed.ranges.map((row: any) => ({
          min: String(row?.min ?? ""),
          max: String(row?.max ?? ""),
          label: String(row?.label ?? ""),
        }))
      : base.ranges,
  };
}