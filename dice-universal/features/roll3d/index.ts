// dice-universal/features/roll3d/index.ts

export { DiceTable3D } from "./components/DiceTable3D";
export { Roll3DDiceSelector } from "./components/Roll3DDiceSelector";
export { Roll3DLauncherSurface } from "./components/Roll3DLauncherSurface";
export { Roll3DRollButton } from "./components/Roll3DRollButton";
export { Roll3DResultOverlay } from "./components/Roll3DResultOverlay";

export { useRoll3DLauncher } from "./hooks/useRoll3DLauncher";

export { Roll3DPhysicsWorld } from "./physics/Roll3DPhysicsWorld";

export type {
  Roll3DPhysicsBodyDescriptor,
  Roll3DPhysicsBodyId,
  Roll3DPhysicsBodyKind,
  Roll3DPhysicsDieBody,
  Roll3DPhysicsDieSnapshot,
  Roll3DPhysicsQuaternion,
  Roll3DPhysicsStaticBody,
  Roll3DPhysicsTransform,
  Roll3DPhysicsVector3,
} from "./physics/Roll3DPhysicsTypes";

export { STANDARD_ROLL_3D_DICE } from "./constants";

export type {
  Roll3DD100DisplayMode,
  Roll3DDraft,
  Roll3DDieBehaviorRef,
  Roll3DDieInstance,
  Roll3DDieResult,
  Roll3DDieSides,
  Roll3DDieSign,
  Roll3DDieSkinId,
  Roll3DDieSource,
  Roll3DDieVisualState,
  Roll3DRollSummary,
} from "./types";
