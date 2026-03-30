import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useGameEditor } from '@/src/host/game/components/tabs/editor/state';
import { useHostGame } from '@/src/host/game/hooks/useHostGame';

import { ControlSidebar } from '@/src/host/game/components/ControlSidebar';
import { Box } from '@/src/ui/Box';
import { colors } from '@/src/theme/colors';

export default function MobileHostScreen() {
    const { gameId } = useLocalSearchParams<{ gameId: string }>();

    const editor = useGameEditor(gameId);

    const {
        gameState,
        answers,
        participants,
        startGame,
        prepareQuestion,
        startQuestion,
        nextQuestion,
        startTimer,
        stopTimer,
        stopQuestion,
        finishGame,
        adjustTime
    } = useHostGame(Number(gameId));

    if (editor.loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={colors.highlight.darkest} size="large" />
            </View>
        );
    }

    return (
        <Box style={styles.screen}>
            <ControlSidebar
                isNew={false}
                rounds={editor.rounds}
                passcode={editor.loaded?.passcode}
                answers={answers}
                participants={participants}
                gameState={gameState}
                gameName={editor.loaded?.title}

                onStartGame={startGame}
                onPrepareQuestion={prepareQuestion}
                onStartQuestion={startQuestion}
                onNextQuestion={nextQuestion}
                onPrevQuestion={() => {}}
                onStartTimer={startTimer}
                onStopTimer={stopTimer}
                onStopQuestion={stopQuestion}
                onFinishGame={finishGame}
                onAdjustTime={adjustTime}
            />
        </Box>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.neutralLight.lightest
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});