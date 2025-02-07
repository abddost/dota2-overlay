export const DOTA2_CLASS_ID = 7314;

export interface GameConfig {
  classId: number;
  gameTitle: string;
  features: {
    events: boolean;
    hotkeys: boolean;
    gameEvents: boolean;
  };
}

export const getDota2Game = (): GameConfig => ({
  classId: DOTA2_CLASS_ID,
  gameTitle: 'Dota 2',
  features: {
    events: true,
    hotkeys: false,
    gameEvents: true
  }
});
