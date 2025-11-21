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
  const chartData = useMemo(
    () => data.distribution.map((d) => [d.minute, d.count]),
    [data]
  );

  const options = useMemo<Options>(
    () => ({
      chart: { type: "area" },
      title: { text: undefined },
      xAxis: {
        title: { text: "試合時間 (分)" },
        labels: { format: "{value}分" },
        allowDecimals: false,
      },
      yAxis: {
        title: { text: "試合数" },
        allowDecimals: false,
      },
      legend: { enabled: false },
      tooltip: {
        headerFormat: "",
        pointFormat: "{point.x}分: <b>{point.y} 試合</b>",
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
