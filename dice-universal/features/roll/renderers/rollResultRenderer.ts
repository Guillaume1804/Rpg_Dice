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

function pluralizeSuccesses(count: number) {
  return `${count} succès`;
}

function formatBoolean(value: unknown) {
  return value ? "Oui" : "Non";
}

function formatPipelineSteps(meta: any): string[] {
  const steps = Array.isArray(meta?.steps) ? meta.steps : [];
  const lines: string[] = [];

  for (const step of steps) {
    if (step.op === "explode_one") {
      lines.push(`Explosion : ${step.trigger} → +${step.extra}`);
      continue;
    }

    if (step.op === "reroll_one") {
      lines.push(`Relance : ${step.from} → ${step.to}`);
      continue;
    }

    if (step.op === "explode") {
      lines.push(`Après explosion : ${formatValues(step.kept)}`);
      continue;
    }

    if (step.op === "reroll") {
      lines.push(`Après relance : ${formatValues(step.kept)}`);
      continue;
    }

    if (step.op === "keep_highest") {
      lines.push(`Meilleurs dés gardés : ${formatValues(step.kept)}`);
      continue;
    }

    if (step.op === "keep_lowest") {
      lines.push(`Plus faibles dés gardés : ${formatValues(step.kept)}`);
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
      lines.push(`Succès ≥ ${step.at_or_above} : ${step.successes}`);
      continue;
    }

    if (step.op === "count_complications") {
      lines.push(
        `Faces spéciales ${formatValues(step.faces)} : ${step.complications}`,
      );
      continue;
    }

    if (step.op === "count_equal") {
      lines.push(`Valeurs ${formatValues(step.faces)} : ${step.count}`);
      continue;
    }

    if (step.op === "count_range") {
      lines.push(`Valeurs entre ${step.min} et ${step.max} : ${step.count}`);
      continue;
    }

    if (step.op === "lookup") {
      lines.push(`Table : ${step.value} → ${step.label}`);
      continue;
    }

    if (step.op === "take") {
      lines.push(`Valeur sélectionnée : ${formatValues(step.kept)}`);
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
    return `${outcomeLabel} · ${meta.degrees.degrees} degré${
      meta.degrees.degrees > 1 ? "s" : ""
    }`;
  }

  if (meta.outcome) {
    if (successes != null) {
      return `${outcomeLabel} · ${pluralizeSuccesses(successes)}`;
    }

    if (typeof result.final === "number") {
      return `${outcomeLabel} · Final ${result.final}`;
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
    return `Final : ${result.final}`;
  }

  return "Résultat";
}

export function renderRollResult(
  result: any | null,
): RenderedRollResult | null {
  if (!result) return null;

  if (result.kind === "sum") {
    return {
      title: "Somme",
      summary: `Total : ${result.total}`,
      lines: [`Valeurs : ${formatValues(result.values)}`],
      tone: "neutral",
    };
  }

  if (result.kind === "single_check") {
    const outcome = formatOutcome(result.outcome);

    return {
      title: "Test avec seuil",
      summary: outcome.label,
      lines: [
        `Naturel : ${result.natural}`,
        `Final : ${result.final}`,
        result.threshold != null ? `Seuil : ${result.threshold}` : "Seuil : —",
        `Comparaison : ${result.compare === "lte" ? "≤ seuil" : "≥ seuil"}`,
      ],
      tone: outcome.tone,
    };
  }

  if (result.kind === "threshold_degrees") {
    const outcome = formatOutcome(result.outcome);

    return {
      title: "Seuil avec degrés",
      summary: `${outcome.label} · ${result.degrees} degré${
        result.degrees > 1 ? "s" : ""
      }`,
      lines: [
        `Jet : ${result.roll}`,
        `Final : ${result.final}`,
        `Cible : ${result.target}`,
        `Comparaison : ${result.compare === "lte" ? "≤ cible" : "≥ cible"}`,
        `Marge : ${result.margin}`,
        `Degrés : ${result.degrees}`,
        `Taille d’un degré : ${result.degree_step}`,
      ],
      tone: outcome.tone,
    };
  }

  if (result.kind === "success_pool") {
    const outcome = formatOutcome(result.outcome);

    return {
      title: "Pool de succès",
      summary: buildSuccessPoolSummary(result, outcome.label),
      lines: [
        `Dés du pool : ${result.dice_count ?? "—"}`,
        `Succès ≥ ${result.success_at_or_above ?? "—"} : ${result.successes}`,
        `Faces spéciales : ${formatValues(result.fail_faces)}`,
        `Nombre de faces spéciales : ${result.fail_count}`,
        `Complication : ${formatBoolean(result.complication)}`,
        `Réussite critique : ${formatBoolean(result.critical_success)}`,
        `Échec critique : ${formatBoolean(result.critical_failure)}`,
      ],
      details: [
        `Règle de complication : ${result.complication_rule ?? "—"}`,
        `Règle d’échec critique : ${result.critical_failure_rule ?? "—"}`,
        `Règle de réussite critique : ${result.critical_success_rule ?? "—"}`,
      ],
      tone: outcome.tone,
    };
  }

  if (result.kind === "table_lookup") {
    return {
      title: "Table de résultats",
      summary: result.label,
      lines: [`Valeur : ${result.value}`],
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
        `Jets : ${formatValues(result.natural_values)}`,
        `Gardé : ${result.kept}`,
        `Final : ${result.final}`,
        result.threshold != null ? `Seuil : ${result.threshold}` : "Seuil : —",
        `Comparaison : ${result.compare === "lte" ? "≤ seuil" : "≥ seuil"}`,
      ],
      tone: outcome.tone,
    };
  }

  if (result.kind === "lowest_of_pool") {
    const outcome = formatOutcome(result.outcome);

    return {
      title: "Pire dé",
      summary: outcome.label,
      lines: [
        `Jets : ${formatValues(result.natural_values)}`,
        `Gardé : ${result.kept}`,
        `Final : ${result.final}`,
        result.threshold != null ? `Seuil : ${result.threshold}` : "Seuil : —",
        `Comparaison : ${result.compare === "lte" ? "≤ seuil" : "≥ seuil"}`,
      ],
      tone: outcome.tone,
    };
  }

  if (result.kind === "keep_highest_n" || result.kind === "keep_lowest_n") {
    return {
      title:
        result.kind === "keep_highest_n"
          ? "Garder les meilleurs dés"
          : "Garder les plus faibles dés",
      summary: Array.isArray(result.final)
        ? `Résultat : ${formatValues(result.final)}`
        : `Total : ${result.final}`,
      lines: [
        `Jets : ${formatValues(result.natural_values)}`,
        `Gardés : ${formatValues(result.kept)}`,
      ],
      tone: "neutral",
    };
  }

  if (result.kind === "drop_highest_n" || result.kind === "drop_lowest_n") {
    return {
      title:
        result.kind === "drop_highest_n"
          ? "Retirer les meilleurs dés"
          : "Retirer les plus faibles dés",
      summary: Array.isArray(result.final)
        ? `Résultat : ${formatValues(result.final)}`
        : `Total : ${result.final}`,
      lines: [
        `Jets : ${formatValues(result.natural_values)}`,
        `Restants : ${formatValues(result.remaining)}`,
      ],
      tone: "neutral",
    };
  }

  if (result.kind === "pipeline") {
    const meta = result.meta ?? {};
    const outcome = formatOutcome(meta.outcome);
    const stepLines = formatPipelineSteps(meta);

    const lines = [
      `Jet initial : ${formatValues(result.values)}`,
      ...stepLines,
      `Conservés : ${formatValues(result.kept)}`,
      result.final != null ? `Final : ${result.final}` : "Final : —",
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
      lines.push(`Cible des degrés : ${meta.degrees.target}`);
      lines.push(
        `Comparaison degrés : ${
          meta.degrees.compare === "lte" ? "≤ cible" : "≥ cible"
        }`,
      );
      lines.push(`Marge : ${meta.degrees.margin}`);
      lines.push(`Degrés : ${meta.degrees.degrees}`);
      lines.push(`Taille d’un degré : ${meta.degrees.degree_step}`);
    }

    return {
      title: "Pipeline personnalisé",
      summary: buildPipelineSummary(result, outcome.label),
      lines,
      details: [
        `Complication : ${formatBoolean(meta.complication)}`,
        `Réussite critique : ${formatBoolean(meta.critical_success)}`,
        `Échec critique : ${formatBoolean(meta.critical_failure)}`,
        `Règle de complication : ${meta.complication_rule ?? "—"}`,
        `Règle d’échec critique : ${meta.critical_failure_rule ?? "—"}`,
        `Règle de réussite critique : ${meta.critical_success_rule ?? "—"}`,
      ],
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
