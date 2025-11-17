import type { RolePerformanceData, TransformerOptions } from "./types";
import { applyCommonFilters, getPlayerKey } from "./utils";
import { getRoleFaction } from "../role-mapping";
import type { GameLog } from "../../types/game-data.types";

interface RoleStats {
  role: string;
  games: number;
  wins: number;
  totalTasks: number;
  totalTimeAlive: number;
}

function updateRoleStats(map: Map<string, RoleStats>, game: GameLog, playerFilter?: Set<string>) {
  Object.values(game.players.data).forEach((record) => {
    const playerKey = getPlayerKey(record);
    if (playerFilter && playerFilter.size > 0 && !playerFilter.has(playerKey)) {
      return;
    }

    const roleName = record.role.main_role || "Unknown";
    const stats = map.get(roleName) ?? {
      role: roleName,
      games: 0,
      wins: 0,
      totalTasks: 0,
      totalTimeAlive: 0,
    };

    stats.games += 1;
    if (record.lifecycle.is_winner) {
      stats.wins += 1;
    }
    stats.totalTasks += record.progression.tasks_completed ?? 0;
    stats.totalTimeAlive += record.lifecycle.time_alive_seconds ?? 0;

    map.set(roleName, stats);
  });
}

export function buildRolePerformanceData(options: TransformerOptions): RolePerformanceData {
  const games = applyCommonFilters(options);
  const roleStats = new Map<string, RoleStats>();
  games.forEach((game) => updateRoleStats(roleStats, game, options.selectedPlayerIds));

  const rows = Array.from(roleStats.values())
    .filter((stats) => stats.games > 0)
    .map((stats) => {
      const faction = getRoleFaction(stats.role);
      return {
        role: stats.role,
        faction,
        games: stats.games,
        winRate: stats.games > 0 ? stats.wins / stats.games : 0,
        avgTasks: stats.games > 0 ? stats.totalTasks / stats.games : 0,
        avgTimeAlive: stats.games > 0 ? stats.totalTimeAlive / stats.games : 0,
      };
    })
    .sort((a, b) => b.games - a.games)
    .slice(0, 15);

  return { rows };
}
