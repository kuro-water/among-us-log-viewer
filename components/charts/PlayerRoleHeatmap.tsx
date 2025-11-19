"use client";

import { useMemo } from "react";
import type { HeatmapData } from "../../lib/data-transformers/types";
import { ChartEmptyState } from "./ChartEmptyState";
import { getRoleDisplayName } from "../../lib/role-localization";

interface PlayerRoleHeatmapProps {
  data: HeatmapData;
  className?: string;
}

function getBackgroundColor(value: number | null): string {
  if (value === null) return "bg-slate-100";
  // 0% -> Red (hue 0), 50% -> Yellow (hue 60), 100% -> Green (hue 120)
  const hue = (value / 100) * 120;
  return `hsl(${hue}, 80%, 90%)`; // Light pastel colors
}

function getTextColor(value: number | null): string {
  if (value === null) return "text-slate-400";
  const hue = (value / 100) * 120;
  return `hsl(${hue}, 90%, 25%)`; // Darker text for contrast
}

export function PlayerRoleHeatmap({ data, className }: PlayerRoleHeatmapProps) {
  const { xAxisCategories, yAxisCategories, grid } = useMemo(() => {
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

    return {
      xAxisCategories: xCats,
      yAxisCategories: yCats.map((r) => getRoleDisplayName(r)),
      grid: gridData,
    };
  }, [data]);

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
                {role}
              </td>
              {xAxisCategories.map((_, xIndex) => {
                // grid[yIndex][xIndex] gives us the cell for Role Y and Player X
                const cell = grid[yIndex][xIndex];
                const bgColor = getBackgroundColor(cell?.value ?? null);
                const textColor = getTextColor(cell?.value ?? null);

                return (
                  <td
                    key={`${xIndex}-${yIndex}`}
                    className="p-1"
                  >
                    <div
                      className={`flex h-full min-h-[60px] flex-col items-center justify-center rounded-md p-1 ${
                        cell?.value == null ? "bg-slate-50" : ""
                      }`}
                      style={{
                        backgroundColor:
                          cell?.value != null
                            ? getBackgroundColor(cell.value)
                            : undefined,
                      }}
                    >
                      {cell && cell.playCount > 0 ? (
                        <>
                          <span
                            className="text-lg font-bold"
                            style={{
                              color: getTextColor(cell.value),
                            }}
                          >
                            {cell.value?.toFixed(0)}%
                          </span>
                          <span className="text-xs text-slate-500">
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
