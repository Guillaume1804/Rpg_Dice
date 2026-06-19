import { useMemo, useState } from "react";
import type { CreateRuleInput } from "../../../data/repositories/rulesRepo";

import {
  DEFAULT_GUIDED_BEHAVIOR_DRAFT,
  type GuidedBehaviorApplicationMode,
  type GuidedBehaviorDraft,
  type GuidedBehaviorIntent,
  type GuidedBehaviorReadingMode,
} from "./types";

import { buildGuidedBehaviorPayload } from "./buildGuidedBehaviorPayload";
import { resolveGuidedBehaviorScope } from "./resolveGuidedBehaviorScope";

import { applyIntentDefaultsToDraft } from "./guidedBehaviorDefaults";

export type GuidedBehaviorWizardStep =
  | "application"
  | "dice"
  | "intent"
  | "transforms"
  | "events"
  | "summary"
  | "identity";

const GUIDED_BEHAVIOR_STEP_ORDER: GuidedBehaviorWizardStep[] = [
  "application",
  "dice",
  "intent",
  "transforms",
  "events",
  "summary",
  "identity",
];

function cloneDefaultDraft(): GuidedBehaviorDraft {
  return JSON.parse(
    JSON.stringify(DEFAULT_GUIDED_BEHAVIOR_DRAFT),
  ) as GuidedBehaviorDraft;
}

function validateNumberList(value: string): boolean {
  const text = value.trim();
  if (!text) return true;

  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .every((item) => Number.isFinite(Number(item)));
}

function validatePositiveNumber(value: string): boolean {
  const text = value.trim();
  if (!text) return true;

  const n = Number(text);
  return Number.isFinite(n) && n > 0;
}

function hasValidTableRange(
  ranges: GuidedBehaviorDraft["reading"]["tableRanges"],
): boolean {
  return ranges.some((range) => {
    const min = Number(range.min);
    const max = Number(range.max);

    return (
      Number.isFinite(min) &&
      Number.isFinite(max) &&
      range.label.trim().length > 0
    );
  });
}

function validateGuidedBehaviorStep(
  step: GuidedBehaviorWizardStep,
  draft: GuidedBehaviorDraft,
): string | null {
  if (step === "identity") {
    if (!draft.name.trim()) {
      return "Le nom du comportement est obligatoire.";
    }

    return null;
  }

  if (step === "dice") {
    if (draft.diceCompatibility !== "all") {
      if (draft.diceCompatibility.sides.length === 0) {
        return "Choisis au moins un type de dé compatible.";
      }

      const invalidSide = draft.diceCompatibility.sides.find(
        (side) => !Number.isFinite(side) || side <= 0,
      );

      if (invalidSide != null) {
        return "Les dés compatibles doivent être des nombres positifs.";
      }
    }

    return null;
  }

  if (step === "transforms") {
    if (
      draft.transforms.reroll.enabled &&
      !validateNumberList(draft.transforms.reroll.faces)
    ) {
      return "Les faces à relancer doivent être une liste de nombres valide.";
    }

    if (
      draft.transforms.reroll.enabled &&
      !validatePositiveNumber(draft.transforms.reroll.maxRerollsPerDie)
    ) {
      return "Le maximum de relances par dé doit être vide ou supérieur à 0.";
    }

    if (
      draft.transforms.explode.enabled &&
      !validateNumberList(draft.transforms.explode.faces)
    ) {
      return "Les faces d’explosion doivent être une liste de nombres valide.";
    }

    if (
      draft.transforms.explode.enabled &&
      !validatePositiveNumber(draft.transforms.explode.maxExplosionsPerDie)
    ) {
      return "Le maximum d’explosions par dé doit être vide ou supérieur à 0.";
    }

    if (
      draft.transforms.keepDrop.mode !== "none" &&
      !validatePositiveNumber(draft.transforms.keepDrop.count)
    ) {
      return "Le nombre de dés à garder ou retirer doit être supérieur à 0.";
    }

    return null;
  }

  if (step === "intent") {
    if (draft.reading.mode === "single_check") {
      const threshold = Number(draft.reading.successThreshold);

      if (!Number.isFinite(threshold)) {
        return "Le seuil de réussite doit être renseigné.";
      }
    }

    if (draft.reading.mode === "threshold_degrees") {
      const target = Number(draft.reading.targetValue);
      const degreeStep = Number(draft.reading.degreeStep);

      if (!Number.isFinite(target)) {
        return "La cible du test avec degrés doit être renseignée.";
      }

      if (!Number.isFinite(degreeStep) || degreeStep <= 0) {
        return "Le pas de degré doit être supérieur à 0.";
      }
    }

    if (draft.reading.mode === "success_pool") {
      const successAtOrAbove = Number(draft.reading.successAtOrAbove);

      if (!Number.isFinite(successAtOrAbove) || successAtOrAbove <= 0) {
        return "Le seuil de succès du pool doit être supérieur à 0.";
      }

      if (!validateNumberList(draft.reading.failFaces)) {
        return "Les faces de complication doivent être une liste de nombres valide.";
      }
    }

    if (draft.reading.mode === "table_lookup") {
      if (!hasValidTableRange(draft.reading.tableRanges)) {
        return "Ajoute au moins une plage valide pour la table ou les paliers.";
      }
    }

    return null;
  }

  if (step === "events") {
    if (
      draft.events.criticalSuccess.enabled &&
      !validateNumberList(draft.events.criticalSuccess.faces)
    ) {
      return "Les faces de réussite critique doivent être une liste de nombres valide.";
    }

    if (
      draft.events.criticalFailure.enabled &&
      !validateNumberList(draft.events.criticalFailure.faces)
    ) {
      return "Les faces d’échec critique doivent être une liste de nombres valide.";
    }

    if (
      draft.events.complication.enabled &&
      !validateNumberList(draft.events.complication.faces)
    ) {
      return "Les faces de complication doivent être une liste de nombres valide.";
    }

    return null;
  }

  return null;
}

export function getGuidedBehaviorStepTitle(step: GuidedBehaviorWizardStep) {
  switch (step) {
    case "identity":
      return "Nom & intention";
    case "application":
      return "Utilisation prévue";
    case "dice":
      return "Dés compatibles";
    case "intent":
      return "Type de comportement";
    case "transforms":
      return "Avant le résultat";
    case "events":
      return "Événements spéciaux";
    case "summary":
      return "Résumé";
    default:
      return "Étape";
  }
}

export function getGuidedBehaviorStepDescription(
  step: GuidedBehaviorWizardStep,
) {
  switch (step) {
    case "identity":
      return "Donne un nom clair au comportement.";
    case "application":
      return "Indique si ce comportement sert plutôt une ligne de dés, tout un jet, ou si l’application doit choisir.";
    case "dice":
      return "Choisis les dés avec lesquels ce comportement peut être utilisé.";
    case "intent":
      return "Choisis le comportement principal. L’application déterminera automatiquement comment lire le résultat.";
    case "transforms":
      return "Ajoute des effets avant le résultat : relances, explosions, garder ou retirer des dés.";
    case "events":
      return "Ajoute les critiques, échecs critiques ou complications.";
    case "summary":
      return "Vérifie la configuration avant sauvegarde.";
    default:
      return "";
  }
}

export function useGuidedBehaviorWizard() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<GuidedBehaviorWizardStep>("identity");
  const [draft, setDraft] = useState<GuidedBehaviorDraft>(cloneDefaultDraft());
  const [error, setError] = useState<string | null>(null);

  function open() {
    setVisible(true);
    setStep(GUIDED_BEHAVIOR_STEP_ORDER[0]);
    setError(null);
  }

  function close() {
    setVisible(false);
    setStep(GUIDED_BEHAVIOR_STEP_ORDER[0]);
    setDraft(cloneDefaultDraft());
    setError(null);
  }

  function updateDraft(patch: Partial<GuidedBehaviorDraft>) {
    setDraft((prev) => ({
      ...prev,
      ...patch,
    }));
  }

  function updateIdentity(params: { name?: string; description?: string }) {
    setDraft((prev) => ({
      ...prev,
      ...params,
    }));
  }

  function setIntent(intent: GuidedBehaviorIntent) {
    setDraft((prev) => {
      const next = applyIntentDefaultsToDraft(prev, intent);

      return {
        ...next,
        resolvedScope: resolveGuidedBehaviorScope(next),
      };
    });
  }

  function setDiceCompatibility(
    diceCompatibility: GuidedBehaviorDraft["diceCompatibility"],
  ) {
    setDraft((prev) => ({
      ...prev,
      diceCompatibility,
    }));
  }

  function setApplicationMode(applicationMode: GuidedBehaviorApplicationMode) {
    setDraft((prev) => {
      const next = {
        ...prev,
        applicationMode,
      };

      return {
        ...next,
        resolvedScope: resolveGuidedBehaviorScope(next),
      };
    });
  }

  function updateTransforms(patch: Partial<GuidedBehaviorDraft["transforms"]>) {
    setDraft((prev) => {
      const next = {
        ...prev,
        transforms: {
          ...prev.transforms,
          ...patch,
        },
      };

      return {
        ...next,
        resolvedScope: resolveGuidedBehaviorScope(next),
      };
    });
  }

  function updateReroll(
    patch: Partial<GuidedBehaviorDraft["transforms"]["reroll"]>,
  ) {
    updateTransforms({
      reroll: {
        ...draft.transforms.reroll,
        ...patch,
      },
    });
  }

  function updateExplode(
    patch: Partial<GuidedBehaviorDraft["transforms"]["explode"]>,
  ) {
    updateTransforms({
      explode: {
        ...draft.transforms.explode,
        ...patch,
      },
    });
  }

  function updateKeepDrop(
    patch: Partial<GuidedBehaviorDraft["transforms"]["keepDrop"]>,
  ) {
    updateTransforms({
      keepDrop: {
        ...draft.transforms.keepDrop,
        ...patch,
      },
    });
  }

  function updateReading(patch: Partial<GuidedBehaviorDraft["reading"]>) {
    setDraft((prev) => {
      const next = {
        ...prev,
        reading: {
          ...prev.reading,
          ...patch,
        },
      };

      return {
        ...next,
        resolvedScope: resolveGuidedBehaviorScope(next),
      };
    });
  }

  function setReadingMode(mode: GuidedBehaviorReadingMode) {
    setDraft((prev) => {
      const next = {
        ...prev,
        reading: {
          ...prev.reading,
          mode,
        },
      };

      return {
        ...next,
        resolvedScope: resolveGuidedBehaviorScope(next),
      };
    });
  }

  function updateTableRange(
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) {
    setDraft((prev) => ({
      ...prev,
      reading: {
        ...prev.reading,
        tableRanges: prev.reading.tableRanges.map((range, rangeIndex) =>
          rangeIndex === index ? { ...range, [key]: value } : range,
        ),
      },
    }));
  }

  function addTableRange() {
    setDraft((prev) => ({
      ...prev,
      reading: {
        ...prev.reading,
        tableRanges: [
          ...prev.reading.tableRanges,
          { min: "", max: "", label: "" },
        ],
      },
    }));
  }

  function removeTableRange(index: number) {
    setDraft((prev) => ({
      ...prev,
      reading: {
        ...prev.reading,
        tableRanges: prev.reading.tableRanges.filter(
          (_, rangeIndex) => rangeIndex !== index,
        ),
      },
    }));
  }

  function updateEvents(patch: Partial<GuidedBehaviorDraft["events"]>) {
    setDraft((prev) => ({
      ...prev,
      events: {
        ...prev.events,
        ...patch,
      },
    }));
  }

  function updateCriticalSuccess(
    patch: Partial<GuidedBehaviorDraft["events"]["criticalSuccess"]>,
  ) {
    updateEvents({
      criticalSuccess: {
        ...draft.events.criticalSuccess,
        ...patch,
      },
    });
  }

  function updateCriticalFailure(
    patch: Partial<GuidedBehaviorDraft["events"]["criticalFailure"]>,
  ) {
    updateEvents({
      criticalFailure: {
        ...draft.events.criticalFailure,
        ...patch,
      },
    });
  }

  function updateComplication(
    patch: Partial<GuidedBehaviorDraft["events"]["complication"]>,
  ) {
    updateEvents({
      complication: {
        ...draft.events.complication,
        ...patch,
      },
    });
  }

  function updateOutput(patch: Partial<GuidedBehaviorDraft["output"]>) {
    setDraft((prev) => ({
      ...prev,
      output: {
        ...prev.output,
        ...patch,
      },
    }));
  }

  function goNext() {
    const validationError = validateGuidedBehaviorStep(step, draft);

    if (validationError) {
      setError(validationError);
      return false;
    }

    setError(null);

    const currentIndex = GUIDED_BEHAVIOR_STEP_ORDER.indexOf(step);

    if (currentIndex < GUIDED_BEHAVIOR_STEP_ORDER.length - 1) {
      setStep(GUIDED_BEHAVIOR_STEP_ORDER[currentIndex + 1]);
    }

    return true;
  }

  function goBack() {
    setError(null);

    const currentIndex = GUIDED_BEHAVIOR_STEP_ORDER.indexOf(step);

    if (currentIndex > 0) {
      setStep(GUIDED_BEHAVIOR_STEP_ORDER[currentIndex - 1]);
    }
  }

  function buildPayload(): CreateRuleInput {
    return buildGuidedBehaviorPayload({
      ...draft,
      resolvedScope: resolveGuidedBehaviorScope(draft),
    });
  }

  const stepIndex = useMemo(
    () => GUIDED_BEHAVIOR_STEP_ORDER.indexOf(step),
    [step],
  );

  return {
    visible,
    step,
    stepIndex,
    totalSteps: GUIDED_BEHAVIOR_STEP_ORDER.length,
    draft,
    error,

    open,
    close,
    goNext,
    goBack,

    updateDraft,
    updateIdentity,
    setIntent,
    setDiceCompatibility,
    setApplicationMode,

    updateReroll,
    updateExplode,
    updateKeepDrop,

    updateReading,
    setReadingMode,
    updateTableRange,
    addTableRange,
    removeTableRange,

    updateCriticalSuccess,
    updateCriticalFailure,
    updateComplication,

    updateOutput,

    buildPayload,
  };
}
