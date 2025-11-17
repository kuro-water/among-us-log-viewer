import { GameData, HeatmapData, Faction } from '@/types/game-data.types';
import { getRoleFaction, getAllFactions } from '@/lib/role-mapping';

interface PlayerFactionStats {
  [playerUuid: string]: {
    playerName: string;
    factionStats: {
      [faction in Faction]?: {
        wins: number;
        games: number;
      };
    };
  };
}

/**
 * Generate player × faction heatmap data
 * X-axis: Player names
 * Y-axis: Factions (Crewmate, Impostor, Madmate, Neutral, Other)
 * Cell: Win rate % and play count
 */
export function generatePlayerFactionHeatmap(games: GameData[]): HeatmapData {
  const playerStats: PlayerFactionStats = {};

  // Collect stats for each player and faction
  games.forEach(game => {
    Object.values(game.players.data).forEach(player => {
      const uuid = player.identity.player_uuid;
      const name = player.identity.player_name;
      const faction = getRoleFaction(player.role.main_role);

      if (!playerStats[uuid]) {
        playerStats[uuid] = {
          playerName: name,
          factionStats: {},
        };
      }

      if (!playerStats[uuid].factionStats[faction]) {
        playerStats[uuid].factionStats[faction] = { wins: 0, games: 0 };
      }

      const stats = playerStats[uuid].factionStats[faction]!;
      stats.games++;
      if (player.lifecycle.is_winner) {
        stats.wins++;
      }
    });
  });

  // Convert to heatmap format
  const playerUuids = Object.keys(playerStats).sort((a, b) =>
    playerStats[a].playerName.localeCompare(playerStats[b].playerName)
  );
  const xAxis = playerUuids.map(uuid => playerStats[uuid].playerName);
  const yAxis = getAllFactions();

  const data = [];
  for (let y = 0; y < yAxis.length; y++) {
    const faction = yAxis[y];
    for (let x = 0; x < playerUuids.length; x++) {
      const uuid = playerUuids[x];
      const factionStat = playerStats[uuid].factionStats[faction];

      if (factionStat && factionStat.games > 0) {
        const winRate = (factionStat.wins / factionStat.games) * 100;
        data.push({
          x,
          y,
          value: Math.round(winRate),
          playCount: factionStat.games,
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
