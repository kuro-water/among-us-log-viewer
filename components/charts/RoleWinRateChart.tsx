"use client";

import { useMemo } from "react";
import type { Options } from "highcharts";
import type { RolePerformanceData } from "../../lib/data-transformers/types";
import { BaseChart } from "./BaseChart";
import { ChartEmptyState } from "./ChartEmptyState";
import {
  getRoleDisplayName,
  getFactionDisplayName,
} from "../../lib/role-localization";
import { FACTION_COLORS } from "../../lib/role-mapping";
import { getFactionColorByRole } from "../../lib/role-mapping";

interface RoleWinRateChartProps {
  data: RolePerformanceData;
  className?: string;
}

export function RoleWinRateChart({ data, className }: RoleWinRateChartProps) {
  const {
    categories,
    seriesData,
    legendItems,
    factionLegendItems,
    winLossLegend,
  } = useMemo(() => {
    // 役職を勝率で並び替えて表示（プレイヤー勝率チャートと同じ並び）
    const sorted = data.rows.slice().sort((a, b) => b.winRate - a.winRate);

    const categories = sorted.map((row) => getRoleDisplayName(row.role));
    // Use a mirrored (negative/positive) stacked bar to show wins vs losses
    // at-a-glance. For each role we add two data series: "勝利" on the
    // negative axis (role-colored) and "敗北" on the positive axis (grey).
    // Each point is the percent of games for that role (wins/games, losses/games)
    // so the chart is naturally normalized per-role. This mirrors the
    // population pyramid / negative stacking pattern.
    // Create layered series for each game index (capped at 80) and assign
    // each point a percent (100 / games). Wins are negative (left), losses are
    // positive (right). This preserves a per-role 100% normalization while
    // showing per-game granularity.
    const maxGames = Math.min(
      Math.max(...sorted.map((r) => r.games), 0),
      80 // cap for performance
    );

    const seriesData = Array.from({ length: maxGames }, (_, layerIdx) => {
      return {
        name: `game-${layerIdx + 1}`,
        type: "bar" as const,
        borderRadius: 6,
        data: sorted.map((r) => {
          if (r.games <= layerIdx) {
            return { y: 0, color: undefined, custom: { games: r.games } };
          }
          const isWin = layerIdx < (r.wins ?? 0);
          const percent = r.games > 0 ? 100 / r.games : 0;
          return {
            y: isWin ? -Number(percent.toFixed(2)) : Number(percent.toFixed(2)),
            color: isWin ? getFactionColorByRole(r.role) : "#e2e8f0",
            custom: { games: r.games, wins: r.wins ?? 0, winRate: r.winRate },
          };
        }),
      };
    });

    const legendItems = sorted.map((r) => ({
      name: getRoleDisplayName(r.role),
      color: getFactionColorByRole(r.role),
    }));

    // Fixed-order faction legend.
    const factionOrder: Array<
      "Crewmate" | "Impostor" | "Madmate" | "Neutral" | "Other"
    > = ["Crewmate", "Impostor", "Madmate", "Neutral", "Other"];

    const factionLegendItems = factionOrder.map((f) => ({
      name: getFactionDisplayName(f),
      color: FACTION_COLORS[f],
    }));

    const winLossLegend = [
      { name: "勝利（役職色）", color: "transparent" },
      { name: "敗北", color: "#e2e8f0" },
    ];

    return {
      categories,
      seriesData,
      legendItems,
      factionLegendItems,
      winLossLegend,
    };
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
        min: -100,
        max: 100,
        title: { text: "勝敗率 (%)" },
        labels: {
          formatter: function (this: any) {
            // show absolute values for axis labels since negative side indicates losses
            return `${Math.abs(this.value)}%`;
          },
        },
        allowDecimals: true,
        stackLabels: {
          enabled: true,
          useHTML: true,
          style: { fontWeight: "bold", color: "#475569" },
          formatter: function (this: any) {
            // Show absolute total (wins or losses) on the label.
            // If the value is very close to 100%, move the label inside the
            // bar so it doesn't get clipped by the chart container. We use
            // a small translate to nudge the text inward depending on sign.
            const total = Number(this.total);
            const abs = Math.abs(total).toFixed(1);
            const label = `${abs}%`;
            if (Math.abs(total) >= 90) {
              const translate = total > 0 ? "-18px" : "18px";
              return `<span style=\"display:inline-block;transform:translateX(${translate});\">${label}</span>`;
            }
            return label;
          },
        },
      },
      plotOptions: {
        series: {
          borderRadius: 6,
          stacking: "normal",
          // Reduce point padding to make stacked segments tighter vertically
          // and shrink groupPadding to reduce the horizontal gap between
          // role categories.
          pointPadding: 0.06,
          groupPadding: 0.08,
          dataLabels: { enabled: false },
          // Add a border in the color of the card background to visually
          // separate stacked segments. This creates a small "gap" between
          // stacked slices without affecting category spacing.
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      },
      legend: { enabled: false },
      tooltip: {
        shared: false,
        useHTML: true,
        // Show role (category) as a small label above the counts similar to
        // how player tooltips render the name on top.
        formatter: function (this: any) {
          const p = this.point;
          const role = this.point?.category || "";
          const games = Number(p.custom?.games ?? 0);
          const wins = Number(p.custom?.wins ?? 0);
          const losses = Math.max(0, games - wins);
          return (
            `<div style="font-size:12px;color:#64748b;margin-bottom:4px">${role}</div>` +
            `<div style="font-weight:600">${wins}勝 / ${losses}敗</div>`
          );
        },
      },
      series: seriesData,
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

  return (
    <>
      <div className="mb-4 flex items-start gap-6" data-testid="role-legend">
        <div>
          <div className="mb-2 text-xs text-slate-500">役職色</div>
          <div
            className="flex flex-wrap gap-2"
            data-testid="faction-legend"
            aria-label="役職の色"
          >
            {factionLegendItems.map((l: { name: string; color: string }) => (
              <div
                key={l.name}
                className="flex items-center gap-2 rounded-full px-3 py-1 text-sm text-slate-700"
                style={{ backgroundColor: "rgba(15,23,42,0.05)" }}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <span className="font-medium">{l.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs text-slate-500">凡例</div>
          <div
            className="flex items-center gap-2"
            data-testid="winloss-legend"
            aria-label="勝敗の凡例"
          >
            {winLossLegend.map((l: { name: string; color: string }) => (
              <div
                key={l.name}
                className="flex items-center gap-2 rounded-full px-3 py-1 text-sm text-slate-700"
                style={{ backgroundColor: "rgba(15,23,42,0.03)" }}
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full ${
                    l.name.includes("勝利") ? "border border-slate-300" : ""
                  }`}
                  style={{ backgroundColor: l.color }}
                />
                <span className="font-medium">{l.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-3 w-full">
        <div className="grid grid-cols-2 rounded-lg bg-slate-50">
          <div className="border-r border-white px-8 py-2 text-center">
            <span className="text-sm font-semibold text-slate-600">← 勝利</span>
          </div>
          <div className="px-8 py-2 text-center">
            <span className="text-sm font-semibold text-slate-600">敗北 →</span>
          </div>
        </div>
      </div>

      <BaseChart options={options} className={className} />
    </>
  );
}
