import { Pressable, Text, View } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

type PreparedRollCardProps = {
    title?: string;
    name: string | null;
    detail: string | null;
    isEmpty: boolean;
    onEdit?: () => void;
    onClear?: () => void;
    onSave?: () => void;
};

function PreparedActionButton({
    label,
    onPress,
    variant = "default",
}: {
    label: string;
    onPress: () => void;
    variant?: "default" | "accent" | "danger";
}) {
    const { theme } = useArcaneTheme();
    const backgroundColor =
        variant === "accent"
            ? theme.colors.accentSoft
            : variant === "danger"
                ? theme.colors.failureSoft
                : theme.colors.surfaceAlt;

    const borderColor =
        variant === "accent"
            ? theme.colors.accent
            : variant === "danger"
                ? theme.colors.failure
                : theme.colors.border;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor,
                borderRadius: theme.radius.pill,
                backgroundColor: pressed ? theme.colors.surfaceSoft : backgroundColor,
                opacity: pressed ? 0.86 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
        >
            <Text
                style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                }}
            >
                {label}
            </Text>
        </Pressable>
    );
}

export function PreparedRollCard({
    title = "Jet préparé",
    name,
    detail,
    isEmpty,
    onEdit,
    onClear,
    onSave,
}: PreparedRollCardProps) {
    const { theme, styles } = useArcaneTheme();
    
    return (
        <View
            style={{
                ...styles.card,
                gap: theme.spacing.md,
            }}
        >
            <View style={{ gap: theme.spacing.xs }}>
                <Text
                    style={{
                        color: theme.colors.textSubtle,
                        fontSize: theme.typography.tiny,
                        fontWeight: "900",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                    }}
                >
                    {title}
                </Text>

                {isEmpty ? (
                    <>
                        <Text
                            style={{
                                color: theme.colors.text,
                                fontSize: 20,
                                fontWeight: "900",
                            }}
                        >
                            Prépare un jet
                        </Text>

                        <Text
                            style={{
                                color: theme.colors.textMuted,
                                lineHeight: 20,
                            }}
                        >
                            Choisis un dé libre ou une action pour préparer ton prochain jet.
                        </Text>
                    </>
                ) : (
                    <>
                        <Text
                            style={{
                                color: theme.colors.text,
                                fontSize: 22,
                                fontWeight: "900",
                            }}
                        >
                            {name ?? "Jet"}
                        </Text>

                        {detail ? (
                            <Text
                                style={{
                                    color: theme.colors.textMuted,
                                    fontSize: 15,
                                    lineHeight: 21,
                                }}
                            >
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
                        gap: theme.spacing.sm,
                    }}
                >
                    {onEdit ? (
                        <PreparedActionButton
                            label="Modifier"
                            onPress={onEdit}
                            variant="accent"
                        />
                    ) : null}

                    {onClear ? (
                        <PreparedActionButton
                            label="Vider"
                            onPress={onClear}
                            variant="danger"
                        />
                    ) : null}

                    {onSave ? (
                        <PreparedActionButton label="Sauvegarder" onPress={onSave} />
                    ) : null}
                </View>
            ) : null}
        </View>
    );
}