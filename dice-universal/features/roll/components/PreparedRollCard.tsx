// dice-universal/features/roll/components/PreparedRollCard.tsx

import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

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
            ? "rgba(217, 160, 55, 0.14)"
            : variant === "danger"
                ? "rgba(255, 92, 122, 0.12)"
                : "rgba(32, 41, 88, 0.62)";

    const borderColor =
        variant === "accent"
            ? theme.colors.accent
            : variant === "danger"
                ? theme.colors.failure
                : "rgba(145, 113, 255, 0.2)";

    const textColor =
        variant === "danger"
            ? theme.colors.failure
            : variant === "accent"
                ? theme.colors.accent
                : theme.colors.textMuted;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor,
                borderRadius: theme.radius.pill,
                backgroundColor,
                opacity: pressed ? 0.82 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
        >
            <Text
                style={{
                    color: textColor,
                    fontSize: 12,
                    fontWeight: "900",
                }}
            >
                {label}
            </Text>
        </Pressable>
    );
}

function PreparedDiceIcon({ empty }: { empty: boolean }) {
    const { theme } = useArcaneTheme();

    return (
        <View
            style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: empty
                    ? "rgba(145, 113, 255, 0.18)"
                    : "rgba(217, 160, 55, 0.78)",
                backgroundColor: empty
                    ? "rgba(32, 41, 88, 0.44)"
                    : "rgba(217, 160, 55, 0.14)",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Text
                style={{
                    color: empty ? theme.colors.textSubtle : theme.colors.accent,
                    fontSize: empty ? 20 : 22,
                    fontWeight: "900",
                }}
            >
                {empty ? "?" : "✦"}
            </Text>
        </View>
    );
}

function PreparedBadge({
    label,
    tone = "default",
}: {
    label: string;
    tone?: "default" | "accent";
}) {
    const { theme } = useArcaneTheme();

    return (
        <View
            style={{
                alignSelf: "center",
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: theme.radius.pill,
                borderWidth: 1,
                borderColor:
                    tone === "accent"
                        ? "rgba(217, 160, 55, 0.7)"
                        : "rgba(145, 113, 255, 0.2)",
                backgroundColor:
                    tone === "accent"
                        ? "rgba(217, 160, 55, 0.12)"
                        : "rgba(32, 41, 88, 0.5)",
            }}
        >
            <Text
                numberOfLines={1}
                style={{
                    color: tone === "accent" ? theme.colors.accent : theme.colors.textMuted,
                    fontSize: 11,
                    fontWeight: "900",
                    textTransform: tone === "accent" ? "uppercase" : "none",
                }}
            >
                {label}
            </Text>
        </View>
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
    const { theme } = useArcaneTheme();
    const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

    const detailParts = useMemo(
        () =>
            detail
                ?.split("•")
                .map((part) => part.trim())
                .filter(Boolean) ?? [],
        [detail],
    );

    const primaryDetail = detailParts[0] ?? null;
    const secondaryDetail = detailParts[1] ?? null;

    return (
        <View
            style={{
                borderRadius: rollTheme.layout.cockpitRadius,
                borderWidth: 1,
                borderColor: "rgba(145, 113, 255, 0.24)",
                backgroundColor: "rgba(13, 19, 43, 0.82)",
                overflow: "hidden",
                paddingVertical: 12,
                paddingHorizontal: 14,
                gap: 10,
            }}
        >
            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    top: -70,
                    right: -56,
                    width: 164,
                    height: 164,
                    borderRadius: 999,
                    backgroundColor: isEmpty
                        ? "rgba(145, 113, 255, 0.14)"
                        : rollTheme.cockpit.glow,
                    opacity: isEmpty ? 0.12 : 0.16,
                }}
            />

            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    left: -90,
                    bottom: -88,
                    width: 180,
                    height: 180,
                    borderRadius: 999,
                    backgroundColor: rollTheme.cockpit.magicGlow,
                    opacity: 0.08,
                }}
            />

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: theme.spacing.sm,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 9,
                        flex: 1,
                    }}
                >
                    <View
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: theme.radius.pill,
                            borderWidth: 1,
                            borderColor: "rgba(160, 92, 255, 0.72)",
                            backgroundColor: "rgba(160, 92, 255, 0.14)",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: theme.colors.arcane,
                                fontSize: 15,
                                fontWeight: "900",
                            }}
                        >
                            ⚑
                        </Text>
                    </View>

                    <Text
                        numberOfLines={1}
                        style={{
                            color: theme.colors.text,
                            fontSize: 18,
                            fontWeight: "900",
                            letterSpacing: -0.2,
                            textTransform: "uppercase",
                        }}
                    >
                        {title}
                    </Text>
                </View>

                {onEdit ? (
                    <Pressable
                        onPress={onEdit}
                        style={({ pressed }) => ({
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: theme.radius.pill,
                            borderWidth: 1,
                            borderColor: "rgba(145, 113, 255, 0.2)",
                            backgroundColor: "rgba(32, 41, 88, 0.54)",
                            opacity: pressed ? 0.82 : 1,
                            transform: [{ scale: pressed ? 0.97 : 1 }],
                        })}
                    >
                        <Text
                            style={{
                                color: theme.colors.textMuted,
                                fontSize: 12,
                                fontWeight: "900",
                            }}
                        >
                            Modifier ✎
                        </Text>
                    </Pressable>
                ) : null}
            </View>

            <View
                style={{
                    minHeight: isEmpty ? 70 : 82,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "rgba(145, 113, 255, 0.18)",
                    backgroundColor: "rgba(28, 37, 82, 0.62)",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    gap: 10,
                }}
            >
                {isEmpty ? (
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <PreparedDiceIcon empty />

                        <View style={{ flex: 1, gap: 3 }}>
                            <Text
                                numberOfLines={1}
                                style={{
                                    color: theme.colors.text,
                                    fontSize: 19,
                                    fontWeight: "900",
                                    letterSpacing: -0.2,
                                }}
                            >
                                Aucun jet préparé
                            </Text>

                            <Text
                                numberOfLines={1}
                                style={{
                                    color: theme.colors.textMuted,
                                    fontSize: 13,
                                    fontWeight: "700",
                                }}
                            >
                                Choisis un dé libre ou une action.
                            </Text>
                        </View>
                    </View>
                ) : (
                    <>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <PreparedDiceIcon empty={false} />

                            <View style={{ flex: 1, gap: 2 }}>
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        color: theme.colors.text,
                                        fontSize: 23,
                                        fontWeight: "900",
                                        letterSpacing: -0.35,
                                    }}
                                >
                                    {primaryDetail ?? name ?? "Jet"}
                                </Text>

                                <Text
                                    numberOfLines={1}
                                    style={{
                                        color: theme.colors.textMuted,
                                        fontSize: 13,
                                        fontWeight: "700",
                                    }}
                                >
                                    {name ?? "Jet principal"}
                                </Text>
                            </View>

                            <PreparedBadge label="Principal" tone="accent" />
                        </View>

                        {secondaryDetail ? (
                            <>
                                <View
                                    style={{
                                        height: 1,
                                        backgroundColor: "rgba(145, 113, 255, 0.16)",
                                    }}
                                />

                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <PreparedDiceIcon empty={false} />

                                    <View style={{ flex: 1 }}>
                                        <Text
                                            numberOfLines={1}
                                            style={{
                                                color: theme.colors.text,
                                                fontSize: 18,
                                                fontWeight: "900",
                                            }}
                                        >
                                            {secondaryDetail}
                                        </Text>
                                    </View>

                                    <PreparedBadge label="Effet" />
                                </View>
                            </>
                        ) : null}
                    </>
                )}
            </View>

            {!isEmpty ? (
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: theme.spacing.sm,
                    }}
                >
                    <Pressable
                        onPress={onEdit}
                        disabled={!onEdit}
                        style={({ pressed }) => ({
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            opacity: pressed ? 0.78 : onEdit ? 1 : 0.5,
                        })}
                    >
                        <View
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: theme.radius.pill,
                                borderWidth: 1,
                                borderColor: "rgba(160, 92, 255, 0.72)",
                                backgroundColor: "rgba(160, 92, 255, 0.14)",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: theme.colors.arcane,
                                    fontSize: 19,
                                    fontWeight: "900",
                                    lineHeight: 22,
                                }}
                            >
                                +
                            </Text>
                        </View>

                        <Text
                            style={{
                                color: theme.colors.arcane,
                                fontSize: 15,
                                fontWeight: "900",
                            }}
                        >
                            Ajouter un élément
                        </Text>
                    </Pressable>

                    <View
                        style={{
                            flexDirection: "row",
                            gap: theme.spacing.sm,
                        }}
                    >
                        {onSave ? (
                            <PreparedActionButton label="Sauvegarder" onPress={onSave} />
                        ) : null}

                        {onClear ? (
                            <PreparedActionButton
                                label="Vider"
                                onPress={onClear}
                                variant="danger"
                            />
                        ) : null}
                    </View>
                </View>
            ) : null}
        </View>
    );
}