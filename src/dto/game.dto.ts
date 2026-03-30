import {ID, ISODateTime, GameStatus, Pagination, GamePhase, AnswerStatus} from './common.dto';


export interface GameSettings {
  time_to_think_sec: number;
  time_to_answer_sec: number;
  time_to_dispute_end_min: number;

  show_leaderboard: boolean;
  show_questions: boolean;
  show_answers: boolean;
  can_appeal: boolean;
}

export interface GameCategory {
  id?: ID;
  name: string;
  description?: string;
}

export interface GameTeam {
  id?: ID;
  name: string;
  team_code: string;
  category_id: number,
  created_at?: ISODateTime;
}

export interface GameQuestion {
  id?: ID;
  round_id?: ID;
  question_number: number;
  text: string;
  answer: string;
  time_to_think_sec: number;
  time_to_answer_sec: number;
}

export interface GameRound {
  id?: ID;
  round_number: number;
  name?: string;
  questions: GameQuestion[];
}

export interface HostGameDetails {
  id: ID;
  title: string;
  date_of_event: string;
  status: GameStatus;
  passcode: string;

  settings: GameSettings;

  // Optional for now (may be removed from admin UI later)
  categories: GameCategory[];
  teams: GameTeam[];

  rounds: GameRound[];

  updated_at: ISODateTime;
  version: number;
}

export interface LeaderboardEntry {
  participantId: number;
  teamName: string;
  categoryId: number;
  categoryName?: string | null;
  score: number;
  rating: number;
}

export interface HostGameCard {
  id: ID;
  title: string;
  subtitle: string;
}

export interface HostGamesListRequest {
  limit?: number;
  offset?: number;
}

export interface HostGamesListResponse {
  items: HostGameCard[];
  pagination: Pagination;
}

export interface HostGameGetResponse {
  game: HostGameDetails;
}

export interface SaveGameRequest {
  game_id: ID;
  version: number;
  game: Omit<
    HostGameDetails,
    'id' | 'updated_at' | 'version' | 'status' | 'passcode'
  >

  deleted_round_ids?: ID[];
  deleted_question_ids?: ID[];
  deleted_team_ids?: ID[];
  deleted_category_ids?: ID[];
}

export interface SaveGameResponse {
  game: HostGameDetails;
}

export interface AnswerDomain {
  id: number;
  questionId: number;
  questionNumber?: number;
  participantId: number;
  teamName: string;
  answerText: string;
  status: AnswerStatus;
  submittedAt: string;
  lateBySeconds?: number;
}

export interface GameState {
  phase: GamePhase;
  seconds: number;
  isPaused: boolean;
  activeQuestionId?: number;
  activeQuestionNumber?: number;
  status?: GameStatus;
}

export interface SubmitAnswerDto {
  gameId: number;
  participantId: number;
  answer: string;
  questionId: number;
  submittedAt: string;
}

export interface ParticipantDomain {
  id: number;
  gameId: number;
  teamId: number;
  isConnected: boolean;
  socketId?: string | null;

  teamName?: string;
  categoryId?: number | null;
  categoryName?: string | null;
}