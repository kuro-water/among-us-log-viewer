import { GameData, HeatmapData } from '@/types/game-data.types';

interface PlayerRoleStats {
  [playerUuid: string]: {
    playerName: string;
    roleStats: {
      [role: string]: {
        wins: number;
        games: number;
      };
    };
  };
}

/**
 * Generate player × role heatmap data
 * X-axis: Player names
 * Y-axis: Top 10-15 most played roles
 * Cell: Win rate % and play count
 */
export function generatePlayerRoleHeatmap(games: GameData[], topN: number = 15): HeatmapData {
  const playerStats: PlayerRoleStats = {};
  const roleFrequency: { [role: string]: number } = {};

  // Collect stats for each player and role
  games.forEach(game => {
    Object.values(game.players.data).forEach(player => {
      const uuid = player.identity.player_uuid;
      const name = player.identity.player_name;
      const role = player.role.main_role;

      if (!playerStats[uuid]) {
        playerStats[uuid] = {
          playerName: name,
          roleStats: {},
        };
      }

      if (!playerStats[uuid].roleStats[role]) {
        playerStats[uuid].roleStats[role] = { wins: 0, games: 0 };
      }

      const stats = playerStats[uuid].roleStats[role];
      stats.games++;
      if (player.lifecycle.is_winner) {
        stats.wins++;
      }

      // Track role frequency
      roleFrequency[role] = (roleFrequency[role] || 0) + 1;
    });
  });

  // Get top N most played roles
  const topRoles = Object.entries(roleFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([role]) => role);

  // Convert to heatmap format
  const playerUuids = Object.keys(playerStats).sort((a, b) =>
    playerStats[a].playerName.localeCompare(playerStats[b].playerName)
  );
  const xAxis = playerUuids.map(uuid => playerStats[uuid].playerName);
  const yAxis = topRoles;

  const data = [];
  for (let y = 0; y < yAxis.length; y++) {
    const role = yAxis[y];
    for (let x = 0; x < playerUuids.length; x++) {
      const uuid = playerUuids[x];
      const roleStat = playerStats[uuid].roleStats[role];

      if (roleStat && roleStat.games > 0) {
        const winRate = (roleStat.wins / roleStat.games) * 100;
        data.push({
          x,
          y,
          value: Math.round(winRate),
          playCount: roleStat.games,
        });
      } else {
        data.push({
          x,
          y,
          value: null,
          playCount: 0,
        });
      }
    }
  }

  return { xAxis, yAxis, data };
}
