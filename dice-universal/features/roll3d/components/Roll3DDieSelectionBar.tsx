// dice-universal/features/roll3d/components/Roll3DDieSelectionBar.tsx

import { Pressable, Text, View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DDieSides } from "../types";

type Roll3DDieSelectionBarProps = {
    visible: boolean;

    selectedCount: number;
    lineDiceCount: number;
    selectedSides: Roll3DDieSides | null;

    onSelectLine: () => void;
    onRemoveSelection: () => void;
    onClearSelection: () => void;
};

function SelectionActionButton({
    label,
    tone,
    disabled,
    onPress,
}: {
    label: string;
    tone: "neutral" | "accent" | "danger";
    disabled?: boolean;
    onPress: () => void;
}) {
    const premium = usePremiumTheme();

    const borderColor =
        tone === "danger"
            ? "rgba(239, 111, 145, 0.30)"
            : tone === "accent"
                ? "rgba(232, 200, 120, 0.28)"
                : "rgba(255,255,255,0.10)";

    const backgroundColor =
        tone === "danger"
            ? "rgba(239, 111, 145, 0.10)"
            : tone === "accent"
                ? "rgba(232, 200, 120, 0.10)"
                : "rgba(255,255,255,0.045)";

    const textColor =
        tone === "danger"
            ? premium.colors.state.failure
            : tone === "accent"
                ? premium.colors.accent.primary
                : premium.colors.text.secondary;

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => ({
                flex: 1,
                opacity: disabled ? 0.36 : pressed ? 0.74 : 1,
                transform: [
                    {
                        scale:
                            pressed && !disabled
                                ? premium.animation.pressScale
                                : 1,
                    },
                ],
            })}
        >
            <View
                style={{
                    minHeight: 40,
                    borderRadius: premium.radius.pill,
                    borderWidth: 1,
                    borderColor,
                    backgroundColor,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 10,
                }}
            >
                <Text
                    numberOfLines={1}
                    style={{
                        color: textColor,
                        fontSize: 9,
                        fontWeight: "900",
                        textTransform: "uppercase",
                        letterSpacing: 0.55,
                        textAlign: "center",
                    }}
                >
                    {label}
                </Text>
            </View>
        </Pressable>
    );
}

export function Roll3DDieSelectionBar({
    visible,
    selectedCount,
    lineDiceCount,
    selectedSides,
    onSelectLine,
    onRemoveSelection,
    onClearSelection,
}: Roll3DDieSelectionBarProps) {
    const premium = usePremiumTheme();

    if (!visible || selectedCount <= 0) {
        return null;
    }

    const wholeLineIsSelected =
        lineDiceCount > 0 && selectedCount === lineDiceCount;

    return (
        <View
            pointerEvents="box-none"
            style={{
                position: "absolute",
                left: 12,
                right: 12,
                top: 108,
                zIndex: 6,
                alignItems: "center",
            }}
        >
            <View
                style={{
                    width: "100%",
                    maxWidth: 430,
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: "rgba(232, 200, 120, 0.16)",
                    backgroundColor: "rgba(6, 8, 18, 0.94)",
                    padding: 10,
                    gap: 9,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                    }}
                >
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <Text
                            style={{
                                color: premium.colors.accent.primary,
                                fontSize: 9,
                                fontWeight: "900",
                                textTransform: "uppercase",
                                letterSpacing: 0.9,
                            }}
                        >
                            Sélection active
                        </Text>

                        <Text
                            numberOfLines={1}
                            style={{
                                color: premium.colors.text.primary,
                                fontSize: 14,
                                fontWeight: "900",
                                marginTop: 2,
                            }}
                        >
                            {selectedCount} dé{selectedCount > 1 ? "s" : ""}
                            {selectedSides != null ? ` · d${selectedSides}` : ""}
                        </Text>
                    </View>

                    <Pressable
                        onPress={onClearSelection}
                        style={({ pressed }) => ({
                            opacity: pressed ? 0.7 : 1,
                        })}
                    >
                        <View
                            style={{
                                minHeight: 32,
                                borderRadius: premium.radius.pill,
                                borderWidth: 1,
                                borderColor: premium.colors.border.subtle,
                                backgroundColor: premium.colors.surface.subtle,
                                alignItems: "center",
                                justifyContent: "center",
                                paddingHorizontal: 10,
                            }}
                        >
                            <Text
                                style={{
                                    color: premium.colors.text.secondary,
                                    fontSize: 9,
                                    fontWeight: "900",
                                    textTransform: "uppercase",
                                }}
                            >
                                Fermer
                            </Text>
                        </View>
                    </Pressable>
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        gap: 8,
                    }}
                >
                    <SelectionActionButton
                        label={
                            wholeLineIsSelected
                                ? "Ligne sélectionnée"
                                : `Sélectionner la ligne (${lineDiceCount})`
                        }
                        tone="accent"
                        disabled={
                            lineDiceCount <= 1 || wholeLineIsSelected
                        }
                        onPress={onSelectLine}
                    />

                    <SelectionActionButton
                        label={
                            selectedCount > 1
                                ? `Retirer les ${selectedCount} dés`
                                : "Retirer ce dé"
                        }
                        tone="danger"
                        onPress={onRemoveSelection}
                    />
                </View>
            </View>
        </View>
    );
}