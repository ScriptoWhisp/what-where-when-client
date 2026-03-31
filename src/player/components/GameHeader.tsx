import React from 'react';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';

interface GameHeaderProps {
    teamName: string;
    gameName?: string;
    roundInfo?: string;
}

export const GameHeader = ({ teamName, gameName, roundInfo }: GameHeaderProps) => {
    return (
        <Box height={56} gap={1} style={{ paddingVertical: 21 }}>
            <Text variant="h4" style={{ textAlign: 'center', color: colors.neutralDark.darkest}}>
                {teamName}
            </Text>

            {gameName && (
                <Text variant="bodyS" style={{ textAlign: 'center', color: colors.highlight.darkest, fontWeight: 'bold' }}>
                    {gameName}
                </Text>
            )}
            {roundInfo && (
                <Text variant="bodyS" style={{ textAlign: 'center', color: colors.neutralDark.light }}>
                    {roundInfo}
                </Text>
            )}
        </Box>
    );
};