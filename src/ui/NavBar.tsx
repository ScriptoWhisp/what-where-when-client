import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { metrics } from "../theme/metrics";
import { Text } from "./Text";

type Props = {
    title: string;

    leftText?: string;
    leftIcon?: React.ReactNode;
    onLeftPress?: () => void;

    rightText?: string;
    rightIcon?: React.ReactNode;
    onRightPress?: () => void;

    style?: ViewStyle;
};

export function NavBar({
                           title,
                           leftText,
                           leftIcon,
                           onLeftPress,
                           rightText,
                           rightIcon,
                           onRightPress,
                           style,
                       }: Props) {
    return (
        <View style={[styles.root, style]}>
    <View style={styles.side}>
    {(leftText || leftIcon) ? (
        <Pressable onPress={onLeftPress} hitSlop={10}>
        {leftIcon ? leftIcon : <Text style={styles.link}>{leftText}</Text>}
                </Pressable>
) : (
        <View style={styles.spacer} />
)}
    </View>

    <View style={styles.center}>
    <Text variant="h1">{title}</Text>
        </View>

        <View style={[styles.side, { alignItems: "flex-end" }]}>
    {(rightText || rightIcon) ? (
        <Pressable onPress={onRightPress} hitSlop={10}>
        {rightIcon ? rightIcon : <Text variant="bodyS" style={styles.link}>{rightText}</Text>}
                </Pressable>
    ) : (
        <View style={styles.spacer} />
    )}
        </View>
        </View>
    );
    }

    const styles = StyleSheet.create({
        root: {
            height: 56,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: metrics.space[4],
            margin: 10,
            backgroundColor: colors.neutralLight.lightest,
        },
        side: { width: 120, justifyContent: "center" },
        center: { flex: 1, alignItems: "center" },
        spacer: { height: 1, width: 1 },
        link: { color: colors.highlight.darkest, fontWeight: 'bold', fontSize: 14 },
    });
