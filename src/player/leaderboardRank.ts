import { LeaderboardEntry } from '@/src/dto/game.dto';

export type RankedLeaderboardEntry = LeaderboardEntry & { displayRank: number };

export function rankLeaderboardEntries(
    displayData: LeaderboardEntry[],
): RankedLeaderboardEntry[] {
    let currentRank = 1;
    let previousScore: number | null = null;
    let previousRating: number | null = null;

    return displayData.map((item, index) => {
        if (item.score !== previousScore || item.rating !== previousRating) {
            currentRank = index + 1;
            previousScore = item.score;
            previousRating = item.rating;
        }
        return { ...item, displayRank: currentRank };
    });
}
