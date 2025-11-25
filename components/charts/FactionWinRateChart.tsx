"use client";

import { useMemo } from "react";
import type { Options } from "highcharts";
import type { FactionWinRateData } from "../../lib/data-transformers/types";
import { BaseChart } from "./BaseChart";
import { getFactionDisplayName } from "../../lib/role-localization";
import { ChartEmptyState } from "./ChartEmptyState";
import type { DisplayMode } from "../dashboard/FilterSection";

interface FactionWinRateChartProps {
  data: FactionWinRateData;
  displayMode?: DisplayMode;
  className?: string;
}

export function FactionWinRateChart({
  data,
  displayMode = "percent",
  className,
}: FactionWinRateChartProps) {
  const { categories, seriesData, maxWins } = useMemo(() => {
    // Sort by win rate descending
    const sorted = data.breakdown.slice().sort((a, b) => b.winRate - a.winRate);

    const categories = sorted.map((item) =>
      getFactionDisplayName(item.faction as any)
    );
    const maxWinsValue = Math.max(...sorted.map((item) => item.wins), 0);
    const seriesData = sorted.map((item) => ({
      y: displayMode === "percent" ? item.winRate * 100 : item.wins,
      color: item.color, // Use specific faction color
      custom: {
        games: item.games,
        wins: item.wins,
        losses: item.losses,
        winRate: item.winRate,
      },
    }));

    return { categories, seriesData, maxWins: maxWinsValue };
  }, [data, displayMode]);

  const options = useMemo<Options>(
    () => ({
      chart: { type: "bar", marginRight: 30 },
      title: { text: undefined },
      xAxis: {
        categories,
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
        series: {
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
          const losses = p.custom?.losses ?? 0;
          const games = p.custom?.games ?? 0;
          const winRate = ((p.custom?.winRate ?? 0) * 100).toFixed(1);
          return displayMode === "percent"
            ? `<b>${winRate}%</b> （試合数: ${games}）<br/>勝利: ${wins} / 敗北: ${losses}`
            : `<b>${wins}勝</b> （試合数: ${games}）<br/>勝率: ${winRate}%<br/>敗北: ${losses}`;
        },
      },
      series: [
        {
          name: displayMode === "percent" ? "勝率" : "勝利数",
          type: "bar",
          data: seriesData,
        },
      ],
    }),
    [categories, seriesData, displayMode, maxWins]
  );

  if (categories.length === 0) {
    return (
      <ChartEmptyState className={className} message="勝利データがありません" />
    );
  }

  return <BaseChart options={options} className={className} />;
}
