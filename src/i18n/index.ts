import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "../locales/en.json";
import ru from "../locales/ru.json";

function resolveInitialLanguage(): string {
    const code = Localization.getLocales()[0]?.languageCode;
    if (code?.toLowerCase().startsWith("ru")) {
        return "ru";
    }
    return "ru"; // no ui for selection, always ru language
}

void i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        ru: { translation: ru },
    },
    lng: resolveInitialLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    compatibilityJSON: "v4",
    react: {
        useSuspense: false,
    },
});

export default i18n;
