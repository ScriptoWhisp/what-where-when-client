import { Platform } from 'react-native';

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