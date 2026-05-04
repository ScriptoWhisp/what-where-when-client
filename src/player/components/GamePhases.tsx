import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from "react-i18next";
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { TextField } from '@/src/ui/TextField';
import { colors } from '@/src/theme/colors';

export const GameLobby = () => {
    const { t } = useTranslation();
    return (
        <Box style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.neutralDark.dark} />
            <Text variant="bodyL" style={{ marginTop: 16, textAlign: 'center' }}>
                {t("player.phases.waitingForHost")}
            </Text>
        </Box>
    );
};

export const ThinkingPhase = ({ timer }: { timer: number }) => {
    const { t } = useTranslation();
    return (
        <Box style={{ alignItems: 'center' }}>
            <Text variant="h1" style={{ fontSize: 100, lineHeight: 110, color: timer <= 10 ? colors.highlight.dark : colors.neutralDark.lightest }}>
                {timer}
            </Text>
            <Text variant="bodyM" style={{ marginTop: 8, color: colors.highlight.dark }}>
                {t("player.phases.thinking")}
            </Text>
        </Box>
    );
};

export const AnsweringPhase = ({ onSubmit }: { onSubmit: (answer: string) => void }) => {
    const { t } = useTranslation();
    const [answer, setAnswer] = useState('');

    return (
        <Box style={{ width: '100%', paddingHorizontal: 20 }}>
            <Text variant="h5" style={{ textAlign: 'center', marginBottom: 24 }}>
                {t("player.phases.answering")}
            </Text>

            <TextField
                placeholder={t("player.phases.answerPlaceholder")}
                value={answer}
                onChangeText={setAnswer}
                style={{ marginBottom: 16 }}
            />

            <Button
                title={t("player.phases.submitAnswer")}
                onPress={() => onSubmit(answer)}
                variant="primary"
                size="md"
                disabled={!answer.trim()}
            />
        </Box>
    );
};