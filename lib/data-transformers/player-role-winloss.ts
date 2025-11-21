import type { TransformerOptions } from "./types";
import { applyCommonFilters, buildPlayerAggregates } from "./utils";
import { getRoleDisplayName } from "../role-localization";

export interface MatrixBubblePoint {
  x: number; // Player Index
  y: number; // Role Index
  z: number; // Play Count (Size)
  winRate: number; // Win Rate (Color)
  wins: number;
  losses: number;
  playerName: string;
  roleName: string;
}

export interface PlayerRoleWinLossChartData {
  categories: string[]; // X-Axis: Player Names
  yCategories: string[]; // Y-Axis: Role Names
  series: {
    name: string;
    data: MatrixBubblePoint[];
  }[];
}

export function buildPlayerRoleWinLossChartData(
  options: TransformerOptions
): PlayerRoleWinLossChartData {
  const games = applyCommonFilters(options);
  const aggregates = buildPlayerAggregates(games, options.selectedPlayerIds);
  const players = Array.from(aggregates.values());

  // 1. 全役職のリストを作成し、プレイ総数順にソート（Y軸用）
  const roleTotalGames = new Map<string, number>();
  players.forEach((player) => {
    Object.entries(player.roles).forEach(([role, stats]) => {
      roleTotalGames.set(role, (roleTotalGames.get(role) || 0) + stats.games);
    });
  });

  const sortedRoles = Array.from(roleTotalGames.entries())
    // Exclude roles with zero total games
    .filter(([, total]) => total > 0)
    .sort((a, b) => b[1] - a[1]) // 降順
    .map(([role]) => role);

  // 2. データポイントの作成
  const data: MatrixBubblePoint[] = [];

  players.forEach((player, playerIdx) => {
    sortedRoles.forEach((role, roleIdx) => {
      const stats = player.roles[role];
      if (!stats || stats.games === 0) return;

      const winRate = (stats.wins / stats.games) * 100;

      data.push({
        x: playerIdx,
        y: roleIdx,
        z: stats.games,
        winRate: Math.round(winRate * 10) / 10,
        wins: stats.wins,
        losses: stats.games - stats.wins,
        playerName: player.name,
        roleName: getRoleDisplayName(role),
      });
    });
  });

  return {
    categories: players.map((p) => p.name),
    yCategories: sortedRoles.map((r) => getRoleDisplayName(r)),
    series: [
      {
        name: "Player Role Stats",
        data,
      },
    ],
  };
}
