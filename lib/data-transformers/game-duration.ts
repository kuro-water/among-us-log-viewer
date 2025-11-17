import type { GameDurationData, TransformerOptions } from "./types";
import { applyCommonFilters } from "./utils";

export function buildGameDurationData(options: TransformerOptions): GameDurationData {
  const games = applyCommonFilters(options);
  const durations = games
    .map((game) => game.match.duration_seconds ?? 0)
    .filter((duration) => Number.isFinite(duration) && duration > 0);
  return { durations };
}
