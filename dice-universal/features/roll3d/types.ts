// dice-universal/features/roll3d/types.ts

import type { GroupRollResult } from "../../core/roll/roll";

export type Roll3DDieSides = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export type Roll3DDieVisualState =
  | "idle"
  | "selected"
  | "dropping"
  | "rolling"
  | "settled"
  | "highlighted";

export type Roll3DDieSkinId =
  | "graphite_default"
  | "dragon"
  | "arcane"
  | "metal"
  | "cosmic";

export type Roll3DD100DisplayMode = "percentile_pair" | "single_oracle";

export type Roll3DDieSign = 1 | -1;

export type Roll3DDieSource = "free" | "prepared" | "action";

export type Roll3DActionEntryInsertMode = "replace" | "append";

export type Roll3DBehaviorParamsOverride = Record<string, unknown>;

export type Roll3DBehaviorParamsTarget = "entry" | "group" | null;

export type Roll3DActionEntryValueSourceKind =
  | "manual"
  | "character_attribute"
  | "character_skill"
  | "character_attribute_plus_skill"
  | "difficulty"
  | "opposition"
  | "temporary_bonus"
  | "temporary_malus"
  | "advantage"
  | "disadvantage";

export type Roll3DActionEntryValueSource = {
  id: string;
  kind: Roll3DActionEntryValueSourceKind;

  /**
   * Label lisible côté UI.
   * Exemples :
   * - Force
   * - Épée
   * - Difficulté MJ
   * - Défense adverse
   * - Bonus temporaire
   */
  label: string;

  /**
   * Valeur manuelle aujourd’hui.
   * Demain, cette valeur pourra venir d’une feuille de personnage connectée.
   */
  value?: number | null;

  /**
   * Clé externe future pour l’app de feuilles modulaires.
   * Exemples :
   * - attributes.strength
   * - skills.sword
   * - target.defense
   */
  externalKey?: string | null;
};

export type Roll3DEntryPresentationMeta = {
  actionId?: string | null;
  actionName?: string | null;
  savedEntryId?: string | null;
  entryLabel?: string | null;
  technicalLabel?: string | null;
};

export type Roll3DActionEntryAdjustment = {
  actionId: string;
  entryId: string;

  actionName: string;
  entryLabel: string;
  technicalLabel: string;
  detail: string;

  sides: Roll3DDieSides;
  qty: number;
  modifier: number;
  sign: Roll3DDieSign;

  behavior: Roll3DDieBehaviorRef | null;
  groupBehavior: Roll3DDieBehaviorRef | null;

  /**
   * Cible du comportement ajustable dans Roll3D.
   * - entry : comportement porté par l’entrée
   * - group : comportement porté par l’action/groupe
   * - null : aucun comportement configurable
   */
  behaviorParamsTarget?: Roll3DBehaviorParamsTarget;

  /**
   * Paramètres temporaires du comportement pour le lancer en cours.
   * Non sauvegardés en base.
   *
   * Exemple :
   * - success_threshold: 15
   * - target_value: 65
   * - degree_step: 10
   * - keep: 2
   */
  behaviorParamsOverride?: Roll3DBehaviorParamsOverride;

  /**
   * Préparation future :
   * valeur manuelle aujourd’hui, attribut/compétence/opposition demain.
   */
  valueSources?: Roll3DActionEntryValueSource[];
};

export type Roll3DRuleRef = {
  id: string;
  name: string;
  kind: string;
  params_json: string;
};

export type Roll3DDieBehaviorRef = {
  id: string;
  label: string;
  kind: string;
  rule: Roll3DRuleRef;
};

export type Roll3DDieInstance = {
  id: string;
  rollEntryId: string;
  sides: Roll3DDieSides;
  createdAt: number;

  /**
   * Prépare les futurs jets Roll3D avancés :
   * +1d20, -1d6, d100+15, etc.
   */
  sign: Roll3DDieSign;
  modifier: number;

  /**
   * Pour plus tard :
   * comportement par dé, action sauvegardée, jet préparé, etc.
   */
  source: Roll3DDieSource;
  behavior: Roll3DDieBehaviorRef | null;

  /**
 * Métadonnées UI de l'entrée logique.
 * Elles ne servent pas au calcul, seulement à afficher correctement
 * le résultat : nom d'action, label d'entrée, formule technique, etc.
 */
  rollEntryMeta?: Roll3DEntryPresentationMeta | null;

  /**
   * Prépare la future connexion avec les feuilles de personnage :
   * attributs, compétences, difficultés, opposition, bonus/malus.
   * Non exploité en V1 immédiate, mais le modèle Roll3D est prêt.
   */
  valueSources?: Roll3DActionEntryValueSource[];
};

export type Roll3DDraft = {
  id: string;
  createdAt: number;
  updatedAt: number;
  dice: Roll3DDieInstance[];
  groupBehavior: Roll3DDieBehaviorRef | null;
};

export type Roll3DDieResult = {
  id: string;
  sides: Roll3DDieSides;
  value: number;
  sign: Roll3DDieSign;
  modifier: number;
  total: number;
};

export type Roll3DRollSummary = {
  id: string;
  createdAt: number;
  dice: Roll3DDieResult[];

  rawTotal: number;
  modifierTotal: number;
  total: number;

  presentationMeta?: {
    entries: Array<
      Roll3DEntryPresentationMeta & {
        rollEntryId: string;
        source: Roll3DDieSource;
      }
    >;
  };

  /**
   * Résultat officiel produit par le moteur Dice Universal.
   * Roll3D garde son modèle d’affichage, mais le calcul vient du moteur central.
   */
  officialResult: GroupRollResult;
};
