import type {
    Roll3DSceneCommand,
    Roll3DSceneEvent,
} from "./roll3DSceneContract";

export type Roll3DEngineKind =
    | "three_cannon"
    | "unity"
    | "unreal"
    | "mock";

export type Roll3DEngineCapabilities = {
    supportsPhysics: boolean;
    supportsTouchPicking: boolean;
    supportsDieDragging: boolean;
    supportsGestureThrow: boolean;
    supportsInstancing: boolean;
    supportsAdvancedParticles: boolean;
    supportsDynamicEnvironments: boolean;
};

export type Roll3DEngineAdapterInfo = {
    kind: Roll3DEngineKind;
    label: string;
    version?: string;
    capabilities: Roll3DEngineCapabilities;
};

export type Roll3DEngineAdapter = {
    getInfo: () => Roll3DEngineAdapterInfo;
    dispatchCommand: (command: Roll3DSceneCommand) => void;
    subscribeToEvents: (
        listener: (event: Roll3DSceneEvent) => void,
    ) => () => void;
};