import { Platform } from 'react-native';
import type { LeaderboardEntry } from '@/src/dto/game.dto';
import type { FeedbackScreen, SubmitPlayerFeedbackBody } from '@/src/dto/player-feedback.dto';

// Для Android эмулятора используем 10.0.2.2, для iOS/Web - localhost или твой IP
// Лучше вынести в конфиг, но для MVP так:
const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_URL = process.env.EXPO_PUBLIC_API_URL || DEV_URL;

export const checkGameByCode = async (code: string) => {
    // Превращаем строку в число, так как сервер ждет Int
    const codeInt = parseInt(code, 10);
    if (isNaN(codeInt)) throw new Error('Код должен состоять только из цифр');

    const response = await fetch(`${API_URL}/player/check-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameCode: codeInt }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Игра не найдена');
    }

    return response.json(); // Возвращает { gameId, gameName, teams: [...] }
};

export const getSocketUrl = () => API_URL;

export const fetchGameLeaderboard = async (gameId: string): Promise<LeaderboardEntry[]> => {
    const res = await fetch(
        `${API_URL}/player/game/${encodeURIComponent(gameId)}/leaderboard`,
    );
    if (!res.ok) {
        let message = 'Request failed';
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

export const fetchPlayerFeedbackForm = async (): Promise<FeedbackScreen> => {
    const res = await fetch(`${API_URL}/player/feedback-form`);
    if (!res.ok) {
        let message = 'Request failed';
        try {
            const err = await res.json();
            message = err.message || message;
        } catch {
            /* ignore */
        }
        throw new Error(message);
    }
    return res.json() as Promise<FeedbackScreen>;
};

export const submitPlayerFeedback = async (body: SubmitPlayerFeedbackBody) => {
    const response = await fetch(`${API_URL}/player/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        let message = 'Request failed';
        try {
            const err = await response.json();
            message = err.message || message;
        } catch {
            /* ignore */
        }
        throw new Error(message);
    }

    return response.json() as Promise<{ ok: true }>;
};