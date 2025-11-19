"use client";

import { useMemo } from "react";
import type { Options } from "highcharts";
import type { RolePerformanceData } from "../../lib/data-transformers/types";
import { BaseChart } from "./BaseChart";
import { ChartEmptyState } from "./ChartEmptyState";
import { getRoleDisplayName } from "../../lib/role-localization";

interface RoleWinRateChartProps {
  data: RolePerformanceData;
  className?: string;
}

export function RoleWinRateChart({ data, className }: RoleWinRateChartProps) {
  const { categories, seriesData } = useMemo(() => {
    // 役職を勝率で並び替えて表示（プレイヤー勝率チャートと同じ並び）
    const sorted = data.rows.slice().sort((a, b) => b.winRate - a.winRate);

    const categories = sorted.map((row) => getRoleDisplayName(row.role));
    const seriesData = sorted.map((row) => ({
      y: row.winRate * 100,
      custom: { games: row.games },
    }));

    return { categories, seriesData };
  }, [data]);

  const options = useMemo<Options>(
    () => ({
      chart: { type: "bar" },
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
          "<b>{point.y:.1f}%</b> （試合数: {point.custom.games}）<br/>",
      },
      series: [
        {
          name: "勝率",
          type: "bar",
          data: seriesData,
          color: "#3b82f6",
        },
      ],
    }),
    [categories, seriesData]
  );

  if (categories.length === 0) {
    return (
      <ChartEmptyState
        className={className}
        message="役職のデータがありません"
      />
    );
  }

  return <BaseChart options={options} className={className} />;
}
