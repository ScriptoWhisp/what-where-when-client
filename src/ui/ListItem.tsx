import React from "react";
import {
    Pressable,
    PressableProps,
    StyleProp,
    StyleSheet,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";
import { colors } from "../theme/colors";
import { metrics } from "../theme/metrics";
import { Text } from "./Text";

type ListItemVariant = "default" | "highlight" | "empty";

type TitleVariant = React.ComponentProps<typeof Text>["variant"];

type Props = {
    title: string;
    description?: string;

    left?: React.ReactNode;
    right?: React.ReactNode;

    variant?: ListItemVariant;
    titleVariant?: TitleVariant;
    titleStyle?: StyleProp<TextStyle>;

    onPress?: () => void;
    style?: StyleProp<ViewStyle>;

    accessibilityRole?: PressableProps["accessibilityRole"];
    accessibilityState?: PressableProps["accessibilityState"];
};


export function ListItem({
                             title,
                             description,
                             left,
                             right,
                             onPress,
                             style,
                             variant = "default",
                             titleVariant = "h5",
                             titleStyle,
                             accessibilityRole,
                             accessibilityState,
                         }: Readonly<Props>) {
    const Root: any = onPress ? Pressable : View;

    return (
        <Root
            onPress={onPress}
            accessibilityRole={accessibilityRole}
            accessibilityState={accessibilityState}
            style={[
                styles.root,
                variantStyles[variant],
                style]}
        >
            {left ? <View style={styles.left}>{left}</View> : null}

            <View style={styles.mid}>
                <Text variant={titleVariant} style={[styles.title, titleStyle]}>
                    {title}
                </Text>

                {description ? (
                    <Text variant="bodyS" style={styles.desc}>
                        {description}
                    </Text>
                ) : null}
            </View>

            {right ? <View style={styles.right}>{right}</View> : null}
        </Root>
    );
}

const variantStyles = StyleSheet.create({
    default: {
        backgroundColor: colors.neutralLight.light,
    },
    highlight: {
        backgroundColor: colors.highlight.lightest,
    },
    empty: {},
});

const styles = StyleSheet.create({
    root: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: metrics.radius.lg,
        backgroundColor: colors.neutralLight.lightest,
        gap: 16
    },
    left: { alignItems: "center", justifyContent: "center" },
    mid: { flex: 1, gap: 4 },
    right: { alignItems: "center", justifyContent: "center" },
    title: { color: colors.neutralDark.darkest},
    desc: { color: colors.neutralDark.light },
});
