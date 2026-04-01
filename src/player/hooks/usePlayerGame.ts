import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '@/src/api/player';

const PARTICIPANT_SESSION_KEY = (gameId: string, teamId: string) =>
  `www-player-participant:${gameId}:${teamId}`;

export function readStoredParticipantId(gameId: string, teamId: string): number | null {
  try {
    const g = globalThis as typeof globalThis & { sessionStorage?: Storage };
    if (!g.sessionStorage) return null;
    const raw = g.sessionStorage.getItem(PARTICIPANT_SESSION_KEY(gameId, teamId));
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function persistParticipantId(gameId: string, teamId: string, participantId: number) {
  try {
    const g = globalThis as typeof globalThis & { sessionStorage?: Storage };
    if (!g.sessionStorage) return;
    g.sessionStorage.setItem(
      PARTICIPANT_SESSION_KEY(gameId, teamId),
      String(participantId),
    );
  } catch {
    /* private mode / unavailable */
  }
}
import {
    GamePhase,
    GameStatuses,
    GameStatus,
    PlayerRequestEvent,
    GameBroadcastEvent,
    PlayerResponseEvent
} from "@/src/dto/common.dto";
import { AnswerDomain, GameState, LeaderboardEntry } from "@/src/dto/game.dto";

export function usePlayerGame(gameId: string, teamId: string, teamName: string) {
    const socketRef = useRef<Socket | null>(null);

    const participantIdRef = useRef<number | null>(null);

    const [status, setStatus] = useState('Подключение...');
    const [participantId, setParticipantId] = useState<number | null>(null);
    const [lastAnswerStatus, setLastAnswerStatus] = useState<'success' | 'error' | null>(null);

    const [gameState, setGameState] = useState<{
        phase: GamePhase;
        timer: number;
        activeQuestionId: number | null;
        activeQuestionNumber: number | null;
        gameStarted: boolean;
        gameStatus: GameStatus | null;
    }>({
        phase: GamePhase.IDLE,
        timer: 0,
        activeQuestionId: null,
        activeQuestionNumber: null,
        gameStarted: false,
        gameStatus: null,
    });

    const [history, setHistory] = useState<AnswerDomain[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [finishedJoinBlocked, setFinishedJoinBlocked] = useState(false);

    const updateGameState = useCallback((data: GameState) => {
        setGameState(prev => ({
            ...prev,
            phase: data.phase,
            timer: data.seconds,
            activeQuestionId: data.activeQuestionId ?? prev.activeQuestionId,
            activeQuestionNumber: data.activeQuestionNumber ?? prev.activeQuestionNumber,
            gameStarted: data.status === GameStatuses.LIVE || data.phase !== GamePhase.IDLE,
            gameStatus: data.status ?? prev.gameStatus
        }));
    }, []);

    const syncHistory = useCallback(() => {
        const id = participantIdRef.current;
        if (id) socketRef.current?.emit(PlayerRequestEvent.SyncHistory, { participantId: id });
    }, []);

    const syncLeaderboard = useCallback(() => {
        if (gameId) {
            socketRef.current?.emit(PlayerRequestEvent.SyncLeaderboard, { gameId: Number(gameId) });
        }
    }, [gameId]);

    useEffect(() => {
        const url = `${getSocketUrl()}/game`;
        const socket = io(url, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            setStatus(`Команда: ${teamName}`);
            socket.emit(PlayerRequestEvent.JoinGame, {
                gameId: Number(gameId),
                teamId: Number(teamId)
            });
        });

        socket.on(GameBroadcastEvent.SyncState, (data: { state: GameState, participantId: number }) => {
            if (data.participantId) {
                participantIdRef.current = data.participantId;
                setParticipantId(data.participantId);
            }
            if (data.state) updateGameState(data.state);
        });

        socket.on(GameBroadcastEvent.TimerUpdate, (state: GameState) => updateGameState(state));

        socket.on(GameBroadcastEvent.StatusChanged, (data: { status: GameStatus }) => {
            setGameState(prev => ({
                ...prev,
                gameStarted: data.status === GameStatuses.LIVE || prev.gameStarted,
                gameStatus: data.status
            }));
        });

        socket.on(PlayerResponseEvent.HistoryUpdate, setHistory);
        socket.on(GameBroadcastEvent.LeaderboardUpdate, setLeaderboard);

        socket.on(PlayerResponseEvent.AnswerReceived, () => {
            setLastAnswerStatus('success');
            setStatus(`Команда: ${teamName}`);
            syncHistory();
        });

        socket.on('error', (err: { message?: string }) => {
            const msg = typeof err?.message === 'string' ? err.message : '';
            if (msg.includes('already finished')) {
                setFinishedJoinBlocked(true);
            }
            setStatus(`Ошибка: ${msg || 'unknown'}`);
            setLastAnswerStatus('error');
        });

        socket.on('disconnect', () => setStatus('Связь потеряна...'));

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [gameId, teamId, teamName, syncHistory, updateGameState]);

    useEffect(() => {
        setFinishedJoinBlocked(false);
    }, [gameId, teamId]);

    useEffect(() => {
        if (participantId != null && gameId && teamId) {
            persistParticipantId(gameId, teamId, participantId);
        }
    }, [participantId, gameId, teamId]);

    useEffect(() => {
        if (participantId) {
            syncHistory();
            syncLeaderboard();
        }
    }, [participantId, syncHistory, syncLeaderboard]);

    useEffect(() => {
        if (gameState.phase === GamePhase.IDLE || gameState.phase === GamePhase.PREPARATION) {
            setLastAnswerStatus(null);
        }
    }, [gameState.phase, gameState.activeQuestionId]);

    const submitAnswer = useCallback((answerText: string) => {
        const id = participantIdRef.current;
        const canSubmit =
            socketRef.current &&
            gameState.phase !== GamePhase.IDLE &&
            gameState.phase !== GamePhase.PREPARATION &&
            id &&
            gameState.activeQuestionId;

        if (canSubmit) {
            socketRef.current?.emit(PlayerRequestEvent.SubmitAnswer, {
                gameId: Number(gameId),
                participantId: id,
                questionId: gameState.activeQuestionId,
                answer: answerText,
                submittedAt: new Date().toISOString()
            });
            setStatus('Отправка...');
        }
    }, [gameId, gameState.phase, gameState.activeQuestionId]);

    return {
        status,
        participantId,
        ...gameState,
        lastAnswerStatus,
        history,
        leaderboard,
        submitAnswer,
        syncHistory,
        syncLeaderboard,
        finishedJoinBlocked,
    };
}