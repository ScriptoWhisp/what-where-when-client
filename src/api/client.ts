import { getAccessToken } from "../auth/session";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export type ApiError = { status: number; message: string; body?: any };

async function buildHeaders(extra?: HeadersInit): Promise<HeadersInit> {
    const token = await getAccessToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(extra ?? {}),
    };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: await buildHeaders(options.headers),
    });

    const text = await res.text();
    const body = text ? safeJson(text) : null;

    if (!res.ok) {
        throw {
            status: res.status,
            message: body?.message || res.statusText || "Request failed",
            body,
        } satisfies ApiError;
    }

    return body as T;
}

async function requestBinary(
    path: string,
    options: RequestInit = {},
): Promise<ArrayBuffer> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: await buildHeaders(options.headers),
    });

    if (!res.ok) {
        const text = await res.text();
        const body = text ? safeJson(text) : null;
        throw {
            status: res.status,
            message: body?.message || res.statusText || "Request failed",
            body,
        } satisfies ApiError;
    }

    return res.arrayBuffer();
}

function safeJson(text: string) {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

export const api = {
    post: <T>(path: string, data: any) =>
        request<T>(path, { method: "POST", body: JSON.stringify(data) }),

    postBinary: (path: string, data: any) =>
        requestBinary(path, { method: "POST", body: JSON.stringify(data) }),
};
