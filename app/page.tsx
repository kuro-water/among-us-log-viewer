"use client";

import {
  Accordion,
  AccordionItem,
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import type { Selection } from "@react-types/shared";
import dynamic from "next/dynamic";

const PlayerRoleWinLossChart = dynamic(
  () => import("@/components/charts").then((m) => m.PlayerRoleWinLossChart),
  { ssr: false }
);
const PlayerRolePlayRateChart = dynamic(
  () => import("@/components/charts").then((m) => m.PlayerRolePlayRateChart),
  { ssr: false }
);
const PlayerFactionPlayRateChart = dynamic(
  () => import("@/components/charts").then((m) => m.PlayerFactionPlayRateChart),
  { ssr: false }
);
const FactionWinRateChart = dynamic(
  () => import("@/components/charts").then((m) => m.FactionWinRateChart),
  { ssr: false }
);
const PlayerWinRateTable = dynamic(
  () => import("@/components/charts").then((m) => m.PlayerWinRateTable),
  { ssr: false }
);
const PlayerFactionHeatmap = dynamic(
  () => import("@/components/charts").then((m) => m.PlayerFactionHeatmap),
  { ssr: false }
);
const PlayerRoleHeatmap = dynamic(
  () => import("@/components/charts").then((m) => m.PlayerRoleHeatmap),
  { ssr: false }
);
const TaskTimelineChart = dynamic(
  () => import("@/components/charts").then((m) => m.TaskTimelineChart),
  { ssr: false }
);
const EventDensityChart = dynamic(
  () => import("@/components/charts").then((m) => m.EventDensityChart),
  { ssr: false }
);
const MovementWithEventsChart = dynamic(
  () => import("@/components/charts").then((m) => m.MovementWithEventsChart),
  { ssr: false }
);
const PlayerRadarChart = dynamic(
  () => import("@/components/charts").then((m) => m.PlayerRadarChart),
  { ssr: false }
);
const RolePerformanceChart = dynamic(
  () => import("@/components/charts").then((m) => m.RolePerformanceChart),
  { ssr: false }
);
const GameDurationChart = dynamic(
  () => import("@/components/charts").then((m) => m.GameDurationChart),
  { ssr: false }
);
import { ChartCard } from "@/components/dashboard/ChartCard";
import { useGameAnalytics } from "@/hooks/useGameAnalytics";
import { useMemo } from "react";

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

  const selectedGameKeys = useMemo<Selection>(() => {
    return filters.selectedGameIds.length
      ? (new Set(filters.selectedGameIds) as Selection)
      : (new Set<string>() as Selection);
  }, [filters.selectedGameIds]);

  const selectedPlayerKeys = useMemo<Selection>(() => {
    return filters.selectedPlayerIds.length
      ? (new Set(filters.selectedPlayerIds) as Selection)
      : (new Set<string>() as Selection);
  }, [filters.selectedPlayerIds]);

  const gameSelectionSummary =
    filters.selectedGameIds.length > 0
      ? `${filters.selectedGameIds.length} 件選択`
      : "全試合";

  const playerSelectionSummary =
    filters.selectedPlayerIds.length > 0
      ? `${filters.selectedPlayerIds.length} 名選択`
      : "全プレイヤー";

  const handleGameSelectionChange = (keys: Selection) => {
    const normalized =
      keys === "all"
        ? gameOptions.map((option) => option.value)
        : Array.from(keys).map(String);
    filters.setSelectedGameIds(normalized);
  };

  const handlePlayerSelectionChange = (keys: Selection) => {
    const normalized =
      keys === "all"
        ? playerOptions.map((option) => option.value)
        : Array.from(keys).map(String);
    filters.setSelectedPlayerIds(normalized);
  };

  return (
    <main className="min-h-screen bg-background pb-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-10 lg:px-8">
        <Card
          radius="lg"
          shadow="sm"
          className="border border-default-200 bg-white/95 backdrop-blur"
        >
          <CardBody className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Chip
                color="secondary"
                variant="flat"
                className="w-fit uppercase tracking-[0.25em]"
              >
                Among Us Analytics
              </Chip>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">
                  Beyond Us ライトテーマダッシュボード
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-foreground-500">
                  JSONL
                  ログをブラウザだけで読み込み、役職別パフォーマンスやヒートマップ、移動タイムラインなど
                  10 種類の Highcharts を一括で確認できます。
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {loading ? (
                <Chip
                  color="primary"
                  variant="flat"
                  startContent={<Spinner size="sm" color="primary" />}
                  className="bg-primary-50 text-primary-700"
                >
                  読み込み中...
                </Chip>
              ) : null}
              <Button
                color="primary"
                variant="flat"
                radius="full"
                onPress={refresh}
              >
                データ再取得
              </Button>
              <Button
                color="secondary"
                variant="solid"
                radius="full"
                onPress={filters.resetFilters}
              >
                フィルタをクリア
              </Button>
            </div>
          </CardBody>
        </Card>

        {error ? (
          <Alert
            color="danger"
            variant="flat"
            title="データ取得に失敗しました"
            description={error.message}
            className="rounded-3xl border border-danger-100 bg-danger-50/80"
            endContent={
              <Button
                size="sm"
                color="danger"
                variant="flat"
                radius="full"
                onPress={refresh}
              >
                もう一度試す
              </Button>
            }
          />
        ) : null}

        {parserErrors.length > 0 ? (
          <Accordion
            variant="splitted"
            defaultExpandedKeys={["parser-warnings"]}
            className="rounded-3xl border border-warning-100 bg-warning-50/80"
          >
            <AccordionItem
              key="parser-warnings"
              aria-label="JSONL parser warnings"
              title={`JSONL 解析時に ${parserErrors.length} 件の警告が発生しました`}
              subtitle="最新 3 件を表示しています"
            >
              <ul className="space-y-1 text-sm text-warning-900">
                {parserErrors.slice(0, 3).map((item, index) => (
                  <li key={`${item.lineNumber}-${index}`}>
                    行 {item.lineNumber}: {item.error.message}
                  </li>
                ))}
              </ul>
              {parserErrors.length > 3 ? (
                <p className="mt-2 text-xs text-warning-900">
                  他 {parserErrors.length - 3} 件の警告があります。
                </p>
              ) : null}
            </AccordionItem>
          </Accordion>
        ) : null}

        {/* KPI cards removed as requested */}

        <Card
          radius="lg"
          shadow="sm"
          className="border border-default-200 bg-white/95 backdrop-blur"
        >
          <CardHeader className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">フィルタ</p>
            <p className="text-xs text-foreground-500">
              ユーザーや試合単位でチャートを柔軟に絞り込みます。
            </p>
          </CardHeader>
          <CardBody className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-foreground-500">
                <span className="font-semibold text-foreground">試合選択</span>
                <Chip color="primary" variant="flat" size="sm">
                  {gameSelectionSummary}
                </Chip>
              </div>
              <Select
                aria-label="試合選択"
                labelPlacement="outside"
                placeholder="試合を選択"
                selectionMode="multiple"
                selectedKeys={selectedGameKeys}
                onSelectionChange={handleGameSelectionChange}
                variant="flat"
                radius="lg"
                isMultiline
                className="w-full"
                listboxProps={{ className: "max-h-72" }}
              >
                {gameOptions.map((option) => (
                  <SelectItem key={option.value}>{option.label}</SelectItem>
                ))}
              </Select>
              <p className="text-xs text-foreground-500">
                複数選択で試合を絞り込みます（⌘ / Ctrl + クリック）。
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-foreground-500">
                <span className="font-semibold text-foreground">
                  プレイヤー選択
                </span>
                <Chip color="secondary" variant="flat" size="sm">
                  {playerSelectionSummary}
                </Chip>
              </div>
              <Select
                aria-label="プレイヤー選択"
                labelPlacement="outside"
                placeholder="プレイヤーを選択"
                selectionMode="multiple"
                selectedKeys={selectedPlayerKeys}
                onSelectionChange={handlePlayerSelectionChange}
                variant="flat"
                radius="lg"
                isMultiline
                className="w-full"
                listboxProps={{ className: "max-h-72" }}
              >
                {playerOptions.map((option) => (
                  <SelectItem key={option.value}>{option.label}</SelectItem>
                ))}
              </Select>
              <p className="text-xs text-foreground-500">
                プレイヤー軸のチャート（ヒートマップ/レーダーなど）に適用されます。
              </p>
            </div>
          </CardBody>
        </Card>

        {!hasData && !loading ? (
          <Card
            radius="lg"
            className="border border-default-200 bg-white/95 text-center text-foreground-500"
          >
            <CardBody>
              まだ JSONL
              データが読み込まれていません。`public/game_history_sample.jsonl`
              を配置してください。
            </CardBody>
          </Card>
        ) : null}

        {/* 独立セクション: プレイヤー勝率 */}
        <ChartCard
          title="プレイヤー勝率"
          description="プレイヤーごとの勝率と役職別寄与（独立セクション）"
          className="lg:col-span-12"
        >
          <PlayerWinRateTable data={analytics.playerWinRate} className="p-4" />
        </ChartCard>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <ChartCard
            title="プレイヤー勝率 × 役職影響"
            description="勝利/敗北に貢献した役職を1つのグラフで比較"
            className="lg:col-span-12"
          >
            <PlayerRoleWinLossChart
              options={{
                games,
                selectedGameIds:
                  filters.selectedGameIds.length > 0
                    ? new Set(filters.selectedGameIds)
                    : undefined,
                selectedPlayerIds:
                  filters.selectedPlayerIds.length > 0
                    ? new Set(filters.selectedPlayerIds)
                    : undefined,
              }}
            />
          </ChartCard>
          <ChartCard
            title="プレイヤーの陣営プレイ率"
            description="全プレイヤーの陣営プレイ割合（グリッド表示）"
            className="lg:col-span-12"
          >
            <PlayerFactionPlayRateChart
              options={{
                games,
                selectedGameIds:
                  filters.selectedGameIds.length > 0
                    ? new Set(filters.selectedGameIds)
                    : undefined,
                selectedPlayerIds:
                  filters.selectedPlayerIds.length > 0
                    ? new Set(filters.selectedPlayerIds)
                    : undefined,
              }}
            />
          </ChartCard>

          <ChartCard
            title="プレイヤーの役職ごとのプレイ率"
            description="全プレイヤーの役職プレイ割合（グリッド表示）"
            className="lg:col-span-12"
          >
            <PlayerRolePlayRateChart
              options={{
                games,
                selectedGameIds:
                  filters.selectedGameIds.length > 0
                    ? new Set(filters.selectedGameIds)
                    : undefined,
                selectedPlayerIds:
                  filters.selectedPlayerIds.length > 0
                    ? new Set(filters.selectedPlayerIds)
                    : undefined,
              }}
            />
          </ChartCard>
          <ChartCard
            title="陣営別勝率"
            description="勝利数・試合数を割合で把握"
            className="lg:col-span-4"
          >
            <FactionWinRateChart
              data={analytics.factionWinRate}
              className="h-80"
            />
          </ChartCard>

          {/* プレイヤー勝率は独立セクションに移動しました */}

          <ChartCard
            title="プレイヤー × 陣営ヒートマップ"
            description="勝率とプレイ回数をセル表示"
            className="lg:col-span-6"
          >
            <PlayerFactionHeatmap
              data={analytics.playerFactionHeatmap}
              className="h-105"
            />
          </ChartCard>

          <ChartCard
            title="プレイヤー × 役職ヒートマップ"
            description="頻出役職トップ 12"
            className="lg:col-span-6"
          >
            <PlayerRoleHeatmap
              data={analytics.playerRoleHeatmap}
              className="h-105"
            />
          </ChartCard>

          <ChartCard
            title="タスク進捗タイムライン"
            description="累計タスク数の推移"
            className="lg:col-span-7"
          >
            <TaskTimelineChart data={analytics.taskTimeline} className="h-90" />
          </ChartCard>

          <ChartCard
            title="イベント密度"
            description="分単位のイベント発生数"
            className="lg:col-span-5"
          >
            <EventDensityChart data={analytics.eventDensity} className="h-90" />
          </ChartCard>

          <ChartCard
            title="移動距離 × イベント"
            description="プレイヤー別の移動量と重要イベント"
            className="lg:col-span-8"
          >
            <MovementWithEventsChart
              data={analytics.movementWithEvents}
              className="h-95"
            />
          </ChartCard>

          <ChartCard
            title="個人レーダー"
            description="勝率/キル/移動など 6 指標"
            className="lg:col-span-4"
          >
            <PlayerRadarChart data={analytics.playerRadar} className="h-95" />
          </ChartCard>

          <ChartCard
            title="役職別パフォーマンス"
            description="平均タスク・平均生存時間"
            className="lg:col-span-6"
          >
            <RolePerformanceChart
              data={analytics.rolePerformance}
              className="h-105"
            />
          </ChartCard>

          <ChartCard
            title="試合時間ヒストグラム"
            description="所要時間の分布"
            className="lg:col-span-6"
          >
            <GameDurationChart
              data={analytics.gameDuration}
              className="h-105"
            />
          </ChartCard>
        </section>
      </div>
    </main>
  );
}
