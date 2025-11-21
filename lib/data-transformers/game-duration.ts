import type { GameDurationData, TransformerOptions } from "./types";
import { applyCommonFilters } from "./utils";

export function buildGameDurationData(
  options: TransformerOptions
): GameDurationData {
  const games = applyCommonFilters(options);
  const durations = games
    .map((game) => game.match.duration_seconds ?? 0)
    .filter((duration) => Number.isFinite(duration) && duration > 0);

  // Group durations into 3-minute bins. Using minute buckets is too granular —
  // identical minute counts are rare, so we aggregate by 3-minute intervals
  // (0-2 => 0, 3-5 => 3, ...). Keys represent the starting minute of the bin.
  const BIN_MINUTES = 3;
  const distributionMap = new Map<number, number>();
  durations.forEach((d) => {
    const minute = Math.floor(d / 60);
    const binStart = Math.floor(minute / BIN_MINUTES) * BIN_MINUTES;
    distributionMap.set(binStart, (distributionMap.get(binStart) ?? 0) + 1);
  });

  const maxMinute = Math.max(...Array.from(distributionMap.keys()), 0);
  const distribution: { minute: number; count: number }[] = [];
  for (let i = 0; i <= maxMinute; i += BIN_MINUTES) {
    distribution.push({ minute: i, count: distributionMap.get(i) ?? 0 });
  }

  // Apply a small moving average to smooth the distribution for better
  // visualization. A BIN_MINUTES-length window is a reasonable default
  // smoothing factor here; use a central moving average with edge-padding.
  const smoothWindow = 3; // in number of bins
  const half = Math.floor(smoothWindow / 2);
  const counts = distribution.map((d) => d.count);
  const smoothed = counts.map((_, idx) => {
    const start = Math.max(0, idx - half);
    const end = Math.min(counts.length - 1, idx + half);
    const sub = counts.slice(start, end + 1);
    const average = sub.reduce((a, b) => a + b, 0) / sub.length;
    return average;
  });

  // Replace counts with smoothed values (floats allowed). Keeping minute
  // labels as bin start minute.
  const smoothedDistribution = distribution.map((d, i) => ({
    minute: d.minute,
    count: smoothed[i],
  }));

  return { durations, distribution: smoothedDistribution };
}
