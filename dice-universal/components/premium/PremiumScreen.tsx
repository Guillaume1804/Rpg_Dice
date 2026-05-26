// dice-universal/components/premium/PremiumScreen.tsx

import type { ReactNode } from "react";
import { View } from "react-native";

import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";

type PremiumScreenProps = {
    children: ReactNode;
    padded?: boolean;
    style?: object;
};

export function PremiumScreen({
    children,
    padded = false,
    style,
}: PremiumScreenProps) {
    const premium = usePremiumTheme();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: premium.colors.background.primary,
                paddingHorizontal: padded ? premium.spacing.md : 0,
                ...(style ?? {}),
            }}
        >
            {children}
        </View>
    );
}