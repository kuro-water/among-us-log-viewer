'use client';

import {
  EventDensityChart,
  FactionWinRateChart,
  GameDurationChart,
  MovementWithEventsChart,
  PlayerFactionHeatmap,
  PlayerRadarChart,
  PlayerRoleHeatmap,
  PlayerWinRateChart,
  RolePerformanceChart,
  TaskTimelineChart,
} from '@/components/charts';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { useGameAnalytics } from '@/hooks/useGameAnalytics';
import { formatMinutes, formatNumber, formatRatio } from '@/lib/formatters';
import type { ChangeEvent } from 'react';

function SelectLabel({ label, helper }: { label: string; helper?: string }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span className="font-semibold text-slate-800">{label}</span>
      {helper ? <span>{helper}</span> : null}
    </div>
  );
}

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
  } = useGameAnalytics();

  const gameSelectSize = Math.min(Math.max(gameOptions.length, 3), 8);
  const playerSelectSize = Math.min(Math.max(playerOptions.length, 6), 10);

  const totalGames = analytics.factionWinRate.totalGames;
  const averageDurationMinutes = analytics.gameDuration.durations.length
    ?
      analytics.gameDuration.durations.reduce((sum, duration) => sum + duration, 0) /
        analytics.gameDuration.durations.length /
        60
    : 0;
  const topPlayer = analytics.playerWinRate.rows[0];
  const kpiCards = [
    {
      label: '総試合数',
      value: formatNumber(totalGames),
      helper: filters.selectedGameIds.length > 0 ? 'フィルタ適用中' : '全データ対象',
    },
    {
      label: '平均試合時間',
      value: formatMinutes(averageDurationMinutes),
      helper: 'JSONLの平均値',
    },
    {
      label: 'ユニークプレイヤー',
      value: formatNumber(playerOptions.length),
      helper: `${filters.selectedPlayerIds.length || 0} 名選択中`,
    },
    {
      label: '最高勝率',
      value: topPlayer ? formatRatio(topPlayer.winRate) : '0%',
      helper: topPlayer ? topPlayer.name : 'データ不足',
    },
  ];

  const handleGameChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    filters.setSelectedGameIds(values);
  };

  const handlePlayerChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    filters.setSelectedPlayerIds(values);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] pb-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-10 lg:px-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Among Us Analytics
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">
              Beyond Us ライトテーマダッシュボード
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              JSONL ログをブラウザだけで読み込み、役職別パフォーマンスやヒートマップ、移動タイムラインなど
              10 種類の Highcharts を一括で確認できます。
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {loading ? (
              <span className="rounded-full bg-slate-200 px-4 py-2 font-medium text-slate-600">
                読み込み中...
              </span>
            ) : null}
            <button
              type="button"
              onClick={refresh}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:border-slate-400"
            >
              データ再取得
            </button>
            <button
              type="button"
              onClick={filters.resetFilters}
              className="rounded-full border border-transparent bg-slate-900 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              フィルタをクリア
            </button>
          </div>
        </header>

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
              <p className="mt-2 text-xs">他 {parserErrors.length - 3} 件の警告があります。</p>
            ) : null}
          </details>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => (
            <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} helper={kpi.helper} />
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <SelectLabel label="試合選択" helper={`${filters.selectedGameIds.length || 'すべて'} 件`} />
              <select
                multiple
                value={filters.selectedGameIds}
                onChange={handleGameChange}
                size={gameSelectSize}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner"
              >
                {gameOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">複数選択で試合を絞り込みます（Ctrl / Command + クリック）。</p>
            </div>
            <div>
              <SelectLabel
                label="プレイヤー選択"
                helper={`${filters.selectedPlayerIds.length || 'すべて'} 名`}
              />
              <select
                multiple
                value={filters.selectedPlayerIds}
                onChange={handlePlayerChange}
                size={playerSelectSize}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner"
              >
                {playerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">プレイヤー軸のチャート（ヒートマップ/レーダーなど）に適用されます。</p>
            </div>
          </div>
        </section>

        {!hasData && !loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 text-center text-slate-500">
            まだ JSONL データが読み込まれていません。`public/game_history_sample.jsonl` を配置してください。
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <ChartCard
            title="陣営別勝率"
            description="勝利数・試合数を割合で把握"
            className="lg:col-span-4"
          >
            <FactionWinRateChart data={analytics.factionWinRate} className="h-[320px]" />
          </ChartCard>

          <ChartCard
            title="プレイヤー勝率比較"
            description="陣営別の勝ち/負け内訳"
            className="lg:col-span-8"
          >
            <PlayerWinRateChart data={analytics.playerWinRate} className="h-[360px]" />
          </ChartCard>

          <ChartCard
            title="プレイヤー × 陣営ヒートマップ"
            description="勝率とプレイ回数をセル表示"
            className="lg:col-span-6"
          >
            <PlayerFactionHeatmap data={analytics.playerFactionHeatmap} className="h-[420px]" />
          </ChartCard>

          <ChartCard
            title="プレイヤー × 役職ヒートマップ"
            description="頻出役職トップ 12"
            className="lg:col-span-6"
          >
            <PlayerRoleHeatmap data={analytics.playerRoleHeatmap} className="h-[420px]" />
          </ChartCard>

          <ChartCard
            title="タスク進捗タイムライン"
            description="累計タスク数の推移"
            className="lg:col-span-7"
          >
            <TaskTimelineChart data={analytics.taskTimeline} className="h-[360px]" />
          </ChartCard>

          <ChartCard
            title="イベント密度"
            description="分単位のイベント発生数"
            className="lg:col-span-5"
          >
            <EventDensityChart data={analytics.eventDensity} className="h-[360px]" />
          </ChartCard>

          <ChartCard
            title="移動距離 × イベント"
            description="プレイヤー別の移動量と重要イベント"
            className="lg:col-span-8"
          >
            <MovementWithEventsChart data={analytics.movementWithEvents} className="h-[380px]" />
          </ChartCard>

          <ChartCard
            title="個人レーダー"
            description="勝率/キル/移動など 6 指標"
            className="lg:col-span-4"
          >
            <PlayerRadarChart data={analytics.playerRadar} className="h-[380px]" />
          </ChartCard>

          <ChartCard
            title="役職別パフォーマンス"
            description="平均タスク・平均生存時間"
            className="lg:col-span-6"
          >
            <RolePerformanceChart data={analytics.rolePerformance} className="h-[420px]" />
          </ChartCard>

          <ChartCard
            title="試合時間ヒストグラム"
            description="所要時間の分布"
            className="lg:col-span-6"
          >
            <GameDurationChart data={analytics.gameDuration} className="h-[420px]" />
          </ChartCard>
        </section>
      </div>
    </main>
  );
}
