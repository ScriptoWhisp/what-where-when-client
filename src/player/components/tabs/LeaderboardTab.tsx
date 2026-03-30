import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
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
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Box mb={4} style={{ paddingHorizontal: 16 }}>
                <Text variant="h2" style={{ color: colors.neutralDark.darkest }}>
                    Результаты
                </Text>
                <Text variant="bodyM" style={{ color: colors.neutralDark.light, marginTop: 4 }}>
                    {myTeam?.categoryName ? `Лига: ${myTeam.categoryName}` : 'Общий зачет'}
                </Text>
            </Box>

            {rankedData.length === 0 ? (
                <Box align="center" justify="center" style={styles.emptyBox}>
                    <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center' }}>
                        Таблица результатов пока пуста
                    </Text>
                </Box>
            ) : (
                <Box>
                    <Box row style={styles.headerRow}>
                        <Text variant="captionM" style={[styles.headerText, { width: 32 }]}>#</Text>
                        <Text variant="captionM" style={[styles.headerText, { flex: 1 }]}>КОМАНДА</Text>
                        <Text variant="captionM" style={[styles.headerText, { width: 48, textAlign: 'right' }]}>ОЧКИ</Text>
                    </Box>

                    {rankedData.map((item) => {
                        const isMe = item.participantId === currentParticipantId;

                        return (
                            <Box
                                key={item.participantId}
                                row
                                align="center"
                                style={[
                                    styles.row,
                                    isMe && styles.myRow
                                ]}
                            >
                                <Text variant="bodyL" style={[styles.cellText, { width: 32, fontWeight: 'bold' }]}>
                                    {item.displayRank}
                                </Text>

                                <Text variant="bodyL" style={[styles.cellText, { flex: 1, fontWeight: isMe ? 'bold' : 'normal' }]}>
                                    {item.teamName}
                                </Text>

                                <Text variant="bodyL" style={[styles.cellText, { width: 48, textAlign: 'right', fontWeight: 'bold', color: colors.highlight.darkest }]}>
                                    {item.score}
                                </Text>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, paddingVertical: 12 },
    emptyBox: {
        marginTop: 40, marginHorizontal: 16, padding: 32,
        backgroundColor: colors.neutralLight.light, borderRadius: 12,
        borderWidth: 1, borderColor: colors.neutralLight.medium, borderStyle: 'dashed'
    },
    headerRow: {
        paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 1,
        borderBottomColor: colors.neutralLight.medium, marginTop: 16,
    },
    headerText: { color: colors.neutralDark.light, letterSpacing: 1 },
    row: {
        paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1,
        borderBottomColor: colors.neutralLight.light, minHeight: 48,
    },
    myRow: {
        backgroundColor: colors.highlight.lightest,
    },
    cellText: { color: colors.neutralDark.darkest }
});