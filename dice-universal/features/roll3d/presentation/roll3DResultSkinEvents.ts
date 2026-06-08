// dice-universal/features/roll3d/presentation/roll3DResultSkinEvents.ts

import type {
  Roll3DResultEvent,
  Roll3DResultPresentation,
  Roll3DResultTone,
} from "./roll3DResultPresentation";

export type Roll3DRevealIntensity =
  | "none"
  | "low"
  | "medium"
  | "high"
  | "legendary";

export type Roll3DRevealAnimationCue =
  | "none"
  | "simple_total"
  | "success_reveal"
  | "failure_reveal"
  | "critical_success_reveal"
  | "critical_failure_reveal"
  | "complication_reveal"
  | "degrees_reveal"
  | "pipeline_reveal";

export type Roll3DParticlePreset =
  | "none"
  | "soft_sparks"
  | "success_burst"
  | "failure_smoke"
  | "critical_flash"
  | "critical_crack"
  | "complication_embers"
  | "arcane_runes";

export type Roll3DHapticPattern =
  | "none"
  | "light"
  | "medium"
  | "success"
  | "failure"
  | "critical_success"
  | "critical_failure"
  | "complication";

export type Roll3DSoundCue =
  | "none"
  | "result_soft"
  | "result_success"
  | "result_failure"
  | "result_critical_success"
  | "result_critical_failure"
  | "result_complication"
  | "result_degrees";

export type Roll3DResultToneVisual = {
  label: string;
  icon: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
};

export type Roll3DResultSkinEvents = {
  /**
   * Ton général de la révélation.
   * Les thèmes/skins pourront l’utiliser pour changer couleurs, intensité,
   * transitions, particules, sons et haptics.
   */
  tone: Roll3DResultTone;

  /**
   * Intensité abstraite.
   * Un skin Dragon pourra convertir "legendary" en flammes fortes.
   * Un skin Cosmic pourra convertir "legendary" en supernova.
   */
  intensity: Roll3DRevealIntensity;

  /**
   * Animation conseillée.
   * Ce n’est pas encore l’animation finale, juste une intention stable.
   */
  revealAnimation: Roll3DRevealAnimationCue;

  /**
   * Particules conseillées.
   * Les skins pourront remplacer ce preset par leurs propres effets.
   */
  particlePreset: Roll3DParticlePreset;

  /**
   * Indication haptique abstraite.
   * Elle devra respecter plus tard les paramètres utilisateur.
   */
  hapticPattern: Roll3DHapticPattern;

  /**
   * Indication sonore abstraite.
   * Elle devra respecter plus tard les paramètres utilisateur.
   */
  soundCue: Roll3DSoundCue;

  /**
   * Événements importants à mettre en avant visuellement.
   */
  highlightedEvents: Roll3DResultEvent[];

  /**
   * Tags exploitables par les futurs thèmes/skins.
   * Exemple : un skin Dragon peut écouter "critical_success" + "explosive".
   */
  skinTags: string[];
};

function hasEvent(
  presentation: Roll3DResultPresentation,
  event: Roll3DResultEvent,
) {
  return presentation.events.includes(event);
}

function getPrimaryIntensity(
  presentation: Roll3DResultPresentation,
): Roll3DRevealIntensity {
  if (
    hasEvent(presentation, "critical_success") ||
    hasEvent(presentation, "critical_failure")
  ) {
    return "legendary";
  }

  if (
    hasEvent(presentation, "complication") ||
    hasEvent(presentation, "degrees")
  ) {
    return "high";
  }

  if (
    hasEvent(presentation, "success") ||
    hasEvent(presentation, "failure") ||
    hasEvent(presentation, "pipeline") ||
    hasEvent(presentation, "success_pool")
  ) {
    return "medium";
  }

  if (
    hasEvent(presentation, "modifier") ||
    hasEvent(presentation, "keep_drop") ||
    hasEvent(presentation, "table_lookup") ||
    hasEvent(presentation, "group_behavior")
  ) {
    return "low";
  }

  return "low";
}

function getRevealAnimation(
  presentation: Roll3DResultPresentation,
): Roll3DRevealAnimationCue {
  if (hasEvent(presentation, "critical_success")) {
    return "critical_success_reveal";
  }

  if (hasEvent(presentation, "critical_failure")) {
    return "critical_failure_reveal";
  }

  if (hasEvent(presentation, "complication")) {
    return "complication_reveal";
  }

  if (hasEvent(presentation, "degrees")) {
    return "degrees_reveal";
  }

  if (hasEvent(presentation, "pipeline")) {
    return "pipeline_reveal";
  }

  if (hasEvent(presentation, "success")) {
    return "success_reveal";
  }

  if (hasEvent(presentation, "failure")) {
    return "failure_reveal";
  }

  if (presentation.events.length === 0 || hasEvent(presentation, "sum")) {
    return "simple_total";
  }

  return "simple_total";
}

function getParticlePreset(
  presentation: Roll3DResultPresentation,
): Roll3DParticlePreset {
  if (hasEvent(presentation, "critical_success")) {
    return "critical_flash";
  }

  if (hasEvent(presentation, "critical_failure")) {
    return "critical_crack";
  }

  if (hasEvent(presentation, "complication")) {
    return "complication_embers";
  }

  if (hasEvent(presentation, "degrees")) {
    return "arcane_runes";
  }

  if (hasEvent(presentation, "success")) {
    return "success_burst";
  }

  if (hasEvent(presentation, "failure")) {
    return "failure_smoke";
  }

  if (
    hasEvent(presentation, "pipeline") ||
    hasEvent(presentation, "group_behavior")
  ) {
    return "arcane_runes";
  }

  return "soft_sparks";
}

function getHapticPattern(
  presentation: Roll3DResultPresentation,
): Roll3DHapticPattern {
  if (hasEvent(presentation, "critical_success")) {
    return "critical_success";
  }

  if (hasEvent(presentation, "critical_failure")) {
    return "critical_failure";
  }

  if (hasEvent(presentation, "complication")) {
    return "complication";
  }

  if (hasEvent(presentation, "success")) {
    return "success";
  }

  if (hasEvent(presentation, "failure")) {
    return "failure";
  }

  if (
    hasEvent(presentation, "degrees") ||
    hasEvent(presentation, "pipeline") ||
    hasEvent(presentation, "success_pool")
  ) {
    return "medium";
  }

  return "light";
}

function getSoundCue(presentation: Roll3DResultPresentation): Roll3DSoundCue {
  if (hasEvent(presentation, "critical_success")) {
    return "result_critical_success";
  }

  if (hasEvent(presentation, "critical_failure")) {
    return "result_critical_failure";
  }

  if (hasEvent(presentation, "complication")) {
    return "result_complication";
  }

  if (hasEvent(presentation, "degrees")) {
    return "result_degrees";
  }

  if (hasEvent(presentation, "success")) {
    return "result_success";
  }

  if (hasEvent(presentation, "failure")) {
    return "result_failure";
  }

  return "result_soft";
}

function getHighlightedEvents(
  presentation: Roll3DResultPresentation,
): Roll3DResultEvent[] {
  const priority: Roll3DResultEvent[] = [
    "critical_success",
    "critical_failure",
    "complication",
    "success",
    "failure",
    "degrees",
    "success_pool",
    "pipeline",
    "keep_drop",
    "table_lookup",
    "group_behavior",
    "modifier",
    "sum",
  ];

  return priority.filter((event) => presentation.events.includes(event));
}

function buildSkinTags(
  presentation: Roll3DResultPresentation,
  highlightedEvents: Roll3DResultEvent[],
): string[] {
  const tags = new Set<string>();

  tags.add(`tone:${presentation.tone}`);

  for (const event of highlightedEvents) {
    tags.add(`event:${event}`);
  }

  if (
    highlightedEvents.includes("critical_success") ||
    highlightedEvents.includes("critical_failure")
  ) {
    tags.add("impact:critical");
  }

  if (highlightedEvents.includes("complication")) {
    tags.add("impact:danger");
  }

  if (highlightedEvents.includes("degrees")) {
    tags.add("rules:degrees");
  }

  if (highlightedEvents.includes("pipeline")) {
    tags.add("rules:pipeline");
  }

  if (highlightedEvents.includes("success_pool")) {
    tags.add("rules:success_pool");
  }

  if (highlightedEvents.includes("keep_drop")) {
    tags.add("rules:keep_drop");
  }

  if (highlightedEvents.includes("group_behavior")) {
    tags.add("rules:group_behavior");
  }

  return Array.from(tags);
}

export function formatRoll3DResultEventLabel(event: Roll3DResultEvent) {
  switch (event) {
    case "critical_success":
      return "Critique";

    case "critical_failure":
      return "Échec critique";

    case "complication":
      return "Complication";

    case "success":
      return "Réussite";

    case "failure":
      return "Échec";

    case "degrees":
      return "Degrés";

    case "success_pool":
      return "Succès";

    case "pipeline":
      return "Pipeline";

    case "keep_drop":
      return "Keep / Drop";

    case "table_lookup":
      return "Table";

    case "group_behavior":
      return "Groupe";

    case "modifier":
      return "Modificateur";

    case "sum":
    default:
      return "Somme";
  }
}

export function getRoll3DResultToneVisual(
  tone: Roll3DResultTone,
): Roll3DResultToneVisual {
  switch (tone) {
    case "criticalSuccess":
      return {
        label: "Réussite critique",
        icon: "✦",
        borderColor: "rgba(125, 255, 190, 0.72)",
        backgroundColor: "rgba(42, 190, 119, 0.16)",
        textColor: "#9DFFD0",
      };

    case "success":
      return {
        label: "Réussite",
        icon: "✓",
        borderColor: "rgba(113, 221, 150, 0.58)",
        backgroundColor: "rgba(54, 160, 98, 0.14)",
        textColor: "#9BE7B2",
      };

    case "failure":
      return {
        label: "Échec",
        icon: "×",
        borderColor: "rgba(255, 130, 130, 0.52)",
        backgroundColor: "rgba(190, 58, 58, 0.14)",
        textColor: "#FF9C9C",
      };

    case "criticalFailure":
      return {
        label: "Échec critique",
        icon: "!",
        borderColor: "rgba(255, 88, 88, 0.72)",
        backgroundColor: "rgba(190, 28, 28, 0.18)",
        textColor: "#FF7D7D",
      };

    case "complication":
      return {
        label: "Complication",
        icon: "◇",
        borderColor: "rgba(255, 188, 92, 0.6)",
        backgroundColor: "rgba(190, 114, 36, 0.16)",
        textColor: "#FFC978",
      };

    case "neutral":
    default:
      return {
        label: "Résultat",
        icon: "◆",
        borderColor: "rgba(232, 200, 120, 0.48)",
        backgroundColor: "rgba(232, 200, 120, 0.12)",
        textColor: "#E8C878",
      };
  }
}

export function buildRoll3DResultSkinEvents(
  presentation: Roll3DResultPresentation,
): Roll3DResultSkinEvents {
  const highlightedEvents = getHighlightedEvents(presentation);

  return {
    tone: presentation.tone,
    intensity: getPrimaryIntensity(presentation),
    revealAnimation: getRevealAnimation(presentation),
    particlePreset: getParticlePreset(presentation),
    hapticPattern: getHapticPattern(presentation),
    soundCue: getSoundCue(presentation),
    highlightedEvents,
    skinTags: buildSkinTags(presentation, highlightedEvents),
  };
}
