import type { RuleScope } from "../../../data/repositories/rulesRepo";
import type { RuleFamilyKey } from "../config/ruleFamilies";

export type RuleRangeFormRow = {
  min: string;
  max: string;
  label: string;
};

export type RuleFormState = {
  name: string;
  family: RuleFamilyKey;

  supportedSidesText: string;
  scope: RuleScope;

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

    supportedSidesText: "20",
    scope: "entry",

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

function normalizeScopeForFamily(
  family: RuleFamilyKey,
  requestedScope: RuleScope,
): RuleScope {
  if (family === "success_pool") {
    return "group";
  }

  return requestedScope;
}

function defaultScopeForFamily(family: RuleFamilyKey): RuleScope {
  if (family === "success_pool") {
    return "group";
  }

  return "entry";
}

function defaultSupportedSidesForFamily(family: RuleFamilyKey): string {
  switch (family) {
    case "single_check":
      return "20";
    case "success_pool":
      return "6";
    case "banded_sum":
      return "6";
    case "highest_of_pool":
      return "6";
    case "table_lookup":
      return "100";
    default:
      return "";
  }
}

export function buildRulePayloadFromForm(state: RuleFormState): {
  name: string;
  kind: string;
  params_json: string;
  supported_sides_json: string;
  scope: RuleScope;
} {
  const name = state.name.trim();

  if (!name) {
    throw new Error("Le nom de la règle est obligatoire.");
  }

  const supportedSides = parseNumberList(state.supportedSidesText);
  const scope = normalizeScopeForFamily(state.family, state.scope);

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
      supported_sides_json: JSON.stringify(supportedSides),
      scope,
    };
  }

  if (state.family === "success_pool") {
    const successAtOrAbove = Number(state.successAtOrAbove);

    if (!Number.isFinite(successAtOrAbove)) {
      throw new Error(
        "Le seuil de réussite du pool doit être un nombre valide.",
      );
    }

    return {
      name,
      kind: "success_pool",
      params_json: JSON.stringify({
        success_at_or_above: successAtOrAbove,
        fail_faces: parseNumberList(state.failFaces),
        glitch_rule: state.glitchRule,
      }),
      supported_sides_json: JSON.stringify(supportedSides),
      scope: "group",
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
      supported_sides_json: JSON.stringify(supportedSides),
      scope,
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
      supported_sides_json: JSON.stringify(supportedSides),
      scope,
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
    supported_sides_json: JSON.stringify(supportedSides),
    scope,
  };
}

export function fillRuleFormFromExistingRule(rule: {
  name: string;
  kind: string;
  params_json: string;
  supported_sides_json?: string;
  scope?: RuleScope;
}): RuleFormState {
  const base = createDefaultRuleFormState();

  let parsed: any = {};
  try {
    parsed = JSON.parse(rule.params_json || "{}");
  } catch {
    parsed = {};
  }

  let supportedSidesText = "";
  try {
    const parsedSides = JSON.parse(rule.supported_sides_json || "[]");
    supportedSidesText = Array.isArray(parsedSides)
      ? parsedSides.join(", ")
      : "";
  } catch {
    supportedSidesText = "";
  }

  if (rule.kind === "single_check") {
    return {
      ...base,
      name: rule.name,
      family: "single_check",
      supportedSidesText:
        supportedSidesText || defaultSupportedSidesForFamily("single_check"),
      scope: normalizeScopeForFamily(
        "single_check",
        rule.scope ?? defaultScopeForFamily("single_check"),
      ),
      compare: parsed.compare === "lte" ? "lte" : "gte",
      successThreshold:
        parsed.success_threshold == null
          ? ""
          : String(parsed.success_threshold),
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
      supportedSidesText:
        supportedSidesText || defaultSupportedSidesForFamily("success_pool"),
      scope: "group",
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
      supportedSidesText:
        supportedSidesText || defaultSupportedSidesForFamily("banded_sum"),
      scope: normalizeScopeForFamily(
        "banded_sum",
        rule.scope ?? defaultScopeForFamily("banded_sum"),
      ),
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
      supportedSidesText:
        supportedSidesText || defaultSupportedSidesForFamily("highest_of_pool"),
      scope: normalizeScopeForFamily(
        "highest_of_pool",
        rule.scope ?? defaultScopeForFamily("highest_of_pool"),
      ),
      compare: parsed.compare === "lte" ? "lte" : "gte",
      successThreshold:
        parsed.success_threshold == null
          ? ""
          : String(parsed.success_threshold),
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
    supportedSidesText:
      supportedSidesText || defaultSupportedSidesForFamily("table_lookup"),
    scope: normalizeScopeForFamily(
      "table_lookup",
      rule.scope ?? defaultScopeForFamily("table_lookup"),
    ),
    ranges: Array.isArray(parsed.ranges)
      ? parsed.ranges.map((row: any) => ({
          min: String(row?.min ?? ""),
          max: String(row?.max ?? ""),
          label: String(row?.label ?? ""),
        }))
      : base.ranges,
  };
}
