import type { GameData, RolePerformance } from '@/types/game-data.types';
import { getRoleFaction } from '@/lib/role-mapping';

/**
 * Calculate role performance statistics
 */
export function calculateRolePerformance(games: GameData[]): RolePerformance[] {
  const roleStatsMap: Record<string, {
    totalGames: number;
    wins: number;
    totalTasks: number;
    totalSurvivalTime: number;
  }> = {};

  games.forEach((game) => {
    Object.values(game.players.data).forEach((player) => {
      const role = player.role.main_role;
      
      if (!roleStatsMap[role]) {
        roleStatsMap[role] = {
          totalGames: 0,
          wins: 0,
          totalTasks: 0,
          totalSurvivalTime: 0,
        };
      }

      const stats = roleStatsMap[role];
      stats.totalGames++;
      
      if (player.lifecycle.is_winner) {
        stats.wins++;
      }

      stats.totalTasks += player.progression.tasks_completed;
      stats.totalSurvivalTime += player.lifecycle.time_alive_seconds;
    });
  });

  // Convert to array and calculate averages
  return Object.entries(roleStatsMap).map(([role, stats]) => ({
    role,
    faction: getRoleFaction(role),
    totalGames: stats.totalGames,
    wins: stats.wins,
    winRate: stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0,
    averageTasks: stats.totalGames > 0 ? stats.totalTasks / stats.totalGames : 0,
    averageSurvivalTime: stats.totalGames > 0 ? stats.totalSurvivalTime / stats.totalGames : 0,
  })).sort((a, b) => b.totalGames - a.totalGames); // Sort by frequency
}
