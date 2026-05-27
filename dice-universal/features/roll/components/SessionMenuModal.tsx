// dice-universal/features/roll/components/SessionMenuModal.tsx

import { Pressable, Text, View } from "react-native";

import { PremiumBottomSheet } from "../../../components/premium";
import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

export type SessionMenuItem = {
    id: string;
    label: string;
    description?: string;
    icon?: string;
    selected?: boolean;
    danger?: boolean;
    disabled?: boolean;
    onPress: () => void | Promise<void>;
};

type SessionMenuModalProps = {
    visible: boolean;
    title: string;
    subtitle?: string;
    items: SessionMenuItem[];
    onClose: () => void;
};

function SessionMenuRow({ item }: { item: SessionMenuItem }) {
    const premium = usePremiumTheme();

    const borderColor = item.selected
        ? premium.colors.border.accent
        : item.danger
            ? "rgba(239, 111, 145, 0.36)"
            : premium.colors.border.subtle;

    const backgroundColor = item.selected
        ? premium.colors.accent.soft
        : item.danger
            ? premium.colors.state.failureSoft
            : premium.colors.surface.subtle;

    const titleColor = item.danger
        ? premium.colors.state.failure
        : item.selected
            ? premium.colors.accent.primary
            : premium.colors.text.primary;

    const iconBorderColor = item.selected
        ? premium.colors.border.accent
        : item.danger
            ? "rgba(239, 111, 145, 0.34)"
            : premium.colors.border.subtle;

    const iconBackgroundColor = item.selected
        ? premium.colors.accent.soft
        : premium.colors.surface.secondary;

    return (
        <Pressable
            onPress={() => {
                void item.onPress();
            }}
            disabled={item.disabled}
            style={({ pressed }) => ({
                minHeight: 64,
                borderRadius: premium.radius.lg,
                borderWidth: 1,
                borderColor,
                backgroundColor: pressed && !item.disabled
                    ? premium.colors.surface.pressed
                    : backgroundColor,
                paddingVertical: 10,
                paddingHorizontal: 11,
                flexDirection: "row",
                alignItems: "center",
                gap: premium.spacing.sm,
                opacity: item.disabled ? 0.46 : pressed ? 0.86 : 1,
                transform: [
                    {
                        scale:
                            pressed && !item.disabled
                                ? premium.animation.pressScale
                                : 1,
                    },
                ],
            })}
        >
            <View
                style={{
                    width: 38,
                    height: 38,
                    borderRadius: premium.radius.md,
                    borderWidth: 1,
                    borderColor: iconBorderColor,
                    backgroundColor: iconBackgroundColor,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text
                    style={{
                        color: titleColor,
                        fontSize: 18,
                        fontWeight: "900",
                        lineHeight: 21,
                    }}
                >
                    {item.icon ?? "◇"}
                </Text>
            </View>

            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text
                    numberOfLines={1}
                    style={{
                        color: titleColor,
                        fontSize: 15,
                        fontWeight: "900",
                        letterSpacing: -0.1,
                    }}
                >
                    {item.label}
                </Text>

                {item.description ? (
                    <Text
                        numberOfLines={2}
                        style={{
                            color: premium.colors.text.secondary,
                            fontSize: 12,
                            fontWeight: "700",
                            lineHeight: 16,
                        }}
                    >
                        {item.description}
                    </Text>
                ) : null}
            </View>

            {item.selected ? (
                <View
                    style={{
                        width: 25,
                        height: 25,
                        borderRadius: premium.radius.pill,
                        borderWidth: 1,
                        borderColor: premium.colors.border.accent,
                        backgroundColor: premium.colors.accent.soft,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Text
                        style={{
                            color: premium.colors.accent.primary,
                            fontSize: 14,
                            fontWeight: "900",
                            lineHeight: 16,
                        }}
                    >
                        ✓
                    </Text>
                </View>
            ) : (
                <Text
                    style={{
                        color: premium.colors.text.muted,
                        fontSize: 18,
                        fontWeight: "900",
                        lineHeight: 20,
                    }}
                >
                    ›
                </Text>
            )}
        </Pressable>
    );
}

export function SessionMenuModal({
    visible,
    title,
    subtitle,
    items,
    onClose,
}: SessionMenuModalProps) {
    const premium = usePremiumTheme();

    return (
        <PremiumBottomSheet
            visible={visible}
            title={title}
            subtitle={subtitle}
            onClose={onClose}
            maxHeight="72%"
        >
            <View
                style={{
                    gap: premium.spacing.sm,
                    paddingBottom: premium.spacing.md,
                }}
            >
                {items.map((item) => (
                    <SessionMenuRow key={item.id} item={item} />
                ))}
            </View>
        </PremiumBottomSheet>
    );
}