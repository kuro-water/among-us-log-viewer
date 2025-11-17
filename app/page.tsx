'use client';

import { useEffect, useState } from 'react';
import { loadGameData } from '@/lib/jsonl-parser';
import type { GameData } from '@/types/game-data.types';
import { calculateFactionWinRate } from '@/lib/data-transformers/faction-win-rate';
import { calculatePlayerFactionHeatmap } from '@/lib/data-transformers/player-faction-heatmap';
import { calculatePlayerRoleHeatmap } from '@/lib/data-transformers/player-role-heatmap';
import { calculatePlayerWinRate } from '@/lib/data-transformers/player-win-rate';
import { calculateRolePerformance } from '@/lib/data-transformers/role-performance';
import { calculateGameDuration } from '@/lib/data-transformers/game-duration';
import { calculatePlayerRadar } from '@/lib/data-transformers/player-radar';
import { calculateTaskTimeline } from '@/lib/data-transformers/task-timeline';
import { calculateEventDensity } from '@/lib/data-transformers/event-density';
import { calculatePlayerMovementTimeline } from '@/lib/data-transformers/movement-with-events';

import FactionWinRateChart from '@/components/charts/FactionWinRateChart';
import PlayerFactionHeatmap from '@/components/charts/PlayerFactionHeatmap';
import PlayerRoleHeatmap from '@/components/charts/PlayerRoleHeatmap';
import PlayerWinRateChart from '@/components/charts/PlayerWinRateChart';
import RolePerformanceChart from '@/components/charts/RolePerformanceChart';
import GameDurationChart from '@/components/charts/GameDurationChart';
import PlayerRadarChart from '@/components/charts/PlayerRadarChart';
import TaskTimelineChart from '@/components/charts/TaskTimelineChart';
import EventDensityChart from '@/components/charts/EventDensityChart';
import MovementWithEventsChart from '@/components/charts/MovementWithEventsChart';

export default function Home() {
  const [games, setGames] = useState<GameData[]>([]);
  const [selectedGame, setSelectedGame] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadGameData();
        setGames(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading game data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center text-red-500">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No game data available</h1>
        </div>
      </div>
    );
  }

  const currentGame = games[selectedGame];
  const factionWinRateData = calculateFactionWinRate(games);
  const playerFactionHeatmapData = calculatePlayerFactionHeatmap(games);
  const playerRoleHeatmapData = calculatePlayerRoleHeatmap(games);
  const playerWinRateData = calculatePlayerWinRate(games);
  const rolePerformanceData = calculateRolePerformance(games);
  const gameDurationData = calculateGameDuration(games);
  const playerRadarData = calculatePlayerRadar(games);
  const taskTimelineData = calculateTaskTimeline(currentGame);
  const eventDensityData = calculateEventDensity(currentGame);
  
  // Get first player for movement timeline
  const firstPlayerUuid = Object.values(currentGame.players.data)[0]?.identity.player_uuid;
  const movementTimelineData = firstPlayerUuid 
    ? calculatePlayerMovementTimeline(currentGame, firstPlayerUuid)
    : [];
  const firstPlayerName = Object.values(currentGame.players.data)[0]?.identity.player_name || '';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Among Us Analytics Dashboard
        </h1>
        <div className="flex justify-center items-center gap-4">
          <label htmlFor="game-select" className="text-lg">
            Select Game:
          </label>
          <select
            id="game-select"
            value={selectedGame}
            onChange={(e) => setSelectedGame(parseInt(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white"
          >
            {games.map((game, index) => (
              <option key={index} value={index}>
                Game {index + 1} - {game.match.map_name} ({new Date(game.match.start_time).toLocaleString()})
              </option>
            ))}
          </select>
        </div>
        <div className="text-center mt-4 text-gray-400">
          Total Games: {games.length} | Current Game Duration: {Math.round(currentGame.match.duration_seconds / 60)} minutes
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faction Win Rate */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <FactionWinRateChart data={factionWinRateData} />
        </div>

        {/* Player Win Rate */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <PlayerWinRateChart data={playerWinRateData} />
        </div>

        {/* Player × Faction Heatmap */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg lg:col-span-2">
          <PlayerFactionHeatmap data={playerFactionHeatmapData} />
        </div>

        {/* Player × Role Heatmap */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg lg:col-span-2">
          <PlayerRoleHeatmap data={playerRoleHeatmapData} />
        </div>

        {/* Role Performance */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <RolePerformanceChart data={rolePerformanceData} />
        </div>

        {/* Game Duration */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <GameDurationChart data={gameDurationData} />
        </div>

        {/* Player Radar */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <PlayerRadarChart data={playerRadarData} />
        </div>

        {/* Task Timeline */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <TaskTimelineChart data={taskTimelineData} />
        </div>

        {/* Event Density */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <EventDensityChart data={eventDensityData} />
        </div>

        {/* Movement with Events */}
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <MovementWithEventsChart data={movementTimelineData} playerName={firstPlayerName} />
        </div>
      </div>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Among Us Analytics Dashboard v2.0.0</p>
        <p className="mt-2">Data schema version: {currentGame.schema.version}</p>
      </footer>
    </div>
  );
}
