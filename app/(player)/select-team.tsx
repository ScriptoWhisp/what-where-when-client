import React, { useState } from 'react';
import {
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Alert,
    RefreshControl,
} from 'react-native';
import { checkGameByCode } from '@/src/api/player';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { colors } from '@/src/theme/colors';
import {SafeAreaView} from "react-native-safe-area-context";

export default function SelectTeamScreen() {
    const { gameData, code } = useLocalSearchParams();
    const router = useRouter();

    const [game, setGame] = useState<any>(gameData ? JSON.parse(gameData as string) : null);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const allTeams = game?.teams || [];

    const onRefresh = async () => {
        if (!code) return;
        setRefreshing(true);
        try {
            const freshGameData = await checkGameByCode(code as string);
            setGame(freshGameData);
            if (selectedTeam) {
                const updatedTeam = freshGameData.teams.find((t: any) => t.teamId === selectedTeam.teamId);
                if (!updatedTeam || !updatedTeam.isAvailable) {
                    setSelectedTeam(null);
                }
            }
        } catch (e: any) {
            Alert.alert("Ошибка", "Не удалось обновить список команд");
        } finally {
            setRefreshing(false);
        }
    };

    const handleSelect = (team: any) => {
        if (!team.isAvailable) return;
        setSelectedTeam(team);
    };

    const handleContinue = () => {
        if (!selectedTeam) return;
        router.replace({
            pathname: '/(player)/game',
            params: {
                gameId: game.gameId,
                teamId: selectedTeam.teamId,
                teamName: selectedTeam.name
            }
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }}>
            <Box flex={1} bg="neutralLight.lightest" align="center">
                <Stack.Screen options={{ headerShown: false }} />

                <Box maxWidth={450} width="100%" flex={1} p={6}>

                    <Box mb={6} gap={2}>
                        <Box align="flex-start">
                            <Text variant="h1">Вход в игру</Text>
                        </Box>

                        <Box align="center" mt={2} mb={2}>
                            <Text variant="h3" style={{ color: colors.neutralDark.darkest, textAlign: 'center', marginTop: 4 }}>
                                {game?.gameName || 'Загрузка...'}
                            </Text>
                        </Box>

                        <Box row align="center" justify="center" gap={2}>
                            <Text variant="bodyM" style={{ color: colors.neutralDark.light }}>
                                Выберите вашу команду из списка:
                            </Text>
                            {Platform.OS === 'web' && (
                                <TouchableOpacity onPress={onRefresh} style={{ padding: 4 }}>
                                    <Feather name="refresh-cw" size={16} color={colors.neutralDark.light} />
                                </TouchableOpacity>
                            )}
                        </Box>
                    </Box>

                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ gap: 12, flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={colors.highlight.darkest}
                                colors={[colors.highlight.darkest]}
                            />
                        }
                    >
                        {allTeams.map((team: any) => {
                            const isTaken = !team.isAvailable;
                            const isSelected = selectedTeam?.teamId === team.teamId;

                            return (
                                <TouchableOpacity
                                    key={team.teamId}
                                    onPress={() => handleSelect(team)}
                                    activeOpacity={isTaken ? 1 : 0.7}
                                    disabled={isTaken}
                                >
                                    <Box
                                        row
                                        justify="space-between"
                                        align="center"
                                        p={4}
                                        radius="md"
                                        style={[
                                            styles.card,
                                            isTaken && styles.cardTaken,
                                            isSelected && styles.cardSelected
                                        ]}
                                    >
                                        <Text
                                            variant="bodyL"
                                            style={{
                                                fontWeight: '600',
                                                color: isTaken ? colors.neutralDark.light : colors.neutralDark.darkest
                                            }}
                                        >
                                            {team.name}
                                        </Text>

                                        {isTaken ? (
                                            <Feather name="lock" size={20} color={colors.neutralDark.light} />
                                        ) : isSelected ? (
                                            <Box style={[styles.radioCircle, styles.radioCircleSelected]}>
                                                <Box style={styles.radioInner} />
                                            </Box>
                                        ) : (
                                            <Box style={styles.radioCircle} />
                                        )}
                                    </Box>
                                </TouchableOpacity>
                            );
                        })}

                        {allTeams.length === 0 && (
                            <Box flex={1} justify="center" align="center" mt={8}>
                                <Text variant="bodyM" style={{ color: colors.neutralDark.light }}>
                                    В этой игре пока нет команд
                                </Text>
                            </Box>
                        )}
                    </ScrollView>

                    <Box pt={6} pb={Platform.OS === 'ios' ? 4 : 0} gap={3}>
                        <Button
                            title="Назад"
                            variant="tertiary"
                            onPress={() => router.back()}
                        />
                        <Button
                            title="Продолжить"
                            variant="primary"
                            onPress={handleContinue}
                            disabled={!selectedTeam}
                        />
                    </Box>

                </Box>
            </Box>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.neutralLight.lightest,
        borderWidth: 2,
        borderColor: colors.neutralLight.medium,
    },
    cardTaken: {
        backgroundColor: colors.neutralLight.light,
        borderColor: colors.neutralLight.medium,
    },
    cardSelected: {
        borderColor: colors.highlight.darkest,
        backgroundColor: colors.highlight.lightest,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.neutralLight.dark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleSelected: {
        borderColor: colors.highlight.darkest,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.highlight.darkest,
    }
});