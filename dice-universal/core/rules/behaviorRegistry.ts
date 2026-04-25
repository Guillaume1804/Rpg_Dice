// dice-universal/core/rules/behaviorRegistry.ts

import type { RuleBehaviorKey } from "./behaviorCatalog";

export type RuleBehaviorField =
    | {
        key: string;
        label: string;
        type: "text" | "number";
        defaultValue: string;
        placeholder?: string;
    }
    | {
        key: string;
        label: string;
        type: "select";
        defaultValue: string;
        options: { value: string; label: string }[];
    }
    | {
        key: string;
        label: string;
        type: "ranges";
        defaultValue: { min: string; max: string; label: string }[];
    };

export type RuleBehaviorRegistryItem = {
    key: RuleBehaviorKey;
    label: string;
    description: string;
    kind: string;
    defaultScope: "entry" | "group" | "both";
    allowedScopes: ("entry" | "group" | "both")[];
    supportedSides: number[] | null;
    fields: RuleBehaviorField[];
};

export const RULE_BEHAVIORS: RuleBehaviorRegistryItem[] = [
    {
        key: "sum_total",
        label: "Somme simple",
        description: "Additionne les dés et les modificateurs.",
        kind: "sum",
        defaultScope: "entry",
        allowedScopes: ["entry", "group", "both"],
        supportedSides: null,
        fields: [],
    },
    {
        key: "single_check",
        label: "Test avec seuil",
        description: "Compare un résultat à un seuil de réussite.",
        kind: "single_check",
        defaultScope: "entry",
        allowedScopes: ["entry", "group", "both"],
        supportedSides: null,
        fields: [
            {
                key: "compare",
                label: "Type de comparaison",
                type: "select",
                defaultValue: "gte",
                options: [
                    { value: "gte", label: "≥ seuil" },
                    { value: "lte", label: "≤ seuil" },
                ],
            },
            {
                key: "successThreshold",
                label: "Seuil de réussite",
                type: "number",
                defaultValue: "",
                placeholder: "Ex: 15",
            },
            {
                key: "critSuccessFaces",
                label: "Faces de réussite critique",
                type: "text",
                defaultValue: "20",
                placeholder: "Ex: 20",
            },
            {
                key: "critFailureFaces",
                label: "Faces d’échec critique",
                type: "text",
                defaultValue: "1",
                placeholder: "Ex: 1",
            },
        ],
    },
    {
        key: "success_pool",
        label: "Pool de succès",
        description: "Compte les dés qui atteignent un seuil.",
        kind: "success_pool",
        defaultScope: "group",
        allowedScopes: ["group", "both"],
        supportedSides: null,
        fields: [
            {
                key: "successAtOrAbove",
                label: "Succès à partir de",
                type: "number",
                defaultValue: "5",
                placeholder: "Ex: 5",
            },
            {
                key: "failFaces",
                label: "Faces d’échec spécial",
                type: "text",
                defaultValue: "1",
                placeholder: "Ex: 1",
            },
            {
                key: "glitchRule",
                label: "Règle de complication",
                type: "select",
                defaultValue: "ones_gt_successes",
                options: [
                    { value: "none", label: "Aucune" },
                    { value: "ones_gt_successes", label: "1 > succès" },
                    { value: "ones_gte_successes", label: "1 ≥ succès" },
                ],
            },
        ],
    },
    {
        key: "table_lookup",
        label: "Table de résultats",
        description: "Associe une plage de valeurs à un résultat texte.",
        kind: "table_lookup",
        defaultScope: "entry",
        allowedScopes: ["entry", "group", "both"],
        supportedSides: null,
        fields: [
            {
                key: "ranges",
                label: "Plages de résultats",
                type: "ranges",
                defaultValue: [
                    { min: "1", max: "3", label: "Bas" },
                    { min: "4", max: "6", label: "Moyen" },
                    { min: "7", max: "10", label: "Haut" },
                ],
            },
        ],
    },
    {
        key: "banded_sum",
        label: "Résultat par paliers",
        description: "Interprète une somme selon des plages.",
        kind: "banded_sum",
        defaultScope: "group",
        allowedScopes: ["group", "both"],
        supportedSides: null,
        fields: [
            {
                key: "ranges",
                label: "Plages de résultats",
                type: "ranges",
                defaultValue: [
                    { min: "1", max: "3", label: "Bas" },
                    { min: "4", max: "6", label: "Moyen" },
                    { min: "7", max: "10", label: "Haut" },
                ],
            },
        ],
    },
    {
        key: "keep_highest_n",
        label: "Garder les meilleurs dés",
        description: "Lance plusieurs dés et garde les plus hauts.",
        kind: "keep_highest_n",
        defaultScope: "group",
        allowedScopes: ["group", "both"],
        supportedSides: null,
        fields: [
            {
                key: "keepCount",
                label: "Nombre de dés à garder",
                type: "number",
                defaultValue: "2",
            },
            {
                key: "resultMode",
                label: "Mode de résultat",
                type: "select",
                defaultValue: "sum",
                options: [
                    { value: "sum", label: "Somme" },
                    { value: "values", label: "Liste de valeurs" },
                ],
            },
        ],
    },
    {
        key: "keep_lowest_n",
        label: "Garder les plus faibles dés",
        description: "Lance plusieurs dés et garde les plus bas.",
        kind: "keep_lowest_n",
        defaultScope: "group",
        allowedScopes: ["group", "both"],
        supportedSides: null,
        fields: [
            {
                key: "keepCount",
                label: "Nombre de dés à garder",
                type: "number",
                defaultValue: "2",
            },
            {
                key: "resultMode",
                label: "Mode de résultat",
                type: "select",
                defaultValue: "sum",
                options: [
                    { value: "sum", label: "Somme" },
                    { value: "values", label: "Liste de valeurs" },
                ],
            },
        ],
    },
    {
        key: "drop_highest_n",
        label: "Retirer les meilleurs dés",
        description: "Ignore les dés les plus hauts.",
        kind: "drop_highest_n",
        defaultScope: "group",
        allowedScopes: ["group", "both"],
        supportedSides: null,
        fields: [
            {
                key: "dropCount",
                label: "Nombre de dés à retirer",
                type: "number",
                defaultValue: "1",
            },
            {
                key: "resultMode",
                label: "Mode de résultat",
                type: "select",
                defaultValue: "sum",
                options: [
                    { value: "sum", label: "Somme" },
                    { value: "values", label: "Liste de valeurs" },
                ],
            },
        ],
    },
    {
        key: "drop_lowest_n",
        label: "Retirer les plus faibles dés",
        description: "Ignore les dés les plus bas.",
        kind: "drop_lowest_n",
        defaultScope: "group",
        allowedScopes: ["group", "both"],
        supportedSides: null,
        fields: [
            {
                key: "dropCount",
                label: "Nombre de dés à retirer",
                type: "number",
                defaultValue: "1",
            },
            {
                key: "resultMode",
                label: "Mode de résultat",
                type: "select",
                defaultValue: "sum",
                options: [
                    { value: "sum", label: "Somme" },
                    { value: "values", label: "Liste de valeurs" },
                ],
            },
        ],
    },
];

export function getRuleBehaviorDefinition(key: RuleBehaviorKey) {
    return RULE_BEHAVIORS.find((behavior) => behavior.key === key) ?? null;
}