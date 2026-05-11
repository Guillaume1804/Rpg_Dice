import { Pressable, Text, View } from "react-native";
import { useArcaneLayout } from "../../../theme/useArcaneLayout";
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
                paddingTop: arcane.spacing.sm,
                paddingBottom: Math.max(arcane.spacing.lg, layout.insets.bottom + 10),
                backgroundColor: "rgba(11,16,32,0.94)",
                borderTopWidth: 1,
                borderTopColor: arcane.colors.borderSoft,
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
                        borderRadius: arcane.radius.pill,
                        borderWidth: 1,
                        borderColor: disabled ? arcane.colors.border : arcane.colors.accent,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: disabled
                            ? arcane.colors.surfaceSoft
                            : arcane.colors.accent,
                        opacity: disabled ? 0.56 : pressed ? 0.86 : 1,
                        transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
                        ...arcane.shadow.button,
                    })}
                >
                    <Text
                        style={{
                            color: disabled ? arcane.colors.textSubtle : arcane.colors.black,
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