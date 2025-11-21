import type { PlayerAllStatsData, TransformerOptions } from "./types";
import { applyCommonFilters, buildPlayerAggregates } from "./utils";

export function buildPlayerAllStatsData(
  options: TransformerOptions
): PlayerAllStatsData {
  const games = applyCommonFilters(options);
  const aggregates = buildPlayerAggregates(games, options.selectedPlayerIds);

  const rows = Array.from(aggregates.values()).map((agg) => ({
    uuid: agg.uuid,
    name: agg.name,
    appearances: agg.appearances,
    wins: agg.wins,
    losses: agg.losses,
    deaths: agg.deaths,
    kills: agg.kills,
    tasksCompleted: agg.tasksCompleted,
    movementDistance: agg.movementDistance,
    emergencyButtons: agg.emergencyButtons,
    sabotagesTriggered: agg.sabotagesTriggered,
    timeAlive: agg.timeAlive,
    factions: Object.entries(agg.factions).map(([f, s]) => ({
      faction: f,
      games: s.games,
      wins: s.wins,
    })),
    roles: Object.entries(agg.roles).map(([r, s]) => ({
      role: r,
      games: s.games,
      wins: s.wins,
    })),
  }));

  // default sort by appearances descending
  rows.sort((a, b) => b.appearances - a.appearances);

  return { rows };
}

export default buildPlayerAllStatsData;
