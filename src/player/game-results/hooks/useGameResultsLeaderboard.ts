import { useEffect, useState } from 'react';
import { fetchGameLeaderboard } from '@/src/api/player';
import { LeaderboardEntry } from '@/src/dto/game.dto';

export function useGameResultsLeaderboard(gid: string, loadErrorLabel: string) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!gid) {
            setLoading(false);
            setError(loadErrorLabel);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        void (async () => {
            try {
                const rows = await fetchGameLeaderboard(gid);
                if (!cancelled) setLeaderboard(rows);
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : loadErrorLabel);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [gid, loadErrorLabel]);

    return { leaderboard, loading, error };
}
