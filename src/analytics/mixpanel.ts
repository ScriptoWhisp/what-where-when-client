import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import * as Localization from "expo-localization";
import { encode as base64Encode } from "js-base64";

type Json =
    | null
    | boolean
    | number
    | string
    | Json[]
    | { [key: string]: Json };

type TrackProps = Record<string, Json | undefined>;

type InitOptions = {
    token?: string;
    apiHost?: string;
    debug?: boolean;
    environment?: string;
    defaultSuperProps?: TrackProps;
};

const DISTINCT_ID_KEY = "mixpanel_distinct_id_v1";

let _token: string | null = null;
let _apiHost = "https://api-eu.mixpanel.com";
let _debug = false;
let _environment: string | undefined;

let _distinctId: string | null = null;
let _superProps: TrackProps = {};
let _lastAlias: { from: string; to: string } | null = null;
let _browser: any | null = null;
let _browserInited = false;

function log(...args: any[]) {
    if (_debug) {
        // eslint-disable-next-line no-console
        console.log("[mixpanel]", ...args);
    }
}

function nowMs() {
    return Date.now();
}

function getAppVersion(): string | undefined {
    const v =
        Constants.expoConfig?.version ??
        (Constants.expoConfig as any)?.runtimeVersion ??
        undefined;
    return typeof v === "string" ? v : undefined;
}

function getLocale(): string | undefined {
    const tag = Localization.getLocales?.()?.[0]?.languageTag;
    return typeof tag === "string" ? tag : undefined;
}

function randomId(): string {
    return `${nowMs().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function storageGet(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }
    return SecureStore.getItemAsync(key);
}

async function storageSet(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
        try {
            localStorage.setItem(key, value);
        } catch {
            // ignore
        }
        return;
    }
    await SecureStore.setItemAsync(key, value);
}

async function ensureDistinctId(): Promise<string> {
    if (_distinctId) return _distinctId;

    const stored = await storageGet(DISTINCT_ID_KEY);
    if (stored) {
        _distinctId = stored;
        return stored;
    }

    const id = randomId();
    _distinctId = id;
    await storageSet(DISTINCT_ID_KEY, id);
    return id;
}

function withoutUndefined(obj: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined) out[k] = v;
    }
    return out;
}

async function postForm(path: string, payload: any): Promise<void> {
    if (!_token) return;

    const body = new URLSearchParams();
    body.set("data", base64Encode(JSON.stringify(payload)));

    const url = `${_apiHost}${path}`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    // Mixpanel returns "1" or "0" as text by default.
    const text = await res.text().catch(() => "");
    if (!res.ok || (text && text.trim() !== "1")) {
        log("request_failed", { path, status: res.status, text });
    }
}

function commonProps(): TrackProps {
    return {
        app_version: getAppVersion(),
        platform: Platform.OS,
        locale: getLocale(),
        environment: _environment,
        ..._superProps,
    };
}

export const mixpanel = {
    async init(opts: InitOptions = {}) {
        _token = opts.token ?? process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ?? null;
        // Expo env can include quotes depending on loader; make token robust.
        _token = _token?.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1") ?? null;
        _apiHost = opts.apiHost ?? "https://api-eu.mixpanel.com";
        _debug = Boolean(opts.debug ?? __DEV__);
        _environment = opts.environment ?? process.env.EXPO_PUBLIC_ENVIRONMENT ?? undefined;

        _superProps = {
            ...(opts.defaultSuperProps ?? {}),
            app_version: (opts.defaultSuperProps?.app_version as any) ?? getAppVersion(),
            platform: (opts.defaultSuperProps?.platform as any) ?? Platform.OS,
            locale: (opts.defaultSuperProps?.locale as any) ?? getLocale(),
            environment: (opts.defaultSuperProps?.environment as any) ?? _environment,
        };

        await ensureDistinctId();

        if (Platform.OS === "web" && typeof window !== "undefined" && _token && !_browserInited) {
            const mod = await import("mixpanel-browser");
            _browser = mod.default ?? mod;
            _browser.init(_token, {
                api_host: _apiHost,
                debug: __DEV__,
                track_pageview: true,
                persistence: "localStorage",
                autocapture: false,
                record_sessions_percent: 0,
            });
            _browserInited = true;
        }

        log("init", { hasToken: Boolean(_token), apiHost: _apiHost, browser: Boolean(_browserInited) });
    },

    getDistinctId() {
        return _distinctId;
    },

    setSuperProps(props: TrackProps) {
        _superProps = { ..._superProps, ...props };
    },

    async identify(distinctId: string, props?: TrackProps) {
        _distinctId = String(distinctId);
        await storageSet(DISTINCT_ID_KEY, _distinctId);
        if (Platform.OS === "web" && _browserInited && _browser) {
            _browser.identify(_distinctId);
        }

        if (props && Object.keys(props).length) {
            await mixpanel.setPeople(props);
        }
        log("identify", { distinctId: _distinctId });
    },

    async alias(newDistinctId: string) {
        const current = await ensureDistinctId();
        const to = String(newDistinctId);
        if (current === to) return;

        if (_lastAlias && _lastAlias.from === current && _lastAlias.to === to) return;
        _lastAlias = { from: current, to };
        if (Platform.OS === "web" && _browserInited && _browser) {
            _browser.alias(to, current);
            log("alias(browser)", { from: current, to });
            return;
        }

        const event = {
            event: "$create_alias",
            properties: withoutUndefined({
                token: _token,
                distinct_id: current,
                alias: to,
                time: Math.floor(nowMs() / 1000),
                ...commonProps(),
            }),
        };

        await postForm("/track", [event]);
        log("alias", { from: current, to });
    },

    async setPeople(props: TrackProps) {
        const distinctId = await ensureDistinctId();
        if (Platform.OS === "web" && _browserInited && _browser) {
            _browser.people.set(withoutUndefined({ ...commonProps(), ...props }));
            log("people_set(browser)", Object.keys(props));
            return;
        }
        const payload = {
            $token: _token,
            $distinct_id: distinctId,
            $set: withoutUndefined({
                ...commonProps(),
                ...props,
            }),
        };
        // /engage expects an array of profile updates.
        await postForm("/engage", [payload]);
        log("people_set", Object.keys(props));
    },

    async track(event: string, props: TrackProps = {}) {
        if (!_token) return;

        const distinctId = await ensureDistinctId();
        if (Platform.OS === "web" && _browserInited && _browser) {
            _browser.track(event, withoutUndefined({ ...commonProps(), ...props }));
            log("track(browser)", event, props);
            return;
        }
        const payload = [
            {
                event,
                properties: withoutUndefined({
                    token: _token,
                    distinct_id: distinctId,
                    time: Math.floor(nowMs() / 1000),
                    ...commonProps(),
                    ...props,
                }),
            },
        ];

        await postForm("/track", payload);
        log("track", event, props);
    },

    async screen(screenName: string, props: TrackProps = {}) {
        await mixpanel.track("Screen Viewed", { screen_name: screenName, ...props });
    },
};

