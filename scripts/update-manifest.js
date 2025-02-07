const fs = require("fs");
const { version } = require("../package.json");
const MANIFEST_PATH = `${__dirname}/../public/manifest.json`;

const manifest = require(`${MANIFEST_PATH}`);
console.info(
  "%cCurrent manifest version is",
  "color: green; font-weight: bold;",
  manifest.meta.version
);

console.info(
  "%cUpdating manifest version to",
  "color: green; font-weight: bold;",
  version
);

manifest.meta.version = version;

const gameId = 7314; // Dota 2 Class ID
const requiredFeatures = [
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

manifest.launch_events = [
  {
    "event_name": "game_launch",
    "launch_game": gameId,
    "data": {
      "game_info": {
        "feature": requiredFeatures
      },
      "start_minimized": true
    }
  }
];

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

console.info(
  "%cManifest updated successfully!",
  "color: green; font-weight: bold;"
);
