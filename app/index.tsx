import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { Box } from '@/src/ui/Box';
import { Button } from '@/src/ui/Button';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import Feather from "@expo/vector-icons/Feather";

export default function Index() {
    const router = useRouter();

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
                        Что? Где? Когда?
                    </Text>
                    <Text
                        variant="bodyM"
                        style={{
                            textAlign: 'center',
                            color: colors.neutralDark.light,
                            marginTop: 8
                        }}
                    >
                        Платформа для проведения турниров
                    </Text>
                </Box>

                <Box gap={6}>
                    <Box gap={3}>
                        <Button
                            title="Войти в игру"
                            variant="primary"
                            onPress={() => router.push('/(player)/join')}
                        />
                    </Box>
                </Box>

                <Box
                    pt={6}
                    mt={3}
                    style={{
                        borderTopWidth: 1,
                        borderTopColor: colors.neutralLight.medium
                    }}
                >
                    <Button
                        title="Дать обратную связь"
                        variant="tertiary"
                        onPress={() => router.push('https://docs.google.com/forms/d/e/1FAIpQLSei713QAvW06XJrjDr89hVMFkevLimHf8r_X18EW4VUmYuLiw/viewform')}
                    />
                </Box>

            </Box>
        </Box>
    );
}