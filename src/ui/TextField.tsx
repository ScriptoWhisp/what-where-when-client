import React, { useState } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    ViewStyle,
    TextStyle,
    Platform, TextInputProps,
} from "react-native";
import { colors } from "../theme/colors";
import { metrics } from "../theme/metrics";
import { Text } from "./Text";


interface Props extends TextInputProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;

    placeholder?: string;

    helperText?: string;
    errorText?: string;

    disabled?: boolean;

    leftUnit?: string;
    rightIcon?: React.ReactNode;

    secureTextEntry?: boolean
    onRightIconPress?: () => void
};

export function TextField({
                              label,
                              value,
                              onChangeText,
                              placeholder,
                              helperText,
                              errorText,
                              disabled,
                              leftUnit,
                              rightIcon,
                              secureTextEntry,
                              onRightIconPress,
                              ...rest
                          }: Readonly<Props>) {
    const [focused, setFocused] = useState(false);

    const hasError = Boolean(errorText);
    const borderColor = hasError
        ? colors.error.dark
        : focused
            ? colors.highlight.darkest
            : colors.neutralLight.dark;

    const backgroundColor = disabled
        ? colors.neutralLight.light
        : colors.neutralLight.lightest;
    return (
        <View>
            {label && (
                <Text variant="bodyS" style={styles.label}>
                    {label}
                </Text>
            )}

            <View
                style={[
                    styles.inputContainer,
                    { borderColor, backgroundColor },
                ]}
            >
                {leftUnit && (
                    <Text variant="bodyM" style={styles.unit}>
                        {leftUnit}
                    </Text>
                )}

                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    editable={!disabled}
                    placeholderTextColor={colors.neutralDark.light}
                    style={styles.input}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    secureTextEntry={secureTextEntry}
                    {...rest}
                />

                {rightIcon ? (
                    onRightIconPress ? (
                        <View style={styles.icon} onTouchEnd={onRightIconPress as any}>
                            {rightIcon}
                        </View>
                    ) : (
                        <View style={styles.icon}>{rightIcon}</View>
                    )
                ) : null}
            </View>

            {(errorText || helperText) && (
                <Text
                    variant="captionM"
                    style={{
                        marginTop: 4,
                        color: hasError
                            ? colors.error.dark
                            : colors.neutralDark.light,
                    }}
                >
                    {errorText || helperText}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        marginBottom: 8,
        fontWeight: "600",
    } satisfies TextStyle,

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: metrics.radius.md, // 12
        borderWidth: 2,
        paddingHorizontal: metrics.space[4], // 16
        paddingVertical: metrics.space[3], // 12
        minHeight: 48
    } satisfies ViewStyle,

    input: {
        flex: 1,
        fontSize: Platform.OS === "web" ? 16 : 14,
        color: colors.neutralDark.darkest,

        borderWidth: 0,
        backgroundColor: "transparent",
        padding: 0,
        margin: 0,

        ...(Platform.OS === "web"
            ? ({
                outlineStyle: "none",
                boxShadow: "none",
            } as any)
            : null),
    } satisfies TextStyle,

    unit: {
        marginRight: 8,
        color: colors.neutralDark.light,
    },

    icon: {
        marginLeft: 8,
    },
});

