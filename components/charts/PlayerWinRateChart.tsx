"use client";

import { useMemo } from "react";
import type { Options } from "highcharts";
import type { PlayerWinRateData } from "../../lib/data-transformers/types";
import { BaseChart } from "./BaseChart";
import { ChartEmptyState } from "./ChartEmptyState";

interface PlayerWinRateChartProps {
  data: PlayerWinRateData;
  className?: string;
}

export function PlayerWinRateChart({
  data,
  className,
}: PlayerWinRateChartProps) {
  const { categories, seriesData, maxWinRate } = useMemo(() => {
    // 最大勝率を取得
    const max = Math.max(...data.rows.map((row) => row.winRate * 100));

    // すべての役職を収集
    const allRoles = new Set<string>();
    data.rows.forEach((row) => {
      row.roles.forEach((roleData) => {
        allRoles.add(roleData.role);
      });
    });

    // 各役職のシリーズデータを作成
    const series = [
      {
        name: "勝率",
        data: data.rows.map((row) => ({
          y: row.winRate * 100,
        })),
        type: "column" as const,
        color: "#3b82f6",
      },
    ];

    return {
      categories: data.rows.map((row) => row.name),
      seriesData: series,
      maxWinRate: 100,
    };
  }, [data]);

  const options = useMemo<Options>(
    () => ({
      chart: { type: "column" },
      title: { text: undefined },
      xAxis: {
        categories,
        crosshair: true,
        labels: { style: { color: "#475569", fontWeight: "500" } },
      },
      yAxis: {
        min: 0,
        max: 100,
        title: { text: "勝率 (%)" },
        labels: { format: "{value}%" },
      },
      plotOptions: {
        column: {
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
        pointFormat: "<b>{point.y:.1f}%</b><br/>",
      },
      series: seriesData,
    }),
    [categories, seriesData]
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
