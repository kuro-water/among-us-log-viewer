"use client";

import { useMemo } from "react";
import type { Options } from "highcharts";
import type { GameDurationData } from "../../lib/data-transformers/types";
import { BaseChart } from "./BaseChart";
import { ChartEmptyState } from "./ChartEmptyState";

interface GameDurationChartProps {
  data: GameDurationData;
  className?: string;
}

export function GameDurationChart({ data, className }: GameDurationChartProps) {
  const BIN_MINUTES = 3;

  const chartData = useMemo(
    () =>
      data.distribution.map((d) => ({
        x: d.minute,
        y: d.count,
        custom: { rangeLabel: `${d.minute}-${d.minute + BIN_MINUTES - 1}` },
      })),
    [data]
  );

  const options = useMemo<Options>(
    () => ({
      chart: { type: "area" },
      title: { text: undefined },
      xAxis: {
        title: { text: `試合時間 (分, ${BIN_MINUTES}分刻み)` },
        labels: { format: "{value}分" },
        allowDecimals: false,
        tickInterval: BIN_MINUTES,
      },
      yAxis: {
        title: { text: "試合数" },
        allowDecimals: true,
      },
      legend: { enabled: false },
      tooltip: {
        headerFormat: "",
        // Show the three-minute range for the bin and include smoothed counts
        pointFormat: "{point.custom.rangeLabel}分: <b>{point.y:.1f} 試合</b>",
      },
      plotOptions: {
        area: {
          marker: { enabled: false },
          color: "#2563eb",
          fillOpacity: 0.3,
        },
      },
      series: [
        {
          type: "area",
          name: "試合数",
          data: chartData,
        },
      ],
    }),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <ChartEmptyState
        className={className}
        message="試合時間のデータがありません"
      />
    );
  }

  return <BaseChart options={options} className={className} />;
}
