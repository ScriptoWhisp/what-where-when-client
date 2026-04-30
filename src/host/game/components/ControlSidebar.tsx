import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { colors } from '@/src/theme/colors';
import { UIRound } from '@/src/host/game/components/tabs/editor/types';
import { GamePhase, GameStatuses, AnswerStatus } from "@/src/dto/common.dto";
import { TimerBar } from '@/src/ui/TimerBar';
import {GameState, AnswerDomain, ParticipantDomain } from "@/src/dto/game.dto";
import { mixpanel } from "@/src/analytics/mixpanel";

interface ControlSidebarProps {
    isNew: boolean;
    rounds: UIRound[];
    answers: AnswerDomain[];
    gameName?: string;
    passcode?: string;
    participants: ParticipantDomain[];
    gameState: GameState;
    onStartGame: () => void;
    onPrepareQuestion: (id: number) => void;
    onStartQuestion: (id: number) => void;
    onNextQuestion: () => void;
    onPrevQuestion: () => void;
    onStartTimer: () => void;
    onStopTimer: () => void;
    onStopQuestion: () => void;
    onFinishGame: () => void;
    onAdjustTime?: (delta: number) => void;
}

export const ControlSidebar = ({
                                   isNew, rounds, answers, gameName, passcode, participants = [],
                                   gameState, onStartGame, onPrepareQuestion, onStartQuestion,
                                   onNextQuestion, onPrevQuestion, onStartTimer, onStopTimer,
                                   onStopQuestion, onFinishGame, onAdjustTime
                               }: ControlSidebarProps) => {

    const isLive = gameState.status === GameStatuses.LIVE;
    const isFinished = gameState.status === GameStatuses.FINISHED;
    const isPhaseActive = gameState.phase !== GamePhase.IDLE;
    const isPaused = gameState.isPaused ?? false;
    const isPreparation = gameState.phase === GamePhase.PREPARATION;
    const isTimerTicking = isPhaseActive && !isPaused && !isPreparation;

    const connectedCount = useMemo(() =>
            participants.filter(p => p.isConnected).length,
        [participants]);

    const uncheckedAnswersCount = useMemo(() => {
        return answers.filter(a =>
            a.status !== AnswerStatus.CORRECT &&
            a.status !== AnswerStatus.INCORRECT
        ).length;
    }, [answers]);

    const { currentQuestion, currentRound, totalQuestions } = useMemo(() => {
        const allQs = rounds.flatMap(r => r.questions);
        const q = allQs.find(q => q.id === gameState.activeQuestionId);
        const r = rounds.find(r => r.id === q?.round_id);
        return { currentQuestion: q, currentRound: r, totalQuestions: allQs.length };
    }, [rounds, gameState.activeQuestionId]);

    const currentAnswersCount = useMemo(() =>
            answers.filter(a => a.questionId === gameState.activeQuestionId).length,
        [answers, gameState.activeQuestionId]);

    const handleStartPress = () => {
        if (!gameState.activeQuestionId) return;
        if (isPreparation) onStartQuestion(gameState.activeQuestionId);
        else if (isPaused) onStartTimer();
        else onStopTimer();
    };

    const getPhaseText = (phase: GamePhase) => {
        switch (phase) {
            case GamePhase.PREPARATION: return 'Подготовка';
            case GamePhase.THINKING: return 'Обсуждение';
            case GamePhase.ANSWERING: return 'Прием ответов';
            case GamePhase.IDLE: return 'Ожидание';
            default: return '';
        }
    };

    let topBtnTitle = "Запустить таймер";
    let topBtnAction = () => {};
    let topBtnVariant: "primary" | "secondary" | "tertiary" = "primary";
    let nextBtnVariant: "primary" | "secondary" | "tertiary" = "secondary";

    if (isPreparation) {
        topBtnTitle = "Запустить таймер";
        topBtnAction = () => onStartQuestion(gameState.activeQuestionId!);
        topBtnVariant = "primary";
        nextBtnVariant = "secondary";
    } else if (isPhaseActive) {
        topBtnTitle = "Завершить вопрос";
        topBtnAction = onStopQuestion;
        topBtnVariant = "primary";
        nextBtnVariant = "secondary";
    } else {
        topBtnTitle = "Перезапустить вопрос";
        topBtnAction = () => onPrepareQuestion(gameState.activeQuestionId!);
        topBtnVariant = "secondary";
        nextBtnVariant = "primary";
    }

    return (
        <Box style={styles.sidebar}>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

                <Box style={{ gap: 8 }}>
                    <Text variant="h1" style={{marginBottom: 5}}>{gameName || 'Без названия'}</Text>

                    <Box
                        row
                        align="center"
                        justify="space-between"
                        style={[
                            styles.statusPill,
                            {
                                backgroundColor: isLive
                                    ? colors.success.light
                                    : isFinished
                                        ? colors.highlight.light
                                        : colors.neutralLight.darkest
                            }
                        ]}
                    >
                        <Text variant="bodyS" style={{ color: colors.neutralDark.darkest }}>
                            {isLive ? 'Игра идет' : isFinished ? 'Игра завершена' : 'Игра не начата'}
                        </Text>
                        <View style={[
                            styles.statusDot,
                            {
                                backgroundColor: isLive
                                    ? colors.success.medium
                                    : isFinished
                                        ? colors.highlight.darkest
                                        : colors.neutralDark.lightest
                            }
                        ]} />
                    </Box>

                    <Box style={styles.codeBlock} row align="center" justify="space-between">
                        <Box style={{ gap: 2 }}>
                            <Text variant="h4">{passcode ?? '—'}</Text>
                            <Text style={{ fontSize: 10, color: colors.neutralDark.light }}>Код игры</Text>
                        </Box>
                        <TouchableOpacity
                            onPress={() => {
                                void mixpanel.track("Host Code Copy Clicked", {
                                    has_passcode: Boolean(passcode),
                                    game_status: String(gameState.status),
                                });
                            }}
                        >
                            <Feather name="copy" style={{fontSize: 20, color: colors.highlight.darkest, marginRight: 2}} />
                        </TouchableOpacity>
                    </Box>

                    <Box row align="center" justify="space-between" style={styles.numericPill}>
                        <Box row align="center" gap={8}>
                            <Text variant="bodyS" style={{ color: colors.neutralDark.darkest }}>Команды в игре:</Text>
                        </Box>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{connectedCount}</Text>
                        </View>
                    </Box>

                    <Box row align="center" justify="space-between" style={styles.numericPill}>
                        <Box row align="center" gap={8}>
                            <Text variant="bodyS" style={{ color: colors.neutralDark.darkest }}>Непроверенные ответы:</Text>
                        </Box>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{uncheckedAnswersCount}</Text>
                        </View>
                    </Box>
                </Box>

                <Box style={{ gap: 4, marginTop: 16 }}>
                    <Text variant="bodyS" style={{ fontWeight: 'bold' }}>Текущий вопрос:</Text>
                    <Text style={{ fontSize: 13, color: colors.neutralDark.medium, lineHeight: 18 }}>
                        {currentQuestion?.text || 'Вопрос не выбран.'}
                    </Text>
                </Box>

                <Box style={{ gap: 4, marginTop: 16 }}>
                    <Text variant="bodyS" style={{ fontWeight: 'bold' }}>Правильный ответ:</Text>
                    <Text style={{ fontSize: 13, color: colors.neutralDark.darkest }}>
                        {currentQuestion?.answer || '—'}
                    </Text>
                </Box>
            </ScrollView>

            <Box style={styles.bottomPanel}>
                {isFinished ? (
                    <Box align="center" style={{ gap: 8, paddingVertical: 20 }}>
                        <Feather name="flag" size={32} color={colors.highlight.darkest} />
                        <Text variant="h3" style={{ color: colors.neutralDark.darkest }}>Игра окончена</Text>
                        <Text variant="bodyM" style={{ color: colors.neutralDark.medium, textAlign: 'center' }}>
                            Все вопросы отыграны. Вы можете просмотреть ответы и итоговую таблицу.
                        </Text>
                    </Box>
                ) : (
                    <>
                        <Box row align="center" justify="space-between" style={styles.numericPill}>
                            <Text variant="bodyS" style={{ color: colors.neutralDark.medium }}>Получено ответов</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{currentAnswersCount}</Text>
                            </View>
                        </Box>

                        <Box style={{ gap: 12, marginTop: 16 }}>
                            <Box row justify="space-between" align="center">
                                <Text variant="h4">Вопрос {gameState.activeQuestionNumber || 0} из {totalQuestions}</Text>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.neutralDark.medium }}>{currentRound?.name || 'Раунд 1'}</Text>
                            </Box>

                            <Box row justify="space-between" align="center">
                                <Text style={{ fontSize: 12, color: isTimerTicking && gameState.seconds <= 10 ? colors.error.medium : colors.neutralDark.medium }}>
                                    {isPhaseActive ? `Осталось ${gameState.seconds} сек` : 'Время вышло'}
                                </Text>
                                <Text style={{ fontSize: 12, color: colors.neutralDark.dark, fontWeight: '600' }}>
                                    {getPhaseText(gameState.phase)}
                                </Text>
                            </Box>

                            <TimerBar timeLeft={gameState.seconds} totalTime={currentQuestion?.time_to_think_sec || 60} height={4} />

                            <Box row justify="space-between" style={{ gap: 6 }}>
                                <TouchableOpacity
                                    style={styles.timeBtn}
                                    onPress={() => {
                                        void mixpanel.track("Host Adjust Time Clicked", {
                                            direction: "decrease",
                                            delta_s: -10,
                                            phase: String(gameState.phase),
                                            time_left_s: gameState.seconds,
                                            active_question_id: gameState.activeQuestionId ?? null,
                                        });
                                        onAdjustTime?.(-10);
                                    }}
                                >
                                    <Text style={styles.timeBtnText}>-10 сек</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.playBtn}
                                    onPress={() => {
                                        void mixpanel.track("Host Timer Toggle Clicked", {
                                            current_action: isPreparation
                                                ? "start_question"
                                                : isPaused
                                                    ? "resume_timer"
                                                    : "pause_timer",
                                            phase: String(gameState.phase),
                                            is_paused: Boolean(isPaused),
                                            time_left_s: gameState.seconds,
                                            active_question_id: gameState.activeQuestionId ?? null,
                                        });
                                        handleStartPress();
                                    }}
                                >
                                    <Feather name={isTimerTicking ? "pause" : "play"} size={16} color={colors.highlight.darkest} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.timeBtn}
                                    onPress={() => {
                                        void mixpanel.track("Host Adjust Time Clicked", {
                                            direction: "increase",
                                            delta_s: 10,
                                            phase: String(gameState.phase),
                                            time_left_s: gameState.seconds,
                                            active_question_id: gameState.activeQuestionId ?? null,
                                        });
                                        onAdjustTime?.(10);
                                    }}
                                >
                                    <Text style={styles.timeBtnText}>+10 сек</Text>
                                </TouchableOpacity>
                            </Box>

                            <Box style={{ gap: 6, marginTop: 8 }}>
                                {!isLive && !isNew && (
                                    <Button title="Начать игру" onPress={onStartGame} variant="primary" />
                                )}

                                {isLive && gameState.activeQuestionId && (
                                    <>
                                        <Button
                                            title={topBtnTitle}
                                            onPress={topBtnAction}
                                            variant={topBtnVariant}
                                        />

                                        <Box row justify="space-between" style={{ gap: 8, marginTop: 4 }}>
                                            <View style={{ flex: 1 }}>
                                                <Button title="< Пред." onPress={onPrevQuestion} variant="tertiary" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Button title="След. >" onPress={onNextQuestion} variant={nextBtnVariant} />
                                            </View>
                                        </Box>
                                    </>
                                )}
                                {isLive && !gameState.activeQuestionId && (
                                    <Button title="Начать первый вопрос" onPress={onNextQuestion} variant="primary" />
                                )}
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};

const styles = StyleSheet.create({
    sidebar: { width: '100%', flexShrink: 0, height: '100%', backgroundColor: colors.neutralLight.lightest, paddingTop: 30, paddingHorizontal: 16 },
    bottomPanel: { paddingVertical: 16, backgroundColor: colors.neutralLight.lightest, marginHorizontal: -16, paddingHorizontal: 16 },
    statusPill: { paddingHorizontal: 16, paddingVertical: 18, borderRadius: 12 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    codeBlock: { backgroundColor: colors.highlight.lightest, paddingHorizontal: 16, paddingVertical: 18, borderRadius: 12 },
    badge: {
        backgroundColor: colors.neutralLight.darkest,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    badgeText: {
        fontSize: 10,
        color: colors.neutralLight.lightest
    },
    timeBtn: { flex: 2, height: 51, borderWidth: 2, borderColor: colors.highlight.darkest, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    timeBtnText: { color: colors.highlight.darkest, fontWeight: 'bold', fontSize: 13 },
    playBtn: { flex: 3, height: 51, borderWidth: 2, borderColor: colors.highlight.darkest, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    numericPill: { backgroundColor: colors.neutralLight.light, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12 }
});