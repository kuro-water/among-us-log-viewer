import type { GameData } from '@/types/game-data.types';

/**
 * Calculate game duration distribution for histogram
 */
export interface GameDurationData {
  duration: number;
  count: number;
}

export function calculateGameDuration(games: GameData[]): GameDurationData[] {
  // Collect all durations
  const durations = games.map((game) => Math.round(game.match.duration_seconds / 60)); // Convert to minutes

  // Create histogram bins (0-5 min, 5-10 min, etc.)
  const bins: Record<number, number> = {};
  const binSize = 5; // 5-minute bins

  durations.forEach((duration) => {
    const bin = Math.floor(duration / binSize) * binSize;
    bins[bin] = (bins[bin] || 0) + 1;
  });

  // Convert to array and sort
  return Object.entries(bins)
    .map(([duration, count]) => ({
      duration: parseInt(duration),
      count,
    }))
    .sort((a, b) => a.duration - b.duration);
}
