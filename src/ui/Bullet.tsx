import React from "react";
import { colors } from "../theme/colors";
import {StyleSheet, View} from "react-native";
import {Text, Variant} from "./Text";

export type BulletVariant = "plain" | "light" | "primary";

type Size = "sm" | "md" | "lg";

type Props = {
    value: number | string;
    variant?: BulletVariant;
    size?: Size;
};

const dimensions: Record<Size, { diameter: number; font: Variant }> = {
    sm: { diameter: 24, font: "captionM" },
    md: { diameter: 32, font: "captionM" },
    lg: { diameter: 96, font: "h1" },
};

export function Bullet({ value, variant = "light", size = "md" }: Readonly<Props>) {
    const { diameter, font } = dimensions[size];
    const label = String(value);

    if (variant === "plain") {
        return (
            <Text variant={font} style={[styles.text, styles.textPlain]} numberOfLines={1}>
                {label}
            </Text>
        );
    }

    return (
        <View
            style={[
                styles.circle,
                {
                    minWidth: diameter,
                    height: diameter,
                    borderRadius: diameter / 2,
                    paddingHorizontal: 6,
                },
                variant === "light" && styles.light,
                variant === "primary" && styles.primary,
            ]}
        >
            <Text
                variant={font}
                style={[
                    styles.text,
                    variant === "light" && styles.textLight,
                    variant === "primary" && styles.textPrimary,
                ]}
                numberOfLines={1}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    circle: {
        alignItems: "center",
        justifyContent: "center",
    },
    light: {
        backgroundColor: colors.highlight.lightest,
    },
    primary: {
        backgroundColor: colors.highlight.darkest,
    },
    text: {
        textAlign: "center",
    },
    textPlain: {
        color: colors.neutralDark.darkest,
    },
    textLight: {
        color: colors.neutralDark.darkest,
    },
    textPrimary: {
        color: colors.neutralLight.lightest,
    },
});
