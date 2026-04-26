// dice-universal/features/rules/ruleWizard/CreateRuleWizardModal.tsx

import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorCatalog";
import type { RuleWizardDraft, RuleWizardScope, RuleWizardStep } from "./types";

import { RULE_BEHAVIORS } from "../../../core/rules/behaviorRegistry";

type Props = {
    visible: boolean;
    step: RuleWizardStep;
    stepIndex: number;
    totalSteps: number;
    draft: RuleWizardDraft;
    error: string | null;

    onClose: () => void;
    onBack: () => void;
    onNext: () => void;
    onSubmit: () => void;

    onUpdateDraft: <K extends keyof RuleWizardDraft>(
        key: K,
        value: RuleWizardDraft[K],
    ) => void;

    onSetScope: (scope: RuleWizardScope) => void;
    onSetBehaviorKey: (behaviorKey: RuleBehaviorKey) => void;
    onUpdateRangeRow: (
        index: number,
        key: "min" | "max" | "label",
        value: string,
    ) => void;
    onAddRangeRow: () => void;
    onRemoveRangeRow: (index: number) => void;

    previewValuesText: string;
    previewSidesText: string;
    previewModifierText: string;
    previewSignText: "1" | "-1";
    previewResult: unknown | null;

    onChangePreviewValuesText: (value: string) => void;
    onChangePreviewSidesText: (value: string) => void;
    onChangePreviewModifierText: (value: string) => void;
    onChangePreviewSignText: (value: "1" | "-1") => void;
};

export function CreateRuleWizardModal({
    visible,
    step,
    stepIndex,
    totalSteps,
    draft,
    error,
    onClose,
    onBack,
    onNext,
    onSubmit,
    onUpdateDraft,
    onSetScope,
    onSetBehaviorKey,
    onUpdateRangeRow,
    onAddRangeRow,
    onRemoveRangeRow,

    previewValuesText,
    previewSidesText,
    previewModifierText,
    previewSignText,
    previewResult,
    onChangePreviewValuesText,
    onChangePreviewSidesText,
    onChangePreviewModifierText,
    onChangePreviewSignText,
}: Props) {
    if (!visible) return null;

    const isLastStep = stepIndex === totalSteps - 1;

    const selectedBehavior = RULE_BEHAVIORS.find(
        (behavior) => behavior.key === draft.behaviorKey,
    );

    const scopeOptions = [
        {
            key: "entry",
            label: "Un dé / une entrée",
            description: "Ex: 1d20 contre une difficulté.",
        },
        {
            key: "group",
            label: "Une action complète",
            description: "Ex: pool de dés ou somme globale.",
        },
        {
            key: "both",
            label: "Les deux",
            description: "Règle utilisable dans les deux contextes.",
        },
    ].filter((option) =>
        selectedBehavior
            ? selectedBehavior.allowedScopes.includes(option.key as RuleWizardScope)
            : true,
    );

    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 20,
            }}
        >
            <View
                style={{
                    backgroundColor: "white",
                    borderRadius: 14,
                    padding: 16,
                    gap: 12,
                    maxHeight: "92%",
                }}
            >
                <Text style={{ fontSize: 18, fontWeight: "800" }}>
                    Créer une règle
                </Text>

                <Text style={{ opacity: 0.7 }}>
                    Étape {stepIndex + 1}/{totalSteps}
                </Text>

                {error ? <Text style={{ color: "#b00020" }}>{error}</Text> : null}

                <ScrollView contentContainerStyle={{ gap: 12 }}>
                    {step === "name" ? (
                        <>
                            <Text style={{ fontWeight: "700" }}>Nom de la règle</Text>
                            <TextInput
                                value={draft.name}
                                onChangeText={(value) => onUpdateDraft("name", value)}
                                placeholder="Ex: Test D20 difficulté 15"
                                style={{
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                    fontSize: 16,
                                }}
                            />
                        </>
                    ) : null}

                    {step === "scope" ? (
                        <>
                            <Text style={{ fontWeight: "700" }}>Cette règle s’applique à quoi ?</Text>

                            {scopeOptions.map((option) => (
                                <Pressable
                                    key={option.key}
                                    onPress={() => onSetScope(option.key as RuleWizardScope)}
                                    style={{
                                        padding: 12,
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        opacity: draft.scope === option.key ? 1 : 0.7,
                                        gap: 4,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontWeight: draft.scope === option.key ? "800" : "600",
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                    <Text style={{ opacity: 0.7 }}>{option.description}</Text>
                                </Pressable>
                            ))}
                        </>
                    ) : null}

                    {step === "dice" ? (
                        <>
                            <Text style={{ fontWeight: "700" }}>Dés compatibles</Text>
                            <Text style={{ opacity: 0.7 }}>
                                Écris une liste séparée par des virgules, ou “all” pour tous les dés.
                            </Text>

                            <TextInput
                                value={draft.supportedSidesText}
                                editable={!selectedBehavior?.supportedSides}
                                onChangeText={(value) =>
                                    onUpdateDraft("supportedSidesText", value)
                                }
                                placeholder="Ex: 20 ou 6,10,100 ou all"
                                style={{
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                    fontSize: 16,
                                }}
                            />
                            {selectedBehavior?.supportedSides ? (
                                <Text style={{ opacity: 0.6 }}>
                                    Déterminé automatiquement par le comportement sélectionné.
                                </Text>
                            ) : null}
                        </>
                    ) : null}

                    {step === "behavior" ? (
                        <>
                            <Text style={{ fontWeight: "700" }}>Comportement</Text>

                            {RULE_BEHAVIORS.map((option) => (
                                <Pressable
                                    key={option.key}
                                    onPress={() => onSetBehaviorKey(option.key)}
                                    style={{
                                        padding: 12,
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        opacity: draft.behaviorKey === option.key ? 1 : 0.7,
                                        gap: 4,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontWeight:
                                                draft.behaviorKey === option.key ? "800" : "600",
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                    <Text style={{ opacity: 0.7 }}>{option.description}</Text>
                                </Pressable>
                            ))}

                            {selectedBehavior ? (
                                <>
                                    {selectedBehavior.fields.map((field) => {
                                        if (field.type === "text" || field.type === "number") {
                                            return (
                                                <View key={field.key} style={{ gap: 6 }}>
                                                    <Text style={{ fontWeight: "700" }}>{field.label}</Text>

                                                    <TextInput
                                                        value={String(draft[field.key as keyof RuleWizardDraft] ?? "")}
                                                        onChangeText={(value) =>
                                                            onUpdateDraft(
                                                                field.key as keyof RuleWizardDraft,
                                                                value as RuleWizardDraft[keyof RuleWizardDraft],
                                                            )
                                                        }
                                                        placeholder={field.placeholder}
                                                        keyboardType={field.type === "number" ? "number-pad" : "default"}
                                                        style={{
                                                            borderWidth: 1,
                                                            borderRadius: 10,
                                                            paddingHorizontal: 12,
                                                            paddingVertical: 10,
                                                        }}
                                                    />
                                                </View>
                                            );
                                        }

                                        if (field.type === "select") {
                                            return (
                                                <View key={field.key} style={{ gap: 6 }}>
                                                    <Text style={{ fontWeight: "700" }}>{field.label}</Text>

                                                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                                                        {field.options.map((option) => (
                                                            <Pressable
                                                                key={option.value}
                                                                onPress={() =>
                                                                    onUpdateDraft(
                                                                        field.key as keyof RuleWizardDraft,
                                                                        option.value as RuleWizardDraft[keyof RuleWizardDraft],
                                                                    )
                                                                }
                                                                style={{
                                                                    padding: 10,
                                                                    borderWidth: 1,
                                                                    borderRadius: 10,
                                                                    opacity:
                                                                        draft[field.key as keyof RuleWizardDraft] === option.value
                                                                            ? 1
                                                                            : 0.7,
                                                                }}
                                                            >
                                                                <Text
                                                                    style={{
                                                                        fontWeight:
                                                                            draft[field.key as keyof RuleWizardDraft] === option.value
                                                                                ? "800"
                                                                                : "500",
                                                                    }}
                                                                >
                                                                    {option.label}
                                                                </Text>
                                                            </Pressable>
                                                        ))}
                                                    </View>
                                                </View>
                                            );
                                        }

                                        if (field.type === "ranges") {
                                            return (
                                                <View key={field.key} style={{ gap: 8 }}>
                                                    <Text style={{ fontWeight: "700" }}>{field.label}</Text>

                                                    {draft.ranges.map((row, index) => (
                                                        <View
                                                            key={`range-${index}`}
                                                            style={{
                                                                borderWidth: 1,
                                                                borderRadius: 10,
                                                                padding: 10,
                                                                gap: 8,
                                                            }}
                                                        >
                                                            <Text style={{ fontWeight: "700" }}>Plage {index + 1}</Text>

                                                            <View style={{ flexDirection: "row", gap: 8 }}>
                                                                <TextInput
                                                                    value={row.min}
                                                                    onChangeText={(value) =>
                                                                        onUpdateRangeRow(index, "min", value)
                                                                    }
                                                                    placeholder="Min"
                                                                    keyboardType="number-pad"
                                                                    style={{
                                                                        flex: 1,
                                                                        borderWidth: 1,
                                                                        borderRadius: 10,
                                                                        paddingHorizontal: 10,
                                                                        paddingVertical: 8,
                                                                    }}
                                                                />

                                                                <TextInput
                                                                    value={row.max}
                                                                    onChangeText={(value) =>
                                                                        onUpdateRangeRow(index, "max", value)
                                                                    }
                                                                    placeholder="Max"
                                                                    keyboardType="number-pad"
                                                                    style={{
                                                                        flex: 1,
                                                                        borderWidth: 1,
                                                                        borderRadius: 10,
                                                                        paddingHorizontal: 10,
                                                                        paddingVertical: 8,
                                                                    }}
                                                                />
                                                            </View>

                                                            <TextInput
                                                                value={row.label}
                                                                onChangeText={(value) =>
                                                                    onUpdateRangeRow(index, "label", value)
                                                                }
                                                                placeholder="Label"
                                                                style={{
                                                                    borderWidth: 1,
                                                                    borderRadius: 10,
                                                                    paddingHorizontal: 10,
                                                                    paddingVertical: 8,
                                                                }}
                                                            />

                                                            <Pressable onPress={() => onRemoveRangeRow(index)}>
                                                                <Text style={{ opacity: 0.7 }}>Supprimer cette plage</Text>
                                                            </Pressable>
                                                        </View>
                                                    ))}

                                                    <Pressable
                                                        onPress={onAddRangeRow}
                                                        style={{
                                                            padding: 10,
                                                            borderWidth: 1,
                                                            borderRadius: 10,
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <Text style={{ fontWeight: "700" }}>+ Ajouter une plage</Text>
                                                    </Pressable>
                                                </View>
                                            );
                                        }

                                        return null;
                                    })}
                                </>
                            ) : null}
                        </>
                    ) : null}

                    {step === "summary" ? (
                        <>
                            <Text style={{ fontWeight: "700" }}>Résumé</Text>
                            <Text>Nom : {draft.name}</Text>
                            <Text>Portée : {draft.scope}</Text>
                            <Text>Dés : {draft.supportedSidesText}</Text>
                            <Text>Comportement : {draft.behaviorKey ?? "—"}</Text>
                        </>
                    ) : null}

                    <View
                        style={{
                            borderWidth: 1,
                            borderRadius: 10,
                            padding: 12,
                            gap: 8,
                        }}
                    >
                        <Text style={{ fontWeight: "800" }}>Test rapide</Text>

                        <TextInput
                            value={previewValuesText}
                            onChangeText={onChangePreviewValuesText}
                            placeholder="Valeurs, ex: 12 ou 5,6,2"
                            style={{
                                borderWidth: 1,
                                borderRadius: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                            }}
                        />

                        <TextInput
                            value={previewSidesText}
                            onChangeText={onChangePreviewSidesText}
                            placeholder="Faces du dé, ex: 20"
                            keyboardType="number-pad"
                            style={{
                                borderWidth: 1,
                                borderRadius: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                            }}
                        />

                        <TextInput
                            value={previewModifierText}
                            onChangeText={onChangePreviewModifierText}
                            placeholder="Modificateur"
                            keyboardType="numbers-and-punctuation"
                            style={{
                                borderWidth: 1,
                                borderRadius: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                            }}
                        />

                        <View style={{ flexDirection: "row", gap: 8 }}>
                            {[
                                { key: "1", label: "Positif" },
                                { key: "-1", label: "Négatif" },
                            ].map((option) => (
                                <Pressable
                                    key={option.key}
                                    onPress={() => onChangePreviewSignText(option.key as "1" | "-1")}
                                    style={{
                                        padding: 10,
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        opacity: previewSignText === option.key ? 1 : 0.7,
                                    }}
                                >
                                    <Text style={{ fontWeight: previewSignText === option.key ? "800" : "500" }}>
                                        {option.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <Text style={{ fontWeight: "700" }}>Résultat</Text>

                        <Text style={{ opacity: 0.75 }}>
                            {previewResult ? JSON.stringify(previewResult, null, 2) : "Aucun résultat testable."}
                        </Text>
                    </View>
                </ScrollView>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        gap: 8,
                    }}
                >
                    <Pressable
                        onPress={onClose}
                        style={{
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderWidth: 1,
                            borderRadius: 10,
                        }}
                    >
                        <Text>Annuler</Text>
                    </Pressable>

                    <View style={{ flexDirection: "row", gap: 8 }}>
                        {stepIndex > 0 ? (
                            <Pressable
                                onPress={onBack}
                                style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 12,
                                    borderWidth: 1,
                                    borderRadius: 10,
                                }}
                            >
                                <Text>Retour</Text>
                            </Pressable>
                        ) : null}

                        <Pressable
                            onPress={isLastStep ? onSubmit : onNext}
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                borderWidth: 1,
                                borderRadius: 10,
                            }}
                        >
                            <Text style={{ fontWeight: "800" }}>
                                {isLastStep ? "Créer" : "Suivant"}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}