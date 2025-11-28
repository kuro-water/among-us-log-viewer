"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { animate } from "animejs";
import type { PlayerAllStatsData } from "@/lib/data-transformers/types";
import { formatNumber, formatDuration } from "@/lib/formatters";

interface Props {
  data: PlayerAllStatsData;
  className?: string;
}

type MetricKey =
  | "appearances"
  | "wins"
  | "losses"
  | "winRate"
  | "deaths"
  | "kills"
  | "tasksCompleted"
  | "movementDistance"
  | "emergencyButtons"
  | "sabotagesTriggered"
  | "timeAlive";

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "appearances", label: "試合数" },
  { key: "wins", label: "勝利" },
  { key: "losses", label: "敗北" },
  { key: "winRate", label: "勝率" },
  { key: "deaths", label: "死亡" },
  { key: "kills", label: "キル" },
  { key: "tasksCompleted", label: "タスク完了" },
  { key: "movementDistance", label: "移動距離" },
  { key: "emergencyButtons", label: "緊急ボタン" },
  { key: "sabotagesTriggered", label: "妨害" },
  { key: "timeAlive", label: "平均生存時間" },
];

function SortIcon({ direction }: { direction: "none" | "asc" | "desc" }) {
  if (direction === "none") {
    return (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M6 7l4-4 4 4"
          stroke="#9CA3AF"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 13l-4 4-4-4"
          stroke="#9CA3AF"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (direction === "asc") {
    return (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M6 13l4-4 4 4"
          stroke="#111827"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M14 7l-4 4-4-4"
        stroke="#111827"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayerStatsTable({ data, className = "" }: Props) {
  // use the data rows directly via memoization
  // players as rows table (allow sorting by name or metrics)
  type SortKey = MetricKey | "name";
  const [sortMetric, setSortMetric] = useState<SortKey>("appearances");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const players = useMemo(() => (data?.rows ? data.rows.slice() : []), [data]);
  const rowRefs = useRef<Map<string, HTMLTableRowElement | null>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());

  const sortedPlayers = useMemo(() => {
    const arr = players.slice();
    function getMetricValue(row: (typeof arr)[number], key: SortKey) {
      switch (key) {
        case "winRate":
          return row.appearances > 0 ? row.wins / row.appearances : 0;
        case "timeAlive":
          return row.appearances > 0 ? row.timeAlive / row.appearances : 0;
        case "name":
          // name sorting will be handled in comparator with string compare
          return 0;
        default:
          return (row as any)[key] ?? 0;
      }
    }

    arr.sort((a, b) => {
      if (sortMetric === "name") {
        const cmp = a.name.localeCompare(b.name, "ja");
        return sortDirection === "desc" ? cmp * -1 : cmp;
      }

      const va = getMetricValue(a, sortMetric);
      const vb = getMetricValue(b, sortMetric);
      const diff = va - vb;
      if (diff === 0) {
        // stable tiebreaker: name asc
        return a.name.localeCompare(b.name, "ja");
      }
      return sortDirection === "desc" ? diff * -1 : diff;
    });
    return arr;
  }, [players, sortMetric, sortDirection]);

  function toggleDirection() {
    setSortDirection((d) => (d === "desc" ? "asc" : "desc"));
  }

  function captureRects() {
    const rects = new Map<string, DOMRect>();
    // use refs if present
    if (rowRefs.current.size > 0) {
      rowRefs.current.forEach((el, id) => {
        if (el) rects.set(id, el.getBoundingClientRect());
      });
    } else {
      // fallback to scan the DOM for rows with data-uuid
      document.querySelectorAll("tr[data-uuid]").forEach((r) => {
        const id = (r as HTMLElement).dataset.uuid as string;
        rects.set(id, (r as HTMLElement).getBoundingClientRect());
      });
    }
    prevRectsRef.current = rects;
    // expose for tests/debugging
    // no test-only globals
  }

  useEffect(() => {
    // FLIP animation: if we have previous rects captured, animate from old->new
    if (prevRectsRef.current.size === 0) return;
    // FLIP effect: animate moved rows from previous rects to current position

    const finishedAnimations: Array<Promise<unknown>> = [];
    if (rowRefs.current.size > 0) {
      rowRefs.current.forEach((el, id) => {
        const before = prevRectsRef.current.get(id);
        const after = el?.getBoundingClientRect();
        // debug positions here
        if (!el || !before || !after) return;
        const dy = before.top - after.top;
        // delta computed
        if (dy === 0) return;
        // Apply inverse transform immediately
        el.style.transform = `translateY(${dy}px)`;
        el.style.willChange = "transform";
        // animate back to 0

        const animation = animate(el, {
          translateY: [dy, 0],
          duration: 350,
          easing: "easeOutQuad",
        });
        // cleanup after animation completes (using Promise)
        const cleanup = (animation as any).completed?.then?.(() => {
          el.style.transform = "";
          el.style.willChange = "";
        });
        finishedAnimations.push(cleanup ?? Promise.resolve());
      });
    } else {
      document.querySelectorAll("tr[data-uuid]").forEach((r) => {
        const el = r as HTMLElement;
        const id = el.dataset.uuid as string;
        const before = prevRectsRef.current.get(id);
        const after = el.getBoundingClientRect();
        if (!before || !after) return;
        const dy = before.top - after.top;
        if (dy === 0) return;
        el.style.transform = `translateY(${dy}px)`;
        el.style.willChange = "transform";

        const animation = animate(el, {
          translateY: [dy, 0],
          duration: 350,
          easing: "easeOutQuad",
        });
        const cleanup = (animation as any).completed?.then?.(() => {
          el.style.transform = "";
          el.style.willChange = "";
        });
        finishedAnimations.push(cleanup ?? Promise.resolve());
      });
    }

    // Clear stored rects after processing
    if (finishedAnimations.length > 0) {
      Promise.all(finishedAnimations).then(() => prevRectsRef.current.clear());
    } else {
      // If no element animated (e.g. all dy === 0), fallback: small container animation
      if (containerRef.current) {
        animate(containerRef.current, {
          opacity: [0.95, 1],
          translateY: [4, 0],
          duration: 200,
          easing: "easeOutQuad",
        });
      }
      prevRectsRef.current.clear();
    }
  }, [sortedPlayers]);

  return (
    <div
      ref={containerRef}
      className={`overflow-x-auto ${className}`}
      data-testid="player-stats-table"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-100">
        <div className="text-sm text-slate-500">
          列ヘッダーをクリックして並び替えます
        </div>
        <div className="text-sm text-slate-500">
          現在:{" "}
          {sortMetric === "name"
            ? "名前"
            : METRICS.find((m) => m.key === sortMetric)?.label}{" "}
          ({sortDirection === "desc" ? "降順" : "昇順"})
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-4">
        <table className="min-w-[760px] w-full table-auto text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600">
                <button
                  aria-label="sort-name"
                  onClick={() => {
                    // capture positions for FLIP animation
                    captureRects();
                    if (sortMetric === "name") toggleDirection();
                    else setSortMetric("name");
                  }}
                  className="inline-flex items-center gap-2"
                >
                  プレイヤー
                  <SortIcon
                    direction={
                      sortMetric === "name"
                        ? sortDirection === "desc"
                          ? "desc"
                          : "asc"
                        : "none"
                    }
                  />
                </button>
              </th>
              {METRICS.map((metric) => (
                <th
                  key={metric.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-600"
                >
                  <button
                    aria-label={`sort-${metric.key}`}
                    onClick={() => {
                      // capture positions for FLIP animation
                      captureRects();
                      if (sortMetric === metric.key) toggleDirection();
                      else {
                        setSortMetric(metric.key);
                        setSortDirection("desc");
                      }
                    }}
                    className="inline-flex items-center gap-2"
                  >
                    {metric.label}
                    <SortIcon
                      direction={
                        sortMetric === metric.key
                          ? sortDirection === "desc"
                            ? "desc"
                            : "asc"
                          : "none"
                      }
                    />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((p) => (
              <tr
                data-uuid={p.uuid}
                ref={(el) => {
                  if (el) rowRefs.current.set(p.uuid, el);
                  else rowRefs.current.delete(p.uuid);
                }}
                key={p.uuid}
                className="border-t last:border-b hover:bg-slate-50"
              >
                <td className="px-4 py-3 align-top font-medium text-slate-800">
                  {p.name}
                </td>
                {METRICS.map((metric) => {
                  let val: React.ReactNode = "-";
                  switch (metric.key) {
                    case "appearances":
                      val = p.appearances;
                      break;
                    case "wins":
                      val = p.wins;
                      break;
                    case "losses":
                      val = p.losses;
                      break;
                    case "winRate":
                      val =
                        p.appearances > 0
                          ? `${((p.wins / p.appearances) * 100).toFixed(1)}%`
                          : "-";
                      break;
                    case "deaths":
                      val = p.deaths;
                      break;
                    case "kills":
                      val = p.kills;
                      break;
                    case "tasksCompleted":
                      val = p.tasksCompleted;
                      break;
                    case "movementDistance":
                      val = formatNumber(p.movementDistance);
                      break;
                    case "emergencyButtons":
                      val = p.emergencyButtons;
                      break;
                    case "sabotagesTriggered":
                      val = p.sabotagesTriggered;
                      break;
                    case "timeAlive":
                      val =
                        p.appearances > 0
                          ? formatDuration(
                              Math.round(p.timeAlive / p.appearances)
                            )
                          : "-";
                      break;
                    default:
                      val = "-";
                  }
                  return (
                    <td
                      key={p.uuid + metric.key}
                      className="px-4 py-3 align-top text-slate-700 text-right"
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PlayerStatsTable;
