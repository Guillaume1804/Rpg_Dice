import type { Roll3DDieSides } from "../types";

export type Roll3DSceneVector3 = {
    x: number;
    y: number;
    z: number;
};

export type Roll3DSceneQuaternion = {
    x: number;
    y: number;
    z: number;
    w: number;
};

export type Roll3DSceneTransform = {
    position: Roll3DSceneVector3;
    quaternion?: Roll3DSceneQuaternion;
};

export type Roll3DSceneDie = {
    id: string;
    sides: Roll3DDieSides;
    skinId?: string;
    groupId?: string | null;
    lineId?: string | null;
    value?: number | null;
    transform?: Roll3DSceneTransform;
};

export type Roll3DSceneDiceValueTone =
    | "neutral"
    | "success"
    | "failure"
    | "critical"
    | "complication";

export type Roll3DSceneDiceValue = {
    dieId: string;
    value: number;
    label?: string;
    tone?: Roll3DSceneDiceValueTone;
};

export type Roll3DSceneHighlightReason =
    | "selected"
    | "grouped"
    | "success"
    | "failure"
    | "critical_success"
    | "critical_failure"
    | "complication"
    | "explosion"
    | "reroll"
    | "kept"
    | "dropped";

export type Roll3DSceneCommand =
    | {
        type: "load_scene";
        themeId?: string;
    }
    | {
        type: "set_theme";
        themeId: string;
    }
    | {
        type: "spawn_dice";
        dice: Roll3DSceneDie[];
        mode?: "drop" | "place" | "instant";
    }
    | {
        type: "clear_table";
    }
    | {
        type: "roll_dice";
        dieIds: string[];
        intensity?: number;
        mode?: "button" | "gesture" | "reroll" | "explosion";
    }
    | {
        type: "move_dice";
        dieIds: string[];
        transform: Roll3DSceneTransform;
    }
    | {
        type: "highlight_dice";
        dieIds: string[];
        reason: Roll3DSceneHighlightReason;
    }
    | {
        type: "show_values";
        values: Roll3DSceneDiceValue[];
    }
    | {
        type: "hide_values";
        dieIds?: string[];
    }
    | {
        type: "play_result_effect";
        effectId: string;
        dieIds?: string[];
        intensity?: "low" | "medium" | "high" | "legendary";
    };

export type Roll3DSceneEvent =
    | {
        type: "scene_ready";
    }
    | {
        type: "dice_spawned";
        dieIds: string[];
    }
    | {
        type: "dice_roll_started";
        dieIds: string[];
    }
    | {
        type: "dice_roll_settled";
        dieIds: string[];
    }
    | {
        type: "die_tapped";
        dieId: string;
    }
    | {
        type: "die_long_pressed";
        dieId: string;
    }
    | {
        type: "die_drag_started";
        dieId: string;
    }
    | {
        type: "die_drag_ended";
        dieId: string;
        transform?: Roll3DSceneTransform;
    }
    | {
        type: "dice_flicked";
        dieIds: string[];
        intensity?: number;
    }
    | {
        type: "group_gesture_detected";
        dieIds: string[];
    };