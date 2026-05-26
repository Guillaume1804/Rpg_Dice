// dice-universal/components/premium/PremiumPressable.tsx

import type { ReactNode } from "react";
import { Pressable } from "react-native";

import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";

type PremiumPressableProps = {
    children: ReactNode;
    onPress?: () => void;
    onLongPress?: () => void;
    disabled?: boolean;
    hitSlop?: number;
    style?: object;
    pressedStyle?: object;
};

export function PremiumPressable({
    children,
    onPress,
    onLongPress,
    disabled = false,
    hitSlop,
    style,
    pressedStyle,
}: PremiumPressableProps) {
    const premium = usePremiumTheme();

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            disabled={disabled}
            hitSlop={hitSlop}
            style={({ pressed }) => ({
                opacity: disabled ? 0.48 : pressed ? 0.88 : 1,
                transform: [
                    {
                        scale:
                            pressed && !disabled
                                ? premium.animation.pressScale
                                : 1,
                    },
                ],
                ...(style ?? {}),
                ...(pressed && pressedStyle ? pressedStyle : {}),
            })}
        >
            {children}
        </Pressable>
    );
}