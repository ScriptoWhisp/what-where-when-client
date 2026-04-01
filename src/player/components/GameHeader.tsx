import React from 'react';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';

interface GameHeaderProps {
    title: string;
}

export const GameHeader = ({ title }: GameHeaderProps) => {
    return (
        <Box height={56} gap={1} style={{ paddingVertical: 21 }}>
            <Text variant="h4" style={{ textAlign: 'center', color: colors.neutralDark.darkest}}>
                {title}
            </Text>
        </Box>
    );
};