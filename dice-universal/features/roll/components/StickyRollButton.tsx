// dice-universal/features/roll/components/StickyRollButton.tsx

import { Pressable, Text, View } from "react-native";
import { useArcaneLayout } from "../../../theme/useArcaneLayout";
import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

type StickyRollButtonProps = {
  disabled: boolean;
  label?: string;
  disabledLabel?: string;
  onPress: () => void | Promise<void>;
};

export function StickyRollButton({
  disabled,
  label = "🎲 LANCER",
  disabledLabel = "🎲 Prépare un jet",
  onPress,
}: StickyRollButtonProps) {
  const { theme } = useArcaneTheme();
  const layout = useArcaneLayout();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: layout.horizontalPadding,
        paddingTop: theme.spacing.sm,
        paddingBottom: Math.max(theme.spacing.lg, layout.insets.bottom + 10),
        backgroundColor: theme.colors.backgroundElevated,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderSoft,
      }}
    >
      <View
        style={{
          alignSelf: "center",
          width: "100%",
          maxWidth: layout.maxContentWidth,
        }}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => ({
            minHeight: 60,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: disabled ? theme.colors.border : theme.colors.accent,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: disabled
              ? theme.colors.surfaceSoft
              : pressed
                ? theme.colors.surfaceSoft
                : theme.colors.accentSoft,
            opacity: disabled ? 0.56 : pressed ? 0.9 : 1,
            transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
            ...theme.shadow.button,
          })}
        >
          <Text
            style={{
              color: disabled ? theme.colors.textSubtle : theme.colors.text,
              fontSize: 18,
              fontWeight: "900",
              letterSpacing: 0.9,
            }}
          >
            {disabled ? disabledLabel : label}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
