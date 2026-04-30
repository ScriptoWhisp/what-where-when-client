import React, { useMemo, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { LeaderboardEntry } from '@/src/dto/game.dto';
import { hostApi } from '@/src/api/host';
import type { ApiError } from '@/src/api/client';
import { saveGameXlsx } from '@/src/host/game/utils/saveGameExport';
import { mixpanel } from "@/src/analytics/mixpanel";

interface HostLeaderboardProps {
    leaderboard: LeaderboardEntry[];
    gameId: number;
}

export const HostLeaderboard = ({ leaderboard, gameId }: HostLeaderboardProps) => {
    const [exporting, setExporting] = useState(false);

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

    const handleExportGame = async () => {
        const t0 = Date.now();
        setExporting(true);
        void mixpanel.track("Host Game Export Started", {
            game_id: gameId,
            format: "xlsx",
            teams_count: leaderboard.length,
        });
        try {
            const buffer = await hostApi.exportGameXlsx(gameId);
            await saveGameXlsx(gameId, buffer);
            void mixpanel.track("Host Game Export Succeeded", {
                game_id: gameId,
                format: "xlsx",
                size_bytes: buffer.byteLength,
                response_time_ms: Date.now() - t0,
            });
        } catch (e) {
            const err = e as ApiError;
            const msg =
                typeof err?.message === "string"
                    ? err.message
                    : "Не удалось выгрузить файл";
            void mixpanel.track("Host Game Export Failed", {
                game_id: gameId,
                format: "xlsx",
                error_message: msg,
                status: (err as any)?.status,
                response_time_ms: Date.now() - t0,
            });
            Alert.alert("Ошибка экспорта", msg);
        } finally {
            setExporting(false);
        }
    };

    return (
        <Box style={styles.container}>
            <ScrollView contentContainerStyle={{ margin: 10 }} showsVerticalScrollIndicator={false}>
                <Box row align="center" justify="flex-end" style={{ marginBottom: 10 }}>
                    <TouchableOpacity
                        onPress={handleExportGame}
                        disabled={exporting}
                        style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
                        accessibilityRole="button"
                        accessibilityLabel="Экспорт в Excel в формате листа Игра"
                    >
                        {exporting ? (
                            <ActivityIndicator size="small" color={colors.neutralLight.lightest} />
                        ) : (
                            <Feather name="download" size={18} color={colors.neutralLight.lightest} style={{ marginRight: 8 }} />
                        )}
                        <Text variant="bodyM" style={{ color: colors.neutralLight.lightest, fontWeight: '600' }}>
                            Экспорт (лист Игра)
                        </Text>
                    </TouchableOpacity>
                </Box>

                {groupedData.length === 0 ? (
                    <Box align="center" justify="center" style={styles.emptyBox}>
                        <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center' }}>
                            Список команд пока пуст
                        </Text>
                    </Box>
                ) : (
                    <Box style={{ gap: 10 }}>
                        {groupedData.map((group) => (
                            <Box key={group.categoryName}>

                                <Box row align="center" style={{ marginBottom: 10, marginLeft: 16, gap: 12 }}>
                                    <Text variant="h3" style={{ color: colors.neutralDark.darkest }}>
                                        {group.categoryName}
                                    </Text>
                                    <Box row align="center" style={[styles.badge, styles.badgeGray]}>
                                        <Text style={[styles.badgeText, styles.badgeTextGray]}>
                                            Команд: {group.teams.length}
                                        </Text>
                                    </Box>
                                </Box>

                                <Box row justify="space-between" align="center" style={styles.tableHeader}>
                                    <Text variant="captionM" style={{ width: 40, color: colors.neutralDark.medium }}>#</Text>
                                    <Text variant="captionM" style={{ flex: 1, color: colors.neutralDark.medium }}>Команда</Text>
                                    <Text variant="captionM" style={{ width: 60, textAlign: 'center', color: colors.neutralDark.medium }}>Очки</Text>
                                    <Text variant="captionM" style={{ width: 70, textAlign: 'right', color: colors.neutralDark.medium }}>Рейтинг</Text>
                                </Box>

                                <Box style={{ gap: 4 }}>
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
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.highlight.darkest,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    exportButtonDisabled: { opacity: 0.7 },
    emptyBox: {
        marginTop: 20, padding: 32,
        backgroundColor: colors.neutralLight.light, borderRadius: 12,
        borderWidth: 1, borderColor: colors.neutralLight.medium, borderStyle: 'dashed'
    },
    tableHeader: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderColor: colors.neutralLight.medium,
        marginBottom: 8
    },
    teamRow: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: colors.neutralLight.lightest
    },
    badge: {
        paddingHorizontal: 12, paddingVertical: 4,
        borderRadius: 12, borderWidth: 1
    },
    badgeText: {
        fontSize: 13, fontWeight: 'bold'
    },
    badgeGray: {
        backgroundColor: colors.neutralLight.light, borderColor: colors.neutralLight.dark
    },
    badgeTextGray: {
        color: colors.neutralDark.medium
    }
});