// dice-universal/components/premium/PremiumDivider.tsx

import { View } from "react-native";

import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";

export function PremiumDivider({ style }: { style?: object }) {
    const premium = usePremiumTheme();

    return (
        <View
            style={{
                height: 1,
                backgroundColor: premium.colors.border.subtle,
                ...(style ?? {}),
            }}
        />
    );
}