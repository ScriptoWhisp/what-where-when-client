import React, { useState, useMemo } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Box } from "@/src/ui/Box";
import { Text } from "@/src/ui/Text";
import { NavBar } from "@/src/ui/NavBar";
import { colors } from "@/src/theme/colors";

import { useGameEditor } from "@/src/host/game/components/tabs/editor/state";
import { ControlSidebar } from "@/src/host/game/components/ControlSidebar";
import { EditorContent } from "@/src/host/game/components/tabs/EditorContent";
import { useHostGame } from "@/src/host/game/hooks/useHostGame";
import { AnswersDashboard } from "@/src/host/game/components/tabs/AnswersDashboard";
import { GameStatuses } from "@/src/dto/common.dto";
import { HostLeaderboard } from "@/src/host/game/components/tabs/HostLeaderboard";
import {Teams} from "@/src/host/game/components/tabs/Teams";

export default function GameAdminScreen() {
    const router = useRouter();
    const { gameId } = useLocalSearchParams<{ gameId: string }>();

    const editor = useGameEditor(gameId);

    const {
        gameState,
        answers,
        leaderboard,
        participants,
        startGame,
        prepareQuestion,
        startQuestion,
        nextQuestion,
        startTimer,
        stopTimer,
        stopQuestion,
        finishGame,
        judgeAnswer,
        adjustTime
    } = useHostGame(Number(gameId));

    const tabs = useMemo(() => {
        if (editor.isNew) {
            return [{ key: 'Settings', label: 'Настройки' }];
        }
        return [
            { key: 'Settings', label: 'Настройки' },
            { key: 'Answers', label: 'Ответы' },
            { key: 'Leaderboard', label: 'Таблица результатов' },
            { key: 'Teams', label: 'Команды' }
        ];
    }, [editor.isNew]);

    const [activeTab, setActiveTab] = useState('Settings');

    const handleMobileView = () => {
        router.push(`/(host)/game/${gameId}/mobile`);
    };

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/setup');
        }
    };

    const handlePrevQuestion = () => {
        if (!gameState.activeQuestionId) return;
        const allQuestions = editor.rounds.flatMap(r => r.questions);
        const currentIndex = allQuestions.findIndex(q => q.id === gameState.activeQuestionId);
        if (currentIndex > 0) {
            const prevId = allQuestions[currentIndex - 1].id;
            if (prevId !== undefined) prepareQuestion(prevId);
        }
    };

    if (editor.loading) {
        return (
            <Box style={styles.centered}>
                <ActivityIndicator color={colors.highlight.darkest} size="large" />
            </Box>
        );
    }

    const canFinishGame = (
        gameState.status === GameStatuses.LIVE
        && gameState.status != GameStatuses.FINISHED
    );

    return (
        <Box style={styles.screen}>
            <Box style={styles.layout}>

                {!editor.isNew && (
                    <Box style={{width: 350}}>
                        <ControlSidebar
                            isNew={editor.isNew}
                            rounds={editor.rounds}
                            passcode={editor.loaded?.passcode}
                            answers={answers}
                            onStartGame={startGame}
                            onPrepareQuestion={prepareQuestion}
                            onStartQuestion={startQuestion}
                            onNextQuestion={nextQuestion}
                            onPrevQuestion={handlePrevQuestion}
                            onStartTimer={startTimer}
                            onStopTimer={stopTimer}
                            onStopQuestion={stopQuestion}
                            onFinishGame={finishGame}
                            onAdjustTime={adjustTime}
                            participants={participants}
                            gameState={gameState}
                            gameName={editor.loaded?.title}
                        />
                    </Box>
                )}

                <Box style={styles.mainContent}>
                    <NavBar
                        title={editor.isNew ? "Создание игры" : "Управление игрой"}
                        leftIcon={<Feather name="grid" size={24} color={colors.highlight.darkest} />}
                        onLeftPress={handleBack}
                        onRightPress={
                            editor.isNew
                                ? editor.primaryAction
                                : (canFinishGame ? finishGame : undefined)
                        }
                        rightIcon={
                            <Text
                                variant="bodyM"
                                style={{
                                    color: editor.isNew
                                        ? colors.highlight.darkest
                                        : (canFinishGame ? colors.error.dark : colors.neutralDark.light),
                                    fontWeight: 'bold'
                                }}
                            >
                                {editor.isNew ? "Сохранить" : "Завершить игру"}
                            </Text>
                        }
                    />

                    {!editor.isNew && (
                        <Box row justify="flex-start" style={styles.tabsMenu}>
                            {tabs.map(t => {
                                const isActive = activeTab === t.key;
                                return (
                                    <TouchableOpacity
                                        key={t.key}
                                        onPress={() => setActiveTab(t.key)}
                                        style={styles.tabItem}
                                    >
                                        <Text variant="bodyM" style={{
                                            fontWeight: isActive ? 'bold' : 'normal',
                                            color: isActive ? colors.neutralDark.darkest : colors.neutralDark.light
                                        }}>
                                            {t.label}
                                        </Text>

                                        {isActive && (
                                            <Box style={styles.activeIndicator} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </Box>
                    )}

                    <Box flex={1} style={[styles.tabContentArea, editor.isNew && { paddingTop: 24 }]}>
                        <TouchableOpacity onPress={handleMobileView}>
                            <Feather name="smartphone" size={20} color={colors.neutralDark.medium} />
                        </TouchableOpacity>

                        {activeTab === 'Settings' && (
                            <Box flex={1}>
                                {!editor.isNew && (
                                    <Box row justify="flex-end" mb={4} style={{ paddingHorizontal: 16 }}>
                                        <TouchableOpacity
                                            onPress={editor.primaryAction}
                                            style={styles.saveButton}
                                        >
                                            <Feather
                                                name={editor.isNew ? "plus-circle" : "save"}
                                                size={18}
                                                color={colors.neutralLight.lightest}
                                                style={{ marginRight: 8 }}
                                            />
                                            <Text variant="bodyM" style={{ color: colors.neutralLight.lightest, fontWeight: 'bold' }}>
                                                Сохранить изменения
                                            </Text>
                                        </TouchableOpacity>
                                    </Box>
                                )}
                                <EditorContent editor={editor} />
                            </Box>
                        )}

                        {!editor.isNew && (
                            <>
                                {activeTab === 'Answers' && (
                                    <AnswersDashboard
                                        rounds={editor.rounds}
                                        answers={answers}
                                        onJudge={judgeAnswer}
                                        activeQuestionId={gameState.activeQuestionId}
                                        totalParticipants={participants.length}
                                    />
                                )}

                                {activeTab === 'Leaderboard' && (
                                    <Box flex={1}>
                                        <HostLeaderboard leaderboard={leaderboard} gameId={Number(gameId)} />
                                    </Box>
                                )}

                                {activeTab === 'Teams' && (
                                    <Box flex={1}>
                                        <Teams participants={participants} />
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.neutralLight.light },
    centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.neutralLight.lightest },
    layout: { flex: 1, flexDirection: 'row' },
    mainContent: { flex: 1 },
    tabsMenu: { height: 74, backgroundColor: colors.neutralLight.lightest, marginHorizontal: 10, marginTop: 10, justifyContent: "space-evenly", alignItems: "center" },
    tabItem: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center'
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 24,
        height: 6,
        backgroundColor: colors.highlight.darkest,
        borderRadius: 3,
    },
    tabContentArea: { flex: 1 },
    saveButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.highlight.darkest, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, shadowColor: colors.highlight.darkest, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }
});