"use client";

import { useMemo } from "react";
import type { Options } from "highcharts";
import type { RolePerformanceData } from "../../lib/data-transformers/types";
import { BaseChart } from "./BaseChart";
import { ChartEmptyState } from "./ChartEmptyState";
import { FACTION_COLORS } from "../../lib/role-mapping";
import { formatRatio } from "../../lib/formatters";

interface RolePerformanceChartProps {
  data: RolePerformanceData;
  className?: string;
}

export function RolePerformanceChart({
  data,
  className,
}: RolePerformanceChartProps) {
  const { categories, tasks, aliveMinutes } = useMemo(() => {
    const winRateText = data.rows.map((row) => formatRatio(row.winRate));
    return {
      categories: data.rows.map((row) => row.role),
      tasks: data.rows.map((row, index) => ({
        y: Number(row.avgTasks.toFixed(1)),
        color: FACTION_COLORS[row.faction],
        custom: {
          winRate: winRateText[index],
        },
      })),
      aliveMinutes: data.rows.map((row, index) => ({
        y: Number((row.avgTimeAlive / 60).toFixed(1)),
        custom: {
          winRate: winRateText[index],
        },
      })),
    };
  }, [data]);

  const options = useMemo<Options>(
    () => ({
      chart: { type: "bar" },
      title: { text: undefined },
      xAxis: {
        categories,
        labels: { style: { color: "#475569", fontSize: "12px" } },
      },
      yAxis: {
        min: 0,
        title: { text: "平均値" },
      },
      plotOptions: {
        series: {
          borderRadius: 4,
          dataLabels: { enabled: false },
        },
      },
      legend: { align: "right", verticalAlign: "top" },
      tooltip: {
        shared: true,
        headerFormat:
          '<span style="font-weight:600;color:#0f172a">{point.key}</span><br/>',
        pointFormat:
          '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.1f}</b><br/>' +
          '<span style="color:#64748b">勝率 {point.custom.winRate}</span><br/>',
      },
      series: [
        {
          name: "平均タスク数",
          type: "bar",
          data: tasks,
        },
        {
          name: "平均生存時間 (分)",
          type: "bar",
          color: "#94a3b8",
          data: aliveMinutes,
        },
      ],
    }),
    [aliveMinutes, categories, tasks]
  );

  if (categories.length === 0) {
    return (
      <ChartEmptyState
        className={className}
        message="役職の統計データがありません"
      />
    );
  }

  return <BaseChart options={options} className={className} />;
}
