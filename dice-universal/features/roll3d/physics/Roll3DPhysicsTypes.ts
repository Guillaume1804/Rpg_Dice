// dice-universal/features/roll3d/physics/Roll3DPhysicsTypes.ts

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
  transform: Roll3DPhysicsTransform;
  sleeping: boolean;
};
