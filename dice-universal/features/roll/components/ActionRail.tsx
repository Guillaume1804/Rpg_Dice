import { Pressable, ScrollView, Text, View } from "react-native";

export type ActionRailItem = {
    id: string;
    name: string;
    detail: string;
};

type ActionRailProps = {
    profileName: string | null;
    actions: ActionRailItem[];
    selectedActionId: string | null;
    onPrepareAction: (actionId: string) => void;
};

export function ActionRail({
    profileName,
    actions,
    selectedActionId,
    onPrepareAction,
}: ActionRailProps) {
    if (!profileName) return null;

    return (
        <View
            style={{
                padding: 14,
                borderWidth: 1,
                borderRadius: 18,
                gap: 12,
            }}
        >
            <View style={{ gap: 4 }}>
                <Text style={{ opacity: 0.62, fontSize: 12, fontWeight: "800" }}>
                    Actions rapides
                </Text>

                <Text style={{ fontSize: 18, fontWeight: "900" }}>
                    Actions de {profileName}
                </Text>
            </View>

            {actions.length === 0 ? (
                <Text style={{ opacity: 0.68, lineHeight: 20 }}>
                    Ce profil n’a encore aucune action. Tu peux en créer depuis l’écran de
                    table.
                </Text>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        gap: 10,
                        paddingRight: 4,
                    }}
                >
                    {actions.map((action) => {
                        const isSelected = selectedActionId === action.id;

                        return (
                            <Pressable
                                key={action.id}
                                onPress={() => onPrepareAction(action.id)}
                                style={{
                                    width: 150,
                                    minHeight: 92,
                                    padding: 12,
                                    borderWidth: 1,
                                    borderRadius: 16,
                                    justifyContent: "space-between",
                                    opacity: isSelected ? 1 : 0.82,
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontSize: 16,
                                        fontWeight: "900",
                                    }}
                                >
                                    {action.name}
                                </Text>

                                <Text
                                    numberOfLines={2}
                                    style={{
                                        marginTop: 8,
                                        opacity: 0.72,
                                        lineHeight: 18,
                                    }}
                                >
                                    {action.detail}
                                </Text>

                                {isSelected ? (
                                    <Text
                                        style={{
                                            marginTop: 8,
                                            fontSize: 12,
                                            fontWeight: "800",
                                        }}
                                    >
                                        Prêt à lancer
                                    </Text>
                                ) : null}
                            </Pressable>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}