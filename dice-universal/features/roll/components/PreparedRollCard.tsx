import { Pressable, Text, View } from "react-native";

type PreparedRollCardProps = {
    title?: string;
    name: string | null;
    detail: string | null;
    isEmpty: boolean;
    onEdit?: () => void;
    onClear?: () => void;
    onSave?: () => void;
};

export function PreparedRollCard({
    title = "Jet préparé",
    name,
    detail,
    isEmpty,
    onEdit,
    onClear,
    onSave,
}: PreparedRollCardProps) {
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
                    {title}
                </Text>

                {isEmpty ? (
                    <>
                        <Text style={{ fontSize: 20, fontWeight: "900" }}>
                            Aucun jet sélectionné
                        </Text>

                        <Text style={{ opacity: 0.68, lineHeight: 20 }}>
                            Choisis un dé libre ou une action pour préparer ton prochain jet.
                        </Text>
                    </>
                ) : (
                    <>
                        <Text style={{ fontSize: 22, fontWeight: "900" }}>
                            {name ?? "Jet"}
                        </Text>

                        {detail ? (
                            <Text style={{ opacity: 0.76, fontSize: 15, lineHeight: 21 }}>
                                {detail}
                            </Text>
                        ) : null}
                    </>
                )}
            </View>

            {!isEmpty ? (
                <View
                    style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                    }}
                >
                    {onEdit ? (
                        <Pressable
                            onPress={onEdit}
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                borderWidth: 1,
                                borderRadius: 999,
                            }}
                        >
                            <Text style={{ fontWeight: "800" }}>Modifier</Text>
                        </Pressable>
                    ) : null}

                    {onClear ? (
                        <Pressable
                            onPress={onClear}
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                borderWidth: 1,
                                borderRadius: 999,
                            }}
                        >
                            <Text style={{ fontWeight: "800" }}>Vider</Text>
                        </Pressable>
                    ) : null}

                    {onSave ? (
                        <Pressable
                            onPress={onSave}
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                borderWidth: 1,
                                borderRadius: 999,
                            }}
                        >
                            <Text style={{ fontWeight: "800" }}>Sauvegarder</Text>
                        </Pressable>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
}