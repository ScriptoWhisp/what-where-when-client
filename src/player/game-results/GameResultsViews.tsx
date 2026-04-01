import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { Bullet } from '@/src/ui/Bullet';
import { colors } from '@/src/theme/colors';
import { RankedLeaderboardEntry } from '@/src/player/leaderboardRank';
import { PlayerLeaderboardListItem } from '@/src/player/components/PlayerLeaderboardListItem';
import { LeaderboardEntry } from '@/src/dto/game.dto';
import {
    feedbackBtnWrap,
    heroWrap,
    listPad,
    praiseText,
    scrollContentStyle,
    textEmptySub,
    textEmptyTitle,
} from '@/src/player/game-results/gameResultsStyles';

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

export function GameResultsErrorView({ message }: { message: string }) {
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

function ResultsHero({ myScore }: { myScore: number }) {
    const { t } = useTranslation();
    return (
        <Box align="center" gap={3} style={heroWrap}>
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
}: {
    item: RankedLeaderboardEntry;
    isMe: boolean;
}) {
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
}: {
    rankedData: RankedLeaderboardEntry[];
    currentParticipantId: number | null;
    myTeam: LeaderboardEntry | undefined;
    onFeedback: () => void;
    showFeedback: boolean;
}) {
    const { t } = useTranslation();
    const empty = rankedData.length === 0;
    const extraBottom = showFeedback && !empty;

    return (
        <ScrollView
            contentContainerStyle={scrollContentStyle(empty, extraBottom)}
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
                    {showFeedback ? (
                        <Box style={feedbackBtnWrap}>
                            <Button
                                title={t('resultsScreen.giveFeedback')}
                                variant="primary"
                                onPress={onFeedback}
                            />
                        </Box>
                    ) : null}
                </>
            )}
        </ScrollView>
    );
}
