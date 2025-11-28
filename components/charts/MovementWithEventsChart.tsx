"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import type { Options } from "highcharts";
import { animate } from "animejs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  MovementWithEventsAllGamesData,
  MovementWithEventsGameData,
} from "../../lib/data-transformers/types";
import { BaseChart } from "./BaseChart";
import { ChartEmptyState } from "./ChartEmptyState";
import { formatDuration } from "../../lib/formatters";

interface MovementWithEventsChartProps {
  allGamesData: MovementWithEventsAllGamesData;
  className?: string;
}

/** 日時を短い形式にフォーマット */
function formatStartTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 1試合分のチャートデータを構築 */
function buildChartData(data: MovementWithEventsGameData) {
  const movementSeries = data.series.map((entry) => ({
    type: "spline" as const,
    name: entry.playerName,
    data: entry.data.map((point) => ({
      x: Number((point.x / 60).toFixed(2)),
      y: Number(point.y.toFixed(1)),
      custom: { timeLabel: formatDuration(point.x) },
    })),
  }));

  const eventSeries = data.events.map((event) => ({
    x: Number((event.x / 60).toFixed(2)),
    y: 1,
    color: event.color,
    custom: {
      label: event.label,
      type: event.type,
      timeLabel: formatDuration(event.x),
    },
  }));

  const maxMinutes = Number((data.durationSeconds / 60).toFixed(1));

  return { movementSeries, eventSeries, maxMinutes };
}

export function MovementWithEventsChart({
  allGamesData,
  className,
}: MovementWithEventsChartProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const games = allGamesData.games;
  const totalGames = games.length;

  // インデックスが範囲外にならないよう調整
  const safeIndex = Math.max(0, Math.min(currentIndex, totalGames - 1));
  const currentGame = games[safeIndex];

  // 試合切り替え時のアニメーション
  useEffect(() => {
    if (chartContainerRef.current) {
      animate(chartContainerRef.current, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 300,
        ease: "outExpo",
      });
    }
  }, [safeIndex]);

  const { movementSeries, eventSeries, maxMinutes } = useMemo(() => {
    if (!currentGame) {
      return { movementSeries: [], eventSeries: [], maxMinutes: 0 };
    }
    return buildChartData(currentGame);
  }, [currentGame]);

  const options = useMemo<Options>(
    () => ({
      chart: { spacingBottom: 56 },
      title: { text: undefined },
      xAxis: {
        title: { text: "経過時間 (分)", margin: 24 },
        labels: { format: "{value}分" },
        max: maxMinutes,
      },
      yAxis: [
        {
          title: { text: "移動距離 (m)" },
        },
        {
          title: { text: "" },
          max: 1,
          min: 0,
          visible: false,
          opposite: true,
        },
      ],
      legend: { align: "right", verticalAlign: "top" },
      tooltip: { shared: false },
      series: [
        ...movementSeries.map((series) => ({
          ...series,
          tooltip: {
            pointFormat:
              "{series.name}<br/>時刻: {point.custom.timeLabel}<br/>距離: <b>{point.y:.0f} m</b>",
          },
        })),
        {
          type: "scatter",
          name: "イベント",
          data: eventSeries,
          yAxis: 1,
          marker: { symbol: "circle", radius: 6 },
          tooltip: {
            pointFormat:
              '<span style="color:{point.color}">{point.custom.label}</span><br/>時刻: {point.custom.timeLabel}',
          },
        },
      ],
    }),
    [eventSeries, maxMinutes, movementSeries]
  );

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    }
  };

  const handleNext = () => {
    if (safeIndex < totalGames - 1) {
      setCurrentIndex(safeIndex + 1);
    }
  };

  // 試合がない場合
  if (totalGames === 0 || !currentGame) {
    return (
      <ChartEmptyState className={className} message="移動データがありません" />
    );
  }

  return (
    <div className={className}>
      {/* 試合切り替えナビゲーション */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={safeIndex === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="前の試合"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-20 text-center text-sm font-medium text-slate-700">
            {safeIndex + 1} / {totalGames}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={safeIndex === totalGames - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="次の試合"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 試合メタデータ */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
            {currentGame.mapName}
          </span>
          <span>{formatStartTime(currentGame.startTime)}</span>
          <span>{currentGame.playerCount}人</span>
        </div>
      </div>

      {/* チャート本体 */}
      <div ref={chartContainerRef}>
        {movementSeries.length === 0 ? (
          <ChartEmptyState
            message="この試合には移動データがありません"
            className="pb-10"
          />
        ) : (
          <BaseChart options={options} className="pb-10" />
        )}
      </div>
    </div>
  );
}
