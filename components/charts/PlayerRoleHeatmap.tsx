"use client";

import { useMemo } from "react";
import type { HeatmapData } from "../../lib/data-transformers/types";
import { ChartEmptyState } from "./ChartEmptyState";
import {
  getRoleDisplayName,
  getFactionDisplayName,
} from "../../lib/role-localization";
import { getFactionColorByRole, FACTION_COLORS } from "../../lib/role-mapping";
import { getTextColorForBackground } from "../../lib/heatmap-colors";

interface PlayerRoleHeatmapProps {
  data: HeatmapData;
  className?: string;
}

export function PlayerRoleHeatmap({ data, className }: PlayerRoleHeatmapProps) {
  const { xAxisCategories, yAxisCategories, yAxisRaw, grid } = useMemo(() => {
    const xCats = data.xAxis;
    const yCats = data.yAxis;

    // Create a grid [y][x] -> cell
    const gridData = Array.from({ length: yCats.length }, () =>
      Array.from({ length: xCats.length }, () => null as any)
    );

    data.cells.forEach((cell) => {
      if (
        cell.y >= 0 &&
        cell.y < yCats.length &&
        cell.x >= 0 &&
        cell.x < xCats.length
      ) {
        gridData[cell.y][cell.x] = cell;
      }
    });

    const maxPlay = Math.max(...data.cells.map((c) => c.playCount ?? 0), 0);

    return {
      xAxisCategories: xCats,
      yAxisCategories: yCats.map((r) => getRoleDisplayName(r)),
      yAxisRaw: yCats,
      grid: gridData,
      maxPlayCount: maxPlay,
    };
  }, [data]);

  const legendItems = useMemo(() => {
    return (Object.entries(FACTION_COLORS) as [string, string][]).map(
      ([faction, color]) => ({ faction, color })
    );
  }, []);

  if (xAxisCategories.length === 0 || yAxisCategories.length === 0) {
    return (
      <ChartEmptyState
        className={className}
        message="役職ヒートマップを表示するデータがありません"
      />
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
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
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white p-2 text-left font-semibold text-slate-600 shadow-[1px_0_0_0_#e2e8f0]">
              役職 / プレイヤー
            </th>
            {xAxisCategories.map((player, index) => (
              <th
                key={index}
                className="min-w-[100px] p-2 text-center font-semibold text-slate-600"
              >
                {player}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yAxisCategories.map((role, yIndex) => (
            <tr key={role} className="border-t border-slate-100">
              <td className="sticky left-0 z-10 bg-white p-2 font-medium text-slate-700 shadow-[1px_0_0_0_#e2e8f0]">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: getFactionColorByRole(yAxisRaw[yIndex]),
                    }}
                  />
                  <span>{role}</span>
                </div>
              </td>
              {xAxisCategories.map((_, xIndex) => {
                // grid[yIndex][xIndex] gives us the cell for Role Y and Player X
                const cell = grid[yIndex][xIndex];
                const bgColor = cell?.color ?? "#f8fafc";
                const textColor = getTextColorForBackground(bgColor);

                return (
                  <td key={`${xIndex}-${yIndex}`} className="p-1">
                    <div
                      className={`flex h-full min-h-[60px] flex-col items-center justify-center rounded-md p-1 ${
                        cell?.value == null ? "bg-slate-50" : ""
                      }`}
                      style={{
                        backgroundColor:
                          cell?.value != null ? bgColor : undefined,
                      }}
                    >
                      {cell && cell.playCount > 0 ? (
                        <>
                          <span
                            className="text-lg font-bold"
                            style={
                              textColor === "#ffffff"
                                ? {
                                    color: textColor,
                                    textShadow: "0 1px 2px rgba(2,6,23,0.6)",
                                  }
                                : { color: textColor }
                            }
                          >
                            {cell.value?.toFixed(0)}%
                          </span>
                          <span
                            className="text-xs"
                            style={
                              textColor === "#ffffff"
                                ? {
                                    color: textColor,
                                    opacity: 0.85,
                                    textShadow: "0 1px 2px rgba(2,6,23,0.5)",
                                  }
                                : { color: textColor, opacity: 0.8 }
                            }
                          >
                            {cell.playCount}回
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
