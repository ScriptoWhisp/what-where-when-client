import React from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { colors } from '@/src/theme/colors';

export default function PlayerThankYouScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <Box flex={1} justify="space-between" p={6} style={{ maxWidth: 450, alignSelf: 'center', width: '100%' }}>
                <Box flex={1} justify="center" align="center" gap={3}>
                    <Text variant="h1" style={{ textAlign: 'center', color: colors.neutralDark.darkest }}>
                        {t('feedback.thankYouTitle')}
                    </Text>
                    <Text variant="bodyM" style={{ textAlign: 'center', color: colors.neutralDark.light }}>
                        {t('feedback.thankYouSubtitle')}
                    </Text>
                </Box>
                <Box pb={Platform.OS === 'ios' ? 8 : 4}>
                    <Button
                        title={t('feedback.returnHome')}
                        variant="primary"
                        onPress={() => router.replace('/')}
                    />
                </Box>
            </Box>
        </SafeAreaView>
    );
}
