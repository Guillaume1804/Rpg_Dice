// dice-universal/theme/premium/premiumAnimation.ts

import { Animated, Easing } from "react-native";

import type { PremiumTheme } from "./premiumTypes";

type PremiumTimingOptions = {
    toValue: number;
    duration?: number;
    useNativeDriver?: boolean;
    easing?: (value: number) => number;
};

type PremiumSpringOptions = {
    toValue: number;
    friction?: number;
    tension?: number;
    useNativeDriver?: boolean;
};

type PremiumVectorSpringOptions = {
    toValue: {
        x: number;
        y: number;
    };
    friction?: number;
    tension?: number;
    useNativeDriver?: boolean;
};

export function runPremiumTiming(
    theme: PremiumTheme,
    value: Animated.Value,
    options: PremiumTimingOptions,
): Animated.CompositeAnimation {
    if (theme.animation.normal <= 0) {
        value.setValue(options.toValue);
        return Animated.timing(value, {
            toValue: options.toValue,
            duration: 0,
            easing: Easing.linear,
            useNativeDriver: options.useNativeDriver ?? true,
        });
    }

    return Animated.timing(value, {
        toValue: options.toValue,
        duration: options.duration ?? theme.animation.normal,
        easing: options.easing ?? Easing.out(Easing.cubic),
        useNativeDriver: options.useNativeDriver ?? true,
    });
}

export function runPremiumSpring(
    theme: PremiumTheme,
    value: Animated.Value,
    options: PremiumSpringOptions,
): Animated.CompositeAnimation {
    if (theme.animation.normal <= 0) {
        value.setValue(options.toValue);
        return Animated.timing(value, {
            toValue: options.toValue,
            duration: 0,
            easing: Easing.linear,
            useNativeDriver: options.useNativeDriver ?? true,
        });
    }

    return Animated.spring(value, {
        toValue: options.toValue,
        friction: options.friction ?? theme.animation.spring.settle.friction,
        tension: options.tension ?? theme.animation.spring.settle.tension,
        useNativeDriver: options.useNativeDriver ?? true,
    });
}

export function runPremiumVectorSpring(
    theme: PremiumTheme,
    value: Animated.ValueXY,
    options: PremiumVectorSpringOptions,
): Animated.CompositeAnimation {
    if (theme.animation.normal <= 0) {
        value.setValue(options.toValue);
        return Animated.timing(value, {
            toValue: options.toValue,
            duration: 0,
            easing: Easing.linear,
            useNativeDriver: options.useNativeDriver ?? true,
        });
    }

    return Animated.spring(value, {
        toValue: options.toValue,
        friction: options.friction ?? theme.animation.spring.settle.friction,
        tension: options.tension ?? theme.animation.spring.settle.tension,
        useNativeDriver: options.useNativeDriver ?? true,
    });
}