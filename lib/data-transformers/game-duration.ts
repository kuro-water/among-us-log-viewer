import type { GameDurationData, TransformerOptions } from "./types";
import { applyCommonFilters } from "./utils";

export function buildGameDurationData(
  options: TransformerOptions
): GameDurationData {
  const games = applyCommonFilters(options);
  const durations = games
    .map((game) => game.match.duration_seconds ?? 0)
    .filter((duration) => Number.isFinite(duration) && duration > 0);

  const distributionMap = new Map<number, number>();
  durations.forEach((d) => {
    const minute = Math.floor(d / 60);
    distributionMap.set(minute, (distributionMap.get(minute) ?? 0) + 1);
  });

  const maxMinute = Math.max(...Array.from(distributionMap.keys()), 0);
  const distribution: { minute: number; count: number }[] = [];
  for (let i = 0; i <= maxMinute; i++) {
    distribution.push({ minute: i, count: distributionMap.get(i) ?? 0 });
  }

  return { durations, distribution };
}
