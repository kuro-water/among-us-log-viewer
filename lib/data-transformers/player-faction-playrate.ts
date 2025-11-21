import type { TransformerOptions, PlayerId } from "./types";
import { applyCommonFilters, buildPlayerAggregates } from "./utils";
import { getRoleFaction, getFactionColor } from "../role-mapping";

export interface FactionPlayDatum {
  faction: string;
  percent: number; // 0-100
  color: string;
}

export interface FactionPlayRow {
  playerUuid: PlayerId;
  playerName: string;
  totalGames: number;
  data: FactionPlayDatum[];
}

export interface PlayerFactionPlayRateData {
  rows: FactionPlayRow[];
}

export function buildPlayerFactionPlayRateData(
  options: TransformerOptions
): PlayerFactionPlayRateData {
  const games = applyCommonFilters(options);
  const aggregates = buildPlayerAggregates(games, options.selectedPlayerIds);
  const players = Array.from(aggregates.values());

  const rows: FactionPlayRow[] = players.map((player) => {
    const total =
      player.appearances ||
      Object.values(player.roles).reduce((s, r) => s + r.games, 0) ||
      1;

    const factionCounts = new Map<string, number>();

    for (const [role, stats] of Object.entries(player.roles)) {
      const faction = getRoleFaction(role);
      factionCounts.set(
        faction,
        (factionCounts.get(faction) || 0) + stats.games
      );
    }

    const factionEntries = Array.from(factionCounts.entries()).map(
      ([faction, count]) => {
        const percent = (count / total) * 100;
        return {
          faction,
          percent: Math.round(percent * 10) / 10,
          color: getFactionColor(faction as any),
        };
      }
    );

    factionEntries.sort((a, b) => b.percent - a.percent);

    return {
      playerUuid: player.uuid,
      playerName: player.name,
      totalGames: total,
      data: factionEntries,
    };
  });

  return { rows };
}
