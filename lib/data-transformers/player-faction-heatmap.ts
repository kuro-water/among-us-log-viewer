import type { HeatmapData, TransformerOptions } from "./types";
import { applyCommonFilters, buildPlayerAggregates } from "./utils";
import type { Faction } from "../role-mapping";

const FACTIONS: Faction[] = ["Crewmate", "Impostor", "Madmate", "Neutral", "Other"];

export function buildPlayerFactionHeatmap(options: TransformerOptions): HeatmapData {
  const games = applyCommonFilters(options);
  const aggregates = buildPlayerAggregates(games, options.selectedPlayerIds);
  const players = Array.from(aggregates.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "ja")
  );

  const cells = players.flatMap((player, playerIndex) =>
    FACTIONS.map((faction, factionIndex) => {
      const stats = player.factions[faction] ?? { wins: 0, games: 0 };
      const playCount = stats.games;
      const value = playCount > 0 ? Number(((stats.wins / playCount) * 100).toFixed(1)) : null;
      return {
        x: playerIndex,
        y: factionIndex,
        value,
        playCount,
        wins: stats.wins,
        meta: {
          playerUuid: player.uuid,
          label: player.name,
          target: faction,
        },
      };
    })
  );

  return {
    xAxis: players.map((player) => player.name),
    yAxis: FACTIONS,
    cells,
  };
}
