// dice-universal/features/roll/components/SessionMenuModal.tsx

import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

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

export function SessionMenuModal({
    visible,
    title,
    subtitle,
    items,
    onClose,
}: SessionMenuModalProps) {
    const { theme, styles } = useArcaneTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.68)",
                    justifyContent: "flex-end",
                }}
            >
                <View
                    style={{
                        maxHeight: "72%",
                        borderTopLeftRadius: 30,
                        borderTopRightRadius: 30,
                        borderWidth: 1,
                        borderColor: "rgba(145, 113, 255, 0.26)",
                        backgroundColor: theme.colors.surface,
                        padding: theme.spacing.md,
                        gap: theme.spacing.md,
                        overflow: "hidden",
                        ...theme.shadow.card,
                    }}
                >
                    <View
                        pointerEvents="none"
                        style={{
                            position: "absolute",
                            right: -70,
                            top: -70,
                            width: 190,
                            height: 190,
                            borderRadius: 999,
                            backgroundColor: theme.colors.arcane,
                            opacity: 0.12,
                        }}
                    />

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: theme.spacing.md,
                        }}
                    >
                        <View style={{ flex: 1, gap: 4 }}>
                            <Text
                                style={{
                                    color: theme.colors.textSubtle,
                                    fontSize: theme.typography.tiny,
                                    fontWeight: "900",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.9,
                                }}
                            >
                                ✦ Session
                            </Text>

                            <Text
                                numberOfLines={1}
                                style={{
                                    color: theme.colors.text,
                                    fontSize: 22,
                                    fontWeight: "900",
                                    letterSpacing: -0.35,
                                }}
                            >
                                {title}
                            </Text>

                            {subtitle ? (
                                <Text
                                    style={{
                                        color: theme.colors.textMuted,
                                        fontSize: 13,
                                        fontWeight: "700",
                                    }}
                                >
                                    {subtitle}
                                </Text>
                            ) : null}
                        </View>

                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => ({
                                width: 42,
                                height: 42,
                                borderRadius: theme.radius.pill,
                                borderWidth: 1,
                                borderColor: "rgba(145, 113, 255, 0.22)",
                                backgroundColor: pressed
                                    ? "rgba(32, 41, 88, 0.72)"
                                    : "rgba(32, 41, 88, 0.52)",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: pressed ? 0.84 : 1,
                            })}
                        >
                            <Text
                                style={{
                                    color: theme.colors.text,
                                    fontSize: 21,
                                    fontWeight: "900",
                                }}
                            >
                                ×
                            </Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            gap: theme.spacing.sm,
                            paddingBottom: theme.spacing.md,
                        }}
                    >
                        {items.map((item) => (
                            <Pressable
                                key={item.id}
                                onPress={item.onPress}
                                disabled={item.disabled}
                                style={({ pressed }) => ({
                                    ...styles.cardSoft,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: theme.spacing.md,
                                    borderColor: item.selected
                                        ? theme.colors.accent
                                        : item.danger
                                            ? theme.colors.failure
                                            : "rgba(145, 113, 255, 0.18)",
                                    backgroundColor: item.selected
                                        ? theme.colors.accentSoft
                                        : item.danger
                                            ? theme.colors.failureSoft
                                            : "rgba(28, 37, 82, 0.54)",
                                    opacity: item.disabled ? 0.48 : pressed ? 0.84 : 1,
                                    transform: [{ scale: pressed && !item.disabled ? 0.985 : 1 }],
                                })}
                            >
                                <View
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 14,
                                        borderWidth: 1,
                                        borderColor: item.selected
                                            ? theme.colors.accent
                                            : item.danger
                                                ? theme.colors.failure
                                                : "rgba(145, 113, 255, 0.22)",
                                        backgroundColor: "rgba(13, 19, 43, 0.48)",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 19,
                                            fontWeight: "900",
                                        }}
                                    >
                                        {item.icon ?? "✦"}
                                    </Text>
                                </View>

                                <View style={{ flex: 1, gap: 2 }}>
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            color: item.danger
                                                ? theme.colors.failure
                                                : item.selected
                                                    ? theme.colors.accent
                                                    : theme.colors.text,
                                            fontSize: 15,
                                            fontWeight: "900",
                                        }}
                                    >
                                        {item.label}
                                    </Text>

                                    {item.description ? (
                                        <Text
                                            numberOfLines={2}
                                            style={{
                                                color: theme.colors.textMuted,
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
                                    <Text
                                        style={{
                                            color: theme.colors.accent,
                                            fontSize: 16,
                                            fontWeight: "900",
                                        }}
                                    >
                                        ✓
                                    </Text>
                                ) : null}
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}