import type { GameData, PlayerStats } from '@/types/game-data.types';
import { getRoleFaction } from '@/lib/role-mapping';

/**
 * Calculate player win rates and statistics
 */
export function calculatePlayerWinRate(games: GameData[]): PlayerStats[] {
  const playerStatsMap: Record<string, PlayerStats> = {};

  games.forEach((game) => {
    Object.values(game.players.data).forEach((player) => {
      const uuid = player.identity.player_uuid;
      const name = player.identity.player_name;
      
      if (!playerStatsMap[uuid]) {
        playerStatsMap[uuid] = {
          playerName: name,
          playerUuid: uuid,
          totalGames: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalTasks: 0,
          totalDistance: 0,
          averageTasksPerGame: 0,
          averageDistancePerGame: 0,
        };
      }

      const stats = playerStatsMap[uuid];
      stats.totalGames++;
      
      if (player.lifecycle.is_winner) {
        stats.wins++;
      } else {
        stats.losses++;
      }

      // Count kills from actions
      const kills = player.actions.filter((a) => a.action_type === 'Kill').length;
      stats.totalKills += kills;

      // Count deaths
      if (player.lifecycle.is_dead) {
        stats.totalDeaths++;
      }

      // Track tasks
      stats.totalTasks += player.progression.tasks_completed;

      // Track movement distance
      stats.totalDistance += player.counters.movement_distance;
    });
  });

  // Calculate averages and win rates
  Object.values(playerStatsMap).forEach((stats) => {
    stats.winRate = stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0;
    stats.averageTasksPerGame = stats.totalGames > 0 ? stats.totalTasks / stats.totalGames : 0;
    stats.averageDistancePerGame = stats.totalGames > 0 ? stats.totalDistance / stats.totalGames : 0;
  });

  // Return sorted by player name
  return Object.values(playerStatsMap).sort((a, b) =>
    a.playerName.localeCompare(b.playerName)
  );
}
