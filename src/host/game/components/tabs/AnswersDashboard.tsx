import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { AnswerDomain } from "@/src/dto/game.dto";
import { AnswerStatus } from "@/src/dto/common.dto";

interface Props {
    rounds: any[];
    answers: AnswerDomain[];
    onJudge: (id: number, verdict: AnswerStatus) => void;
}

export const AnswersDashboard = ({ rounds, answers, onJudge }: Props) => {
    const allQuestions = useMemo(() => rounds.flatMap(r => r.questions), [rounds]);
    const [selectedQId, setSelectedQId] = useState<number | null>(allQuestions[0]?.id || null);

    const currentAnswers = useMemo(() =>
            answers.filter(a => a.questionId === selectedQId),
        [answers, selectedQId]);

    const activeQuestion = allQuestions.find(q => q.id === selectedQId);

    return (
        <Box style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 32 }} showsVerticalScrollIndicator={false}>

                <Box style={styles.topCard}>
                    <Box row style={{ gap: 32 }}>
                        <Box style={{ flex: 1, maxWidth: 450 }}>
                            <Box row style={{ flexWrap: 'wrap', gap: 12 }}>
                                {allQuestions.map((q, i) => {
                                    const isSelected = q.id === selectedQId;
                                    const outlineColor = isSelected ? colors.highlight.darkest : colors.neutralLight.dark;
                                    return (
                                        <TouchableOpacity
                                            key={q.id}
                                            onPress={() => setSelectedQId(q.id)}
                                            style={[
                                                styles.qCircle,
                                                { borderColor: outlineColor },
                                                isSelected && { borderWidth: 2 }
                                            ]}
                                        >
                                            <Text style={{
                                                fontWeight: isSelected ? 'bold' : 'normal',
                                                color: isSelected ? colors.highlight.darkest : colors.neutralDark.darkest
                                            }}>
                                                {q.question_number}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </Box>

                            {/*<Box row style={{ gap: 16, flexWrap: 'wrap', marginTop: 24 }}>*/}
                            {/*    <LegendItem color={colors.success.medium} label="all checked" />*/}
                            {/*    <LegendItem color={colors.warning.medium} label="dispute" />*/}
                            {/*    <LegendItem color={colors.error.medium} label="not checked" />*/}
                            {/*    <LegendItem color={colors.highlight.darkest} label="current" />*/}
                            {/*</Box>*/}
                        </Box>

                        <Box style={{ flex: 1 }}>
                            <Text variant="bodyM" style={{ color: colors.neutralDark.medium, lineHeight: 24, marginBottom: 16 }}>
                                {activeQuestion?.text || 'Выберите вопрос слева'}
                            </Text>
                            <Text variant="h3">{activeQuestion?.answer}</Text>
                        </Box>
                    </Box>
                </Box>

                <Box row justify="space-between" align="center" style={styles.tableHeader}>
                    <Text variant="captionM" style={{ flex: 1, color: colors.neutralDark.medium }}>Team name</Text>
                    <Text variant="captionM" style={{ flex: 2, color: colors.neutralDark.medium }}>Answer</Text>
                    <Box style={{ width: 120 }} />
                </Box>

                <Box style={{ gap: 12 }}>
                    {currentAnswers.length === 0 ? (
                        <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center', marginTop: 20 }}>
                            Пока нет ответов от команд
                        </Text>
                    ) : (
                        currentAnswers.map(ans => {
                            const isCorrect = ans.status === AnswerStatus.CORRECT;
                            const isWrong = ans.status === AnswerStatus.INCORRECT;

                            return (
                                <Box key={ans.id} row align="center" justify="space-between" style={[
                                    styles.answerRow,
                                    isCorrect && styles.rowCorrect,
                                    isWrong && styles.rowWrong
                                ]}>
                                    <Box style={{ flex: 1 }}>
                                        <Text variant="bodyL" style={{ fontWeight: '600', color: colors.neutralDark.darkest }}>
                                            {ans.teamName}
                                        </Text>
                                    </Box>

                                    <Box style={{ flex: 2 }}>
                                        <Text variant="bodyL" style={{ color: colors.neutralDark.darkest }}>
                                            {ans.answerText}
                                        </Text>
                                    </Box>

                                    <Box row align="center" style={{ gap: 12 }}>
                                        {ans.lateBySeconds ? (
                                            <Text style={{ color: colors.error.dark }}>Опоздание: {ans.lateBySeconds} сек</Text>
                                        ) : null}

                                        <TouchableOpacity
                                            style={[styles.actionCircle, isWrong && { backgroundColor: colors.error.medium }]}
                                            onPress={() => onJudge(ans.id, AnswerStatus.INCORRECT)}
                                        >
                                            <Feather name="x" size={16} color={isWrong ? '#fff' : colors.neutralDark.medium} />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionCircle, isCorrect && { backgroundColor: colors.success.medium }]}
                                            onPress={() => onJudge(ans.id, AnswerStatus.CORRECT)}
                                        >
                                            <Feather name="check" size={16} color={isCorrect ? '#fff' : colors.neutralDark.medium} />
                                        </TouchableOpacity>

                                        <TouchableOpacity>
                                            <Feather name="star" size={20} color={colors.warning.medium} />
                                        </TouchableOpacity>
                                    </Box>
                                </Box>
                            )
                        })
                    )}
                </Box>
            </ScrollView>
        </Box>
    );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <Box row align="center" style={{ gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text variant="captionM" style={{ color: colors.neutralDark.medium }}>{label}</Text>
    </Box>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutralLight.medium,
        padding: 24,
        marginBottom: 32,
    },
    qCircle: {
        width: 36, height: 36, borderRadius: 18,
        borderWidth: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#fff'
    },
    tableHeader: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderColor: colors.neutralLight.medium,
        marginBottom: 12
    },
    answerRow: {
        padding: 16, borderRadius: 8, borderWidth: 1,
        borderColor: colors.neutralLight.medium, backgroundColor: '#fff'
    },
    rowCorrect: { backgroundColor: colors.success.light, borderColor: colors.success.light },
    rowWrong: { backgroundColor: colors.error.light, borderColor: colors.error.light },
    actionCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: colors.neutralLight.medium,
        justifyContent: 'center', alignItems: 'center'
    }
});