import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { ListItem } from '@/src/ui/ListItem';
import {Bullet} from '@/src/ui/Bullet';
import { colors } from '@/src/theme/colors';
import { LeaderboardEntry } from '@/src/dto/game.dto';

interface LeaderboardTabProps {
    leaderboard: LeaderboardEntry[];
    currentParticipantId: number | null;
}

export const LeaderboardTab = ({ leaderboard, currentParticipantId }: LeaderboardTabProps) => {
    const myTeam = leaderboard.find(team => team.participantId === currentParticipantId);

    const displayData = leaderboard.filter(team => team.categoryId === myTeam?.categoryId);

    let currentRank = 1;
    let previousScore: number | null = null;
    let previousRating: number | null = null;

    const rankedData = displayData.map((item, index) => {
        if (item.score !== previousScore || item.rating !== previousRating) {
            currentRank = index + 1;
            previousScore = item.score;
            previousRating = item.rating;
        }
        return { ...item, displayRank: currentRank };
    });

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                paddingTop: rankedData.length === 0 ? 10 : 16,
                backgroundColor: colors.neutralLight.light,
                justifyContent: rankedData.length === 0 ? 'center' : 'space-between',
            }}
            showsVerticalScrollIndicator={false}
        >
            {rankedData.length === 0 ? (
                <Box align="center" gap={2} style={{ justifyContent: 'center' }}>
                    <Text variant="h2" style={{ color: colors.neutralDark.darkest, maxWidth: 240, textAlign: 'center' }}>
                        Nothing here for now
                    </Text>
                    <Text variant="bodyM" style={{ color: colors.neutralDark.light, maxWidth: 240, textAlign: 'center' }}>
                        This is where you’ll find your placement among other teams
                    </Text>
                </Box>
            ) : (
                <Box gap={3} style={{ paddingHorizontal: 8 }}>
                    {rankedData.map((item) => {
                        const isMe = item.participantId === currentParticipantId;

                        return (
                            <ListItem
                                key={item.participantId}
                                title={`${item.displayRank}. ${item.teamName}`}
                                titleVariant="h5"
                                style={{borderRadius: 0}}
                                description={`Рейтинг: ${item.rating}`}
                                variant={isMe ? 'highlight' : 'default'}
                                right={
                                    <Bullet
                                        size={"sm"}
                                        value={item.score}
                                        variant={'primary'}
                                    />
                                }
                            />
                        );
                    })}
                </Box>
            )}
        </ScrollView>
    );
};
