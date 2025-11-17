import type { GameData, PlayerStats } from '@/types/game-data.types';

export interface PlayerRadarData {
  playerName: string;
  playerUuid: string;
  kills: number;
  deaths: number;
  tasks: number;
  distance: number;
  survivalRate: number;
}

/**
 * Calculate player radar chart data for a specific player
 */
export function calculatePlayerRadar(games: GameData[], playerUuid?: string): PlayerRadarData[] {
  const playerStatsMap: Record<string, {
    name: string;
    kills: number;
    deaths: number;
    tasks: number;
    distance: number;
    gamesPlayed: number;
    gamesAlive: number;
  }> = {};

  games.forEach((game) => {
    Object.values(game.players.data).forEach((player) => {
      const uuid = player.identity.player_uuid;
      const name = player.identity.player_name;
      
      // If playerUuid is specified, only process that player
      if (playerUuid && uuid !== playerUuid) {
        return;
      }

      if (!playerStatsMap[uuid]) {
        playerStatsMap[uuid] = {
          name,
          kills: 0,
          deaths: 0,
          tasks: 0,
          distance: 0,
          gamesPlayed: 0,
          gamesAlive: 0,
        };
      }

      const stats = playerStatsMap[uuid];
      stats.gamesPlayed++;

      // Count kills from actions
      const kills = player.actions.filter((a) => a.action_type === 'Kill').length;
      stats.kills += kills;

      // Count deaths
      if (player.lifecycle.is_dead) {
        stats.deaths++;
      } else {
        stats.gamesAlive++;
      }

      // Track tasks and distance
      stats.tasks += player.progression.tasks_completed;
      stats.distance += player.counters.movement_distance;
    });
  });

  // Convert to array format
  return Object.entries(playerStatsMap).map(([uuid, stats]) => ({
    playerName: stats.name,
    playerUuid: uuid,
    kills: stats.kills,
    deaths: stats.deaths,
    tasks: stats.tasks,
    distance: Math.round(stats.distance),
    survivalRate: stats.gamesPlayed > 0 ? (stats.gamesAlive / stats.gamesPlayed) * 100 : 0,
  }));
}
