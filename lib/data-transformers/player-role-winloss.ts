import type { TransformerOptions, PlayerId } from "./types";
import { applyCommonFilters, buildPlayerAggregates } from "./utils";
import { getFactionColorByRole } from "../role-mapping";
import { getRoleDisplayName } from "../role-localization";

export interface PlayerRoleWinLossSeries {
  name: string; // 役職名
  data: number[]; // 各プレイヤーごとの勝利率（正）または敗北率（負）。パーセンテージで -100～100の値
  color: string;
  isWin: boolean;
}

export interface PlayerRoleWinLossChartData {
  categories: string[]; // プレイヤー名
  series: PlayerRoleWinLossSeries[];
}

export function buildPlayerRoleWinLossChartData(
  options: TransformerOptions
): PlayerRoleWinLossChartData {
  const games = applyCommonFilters(options);
  const aggregates = buildPlayerAggregates(games, options.selectedPlayerIds);
  const players = Array.from(aggregates.values());

  // プレイヤーごとの合計ゲーム数を計算（正規化用）
  const playerTotalGames = players.map((player) => {
    const total = Object.values(player.roles).reduce(
      (sum, stats) => sum + stats.games,
      0
    );
    return total || 1; // ゼロ除算対策
  });

  // 役職ごとに勝利率・敗北率を集計（パーセンテージ）
  const roleWinMap = new Map<string, number[]>(); // role -> [player0%, player1%, ...]
  const roleLossMap = new Map<string, number[]>();
  const roleColorMap = new Map<string, string>();

  players.forEach((player, playerIdx) => {
    const totalGames = playerTotalGames[playerIdx];
    Object.entries(player.roles).forEach(([role, stats]) => {
      // 勝利率（この役職での勝利がプレイヤーの全試合に占める割合）
      const winRate = (stats.wins / totalGames) * 100;
      if (!roleWinMap.has(role))
        roleWinMap.set(role, Array(players.length).fill(0));
      roleWinMap.get(role)![playerIdx] = Math.round(winRate * 10) / 10; // 小数第1位

      // 敗北率（この役職での敗北がプレイヤーの全試合に占める割合）
      const losses = stats.games - stats.wins;
      const lossRate = (losses / totalGames) * 100;
      if (!roleLossMap.has(role))
        roleLossMap.set(role, Array(players.length).fill(0));
      roleLossMap.get(role)![playerIdx] = -Math.round(lossRate * 10) / 10; // 小数第1位、負値
    });
  });

  // 役職色（factionベース）
  for (const role of roleWinMap.keys()) {
    try {
      roleColorMap.set(role, getFactionColorByRole(role));
    } catch {
      roleColorMap.set(role, "#888");
    }
  }

  // series: 勝利役職（正値%）+ 敗北役職（負値%）
  const winSeries: PlayerRoleWinLossSeries[] = Array.from(
    roleWinMap.entries()
  ).map(([role, data]) => ({
    name: `${getRoleDisplayName(role)} (勝利)`,
    data,
    color: roleColorMap.get(role) ?? "#16a34a",
    isWin: true,
  }));
  const lossSeries: PlayerRoleWinLossSeries[] = Array.from(
    roleLossMap.entries()
  ).map(([role, data]) => ({
    name: `${getRoleDisplayName(role)} (敗北)`,
    data,
    color: roleColorMap.get(role) ?? "#ef4444",
    isWin: false,
  }));

  // 並び順: 勝利役職→敗北役職
  const series = [...winSeries, ...lossSeries];

  return {
    categories: players.map((p) => p.name),
    series,
  };
}
