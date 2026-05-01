import { useEffect, useState } from 'react';
import { fetchGameLeaderboard } from '@/src/api/player';
import { LeaderboardEntry } from '@/src/dto/game.dto';
import { mixpanel } from '@/src/analytics/mixpanel';

export function useGameResultsLeaderboard(gid: string, loadErrorLabel: string) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!gid) {
            setLoading(false);
            setError(loadErrorLabel);
            void mixpanel.track("Player Game Results Load Failed", {
                reason: "no_game_id",
            });
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        const t0 = Date.now();
        void (async () => {
            try {
                const rows = await fetchGameLeaderboard(gid);
                if (!cancelled) {
                    setLeaderboard(rows);
                    void mixpanel.track("Player Game Results Loaded", {
                        game_id: Number(gid),
                        teams_count: Array.isArray(rows) ? rows.length : 0,
                        response_time_ms: Date.now() - t0,
                    });
                }
            } catch (e) {
                if (!cancelled) {
                    const msg = e instanceof Error ? e.message : loadErrorLabel;
                    setError(msg);
                    void mixpanel.track("Player Game Results Load Failed", {
                        game_id: Number(gid),
                        error_message: msg,
                        response_time_ms: Date.now() - t0,
                    });
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
