import type { Roll3DDieInstance } from "../types";

export type Roll3DPhysicsBodyKind = "floor" | "wall" | "die";

export type Roll3DPhysicsBodyId = string;

export type Roll3DPhysicsDieBody = {
  id: Roll3DPhysicsBodyId;
  kind: "die";
  dieInstance: Roll3DDieInstance;
};

export type Roll3DPhysicsStaticBody = {
  id: Roll3DPhysicsBodyId;
  kind: "floor" | "wall";
};

export type Roll3DPhysicsBodyDescriptor =
  | Roll3DPhysicsDieBody
  | Roll3DPhysicsStaticBody;

export type Roll3DPhysicsVector3 = {
  x: number;
  y: number;
  z: number;
};

export type Roll3DPhysicsLaunchMode =
  | "drop"
  | "resting"
  | "surface_roll"
  | "gesture_throw";

export type Roll3DPhysicsAddDieOptions = {
  launchMode?: Roll3DPhysicsLaunchMode;

  /**
   * Vitesses personnalisées utilisées principalement par le lancer gestuel.
   * Lorsqu'elles sont absentes, Roll3DPhysicsWorld génère ses valeurs normales.
   */
  linearVelocity?: Roll3DPhysicsVector3;
  angularVelocity?: Roll3DPhysicsVector3;
};

export type Roll3DPhysicsQuaternion = {
  x: number;
  y: number;
  z: number;
  w: number;
};

export type Roll3DPhysicsTransform = {
  position: Roll3DPhysicsVector3;
  quaternion: Roll3DPhysicsQuaternion;
};

export type Roll3DPhysicsDieSnapshot = {
  id: Roll3DPhysicsBodyId;

  /**
   * Transform destiné au rendu.
   *
   * Il peut provenir des transforms interpolés de Cannon afin de découpler
   * visuellement le framerate graphique du timestep physique fixe.
   */
  transform: Roll3DPhysicsTransform;

  /**
   * État de sommeil natif Cannon.
   *
   * Physics V2 ne force plus artificiellement cet état : il sert pour
   * l'instant à savoir quand un cycle physique brut est terminé.
   */
  sleeping: boolean;
};

export type Roll3DPhysicsProfile = {
  solveMs: number;
  broadphaseMs: number;
  narrowphaseMs: number;
  integrateMs: number;
};
