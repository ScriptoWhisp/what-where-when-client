/** Pick a string from a backend-provided map like `{ "en": "…", "ru": "…" }`. */
export function pickLocalizedString(labels: unknown, lang: string): string {
    if (!labels || typeof labels !== 'object' || Array.isArray(labels)) {
        return '';
    }
    const map = labels as Record<string, unknown>;
    const pick = (k: string) => {
        const v = map[k];
        return typeof v === 'string' ? v : '';
    };
    const direct = pick(lang);
    if (direct) return direct;
    const short = lang.split('-')[0];
    if (short && short !== lang) {
        const s = pick(short);
        if (s) return s;
    }
    const en = pick('en');
    if (en) return en;
    for (const v of Object.values(map)) {
        if (typeof v === 'string' && v.length > 0) return v;
    }
    return '';
}
