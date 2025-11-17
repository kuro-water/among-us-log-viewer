import { GameData, GameDurationData } from '@/types/game-data.types';

/**
 * Extract game duration for histogram
 */
export function extractGameDurations(games: GameData[]): GameDurationData[] {
  return games.map(game => ({
    duration_seconds: game.match.duration_seconds,
    game_id: game.schema.game_id,
  }));
}
