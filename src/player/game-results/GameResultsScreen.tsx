import React, { useCallback, useEffect, useMemo } from 'react';
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
import { mixpanel } from '@/src/analytics/mixpanel';

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

    useEffect(() => {
        void mixpanel.track("Player Game Results Mounted", {
            game_id: gid ? Number(gid) : null,
            participant_id: currentParticipantId,
            has_participant_id: currentParticipantId != null,
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!loading && !error && myTeam) {
            void mixpanel.track("Player Game Results My Team", {
                game_id: gid ? Number(gid) : null,
                participant_id: currentParticipantId,
                my_score: myTeam.score,
                my_rating: myTeam.rating,
                category_id: (myTeam as any).categoryId ?? null,
                teams_in_category: rankedData.length,
                my_rank:
                    rankedData.find((r) => r.participantId === currentParticipantId)
                        ?.displayRank ?? null,
            });
        }
    }, [loading, error, myTeam, rankedData, gid, currentParticipantId]);

    const openFeedback = useCallback(() => {
        if (currentParticipantId == null || !gid) return;
        void mixpanel.track("Player Feedback Clicked", {
            source: "game_results",
            game_id: Number(gid),
            participant_id: currentParticipantId,
            teams_count: rankedData.length,
            my_score: myTeam?.score ?? null,
        });
        router.push({
            pathname: '/(player)/feedback',
            params: {
                gameId: gid,
                participantId: String(currentParticipantId),
            },
        });
    }, [router, gid, currentParticipantId, rankedData.length, myTeam?.score]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }}>
            <Box flex={1} align="center">
                <Box maxWidth={450} width="100%" flex={1}>
                    <GameHeader title={t("resultsScreen.title")} />
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
