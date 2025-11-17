import type { GameData, HeatmapData } from '@/types/game-data.types';

interface PlayerRoleStats {
  [playerUuid: string]: {
    playerName: string;
    roleStats: Record<string, { wins: number; total: number }>;
  };
}

/**
 * Calculate player × role heatmap data
 * X-axis: Player names
 * Y-axis: Top 10-15 most played roles
 * Cell values: Win rate percentage and play count
 */
export function calculatePlayerRoleHeatmap(games: GameData[], topN: number = 15): HeatmapData {
  const playerStats: PlayerRoleStats = {};
  const roleCounts: Record<string, number> = {};

  // Collect stats for each player and role
  games.forEach((game) => {
    Object.values(game.players.data).forEach((player) => {
      const uuid = player.identity.player_uuid;
      const name = player.identity.player_name;
      const role = player.role.main_role;
      const isWinner = player.lifecycle.is_winner;

      // Track role frequency across all games
      roleCounts[role] = (roleCounts[role] || 0) + 1;

      if (!playerStats[uuid]) {
        playerStats[uuid] = {
          playerName: name,
          roleStats: {},
        };
      }

      if (!playerStats[uuid].roleStats[role]) {
        playerStats[uuid].roleStats[role] = { wins: 0, total: 0 };
      }

      playerStats[uuid].roleStats[role].total++;
      if (isWinner) {
        playerStats[uuid].roleStats[role].wins++;
      }
    });
  });

  // Get top N most played roles
  const topRoles = Object.entries(roleCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([role]) => role);

  // Convert to heatmap format
  const playerUuids = Object.keys(playerStats).sort((a, b) =>
    playerStats[a].playerName.localeCompare(playerStats[b].playerName)
  );
  
  const xAxis = playerUuids.map((uuid) => playerStats[uuid].playerName);
  const yAxis = topRoles;
  const data: HeatmapData['data'] = [];

  playerUuids.forEach((uuid, xIndex) => {
    topRoles.forEach((role, yIndex) => {
      const stats = playerStats[uuid].roleStats[role] || { wins: 0, total: 0 };
      const playCount = stats.total;
      const value = playCount > 0 ? (stats.wins / stats.total) * 100 : null;

      data.push({
        x: xIndex,
        y: yIndex,
        value,
        playCount,
      });
    });
  });

  return {
    xAxis,
    yAxis,
    data,
  };
}
