import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "../locales/en.json";
import et from "../locales/et.json";
import ru from "../locales/ru.json";
import { getPreferredLanguage, isAppLanguageCode } from "./languagePreference";

function resolveInitialLanguage(): string {
    const code = Localization.getLocales()[0]?.languageCode?.toLowerCase();
    if (code?.startsWith("ru")) {
        return "ru";
    }
    if (code?.startsWith("et")) {
        return "et";
    }
    return "en";
}

void i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        ru: { translation: ru },
        et: { translation: et },
    },
    lng: resolveInitialLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    compatibilityJSON: "v4",
    react: {
        useSuspense: false,
    },
});

/** Call before first paint after splash; applies saved language choice (ru/en/et). */
export async function hydrateStoredLanguage(): Promise<void> {
    const stored = await getPreferredLanguage();
    if (stored && isAppLanguageCode(stored)) {
        await i18n.changeLanguage(stored);
    }
}

export default i18n;
