import type { GameData, HeatmapData, Faction } from '@/types/game-data.types';
import { getRoleFaction, getAllFactions } from '@/lib/role-mapping';

interface PlayerFactionStats {
  [playerUuid: string]: {
    playerName: string;
    factionStats: Record<Faction, { wins: number; total: number }>;
  };
}

/**
 * Calculate player × faction heatmap data
 * X-axis: Player names
 * Y-axis: Factions (Crewmate, Impostor, Madmate, Neutral, Other)
 * Cell values: Win rate percentage and play count
 */
export function calculatePlayerFactionHeatmap(games: GameData[]): HeatmapData {
  const playerStats: PlayerFactionStats = {};
  const allFactions = getAllFactions();

  // Collect stats for each player and faction
  games.forEach((game) => {
    Object.values(game.players.data).forEach((player) => {
      const uuid = player.identity.player_uuid;
      const name = player.identity.player_name;
      const faction = getRoleFaction(player.role.main_role);
      const isWinner = player.lifecycle.is_winner;

      if (!playerStats[uuid]) {
        playerStats[uuid] = {
          playerName: name,
          factionStats: {
            Crewmate: { wins: 0, total: 0 },
            Impostor: { wins: 0, total: 0 },
            Madmate: { wins: 0, total: 0 },
            Neutral: { wins: 0, total: 0 },
            Other: { wins: 0, total: 0 },
          },
        };
      }

      playerStats[uuid].factionStats[faction].total++;
      if (isWinner) {
        playerStats[uuid].factionStats[faction].wins++;
      }
    });
  });

  // Convert to heatmap format
  const playerUuids = Object.keys(playerStats).sort((a, b) =>
    playerStats[a].playerName.localeCompare(playerStats[b].playerName)
  );
  
  const xAxis = playerUuids.map((uuid) => playerStats[uuid].playerName);
  const yAxis = allFactions;
  const data: HeatmapData['data'] = [];

  playerUuids.forEach((uuid, xIndex) => {
    allFactions.forEach((faction, yIndex) => {
      const stats = playerStats[uuid].factionStats[faction];
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
