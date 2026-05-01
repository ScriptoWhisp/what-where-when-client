import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/src/ui/Box';
import { colors } from '@/src/theme/colors';

import { GameHeader } from '../../src/player/components/GameHeader';
import { GameBottomTabs, TabType } from '../../src/player/components/GameBottomTabs';
import { MiniGameWidget } from '../../src/player/components/MiniGameWidget';

import { PlayTab } from '@/src/player/components/tabs/PlayTab';
import { HistoryTab } from '@/src/player/components/tabs/HistoryTab';

import { usePlayerGame, readStoredParticipantId } from '@/src/player/hooks/usePlayerGame';
import { GamePhase, GameStatuses } from '@/src/dto/common.dto';
import { Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { LeaderboardTab } from "@/src/player/components/tabs/LeaderboardTab";
import { mixpanel } from "@/src/analytics/mixpanel";

export default function GameScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { gameId, teamId, teamName } = useLocalSearchParams();

    const [activeTab, setActiveTab] = useState<TabType>('play');
    const prevTabRef = React.useRef<TabType>('play');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    const [hasGameStarted, setHasGameStarted] = useState(false);

    React.useEffect(() => {
        void mixpanel.track("Player Game Mounted", {
            game_id: Number(gameId),
            team_id: Number(teamId),
            team_name: teamName as string | undefined,
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
            const initialHeight = window.innerHeight;
            const handleResize = () => {
                if (initialHeight - window.innerHeight > 100) {
                    setKeyboardVisible(true);
                } else {
                    setKeyboardVisible(false);
                }
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
        else if (Platform.OS !== 'web') {
            const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
            const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

            const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
            const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

            return () => {
                showSub.remove();
                hideSub.remove();
            };
        }
    }, []);

    const {
        gameStatus,
        gameStarted,
        phase,
        timer,
        activeQuestionNumber,
        lastAnswerStatus,
        submitAnswer,
        history,
        leaderboard,
        participantId,
        finishedJoinBlocked,
    } = usePlayerGame(
        gameId as string,
        teamId as string,
        teamName as string
    );

    const didRedirectToResultsRef = useRef(false);

    useLayoutEffect(() => {
        if (didRedirectToResultsRef.current) return;

        const gid = String(gameId ?? '');
        const tid = String(teamId ?? '');
        const tname = String(teamName ?? '');

        if (gameStatus === GameStatuses.FINISHED && participantId != null) {
            didRedirectToResultsRef.current = true;
            void mixpanel.track("Player Results Redirect", {
                game_id: Number(gameId),
                team_id: Number(teamId),
                participant_id: participantId,
                reason: "game_finished",
            });
            router.replace({
                pathname: '/(player)/game-results' as any,
                params: {
                    gameId: gid,
                    teamId: tid,
                    teamName: tname,
                    participantId: String(participantId),
                },
            });
            return;
        }

        if (finishedJoinBlocked) {
            didRedirectToResultsRef.current = true;
            const stored = readStoredParticipantId(gid, tid);
            void mixpanel.track("Player Results Redirect", {
                game_id: Number(gameId),
                team_id: Number(teamId),
                participant_id: stored ?? null,
                reason: "join_blocked_finished",
                has_stored_participant: stored != null,
            });
            router.replace({
                pathname: '/(player)/game-results' as any,
                params: {
                    gameId: gid,
                    teamId: tid,
                    teamName: tname,
                    participantId: stored != null ? String(stored) : '',
                },
            });
        }
    }, [gameStatus, participantId, finishedJoinBlocked, gameId, teamId, teamName, router]);

    const isExitingToResults =
        finishedJoinBlocked ||
        gameStatus === GameStatuses.FINISHED;

    React.useEffect(() => {
        if (gameStarted) {
            setHasGameStarted(true);
        }
    }, [gameStarted]);

    React.useEffect(() => {
        const prev = prevTabRef.current;
        if (prev !== activeTab) {
            prevTabRef.current = activeTab;
            void mixpanel.track("Player Tab Changed", {
                game_id: Number(gameId),
                team_id: Number(teamId),
                tab_from: prev,
                tab_to: activeTab,
                game_phase: String(phase),
                game_status: gameStatus ? String(gameStatus) : undefined,
            });
        }
    }, [activeTab, gameId, gameStatus, phase, teamId]);

    const [phaseTotalTime, setPhaseTotalTime] = useState(timer > 0 ? timer : 1);
    const [prevPhase, setPrevPhase] = useState(phase);

    React.useEffect(() => {
        if (phase !== prevPhase) {
            setPrevPhase(phase);
            setPhaseTotalTime(timer > 0 ? timer : 1);
        }
        else if (timer > phaseTotalTime) {
            setPhaseTotalTime(timer);
        }
    }, [phase, timer, prevPhase, phaseTotalTime]);

    const renderContent = () => {
        switch (activeTab) {
            case 'play':
                return (
                    <PlayTab
                        phase={phase}
                        timer={timer}
                        totalTime={phaseTotalTime}
                        history={history}
                        questionNumber={activeQuestionNumber}
                        gameStarted={gameStarted}
                        submitAnswer={submitAnswer}
                        lastAnswerStatus={lastAnswerStatus}
                        gameStatus={gameStatus}
                        participantId={participantId}
                    />
                );
            case 'history':
                return <HistoryTab history={history} />;

            case 'results':
                return (
                    <LeaderboardTab
                        leaderboard={leaderboard}
                        currentParticipantId={participantId}
                    />
                );
            default:
                return null;
        }
    };

    const shouldShowMiniWidget = gameStarted && activeTab !== 'play' &&
        (phase === GamePhase.THINKING || phase === GamePhase.ANSWERING);

    const getPhaseText = () => {
        if (phase === GamePhase.THINKING) return t('player.game.phase.thinking');
        if (phase === GamePhase.ANSWERING) return t('player.game.phase.answering');
        if (phase === GamePhase.PREPARATION) return t('player.game.phase.preparation');
        return t('player.game.phase.idle');
    };

    if (isExitingToResults) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }}>
                <Box flex={1} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                enabled={Platform.OS !== 'web'}
                style={{ flex: 1 }}
            >
                <Box flex={1} align="center">
                    <Box maxWidth={450} width="100%" flex={1} justify="space-between">

                        <GameHeader
                            title={teamName as string}
                        />

                        <Box flex={1} style={{ width: '100%' }}>
                            {renderContent()}
                        </Box>

                        {shouldShowMiniWidget && (
                            <MiniGameWidget
                                phaseText={getPhaseText()}
                                timeLeft={timer}
                                totalTime={phaseTotalTime}
                                onPress={() => {
                                    void mixpanel.track("Player Mini Widget Pressed", {
                                        game_id: Number(gameId),
                                        team_id: Number(teamId),
                                        phase: String(phase),
                                        time_left_s: timer,
                                        from_tab: activeTab,
                                    });
                                    setActiveTab('play');
                                }}
                            />
                        )}

                        { (hasGameStarted || gameStarted) && !isKeyboardVisible && (
                            <GameBottomTabs
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                            />
                        )}

                    </Box>
                </Box>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
