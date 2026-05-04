import React, { useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from "react-i18next";
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { ParticipantDomain } from "@/src/dto/game.dto";

interface HostTeamsProps {
    participants: ParticipantDomain[];
}

export const Teams = ({ participants }: HostTeamsProps) => {
    const { t } = useTranslation();
    const totalCount = participants.length;
    const onlineCount = participants.filter(p => p.isConnected).length;
    const offlineCount = totalCount - onlineCount;

    const sortedParticipants = useMemo(() => {
        return [...participants].sort((a, b) => {
            if (a.isConnected !== b.isConnected) {
                return a.isConnected ? -1 : 1;
            }
            const nameA = (a as any).teamName || t("hostTeamsTab.teamFallback", { id: a.teamId });
            const nameB = (b as any).teamName || t("hostTeamsTab.teamFallback", { id: b.teamId });
            return nameA.localeCompare(nameB);
        });
    }, [participants, t]);

    return (
        <Box style={styles.container}>
            <ScrollView contentContainerStyle={{ margin: 10 }} showsVerticalScrollIndicator={false}>

                <Box style={{marginBottom: 10}}>
                    <Box row align="center" style={{ gap: 16, flexWrap: 'wrap' }}>
                        <Box row align="center" style={[styles.badge, styles.badgeBlue]}>
                            <Text style={[styles.badgeText, styles.badgeTextBlue]}>
                                {t("hostTeamsTab.total", { count: totalCount })}
                            </Text>
                        </Box>
                        <Box row align="center" style={[styles.badge, styles.badgeGreen]}>
                            <Text style={[styles.badgeText, styles.badgeTextGreen]}>
                                {t("hostTeamsTab.online", { count: onlineCount })}
                            </Text>
                        </Box>
                        <Box row align="center" style={[styles.badge, styles.badgeGray]}>
                            <Text style={[styles.badgeText, styles.badgeTextGray]}>
                                {t("hostTeamsTab.offline", { count: offlineCount })}
                            </Text>
                        </Box>
                    </Box>
                </Box>

                {sortedParticipants.length === 0 ? (
                    <Box align="center" justify="center" style={styles.emptyBox}>
                        <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center' }}>
                            {t("hostTeamsTab.empty")}
                        </Text>
                    </Box>
                ) : (
                    <Box style={{ gap: 12 }}>
                        {sortedParticipants.map((participant, index) => {
                            const teamName = (participant as any).teamName || t("hostTeamsTab.teamFallback", { id: participant.teamId });
                            const categoryName = (participant as any).categoryName;

                            return (
                                <Box
                                    key={participant.id}
                                    row
                                    align="center"
                                    justify="space-between"
                                    style={[
                                        styles.teamRow,
                                        !participant.isConnected && styles.teamRowOffline
                                    ]}
                                >
                                    <Box row align="center">
                                        <Text variant="bodyM" style={{ color: colors.neutralDark.light, width: 24, fontWeight: '600' }}>
                                            {index + 1}.
                                        </Text>

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

                                    <Box style={[
                                        styles.statusDot,
                                        {
                                            backgroundColor: participant.isConnected ? colors.success.medium : colors.neutralLight.dark,
                                            shadowColor: participant.isConnected ? colors.success.medium : 'transparent',
                                        }
                                    ]} />
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
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: colors.neutralLight.lightest
    },
    teamRowOffline: {
        opacity: 0.5,
        backgroundColor: colors.neutralLight.lightest,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 3,
    },
    badge: {
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 12, borderWidth: 1
    },
    badgeText: {
        fontSize: 14, fontWeight: 'bold'
    },
    badgeBlue: {
        backgroundColor: colors.highlight.lightest, borderColor: colors.highlight.light
    },
    badgeTextBlue: {
        color: colors.highlight.darkest
    },
    badgeGreen: {
        backgroundColor: colors.success.light, borderColor: colors.success.medium
    },
    badgeTextGreen: {
        color: colors.success.dark
    },
    badgeGray: {
        backgroundColor: colors.neutralLight.light, borderColor: colors.neutralLight.dark
    },
    badgeTextGray: {
        color: colors.neutralDark.medium
    }
});