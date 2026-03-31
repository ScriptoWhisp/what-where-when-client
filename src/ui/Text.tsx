import React from "react";
import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { typography } from "../theme/typography";
import { colors } from "../theme/colors";

export type Variant =
    | "h1" | "h2" | "h3" | "h4" | "h5"
    | "bodyXL" | "bodyL" | "bodyM" | "bodyS" | "bodyXS"
    | "actionL" | "actionM" | "actionS"
    | "captionM"
    | "muted";

export function Text(props: TextProps & { variant?: Variant }) {
    const { style, variant = "bodyM", ...rest } = props;
    return <RNText {...rest} style={[styles.base, variantStyles[variant], style]} />;
}

const styles = StyleSheet.create({
    base: {
        color: colors.neutralDark.darkest,
    },
});

const variantStyles = StyleSheet.create({
    h1: typography.heading.h1,
    h2: typography.heading.h2,
    h3: typography.heading.h3,
    h4: typography.heading.h4,
    h5: typography.heading.h5,

    bodyXL: typography.body.xl,
    bodyL: typography.body.l,
    bodyM: typography.body.m,
    bodyS: typography.body.s,
    bodyXS: typography.body.xs,

    actionL: typography.action.l,
    actionM: typography.action.m,
    actionS: typography.action.s,

    captionM: typography.caption.m,

    muted: { color: colors.neutralDark.light },
} as any);
