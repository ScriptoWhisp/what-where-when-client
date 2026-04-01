import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/src/ui/Box';
import { colors } from '@/src/theme/colors';
import { GameHeader } from '@/src/player/components/GameHeader';
import { buildRankedDisplay } from '@/src/player/game-results/buildDisplay';
import { useGameResultsLeaderboard } from '@/src/player/game-results/hooks/useGameResultsLeaderboard';
import {
    GameResultsErrorView,
    GameResultsFilledView,
    GameResultsLoadingView,
} from '@/src/player/game-results/GameResultsViews';

function parseParticipantId(raw: string | undefined): number | null {
    if (!raw || raw.length === 0) return null;
    const n = parseInt(String(raw), 10);
    return Number.isFinite(n) ? n : null;
}

export function GameResultsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { gameId, teamName, participantId: participantIdParam } = useLocalSearchParams<{
        gameId?: string;
        teamId?: string;
        teamName?: string;
        participantId?: string;
    }>();

    const gid = gameId ? String(gameId) : '';
    const currentParticipantId = parseParticipantId(
        participantIdParam ? String(participantIdParam) : undefined,
    );
    const loadError = t('resultsScreen.loadError');
    const { leaderboard, loading, error } = useGameResultsLeaderboard(gid, loadError);

    const { rankedData, myTeam } = useMemo(
        () => buildRankedDisplay(leaderboard, currentParticipantId),
        [leaderboard, currentParticipantId],
    );

    const openFeedback = useCallback(() => {
        if (currentParticipantId == null || !gid) return;
        router.push({
            pathname: '/(player)/feedback',
            params: {
                gameId: gid,
                participantId: String(currentParticipantId),
            },
        });
    }, [router, gid, currentParticipantId]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }}>
            <Box flex={1} align="center">
                <Box maxWidth={450} width="100%" flex={1}>
                    <GameHeader teamName={t("resultsScreen.title")} />
                    <Box flex={1} style={{ width: '100%' }}>
                        {loading ? (
                            <GameResultsLoadingView />
                        ) : error ? (
                            <GameResultsErrorView message={error} />
                        ) : (
                            <GameResultsFilledView
                                rankedData={rankedData}
                                currentParticipantId={currentParticipantId}
                                myTeam={myTeam}
                                onFeedback={openFeedback}
                                showFeedback={currentParticipantId != null && rankedData.length > 0}
                            />
                        )}
                    </Box>
                </Box>
            </Box>
        </SafeAreaView>
    );
}
