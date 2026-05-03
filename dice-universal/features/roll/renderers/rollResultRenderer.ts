// dice-universal\features\roll\renderers\rollResultRenderer.ts

type RenderedRollResult = {
  title: string;
  summary: string;
  lines: string[];
  details?: string[];
  tone?: "neutral" | "success" | "failure" | "warning";
};

function formatOutcome(outcome: string | undefined): {
  label: string;
  tone: RenderedRollResult["tone"];
} {
  if (outcome === "crit_success") {
    return { label: "Réussite critique", tone: "success" };
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
    return { label: "Complication critique", tone: "failure" };
  }

  return { label: "Résultat", tone: "neutral" };
}

function formatValues(values?: number[]) {
  if (!values || values.length === 0) return "—";
  return values.join(" + ");
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
        `Comparaison : ${result.compare === "lte" ? "≤" : "≥"}`,
      ],
      tone: outcome.tone,
    };
  }

  if (result.kind === "threshold_degrees") {
    const outcome = formatOutcome(result.outcome);

    return {
      title: "Seuil avec degrés",
      summary: outcome.label,
      lines: [
        `Jet : ${result.roll}`,
        `Final : ${result.final}`,
        `Cible : ${result.target}`,
        `Marge : ${result.margin}`,
        `Degrés : ${result.degrees}`,
      ],
      tone: outcome.tone,
    };
  }

  if (result.kind === "success_pool") {
    const outcome = formatOutcome(result.outcome);

    return {
      title: "Pool de succès",
      summary: outcome.label,
      lines: [
        `Succès : ${result.successes}`,
        `Échecs spéciaux : ${result.fail_count}`,
        `Faces d’échec spécial : ${formatValues(result.fail_faces)}`,
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
    const outcome = formatOutcome(result.meta?.outcome);
    const stepLines = formatPipelineSteps(result.meta);

    return {
      title: "Pipeline personnalisé",
      summary:
        result.meta?.outcome != null
          ? outcome.label
          : result.final != null
            ? `Final : ${result.final}`
            : "Résultat",
      lines: [
        `Jet initial : ${formatValues(result.values)}`,
        ...stepLines,
        `Conservés : ${formatValues(result.kept)}`,
        result.final != null ? `Final : ${result.final}` : "Final : —",
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
