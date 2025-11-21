"use client";

import { useMemo } from "react";
import type { Options } from "highcharts";
import type { FactionWinRateData } from "../../lib/data-transformers/types";
import { BaseChart } from "./BaseChart";
import { getFactionDisplayName } from "../../lib/role-localization";
import { ChartEmptyState } from "./ChartEmptyState";

interface FactionWinRateChartProps {
  data: FactionWinRateData;
  className?: string;
}

export function FactionWinRateChart({
  data,
  className,
}: FactionWinRateChartProps) {
  const { categories, seriesData } = useMemo(() => {
    // Sort by win rate descending
    const sorted = data.breakdown.slice().sort((a, b) => b.winRate - a.winRate);

    const categories = sorted.map((item) =>
      getFactionDisplayName(item.faction as any)
    );
    const seriesData = sorted.map((item) => ({
      y: item.winRate * 100,
      color: item.color, // Use specific faction color
      custom: {
        games: item.games,
        wins: item.wins,
        losses: item.losses,
      },
    }));

    return { categories, seriesData };
  }, [data]);

  const options = useMemo<Options>(
    () => ({
      chart: { type: "bar", marginRight: 30 },
      title: { text: undefined },
      xAxis: {
        categories,
        labels: { style: { color: "#475569", fontWeight: "500" } },
      },
      yAxis: {
        min: 0,
        max: 100,
        title: { text: "勝率 (%)" },
        labels: { format: "{value}%" },
      },
      plotOptions: {
        series: {
          borderRadius: 6,
          dataLabels: {
            enabled: true,
            format: "{y:.1f}%",
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
        pointFormat:
          "<b>{point.y:.1f}%</b> （試合数: {point.custom.games}）<br/>" +
          "勝利: {point.custom.wins} / 敗北: {point.custom.losses}",
      },
      series: [
        {
          name: "勝率",
          type: "bar",
          data: seriesData,
        },
      ],
    }),
    [categories, seriesData]
  );

  if (categories.length === 0) {
    return (
      <ChartEmptyState className={className} message="勝利データがありません" />
    );
  }

  return <BaseChart options={options} className={className} />;
}
