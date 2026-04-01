import { api } from "./client";
import { setStoredSession } from "../auth/session";

import type {
    HostLoginRequest,
    HostLoginResponse,
    HostRegisterRequest,
    HostRegisterResponse,
    HostPassdropRequest,
    HostPassdropResponse,
} from "../dto/auth.dto";

import type {
    HostGamesListRequest,
    HostGamesListResponse,
    HostGameGetResponse,
    SaveGameRequest,
    SaveGameResponse,
} from "../dto/game.dto";

export const hostApi = {
    // ---- Auth ----
    async login(body: HostLoginRequest): Promise<HostLoginResponse> {
        const res = await api.post<HostLoginResponse>("/host/login", body);
        await setStoredSession({ user: res.user, session: res.session });
        return res;
    },

    async register(body: HostRegisterRequest): Promise<HostRegisterResponse> {
        const res = await api.post<HostRegisterResponse>("/host/register", body);
        await setStoredSession({ user: res.user, session: res.session });
        return res;
    },

    passdrop(body: HostPassdropRequest): Promise<HostPassdropResponse> {
        return api.post<HostPassdropResponse>("/host/passdrop", body);
    },

    // ---- Games (protected) ----
    listGames(body: HostGamesListRequest): Promise<HostGamesListResponse> {
        return api.post<HostGamesListResponse>("/host/games", body);
    },

    createGame(body: { title: string; date_of_event: string }): Promise<HostGameGetResponse> {
        return api.post<HostGameGetResponse>("/host/games/create", body);
    },

    getGame(body: { gameId: number }): Promise<HostGameGetResponse> {
        return api.post<HostGameGetResponse>("/host/game/get", body);
    },

    saveGame(body: SaveGameRequest): Promise<SaveGameResponse> {
        return api.post<SaveGameResponse>("/host/game/save", body);
    },

    exportGameXlsx(gameId: number): Promise<ArrayBuffer> {
        return api.postBinary("/host/game/export-game", { game_id: gameId });
    },
};
