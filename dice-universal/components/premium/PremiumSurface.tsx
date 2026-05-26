// dice-universal/components/premium/PremiumSurface.tsx

import type { ReactNode } from "react";
import { View } from "react-native";

import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";

type PremiumSurfaceVariant = "primary" | "secondary" | "elevated" | "subtle";

type PremiumSurfaceProps = {
    children: ReactNode;
    variant?: PremiumSurfaceVariant;
    padded?: boolean;
    style?: object;
};

export function PremiumSurface({
    children,
    variant = "primary",
    padded = true,
    style,
}: PremiumSurfaceProps) {
    const premium = usePremiumTheme();

    const backgroundColor =
        variant === "elevated"
            ? premium.colors.surface.elevated
            : variant === "secondary"
                ? premium.colors.surface.secondary
                : variant === "subtle"
                    ? premium.colors.surface.subtle
                    : premium.colors.surface.primary;

    return (
        <View
            style={{
                borderRadius: premium.radius.xl,
                borderWidth: 1,
                borderColor: premium.colors.border.subtle,
                backgroundColor,
                padding: padded ? premium.spacing.md : 0,
                ...premium.shadow.card,
                ...(style ?? {}),
            }}
        >
            {children}
        </View>
    );
}