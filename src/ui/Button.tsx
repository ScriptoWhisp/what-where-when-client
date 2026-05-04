import React from "react";
import { Platform, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { metrics } from "../theme/metrics";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "tertiary";
type Size = "md";

export function Button({
                           title,
                           onPress,
                           variant = "primary",
                           size = "md",
                           disabled,
                           loading,
                           leftIcon,
                           rightIcon,
                       }: Readonly<{
    title: string;
    onPress?: () => void;
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}>) {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            style={({ pressed }) => [
                styles.base,
                Platform.OS === "web" && styles.noSelectWeb,
                sizeStyles[size],
                variantStyles[variant],
                isDisabled && styles.disabled,
                pressed && !isDisabled && styles.pressed,
            ]}
        >
            <View style={styles.content}>
                {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

                <Text variant="actionM" style={textStyles[variant]}>
                    {title}
                </Text>

                {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: metrics.radius.md, // 12
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48
    } satisfies ViewStyle,
    noSelectWeb: Platform.OS === "web"
        ? ({
            userSelect: "none",
        } as any)
        : ({} as any),

    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    iconLeft: { marginRight: 8 },
    iconRight: { marginLeft: 8 },

    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.85 },
});

const sizeStyles = StyleSheet.create({
    md: {
        paddingHorizontal: metrics.space[4], // 16
        paddingVertical: metrics.space[3], // 12
    },
} satisfies Record<Size, ViewStyle>);

const variantStyles = StyleSheet.create({
    primary: {
        backgroundColor: colors.highlight.darkest,
    },
    secondary: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: colors.highlight.darkest,
    },
    tertiary: {
        backgroundColor: "transparent",
    },
} satisfies Record<Variant, ViewStyle>);

const textStyles = StyleSheet.create({
    primary: { color: colors.neutralLight.lightest },
    secondary: { color: colors.highlight.darkest },
    tertiary: { color: colors.highlight.darkest },
} as const);
