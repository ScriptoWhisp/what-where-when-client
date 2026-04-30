import type {
    HostGameDetails,
    SaveGameRequest,
} from "../dto/game.dto";

export function toSaveGameDraft(
    game: HostGameDetails
): SaveGameRequest["game"] {
    return {
        title: game.title,
        date_of_event: game.date_of_event,

        settings: {
            ...game.settings,
        },

        categories: game.categories.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
        })),

        teams: game.teams.map((t) => ({
            id: t.id,
            name: t.name,
            team_code: t.team_code,
            category_id: t.category_id,
        })),

        rounds: game.rounds.map((r) => ({
            id: r.id,
            round_number: r.round_number,
            name: r.name,
            questions: r.questions.map((q) => ({
                id: q.id,
                round_id: q.round_id,
                question_number: q.question_number,
                text: q.text,
                answer: q.answer,
                time_to_think_sec: q.time_to_think_sec,
                time_to_answer_sec: q.time_to_answer_sec,
            })),
        })),
    };
}
