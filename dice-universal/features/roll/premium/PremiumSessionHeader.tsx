// dice-universal/features/roll/premium/PremiumSessionHeader.tsx

import { Pressable, Text, View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

type PremiumSessionHeaderProps = {
    tableName: string | null;
    activeProfileName: string | null;
    hasActiveTable: boolean;
    profileCount: number;
    onPressTableMenu: () => void;
    onPressProfileMenu: () => void;
};

type PremiumSessionChipProps = {
    eyebrow: string;
    title: string;
    subtitle: string;
    disabled?: boolean;
    active?: boolean;
    onPress: () => void;
};

function PremiumSessionChip({
    eyebrow,
    title,
    subtitle,
    disabled = false,
    active = false,
    onPress,
}: PremiumSessionChipProps) {
    const premium = usePremiumTheme();

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => ({
                flex: 1,
                minHeight: 50,
                borderRadius: premium.radius.lg,
                borderWidth: 1,
                borderColor: active
                    ? premium.colors.border.accent
                    : premium.colors.border.subtle,
                backgroundColor: pressed
                    ? premium.colors.surface.pressed
                    : premium.colors.surface.secondary,
                paddingVertical: premium.spacing.xs,
                paddingHorizontal: premium.spacing.sm,
                flexDirection: "row",
                alignItems: "center",
                gap: premium.spacing.sm,
                opacity: disabled ? 0.46 : pressed ? 0.88 : 1,
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
                    width: 5,
                    alignSelf: "stretch",
                    borderRadius: premium.radius.pill,
                    backgroundColor: active
                        ? premium.colors.accent.primary
                        : premium.colors.border.default,
                    opacity: active ? 0.9 : 0.42,
                }}
            />

            <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                    numberOfLines={1}
                    style={{
                        color: premium.colors.text.muted,
                        fontSize: premium.typography.tiny,
                        fontWeight: "900",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        lineHeight: 12,
                    }}
                >
                    {eyebrow}
                </Text>

                <Text
                    numberOfLines={1}
                    style={{
                        marginTop: 1,
                        color: disabled
                            ? premium.colors.text.muted
                            : premium.colors.text.primary,
                        fontSize: premium.typography.body,
                        fontWeight: "900",
                        letterSpacing: -0.15,
                        lineHeight: 17,
                    }}
                >
                    {title}
                </Text>

                <Text
                    numberOfLines={1}
                    style={{
                        marginTop: 1,
                        color: premium.colors.text.secondary,
                        fontSize: premium.typography.tiny,
                        fontWeight: "800",
                        lineHeight: 12,
                        opacity: 0.82,
                    }}
                >
                    {subtitle}
                </Text>
            </View>

            <Text
                style={{
                    color: disabled
                        ? premium.colors.text.subtle
                        : premium.colors.text.secondary,
                    fontSize: 15,
                    fontWeight: "900",
                    lineHeight: 17,
                    opacity: disabled ? 0.45 : 0.9,
                }}
            >
                ▾
            </Text>
        </Pressable>
    );
}

function PremiumHeaderMark() {
    const premium = usePremiumTheme();

    return (
        <View
            pointerEvents="none"
            style={{
                width: 42,
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
            }}
        >
            <View
                style={{
                    width: 26,
                    height: 26,
                    borderRadius: premium.radius.pill,
                    borderWidth: 1,
                    borderColor: premium.colors.border.accent,
                    backgroundColor: premium.colors.accent.softer,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text
                    style={{
                        color: premium.colors.accent.primary,
                        fontSize: 13,
                        fontWeight: "900",
                        lineHeight: 16,
                    }}
                >
                    ✦
                </Text>
            </View>

            <Text
                numberOfLines={1}
                style={{
                    color: premium.colors.text.subtle,
                    fontSize: 7,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                }}
            >
                Dice
            </Text>
        </View>
    );
}

export function PremiumSessionHeader({
    tableName,
    activeProfileName,
    hasActiveTable,
    profileCount,
    onPressTableMenu,
    onPressProfileMenu,
}: PremiumSessionHeaderProps) {
    const premium = usePremiumTheme();

    const displayTableName = tableName ?? "Mode libre";
    const displayProfileName = activeProfileName ?? "Aucun profil";

    return (
        <View
            style={{
                borderRadius: premium.radius.xl,
                borderWidth: 1,
                borderColor: premium.colors.border.subtle,
                backgroundColor: "rgba(6, 8, 18, 0.24)",
                padding: premium.spacing.xs,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: premium.spacing.xs,
                }}
            >
                <PremiumSessionChip
                    eyebrow={hasActiveTable ? "Table active" : "Session"}
                    title={displayTableName}
                    subtitle={hasActiveTable ? "Contexte lié" : "Jet libre"}
                    active={hasActiveTable}
                    onPress={onPressTableMenu}
                />

                <PremiumHeaderMark />

                <PremiumSessionChip
                    eyebrow="Profil"
                    title={displayProfileName}
                    subtitle={
                        hasActiveTable
                            ? `${profileCount} profil${profileCount > 1 ? "s" : ""}`
                            : "Non lié"
                    }
                    active={hasActiveTable && !!activeProfileName}
                    disabled={!hasActiveTable}
                    onPress={onPressProfileMenu}
                />
            </View>
        </View>
    );
}