import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { Text } from "./Text";
import {IconName} from "@/src/ui/Icon";

type Variant = "light" | "solid";
type Size = "md";

export function Tag({
                        text = "TAG",
                        variant = "light",
                        size = "md",
                        leftIcon,
                        rightIcon,
                        showText = true,
                        style,
                    }: Readonly<{
    text?: string;
    variant?: Variant;
    size?: Size;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    showText?: boolean;
    style?: ViewStyle;
}>) {
    return (
        <View style={[styles.base, sizeStyles[size], variantStyles[variant], style]}>
            {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

            {showText ? (
                <Text variant="captionM" style={{...textStyles[variant], paddingHorizontal: 4}}>
                    {text.toUpperCase()}
                </Text>
            ) : null}

            {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 999, // pill
    },

    iconLeft: { },
    iconRight: { },
});

const sizeStyles = StyleSheet.create({
    md: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        gap: 4
    },
} as const);

const variantStyles = StyleSheet.create({
    light: {
        backgroundColor: colors.highlight.lightest,
    },
    solid: {
        backgroundColor: colors.highlight.darkest,
    },
} as const);

const textStyles = StyleSheet.create({
    light: { color: colors.highlight.darkest },
    solid: { color: colors.neutralLight.lightest },
} as const);
