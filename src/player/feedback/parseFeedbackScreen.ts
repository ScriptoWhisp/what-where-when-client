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

function parseChips(raw: unknown): FeedbackChips[] {
    if (!Array.isArray(raw)) return [];
    const out: FeedbackChips[] = [];
    for (const c of raw) {
        if (!isRecord(c)) continue;
        if (typeof c.key !== 'string' || c.key.length === 0) continue;
        out.push({ key: c.key, name: parseNameMap(c.name) });
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
        const title = parseNameMap(s.title);
        if (Object.keys(title).length === 0) continue;
        const chips = parseChips(s.chips);
        sections.push({ key: s.key, title, chips });
    }
    if (sections.length === 0) return null;
    return { sections };
}
