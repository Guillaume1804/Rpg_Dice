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

export type Roll3DDieBehaviorRef = {
  id: string;
  label: string;
  kind: string;
};

export type Roll3DDieInstance = {
  id: string;
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
};

export type Roll3DDraft = {
  id: string;
  createdAt: number;
  updatedAt: number;
  dice: Roll3DDieInstance[];
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

  /**
   * Résultat officiel produit par le moteur Dice Universal.
   * Roll3D garde son modèle d’affichage, mais le calcul vient du moteur central.
   */
  officialResult: GroupRollResult;
};
