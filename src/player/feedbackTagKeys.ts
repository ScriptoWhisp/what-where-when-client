/** Должны совпадать с allowlist на сервере (`PlayerService`). */
export const FEEDBACK_LIKE_TAG_KEYS = [
    'easy_to_use',
    'complete',
    'intuitive',
    'convenient',
    'looks_good',
] as const;

export const FEEDBACK_IMPROVE_TAG_KEYS = [
    'more_components',
    'complex',
    'not_interactive',
    'only_english',
] as const;

export type FeedbackLikeTagKey = (typeof FEEDBACK_LIKE_TAG_KEYS)[number];
export type FeedbackImproveTagKey = (typeof FEEDBACK_IMPROVE_TAG_KEYS)[number];
