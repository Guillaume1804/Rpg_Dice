// dice-universal/components/premium/PremiumPill.tsx

import type { ReactNode } from "react";
import { View } from "react-native";

import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";
import { PremiumText } from "./PremiumText";

type PremiumPillTone =
    | "neutral"
    | "accent"
    | "success"
    | "failure"
    | "warning"
    | "subtle";

type PremiumPillProps = {
    children: ReactNode;
    tone?: PremiumPillTone;
    compact?: boolean;
    style?: object;
};

export function PremiumPill({
    children,
    tone = "neutral",
    compact = false,
    style,
}: PremiumPillProps) {
    const premium = usePremiumTheme();

    const backgroundColor =
        tone === "accent"
            ? premium.colors.accent.soft
            : tone === "success"
                ? premium.colors.state.successSoft
                : tone === "failure"
                    ? premium.colors.state.failureSoft
                    : tone === "warning"
                        ? premium.colors.state.warningSoft
                        : tone === "subtle"
                            ? premium.colors.surface.subtle
                            : premium.colors.surface.secondary;

    const borderColor =
        tone === "accent"
            ? premium.colors.border.accent
            : tone === "success"
                ? "rgba(136, 211, 154, 0.26)"
                : tone === "failure"
                    ? "rgba(239, 111, 145, 0.26)"
                    : tone === "warning"
                        ? "rgba(223, 175, 85, 0.26)"
                        : premium.colors.border.subtle;

    const textTone =
        tone === "accent"
            ? "accent"
            : tone === "success"
                ? "success"
                : tone === "failure"
                    ? "failure"
                    : tone === "warning"
                        ? "warning"
                        : "secondary";

    return (
        <View
            style={{
                alignSelf: "flex-start",
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor,
                backgroundColor,
                paddingHorizontal: compact ? premium.spacing.xs : premium.spacing.sm,
                paddingVertical: compact ? 3 : premium.spacing.xs,
                ...(style ?? {}),
            }}
        >
            <PremiumText
                variant="tiny"
                tone={textTone}
                uppercase
                style={{
                    letterSpacing: 0.8,
                }}
            >
                {children}
            </PremiumText>
        </View>
    );
}