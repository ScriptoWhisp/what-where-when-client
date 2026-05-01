import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, useRouter } from 'expo-router';
import { Box } from '@/src/ui/Box';
import { Button } from '@/src/ui/Button';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { mixpanel } from "@/src/analytics/mixpanel";

export default function Index() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <Box flex={1} bg="neutralLight.lightest" justify="center" p={6}>
            <Stack.Screen options={{ headerShown: false }} />

            <Box
                width="100%"
                maxWidth={450}
                align="stretch"
                style={{ alignSelf: 'center' }}
                gap={8}
            >
                <Box align="center">
                    <Text variant="h1" style={{ textAlign: 'center' }}>
                        {t('home.title')}
                    </Text>
                    <Text
                        variant="bodyM"
                        style={{
                            textAlign: 'center',
                            color: colors.neutralDark.light,
                            marginTop: 8
                        }}
                    >
                        {t('home.subtitle')}
                    </Text>
                </Box>

                <Box gap={3}>
                    <Button
                        title={t('home.joinGame')}
                        variant="primary"
                        onPress={() => {
                            void mixpanel.track("Home CTA Clicked", { cta: "join_game" });
                            router.push('/(player)/join');
                        }}
                    />
                    <Text variant="bodyM" style={{ textAlign: 'center', color: colors.neutralDark.light }}>
                        {t('common.or')}
                    </Text>
                    <Button
                        title={t('home.feedback')}
                        variant="secondary"
                        onPress={() => {
                            void mixpanel.track("Home CTA Clicked", { cta: "feedback" });
                            router.push({
                                pathname: '/(player)/feedback' as any,
                                params: { fromHome: '1' },
                            });
                        }}
                    />
                </Box>

            </Box>
        </Box>
    );
}