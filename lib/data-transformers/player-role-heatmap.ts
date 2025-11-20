import type { HeatmapData, TransformerOptions } from "./types";
import { applyCommonFilters, buildPlayerAggregates } from "./utils";

export function buildPlayerRoleHeatmap(
  options: TransformerOptions
): HeatmapData {
  const games = applyCommonFilters(options);
  const aggregates = buildPlayerAggregates(games, options.selectedPlayerIds);
  const players = Array.from(aggregates.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "ja")
  );

  const roleTotals = new Map<string, number>();
  players.forEach((player) => {
    Object.entries(player.roles).forEach(([role, stats]) => {
      roleTotals.set(role, (roleTotals.get(role) ?? 0) + stats.games);
    });
  });

  // Include all roles but exclude those that have never been played (total games === 0)
  const roleAxis = Array.from(roleTotals.entries())
    .filter(([, total]) => total > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([role]) => role);

  const cells = players.flatMap((player, playerIndex) =>
    roleAxis.map((role, roleIndex) => {
      const stats = player.roles[role] ?? { wins: 0, games: 0 };
      const playCount = stats.games;
      const value =
        playCount > 0
          ? Number(((stats.wins / playCount) * 100).toFixed(1))
          : null;
      return {
        x: playerIndex,
        y: roleIndex,
        value,
        playCount,
        wins: stats.wins,
        meta: {
          playerUuid: player.uuid,
          label: player.name,
          target: role,
        },
      };
    })
  );

  return {
    xAxis: players.map((player) => player.name),
    yAxis: roleAxis,
    cells,
  };
}
