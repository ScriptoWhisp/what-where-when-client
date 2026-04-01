/** GET /player/feedback-form */
export interface FeedbackChips {
    key: string;
    name: Record<string, string>;
}

export interface FeedbackSection {
    key: string;
    title: string;
    chips: FeedbackChips[];
}

export interface FeedbackScreen {
    sections: FeedbackSection[];
}

/** Stored in DB `payload` — same shape as POST `payload`. */
export interface PlayerAppFeedbackPayload {
    rating: number;
    selections: Record<string, string[]>;
    comment?: string;
    locale?: string;
}

/** POST /player/feedback */
export interface SubmitPlayerFeedbackBody {
    gameId: number;
    participantId: number;
    payload: PlayerAppFeedbackPayload;
}
