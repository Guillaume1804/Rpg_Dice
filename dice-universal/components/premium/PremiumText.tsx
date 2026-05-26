// dice-universal/components/premium/PremiumText.tsx

import type { ReactNode } from "react";
import { Text } from "react-native";

import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";

type PremiumTextVariant =
    | "tiny"
    | "caption"
    | "body"
    | "bodyStrong"
    | "title"
    | "hero";

type PremiumTextTone =
    | "primary"
    | "secondary"
    | "muted"
    | "subtle"
    | "accent"
    | "success"
    | "failure"
    | "warning";

type PremiumTextProps = {
    children: ReactNode;
    variant?: PremiumTextVariant;
    tone?: PremiumTextTone;
    uppercase?: boolean;
    numberOfLines?: number;
    style?: object;
};

export function PremiumText({
    children,
    variant = "body",
    tone = "primary",
    uppercase = false,
    numberOfLines,
    style,
}: PremiumTextProps) {
    const premium = usePremiumTheme();

    const fontSize =
        variant === "hero"
            ? premium.typography.hero
            : variant === "title"
                ? premium.typography.title
                : variant === "bodyStrong"
                    ? premium.typography.bodyStrong
                    : variant === "caption"
                        ? premium.typography.caption
                        : variant === "tiny"
                            ? premium.typography.tiny
                            : premium.typography.body;

    const color =
        tone === "accent"
            ? premium.colors.accent.primary
            : tone === "success"
                ? premium.colors.state.success
                : tone === "failure"
                    ? premium.colors.state.failure
                    : tone === "warning"
                        ? premium.colors.state.warning
                        : tone === "secondary"
                            ? premium.colors.text.secondary
                            : tone === "muted"
                                ? premium.colors.text.muted
                                : tone === "subtle"
                                    ? premium.colors.text.subtle
                                    : premium.colors.text.primary;

    const fontWeight =
        variant === "hero" || variant === "title" || variant === "bodyStrong"
            ? "900"
            : "700";

    return (
        <Text
            numberOfLines={numberOfLines}
            style={{
                color,
                fontSize,
                fontWeight,
                textTransform: uppercase ? "uppercase" : "none",
                letterSpacing: uppercase ? 0.9 : 0,
                ...(style ?? {}),
            }}
        >
            {children}
        </Text>
    );
}