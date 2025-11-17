import type { GameData } from '@/types/game-data.types';

export interface EventDensityData {
  timeRange: string; // e.g., "0-60s", "60-120s"
  eventCount: number;
  eventsPerMinute: number;
}

/**
 * Calculate event density over time for a single game
 */
export function calculateEventDensity(game: GameData, intervalSeconds: number = 60): EventDensityData[] {
  const duration = game.match.duration_seconds;
  const numIntervals = Math.ceil(duration / intervalSeconds);
  const densityMap: Record<number, number> = {};

  // Initialize intervals
  for (let i = 0; i < numIntervals; i++) {
    densityMap[i] = 0;
  }

  // Count events in each interval
  game.events.timeline.forEach((event) => {
    const intervalIndex = Math.floor(event.elapsed_time / intervalSeconds);
    if (intervalIndex < numIntervals) {
      densityMap[intervalIndex]++;
    }
  });

  // Convert to array format
  return Object.entries(densityMap).map(([index, count]) => {
    const startTime = parseInt(index) * intervalSeconds;
    const endTime = Math.min(startTime + intervalSeconds, duration);
    const actualInterval = (endTime - startTime) / 60; // Convert to minutes
    
    return {
      timeRange: `${Math.round(startTime / 60)}-${Math.round(endTime / 60)}m`,
      eventCount: count,
      eventsPerMinute: actualInterval > 0 ? count / actualInterval : 0,
    };
  });
}
