import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { TimerBar } from '@/src/ui/TimerBar';

interface MiniGameWidgetProps {
    phaseText: string;
    timeLeft: number;
    totalTime: number;
    onPress: () => void;
}

export const MiniGameWidget = ({ phaseText, timeLeft, totalTime, onPress }: MiniGameWidgetProps) => {
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
            <Box style={styles.container}>
                <Box row justify="space-between" align="center">
                    <Text variant="bodyL" style={{ color: colors.neutralDark.darkest }}>
                        {timeLeft} сек · {phaseText}
                    </Text>
                </Box>

                <TimerBar timeLeft={timeLeft} totalTime={totalTime} />
            </Box>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.neutralLight.lightest,
        paddingVertical: 24,
        paddingHorizontal: 40,
        gap: 6
    }
});