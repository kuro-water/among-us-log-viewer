'use client';

import { useEffect, useState } from 'react';
import { loadGameData } from '@/lib/jsonl-parser';
import { GameData } from '@/types/game-data.types';
import GameSelector from '@/components/GameSelector';
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

// Import data transformers
import { calculateFactionWinRate } from '@/lib/data-transformers/faction-win-rate';
import { generatePlayerFactionHeatmap } from '@/lib/data-transformers/player-faction-heatmap';
import { generatePlayerRoleHeatmap } from '@/lib/data-transformers/player-role-heatmap';
import { calculatePlayerWinRate } from '@/lib/data-transformers/player-win-rate';
import { calculateRolePerformance } from '@/lib/data-transformers/role-performance';
import { extractGameDurations } from '@/lib/data-transformers/game-duration';
import { generatePlayerRadarData } from '@/lib/data-transformers/player-radar';
import { generateTaskTimeline } from '@/lib/data-transformers/task-timeline';
import { calculateEventDensity } from '@/lib/data-transformers/event-density';
import { generateMovementWithEvents } from '@/lib/data-transformers/movement-with-events';

export default function Home() {
  const [games, setGames] = useState<GameData[]>([]);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGameData()
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading game data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">No game data found.</div>
      </div>
    );
  }

  const selectedGame = games[selectedGameIndex];
  
  // Calculate data for all games
  const factionWinData = calculateFactionWinRate(games);
  const playerFactionHeatmapData = generatePlayerFactionHeatmap(games);
  const playerRoleHeatmapData = generatePlayerRoleHeatmap(games);
  const playerWinData = calculatePlayerWinRate(games);
  const rolePerformanceData = calculateRolePerformance(games);
  const gameDurationData = extractGameDurations(games);
  
  // Calculate data for selected game
  const taskTimelineData = generateTaskTimeline(selectedGame);
  const eventDensityData = calculateEventDensity(selectedGame);
  
  // Get first player UUID for radar and movement charts
  const firstPlayerUuid = Object.values(selectedGame.players.data)[0]?.identity.player_uuid;
  const playerRadarData = firstPlayerUuid ? generatePlayerRadarData(games, firstPlayerUuid) : null;
  const movementWithEventsData = firstPlayerUuid ? generateMovementWithEvents(selectedGame, firstPlayerUuid) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Among Us Game Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualizing {games.length} games with 10 interactive charts
          </p>
        </header>

        <GameSelector
          games={games}
          selectedGameIndex={selectedGameIndex}
          onSelectGame={setSelectedGameIndex}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Faction Win Rate - Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <FactionWinRateChart data={factionWinData} />
          </div>

          {/* Player Win Rate - Stacked Column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <PlayerWinRateChart data={playerWinData} />
          </div>

          {/* Player × Faction Heatmap */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:col-span-2">
            <PlayerFactionHeatmap data={playerFactionHeatmapData} />
          </div>

          {/* Player × Role Heatmap */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:col-span-2">
            <PlayerRoleHeatmap data={playerRoleHeatmapData} />
          </div>

          {/* Role Performance - Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <RolePerformanceChart data={rolePerformanceData} />
          </div>

          {/* Game Duration - Histogram */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <GameDurationChart data={gameDurationData} />
          </div>

          {/* Task Timeline - Area Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <TaskTimelineChart data={taskTimelineData} />
          </div>

          {/* Event Density - Line Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <EventDensityChart data={eventDensityData} />
          </div>

          {/* Player Radar - Polar Chart */}
          {playerRadarData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <PlayerRadarChart data={playerRadarData} />
            </div>
          )}

          {/* Movement with Events - Spline Chart */}
          {movementWithEventsData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <MovementWithEventsChart data={movementWithEventsData} />
            </div>
          )}
        </div>

        <footer className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>Among Us Log Viewer - Built with Next.js and Highcharts</p>
        </footer>
      </div>
    </div>
  );
}
