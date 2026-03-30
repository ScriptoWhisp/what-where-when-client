import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';

import { GameHeader } from '../../src/player/components/GameHeader';
import { GameBottomTabs, TabType } from '../../src/player/components/GameBottomTabs';
import { MiniGameWidget } from '../../src/player/components/MiniGameWidget';

import { PlayTab } from '@/src/player/components/tabs/PlayTab';
import { HistoryTab } from '@/src/player/components/tabs/HistoryTab';

import { usePlayerGame } from '@/src/player/hooks/usePlayerGame';
import { GamePhase } from '@/src/dto/common.dto';
import { Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { LeaderboardTab } from "@/src/player/components/tabs/LeaderboardTab";

export default function GameScreen() {
    const { gameId, teamId, teamName } = useLocalSearchParams();

    const [activeTab, setActiveTab] = useState<TabType>('play');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    const [hasGameStarted, setHasGameStarted] = useState(false);

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
        status: connectionStatus,
        gameStatus,
        gameStarted,
        phase,
        timer,
        activeQuestionNumber,
        lastAnswerStatus,
        submitAnswer,
        history,
        leaderboard,
        participantId
    } = usePlayerGame(
        gameId as string,
        teamId as string,
        teamName as string
    );

    React.useEffect(() => {
        if (gameStarted) {
            setHasGameStarted(true);
        }
    }, [gameStarted]);

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
        if (phase === GamePhase.THINKING) return 'Время на обсуждение';
        if (phase === GamePhase.ANSWERING) return 'Время для ответа';
        if (phase === GamePhase.PREPARATION) return 'Внимание, вопрос...';
        return 'Ожидание...';
    };

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
                            teamName={teamName as string}
                        />

                        <Box flex={1} style={{ width: '100%' }}>
                            {renderContent()}
                        </Box>

                        {shouldShowMiniWidget && (
                            <MiniGameWidget
                                phaseText={getPhaseText()}
                                timeLeft={timer}
                                totalTime={phaseTotalTime}
                                onPress={() => setActiveTab('play')}
                            />
                        )}

                        {(hasGameStarted || gameStarted) && !isKeyboardVisible && (
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