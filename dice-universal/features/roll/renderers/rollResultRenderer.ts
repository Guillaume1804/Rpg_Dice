// dice-universal\features\roll\renderers\rollResultRenderer.ts

type RenderedTone = "neutral" | "success" | "failure" | "warning" | "critical";

type RenderedRollResult = {
  title: string;
  summary: string;
  lines: string[];
  details?: string[];
  tone?: RenderedTone;
};

function formatOutcome(outcome: string | undefined): {
  label: string;
  tone: RenderedTone;
} {
  if (outcome === "crit_success") {
    return { label: "Réussite critique", tone: "critical" };
  }

  if (outcome === "crit_failure") {
    return { label: "Échec critique", tone: "failure" };
  }

  if (outcome === "success") {
    return { label: "Réussite", tone: "success" };
  }

  if (outcome === "failure") {
    return { label: "Échec", tone: "failure" };
  }

  if (outcome === "glitch") {
    return { label: "Complication", tone: "warning" };
  }

  if (outcome === "crit_glitch") {
    return { label: "Échec critique + complication", tone: "failure" };
  }

  return { label: "Résultat", tone: "neutral" };
}

function formatValues(values?: number[]) {
  if (!values || values.length === 0) return "—";
  return values.join(" + ");
}

function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count > 1 ? (plural ?? `${singular}s`) : singular}`;
}

function pluralizeSuccesses(count: number) {
  return pluralize(count, "succès", "succès");
}

function formatBoolean(value: unknown) {
  return value ? "Oui" : "Non";
}

function formatCompare(compare?: string, targetLabel = "seuil") {
  return compare === "lte" ? `≤ ${targetLabel}` : `≥ ${targetLabel}`;
}

function formatRuleLabel(value: unknown) {
  const key = typeof value === "string" ? value : "";

  const labels: Record<string, string> = {
    none: "Aucune",
    any: "Dès qu’une face spéciale apparaît",
    any_special_failure: "Dès qu’une face spéciale apparaît",

    gt_successes: "Faces spéciales > succès",
    gte_successes: "Faces spéciales ≥ succès",
    special_failures_gt_successes: "Faces spéciales > succès",
    special_failures_gte_successes: "Faces spéciales ≥ succès",

    gt_half_dice: "Faces spéciales > moitié des dés",
    gte_half_dice: "Faces spéciales ≥ moitié des dés",
    special_failures_gt_half_dice: "Faces spéciales > moitié des dés",
    special_failures_gte_half_dice: "Faces spéciales ≥ moitié des dés",

    gt_half_successes: "Faces spéciales > moitié des succès",
    gte_half_successes: "Faces spéciales ≥ moitié des succès",
    special_failures_gt_half_successes: "Faces spéciales > moitié des succès",
    special_failures_gte_half_successes: "Faces spéciales ≥ moitié des succès",

    zero_successes: "Aucun succès",
    all_special_failures: "Tous les dés sont des faces spéciales",
    all_complication_faces: "Tous les dés sont des faces de complication",

    complications_gt_successes: "Complications > succès",
    complications_gte_successes: "Complications ≥ succès",
    complication_and_zero_successes: "Complication + aucun succès",
    complication_and_failed_threshold: "Complication + échec au seuil",
    complication_and_failure: "Complication + échec",

    successes_gte_threshold: "Nombre de succès suffisant",
    all_dice_successes: "Tous les dés réussissent",
    all_dice_max_faces: "Tous les dés sont au maximum",
    any_max_face: "Au moins un dé au maximum",
    any_critical_face: "Au moins une face critique",

    ones_gt_successes: "1 > succès",
    ones_gte_successes: "1 ≥ succès",
  };

  return (labels[key] ?? key) || "—";
}


// function pushIfUseful(lines: string[], label: string, value: unknown) {
//   if (value == null) return;
//   if (value === "") return;
// 
//   lines.push(`${label} : ${value}`);
// }


function formatPipelineSteps(meta: any): string[] {
  const steps = Array.isArray(meta?.steps) ? meta.steps : [];
  const lines: string[] = [];

  for (const step of steps) {
    if (step.op === "explode_one") {
      lines.push(`Explosion : ${step.trigger} déclenche +${step.extra}`);
      continue;
    }

    if (step.op === "reroll_one") {
      lines.push(`Relance : ${step.from} devient ${step.to}`);
      continue;
    }

    if (step.op === "explode") {
      lines.push(`Après explosions : ${formatValues(step.kept)}`);
      continue;
    }

    if (step.op === "reroll") {
      lines.push(`Après relances : ${formatValues(step.kept)}`);
      continue;
    }

    if (step.op === "keep_highest") {
      lines.push(`Dés gardés : ${formatValues(step.kept)} meilleurs`);
      continue;
    }

    if (step.op === "keep_lowest") {
      lines.push(`Dés gardés : ${formatValues(step.kept)} plus faibles`);
      continue;
    }

    if (step.op === "drop_highest") {
      lines.push(`Après retrait des meilleurs : ${formatValues(step.kept)}`);
      continue;
    }

    if (step.op === "drop_lowest") {
      lines.push(`Après retrait des plus faibles : ${formatValues(step.kept)}`);
      continue;
    }

    if (step.op === "count_successes") {
      lines.push(`Succès sur ${step.at_or_above}+ : ${step.successes}`);
      continue;
    }

    if (step.op === "count_complications") {
      lines.push(
        `Faces spéciales ${formatValues(step.faces)} : ${step.complications}`,
      );
      continue;
    }

    if (step.op === "count_equal") {
      lines.push(`Faces ${formatValues(step.faces)} : ${step.count}`);
      continue;
    }

    if (step.op === "count_range") {
      lines.push(`Dans la plage ${step.min}–${step.max} : ${step.count}`);
      continue;
    }

    if (step.op === "lookup") {
      lines.push(`Table : ${step.value} → ${step.label}`);
      continue;
    }

    if (step.op === "take") {
      lines.push(`Valeur retenue : ${formatValues(step.kept)}`);
      continue;
    }

    if (step.op === "sort_asc") {
      lines.push(`Tri croissant : ${formatValues(step.kept)}`);
      continue;
    }

    if (step.op === "sort_desc") {
      lines.push(`Tri décroissant : ${formatValues(step.kept)}`);
      continue;
    }
  }

  return lines;
}

function buildSuccessPoolSummary(result: any, outcomeLabel: string) {
  const successes = typeof result.successes === "number" ? result.successes : 0;

  if (result.outcome === "crit_success") {
    return `Réussite critique · ${pluralizeSuccesses(successes)}`;
  }

  if (result.outcome === "crit_failure") {
    return `Échec critique · ${pluralizeSuccesses(successes)}`;
  }

  if (result.outcome === "crit_glitch") {
    return `Échec critique · ${pluralizeSuccesses(successes)} + complication`;
  }

  if (result.outcome === "glitch") {
    return `${pluralizeSuccesses(successes)} + complication`;
  }

  if (result.outcome === "failure") {
    return successes > 0
      ? `${outcomeLabel} · ${pluralizeSuccesses(successes)}`
      : "Échec · 0 succès";
  }

  return pluralizeSuccesses(successes);
}

function buildPipelineSummary(result: any, outcomeLabel: string) {
  const meta = result.meta ?? {};
  const successes = typeof meta.successes === "number" ? meta.successes : null;

  if (meta.degrees && meta.outcome) {
    return `${outcomeLabel} · ${pluralize(
      Number(meta.degrees.degrees ?? 0),
      "degré",
    )}`;
  }

  if (meta.outcome) {
    if (successes != null) {
      return `${outcomeLabel} · ${pluralizeSuccesses(successes)}`;
    }

    if (typeof result.final === "number") {
      return `${outcomeLabel} · ${result.final}`;
    }

    return outcomeLabel;
  }

  if (successes != null) {
    return pluralizeSuccesses(successes);
  }

  if (typeof meta.lookup?.label === "string") {
    return meta.lookup.label;
  }

  if (result.final != null) {
    return `Total : ${result.final}`;
  }

  return "Résultat";
}

function buildPipelineDetails(meta: any): string[] {
  const details: string[] = [];

  if (meta.success_threshold != null) {
    details.push(`Seuil de réussite : ${meta.success_threshold}`);
  }

  if (meta.compare) {
    details.push(`Comparaison : ${formatCompare(meta.compare)}`);
  }

  if (meta.complication_rule && meta.complication_rule !== "none") {
    details.push(`Complication : ${formatRuleLabel(meta.complication_rule)}`);
  }

  if (meta.critical_failure_rule && meta.critical_failure_rule !== "none") {
    details.push(
      `Échec critique : ${formatRuleLabel(meta.critical_failure_rule)}`,
    );
  }

  if (meta.critical_success_rule && meta.critical_success_rule !== "none") {
    details.push(
      `Réussite critique : ${formatRuleLabel(meta.critical_success_rule)}`,
    );
  }

  if (
    Array.isArray(meta.critical_success_faces) &&
    meta.critical_success_faces.length > 0
  ) {
    details.push(
      `Faces de réussite critique : ${formatValues(meta.critical_success_faces)}`,
    );
  }

  if (meta.critical_success_threshold != null) {
    details.push(
      `Seuil de réussite critique : ${meta.critical_success_threshold}`,
    );
  }

  return details;
}

export function renderRollResult(
  result: any | null,
): RenderedRollResult | null {
  if (!result) return null;

  if (result.kind === "sum") {
    return {
      title: "Somme simple",
      summary: `Total : ${result.total}`,
      lines: [`Dés lancés : ${formatValues(result.values)}`],
      tone: "neutral",
    };
  }

  if (result.kind === "d20" || result.kind === "single_check") {
    const outcome = formatOutcome(result.outcome);

    const natural = result.natural ?? result.value ?? "—";
    const final = result.final ?? result.value ?? "—";

    return {
      title: result.kind === "d20" ? "Test D20" : "Test avec seuil",
      summary: outcome.label,
      lines: [
        `Jet naturel : ${natural}`,
        `Résultat final : ${final}`,
        result.threshold != null
          ? `Seuil à atteindre : ${result.threshold}`
          : "Aucun seuil défini",
        `Réussite si : ${formatCompare(result.compare, "seuil")}`,
      ],
      tone: outcome.tone,
    };
  }

  if (result.kind === "threshold_degrees") {
    const outcome = formatOutcome(result.outcome);

    return {
      title: "Seuil avec degrés",
      summary: `${outcome.label} · ${pluralize(
        Number(result.degrees ?? 0),
        "degré",
      )}`,
      lines: [
        `Jet naturel : ${result.roll}`,
        `Résultat final : ${result.final}`,
        `Cible : ${result.target}`,
        `Réussite si : ${formatCompare(result.compare, "cible")}`,
        `Marge : ${result.margin}`,
        `Degrés obtenus : ${result.degrees}`,
        `Pas de degré : ${result.degree_step}`,
      ],
      tone: outcome.tone,
    };
  }

  if (result.kind === "pool") {
    const outcome = formatOutcome(result.outcome);
    const successes = Number(result.successes ?? 0);
    const ones = Number(result.ones ?? 0);

    return {
      title: "Pool de dés",
      summary:
        result.outcome === "glitch" || result.outcome === "crit_glitch"
          ? `${outcome.label} · ${pluralizeSuccesses(successes)}`
          : `${outcome.label} · ${pluralizeSuccesses(successes)}`,
      lines: [`Succès : ${successes}`, `Faces problématiques : ${ones}`],
      tone: outcome.tone,
    };
  }

  if (result.kind === "success_pool") {
    const outcome = formatOutcome(result.outcome);

    return {
      title: "Pool de succès",
      summary: buildSuccessPoolSummary(result, outcome.label),
      lines: [
        `Dés lancés : ${result.dice_count ?? "—"}`,
        `Succès sur ${result.success_at_or_above ?? "—"}+ : ${
          result.successes
        }`,
        `Faces spéciales : ${formatValues(result.fail_faces)}`,
        `Faces spéciales obtenues : ${result.fail_count}`,
        `Complication : ${formatBoolean(result.complication)}`,
        `Réussite critique : ${formatBoolean(result.critical_success)}`,
        `Échec critique : ${formatBoolean(result.critical_failure)}`,
      ],
      details: [
        `Règle de complication : ${formatRuleLabel(result.complication_rule)}`,
        `Règle d’échec critique : ${formatRuleLabel(
          result.critical_failure_rule,
        )}`,
        `Règle de réussite critique : ${formatRuleLabel(
          result.critical_success_rule,
        )}`,
      ],
      tone: outcome.tone,
    };
  }

  if (result.kind === "table_lookup") {
    return {
      title: "Table de résultats",
      summary: result.label,
      lines: [`Valeur obtenue : ${result.value}`],
      tone: "neutral",
    };
  }

  if (result.kind === "banded_sum") {
    return {
      title: "Résultat par paliers",
      summary: result.label,
      lines: [`Total : ${result.total}`],
      tone: "neutral",
    };
  }

  if (result.kind === "highest_of_pool") {
    const outcome = formatOutcome(result.outcome);

    return {
      title: "Meilleur dé",
      summary: outcome.label,
      lines: [
        `Dés lancés : ${formatValues(result.natural_values)}`,
        `Dé gardé : ${result.kept}`,
        `Résultat final : ${result.final}`,
        result.threshold != null
          ? `Seuil à atteindre : ${result.threshold}`
          : "Aucun seuil défini",
        `Réussite si : ${formatCompare(result.compare, "seuil")}`,
      ],
      tone: outcome.tone,
    };
  }

  if (result.kind === "lowest_of_pool") {
    const outcome = formatOutcome(result.outcome);

    return {
      title: "Plus faible dé",
      summary: outcome.label,
      lines: [
        `Dés lancés : ${formatValues(result.natural_values)}`,
        `Dé gardé : ${result.kept}`,
        `Résultat final : ${result.final}`,
        result.threshold != null
          ? `Seuil à atteindre : ${result.threshold}`
          : "Aucun seuil défini",
        `Réussite si : ${formatCompare(result.compare, "seuil")}`,
      ],
      tone: outcome.tone,
    };
  }

  if (result.kind === "keep_highest_n" || result.kind === "keep_lowest_n") {
    const isHigh = result.kind === "keep_highest_n";

    return {
      title: isHigh ? "Garder les meilleurs" : "Garder les plus faibles",
      summary: Array.isArray(result.final)
        ? `Résultat : ${formatValues(result.final)}`
        : `Total : ${result.final}`,
      lines: [
        `Dés lancés : ${formatValues(result.natural_values)}`,
        `Dés gardés : ${formatValues(result.kept)}`,
      ],
      tone: "neutral",
    };
  }

  if (result.kind === "drop_highest_n" || result.kind === "drop_lowest_n") {
    const isHigh = result.kind === "drop_highest_n";

    return {
      title: isHigh ? "Retirer les meilleurs" : "Retirer les plus faibles",
      summary: Array.isArray(result.final)
        ? `Résultat : ${formatValues(result.final)}`
        : `Total : ${result.final}`,
      lines: [
        `Dés lancés : ${formatValues(result.natural_values)}`,
        `Dés restants : ${formatValues(result.remaining)}`,
      ],
      tone: "neutral",
    };
  }

  if (result.kind === "pipeline") {
    const meta = result.meta ?? {};
    const outcome = formatOutcome(meta.outcome);
    const stepLines = formatPipelineSteps(meta);

    const lines = [
      `Dés de départ : ${formatValues(result.values)}`,
      ...stepLines,
      `Dés retenus : ${formatValues(result.kept)}`,
      result.final != null
        ? `Résultat final : ${result.final}`
        : "Résultat final : —",
    ];

    if (typeof meta.successes === "number") {
      lines.push(`Succès : ${meta.successes}`);
    }

    if (typeof meta.complications === "number") {
      lines.push(`Faces spéciales : ${meta.complications}`);
    }

    if (typeof meta.count_equal === "number") {
      lines.push(`Faces exactes comptées : ${meta.count_equal}`);
    }

    if (typeof meta.count_range === "number") {
      lines.push(`Valeurs dans la plage : ${meta.count_range}`);
    }

    if (meta.lookup?.label) {
      lines.push(`Résultat de table : ${meta.lookup.label}`);
    }

    if (meta.degrees) {
      lines.push(`Cible : ${meta.degrees.target}`);
      lines.push(
        `Réussite si : ${formatCompare(meta.degrees.compare, "cible")}`,
      );
      lines.push(`Marge : ${meta.degrees.margin}`);
      lines.push(`Degrés obtenus : ${meta.degrees.degrees}`);
      lines.push(`Pas de degré : ${meta.degrees.degree_step}`);
    }

    return {
      title: "Pipeline personnalisé",
      summary: buildPipelineSummary(result, outcome.label),
      lines,
      details: buildPipelineDetails(meta),
      tone: outcome.tone,
    };
  }

  if (result.kind === "unknown") {
    return {
      title: "Règle inconnue",
      summary: result.message,
      lines: [],
      tone: "warning",
    };
  }

  return {
    title: "Résultat",
    summary: "Résultat non formaté",
    lines: [],
    tone: "neutral",
  };
}
