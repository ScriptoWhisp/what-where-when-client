import { LeaderboardEntry } from '@/src/dto/game.dto';
import { rankLeaderboardEntries, RankedLeaderboardEntry } from '@/src/player/leaderboardRank';

export function findMyTeam(
    leaderboard: LeaderboardEntry[],
    currentParticipantId: number | null,
): LeaderboardEntry | undefined {
    if (currentParticipantId == null) return undefined;
    return leaderboard.find((t) => t.participantId === currentParticipantId);
}

export function rowsForCategory(
    leaderboard: LeaderboardEntry[],
    myTeam: LeaderboardEntry | undefined,
): LeaderboardEntry[] {
    if (myTeam != null) {
        return leaderboard.filter((team) => team.categoryId === myTeam.categoryId);
    }
    return leaderboard;
}

export function buildRankedDisplay(
    leaderboard: LeaderboardEntry[],
    currentParticipantId: number | null,
): {
    myTeam: LeaderboardEntry | undefined;
    rankedData: RankedLeaderboardEntry[];
} {
    const myTeam = findMyTeam(leaderboard, currentParticipantId);
    const displayRows = rowsForCategory(leaderboard, myTeam);
    return {
        myTeam,
        rankedData: rankLeaderboardEntries(displayRows),
    };
}
