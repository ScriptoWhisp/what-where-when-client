import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ScrollView,
    StyleSheet,
    Platform,
    Alert,
} from 'react-native';
import { checkGameByCode } from '@/src/api/player';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { ListItem } from '@/src/ui/ListItem';
import { RadioButton } from '@/src/ui/RadioButton';
import { colors } from '@/src/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Tag} from "@/src/ui/Tag";
import { mixpanel } from "@/src/analytics/mixpanel";

export default function SelectTeamScreen() {
    const { t } = useTranslation();
    const { gameData, code } = useLocalSearchParams();
    const router = useRouter();

    const [game, setGame] = useState<any>(gameData ? JSON.parse(gameData as string) : null);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const scrollYRef = useRef(0);
    const scrollViewRef = useRef<ScrollView | null>(null);
    const inFlightRef = useRef(false);

    const allTeams = game?.teams || [];

    const handleSelect = (team: any) => {
        if (!team.isAvailable) return;
        setSelectedTeam(team);
        void mixpanel.track("Player Team Selected", {
            game_id: game?.gameId,
            team_id: team?.teamId,
            team_name: team?.name,
            is_available: Boolean(team?.isAvailable),
        });
    };

    const handleContinue = () => {
        if (!selectedTeam) return;
        void mixpanel.track("Player Entered Game", {
            game_id: game?.gameId,
            team_id: selectedTeam?.teamId,
        });
        router.replace({
            pathname: '/(player)/game',
            params: {
                gameId: game.gameId,
                teamId: selectedTeam.teamId,
                teamName: selectedTeam.name,
            },
        });
    };

    useEffect(() => {
        if (!code) return;

        const POLL_INTERVAL_MS = 3000;
        let cancelled = false;

        const restoreScroll = () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollViewRef.current?.scrollTo({ y: scrollYRef.current, animated: false });
                });
            });
        };

        const poll = async () => {
            if (cancelled) return;
            if (inFlightRef.current) return;
            inFlightRef.current = true;

            try {
                const freshGameData = await checkGameByCode(code as string);
                if (cancelled) return;

                setGame(freshGameData);
                setSelectedTeam((prev: any) => {
                    if (!prev) return prev;
                    const updatedTeam = freshGameData?.teams?.find((t: any) => t.teamId === prev.teamId);
                    if (!updatedTeam || !updatedTeam.isAvailable) return null;
                    return updatedTeam;
                });

                restoreScroll();
            } catch (e: any) {
                if (!cancelled) {
                    Alert.alert(t('common.error'), t('player.selectTeam.pollError'));
                }
            } finally {
                inFlightRef.current = false;
            }
        };

        void poll();
        const intervalId = setInterval(() => {
            void poll();
        }, POLL_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, [code, t]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }}>
            <Box flex={1} bg="neutralLight.lightest" align="center">
                <Stack.Screen options={{ headerShown: false }} />

                <Box maxWidth={450} width="100%" flex={1} p={6}>
                    <Box mb={6} gap={2}>
                        <Box align="flex-start">
                            <Text variant="h1">{t('player.selectTeam.screenTitle')}</Text>
                        </Box>
                    </Box>

                    <ScrollView
                        ref={scrollViewRef}
                        style={{ flex: 1 }}
                        contentContainerStyle={{ gap: 12, flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        onScroll={(e) => {
                            scrollYRef.current = e.nativeEvent.contentOffset.y;
                        }}
                        scrollEventThrottle={16}
                    >
                        {allTeams.map((team: any) => {
                            const isTaken = !team.isAvailable;
                            const isSelected = selectedTeam?.teamId === team.teamId;

                            return (
                                <ListItem
                                    key={team.teamId}
                                    title={team.name}
                                    titleVariant="bodyM"
                                    titleStyle={{
                                        color: colors.neutralDark.darkest,
                                    }}
                                    variant={isSelected && !isTaken ? 'highlight' : 'default'}
                                    style={[
                                        isTaken && styles.listRowTaken,
                                    ]}
                                    onPress={isTaken ? undefined : () => handleSelect(team)}
                                    accessibilityRole="radio"
                                    accessibilityState={{ disabled: isTaken, selected: isSelected }}
                                    right={
                                        isTaken ? (
                                            <Tag text={t('player.selectTeam.taken')} variant="solid" />
                                        ) : (
                                            <RadioButton selected={isSelected} />
                                        )
                                    }
                                />
                            );
                        })}

                        {allTeams.length === 0 && (
                            <Box flex={1} justify="center" align="center" mt={8}>
                                <Text variant="bodyM" style={{ color: colors.neutralDark.light }}>
                                    {t('player.selectTeam.noTeams')}
                                </Text>
                            </Box>
                        )}
                    </ScrollView>

                    <Box pt={6} pb={Platform.OS === 'ios' ? 4 : 0} gap={3}>
                        <Button title={t('common.back')} variant="tertiary" onPress={() => router.back()} />
                        <Button title={t('common.continue')} variant="primary" onPress={handleContinue} disabled={!selectedTeam} />
                    </Box>
                </Box>
            </Box>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    listRowTaken: {
        backgroundColor: colors.neutralLight.light,
    },
});
