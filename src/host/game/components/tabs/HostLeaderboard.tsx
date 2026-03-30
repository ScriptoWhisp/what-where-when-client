import React, { useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { LeaderboardEntry } from '@/src/dto/game.dto';

interface HostLeaderboardProps {
    leaderboard: LeaderboardEntry[];
}

export const HostLeaderboard = ({ leaderboard }: HostLeaderboardProps) => {

    const groupedData = useMemo(() => {
        const groups: { categoryName: string; teams: (LeaderboardEntry & { displayRank: number })[] }[] = [];
        const groupIndexMap = new Map<string, number>();

        leaderboard.forEach(team => {
            const categoryName = team.categoryName || 'Без категории';

            if (!groupIndexMap.has(categoryName)) {
                groupIndexMap.set(categoryName, groups.length);
                groups.push({ categoryName, teams: [] });
            }

            const currentGroup = groups[groupIndexMap.get(categoryName)!];
            const currentGroupTeams = currentGroup.teams;

            let displayRank = currentGroupTeams.length + 1;

            if (currentGroupTeams.length > 0) {
                const previousTeam = currentGroupTeams[currentGroupTeams.length - 1];
                if (previousTeam.score === team.score && previousTeam.rating === team.rating) {
                    displayRank = previousTeam.displayRank;
                }
            }

            currentGroupTeams.push({ ...team, displayRank });
        });

        return groups;
    }, [leaderboard]);

    return (
        <Box style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 32 }} showsVerticalScrollIndicator={false}>
                <Box mb={8}>
                    <Text variant="h2" style={{ color: colors.neutralDark.darkest }}>
                        Турнирная таблица
                    </Text>
                </Box>

                {groupedData.length === 0 ? (
                    <Box align="center" justify="center" style={styles.emptyBox}>
                        <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center' }}>
                            Список команд пока пуст
                        </Text>
                    </Box>
                ) : (
                    <Box style={{ gap: 40 }}>
                        {groupedData.map((group) => (
                            <Box key={group.categoryName}>

                                <Text variant="h3" style={{ color: colors.neutralDark.darkest, marginBottom: 16 }}>
                                    {group.categoryName}
                                </Text>

                                <Box row justify="space-between" align="center" style={styles.tableHeader}>
                                    <Text variant="captionM" style={{ width: 40, color: colors.neutralDark.medium }}>#</Text>
                                    <Text variant="captionM" style={{ flex: 1, color: colors.neutralDark.medium }}>Команда</Text>
                                    <Text variant="captionM" style={{ width: 60, textAlign: 'center', color: colors.neutralDark.medium }}>Очки</Text>
                                    <Text variant="captionM" style={{ width: 70, textAlign: 'right', color: colors.neutralDark.medium }}>Рейтинг</Text>
                                </Box>

                                <Box style={{ gap: 12 }}>
                                    {group.teams.map((team) => (
                                        <Box
                                            key={team.participantId}
                                            row
                                            align="center"
                                            justify="space-between"
                                            style={styles.teamRow}
                                        >
                                            <Text variant="bodyL" style={{ width: 40, fontWeight: 'bold', color: colors.neutralDark.darkest }}>
                                                {team.displayRank}
                                            </Text>

                                            <Box style={{ flex: 1 }}>
                                                <Text variant="bodyL" style={{ fontWeight: '600', color: colors.neutralDark.darkest }}>
                                                    {team.teamName}
                                                </Text>
                                            </Box>

                                            <Box style={{ width: 60, alignItems: 'center' }}>
                                                <Text variant="bodyL" style={{ fontWeight: 'bold', color: colors.highlight.darkest, fontSize: 18 }}>
                                                    {team.score}
                                                </Text>
                                            </Box>

                                            <Box style={{ width: 70, alignItems: 'flex-end' }}>
                                                <Text variant="bodyM" style={{ fontWeight: '600', color: colors.neutralDark.medium, fontSize: 16 }}>
                                                    {team.rating}
                                                </Text>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                            </Box>
                        ))}
                    </Box>
                )}
            </ScrollView>
        </Box>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    emptyBox: {
        marginTop: 20, padding: 32,
        backgroundColor: colors.neutralLight.light, borderRadius: 12,
        borderWidth: 1, borderColor: colors.neutralLight.medium, borderStyle: 'dashed'
    },
    tableHeader: {
        paddingHorizontal: 16, paddingBottom: 12,
        borderBottomWidth: 1, borderColor: colors.neutralLight.medium, marginBottom: 12
    },
    teamRow: {
        padding: 16, borderRadius: 8, borderWidth: 1,
        borderColor: colors.neutralLight.medium, backgroundColor: '#fff'
    }
});