# Mixpanel — Events Reference

This document describes every event the client app sends to Mixpanel, its properties and context.

Tracker implementation: `src/analytics/mixpanel.ts` (HTTP API + `mixpanel-browser` for web).
Initialization point: `app/_layout.tsx` → `mixpanel.init()`.

---

## Super-props (default context attached to every event)

| Key | Where it's set | Meaning |
|---|---|---|
| `app_version`, `platform`, `locale`, `environment` | `mixpanel.init` | Standard system properties |
| `role` | After login/signup, on host-admin screen, on player socket connect | `host` / `player` |
| `host_id` | After login/signup | Host id |
| `session_present` | After init / login / logout | Whether a host session is active |
| `game_id` | On host admin (`/game/[gameId]`) and in player game | Game id |
| `team_id` | After player socket connect | Team id |
| `host_screen` | On host admin | `create_game` / `game_admin` |
| `is_new` | On host admin | Creating a new game vs editing |

---

## App lifecycle / session

| Event | When | Key properties |
|---|---|---|
| `App Opened` | After `mixpanel.init()` on app startup | `has_session`, `init_time_ms`, `distinct_id` |
| `Session Restored` | On startup, when a stored host session is found | `host_id`, `role` |
| `Session Cleared` | After host logout | — |
| `Host Session Expired` | API returned 401 while loading the games list | `response_time_ms` |
| `Screen Viewed` | Any navigation (`mixpanel.screen` in `_layout`) | `screen_name`, `route`, `role` |

## Home

| Event | When | Properties |
|---|---|---|
| `Home CTA Clicked` | Click on a button on the home screen | `cta` ∈ `join_game` / `feedback` |

## Host — Auth

| Event | When | Properties |
|---|---|---|
| `Host Login Submitted` | Click on "Login" | `email_domain` |
| `Host Login Succeeded` | Successful login | `host_id`, `role`, `response_time_ms` |
| `Host Login Failed` | Login error | `email_domain`, `error_message`, `status`, `response_time_ms` |
| `Host Login Show Password Toggled` | Toggle password visibility | `visible` |
| `Host Login Forgot Password Clicked` | Click on "Forgot password?" | `email_domain` |
| `Host Login Register Link Clicked` | Navigation to signup | — |
| `Host Signup Submitted` | Click on "Sign up" | `email_domain`, `agreed_terms`, `name_filled`, `password_length`, `passwords_match` |
| `Host Signup Succeeded` | Successful signup | `host_id`, `role`, `response_time_ms` |
| `Host Signup Failed` | Signup error | `email_domain`, `error_message`, `status`, `response_time_ms` |
| `Host Signup Show Password Toggled` | Visibility of password / confirm field | `field`, `visible` |
| `Host Signup Terms Toggled` | Agreement checkbox | `agreed` |
| `Host Signup Terms Link Clicked` | Click on T&C / Privacy link | `link` ∈ `terms_and_conditions` / `privacy_policy` |
| `Host Logout Clicked` | "Log out" button on the setup screen | — |

## Host — Setup / games list

| Event | When | Properties |
|---|---|---|
| `Host Games List Viewed` | After the list is loaded | `result` ∈ `success`/`fail`, `items_count`, `response_time_ms`, `error_message`, `status` |
| `Host Game Create Started` | "Create game" button | — |
| `Host Game Opened` | Click on a game card | `game_id` |

## Host — Editor (creation/editing)

| Event | When | Properties |
|---|---|---|
| `Host Editor Loaded` | Existing game loaded successfully | `game_id`, `version`, `rounds_count`, `response_time_ms` |
| `Host Editor Load Failed` | Load error | `game_id`, `error_message`, `status`, `response_time_ms` |
| `Host Editor Date Changed` | Event date changed | `game_id`, `is_new`, `has_value` |
| `Host Editor Setting Changed` | Any toggle/value in the Settings section | `setting_key`, `value`, `previous_value`, `value_type` |
| `Host Editor Round Added` | Round added | `game_id`, `is_new`, `round_number`, `total_rounds` |
| `Host Editor Round Removed` | Round removed | `game_id`, `round_id`, `round_number`, `questions_in_round`, `was_persisted` |
| `Host Editor Round Selected` | Round selected in the editor | `round_id`, `round_number` |
| `Host Editor Question Added` | Question added | `round_id`, `round_number`, `question_number`, `total_questions_in_round` |
| `Host Editor Question Removed` | Question removed | `round_id`, `question_id`, `question_number`, `was_persisted` |
| `Host Editor Question Selected` | Question selected in the editor | `round_id`, `question_id`, `question_number` |
| `Host Editor Category Added` | Category added | `is_new`, `name_length`, `has_description` |
| `Host Editor Category Updated` | Category updated | `category_id`, `name_changed`, `description_changed` |
| `Host Editor Category Removed` | Category removed | `category_id`, `was_persisted` |
| `Host Editor Team Added` | Team added | `category_id`, `name_length`, `code_length` |
| `Host Editor Team Updated` | Team updated | `team_id`, `name_changed`, `code_changed`, `category_changed`, `category_id` |
| `Host Editor Team Removed` | Team removed | `team_id`, `was_persisted` |
| `Host Editor Team Category Selected` | Picking a category chip when adding/editing a team | `category_id`, `previous_category_id`, `is_editing` |
| `Host Game Create Submitted` | Create form submit | — |
| `Host Game Create Succeeded` | Game created | `game_id` |
| `Host Game Create Failed` | Create error | `error_message`, `status` |
| `Host Game Saved Submitted` | "Save" button in the editor | `game_id`, `rounds_count`, `teams_count`, `categories_count`, `questions_count`, `deleted_*_count` |
| `Host Game Saved Succeeded` | Saved | `game_id`, `version`, `response_time_ms` |
| `Host Game Saved Failed` | Save error | `game_id`, `error_message`, `status`, `response_time_ms` |

## Host — Game admin (live control)

| Event | When | Properties |
|---|---|---|
| `Host Game Mounted` | `/game/[gameId]` screen opened | `game_id`, `is_new` |
| `Host Game Loaded` | When `editor.loaded` resolves | `game_id`, `version`, `rounds_count`, `questions_count`, `teams_count`, `categories_count`, `status` |
| `Host Game Back Clicked` | Back button in the NavBar | `game_id`, `is_new`, `active_tab`, `game_status` |
| `Host Tab Viewed` | Tab change (Settings/Answers/Leaderboard/Teams) | `game_id`, `tab`, `tab_from`, `is_new` |
| `Host Admin Sync Emitted` | Emitting `admin:sync` after socket connect | `game_id` |
| `Host Game Start Clicked` | "Start game" button | `game_id` |
| `Host Question Prepared` | `prepare_question` command (incl. Restart and Prev) | `game_id`, `question_id` |
| `Host Question Started` | `start_question` command | `game_id`, `question_id` |
| `Host Next Question` | "Next" button | `game_id` |
| `Host Prev Question Clicked` | "< Prev" button | `game_id`, `active_question_id`, `current_index`, `total_questions`, `has_prev` |
| `Host Active Question Changed` | `activeQuestionId` changed (from broadcast) | `from_question_id`, `to_question_id`, `to_question_number` |
| `Host Timer Resumed` | `resume_timer` command | `game_id` |
| `Host Timer Paused` | `pause_timer` command | `game_id` |
| `Host Timer Toggle Clicked` | Click on the play/pause button in the sidebar | `current_action` ∈ `start_question`/`resume_timer`/`pause_timer`, `phase`, `is_paused`, `time_left_s` |
| `Host Adjust Time Clicked` | ±10 sec buttons | `direction`, `delta_s`, `phase`, `time_left_s`, `active_question_id` |
| `Host Time Adjusted` | `adjust_time` emit (internal command) | `game_id`, `delta_s` |
| `Host Question Stopped` | "Stop question" | `game_id` |
| `Host Game Finished` | "Finish game" | `game_id` |
| `Host Answer Judged` | Verdict on a team's answer | `game_id`, `answer_id`, `verdict` |
| `Host Code Copy Clicked` | Game passcode copy | `has_passcode`, `game_status` |
| `Host Answers Question Selected` | Question circle on the Answers Dashboard | `question_id`, `question_number`, `round_id`, `from_question_id`, `is_active` |
| `Host Game Export Started` | XLSX export started | `game_id`, `format`, `teams_count` |
| `Host Game Export Succeeded` | Export completed | `game_id`, `size_bytes`, `response_time_ms` |
| `Host Game Export Failed` | Export error | `game_id`, `error_message`, `status`, `response_time_ms` |

## Game state (broadcast, host)

| Event | When | Properties |
|---|---|---|
| `Game Status Changed` | Server broadcasted a status change | `game_id`, `from`, `to` |
| `Game Phase Changed` | Server broadcasted a phase change | `game_id`, `from`, `to`, `active_question_id`, `active_question_number` |
| `Timer Paused Broadcast` | `timer_paused` broadcast | `game_id`, `phase`, `time_left_s`, `active_question_id` |
| `Timer Resumed Broadcast` | `timer_resumed` broadcast | `game_id`, `phase`, `time_left_s`, `active_question_id` |

## Player

| Event | When | Properties |
|---|---|---|
| `Player Join Mounted` | Code-entry screen opened | — |
| `Player Join Code Entered` | OTP filled (4 digits) | `code_length`, `input_method` ∈ `paste`/`type`, `has_error_before` |
| `Player Join Code Submitted` | Code check start/success/fail | `code`, `result` ∈ `pending`/`success`/`fail`, `attempt`, `previous_failed_attempts`/`failed_attempts`, `response_time_ms`, `teams_count`, `game_id`, `error_message` |
| `Player Join Back Clicked` | "Back" button | `digits_entered`, `attempts`, `failed_attempts` |
| `Player Select Team Mounted` | Team-selection screen opened | `game_id`, `code`, `teams_count`, `available_teams_count` |
| `Player Team Selected` | Tap on an available team | `game_id`, `team_id`, `team_name`, `is_available` |
| `Player Team Taken Pressed` | Tap on a taken team | `game_id`, `team_id`, `team_name` |
| `Player Select Team Back Clicked` | "Back" button | `game_id`, `had_selection` |
| `Player Entered Game` | Continue → navigation into the game | `game_id`, `team_id` |
| `Player Game Mounted` | Game screen opened | `game_id`, `team_id`, `team_name` |
| `Player Tab Changed` | Bottom tab change | `game_id`, `team_id`, `tab_from`, `tab_to`, `game_phase`, `game_status` |
| `Player Join Game Emitted` | `join_game` emit after `connect` | `game_id`, `team_id` |
| `Player Game Phase Observed` | Phase changed via `sync_state`/`timer_update` | `from`, `to`, `active_question_id`, `seconds` |
| `Player Game Status Observed` | Game status changed | `from`, `to`, `source` |
| `Player Game Active Question Observed` | Active question changed | `from_question_id`, `to_question_id`, `to_question_number` |
| `Player Answer Input Focused` | First focus on the answer input for the current question | `question_number`, `phase`, `time_left_s`, `has_existing_answer` |
| `Player Answer Submit Clicked` | Click on "Submit"/"Resubmit" | `question_number`, `phase`, `time_left_s`, `answer_length`, `is_resubmit` |
| `Player Answer Submitted` | `submit_answer` emit | `game_id`, `team_id`, `participant_id`, `question_id`, `question_number`, `phase`, `time_left_s`, `answer_length` |
| `Player Answer Ack` | Server confirmed `answer_received` | `game_id`, `team_id`, `participant_id`, `question_id`, `latency_ms` |
| `Player History Updated` | `history_update` received | `count` |
| `Player Leaderboard Updated` | `leaderboard_update` received | `count` |
| `Player Mini Widget Pressed` | Tap on the mini widget (collapsed timer) | `game_id`, `team_id`, `phase`, `time_left_s`, `from_tab` |
| `Player Game Finished Viewed` | "Game finished" screen rendered | `history_count` |
| `Player Feedback Clicked` | Feedback button on the finished screen | `source` |
| `Player Socket Error` | Socket `error` event | `game_id`, `team_id`, `error_message` |

## Sockets (generic)

| Event | When | Properties |
|---|---|---|
| `Socket Connected` | Any namespace | `namespace`, `role` |
| `Socket Connect Error` | Connection error | `namespace`, `error_message` |
| `Socket Disconnected` | Socket lost / closed | `namespace`, `role` |

---

## File map

- `app/_layout.tsx` — App Opened, Session Restored, Screen Viewed.
- `app/index.tsx` — Home CTA.
- `app/(host)/login.tsx`, `app/(host)/signup.tsx` — Auth/UX events + super-props.
- `app/(host)/setup.tsx` — Games List, Logout, Session Expired/Cleared.
- `app/(host)/game/[gameId].tsx` — Mounted/Loaded/Back/PrevQuestion/Tab + super-props.
- `src/host/game/components/ControlSidebar.tsx` — Code copy, Timer toggle, Adjust time direction.
- `src/host/game/components/tabs/AnswersDashboard.tsx` — Question selected.
- `src/host/game/components/tabs/HostLeaderboard.tsx` — Export started/succeeded/failed.
- `src/host/game/hooks/useHostGame.ts` — All live commands, broadcast Game/Phase/Timer events.
- `src/host/game/components/tabs/editor/state.ts` — Editor Loaded/LoadFailed, add/remove/select/update for rounds/questions/categories/teams + Game Save events.
- `src/host/game/components/tabs/editor/ui/Settings.tsx` — Setting Changed.
- `src/host/game/components/tabs/editor/ui/Teams.tsx` — Team Category Selected.
- `app/(player)/join.tsx` — Mounted/Back, attempts, Code Entered/Submitted.
- `app/(player)/select-team.tsx` — Mounted/Back/TakenPressed/Selected.
- `app/(player)/game.tsx` — Mounted, Mini Widget Pressed, Tab Changed.
- `src/player/hooks/usePlayerGame.ts` — Phase/Status/Question Observed, History/Leaderboard Updated, Answer Submitted/Ack, Socket Error/Connected/Disconnected, identify/alias.
- `src/player/components/tabs/PlayTab.tsx` — Input Focused, Submit Clicked (resubmit), Finished Viewed, Feedback Clicked.
- `src/hooks/useSocket.ts` — Socket Connected/Connect Error/Disconnected.

---

## Conventions

- Event names use `Title Case` without prefixes like `track_`.
- Properties use `snake_case`.
- `response_time_ms` — milliseconds from request start to response.
- `result` for two-stage submit events: `pending` → `success` / `fail`.
- `error_message` / `status` are always set on `result: "fail"` or in `*_Failed` events.
- String lengths are sent as `*_length` instead of the actual text (exception: game code — it's a public 4-digit code).
- Identifiers (`game_id`, `team_id`, `participant_id`, `question_id`, `host_id`) are numeric.
