// dice-universal\features\rules\guidedBehavior\useGuidedBehaviorPreview.ts

import { useMemo, useState } from "react";
import { evaluateRule } from "../../../core/rules/evaluate";
import type { RuleInput } from "../../../core/rules/types";
import { buildGuidedBehaviorPayload } from "./buildGuidedBehaviorPayload";
import type { GuidedBehaviorDraft } from "./types";

const CLASSIC_DICE = [4, 6, 8, 10, 12, 20, 100];

function randomIntBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeQuantity(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(40, Math.floor(value)));
}

function normalizeModifier(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-999, Math.min(999, Math.floor(value)));
}

function getAllowedDiceFromDraft(draft: GuidedBehaviorDraft) {
  if (draft.diceCompatibility === "all") {
    return CLASSIC_DICE;
  }

  const sides = draft.diceCompatibility.sides
    .filter((side) => Number.isFinite(side) && side > 0)
    .map((side) => Math.floor(side));

  return sides.length > 0 ? sides : CLASSIC_DICE;
}

function formatPreviewResult(result: unknown): string {
  if (!result || typeof result !== "object") {
    return "Aucun résultat.";
  }

  const res = result as any;

  switch (res.kind) {
    case "sum":
      return `Total : ${res.total}`;

    case "single_check":
      return [
        `Résultat : ${res.outcome}`,
        `Naturel : ${res.natural}`,
        `Final : ${res.final}`,
        res.threshold != null ? `Seuil : ${res.threshold}` : null,
      ]
        .filter(Boolean)
        .join("\n");

    case "threshold_degrees":
      return [
        `Résultat : ${res.outcome}`,
        `Jet : ${res.roll}`,
        `Final : ${res.final}`,
        `Marge : ${res.margin}`,
        `Degrés : ${res.degrees}`,
      ].join("\n");

    case "success_pool":
      return [
        `Résultat : ${res.outcome}`,
        `Succès : ${res.successes}`,
        `Complications : ${res.fail_count}`,
      ].join("\n");

    case "table_lookup":
      return [`Valeur : ${res.value}`, `Résultat : ${res.label}`].join("\n");

    case "banded_sum":
      return [`Total : ${res.total}`, `Palier : ${res.label}`].join("\n");

    case "pipeline":
      return [
        res.values ? `Jets : ${res.values.join(" + ")}` : null,
        res.kept ? `Gardés : ${res.kept.join(" + ")}` : null,
        res.final != null ? `Final : ${res.final}` : null,
        res.meta?.outcome ? `Résultat : ${res.meta.outcome}` : null,
      ]
        .filter(Boolean)
        .join("\n");

    default:
      return JSON.stringify(res, null, 2);
  }
}

export function useGuidedBehaviorPreview(draft: GuidedBehaviorDraft) {
  const allowedDice = useMemo(() => getAllowedDiceFromDraft(draft), [draft]);

  const [visible, setVisible] = useState(false);
  const [selectedSides, setSelectedSides] = useState(allowedDice[0] ?? 20);
  const [quantity, setQuantity] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [lastRolls, setLastRolls] = useState<number[]>([]);
  const [resultText, setResultText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function open() {
    const nextAllowedDice = getAllowedDiceFromDraft(draft);

    if (!nextAllowedDice.includes(selectedSides)) {
      setSelectedSides(nextAllowedDice[0] ?? 20);
    }

    setVisible(true);
    setError(null);
  }

  function close() {
    setVisible(false);
  }

  function incrementQuantity() {
    setQuantity((prev) => normalizeQuantity(prev + 1));
  }

  function decrementQuantity() {
    setQuantity((prev) => normalizeQuantity(prev - 1));
  }

  function incrementModifier() {
    setModifier((prev) => normalizeModifier(prev + 1));
  }

  function decrementModifier() {
    setModifier((prev) => normalizeModifier(prev - 1));
  }

  function rollPreview() {
    try {
      const payload = buildGuidedBehaviorPayload(draft);

      const rolls = Array.from({ length: normalizeQuantity(quantity) }).map(
        () => randomIntBetween(1, selectedSides),
      );

      const input: RuleInput = {
        values: rolls,
        sides: selectedSides,
        modifier,
        sign: 1,
      };

      const result = evaluateRule(payload.kind, payload.params_json, {
        values: input.values,
        sides: input.sides ?? selectedSides,
        modifier: input.modifier,
        sign: input.sign,
      });

      setLastRolls(rolls);
      setResultText(formatPreviewResult(result));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(
        "Impossible de calculer l’aperçu avec la configuration actuelle.",
      );
    }
  }

  return {
    visible,
    allowedDice,
    selectedSides,
    quantity,
    modifier,
    lastRolls,
    resultText,
    error,

    open,
    close,
    setSelectedSides,
    incrementQuantity,
    decrementQuantity,
    incrementModifier,
    decrementModifier,
    rollPreview,
  };
}
