export const HEARTHSTONE_CLASS_ID = 7314;
export const DOTA2_CLASS_ID = 7314;

export function getHearthstoneGame(): Promise<overwolf.games.GetRunningGameInfoResult | null> {
  return new Promise((resolve) => {
    overwolf.games.getRunningGameInfo((result) => {
      resolve(
        result && result.classId === HEARTHSTONE_CLASS_ID ? result : null
      );
    });
  });
}

export function getDota2Game(): Promise<overwolf.games.GetRunningGameInfoResult | null> {
  return new Promise((resolve) => {
    overwolf.games.getRunningGameInfo((result) => {
      resolve(result && result.classId === DOTA2_CLASS_ID ? result : null);
    });
  });
}

export function getGameInfo(): Promise<any> {
  return new Promise((resolve, reject) => {
    overwolf.games.events.getInfo((info) => {
      if (info.success) {
        resolve(info.res);
      } else {
        reject(info);
      }
    });
  });
}

export const REQUIRED_FEATURES = {
  game_info: {
    start: true,
    end: true,
  },
  match_info: {
    kill: true,
    death: true,
    assist: true,
    gold: true,
    level: true,
  },
};

export const GAME_FEATURES = {
  DOTA2: {
    id: DOTA2_CLASS_ID,
    name: "Dota 2",
    hotkeys: {
      toggle: "Shift+F9",
    },
  },
};
