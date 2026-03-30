import React, { useState, useEffect } from 'react';
import {
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    StyleSheet,
    TextInput,
    ScrollView,
    View, Linking
} from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { colors } from '@/src/theme/colors';
import { TimerBar } from '@/src/ui/TimerBar';
import {GamePhase, GameStatus, GameStatuses} from '@/src/dto/common.dto';
import {AnswerDomain} from "@/src/dto/game.dto";
import {useRouter} from "expo-router";

interface PlayTabProps {
    phase: GamePhase;
    timer: number;
    totalTime: number;
    history: AnswerDomain[];
    questionNumber?: number | null;
    gameStarted: boolean;
    submitAnswer: (answer: string) => void;
    lastAnswerStatus?: 'success' | 'error' | null;
    gameStatus?: GameStatus | null;
}

export const PlayTab = ({
                            phase,
                            timer,
                            totalTime,
                            history,
                            questionNumber,
                            gameStarted,
                            submitAnswer,
                            lastAnswerStatus,
                            gameStatus
}: PlayTabProps) => {
    const savedAnswer = React.useMemo(() => {
        return history.find(a => a.questionNumber === questionNumber) || null;
    }, [history, questionNumber]);

    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSend = () => {
        if (!answer.trim()) return;
        setIsSubmitting(true);
        submitAnswer(answer.trim());
        Keyboard.dismiss();
    };

    const isWaiting = !gameStarted || phase === GamePhase.IDLE || phase === GamePhase.PREPARATION || gameStatus === GameStatuses.FINISHED;

    const content = (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    justifyContent: isWaiting ? 'center' : 'space-between'
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {gameStatus === GameStatuses.FINISHED ? (
                        <Box align="center" gap={4}>
                            <Text variant="h2" style={{ color: colors.neutralDark.darkest, textAlign: 'center' }}>
                                Игра завершена! 🎉
                            </Text>
                            <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center', marginBottom: 16, lineHeight: 22 }}>
                                Вы можете посмотреть таблицу результатов и свои ответы в соседних вкладках.
                            </Text>
                            <Button
                                title="Дать обратную связь"
                                variant="primary"
                                onPress={() => {
                                    Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSei713QAvW06XJrjDr89hVMFkevLimHf8r_X18EW4VUmYuLiw/viewform');
                                }}
                            />
                        </Box>
                    ) : !gameStarted ? (
                    <Box align="center" gap={2}>
                        <Text variant="h2" style={{ color: colors.neutralDark.medium }}>Ожидание...</Text>
                        <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center' }}>
                            Организатор скоро запустит игру
                        </Text>
                    </Box>

                ) : phase === GamePhase.IDLE ? (
                    <Box align="center" gap={2}>
                        <Text variant="h2" style={{ color: colors.neutralDark.darkest, textAlign: 'center' }}>
                            Ожидание...
                        </Text>
                    </Box>

                ) : phase === GamePhase.PREPARATION ? (
                    <Box align="center" gap={2}>
                        <Text variant="h2" style={{ color: colors.neutralDark.darkest, textAlign: 'center' }}>
                            Вопрос {questionNumber || ''}
                        </Text>
                        <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center' }}>
                            Внимание, читается вопрос...
                        </Text>
                    </Box>

                ) : (
                    <Box flex={1} justify="space-between">
                        <Box gap={6}>
                            <Text variant="h2" style={{ color: colors.neutralDark.darkest }}>
                                Вопрос {questionNumber || ''}
                            </Text>

                            <Box gap={3}>
                                <Text variant="bodyM" style={{
                                    color: timer === 0 ? colors.error.medium : colors.neutralDark.medium,
                                    fontWeight: '500'
                                }}>
                                    {timer > 0
                                        ? `${timer} сек · ${phase === GamePhase.THINKING ? 'обсуждение с командой' : 'напишите ваш ответ!'}`
                                        : 'Время вышло! Завершайте ответ'
                                    }
                                </Text>
                                <TimerBar timeLeft={timer} totalTime={totalTime} height={8} />
                            </Box>

                            <Box gap={2} mt={2}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        timer === 0 && styles.inputLate
                                    ]}
                                    placeholder="Впишите ответ"
                                    placeholderTextColor={colors.neutralDark.light}
                                    value={answer}
                                    onChangeText={setAnswer}
                                    editable={!isSubmitting}
                                    multiline
                                    blurOnSubmit
                                />

                                {(lastAnswerStatus === 'success' || savedAnswer) && (
                                    <>
                                        <Text variant="bodyM" style={{ color: colors.success.dark, textAlign: 'center' }}>
                                            Ответ принят!
                                        </Text>
                                        <Text variant="bodyM" style={{ color: colors.neutralDark.lightest, textAlign: 'center' }}>
                                            Вы можете поменять ответ
                                        </Text>
                                    </>
                                )}
                            </Box>
                        </Box>

                        <Box pt={6}>
                            <Button
                                title={savedAnswer ? "Отправить повторно" : "Отправить"}
                                variant="primary"
                                onPress={handleSend}
                                disabled={!answer.trim() || isSubmitting}
                            />
                        </Box>
                    </Box>
                )}
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