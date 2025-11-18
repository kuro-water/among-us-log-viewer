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
    const roleColors: Record<string, string> = {
      Crewmate: "#4ade80",
      Impostor: "#ef4444",
      Engineer: "#3b82f6",
      Scientist: "#8b5cf6",
      Shapeshifter: "#ec4899",
      Phantom: "#6366f1",
      Noisemaker: "#14b8a6",
      Tracker: "#f59e0b",
      GuardianAngel: "#06b6d4",
    };

    const series = Array.from(allRoles).map((role) => {
      const roleData = data.rows.map((row) => {
        const roleInfo = row.roles.find((r) => r.role === role);
        // 各プレイヤーの勝率の中での役職の寄与率を計算
        if (roleInfo && row.wins > 0) {
          return (roleInfo.wins / row.wins) * row.winRate * 100;
        }
        return 0;
      });

      return {
        name: role,
        data: roleData,
        type: "column" as const,
        color: roleColors[role] || "#94a3b8",
      };
    });

    return {
      categories: data.rows.map((row) => row.name),
      seriesData: series,
      maxWinRate: max,
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
        max: maxWinRate,
        title: { text: "勝率 (%)" },
        labels: { format: "{value:.0f}%" },
      },
      plotOptions: {
        column: {
          stacking: "normal",
          borderRadius: 6,
          // 横方向の余白（列間）
          groupPadding: 0.12,
          // 各列の幅に対するポイントの余白（内側）
          pointPadding: 0.02,
          // セグメント間に白いラインを入れて円グラフっぽく見せる
          borderWidth: 2,
          borderColor: "#ffffff",
          dataLabels: {
            enabled: true,
            format: "{point.percentage:.0f}%",
            style: {
              textOutline: "none",
              fontWeight: "500",
            },
          },
        },
      },
      legend: { align: "right", verticalAlign: "top" },
      tooltip: {
        shared: true,
        pointFormat:
          '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
      },
      series: seriesData,
    }),
    [categories, seriesData, maxWinRate]
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
