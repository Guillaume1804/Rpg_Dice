import { Pressable, Text, View } from "react-native";
import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

type FreeDicePadProps = {
    title?: string;
    subtitle?: string;
    dice: number[];
    countsBySides?: Record<number, number>;
    onPressDie: (sides: number) => void;
    onLongPressDie?: (sides: number) => void;
};

function getDieShapeLabel(sides: number) {
    if (sides === 4) return "◆";
    if (sides === 6) return "□";
    if (sides === 8) return "◇";
    if (sides === 10) return "⬟";
    if (sides === 12) return "⬢";
    if (sides === 20) return "✦";
    if (sides === 100) return "%";
    return "◈";
}

export function FreeDicePad({
    title = "Dés libres",
    subtitle = "Appuie pour ajouter un dé. Appui long pour choisir un comportement.",
    dice,
    countsBySides = {},
    onPressDie,
    onLongPressDie,
}: FreeDicePadProps) {
    return (
        <View style={[arcaneStyles.card, { gap: arcane.spacing.md }]}>
            <View style={{ gap: arcane.spacing.xs }}>
                <Text style={arcaneStyles.sectionTitle}>{title}</Text>

                <Text style={[arcaneStyles.subtle, { lineHeight: 18 }]}>
                    {subtitle}
                </Text>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: arcane.spacing.sm,
                }}
            >
                {dice.map((sides) => {
                    const count = countsBySides[sides] ?? 0;
                    const isActive = count > 0;

                    return (
                        <Pressable
                            key={sides}
                            onPress={() => onPressDie(sides)}
                            onLongPress={() => onLongPressDie?.(sides)}
                            delayLongPress={300}
                            style={({ pressed }) => ({
                                width: 76,
                                minHeight: 86,
                                borderRadius: arcane.radius.lg,
                                borderWidth: 1,
                                borderColor: isActive
                                    ? arcane.colors.accent
                                    : arcane.colors.border,
                                backgroundColor: isActive
                                    ? arcane.colors.accentSoft
                                    : arcane.colors.surfaceAlt,
                                alignItems: "center",
                                justifyContent: "center",
                                gap: arcane.spacing.xs,
                                opacity: pressed ? 0.82 : 1,
                                transform: [{ scale: pressed ? 0.96 : 1 }],
                            })}
                        >
                            <Text
                                style={{
                                    color: isActive ? arcane.colors.accent : arcane.colors.text,
                                    fontSize: 26,
                                    fontWeight: "900",
                                    lineHeight: 30,
                                }}
                            >
                                {getDieShapeLabel(sides)}
                            </Text>

                            <Text
                                style={{
                                    color: arcane.colors.text,
                                    fontSize: 16,
                                    fontWeight: "900",
                                }}
                            >
                                d{sides}
                            </Text>

                            {count > 0 ? (
                                <View
                                    style={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        minWidth: 24,
                                        height: 24,
                                        borderRadius: arcane.radius.pill,
                                        backgroundColor: arcane.colors.accent,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        paddingHorizontal: 6,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: arcane.colors.background,
                                            fontSize: 12,
                                            fontWeight: "900",
                                        }}
                                    >
                                        x{count}
                                    </Text>
                                </View>
                            ) : null}
                        </Pressable>
                    );
                })}
            </View>

            <Text style={[arcaneStyles.subtle, { lineHeight: 18 }]}>
                Le jet préparé se met à jour automatiquement au-dessus.
            </Text>
        </View>
    );
}