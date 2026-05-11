import { Pressable, Text, View } from "react-native";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

type SessionBarProps = {
    tableName: string | null;
    activeProfileName: string | null;
    hasActiveTable: boolean;
    profileCount: number;
    onPressProfile: () => void;
    onClearTable: () => void | Promise<void>;
};

export function SessionBar({
    tableName,
    activeProfileName,
    hasActiveTable,
    profileCount,
    onPressProfile,
    onClearTable,
}: SessionBarProps) {
    const displayTableName = tableName ?? "Mode libre";
    const displayProfileName = activeProfileName ?? "Aucun profil";

    const canCycleProfile = hasActiveTable && profileCount > 1;

    return (
        <View
            style={{
                ...arcaneStyles.card,
                gap: arcane.spacing.md,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    gap: arcane.spacing.sm,
                    alignItems: "stretch",
                }}
            >
                <View
                    style={{
                        flex: 1,
                        ...arcaneStyles.cardSoft,
                        gap: arcane.spacing.xs,
                    }}
                >
                    <Text
                        style={{
                            color: arcane.colors.textSubtle,
                            fontSize: arcane.typography.tiny,
                            fontWeight: "800",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                        }}
                    >
                        Session
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={{
                            color: arcane.colors.text,
                            fontSize: 18,
                            fontWeight: "900",
                        }}
                    >
                        {displayTableName}
                    </Text>
                </View>

                <Pressable
                    onPress={onPressProfile}
                    disabled={!canCycleProfile}
                    style={({ pressed }) => ({
                        flex: 1,
                        ...arcaneStyles.cardSoft,
                        gap: arcane.spacing.xs,
                        opacity: !hasActiveTable ? 0.68 : pressed ? 0.86 : 1,
                        transform: [{ scale: pressed && canCycleProfile ? 0.98 : 1 }],
                    })}
                >
                    <Text
                        style={{
                            color: arcane.colors.textSubtle,
                            fontSize: arcane.typography.tiny,
                            fontWeight: "800",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                        }}
                    >
                        Profil actif
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={{
                            color: arcane.colors.text,
                            fontSize: 18,
                            fontWeight: "900",
                        }}
                    >
                        {displayProfileName}
                        {canCycleProfile ? " ▾" : ""}
                    </Text>
                </Pressable>
            </View>

            {hasActiveTable ? (
                <Pressable
                    onPress={onClearTable}
                    style={({ pressed }) => ({
                        alignSelf: "flex-start",
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderColor: arcane.colors.border,
                        borderRadius: arcane.radius.pill,
                        backgroundColor: pressed
                            ? arcane.colors.surfaceSoft
                            : arcane.colors.surfaceAlt,
                        opacity: pressed ? 0.86 : 1,
                    })}
                >
                    <Text
                        style={{
                            color: arcane.colors.textMuted,
                            fontWeight: "800",
                        }}
                    >
                        Quitter la table
                    </Text>
                </Pressable>
            ) : (
                <Text
                    style={{
                        color: arcane.colors.textMuted,
                        lineHeight: 20,
                    }}
                >
                    Lance des dés librement ou active une table pour retrouver tes profils
                    et actions.
                </Text>
            )}
        </View>
    );
}