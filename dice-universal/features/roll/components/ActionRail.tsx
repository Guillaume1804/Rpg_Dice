import { Pressable, ScrollView, Text, View } from "react-native";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

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
                ...arcaneStyles.card,
                gap: arcane.spacing.md,
            }}
        >
            <View style={{ gap: arcane.spacing.xs }}>
                <Text
                    style={{
                        color: arcane.colors.textSubtle,
                        fontSize: arcane.typography.tiny,
                        fontWeight: "900",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                    }}
                >
                    Actions rapides
                </Text>

                <Text
                    style={{
                        color: arcane.colors.text,
                        fontSize: 18,
                        fontWeight: "900",
                    }}
                >
                    Actions de {profileName}
                </Text>
            </View>

            {actions.length === 0 ? (
                <Text
                    style={{
                        color: arcane.colors.textMuted,
                        lineHeight: 20,
                    }}
                >
                    Ce profil n’a encore aucune action. Tu peux en créer depuis l’écran de
                    table.
                </Text>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        gap: arcane.spacing.sm,
                        paddingRight: arcane.spacing.xs,
                    }}
                >
                    {actions.map((action) => {
                        const isSelected = selectedActionId === action.id;

                        return (
                            <Pressable
                                key={action.id}
                                onPress={() => onPrepareAction(action.id)}
                                style={({ pressed }) => ({
                                    width: 154,
                                    minHeight: 100,
                                    padding: arcane.spacing.md,
                                    borderWidth: 1,
                                    borderColor: isSelected
                                        ? arcane.colors.accent
                                        : arcane.colors.border,
                                    borderRadius: arcane.radius.lg,
                                    backgroundColor: isSelected
                                        ? arcane.colors.accentSoft
                                        : arcane.colors.surfaceAlt,
                                    justifyContent: "space-between",
                                    opacity: pressed ? 0.86 : isSelected ? 1 : 0.9,
                                    transform: [{ scale: pressed ? 0.97 : 1 }],
                                })}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        color: arcane.colors.text,
                                        fontSize: 16,
                                        fontWeight: "900",
                                    }}
                                >
                                    {action.name}
                                </Text>

                                <Text
                                    numberOfLines={2}
                                    style={{
                                        marginTop: arcane.spacing.sm,
                                        color: arcane.colors.textMuted,
                                        lineHeight: 18,
                                    }}
                                >
                                    {action.detail}
                                </Text>

                                {isSelected ? (
                                    <Text
                                        style={{
                                            marginTop: arcane.spacing.sm,
                                            color: arcane.colors.accent,
                                            fontSize: 12,
                                            fontWeight: "900",
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