import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ArcaneLayoutSize = "compact" | "medium" | "expanded";

export function useArcaneLayout() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    return useMemo(() => {
        const size: ArcaneLayoutSize =
            width >= 900 ? "expanded" : width >= 600 ? "medium" : "compact";

        const horizontalPadding =
            size === "expanded" ? 32 : size === "medium" ? 24 : 16;

        const maxContentWidth =
            size === "expanded" ? 880 : size === "medium" ? 720 : undefined;

        const isSmallHeight = height < 720;
        const isLargeScreen = size !== "compact";

        return {
            width,
            height,
            insets,
            size,
            isCompact: size === "compact",
            isMedium: size === "medium",
            isExpanded: size === "expanded",
            isSmallHeight,
            isLargeScreen,
            horizontalPadding,
            maxContentWidth,
            bottomBarHeight: 96 + insets.bottom,
            scrollBottomPadding: 140 + insets.bottom,
        };
    }, [width, height, insets]);
}