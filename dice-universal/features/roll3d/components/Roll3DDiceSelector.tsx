// dice-universal/features/roll3d/components/Roll3DDiceSelector.tsx

import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DDieSides } from "../types";
import { STANDARD_ROLL_3D_DICE } from "../constants";

type Roll3DDiceSelectorProps = {
    selectedSides: Roll3DDieSides;
    onSelectSides: (sides: Roll3DDieSides) => void;
};

function getDieSymbol(sides: Roll3DDieSides) {
    if (sides === 4) return "△";
    if (sides === 6) return "□";
    if (sides === 8) return "◇";
    if (sides === 10) return "⬟";
    if (sides === 12) return "⬢";
    if (sides === 20) return "✦";
    return "%";
}

export function Roll3DDiceSelector({
    selectedSides,
    onSelectSides,
}: Roll3DDiceSelectorProps) {
    const premium = usePremiumTheme();

    return (
        <View
            style={{
                width: "100%",
                borderRadius: premium.radius.xl,
                borderWidth: 1,
                borderColor: premium.colors.border.subtle,
                backgroundColor: "rgba(5, 6, 11, 0.72)",
                paddingVertical: 10,
                paddingHorizontal: 10,
                overflow: "hidden",
            }}
        >
            <Text
                style={{
                    color: premium.colors.text.muted,
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    marginBottom: 8,
                }}
            >
                Sélecteur de dés
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    gap: 9,
                    paddingRight: 2,
                }}
            >
                {STANDARD_ROLL_3D_DICE.map((sides) => {
                    const selected = sides === selectedSides;

                    return (
                        <Pressable
                            key={`roll-3d-selector-${sides}`}
                            onPress={() => onSelectSides(sides)}
                            style={({ pressed }) => ({
                                width: 58,
                                height: 66,
                                borderRadius: 18,
                                opacity: pressed ? 0.82 : 1,
                                transform: [
                                    {
                                        scale: pressed
                                            ? premium.animation.pressScale
                                            : selected
                                                ? 1.04
                                                : 1,
                                    },
                                ],
                            })}
                        >
                            <LinearGradient
                                colors={
                                    selected
                                        ? ["rgba(232, 200, 120, 0.28)", "rgba(5, 6, 11, 0.92)"]
                                        : ["rgba(255, 255, 255, 0.08)", "rgba(5, 6, 11, 0.9)"]
                                }
                                start={{ x: 0.2, y: 0 }}
                                end={{ x: 0.8, y: 1 }}
                                style={{
                                    flex: 1,
                                    borderRadius: 18,
                                    borderWidth: 1,
                                    borderColor: selected
                                        ? premium.colors.border.accent
                                        : premium.colors.border.subtle,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                }}
                            >
                                <View
                                    pointerEvents="none"
                                    style={{
                                        position: "absolute",
                                        top: 5,
                                        left: 7,
                                        right: 7,
                                        height: 18,
                                        borderRadius: premium.radius.pill,
                                        backgroundColor: selected
                                            ? "rgba(255, 255, 255, 0.12)"
                                            : "rgba(255, 255, 255, 0.045)",
                                    }}
                                />

                                <Text
                                    style={{
                                        color: selected
                                            ? premium.colors.accent.primary
                                            : premium.colors.text.secondary,
                                        fontSize: sides === 100 ? 20 : 22,
                                        fontWeight: "900",
                                        lineHeight: 26,
                                        marginBottom: 2,
                                    }}
                                >
                                    {getDieSymbol(sides)}
                                </Text>

                                <Text
                                    style={{
                                        color: selected
                                            ? premium.colors.text.primary
                                            : premium.colors.text.muted,
                                        fontSize: 10,
                                        fontWeight: "900",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.8,
                                    }}
                                >
                                    d{sides}
                                </Text>
                            </LinearGradient>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}