import { GameData, RolePerformanceData } from '@/types/game-data.types';
import { getRoleFaction } from '@/lib/role-mapping';

interface RoleStats {
  totalTasksCompleted: number;
  totalTimeAlive: number;
  gamesPlayed: number;
}

/**
 * Calculate performance metrics for each role
 */
export function calculateRolePerformance(games: GameData[]): RolePerformanceData[] {
  const roleStats = new Map<string, RoleStats>();

  games.forEach(game => {
    Object.values(game.players.data).forEach(player => {
      const role = player.role.main_role;

      if (!roleStats.has(role)) {
        roleStats.set(role, {
          totalTasksCompleted: 0,
          totalTimeAlive: 0,
          gamesPlayed: 0,
        });
      }

      const stats = roleStats.get(role)!;
      stats.totalTasksCompleted += player.progression.tasks_completed;
      stats.totalTimeAlive += player.lifecycle.time_alive_seconds;
      stats.gamesPlayed++;
    });
  });

  return Array.from(roleStats.entries()).map(([role, stats]) => ({
    role,
    faction: getRoleFaction(role),
    avg_tasks_completed: stats.totalTasksCompleted / stats.gamesPlayed,
    avg_time_alive: stats.totalTimeAlive / stats.gamesPlayed,
    games_played: stats.gamesPlayed,
  }));
}
