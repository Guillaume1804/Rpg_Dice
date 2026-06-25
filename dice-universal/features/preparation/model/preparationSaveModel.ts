// dice-universal/features/preparation/model/preparationSaveModel.ts

export type PreparationSaveTarget = {
    table: {
        id: string;
        name: string;
        is_system: number;
    };
    profiles: {
        id: string;
        name: string;
    }[];
};

export type PreparationSaveMode =
    | "new_table_new_profile"
    | "existing_table_new_profile"
    | "existing_table_existing_profile";

export type PreparationSaveTargetParams = {
    mode: PreparationSaveMode;
    tableName?: string;
    profileName?: string;
    tableId?: string;
    profileId?: string;
};