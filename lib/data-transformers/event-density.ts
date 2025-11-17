import { GameData, EventDensityData } from '@/types/game-data.types';

/**
 * Calculate event density (events per time bucket) for a single game
 * @param game Game data
 * @param bucketSize Time bucket size in seconds (default: 60)
 */
export function calculateEventDensity(game: GameData, bucketSize: number = 60): EventDensityData[] {
  const maxTime = game.match.duration_seconds;
  const numBuckets = Math.ceil(maxTime / bucketSize);

  // Initialize buckets
  const buckets = Array.from({ length: numBuckets }, (_, i) => ({
    time_bucket: i * bucketSize,
    event_count: 0,
  }));

  // Count events in each bucket
  game.events.timeline.forEach(event => {
    const bucketIndex = Math.floor(event.elapsed_time / bucketSize);
    if (bucketIndex >= 0 && bucketIndex < numBuckets) {
      buckets[bucketIndex].event_count++;
    }
  });

  return buckets;
}
