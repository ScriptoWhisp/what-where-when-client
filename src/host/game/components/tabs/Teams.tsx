import React, { useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import {ParticipantDomain} from "@/src/dto/game.dto";

interface HostTeamsProps {
    participants: ParticipantDomain[];
}

export const Teams = ({ participants }: HostTeamsProps) => {

    const sortedParticipants = useMemo(() => {
        return [...participants].sort((a, b) => {
            if (a.isConnected !== b.isConnected) {
                return a.isConnected ? -1 : 1;
            }
            const nameA = (a as any).teamName || `Команда #${a.teamId}`;
            const nameB = (b as any).teamName || `Команда #${b.teamId}`;
            return nameA.localeCompare(nameB);
        });
    }, [participants]);

    return (
        <Box style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 32 }} showsVerticalScrollIndicator={false}>
                <Box mb={8}>
                    <Text variant="h2" style={{ color: colors.neutralDark.darkest }}>
                        Команды в игре
                    </Text>
                    <Text variant="bodyM" style={{ color: colors.neutralDark.light, marginTop: 4 }}>
                        Следите за подключением участников в реальном времени
                    </Text>
                </Box>

                {sortedParticipants.length === 0 ? (
                    <Box align="center" justify="center" style={styles.emptyBox}>
                        <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center' }}>
                            В игре пока нет участников
                        </Text>
                    </Box>
                ) : (
                    <Box style={{ gap: 12 }}>
                        {sortedParticipants.map((participant) => {
                            const teamName = (participant as any).teamName || `Команда #${participant.teamId}`;
                            const categoryName = (participant as any).categoryName;

                            return (
                                <Box
                                    key={participant.id}
                                    row
                                    align="center"
                                    justify="space-between"
                                    style={styles.teamRow}
                                >
                                    <Box row align="center" gap={8}>
                                        {/* Индикатор статуса */}
                                        <Box style={[
                                            styles.statusDot,
                                            {
                                                backgroundColor: participant.isConnected ? '#4CAF50' : '#9E9E9E',
                                                shadowColor: participant.isConnected ? '#4CAF50' : 'transparent',
                                            }
                                        ]} />

                                        <Box>
                                            <Text variant="bodyL" style={{ fontWeight: '600', color: colors.neutralDark.darkest }}>
                                                {teamName}
                                            </Text>
                                            {categoryName && (
                                                <Text variant="captionM" style={{ color: colors.neutralDark.light, marginTop: 2 }}>
                                                    {categoryName}
                                                </Text>
                                            )}
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Text
                                            variant="captionM"
                                            style={{
                                                fontWeight: '600',
                                                color: participant.isConnected ? '#388E3C' : colors.neutralDark.light
                                            }}
                                        >
                                            {participant.isConnected ? 'Онлайн' : 'Офлайн'}
                                        </Text>
                                    </Box>
                                </Box>
                            );
                        })}
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
    teamRow: {
        padding: 16, borderRadius: 8, borderWidth: 1,
        borderColor: colors.neutralLight.medium, backgroundColor: '#fff'
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 3, // Для Android
    }
});