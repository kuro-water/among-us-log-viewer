"use client";

import { useMemo } from "react";
import type Highcharts from "highcharts";
import type { Options } from "highcharts";
import type { HeatmapData } from "../../lib/data-transformers/types";
import { BaseChart } from "./BaseChart";
import { ChartEmptyState } from "./ChartEmptyState";

const COLOR_AXIS: Highcharts.ColorAxisOptions = {
  min: 0,
  max: 100,
  stops: [
    [0, "#ff0000"],
    [0.5, "#ffff00"],
    [1, "#00ff00"],
  ],
  labels: { format: "{value}%" },
};

type HeatmapPoint = Highcharts.PointOptionsObject & {
  custom: {
    displayLabel: string;
    playCount: number;
    wins: number;
    player: string;
    target: string;
  };
};

interface PlayerRoleHeatmapProps {
  data: HeatmapData;
  className?: string;
}

export function PlayerRoleHeatmap({ data, className }: PlayerRoleHeatmapProps) {
  const { xAxisCategories, yAxisCategories, seriesData } = useMemo(() => {
    const mapped: HeatmapPoint[] = data.cells.map((cell) => {
      const displayLabel =
        cell.playCount > 0 && cell.value !== null
          ? `${cell.value.toFixed(0)}%<br/>${cell.playCount}回`
          : "-";
      return {
        x: cell.x,
        y: cell.y,
        value: cell.value,
        custom: {
          displayLabel,
          playCount: cell.playCount,
          wins: cell.wins,
          player: cell.meta.label,
          target: cell.meta.target,
        },
      } satisfies HeatmapPoint;
    });
    return {
      xAxisCategories: data.xAxis,
      yAxisCategories: data.yAxis,
      seriesData: mapped,
    };
  }, [data]);

  const options = useMemo<Options>(
    () => ({
      chart: { type: "heatmap" },
      title: { text: undefined },
      xAxis: {
        categories: xAxisCategories,
        labels: { style: { color: "#475569", fontSize: "12px" } },
      },
      yAxis: {
        categories: yAxisCategories,
        title: { text: undefined },
        labels: { style: { color: "#475569", fontSize: "12px" } },
      },
      colorAxis: COLOR_AXIS,
      plotOptions: {
        heatmap: {
          nullColor: "#dfe3eb",
        },
      },
      legend: { align: "right", verticalAlign: "top", layout: "vertical" },
      tooltip: {
        pointFormat:
          "<b>{point.custom.player}</b><br/>役職: {point.custom.target}<br/>" +
          "勝率: {point.value:.1f}%<br/>プレイ回数: {point.custom.playCount}<br/>勝利数: {point.custom.wins}",
      },
      series: [
        {
          type: "heatmap",
          borderColor: "#f8fafc",
          data: seriesData,
          dataLabels: {
            enabled: true,
            useHTML: true,
            format: "{point.custom.displayLabel}",
            style: { fontWeight: "600", color: "#0f172a" },
          },
        },
      ],
    }),
    [seriesData, xAxisCategories, yAxisCategories]
  );

  if (xAxisCategories.length === 0 || yAxisCategories.length === 0) {
    return (
      <ChartEmptyState
        className={className}
        message="役職ヒートマップを表示するデータがありません"
      />
    );
  }

  return <BaseChart options={options} className={className} />;
}
