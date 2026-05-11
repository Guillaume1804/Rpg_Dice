import { Pressable, Text, View } from "react-native";

import { arcane } from "../../../theme/arcaneTheme";

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
    return (
        <View
            pointerEvents="box-none"
            style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                paddingHorizontal: 16,
                paddingTop: 10,
                paddingBottom: 18,
                backgroundColor: "rgba(11,16,32,0.94)",
                borderTopWidth: 1,
                borderTopColor: arcane.colors.border,
            }}
        >
            <Pressable
                onPress={onPress}
                disabled={disabled}
                style={({ pressed }) => ({
                    minHeight: 64,
                    borderRadius: arcane.radius.xl,
                    borderWidth: 1,
                    borderColor: disabled ? arcane.colors.border : arcane.colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: disabled
                        ? arcane.colors.surfaceSoft
                        : arcane.colors.accent,
                    opacity: disabled ? 0.58 : pressed ? 0.9 : 1,
                    transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
                    ...arcane.shadow.button,
                })}
            >
                <Text
                    style={{
                        color: disabled ? arcane.colors.textMuted : arcane.colors.background,
                        fontSize: 18,
                        fontWeight: "900",
                        letterSpacing: 1,
                    }}
                >
                    {disabled ? disabledLabel : label}
                </Text>
            </Pressable>
        </View>
    );
}