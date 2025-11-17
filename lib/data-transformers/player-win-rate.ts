import type {
  PlayerWinRateData,
  PlayerWinRateRow,
  TransformerOptions,
} from "./types";
import { applyCommonFilters, buildPlayerAggregates } from "./utils";

export function buildPlayerWinRateData(
  options: TransformerOptions
): PlayerWinRateData {
  const games = applyCommonFilters(options);
  const aggregates = buildPlayerAggregates(games, options.selectedPlayerIds);

  const rows: PlayerWinRateRow[] = Array.from(aggregates.values()).map(
    (aggregate) => {
      const totalGames = aggregate.appearances;
      const winRate = totalGames > 0 ? aggregate.wins / totalGames : 0;
      return {
        uuid: aggregate.uuid,
        name: aggregate.name,
        wins: aggregate.wins,
        losses: aggregate.losses,
        games: totalGames,
        winRate,
        factions: Object.entries(aggregate.factions).map(
          ([faction, stats]) => ({
            faction: faction as PlayerWinRateRow["factions"][number]["faction"],
            wins: stats.wins,
            games: stats.games,
          })
        ),
      };
    }
  );

  rows.sort((a, b) => b.winRate - a.winRate);

  return { rows };
}
