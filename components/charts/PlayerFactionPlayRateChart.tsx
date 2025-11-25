"use client";

import { useMemo } from "react";
import type { TransformerOptions } from "../../lib/data-transformers/types";
import { buildPlayerFactionPlayRateData } from "../../lib/data-transformers/player-faction-playrate";
import { BaseChart } from "./BaseChart";
import COMMON_PIE_PLOT_OPTIONS from "./pieChartStyles";
import { FACTION_COLORS } from "../../lib/role-mapping";
import { getFactionDisplayName } from "../../lib/role-localization";
import type { DisplayMode } from "../dashboard/FilterSection";

interface Props {
  options: TransformerOptions;
  displayMode?: DisplayMode;
  height?: number;
  animationDuration?: number; // ms
  finalInnerSize?: string | number; // e.g. '40%' or '40'
}

export default function PlayerFactionPlayRateChart({
  options,
  displayMode = "percent",
  height = 280,
  animationDuration = 1500,
  finalInnerSize = "36%",
}: Props) {
  const data = useMemo(
    () => buildPlayerFactionPlayRateData(options),
    [options]
  );

  const legendItems = useMemo(() => {
    // Keep the insertion order defined in `FACTION_COLORS`
    return (Object.entries(FACTION_COLORS) as [string, string][]).map(
      ([faction, color]) => ({ faction, color })
    );
  }, []);

  if (!data.rows.length) {
    return (
      <div className="flex items-center justify-center text-sm text-slate-500">
        データがありません
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {legendItems.map(({ faction, color }) => (
          <div
            key={faction}
            className="flex items-center gap-2 rounded-full px-3 py-1 text-sm text-slate-700"
            style={{ backgroundColor: "rgba(15,23,42,0.05)" }}
          >
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium">
              {getFactionDisplayName(faction as any)}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {data.rows.map((row) => {
          const seriesData = row.data.map((d) => ({
            name: getFactionDisplayName(d.faction as any),
            y: displayMode === "percent" ? d.percent : d.count,
            color: d.color,
            custom: {
              percent: d.percent,
              count: d.count,
            },
          }));

          const chartOptions: any = {
            chart: {
              type: "pie",
              height,
              zooming: { type: "xy" },
              panning: { enabled: true, type: "xy" },
              panKey: "shift",
            },
            title: {
              text: row.playerName,
              style: { fontSize: "0.95em", fontWeight: "600" },
            },
            subtitle: {
              text: `${row.totalGames} 試合`,
              style: { fontSize: "0.75em", color: "#64748b" },
            },
            tooltip: {
              useHTML: true,
              headerFormat: "",
              pointFormatter: function (this: any) {
                const percent = this.custom?.percent?.toFixed(1) ?? "0";
                const count = this.custom?.count ?? 0;
                return displayMode === "percent"
                  ? `<b>${this.name}</b>: ${percent}%<br/>(${count}回)`
                  : `<b>${this.name}</b>: ${count}回<br/>(${percent}%)`;
              },
            },
            exporting: {
              enabled: false,
              buttons: {
                contextButton: { enabled: false },
              },
            },
            accessibility: {
              point: { valueSuffix: displayMode === "percent" ? "%" : "回" },
            },
            plotOptions: {
              ...COMMON_PIE_PLOT_OPTIONS,
              pie: {
                ...COMMON_PIE_PLOT_OPTIONS.pie,
                dataLabels: {
                  ...COMMON_PIE_PLOT_OPTIONS.pie?.dataLabels,
                  format:
                    displayMode === "percent"
                      ? "{point.y:.1f}%"
                      : "{point.y}回",
                },
              },
            },
            series: [
              {
                type: "pie",
                name: displayMode === "percent" ? "Percentage" : "Count",
                colorByPoint: true,
                data: seriesData,
                enableMouseTracking: false,
                animation: { duration: animationDuration },
                fanAnimate: true,
                fanInnerSize: finalInnerSize,
              },
            ],
            credits: { enabled: false },
          };

          return <BaseChart key={row.playerUuid} options={chartOptions} />;
        })}
      </div>
    </>
  );
}
