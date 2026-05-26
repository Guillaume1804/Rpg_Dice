// dice-universal/components/premium/PremiumBottomSheet.tsx

import type { ReactNode } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";
import { PremiumPressable } from "./PremiumPressable";
import { PremiumText } from "./PremiumText";

type PremiumBottomSheetMaxHeight = number | `${number}%`;

type PremiumBottomSheetProps = {
    visible: boolean;
    title?: string;
    subtitle?: string;
    children: ReactNode;
    onClose: () => void;
    footer?: ReactNode;
    maxHeight?: PremiumBottomSheetMaxHeight;
};

export function PremiumBottomSheet({
    visible,
    title,
    subtitle,
    children,
    onClose,
    footer,
    maxHeight = "84%",
}: PremiumBottomSheetProps) {
    const premium = usePremiumTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    backgroundColor: premium.colors.background.overlay,
                }}
            >
                <Pressable
                    onPress={onClose}
                    style={{
                        flex: 1,
                    }}
                />

                <View
                    style={{
                        maxHeight,
                        borderTopLeftRadius: premium.radius.xxl,
                        borderTopRightRadius: premium.radius.xxl,
                        borderWidth: 1,
                        borderColor: premium.colors.border.subtle,
                        backgroundColor: premium.colors.background.secondary,
                        paddingTop: premium.spacing.sm,
                        paddingHorizontal: premium.spacing.md,
                        paddingBottom: premium.spacing.lg,
                        ...premium.shadow.card,
                    }}
                >
                    <View
                        style={{
                            alignSelf: "center",
                            width: 42,
                            height: 4,
                            borderRadius: premium.radius.pill,
                            backgroundColor: premium.colors.border.strong,
                            marginBottom: premium.spacing.md,
                            opacity: 0.72,
                        }}
                    />

                    {title || subtitle ? (
                        <View
                            style={{
                                marginBottom: premium.spacing.md,
                                gap: premium.spacing.xs,
                            }}
                        >
                            {title ? (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: premium.spacing.md,
                                    }}
                                >
                                    <PremiumText variant="title">{title}</PremiumText>

                                    <PremiumPressable
                                        onPress={onClose}
                                        hitSlop={10}
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: premium.radius.pill,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: premium.colors.surface.subtle,
                                            borderWidth: 1,
                                            borderColor: premium.colors.border.subtle,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: premium.colors.text.secondary,
                                                fontSize: 18,
                                                fontWeight: "900",
                                                lineHeight: 20,
                                            }}
                                        >
                                            ×
                                        </Text>
                                    </PremiumPressable>
                                </View>
                            ) : null}

                            {subtitle ? (
                                <PremiumText variant="body" tone="secondary">
                                    {subtitle}
                                </PremiumText>
                            ) : null}
                        </View>
                    ) : null}

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: footer ? premium.spacing.md : 0,
                        }}
                    >
                        {children}
                    </ScrollView>

                    {footer ? (
                        <View
                            style={{
                                paddingTop: premium.spacing.md,
                            }}
                        >
                            {footer}
                        </View>
                    ) : null}
                </View>
            </View>
        </Modal>
    );
}