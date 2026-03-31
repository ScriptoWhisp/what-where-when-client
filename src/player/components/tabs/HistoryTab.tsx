import React from 'react';
import {ScrollView} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { ListItem } from '@/src/ui/ListItem';
import { Icon } from '@/src/ui/Icon';
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
                return { icon: 'checkmark-circle' as const, color: colors.success.dark };
            case AnswerStatus.INCORRECT:
                return { icon: 'close-circle' as const, color: colors.error.dark };
            case AnswerStatus.DISPUTABLE:
                return { icon: 'alert-circle' as const, color: colors.highlight.dark };
            default:
                return { icon: 'eye' as const, color: colors.warning.dark };
        }
    };

    const statusLabel = (status: AnswerStatus | string) => {
        switch (status) {
            case AnswerStatus.CORRECT:
                return 'Correct';
            case AnswerStatus.INCORRECT:
                return 'Incorrect';
            case AnswerStatus.DISPUTABLE:
                return 'Under review';
            default:
                return 'Pending';
        }
    };

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                paddingTop: 10,
                justifyContent: history.length === 0 ? 'center' : 'space-between',
                backgroundColor: colors.neutralLight.light,
            }}
            showsVerticalScrollIndicator={false}
        >
            {history.length === 0 ? (
                <Box align="center" gap={2} style={{ justifyContent: 'center' }}>
                    <Text variant="h2" style={{ color: colors.neutralDark.darkest, maxWidth: 240, textAlign: 'center' }}>
                        Nothing here for now
                    </Text>
                    <Text variant="bodyM" style={{ color: colors.neutralDark.light, maxWidth: 240, textAlign: 'center' }}>
                        This is where you’ll find your answered questions
                    </Text>
                </Box>
            ) : (
                <Box style={{ paddingHorizontal: 18 }}>
                    <Text variant={"bodyS"} style={{alignSelf: 'center', paddingBottom: 16}}>
                        Answered {history.length}
                    </Text>
                    {[...history].reverse().map((item) => {
                        const statusInfo = getStatusConfig(item.status);
                        const n = item.questionNumber ?? '?';

                        return (
                            <ListItem
                                key={item.id}
                                title={`${n}. ${item.answerText}`}
                                description={statusLabel(item.status)}
                                left={
                                    <Ionicons name={statusInfo.icon} size={20} color={statusInfo.color} />
                                }
                                right={<Icon name="chevron-right" size={12} color={colors.neutralDark.lightest} />}
                            />
                        );
                    })}
                </Box>
            )}
        </ScrollView>
    );
};
