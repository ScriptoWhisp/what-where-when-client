/**
 * Player feedback HTTP contracts — mirror of
 * `what-where-when-server/src/game-client-player/main/feedback/player-feedback.dto.ts`
 * (GET /player/feedback-form, POST /player/feedback body payload shape).
 */

/** GET /player/feedback-form — one chip option in a section. */
export interface FeedbackChips {
    key: string;
    name: Record<string, string>;
}

/** GET /player/feedback-form — one section (e.g. like / improve). */
export interface FeedbackSection {
    key: string;
    /** Locale code → label (same shape as {@link FeedbackChips.name}). */
    title: Record<string, string>;
    chips: FeedbackChips[];
}

/** GET /player/feedback-form — 200 JSON body. */
export interface FeedbackScreen {
    sections: FeedbackSection[];
}

/** Alias: explicit name for the feedback-form endpoint response. */
export type GetPlayerFeedbackFormResponse = FeedbackScreen;

/** Stored in DB `player_app_feedback.payload` — same shape as POST `payload`. */
export interface PlayerAppFeedbackPayload {
    rating: number;
    /** sectionKey → selected chip keys */
    selections: Record<string, string[]>;
    comment?: string;
    locale?: string;
}

/** POST /player/feedback — request JSON body. */
export interface SubmitPlayerFeedbackDto {
    gameId: number;
    participantId: number;
    payload: PlayerAppFeedbackPayload;
}

/** POST /player/feedback — 200 JSON body on success (`PlayerController.submitFeedback`). */
export interface SubmitPlayerFeedbackResponse {
    ok: boolean;
}
