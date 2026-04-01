import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { LeaderboardEntry } from '@/src/dto/game.dto';
import { rankLeaderboardEntries } from '@/src/player/leaderboardRank';
import { PlayerLeaderboardListItem } from '@/src/player/components/PlayerLeaderboardListItem';

interface LeaderboardTabProps {
    leaderboard: LeaderboardEntry[];
    currentParticipantId: number | null;
}

export const LeaderboardTab = ({ leaderboard, currentParticipantId }: LeaderboardTabProps) => {
    const { t } = useTranslation();
    const myTeam = leaderboard.find((team) => team.participantId === currentParticipantId);

    const displayData = leaderboard.filter((team) => team.categoryId === myTeam?.categoryId);

    const rankedData = rankLeaderboardEntries(displayData);

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                paddingTop: rankedData.length === 0 ? 10 : 16,
                backgroundColor: colors.neutralLight.light,
                justifyContent: rankedData.length === 0 ? 'center' : 'flex-start',
                paddingBottom: 16,
            }}
            showsVerticalScrollIndicator={false}
        >
            {rankedData.length === 0 ? (
                <Box align="center" gap={2} style={{ justifyContent: 'center' }}>
                    <Text variant="h2" style={{ color: colors.neutralDark.darkest, maxWidth: 240, textAlign: 'center' }}>
                        {t('leaderboardTab.emptyTitle')}
                    </Text>
                    <Text variant="bodyM" style={{ color: colors.neutralDark.light, maxWidth: 240, textAlign: 'center' }}>
                        {t('leaderboardTab.emptySubtitle')}
                    </Text>
                </Box>
            ) : (
                <Box style={{ paddingHorizontal: 8 }}>
                    {rankedData.map((item) => {
                        const isMe = item.participantId === currentParticipantId;
                        return (
                            <PlayerLeaderboardListItem
                                key={item.participantId}
                                title={`${item.displayRank}. ${item.teamName}`}
                                description={t('leaderboardTab.rating', { rating: item.rating })}
                                score={item.score}
                                highlight={isMe}
                            />
                        );
                    })}
                </Box>
            )}
        </ScrollView>
    );
};
