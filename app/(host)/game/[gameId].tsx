import React, { useState, useMemo } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
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
import { Teams } from "@/src/host/game/components/tabs/Teams";
import { mixpanel } from "@/src/analytics/mixpanel";

export default function GameAdminScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { gameId } = useLocalSearchParams<{ gameId: string }>();

    const isMobile = width < 768;

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
    const lastTabRef = React.useRef<string | null>(null);

    React.useEffect(() => {
        const numericId = gameId && gameId !== "new" ? Number(gameId) : undefined;
        mixpanel.setSuperProps({
            role: "host",
            host_screen: editor.isNew ? "create_game" : "game_admin",
            game_id: numericId,
            is_new: editor.isNew,
        });
        return () => {
            mixpanel.setSuperProps({
                host_screen: undefined,
                game_id: undefined,
                is_new: undefined,
            });
        };
    }, [gameId, editor.isNew]);

    React.useEffect(() => {
        void mixpanel.track("Host Game Mounted", {
            game_id: gameId && gameId !== "new" ? Number(gameId) : undefined,
            is_new: editor.isNew,
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        if (editor.loaded?.id) {
            void mixpanel.track("Host Game Loaded", {
                game_id: editor.loaded.id,
                version: editor.loaded.version,
                rounds_count: editor.rounds.length,
                questions_count: editor.rounds.reduce(
                    (acc, r) => acc + (r.questions?.length ?? 0),
                    0,
                ),
                teams_count: (editor.draft.teams as any[])?.length ?? 0,
                categories_count: (editor.draft.categories as any[])?.length ?? 0,
                status: (editor.loaded as any)?.status,
            });
        }
    }, [editor.loaded?.id, editor.loaded?.version]);

    React.useEffect(() => {
        if (lastTabRef.current === activeTab) return;
        const prev = lastTabRef.current;
        lastTabRef.current = activeTab;
        void mixpanel.track("Host Tab Viewed", {
            game_id: gameId && gameId !== "new" ? Number(gameId) : undefined,
            tab: activeTab,
            tab_from: prev ?? null,
            is_new: editor.isNew,
        });
    }, [activeTab, editor.isNew, gameId]);

    const handleBack = () => {
        void mixpanel.track("Host Game Back Clicked", {
            game_id: gameId && gameId !== "new" ? Number(gameId) : undefined,
            is_new: editor.isNew,
            active_tab: activeTab,
            game_status: String(gameState.status),
        });
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
        void mixpanel.track("Host Prev Question Clicked", {
            game_id: gameId && gameId !== "new" ? Number(gameId) : undefined,
            active_question_id: gameState.activeQuestionId,
            current_index: currentIndex,
            total_questions: allQuestions.length,
            has_prev: currentIndex > 0,
        });
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
                    <Box style={isMobile ? { flex: 1 } : { width: 350 }}>
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

                {(!isMobile || editor.isNew) && (
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
                            {activeTab === 'Settings' && (
                                <Box flex={1}>
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
                )}
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