"use client";

import React, { useMemo } from "react";
import type { PlayerWinRateData } from "../../lib/data-transformers/types";
import { formatRatio } from "@/lib/formatters";

interface Props {
  data: PlayerWinRateData;
  className?: string;
}

const ROLE_COLORS: Record<string, string> = {
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

export function PlayerWinRateTable({ data, className }: Props) {
  const rows = data.rows;

  const maxWinRate = useMemo(() => {
    if (!rows || rows.length === 0) return 1;
    return Math.max(...rows.map((r) => r.winRate)) || 1;
  }, [rows]);

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                プレイヤー
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                勝率
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                勝利数
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                敗北数
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                試合数
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                役職寄与
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const totalWins = row.wins || 0;
              const barPercent =
                maxWinRate > 0 ? (row.winRate / maxWinRate) * 100 : 0;
              return (
                <tr key={row.uuid} className="border-t last:border-b">
                  <td className="px-4 py-3 align-top font-medium text-slate-800">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 align-top w-64">
                    <div className="flex items-center gap-3">
                      <div className="w-full">
                        <div className="relative h-6 overflow-hidden rounded-lg bg-slate-100">
                          <div
                            className="absolute left-0 top-0 bottom-0 flex h-full"
                            style={{ width: `${barPercent}%` }}
                          >
                            {row.roles.map((r, i) => {
                              if (totalWins === 0) return null;
                              const roleShare = r.wins / totalWins;
                              const segWidth = roleShare * 100; // percentage of the filled bar
                              const absoluteSegWidth = `${segWidth}%`;
                              const color = ROLE_COLORS[r.role] || "#94a3b8";
                              return (
                                <div
                                  key={r.role + i}
                                  title={`${r.role}: ${(
                                    (r.wins / totalWins) *
                                    row.winRate *
                                    100
                                  ).toFixed(1)}%`}
                                  style={{
                                    width: absoluteSegWidth,
                                    backgroundColor: color,
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="whitespace-nowrap text-xs text-slate-600 w-20 text-right">
                        {formatRatio(row.winRate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">{row.wins}</td>
                  <td className="px-4 py-3 align-top">{row.losses}</td>
                  <td className="px-4 py-3 align-top">{row.games}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      {row.roles.map((r) => {
                        if (totalWins === 0) return null;
                        const absPercent =
                          (r.wins / totalWins) * row.winRate * 100;
                        const color = ROLE_COLORS[r.role] || "#94a3b8";
                        return (
                          <div
                            key={r.role}
                            className="flex items-center gap-2 rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-700"
                          >
                            <span
                              className="inline-block h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-medium">{r.role}</span>
                            <span className="text-slate-500">
                              {absPercent.toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                      {totalWins === 0 ? (
                        <span className="text-xs text-slate-400">
                          勝利データなし
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PlayerWinRateTable;
