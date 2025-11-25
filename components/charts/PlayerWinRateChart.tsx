"use client";

import { useMemo } from "react";
import type { Options } from "highcharts";
import type { PlayerWinRateData } from "../../lib/data-transformers/types";
import { BaseChart } from "./BaseChart";
import { ChartEmptyState } from "./ChartEmptyState";
import type { DisplayMode } from "../dashboard/FilterSection";

interface PlayerWinRateChartProps {
  data: PlayerWinRateData;
  displayMode?: DisplayMode;
  className?: string;
}

export function PlayerWinRateChart({
  data,
  displayMode = "percent",
  className,
}: PlayerWinRateChartProps) {
  const { categories, seriesData, maxWins } = useMemo(() => {
    // すべての役職を収集
    const allRoles = new Set<string>();
    data.rows.forEach((row) => {
      row.roles.forEach((roleData) => {
        allRoles.add(roleData.role);
      });
    });

    // 最大勝利数を取得（回数モード用）
    const maxWinsValue = Math.max(...data.rows.map((row) => row.wins), 0);

    // 各役職のシリーズデータを作成
    const series = [
      {
        name: displayMode === "percent" ? "勝率" : "勝利数",
        data: data.rows.map((row) => ({
          y: displayMode === "percent" ? row.winRate * 100 : row.wins,
          custom: {
            wins: row.wins,
            games: row.games,
            winRate: row.winRate,
          },
        })),
        type: "column" as const,
        color: "#3b82f6",
      },
    ];

    return {
      categories: data.rows.map((row) => row.name),
      seriesData: series,
      maxWins: maxWinsValue,
    };
  }, [data, displayMode]);

  const options = useMemo<Options>(
    () => ({
      chart: { type: "column" },
      title: { text: undefined },
      xAxis: {
        categories,
        crosshair: true,
        labels: { style: { color: "#475569", fontWeight: "500" } },
      },
      yAxis:
        displayMode === "percent"
          ? {
              min: 0,
              max: 100,
              title: { text: "勝率 (%)" },
              labels: { format: "{value}%" },
            }
          : {
              min: 0,
              max: maxWins > 0 ? undefined : 10,
              title: { text: "勝利数" },
              labels: { format: "{value}" },
              allowDecimals: false,
            },
      plotOptions: {
        column: {
          borderRadius: 6,
          dataLabels: {
            enabled: true,
            format: displayMode === "percent" ? "{y:.1f}%" : "{y}勝",
            style: {
              textOutline: "none",
              fontWeight: "bold",
              color: "#333333",
            },
          },
        },
      },
      legend: { enabled: false },
      tooltip: {
        useHTML: true,
        formatter: function (this: any) {
          const p = this.point;
          const wins = p.custom?.wins ?? 0;
          const games = p.custom?.games ?? 0;
          const winRate = ((p.custom?.winRate ?? 0) * 100).toFixed(1);
          return displayMode === "percent"
            ? `<b>${winRate}%</b><br/>${wins}勝 / ${games}試合`
            : `<b>${wins}勝</b><br/>勝率: ${winRate}%`;
        },
      },
      series: seriesData,
    }),
    [categories, seriesData, displayMode, maxWins]
  );

  if (categories.length === 0) {
    return (
      <ChartEmptyState
        className={className}
        message="プレイヤーの試合データがありません"
      />
    );
  }

  return <BaseChart options={options} className={className} />;
}
