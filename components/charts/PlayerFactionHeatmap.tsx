"use client";

import { useMemo } from "react";
import type { HeatmapData } from "../../lib/data-transformers/types";
import { ChartEmptyState } from "./ChartEmptyState";
import { getFactionDisplayName } from "../../lib/role-localization";

interface PlayerFactionHeatmapProps {
  data: HeatmapData;
  className?: string;
}

function getBackgroundColor(
  value: number | null,
  playCount: number | undefined,
  maxPlayCount: number
): string {
  if (value === null) return "bg-slate-100";
  // Use win rate to determine hue (red -> yellow -> green) and playCount to
  // determine intensity (lightness). The more plays, the darker the cell.
  const hue = (value / 100) * 120; // 0..120
  const normalized =
    maxPlayCount > 0 && playCount ? Math.min(playCount / maxPlayCount, 1) : 0;
  // Lightness: 92% (few plays) down to 36% (many plays) — darker as playCount grows
  const lightness = 92 - normalized * 56;
  const saturation = 78; // keep vivid colors
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getTextColor(
  value: number | null,
  playCount: number | undefined,
  maxPlayCount: number
): string {
  if (value === null) return "#94a3b8"; // tailwind slate-400
  const hue = (value / 100) * 120;
  const normalized =
    maxPlayCount > 0 && playCount ? Math.min(playCount / maxPlayCount, 1) : 0;
  const lightness = 92 - normalized * 56;
  // If background is dark (lightness low), use white text
  if (lightness < 55) return "#ffffff";
  return `hsl(${hue}, 90%, 25%)`;
}

export function PlayerFactionHeatmap({
  data,
  className,
}: PlayerFactionHeatmapProps) {
  const { xAxisCategories, yAxisCategories, grid, maxPlayCount } =
    useMemo(() => {
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
        yAxisCategories: yCats.map((f) => getFactionDisplayName(f as any)),
        grid: gridData,
        maxPlayCount: maxPlay,
      };
    }, [data]);

  if (xAxisCategories.length === 0 || yAxisCategories.length === 0) {
    return (
      <ChartEmptyState
        className={className}
        message="ヒートマップを表示するデータがありません"
      />
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white p-2 text-left font-semibold text-slate-600 shadow-[1px_0_0_0_#e2e8f0]">
              陣営 / プレイヤー
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
          {yAxisCategories.map((faction, yIndex) => (
            <tr key={faction} className="border-t border-slate-100">
              <td className="sticky left-0 z-10 bg-white p-2 font-medium text-slate-700 shadow-[1px_0_0_0_#e2e8f0]">
                {faction}
              </td>
              {xAxisCategories.map((_, xIndex) => {
                // grid[yIndex][xIndex] gives us the cell for Faction Y and Player X
                const cell = grid[yIndex][xIndex];
                const bgColor = getBackgroundColor(
                  cell?.value ?? null,
                  cell?.playCount,
                  maxPlayCount
                );
                const textColor = getTextColor(
                  cell?.value ?? null,
                  cell?.playCount,
                  maxPlayCount
                );

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
                            style={{
                              color: textColor,
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
