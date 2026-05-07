import { Pressable, Text, View } from "react-native";

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
                backgroundColor: "rgba(255,255,255,0.96)",
                borderTopWidth: 1,
            }}
        >
            <Pressable
                onPress={onPress}
                disabled={disabled}
                style={{
                    minHeight: 58,
                    borderRadius: 999,
                    borderWidth: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: disabled ? 0.45 : 1,
                }}
            >
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: "900",
                        letterSpacing: 0.8,
                    }}
                >
                    {disabled ? disabledLabel : label}
                </Text>
            </Pressable>
        </View>
    );
}