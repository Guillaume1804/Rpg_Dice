// dice-universal/features/roll/premium/PremiumRollScreenBackground.tsx

import { View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

export function PremiumRollScreenBackground() {
    const premium = usePremiumTheme();

    return (
        <View
            pointerEvents="none"
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: "hidden",
                backgroundColor: premium.colors.background.primary,
            }}
        >
            <View
                style={{
                    position: "absolute",
                    top: -80,
                    left: -80,
                    width: 240,
                    height: 240,
                    borderRadius: premium.radius.pill,
                    backgroundColor: premium.colors.surface.subtle,
                    opacity: 0.42,
                }}
            />

            <View
                style={{
                    position: "absolute",
                    top: 110,
                    alignSelf: "center",
                    width: 310,
                    height: 310,
                    borderRadius: premium.radius.pill,
                    backgroundColor: premium.colors.accent.softer,
                    opacity: 0.72,
                }}
            />

            <View
                style={{
                    position: "absolute",
                    top: 190,
                    alignSelf: "center",
                    width: 190,
                    height: 190,
                    borderRadius: premium.radius.pill,
                    backgroundColor: premium.colors.accent.soft,
                    opacity: 0.18,
                }}
            />

            <View
                style={{
                    position: "absolute",
                    right: -110,
                    top: 80,
                    width: 260,
                    height: 260,
                    borderRadius: premium.radius.pill,
                    backgroundColor: premium.colors.accent.secondary,
                    opacity: 0.025,
                }}
            />

            <View
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 210,
                    backgroundColor: premium.colors.background.bottomFade,
                }}
            />

            <View
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 96,
                    backgroundColor: "rgba(0, 0, 0, 0.36)",
                }}
            />
        </View>
    );
}