import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { AnswerDomain } from '@/src/dto/game.dto';
import { AnswerStatus } from '@/src/dto/common.dto';

interface HistoryTabProps {
    history: AnswerDomain[];
}

export const HistoryTab = ({ history }: HistoryTabProps) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case AnswerStatus.CORRECT:
                return { icon: 'check', color: colors.success.medium };
            case AnswerStatus.INCORRECT:
                return { icon: 'x', color: colors.error.medium };
            case AnswerStatus.DISPUTABLE:
                return { icon: 'help-circle', color: colors.highlight.dark };
            default:
                return { icon: 'clock', color: colors.neutralDark.light };
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {history.length === 0 ? (
                <Box align="center" gap={2} style={{ justifyContent: 'center' }}>
                    <Text variant="h2" style={{ color: colors.neutralDark.darkest, maxWidth: 240, textAlign: "center" }}>Nothing here for now</Text>
                    <Text variant="bodyM" style={{ color: colors.neutralDark.light, maxWidth: 240, textAlign: 'center' }}>
                        This is where you’ll find your answered questions
                    </Text>
                </Box>
            ) : (
                <Box>
                    {[...history].reverse().map((item) => {
                        const statusInfo = getStatusConfig(item.status);

                        return (
                            <Box key={item.id} row align="center" style={styles.row}>
                                <Box style={styles.iconContainer}>
                                    <Feather
                                        name={statusInfo.icon as any}
                                        size={20}
                                        color={statusInfo.color}
                                    />
                                </Box>

                                <Box flex={1}>
                                    <Text variant="bodyL" style={{ lineHeight: 22 }}>
                                        <Text style={styles.questionNumber}>
                                            {item.questionNumber || '?'}.{' '}
                                        </Text>
                                        <Text style={styles.answerText}>
                                            {item.answerText}
                                        </Text>
                                    </Text>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingVertical: 24,
        justifyContent: 'center',
        backgroundColor: colors.neutralLight.light
    },
    emptyBox: {
        marginTop: 40,
        marginHorizontal: 16,
        padding: 32,
        backgroundColor: colors.neutralLight.light,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutralLight.medium,
        borderStyle: 'dashed'
    },
    row: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutralLight.medium,
        minHeight: 48,
    },
    iconContainer: {
        width: 26,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionNumber: {
        fontWeight: 'bold',
        color: colors.neutralDark.darkest,
    },
    answerText: {
        color: colors.neutralDark.darkest,
    }
});