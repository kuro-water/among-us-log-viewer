import type { GameData, FactionWinRate, Faction } from '@/types/game-data.types';
import { getRoleFaction } from '@/lib/role-mapping';

/**
 * Calculate faction win rates from multiple games
 * Returns data for a pie chart showing wins by faction
 */
export function calculateFactionWinRate(games: GameData[]): FactionWinRate[] {
  const factionStats: Record<Faction, { wins: number; losses: number }> = {
    Crewmate: { wins: 0, losses: 0 },
    Impostor: { wins: 0, losses: 0 },
    Madmate: { wins: 0, losses: 0 },
    Neutral: { wins: 0, losses: 0 },
    Other: { wins: 0, losses: 0 },
  };

  games.forEach((game) => {
    const winnerTeam = game.match.winner_team;
    
    // Count each player's faction and whether they won
    Object.values(game.players.data).forEach((player) => {
      const faction = getRoleFaction(player.role.main_role);
      const isWinner = player.lifecycle.is_winner;
      
      if (isWinner) {
        factionStats[faction].wins++;
      } else {
        factionStats[faction].losses++;
      }
    });
  });

  // Convert to array format for chart
  return Object.entries(factionStats).map(([faction, stats]) => {
    const total = stats.wins + stats.losses;
    return {
      faction: faction as Faction,
      wins: stats.wins,
      losses: stats.losses,
      total,
      winRate: total > 0 ? (stats.wins / total) * 100 : 0,
    };
  });
}
