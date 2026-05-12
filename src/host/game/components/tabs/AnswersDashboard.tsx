import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { AnswerDomain } from "@/src/dto/game.dto";
import { AnswerStatus } from "@/src/dto/common.dto";
import { mixpanel } from "@/src/analytics/mixpanel";

interface Props {
    rounds: any[];
    answers: AnswerDomain[];
    onJudge: (id: number, verdict: AnswerStatus) => void;
    activeQuestionId?: number;
    totalParticipants?: number;
}

export const AnswersDashboard = ({ rounds, answers, onJudge, activeQuestionId, totalParticipants }: Props) => {
    const { t } = useTranslation();
    const allQuestions = useMemo(() => rounds.flatMap(r => r.questions), [rounds]);
    const [selectedQId, setSelectedQId] = useState<number | null>(() => {
        return activeQuestionId || allQuestions[0]?.id || null;
    });

    React.useEffect(() => {
        if (activeQuestionId) {
            setSelectedQId(activeQuestionId);
        }
    }, [activeQuestionId]);

    const currentAnswers = useMemo(() =>
            answers.filter(a => a.questionId === selectedQId),
        [answers, selectedQId]);

    const activeQuestion = allQuestions.find(q => q.id === selectedQId);

    const correctCount = currentAnswers.filter(a => a.status === AnswerStatus.CORRECT).length;
    const incorrectCount = currentAnswers.filter(a => a.status === AnswerStatus.INCORRECT).length;

    return (
        <Box style={styles.container}>
            <ScrollView contentContainerStyle={{ margin: 10 }} showsVerticalScrollIndicator={false}>

                <Box style={styles.topCard}>
                    <Box row style={{ gap: 32 }}>
                        <Box style={{ flex: 1 }}>
                            <Box style={{ gap: 8 }}>
                                {rounds.map((round) => (
                                    <Box key={round.id || round._tmpId} style={{ gap: 4 }}>
                                        <Text variant="captionM" style={{ color: colors.neutralDark.medium, fontWeight: 'bold' }}>
                                            {round.name || t("hostAnswersDashboard.roundFallback", { n: round.round_number })}
                                        </Text>

                                        <Box row style={{ flexWrap: 'wrap', gap: 12 }}>
                                            {(round.questions || []).map((q: any) => {
                                                const isSelected = q.id === selectedQId;
                                                const outlineColor = isSelected ? colors.highlight.darkest : colors.neutralLight.dark;

                                                return (
                                                    <TouchableOpacity
                                                        key={q.id || q._tmpId}
                                                        onPress={() => {
                                                            void mixpanel.track("Host Answers Question Selected", {
                                                                question_id: q.id ?? null,
                                                                question_number: q.question_number,
                                                                round_id: round.id ?? null,
                                                                round_number: round.round_number,
                                                                from_question_id: selectedQId ?? null,
                                                                is_active: q.id === activeQuestionId,
                                                            });
                                                            setSelectedQId(q.id);
                                                        }}
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
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Box style={{ flex: 1 }}>
                            <Text variant="bodyM" style={{ color: colors.neutralDark.medium, lineHeight: 24, marginBottom: 16 }}>
                                {activeQuestion?.text || t("hostAnswersDashboard.selectQuestion")}
                            </Text>
                            <Text variant="h3">{activeQuestion?.answer}</Text>
                        </Box>
                    </Box>
                </Box>

                <Box row align="center" style={{ marginBottom: 10, gap: 16, flexWrap: 'wrap' }}>
                    <Box row align="center" style={[styles.badge, styles.badgeBlue]}>
                        <Text style={[styles.badgeText, styles.badgeTextBlue]}>
                            {t("hostAnswersDashboard.total", { count: currentAnswers.length })}
                        </Text>
                    </Box>
                    <Box row align="center" style={[styles.badge, styles.badgeGreen]}>
                        <Text style={[styles.badgeText, styles.badgeTextGreen]}>
                            {t("hostAnswersDashboard.correct", { count: correctCount })}
                        </Text>
                    </Box>
                    <Box row align="center" style={[styles.badge, styles.badgeRed]}>
                        <Text style={[styles.badgeText, styles.badgeTextRed]}>
                            {t("hostAnswersDashboard.incorrect", { count: incorrectCount })}
                        </Text>
                    </Box>
                </Box>

                <Box row justify="space-between" align="center" style={styles.tableHeader}>
                    <Text variant="captionM" style={{ flex: 1, color: colors.neutralDark.medium }}>{t("hostAnswersDashboard.colTeamName")}</Text>
                    <Text variant="captionM" style={{ flex: 2, color: colors.neutralDark.medium }}>{t("hostAnswersDashboard.colAnswerText")}</Text>
                    <Box style={{ width: 140 }} />
                </Box>

                <Box style={{ gap: 10 }}>
                    {currentAnswers.length === 0 ? (
                        <Text variant="bodyM" style={{ color: colors.neutralDark.light, textAlign: 'center', padding: 20 }}>
                            {t("hostAnswersDashboard.empty")}
                        </Text>
                    ) : (
                        currentAnswers.map(ans => {
                            const isCorrect = ans.status === AnswerStatus.CORRECT;
                            const isWrong = ans.status === AnswerStatus.INCORRECT;

                            return (
                                <Box key={ans.id} row align="center" justify="space-between" style={styles.answerRow}>
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

                                    <Box row align="center" justify="flex-end" style={{ width: 140, gap: 16, position: 'relative' }}>

                                        {ans.lateBySeconds ? (
                                            <Text style={{
                                                position: 'absolute',
                                                right: 156,
                                                color: colors.error.dark,
                                                fontSize: 12,
                                                width: 100,
                                                textAlign: 'right'
                                            }}>
                                                {t("hostAnswersDashboard.lateBy", { seconds: ans.lateBySeconds })}
                                            </Text>
                                        ) : null}

                                        <Box row align="center" style={[
                                            styles.actionPill,
                                            isCorrect && styles.pillCorrect,
                                            isWrong && styles.pillWrong
                                        ]}>
                                            <TouchableOpacity
                                                style={[styles.actionCircle, isWrong && styles.actionCircleWrong]}
                                                onPress={() => onJudge(ans.id, AnswerStatus.INCORRECT)}
                                            >
                                                <Feather name="x" size={20} color={isWrong ? '#fff' : colors.neutralDark.medium} />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.actionCircle, isCorrect && styles.actionCircleCorrect]}
                                                onPress={() => onJudge(ans.id, AnswerStatus.CORRECT)}
                                            >
                                                <Feather name="check" size={20} color={isCorrect ? '#fff' : colors.neutralDark.medium} />
                                            </TouchableOpacity>
                                        </Box>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topCard: {
        backgroundColor: colors.neutralLight.lightest,
        padding: 24,
        marginBottom: 10,
        borderRadius: 16,
    },
    qCircle: {
        width: 36, height: 36, borderRadius: 18,
        borderWidth: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: colors.neutralLight.lightest
    },
    tableHeader: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderColor: colors.neutralLight.medium,
        marginBottom: 8
    },
    answerRow: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: colors.neutralLight.lightest
    },
    actionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 32,
        paddingVertical: 6,
        paddingHorizontal: 16,
        gap: 24,
    },
    pillCorrect: { backgroundColor: colors.success.light },
    pillWrong: { backgroundColor: colors.error.light },
    actionCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.neutralLight.medium,
        justifyContent: 'center', alignItems: 'center'
    },
    actionCircleCorrect: { backgroundColor: colors.success.medium },
    actionCircleWrong: { backgroundColor: colors.error.medium },
    badge: {
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 12, borderWidth: 1
    },
    badgeText: {
        fontSize: 14, fontWeight: 'bold'
    },
    badgeBlue: {
        backgroundColor: colors.highlight.lightest, borderColor: colors.highlight.light
    },
    badgeTextBlue: {
        color: colors.highlight.darkest
    },
    badgeGreen: {
        backgroundColor: colors.success.light, borderColor: colors.success.medium
    },
    badgeTextGreen: {
        color: colors.success.dark
    },
    badgeRed: {
        backgroundColor: colors.error.light, borderColor: colors.error.medium
    },
    badgeTextRed: {
        color: colors.error.dark
    }
});