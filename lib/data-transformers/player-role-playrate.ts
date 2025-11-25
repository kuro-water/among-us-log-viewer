import type { TransformerOptions, PlayerId } from "./types";
import { applyCommonFilters, buildPlayerAggregates } from "./utils";
import { getFactionColorByRole } from "../role-mapping";

export interface RolePlayDatum {
  role: string;
  percent: number; // 0-100
  count: number; // actual play count
  color: string;
}

export interface RolePlayRow {
  playerUuid: PlayerId;
  playerName: string;
  totalGames: number;
  data: RolePlayDatum[];
}

export interface PlayerRolePlayRateData {
  rows: RolePlayRow[];
}

export function buildPlayerRolePlayRateData(
  options: TransformerOptions
): PlayerRolePlayRateData {
  const games = applyCommonFilters(options);
  const aggregates = buildPlayerAggregates(games, options.selectedPlayerIds);
  const players = Array.from(aggregates.values());

  const rows: RolePlayRow[] = players.map((player) => {
    const total =
      player.appearances ||
      Object.values(player.roles).reduce((s, r) => s + r.games, 0) ||
      1;

    const roleEntries = Object.entries(player.roles).map(([role, stats]) => {
      const percent = (stats.games / total) * 100;
      let color = "#888";
      try {
        color = getFactionColorByRole(role);
      } catch {
        color = "#888";
      }
      return {
        role,
        percent: Math.round(percent * 10) / 10,
        count: stats.games,
        color,
      };
    });

    // Sort descending by percent so chart shows largest slices first
    roleEntries.sort((a, b) => b.percent - a.percent);

    return {
      playerUuid: player.uuid,
      playerName: player.name,
      totalGames: total,
      data: roleEntries,
    };
  });

  return { rows };
}
