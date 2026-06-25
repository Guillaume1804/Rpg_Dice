// dice-universal/features/preparation/model/preparationUiModel.ts

export type PreparedRoll =
    | {
        source: "free";
    }
    | {
        source: "action";
        profileId: string;
        groupId: string;
        label: string;
    }
    | {
        source: "action_draft";
        profileId: string;
        groupId: string;
        draftGroupId: string;
        label: string;
    };