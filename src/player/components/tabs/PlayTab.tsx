import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    StyleSheet,
    TextInput,
    ScrollView,
    View,
} from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { colors } from '@/src/theme/colors';
import { TimerBar } from '@/src/ui/TimerBar';
import {GamePhase, GameStatus, GameStatuses} from '@/src/dto/common.dto';
import {AnswerDomain} from "@/src/dto/game.dto";
import { mixpanel } from "@/src/analytics/mixpanel";

interface PlayTabProps {
    phase: GamePhase;
    timer: number;
    totalTime: number;
    history: AnswerDomain[];
    questionNumber?: number | null;
    submitAnswer: (answer: string) => void;
    lastAnswerStatus?: 'success' | 'error' | null;
    gameStatus?: GameStatus | null;
    participantId: number | null;
}

export const PlayTab = ({
                            phase,
                            timer,
                            totalTime,
                            history,
                            questionNumber,
                            submitAnswer,
                            lastAnswerStatus,
                            gameStatus,
                            participantId,
                        }: PlayTabProps) => {
    const { t } = useTranslation();

    const savedAnswer = React.useMemo(() => {
        return history.find(a => a.questionNumber === questionNumber) || null;
    }, [history, questionNumber]);

    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const focusedQuestionRef = React.useRef<number | null | undefined>(null);
    const finishedTrackedRef = React.useRef(false);

    useEffect(() => {
        if (savedAnswer) {
            setAnswer(savedAnswer.answerText);
        }
    }, [savedAnswer?.answerText]);

    useEffect(() => {
        if (phase === GamePhase.IDLE || phase === GamePhase.PREPARATION) {
            setAnswer('');
            setIsSubmitting(false);
        }
    }, [phase]);

    useEffect(() => {
        if (lastAnswerStatus === 'success' || lastAnswerStatus === 'error' || savedAnswer) {
            setIsSubmitting(false);
        }
    }, [lastAnswerStatus, savedAnswer]);

    useEffect(() => {
        if (gameStatus === GameStatuses.FINISHED && !finishedTrackedRef.current) {
            finishedTrackedRef.current = true;
            void mixpanel.track("Player Game Finished Viewed", {
                participant_id: participantId ?? undefined,
                history_count: history.length,
            });
        }
    }, [gameStatus, history.length]);

    const handleSend = () => {
        if (!answer.trim()) return;
        setIsSubmitting(true);
        void mixpanel.track("Player Answer Submit Clicked", {
            participant_id: participantId ?? undefined,
            question_number: questionNumber ?? null,
            phase: String(phase),
            time_left_s: timer,
            answer_length: answer.trim().length,
            is_resubmit: Boolean(savedAnswer),
        });
        submitAnswer(answer.trim());
        Keyboard.dismiss();
    };

    const handleAnswerFocus = () => {
        const qn = questionNumber ?? null;
        if (focusedQuestionRef.current !== qn) {
            focusedQuestionRef.current = qn;
            void mixpanel.track("Player Answer Input Focused", {
                participant_id: participantId ?? undefined,
                question_number: qn,
                phase: String(phase),
                time_left_s: timer,
                has_existing_answer: Boolean(savedAnswer),
            });
        }
    };

    const sessionLive = gameStatus === GameStatuses.LIVE;

    const isWaiting =
        !sessionLive ||
        phase === GamePhase.IDLE ||
        phase === GamePhase.PREPARATION;

    if (gameStatus === GameStatuses.FINISHED) {
        return <Box flex={1} />;
    }

    const renderWaiting = () => (
        <Box align="center" gap={2}>
            <Text variant="h2" style={{ color: colors.neutralDark.darkest, maxWidth: 240, textAlign: "center" }}>{t('playTab.waitingTitle')}</Text>
            <Text variant="bodyM" style={{ color: colors.neutralDark.light, maxWidth: 240, textAlign: 'center' }}>
                {t('playTab.waitingSubtitle')}
            </Text>
        </Box>
    );

    const renderIdle = () => (
        <Box align="center" gap={2}>
            <Text variant="h2" style={{ color: colors.neutralDark.darkest, textAlign: 'center' }}>
                {t('playTab.idleTitle')}
            </Text>
        </Box>
    );

    const renderPreparation = () => (
        <Box align="center" gap={2}>
            <Text variant="h2" style={{ color: colors.neutralDark.darkest, textAlign: 'center' }}>
                {t('playTab.questionTitle', { n: questionNumber ?? '' })}
            </Text>
            <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center' }}>
                {t('playTab.preparationSubtitle')}
            </Text>
        </Box>
    );

    const renderActive = () => (
        <Box flex={1} justify="space-between">
            <Box gap={6}>
                <Text variant="h2" style={{ color: colors.neutralDark.darkest }}>
                    {t('playTab.questionTitle', { n: questionNumber ?? '' })}
                </Text>

                <Box style={{ gap: 6 }}>
                    <Text
                        variant="bodyM"
                        style={{
                            color: timer === 0 ? colors.error.medium : colors.neutralDark.medium,
                        }}
                    >
                        {timer > 0
                            ? t('playTab.timerRunning', {
                                seconds: timer,
                                hint:
                                    phase === GamePhase.THINKING
                                        ? t('playTab.hintThinking')
                                        : t('playTab.hintAnswering'),
                            })
                            : t('playTab.timeUp')}
                    </Text>
                    <TimerBar timeLeft={timer} totalTime={totalTime} />
                </Box>

                <Box gap={2} mt={2}>
                    <TextInput
                        style={[styles.input, timer === 0 && styles.inputLate]}
                        placeholder={t('playTab.answerPlaceholder')}
                        placeholderTextColor={colors.neutralDark.light}
                        value={answer}
                        onChangeText={setAnswer}
                        onFocus={handleAnswerFocus}
                        editable={!isSubmitting}
                        multiline
                        blurOnSubmit
                    />

                    {(lastAnswerStatus === 'success' || savedAnswer) && (
                        <>
                            <Text variant="bodyM" style={{ color: colors.success.dark, textAlign: 'center' }}>
                                {t('playTab.answerAccepted')}
                            </Text>
                            <Text
                                variant="bodyM"
                                style={{ color: colors.neutralDark.lightest, textAlign: 'center' }}
                            >
                                {t('playTab.answerChangeHint')}
                            </Text>
                        </>
                    )}
                </Box>
            </Box>

            <Box pt={6}>
                <Button
                    title={savedAnswer ? t('playTab.resubmit') : t('playTab.submit')}
                    variant="primary"
                    onPress={handleSend}
                    disabled={!answer.trim() || isSubmitting}
                />
            </Box>
        </Box>
    );

    const content = (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    padding: 24,
                    justifyContent: isWaiting ? 'center' : 'space-between',
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {!sessionLive
                    ? renderWaiting()
                    : phase === GamePhase.IDLE
                        ? renderIdle()
                        : phase === GamePhase.PREPARATION
                            ? renderPreparation()
                            : renderActive()}
            </ScrollView>
        </View>
    );

    return Platform.OS === 'web' ? (
        content
    ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {content}
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    input: {
        width: '100%',
        minHeight: 100,
        backgroundColor: colors.neutralLight.lightest,
        borderWidth: 1,
        borderColor: colors.neutralLight.medium,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.neutralDark.darkest,
        fontFamily: 'InterRegular',
        textAlignVertical: 'top',
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
    },
    inputLate: {
        borderColor: colors.error.light,
        borderWidth: 1,
    }
});