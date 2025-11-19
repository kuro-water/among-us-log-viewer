"use client";

import { useGameAnalytics } from "@/hooks/useGameAnalytics";
import { formatMinutes, formatNumber, formatRatio } from "@/lib/formatters";
import type { ChangeEvent } from "react";
import { Header } from "@/components/dashboard/Header";
import { FilterSection } from "@/components/dashboard/FilterSection";
import { KpiSection } from "@/components/dashboard/KpiSection";
import { ChartGrid } from "@/components/dashboard/ChartGrid";

export default function DashboardPage() {
  const {
    loading,
    error,
    parserErrors,
    gameOptions,
    playerOptions,
    filters,
    analytics,
    refresh,
    hasData,
    games,
  } = useGameAnalytics();

  const totalGames = analytics.factionWinRate.totalGames;
  const averageDurationMinutes = analytics.gameDuration.durations.length
    ? analytics.gameDuration.durations.reduce(
        (sum, duration) => sum + duration,
        0
      ) /
      analytics.gameDuration.durations.length /
      60
    : 0;
  const topPlayer = analytics.playerWinRate.rows[0];
  const kpiCards = [
    {
      label: "総試合数",
      value: formatNumber(totalGames),
      helper:
        filters.selectedGameIds.length > 0 ? "フィルタ適用中" : "全データ対象",
    },
    {
      label: "平均試合時間",
      value: formatMinutes(averageDurationMinutes),
      helper: "JSONLの平均値",
    },
    {
      label: "ユニークプレイヤー",
      value: formatNumber(playerOptions.length),
      helper: `${filters.selectedPlayerIds.length || 0} 名選択中`,
    },
    {
      label: "最高勝率",
      value: topPlayer ? formatRatio(topPlayer.winRate) : "0%",
      helper: topPlayer ? topPlayer.name : "データ不足",
    },
  ];

  const handleGameChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    filters.setSelectedGameIds(values);
  };

  const handlePlayerChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    filters.setSelectedPlayerIds(values);
  };

  return (
    <main className="min-h-screen bg-background pb-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-10 lg:px-8">
        <Header
          loading={loading}
          refresh={refresh}
          resetFilters={filters.resetFilters}
        />

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-900">
            <p className="font-semibold">データ取得に失敗しました</p>
            <p className="mt-1">{error.message}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-3 rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-rose-700 hover:bg-white"
            >
              もう一度試す
            </button>
          </div>
        ) : null}

        {parserErrors.length > 0 ? (
          <details className="rounded-3xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
            <summary className="cursor-pointer font-semibold">
              JSONL 解析時に {parserErrors.length} 件の警告が発生しました
            </summary>
            <ul className="mt-3 space-y-1">
              {parserErrors.slice(0, 3).map((item, index) => (
                <li key={`${item.lineNumber}-${index}`}>
                  行 {item.lineNumber}: {item.error.message}
                </li>
              ))}
            </ul>
            {parserErrors.length > 3 ? (
              <p className="mt-2 text-xs">
                他 {parserErrors.length - 3} 件の警告があります。
              </p>
            ) : null}
          </details>
        ) : null}

        <KpiSection kpiCards={kpiCards} />

        <FilterSection
          selectedGameIds={filters.selectedGameIds}
          selectedPlayerIds={filters.selectedPlayerIds}
          gameOptions={gameOptions}
          playerOptions={playerOptions}
          onGameChange={handleGameChange}
          onPlayerChange={handlePlayerChange}
        />

        {!hasData && !loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 text-center text-slate-500">
            まだ JSONL
            データが読み込まれていません。`public/game_history_sample.jsonl`
            を配置してください。
          </div>
        ) : null}

        <ChartGrid
          analytics={analytics}
          games={games}
          selectedGameIds={filters.selectedGameIds}
          selectedPlayerIds={filters.selectedPlayerIds}
        />
      </div>
    </main>
  );
}
