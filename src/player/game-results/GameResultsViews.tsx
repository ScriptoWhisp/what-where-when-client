import React from 'react';
import { useTranslation } from 'react-i18next';
import {Platform, ScrollView} from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { Bullet } from '@/src/ui/Bullet';
import { colors } from '@/src/theme/colors';
import { RankedLeaderboardEntry } from '@/src/player/leaderboardRank';
import { PlayerLeaderboardListItem } from '@/src/player/components/PlayerLeaderboardListItem';
import { LeaderboardEntry } from '@/src/dto/game.dto';
import {
    heroWrap,
    listPad,
    praiseText,
    scrollContentStyle,
    textEmptySub,
    textEmptyTitle,
} from '@/src/player/game-results/gameResultsStyles';
import {router} from "expo-router";

export function GameResultsLoadingView() {
    const { t } = useTranslation();
    return (
        <Box flex={1} justify="center" align="center" p={6}>
            <Text variant="bodyM" style={{ color: colors.neutralDark.light }}>
                {t('common.loading')}
            </Text>
        </Box>
    );
}

export function GameResultsErrorView({ message }: Readonly<{ message: string }>) {
    return (
        <Box flex={1} justify="center" align="center" p={6}>
            <Text variant="bodyM" style={{ color: colors.error.medium, textAlign: 'center' }}>
                {message}
            </Text>
        </Box>
    );
}

export function GameResultsEmptyListView() {
    const { t } = useTranslation();
    return (
        <Box align="center" gap={2} style={{ justifyContent: 'center' }}>
            <Text variant="h2" style={textEmptyTitle}>
                {t('leaderboardTab.emptyTitle')}
            </Text>
            <Text variant="bodyM" style={textEmptySub}>
                {t('leaderboardTab.emptySubtitle')}
            </Text>
        </Box>
    );
}

function ResultsHero({ myScore }: Readonly<{ myScore: number }>) {
    const { t } = useTranslation();
    return (
        <Box align="center" style={heroWrap}>
            <Bullet value={myScore} variant="primary" size="lg" />
            <Text variant="h2" style={praiseText}>
                {t('resultsScreen.praise')}
            </Text>
        </Box>
    );
}

function ResultsRow({
    item,
    isMe,
}: Readonly<{
    item: RankedLeaderboardEntry;
    isMe: boolean;
}>) {
    const { t } = useTranslation();
    return (
        <PlayerLeaderboardListItem
            title={`${item.displayRank}# ${item.teamName}`}
            description={
                isMe ? t('resultsScreen.yourTeam') : t('leaderboardTab.rating', { rating: item.rating })
            }
            score={item.score}
            highlight={isMe}
        />
    );
}

export function GameResultsFilledView({
    rankedData,
    currentParticipantId,
    myTeam,
    onFeedback,
    showFeedback,
}: Readonly<{
    rankedData: RankedLeaderboardEntry[];
    currentParticipantId: number | null;
    myTeam: LeaderboardEntry | undefined;
    onFeedback: () => void;
    showFeedback: boolean;
}>) {
    const { t } = useTranslation();
    const empty = rankedData.length === 0;

    return (
    <Box maxWidth={450} width="100%" flex={1} pb={6}>
        <ScrollView
            contentContainerStyle={scrollContentStyle(empty)}
            showsVerticalScrollIndicator={false}
        >
            {empty ? (
                <GameResultsEmptyListView />
            ) : (
                <>
                    {myTeam ? <ResultsHero myScore={myTeam.score} /> : null}
                    <Box style={listPad}>
                        {rankedData.map((item) => (
                            <ResultsRow
                                key={item.participantId}
                                item={item}
                                isMe={item.participantId === currentParticipantId}
                            />
                        ))}
                    </Box>
                </>
            )}
        </ScrollView>

        <Box pt={6} pb={Platform.OS === 'ios' ? 4 : 0} gap={3} px={6}>
            <Button title={t('common.back')} variant="tertiary" onPress={() => router.back()} />
            {showFeedback ? (
                <Button
                    title={t('resultsScreen.giveFeedback')}
                    variant="primary"
                    onPress={onFeedback}
                />
            ) : null}
        </Box>
    </Box>
    );
}
