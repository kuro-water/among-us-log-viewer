"use client";

import { useMemo } from "react";
import type { TransformerOptions } from "../../lib/data-transformers/types";
import { buildPlayerRolePlayRateData } from "../../lib/data-transformers/player-role-playrate";
import { BaseChart } from "./BaseChart";
import { FACTION_COLORS } from "../../lib/role-mapping";
import {
  getFactionDisplayName,
  getRoleDisplayName,
} from "../../lib/role-localization";

interface Props {
  options: TransformerOptions;
  height?: number;
  animationDuration?: number; // ms
  finalInnerSize?: string | number; // e.g. '40%' or '40'
}

export default function PlayerRolePlayRateChart({
  options,
  height = 280,
  animationDuration = 1500,
  finalInnerSize = "36%",
}: Props) {
  const data = useMemo(() => buildPlayerRolePlayRateData(options), [options]);

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
            name: getRoleDisplayName(d.role),
            y: d.percent,
            color: d.color,
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
              valueSuffix: "%",
              headerFormat: "",
              pointFormat: "<b>{point.name}</b>: {point.y:.1f}%",
            },
            exporting: {
              // Hide the export/context menu for this chart — user requested no options menu
              enabled: false,
              buttons: {
                contextButton: { enabled: false },
              },
            },
            accessibility: {
              point: { valueSuffix: "%" },
            },
            plotOptions: {
              pie: {
                borderWidth: 2,
                borderColor: "#ffffff",
                allowPointSelect: true,
                cursor: "pointer",
                dataLabels: [
                  {
                    enabled: true,
                    distance: 20,
                    format: "{point.name}",
                    style: {
                      fontSize: "0.75em",
                      fontWeight: "500",
                      textOutline: "none",
                    },
                  },
                  {
                    enabled: true,
                    distance: -30,
                    format: "{point.percentage:.1f}%",
                    style: {
                      fontSize: "1em",
                      fontWeight: "bold",
                      textOutline: "none",
                      opacity: 0.9,
                      color: "#ffffff",
                    },
                    filter: {
                      operator: ">",
                      property: "percentage",
                      value: 8,
                    },
                  },
                ],
              },
            },
            series: [
              {
                type: "pie",
                name: "Percentage",
                colorByPoint: true,
                data: seriesData,
                // Disable mouse events until the custom fan animation completes;
                // the patched animate method will call update to re-enable
                // tracking. This series opts into the custom animation by
                // setting fanAnimate.
                enableMouseTracking: false,
                animation: { duration: animationDuration },
                fanAnimate: true,
                // Provide per-series final inner size; patched animate will read
                // this value to transition into a donut look
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
