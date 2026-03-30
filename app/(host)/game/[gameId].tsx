import React, { useState, useMemo } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Box } from "@/src/ui/Box";
import { Text } from "@/src/ui/Text";
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

    const isGameActive = gameState.status === GameStatuses.LIVE;

    return (
        <Box style={styles.screen}>
            <Box style={styles.layout}>

                {!editor.isNew && (
                    <Box style={styles.sidebarContainer}>
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
                            gameState={gameState}
                            gameName={editor.loaded?.title}
                        />
                    </Box>
                )}

                <Box style={styles.mainContent}>
                    <Box row align="center" justify="space-between" style={styles.header}>
                        <Box row align="center" style={{ gap: 24 }}>
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <Feather name="arrow-left" size={20} color={colors.neutralDark.medium} />
                                <Text variant="bodyM" style={{ color: colors.neutralDark.medium, marginLeft: 8 }}>
                                    К списку игр
                                </Text>
                            </TouchableOpacity>

                            <Box row align="center" style={{ gap: 12 }}>
                                <Feather name="grid" size={24} color={colors.highlight.darkest} />
                                <Text variant="h2" style={{ color: colors.neutralDark.darkest }}>
                                    {editor.isNew ? "Создание игры" : "Управление игрой"}
                                </Text>
                            </Box>
                        </Box>

                        {isGameActive && (
                            <TouchableOpacity onPress={finishGame} style={styles.finishButton}>
                                <Feather name="square" size={16} color={colors.error.dark} style={{ marginRight: 8 }} />
                                <Text variant="bodyM" style={{ color: colors.error.dark, fontWeight: 'bold' }}>
                                    Завершить игру
                                </Text>
                            </TouchableOpacity>
                        )}
                    </Box>

                    {!editor.isNew && (
                        <Box row justify="flex-start" style={styles.tabsMenu}>
                            {tabs.map(t => {
                                const isActive = activeTab === t.key;
                                return (
                                    <TouchableOpacity
                                        key={t.key}
                                        onPress={() => setActiveTab(t.key)}
                                        style={[styles.tabItem, isActive && styles.tabItemActive]}
                                    >
                                        <Text variant="bodyM" style={{
                                            fontWeight: isActive ? 'bold' : 'normal',
                                            color: isActive ? colors.highlight.darkest : colors.neutralDark.light
                                        }}>
                                            {t.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </Box>
                    )}

                    <Box flex={1} style={[styles.tabContentArea, editor.isNew && { paddingTop: 24 }]}>

                        {activeTab === 'Settings' && (
                            <Box flex={1}>
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
                                            {editor.isNew ? "Создать игру" : "Сохранить изменения"}
                                        </Text>
                                    </TouchableOpacity>
                                </Box>
                                <EditorContent editor={editor} />
                            </Box>
                        )}

                        {!editor.isNew && (
                            <>
                                {activeTab === 'Answers' && (
                                    <AnswersDashboard rounds={editor.rounds} answers={answers} onJudge={judgeAnswer} />
                                )}

                                {activeTab === 'Leaderboard' && (
                                    <Box flex={1}>
                                        <HostLeaderboard leaderboard={leaderboard} />
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
    sidebarContainer: { borderRightWidth: 1, borderRightColor: colors.neutralLight.medium, backgroundColor: colors.neutralLight.lightest },
    mainContent: { flex: 1 },
    header: { paddingHorizontal: 32, paddingTop: 24, paddingBottom: 24, backgroundColor: colors.neutralLight.lightest },
    backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.neutralLight.light },
    finishButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.error.light, borderWidth: 1, borderColor: colors.error.medium },
    tabsMenu: { borderBottomWidth: 1, borderColor: colors.neutralLight.medium, paddingHorizontal: 24, backgroundColor: colors.neutralLight.lightest },
    tabItem: { paddingVertical: 14, paddingHorizontal: 20, marginRight: 8 },
    tabItemActive: { borderBottomWidth: 3, borderColor: colors.highlight.darkest },
    tabContentArea: { flex: 1, paddingTop: 16 },
    saveButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.highlight.darkest, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, shadowColor: colors.highlight.darkest, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }
});