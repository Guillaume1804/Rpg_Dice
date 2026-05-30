// dice-universal/components/premium/PremiumScreen.tsx

import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";

type PremiumScreenProps = {
  children: ReactNode;
  padded?: boolean;
  safeTop?: boolean;
  safeBottom?: boolean;
  style?: object;
};

export function PremiumScreen({
  children,
  padded = false,
  safeTop = false,
  safeBottom = false,
  style,
}: PremiumScreenProps) {
  const premium = usePremiumTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: premium.colors.background.primary,
        paddingHorizontal: padded ? premium.spacing.md : 0,
        paddingTop: safeTop ? insets.top : 0,
        paddingBottom: safeBottom
          ? Math.max(insets.bottom, premium.spacing.md)
          : 0,
        ...(style ?? {}),
      }}
    >
      {children}
    </View>
  );
}
