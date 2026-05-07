import { Modal, Pressable, ScrollView, Text, View } from "react-native";

export type PreparedRollEditDie = {
    sides: number;
    qty: number;
    modifier?: number;
    sign?: number;
    ruleLabel?: string | null;
};

type PreparedRollEditSheetProps = {
    visible: boolean;
    title?: string;
    dice: PreparedRollEditDie[];
    onClose: () => void;
    onAdjustDieQty: (index: number, delta: number) => void;
    onEditDie: (index: number) => void;
    onRemoveDie: (index: number) => void;
};

function formatModifier(modifier?: number) {
    const safeModifier = Number.isFinite(modifier) ? Number(modifier) : 0;

    if (safeModifier === 0) return "";

    return ` ${safeModifier > 0 ? "+" : "-"} ${Math.abs(safeModifier)}`;
}

function formatDieLabel(die: PreparedRollEditDie) {
    const sign = die.sign === -1 ? "- " : "";
    return `${sign}${die.qty}d${die.sides}${formatModifier(die.modifier)}`;
}

export function PreparedRollEditSheet({
    visible,
    title = "Modifier le jet",
    dice,
    onClose,
    onAdjustDieQty,
    onEditDie,
    onRemoveDie,
}: PreparedRollEditSheetProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    justifyContent: "flex-end",
                }}
            >
                <View
                    style={{
                        maxHeight: "82%",
                        backgroundColor: "white",
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        padding: 16,
                        gap: 14,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 22, fontWeight: "900" }}>{title}</Text>

                            <Text style={{ marginTop: 4, opacity: 0.68, lineHeight: 20 }}>
                                Ajuste une ligne de dés sans reconstruire tout le jet.
                            </Text>
                        </View>

                        <Pressable
                            onPress={onClose}
                            style={{
                                width: 40,
                                height: 40,
                                borderWidth: 1,
                                borderRadius: 999,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text style={{ fontSize: 18, fontWeight: "900" }}>×</Text>
                        </Pressable>
                    </View>

                    {dice.length === 0 ? (
                        <View
                            style={{
                                padding: 14,
                                borderWidth: 1,
                                borderRadius: 16,
                            }}
                        >
                            <Text style={{ fontWeight: "800" }}>Aucun dé à modifier</Text>

                            <Text style={{ marginTop: 6, opacity: 0.68 }}>
                                Ajoute d’abord un dé libre depuis l’écran Jet.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            contentContainerStyle={{
                                gap: 10,
                                paddingBottom: 12,
                            }}
                            showsVerticalScrollIndicator={false}
                        >
                            {dice.map((die, index) => (
                                <View
                                    key={`prepared-die-${index}-${die.sides}`}
                                    style={{
                                        padding: 12,
                                        borderWidth: 1,
                                        borderRadius: 16,
                                        gap: 10,
                                    }}
                                >
                                    <View style={{ gap: 4 }}>
                                        <Text style={{ fontSize: 18, fontWeight: "900" }}>
                                            {formatDieLabel(die)}
                                        </Text>

                                        {die.ruleLabel ? (
                                            <Text style={{ opacity: 0.68 }}>
                                                {die.ruleLabel}
                                            </Text>
                                        ) : (
                                            <Text style={{ opacity: 0.68 }}>Somme simple</Text>
                                        )}
                                    </View>

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            flexWrap: "wrap",
                                            gap: 8,
                                            alignItems: "center",
                                        }}
                                    >
                                        <Pressable
                                            onPress={() => onAdjustDieQty(index, -1)}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderWidth: 1,
                                                borderRadius: 999,
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Text style={{ fontSize: 20, fontWeight: "900" }}>−</Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => onAdjustDieQty(index, 1)}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderWidth: 1,
                                                borderRadius: 999,
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Text style={{ fontSize: 20, fontWeight: "900" }}>+</Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => onEditDie(index)}
                                            style={{
                                                paddingVertical: 10,
                                                paddingHorizontal: 12,
                                                borderWidth: 1,
                                                borderRadius: 999,
                                            }}
                                        >
                                            <Text style={{ fontWeight: "800" }}>Réglages</Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => onRemoveDie(index)}
                                            style={{
                                                paddingVertical: 10,
                                                paddingHorizontal: 12,
                                                borderWidth: 1,
                                                borderRadius: 999,
                                            }}
                                        >
                                            <Text style={{ fontWeight: "800" }}>Retirer</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}