import { Pressable, Text, View } from "react-native";

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
                padding: 14,
                borderWidth: 1,
                borderRadius: 18,
                gap: 12,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "stretch",
                }}
            >
                <View
                    style={{
                        flex: 1,
                        padding: 12,
                        borderWidth: 1,
                        borderRadius: 14,
                        gap: 4,
                    }}
                >
                    <Text style={{ opacity: 0.62, fontSize: 12, fontWeight: "700" }}>
                        Session
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={{
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
                    style={{
                        flex: 1,
                        padding: 12,
                        borderWidth: 1,
                        borderRadius: 14,
                        gap: 4,
                        opacity: hasActiveTable ? 1 : 0.72,
                    }}
                >
                    <Text style={{ opacity: 0.62, fontSize: 12, fontWeight: "700" }}>
                        Profil actif
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={{
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
                    style={{
                        alignSelf: "flex-start",
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderRadius: 999,
                    }}
                >
                    <Text style={{ fontWeight: "700" }}>Quitter la table</Text>
                </Pressable>
            ) : (
                <Text style={{ opacity: 0.68, lineHeight: 20 }}>
                    Lance des dés librement ou active une table pour retrouver tes profils
                    et actions.
                </Text>
            )}
        </View>
    );
}