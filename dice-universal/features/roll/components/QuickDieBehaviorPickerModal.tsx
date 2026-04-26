// dice-universal/features/roll/components/QuickDieBehaviorPickerModal.tsx

import { View, Text, Pressable, ScrollView } from "react-native";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorCatalog";

type BehaviorOption = {
    behaviorKey: RuleBehaviorKey;
};

type BehaviorDefinition = {
    key: RuleBehaviorKey;
    label: string;
    description?: string;
    scope?: "entry" | "group" | "both";
};

type Props = {
    visible: boolean;
    editingDieSides: number | null;
    behaviors: BehaviorOption[];
    getDefinition: (behaviorKey: RuleBehaviorKey) => BehaviorDefinition | null;
    onSelectBehavior: (behaviorKey: RuleBehaviorKey) => void;
    onClose: () => void;
};

export function QuickDieBehaviorPickerModal({
    visible,
    editingDieSides,
    behaviors,
    getDefinition,
    onSelectBehavior,
    onClose,
}: Props) {
    if (!visible || editingDieSides === null) return null;

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
                }}
            >
                <Text style={{ fontSize: 18, fontWeight: "800" }}>
                    Configurer d{editingDieSides}
                </Text>

                <Text style={{ opacity: 0.7 }}>
                    Choisis un preset de règle compatible avec ce dé.
                </Text>

                <ScrollView
                    style={{ maxHeight: 320 }}
                    contentContainerStyle={{ gap: 8 }}
                    showsVerticalScrollIndicator={true}
                >
                    {behaviors.map((behavior) => {
                        const def = getDefinition(behavior.behaviorKey);
                        if (!def) return null;

                        return (
                            <Pressable
                                key={behavior.behaviorKey}
                                onPress={() => onSelectBehavior(behavior.behaviorKey)}
                                style={{
                                    padding: 12,
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    gap: 4,
                                }}
                            >
                                <Text style={{ fontWeight: "700" }}>{def.label}</Text>

                                {def.description ? (
                                    <Text style={{ opacity: 0.7 }}>{def.description}</Text>
                                ) : null}
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <Pressable
                    onPress={onClose}
                    style={{
                        marginTop: 4,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ opacity: 0.6 }}>Annuler</Text>
                </Pressable>
            </View>
        </View>
    );
}