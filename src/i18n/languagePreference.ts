import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "preferred_ui_language";

export type AppLanguageCode = "ru" | "en" | "et";

export function isAppLanguageCode(value: string | null | undefined): value is AppLanguageCode {
    return value === "ru" || value === "en" || value === "et";
}

export async function getPreferredLanguage(): Promise<AppLanguageCode | null> {
    try {
        if (Platform.OS === "web") {
            if (typeof window === "undefined") return null;
            const raw = window.localStorage.getItem(STORAGE_KEY);
            return isAppLanguageCode(raw) ? raw : null;
        }
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        return isAppLanguageCode(raw) ? raw : null;
    } catch {
        return null;
    }
}

export async function setPreferredLanguage(lng: AppLanguageCode): Promise<void> {
    try {
        if (Platform.OS === "web") {
            if (typeof window !== "undefined") {
                window.localStorage.setItem(STORAGE_KEY, lng);
            }
            return;
        }
        await SecureStore.setItemAsync(STORAGE_KEY, lng);
    } catch {
        // non-fatal
    }
}
