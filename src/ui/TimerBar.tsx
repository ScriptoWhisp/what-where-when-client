import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '@/src/theme/colors';

interface TimerBarProps {
    timeLeft: number;
    totalTime: number;
    height?: number;
}

export const TimerBar = ({ timeLeft, totalTime, height = 8 }: TimerBarProps) => {
    const animatedWidth = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        const safeTotal = totalTime > 0 ? totalTime : 1;
        const percentage = Math.max(0, Math.min(100, (timeLeft / safeTotal) * 100));

        Animated.timing(animatedWidth, {
            toValue: percentage,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [timeLeft, totalTime]);

    const getBarColor = () => {
        const ratio = timeLeft / (totalTime > 0 ? totalTime : 1);
        if (ratio > 0.5) return colors.success.dark;
        if (ratio > 0.2) return colors.warning.dark;
        return colors.error.dark;
    };

    return (
        <View style={[styles.track, { height }]}>
            <Animated.View
                style={[
                    styles.bar,
                    {
                        backgroundColor: getBarColor(),
                        // Преобразуем число 0-100 в проценты '0%' - '100%'
                        width: animatedWidth.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                        }),
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    track: {
        width: '100%',
        backgroundColor: colors.neutralLight.medium,
        borderRadius: 4,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 4,
    },
});