import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function PlayerLayout() {
    const { t } = useTranslation();

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="join" options={{ headerShown: false }} />
            <Stack.Screen name="select-team" options={{ title: t('player.selectTeam.navTitle'), headerShown: false }} />
            <Stack.Screen name="game" options={{ gestureEnabled: false }} />
            <Stack.Screen name="game-results" options={{ gestureEnabled: false }} />
            <Stack.Screen name="feedback" options={{ headerShown: false }} />
            <Stack.Screen name="thank-you" options={{ headerShown: false }} />
        </Stack>
    );
}