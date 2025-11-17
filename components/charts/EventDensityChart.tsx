"use client";

import { useMemo } from "react";
import type Highcharts from "highcharts";
import type { Options } from "highcharts";
import type { EventDensityData } from "../../lib/data-transformers/types";
import { BaseChart } from "./BaseChart";
import { ChartEmptyState } from "./ChartEmptyState";

interface EventDensityChartProps {
  data: EventDensityData;
  className?: string;
}

export function EventDensityChart({ data, className }: EventDensityChartProps) {
  const { xLabels, series } = useMemo(() => {
    const buckets = data.buckets;
    const categorySet = new Set<string>();
    buckets.forEach((bucket) => {
      Object.keys(bucket.categories).forEach((name) => categorySet.add(name));
    });
    const categoryNames = Array.from(categorySet.values());
    const chartSeries: Highcharts.SeriesColumnOptions[] = categoryNames.map(
      (name) => ({
        type: "column",
        name,
        data: buckets.map((bucket) => bucket.categories[name] ?? 0),
      })
    );
    return {
      xLabels: buckets.map((bucket) => `${bucket.minute}分`),
      series: chartSeries,
    };
  }, [data]);

  const options = useMemo<Options>(
    () => ({
      chart: { type: "column" },
      title: { text: undefined },
      xAxis: {
        categories: xLabels,
        labels: { style: { color: "#475569" } },
        title: { text: "経過時間 (分)" },
      },
      yAxis: {
        title: { text: "イベント数" },
        allowDecimals: false,
      },
      plotOptions: {
        column: {
          stacking: "normal",
          borderRadius: 2,
        },
      },
      tooltip: {
        shared: true,
        headerFormat: '<span style="font-weight:600">{point.key}</span><br/>',
        pointFormat:
          '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
      },
      series,
    }),
    [series, xLabels]
  );

  if (data.buckets.length === 0) {
    return (
      <ChartEmptyState
        className={className}
        message="イベント密度のデータがありません"
      />
    );
  }

  return <BaseChart options={options} className={className} />;
}
