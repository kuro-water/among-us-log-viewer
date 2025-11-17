import { GameData, PlayerWinData } from '@/types/game-data.types';

interface PlayerStats {
  [playerUuid: string]: {
    playerName: string;
    wins: number;
    losses: number;
  };
}

/**
 * Calculate win rate for each player across all games
 */
export function calculatePlayerWinRate(games: GameData[]): PlayerWinData[] {
  const playerStats: PlayerStats = {};

  games.forEach(game => {
    Object.values(game.players.data).forEach(player => {
      const uuid = player.identity.player_uuid;
      const name = player.identity.player_name;

      if (!playerStats[uuid]) {
        playerStats[uuid] = {
          playerName: name,
          wins: 0,
          losses: 0,
        };
      }

      if (player.lifecycle.is_winner) {
        playerStats[uuid].wins++;
      } else {
        playerStats[uuid].losses++;
      }
    });
  });

  return Object.entries(playerStats).map(([uuid, stats]) => ({
    player_name: stats.playerName,
    player_uuid: uuid,
    wins: stats.wins,
    losses: stats.losses,
    games: stats.wins + stats.losses,
  }));
}
