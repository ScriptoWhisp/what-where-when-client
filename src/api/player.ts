import { Platform } from 'react-native';
import type { LeaderboardEntry } from '@/src/dto/game.dto';
import type {
    GetPlayerFeedbackFormResponse,
    SubmitPlayerFeedbackDto,
    SubmitPlayerFeedbackResponse,
} from '@/src/dto/player-feedback.dto';
import i18n from "@/src/i18n";

const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_URL = process.env.EXPO_PUBLIC_API_URL || DEV_URL;

export const checkGameByCode = async (code: string) => {
    // Превращаем строку в число, так как сервер ждет Int
    const codeInt = parseInt(code, 10);
    if (isNaN(codeInt)) throw new Error(i18n.t("player.join.errors.onlyDigits"));

    const response = await fetch(`${API_URL}/player/check-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameCode: codeInt }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || i18n.t("player.join.errors.notFound"));
    }

    return response.json(); // Возвращает { gameId, gameName, teams: [...] }
};

export const getSocketUrl = () => API_URL;

export const fetchGameLeaderboard = async (gameId: string): Promise<LeaderboardEntry[]> => {
    const res = await fetch(
        `${API_URL}/player/game/${encodeURIComponent(gameId)}/leaderboard`,
    );
    if (!res.ok) {
        let message = i18n.t("common.requestFailed");
        try {
            const err = await res.json();
            message = err.message || message;
        } catch {
            /* ignore */
        }
        throw new Error(message);
    }
    return res.json() as Promise<LeaderboardEntry[]>;
};

/** GET /player/feedback-form */
export const fetchPlayerFeedbackForm = async (): Promise<GetPlayerFeedbackFormResponse> => {
    const res = await fetch(`${API_URL}/player/feedback-form`);
    if (!res.ok) {
        let message = i18n.t("common.requestFailed");
        try {
            const err = await res.json();
            message = err.message || message;
        } catch {
            /* ignore */
        }
        throw new Error(message);
    }
    return res.json() as Promise<GetPlayerFeedbackFormResponse>;
};

/** POST /player/feedback */
export const submitPlayerFeedback = async (
    body: SubmitPlayerFeedbackDto,
): Promise<SubmitPlayerFeedbackResponse> => {
    const response = await fetch(`${API_URL}/player/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        let message = i18n.t("common.requestFailed");
        try {
            const err = await response.json();
            message = err.message || message;
        } catch {
            /* ignore */
        }
        throw new Error(message);
    }

    return response.json() as Promise<SubmitPlayerFeedbackResponse>;
};