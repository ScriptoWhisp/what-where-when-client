import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

type Size = "sm" | "md" | "lg";

const dimensions: Record<Size, { outer: number; border: number; dot: number }> = {
    sm: { outer: 18, border: 2, dot: 6 },
    md: { outer: 24, border: 2, dot: 10 },
    lg: { outer: 32, border: 2, dot: 12 },
};

type Props = {
    selected: boolean;
    size?: Size;
    disabled?: boolean;
};

/** Decorative radio indicator; put accessibility on the parent row (e.g. `accessibilityRole="radio"`). */
export function RadioButton({ selected, size = "md", disabled }: Readonly<Props>) {
    const dim = dimensions[size];

    return (
        <View
            pointerEvents="none"
            style={[
                styles.outer,
                {
                    width: dim.outer,
                    height: dim.outer,
                    borderRadius: dim.outer / 2,
                    borderColor: selected ? colors.highlight.darkest : colors.neutralLight.dark,
                    backgroundColor: selected ? colors.highlight.darkest : "transparent",
                    opacity: disabled ? 0.45 : 1,
                },
            ]}
        >
            {selected ? (
                <View
                    style={[
                        styles.dot,
                        {
                            width: dim.dot,
                            height: dim.dot,
                            borderRadius: dim.dot / 2,
                        },
                    ]}
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    outer: {
        alignItems: "center",
        justifyContent: "center",
    },
    dot: {
        backgroundColor: colors.neutralLight.lightest,
    },
});
