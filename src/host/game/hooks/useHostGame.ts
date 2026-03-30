import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/src/hooks/useSocket';
import {
    AdminRequestEvent,
    AdminResponseEvent,
    GameBroadcastEvent,
    GamePhase,
    GameStatus,
    GameStatuses
} from "@/src/dto/common.dto";
import { AnswerDomain, GameState, LeaderboardEntry, ParticipantDomain } from "@/src/dto/game.dto";

export function useHostGame(gameId: number) {
    const socket = useSocket('game');

    const [gameState, setGameState] = useState<GameState>({
        phase: GamePhase.IDLE,
        seconds: 0,
        isPaused: false,
        status: GameStatuses.DRAFT
    });

    const [answers, setAnswers] = useState<AnswerDomain[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [participants, setParticipants] = useState<ParticipantDomain[]>([]);

    useEffect(() => {
        if (!socket) return;

        socket.emit(AdminRequestEvent.Sync, { gameId });

        socket.on(GameBroadcastEvent.SyncState, (data: {
            state: GameState,
            answers: AnswerDomain[],
            leaderboard?: LeaderboardEntry[]
            participants?: ParticipantDomain[]
        }) => {
            if (data.state) {
                setGameState(prev => ({ ...prev, ...data.state }));
            }
            if (data.answers) {
                setAnswers(data.answers);
            }
            if (data.leaderboard) {
                setLeaderboard(data.leaderboard);
            }
            if (data.participants) {
                setParticipants(data.participants);
            }
        });

        socket.on(AdminResponseEvent.AnswerUpdate, (updatedAnswer: AnswerDomain) => {
            setAnswers(prev => {
                const index = prev.findIndex(a => a.id === updatedAnswer.id);
                if (index !== -1) {
                    const newAnswers = [...prev];
                    newAnswers[index] = updatedAnswer;
                    return newAnswers;
                }
                return [...prev, updatedAnswer];
            });
        });

        socket.on(GameBroadcastEvent.TimerUpdate, (state: GameState) => {
            setGameState(prev => {
                const isNeutralPhase = state.phase === GamePhase.IDLE || state.phase === GamePhase.PREPARATION;

                return {
                    ...prev,
                    ...state,
                    isPaused: isNeutralPhase ? false : (state.isPaused ?? prev.isPaused)
                };
            });
        });

        socket.on(GameBroadcastEvent.StatusChanged, (data: { status: GameStatus }) => {
            setGameState(prev => ({ ...prev, status: data.status, isPaused: false }));
        });

        socket.on(GameBroadcastEvent.TimerPaused, () => {
            setGameState(prev => ({ ...prev, isPaused: true }));
        });

        socket.on(GameBroadcastEvent.TimerResumed, () => {
            setGameState(prev => ({ ...prev, isPaused: false }));
        });

        socket.on(GameBroadcastEvent.LeaderboardUpdate, (data: LeaderboardEntry[]) => {
            setLeaderboard(data);
        });

        return () => {
            socket.off(GameBroadcastEvent.SyncState);
            socket.off(AdminResponseEvent.AnswerUpdate);
            socket.off(GameBroadcastEvent.TimerUpdate);
            socket.off(GameBroadcastEvent.StatusChanged);
            socket.off(GameBroadcastEvent.TimerPaused);
            socket.off(GameBroadcastEvent.TimerResumed);
            socket.off(GameBroadcastEvent.LeaderboardUpdate);
        };
    }, [socket, gameId]);

    const startGame = useCallback(() => socket?.emit(AdminRequestEvent.StartGame, { gameId }), [socket, gameId]);
    const prepareQuestion = useCallback((questionId: number) => socket?.emit(AdminRequestEvent.PrepareQuestion, { gameId, questionId }), [socket, gameId]);
    const startQuestion = useCallback((questionId: number) => socket?.emit(AdminRequestEvent.StartQuestion, { gameId, questionId }), [socket, gameId]);
    const nextQuestion = useCallback(() => socket?.emit(AdminRequestEvent.NextQuestion, { gameId }), [socket, gameId]);
    const startTimer = useCallback(() => socket?.emit(AdminRequestEvent.ResumeTimer, { gameId }), [socket, gameId]);
    const stopTimer = useCallback(() => socket?.emit(AdminRequestEvent.PauseTimer, { gameId }), [socket, gameId]);
    const judgeAnswer = useCallback((answerId: number, verdict: string) => socket?.emit(AdminRequestEvent.JudgeAnswer, { gameId, answerId, verdict }), [socket, gameId]);
    const stopQuestion = useCallback(() => socket?.emit(AdminRequestEvent.StopQuestion, { gameId }), [socket, gameId]);
    const finishGame = useCallback(() => socket?.emit(AdminRequestEvent.FinishGame, { gameId }), [socket, gameId]);
    const adjustTime = useCallback((delta: number) => socket?.emit(AdminRequestEvent.AdjustTime, { gameId, delta }), [socket, gameId]);

    return {
        gameState,
        answers,
        leaderboard,
        participants,
        startGame,
        prepareQuestion,
        startQuestion,
        nextQuestion,
        stopQuestion,
        finishGame,
        startTimer,
        stopTimer,
        judgeAnswer,
        adjustTime
    };
}