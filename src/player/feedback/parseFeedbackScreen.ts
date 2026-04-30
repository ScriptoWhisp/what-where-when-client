import type {
    FeedbackChips,
    FeedbackScreen,
    FeedbackSection,
} from '@/src/dto/player-feedback.dto';

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function parseNameMap(raw: unknown): Record<string, string> {
    if (!isRecord(raw)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
        if (typeof v === 'string') out[k] = v;
    }
    return out;
}

/** API may send either `{ en, ru }` or a plain string (older servers / caches). */
function parseLocalizedField(raw: unknown): Record<string, string> | null {
    if (typeof raw === 'string') {
        const t = raw.trim();
        return t.length > 0 ? { en: t } : null;
    }
    const map = parseNameMap(raw);
    return Object.keys(map).length > 0 ? map : null;
}

function parseChipLabel(raw: unknown): Record<string, string> {
    const loc = parseLocalizedField(raw);
    return loc ?? {};
}

function parseChips(raw: unknown): FeedbackChips[] {
    if (!Array.isArray(raw)) return [];
    const out: FeedbackChips[] = [];
    for (const c of raw) {
        if (!isRecord(c)) continue;
        if (typeof c.key !== 'string' || c.key.length === 0) continue;
        out.push({ key: c.key, name: parseChipLabel(c.name) });
    }
    return out;
}

/** Client-side parse; returns null if the response does not match the contract. */
export function parseFeedbackScreen(raw: unknown): FeedbackScreen | null {
    if (!isRecord(raw)) return null;
    const sectionsRaw = raw.sections;
    if (!Array.isArray(sectionsRaw)) return null;
    const sections: FeedbackSection[] = [];
    for (const s of sectionsRaw) {
        if (!isRecord(s)) continue;
        if (typeof s.key !== 'string' || s.key.length === 0) continue;
        const title = parseLocalizedField(s.title);
        if (!title) continue;
        const chips = parseChips(s.chips);
        sections.push({ key: s.key, title, chips });
    }
    if (sections.length === 0) return null;
    return { sections };
}
