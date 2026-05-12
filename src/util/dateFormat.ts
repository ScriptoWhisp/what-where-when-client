export function ddmmyyyyToIsoDate(raw: string): string {
    const parts = raw.split("-");
    if (parts.length !== 3) return "";
    const [d, m, y] = parts;
    if (!d || !m || !y) return "";
    if (d.length < 1 || m.length < 1 || y.length !== 4) return "";
    return `${y}-${m}-${d}`;
}

export function isoDateToDdmmyyyy(raw: string): string {
    const parts = raw.split("-");
    if (parts.length !== 3) return "";
    const [y, m, d] = parts;
    if (!d || !m || !y) return "";
    if (y.length !== 4) return "";
    return `${d}-${m}-${y}`;
}

