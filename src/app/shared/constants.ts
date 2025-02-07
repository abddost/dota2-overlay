//Hearthstone Game Events
//@see Please read the overwolf.games.events documentation page to learn how to use Overwolf game events.

// Dota 2 Game Events
// @see https://overwolf.github.io/docs/api/overwolf-games-events-dota2
export const REQUIRED_FEATURES = [
  'match_info',
  'game_state_changed',
  'kill',
  'death',
  'assist',
  'gold',
  'level',
  'match_state',
  'match_duration'
];

export const RETRY_TIMES = 10;

// register gep events
export const REGISTER_RETRY_TIMEOUT = 10000;

//same name in the public/app/manifest.json  "windows"
export const WINDOW_NAMES = {
  BACKGROUND: "background",
  SETTINGS: "settings",
  IN_GAME: "in_game",
  DESKTOP: "desktop",
  NOTIFICATION: "notification",
} as const;

export const DISPLAY_OVERWOLF_HOOKS_LOGS = true;

export const DOTA2_CLASS_ID = 7314;

export const GAME_EVENTS = {
  MATCH_START: "match_start",
  MATCH_END: "match_end",
  KILL: "kill",
  DEATH: "death",
  ASSIST: "assist",
  GOLD_CHANGE: "gold_change",
  LEVEL_UP: "level_up",
} as const;
