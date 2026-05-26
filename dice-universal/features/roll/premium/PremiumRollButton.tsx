// dice-universal/features/roll/premium/PremiumRollButton.tsx

import { Pressable, Text, View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

type PremiumRollButtonProps = {
    disabled: boolean;
    rolling?: boolean;
    focusedLine?: boolean;
    label?: string;
    disabledLabel?: string;
    onPress: () => void | Promise<void>;
};

export function PremiumRollButton({
    disabled,
    rolling = false,
    focusedLine = false,
    label = "LANCER",
    disabledLabel = "AJOUTE DES DÉS",
    onPress,
}: PremiumRollButtonProps) {
    const premium = usePremiumTheme();

    const displayLabel = disabled ? disabledLabel : rolling ? "LANCEMENT…" : label;

    return (
        <Pressable
            disabled={disabled || rolling}
            onPress={onPress}
            style={({ pressed }) => ({
                minHeight: 58,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: disabled
                    ? premium.colors.border.subtle
                    : focusedLine
                        ? premium.colors.border.accent
                        : "rgba(255, 255, 255, 0.14)",
                backgroundColor: disabled
                    ? premium.colors.surface.disabled
                    : pressed
                        ? "#10121B"
                        : "#05060B",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: premium.spacing.lg,
                opacity: disabled ? 0.58 : pressed ? 0.94 : 1,
                transform: [
                    {
                        scale:
                            pressed && !disabled && !rolling
                                ? premium.animation.pressScale
                                : 1,
                    },
                ],
                ...premium.shadow.button,
            })}
        >
            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    top: 1,
                    left: 1,
                    right: 1,
                    height: "48%",
                    borderTopLeftRadius: premium.radius.pill,
                    borderTopRightRadius: premium.radius.pill,
                    backgroundColor: disabled
                        ? "rgba(255, 255, 255, 0.025)"
                        : "rgba(255, 255, 255, 0.055)",
                }}
            />

            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    left: 18,
                    right: 18,
                    bottom: 0,
                    height: 1,
                    backgroundColor: disabled
                        ? "rgba(255, 255, 255, 0.04)"
                        : focusedLine
                            ? premium.colors.accent.primary
                            : "rgba(232, 200, 120, 0.32)",
                    opacity: disabled ? 0.36 : focusedLine ? 0.82 : 0.48,
                }}
            />

            <Text
                numberOfLines={1}
                style={{
                    color: disabled
                        ? premium.colors.text.muted
                        : premium.colors.text.primary,
                    fontSize: 14,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 1.9,
                }}
            >
                {displayLabel}
            </Text>

            {focusedLine && !disabled ? (
                <Text
                    numberOfLines={1}
                    style={{
                        marginTop: 3,
                        color: premium.colors.accent.primary,
                        fontSize: 9,
                        fontWeight: "900",
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        opacity: 0.82,
                    }}
                >
                    ligne ciblée
                </Text>
            ) : null}
        </Pressable>
    );
}