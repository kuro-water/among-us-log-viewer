import dynamic from "next/dynamic";

import { ChartCard } from "@/components/dashboard/ChartCard";
import type { GameLog } from "@/types/game-data.types";
import type {
  FactionWinRateData,
  HeatmapData,
  RolePerformanceData,
  GameDurationData,
  PlayerRadarData,
  TaskTimelineData,
  EventDensityData,
  MovementWithEventsData,
  PlayerWinRateData,
} from "@/lib/data-transformers/types";

const PlayerWinRateChart = dynamic(
  () => import("@/components/charts").then((m) => m.PlayerWinRateChart),
  { ssr: false }
);
const RoleWinRateChart = dynamic(
  () => import("@/components/charts").then((m) => m.RoleWinRateChart),
  { ssr: false }
);
const PlayerFactionPlayRateChart = dynamic(
  () => import("@/components/charts").then((m) => m.PlayerFactionPlayRateChart),
  { ssr: false }
);
const PlayerRolePlayRateChart = dynamic(
  () => import("@/components/charts").then((m) => m.PlayerRolePlayRateChart),
  { ssr: false }
);
const FactionWinRateChart = dynamic(
  () => import("@/components/charts").then((m) => m.FactionWinRateChart),
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

interface AnalyticsPayload {
  factionWinRate: FactionWinRateData;
  playerWinRate: PlayerWinRateData;
  playerFactionHeatmap: HeatmapData;
  playerRoleHeatmap: HeatmapData;
  rolePerformance: RolePerformanceData;
  gameDuration: GameDurationData;
  playerRadar: PlayerRadarData | null;
  taskTimeline: TaskTimelineData | null;
  eventDensity: EventDensityData;
  movementWithEvents: MovementWithEventsData | null;
}

interface ChartGridProps {
  analytics: AnalyticsPayload;
  games: GameLog[];
  selectedGameIds: string[];
  selectedPlayerIds: string[];
}

export function ChartGrid({
  analytics,
  games,
  selectedGameIds,
  selectedPlayerIds,
}: ChartGridProps) {
  const chartOptions = {
    games,
    selectedGameIds:
      selectedGameIds.length > 0 ? new Set(selectedGameIds) : undefined,
    selectedPlayerIds:
      selectedPlayerIds.length > 0 ? new Set(selectedPlayerIds) : undefined,
  };

  return (
    <>
      {/* 独立セクション: プレイヤー勝率 */}
      <ChartCard
        title="プレイヤー勝率"
        description="プレイヤーごとの勝率"
        className="lg:col-span-12"
      >
        <PlayerWinRateChart data={analytics.playerWinRate} className="h-96" />
      </ChartCard>

      {/* 役職別勝率（プレイヤー勝率の下） */}
      <ChartCard
        title="役職別勝率"
        description="各役職の勝率"
        className="lg:col-span-12"
      >
        <RoleWinRateChart data={analytics.rolePerformance} className="h-96" />
      </ChartCard>

      {/* 陣営別勝率（役職別勝率の下） */}
      <ChartCard
        title="陣営別勝率"
        description="勝利数・試合数を割合で把握"
        className="lg:col-span-12"
      >
        <FactionWinRateChart data={analytics.factionWinRate} className="h-96" />
      </ChartCard>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ChartCard
          title="プレイヤーの陣営プレイ率"
          description="全プレイヤーの陣営プレイ割合"
          className="lg:col-span-12"
        >
          <PlayerFactionPlayRateChart options={chartOptions} />
        </ChartCard>

        <ChartCard
          title="プレイヤーの役職ごとのプレイ率"
          description="全プレイヤーの役職プレイ割合"
          className="lg:col-span-12"
        >
          <PlayerRolePlayRateChart options={chartOptions} />
        </ChartCard>

        {/* FactionWinRateChart removed as it is now in WinRateTabs */}

        <ChartCard
          title="プレイヤー × 陣営ヒートマップ"
          description="勝率とプレイ回数"
          className="lg:col-span-12"
        >
          <PlayerFactionHeatmap
            data={analytics.playerFactionHeatmap}
            className="h-105"
          />
        </ChartCard>

        <ChartCard
          title="プレイヤー × 役職ヒートマップ"
          description="勝率とプレイ回数（全役職を含む。プレイ回数が0の役職は非表示）"
          className="lg:col-span-12"
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
          <GameDurationChart data={analytics.gameDuration} className="h-105" />
        </ChartCard>
      </section>
    </>
  );
}
