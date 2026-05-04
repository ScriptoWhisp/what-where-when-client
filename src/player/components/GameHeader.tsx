import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';

interface GameHeaderProps {
    title: string;
    onBack?: () => void;
}

export const GameHeader = ({ title, onBack }: GameHeaderProps) => {
    return (
        <Box height={56} gap={1} style={styles.wrap}>
            {onBack ? (
                <Pressable
                    onPress={onBack}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    style={styles.backBtn}
                >
                    <Ionicons name="chevron-back" size={22} color={colors.neutralDark.darkest} />
                </Pressable>
            ) : null}

            <Text variant="h4" style={styles.title}>
                {title}
            </Text>
        </Box>
    );
};

const styles = StyleSheet.create({
    wrap: {
        paddingVertical: 21,
        justifyContent: 'center',
    },
    backBtn: {
        position: 'absolute',
        left: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        color: colors.neutralDark.darkest,
    },
});