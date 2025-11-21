import type { HeatmapData, TransformerOptions } from "./types";
import { applyCommonFilters, buildPlayerAggregates } from "./utils";
import type { Faction } from "../role-mapping";
import { FACTION_CONFIG } from "@/config/factions";
import { hexToRgba } from "@/lib/heatmap-colors";

const FACTIONS = Object.keys(FACTION_CONFIG) as Faction[];

export function buildPlayerFactionHeatmap(
  options: TransformerOptions
): HeatmapData {
  const games = applyCommonFilters(options);
  const aggregates = buildPlayerAggregates(games, options.selectedPlayerIds);
  const players = Array.from(aggregates.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "ja")
  );

  const cells = players.flatMap((player, playerIndex) =>
    FACTIONS.map((faction, factionIndex) => {
      const stats = player.factions[faction] ?? { wins: 0, games: 0 };
      const playCount = stats.games;
      const value =
        playCount > 0
          ? Number(((stats.wins / playCount) * 100).toFixed(1))
          : null;

      const color =
        value !== null
          ? hexToRgba(
              FACTION_CONFIG[faction].color,
              0.15 + 0.85 * (value / 100)
            )
          : "#f8fafc";

      return {
        x: playerIndex,
        y: factionIndex,
        value,
        color,
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
