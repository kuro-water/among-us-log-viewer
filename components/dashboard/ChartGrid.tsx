import dynamic from "next/dynamic";

import { ChartCard } from "@/components/dashboard/ChartCard";
import type { DisplayMode } from "@/components/dashboard/FilterSection";
import type { GameLog } from "@/types/game-data.types";
import type {
  FactionWinRateData,
  HeatmapData,
  RolePerformanceData,
  GameDurationData,
  TaskTimelineData,
  EventDensityData,
  MovementWithEventsData,
  MovementWithEventsAllGamesData,
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
const RolePerformanceChart = dynamic(
  () => import("@/components/charts").then((m) => m.RolePerformanceChart),
  { ssr: false }
);
const GameDurationChart = dynamic(
  () => import("@/components/charts").then((m) => m.GameDurationChart),
  { ssr: false }
);

const PlayerStatsTable = dynamic(
  () => import("@/components/charts").then((m) => m.PlayerStatsTable),
  { ssr: false }
);

const PlayerActionsTable = dynamic(
  () => import("@/components/charts").then((m) => m.PlayerActionsTable),
  { ssr: false }
);

interface AnalyticsPayload {
  factionWinRate: FactionWinRateData;
  playerWinRate: PlayerWinRateData;
  playerFactionHeatmap: HeatmapData;
  playerRoleHeatmap: HeatmapData;
  rolePerformance: RolePerformanceData;
  gameDuration: GameDurationData;
  taskTimeline: TaskTimelineData | null;
  eventDensity: EventDensityData;
  movementWithEvents: MovementWithEventsData | null;
  movementWithEventsAllGames: MovementWithEventsAllGamesData;
  playerAllStats: import("@/lib/data-transformers/types").PlayerAllStatsData;
}

interface ChartGridProps {
  analytics: AnalyticsPayload;
  games: GameLog[];
  selectedGameIds: string[];
  selectedPlayerIds: string[];
  displayMode: DisplayMode;
}

export function ChartGrid({
  analytics,
  games,
  selectedGameIds,
  selectedPlayerIds,
  displayMode,
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
      <ChartCard
        title="プレイヤー勝率"
        description="プレイヤーごとの勝率"
        span="lg:col-span-12"
      >
        <PlayerWinRateChart
          data={analytics.playerWinRate}
          displayMode={displayMode}
          className="h-96"
        />
      </ChartCard>

      {/* 役職別勝敗率（プレイヤー勝率の下） */}
      <ChartCard
        title="役職別勝敗率"
        description="各役職の勝敗率"
        span="lg:col-span-12"
      >
        <RoleWinRateChart
          data={analytics.rolePerformance}
          displayMode={displayMode}
          className="h-96"
        />
      </ChartCard>

      {/* 陣営別勝率（役職別勝率の下） */}
      <ChartCard
        title="陣営別勝率"
        description="勝利数・試合数を割合で把握"
        span="lg:col-span-12"
      >
        <FactionWinRateChart
          data={analytics.factionWinRate}
          displayMode={displayMode}
          className="h-96"
        />
      </ChartCard>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ChartCard
          title="プレイヤーの陣営プレイ率"
          description="全プレイヤーの陣営プレイ割合"
          span="lg:col-span-12"
        >
          <PlayerFactionPlayRateChart
            options={chartOptions}
            displayMode={displayMode}
          />
        </ChartCard>

        <ChartCard
          title="プレイヤーの役職ごとのプレイ率"
          description="全プレイヤーの役職プレイ割合"
          span="lg:col-span-12"
        >
          <PlayerRolePlayRateChart
            options={chartOptions}
            displayMode={displayMode}
          />
        </ChartCard>

        {/* FactionWinRateChart removed as it is now in WinRateTabs */}

        <ChartCard
          title="プレイヤー × 陣営ヒートマップ"
          description="勝率とプレイ回数"
          span="lg:col-span-12"
        >
          <PlayerFactionHeatmap
            data={analytics.playerFactionHeatmap}
            displayMode={displayMode}
            className="min-h-[400px]"
          />
        </ChartCard>

        <ChartCard
          title="プレイヤー × 役職ヒートマップ"
          description="勝率とプレイ回数（全役職を含む。プレイ回数が0の役職は非表示）"
          span="lg:col-span-12"
        >
          <PlayerRoleHeatmap
            data={analytics.playerRoleHeatmap}
            displayMode={displayMode}
            className="min-h-[400px]"
          />
        </ChartCard>

        {/* プレイヤー統計テーブル - ヒートマップ群の下に配置 */}
        <ChartCard
          title="プレイヤー統計一覧"
          description="全プレイヤーの集計統計（試合数, 勝利, キルなど）。列はプレイヤー、行は指標です。"
          span="lg:col-span-12"
        >
          <PlayerStatsTable data={analytics.playerAllStats} />
        </ChartCard>

        {/* プレイヤーアクションテーブル - 統計一覧の下に配置 */}
        <ChartCard
          title="プレイヤーアクション一覧"
          description="緊急ボタン、サボタージュ、修理、ベント移動、ドア閉鎖、アドミン/バイタル/カメラ使用時間"
          span="lg:col-span-12"
        >
          <PlayerActionsTable data={analytics.playerAllStats} />
        </ChartCard>

        <ChartCard
          title="タスク進捗タイムライン"
          description="累計タスク数の推移"
          span="lg:col-span-7"
        >
          <TaskTimelineChart data={analytics.taskTimeline} className="h-90" />
        </ChartCard>

        <ChartCard
          title="イベント密度"
          description="分単位のイベント発生数"
          span="lg:col-span-5"
        >
          <EventDensityChart data={analytics.eventDensity} className="h-90" />
        </ChartCard>

        <ChartCard
          title="移動距離 × イベント"
          description="プレイヤー別の移動量と重要イベント"
          span="lg:col-span-12"
        >
          <MovementWithEventsChart
            allGamesData={analytics.movementWithEventsAllGames}
            className="h-95"
          />
        </ChartCard>

        <ChartCard
          title="役職別パフォーマンス"
          description="タスク完了率・平均生存時間"
          span="lg:col-span-6"
        >
          <RolePerformanceChart
            data={analytics.rolePerformance}
            className="h-105"
          />
        </ChartCard>

        <ChartCard
          title="試合時間分布"
          description="所要時間の分布"
          span="lg:col-span-6"
        >
          <GameDurationChart data={analytics.gameDuration} className="h-105" />
        </ChartCard>
      </section>
    </>
  );
}
