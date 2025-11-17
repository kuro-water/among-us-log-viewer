import { GameData, FactionWinData, Faction } from '@/types/game-data.types';
import { getRoleFaction, getAllFactions } from '@/lib/role-mapping';

/**
 * Calculate faction win rates across all games
 */
export function calculateFactionWinRate(games: GameData[]): FactionWinData[] {
  const factionStats = new Map<Faction, { wins: number; losses: number }>();

  // Initialize all factions
  getAllFactions().forEach(faction => {
    factionStats.set(faction, { wins: 0, losses: 0 });
  });

  // Process each game
  games.forEach(game => {
    const winnerTeam = game.match.winner_team;

    // Process each player
    Object.values(game.players.data).forEach(player => {
      const faction = getRoleFaction(player.role.main_role);
      const stats = factionStats.get(faction)!;

      // Determine if this faction won based on winner_team and player's is_winner
      if (player.lifecycle.is_winner) {
        stats.wins++;
      } else {
        stats.losses++;
      }
    });
  });

  // Convert to array format
  return Array.from(factionStats.entries()).map(([faction, stats]) => ({
    faction,
    wins: stats.wins,
    losses: stats.losses,
    games: stats.wins + stats.losses,
  }));
}
