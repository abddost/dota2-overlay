import React, { useState, useEffect } from 'react';
import './Overlay.css';
import {
  REQUIRED_FEATURES,
  WINDOW_NAMES,
  RETRY_TIMES,
  DISPLAY_OVERWOLF_HOOKS_LOGS,
  GAME_EVENTS,
} from "app/shared/constants";
import { useGameEventProvider, useWindow } from "overwolf-hooks";
import { useCallback } from "react";
import { DOTA2_CLASS_ID, getDota2Game } from '../../../lib/games';
import { setInfo, setEvent } from "../stores/background";
import store from "app/shared/store";
import { log } from "lib/log";

const { DESKTOP, IN_GAME } = WINDOW_NAMES;

interface GameStats {
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  level: number;
  matchTime: string;
  kdaRatio: number;
  lastHitCount: number;
  netWorth: number;
  heroName: string;
}

interface GameEventData {
  name: string;
  data: {
    gold?: string;
    // Add other potential properties here
  };
}

const BackgroundWindow = () => {
  const [desktop] = useWindow(DESKTOP, DISPLAY_OVERWOLF_HOOKS_LOGS);
  const [inGame] = useWindow(IN_GAME, DISPLAY_OVERWOLF_HOOKS_LOGS);
  const [isOverwolfReady, setIsOverwolfReady] = useState(false);
  const { start, stop } = useGameEventProvider(
    {
      onInfoUpdates: (info) =>
        store.dispatch(
          setInfo({
            ...info,
            timestamp: Date.now(),
          })
        ),
      onNewEvents: (events) =>
        store.dispatch(
          setEvent({
            ...events,
            timestamp: Date.now(),
          })
        ),
    },
    REQUIRED_FEATURES,
    RETRY_TIMES,
    DISPLAY_OVERWOLF_HOOKS_LOGS
  );
  const [gameStats, setGameStats] = useState<GameStats>({
    kills: 0,
    deaths: 0,
    assists: 0,
    gold: 0,
    level: 1,
    matchTime: '00:00',
    kdaRatio: 0,
    lastHitCount: 0,
    netWorth: 0,
    heroName: '',
  });
  const [showDetails, setShowDetails] = useState(false);

  // Mock data for development environment
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Simulate game events
      const mockEvents = [
        { name: 'kill', data: { count: 5 } },
        { name: 'death', data: { count: 2 } },
        { name: 'assist', data: { count: 8 } },
        { name: 'gold', data: { gold: '5000' } },
        { name: 'level', data: { level: 12 } },
        { name: 'match_duration', data: { time: 1200 } }, // 20 minutes
        { name: 'hero_update', data: { hero_name: 'Shadow Fiend', last_hits: 120 } }
      ];

      // Process mock events
      mockEvents.forEach(event => {
        handleGameEvent(event);
      });

      // Update stats periodically to simulate live game
      const interval = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          gold: prev.gold + Math.floor(Math.random() * 100),
          lastHitCount: prev.lastHitCount + Math.floor(Math.random() * 2),
          matchTime: (() => {
            const [min, sec] = prev.matchTime.split(':').map(Number);
            const totalSeconds = min * 60 + sec + 1;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
          })()
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const startApp = useCallback(
    async (reason: string) => {
      if (process.env.NODE_ENV === 'development') {
        return; // Skip in development
      }
      
      if (!desktop || !inGame) return;
      log(reason, "src/screens/background/components/Screen.tsx", "startApp");
      const game = await getDota2Game();
      if (game) {
        await Promise.all([start(), inGame?.restore(), desktop?.minimize()]);
      } else {
        await Promise.all([stop(), desktop?.restore()]);
      }
    },
    [desktop, inGame, start, stop]
  );

  const handleGameEvent = useCallback(
    (event: overwolf.games.events.NewGameEvents | any) => {
      switch (event.name) {
        case 'kill':
          setGameStats(prev => ({ ...prev, kills: event.data.count }));
          break;
        case 'death':
          setGameStats(prev => ({ ...prev, deaths: event.data.count }));
          break;
        case 'assist':
          setGameStats(prev => ({ ...prev, assists: event.data.count }));
          break;
        case 'gold':
          setGameStats(prev => ({ ...prev, gold: parseInt(event.data.gold) }));
          break;
        case 'level':
          setGameStats(prev => ({ ...prev, level: event.data.level }));
          break;
        case 'match_duration':
          const minutes = Math.floor(event.data.time / 60);
          const seconds = event.data.time % 60;
          setGameStats(prev => ({
            ...prev,
            matchTime: `${minutes}:${seconds.toString().padStart(2, '0')}`
          }));
          break;
        case 'hero_update':
          setGameStats(prev => ({
            ...prev,
            heroName: event.data.hero_name,
            lastHitCount: event.data.last_hits
          }));
          break;
      }
      
      // Calculate KDA ratio
      setGameStats(prev => ({
        ...prev,
        kdaRatio: prev.deaths === 0 
          ? prev.kills + prev.assists 
          : Number(((prev.kills + prev.assists) / prev.deaths).toFixed(2))
      }));
    },
    []
  );

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const initializeOverwolf = () => {
        if (window.overwolf) {
          setIsOverwolfReady(true);
        }
      };

      if (window.overwolf) {
        setIsOverwolfReady(true);
      } else {
        window.addEventListener('overwolfinjected', initializeOverwolf);
      }

      return () => {
        window.removeEventListener('overwolfinjected', initializeOverwolf);
      };
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && !isOverwolfReady) return;

    if (process.env.NODE_ENV === 'production') {
      startApp("on initial load");
      
      overwolf.games.onGameInfoUpdated.addListener(async (event) => {
        if (
          event.runningChanged &&
          event.gameInfo?.classId === DOTA2_CLASS_ID
        ) {
          startApp("onGameInfoUpdated");
        }
      });

      overwolf.extensions.onAppLaunchTriggered.addListener(() => {
        startApp("onAppLaunchTriggered");
      });

      overwolf.games.events.onNewEvents.addListener(handleGameEvent);

      return () => {
        overwolf.games.onGameInfoUpdated.removeListener(() => {});
        overwolf.extensions.onAppLaunchTriggered.removeListener(() => {});
        overwolf.games.events.onNewEvents.removeListener(handleGameEvent);
      };
    }
  }, [startApp, handleGameEvent, isOverwolfReady]);

  return (
    <div className="overlay-container">
      <div className="stats-panel">
        <div className="header">
          <h2>Dota 2 Match Stats</h2>
          <button 
            className="toggle-button"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Basic View' : 'Advanced View'}
          </button>
        </div>
        
        <div className="basic-stats">
          <div className="stat-item">
            <span className="stat-label">Time:</span>
            <span className="stat-value">{gameStats.matchTime}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Hero:</span>
            <span className="stat-value">{gameStats.heroName}</span>
          </div>
          <div className="kda-container">
            <div className="kda-item">
              <span className="stat-label">K</span>
              <span className="stat-value">{gameStats.kills}</span>
            </div>
            <div className="kda-item">
              <span className="stat-label">D</span>
              <span className="stat-value">{gameStats.deaths}</span>
            </div>
            <div className="kda-item">
              <span className="stat-label">A</span>
              <span className="stat-value">{gameStats.assists}</span>
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="advanced-stats">
            <div className="stat-grid">
              <div className="stat-item">
                <span className="stat-label">KDA Ratio</span>
                <span className="stat-value">{gameStats.kdaRatio}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last Hits</span>
                <span className="stat-value">{gameStats.lastHitCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Net Worth</span>
                <span className="stat-value">${gameStats.netWorth}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Level</span>
                <span className="stat-value">{gameStats.level}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Gold</span>
                <span className="stat-value">{gameStats.gold}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .overlay-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
        }

        .stats-panel {
          background: rgba(0, 0, 0, 0.8);
          border-radius: 8px;
          padding: 12px;
          color: white;
          font-family: Arial, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .toggle-button {
          background: #4a4a4a;
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        }

        .basic-stats {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .stat-label {
          font-weight: bold;
        }

        .kda-container {
          display: flex;
          gap: 10px;
        }

        .kda-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .advanced-stats {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #666;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
      `}</style>
    </div>
  );
};

export default BackgroundWindow;
