---
goal: Remove Player Radar, update Game Duration chart, Role Performance metric, and fix UI issues
version: 1.0
date_created: 2025-11-21
status: 'Planned'
tags: [refactor, ui, charts]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan outlines the steps to remove the deprecated "Player Radar" feature, update the "Game Duration" chart to an Area chart with a new name, change the "Role Performance" metric to Task Completion Rate, and fix several UI issues including missing titles, axis labels, heatmap colors, and scrolling.

## 1. Requirements & Constraints

- **REQ-001**: Remove "Player Radar" chart and all associated code (components, transformers, types).
- **REQ-002**: Rename "Game Duration Histogram" to "Game Duration Distribution" (試合時間分布).
- **REQ-003**: Change "Game Duration" chart type to Area chart (X: Time in minutes, Y: Game count).
- **REQ-004**: Update "Role Performance" chart to display "Task Completion Rate" instead of "Average Tasks".
- **REQ-005**: Add missing title and description to "Role Win Rate" chart card.
- **REQ-006**: Fix "Role Win Rate" and "Faction Win Rate" X-axis labels (100% cutoff).
- **REQ-007**: Update Heatmap colors to use vivid faction colors (Crewmate, Impostor, etc.).
- **REQ-008**: Fix vertical scrolling issue in Heatmap cards.

## 2. Implementation Steps

### Implementation Phase 1: Remove Player Radar

- GOAL-001: Remove the deprecated Player Radar feature to clean up the codebase.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Delete `components/charts/PlayerRadarChart.tsx`. | | |
| TASK-002 | Delete `lib/data-transformers/player-radar.ts`. | | |
| TASK-003 | Remove `PlayerRadarChart` import and usage from `components/dashboard/ChartGrid.tsx`. | | |
| TASK-004 | Remove `buildPlayerRadarData` import and usage from `hooks/useGameAnalytics.ts`. | | |
| TASK-005 | Remove `player-radar` export from `lib/data-transformers/index.ts` and `PlayerRadarData` type from `lib/data-transformers/types.ts`. | | |

### Implementation Phase 2: Update Game Duration Chart

- GOAL-002: Transform Game Duration chart into an Area chart showing distribution.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | Update `lib/data-transformers/game-duration.ts` to calculate distribution bins (minute intervals) and return `{ bins: { minute: number, count: number }[] }`. Update `GameDurationData` type in `lib/data-transformers/types.ts`. | | |
| TASK-007 | Update `components/charts/GameDurationChart.tsx` to use `area` chart type and render the binned data. | | |
| TASK-008 | Rename chart title to "試合時間分布" in `components/dashboard/ChartGrid.tsx`. | | |

### Implementation Phase 3: Update Role Performance Chart

- GOAL-003: Change performance metric to Task Completion Rate.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-009 | Update `lib/data-transformers/role-performance.ts` to calculate `taskCompletionRate` (total tasks completed / total tasks assigned) instead of `avgTasks`. | | |
| TASK-010 | Update `components/charts/RolePerformanceChart.tsx` to display "Task Completion Rate" (percentage) in tooltip and axis. | | |

### Implementation Phase 4: UI Fixes & Improvements

- GOAL-004: Fix visual bugs and improve heatmap readability.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-011 | Add `title="役職別勝率"` and `description` to the Role Win Rate `ChartCard` in `components/dashboard/ChartGrid.tsx`. | | |
| TASK-012 | Update `components/charts/RoleWinRateChart.tsx` and `components/charts/FactionWinRateChart.tsx` to increase `yAxis.max` (e.g., 105) or adjust margins to prevent 100% label cutoff. | | |
| TASK-013 | Update `lib/heatmap-colors.ts` to use vivid faction colors from `config/factions.ts` for the heatmap cells. | | |
| TASK-014 | Adjust `ChartCard` height or chart container styles in `components/dashboard/ChartGrid.tsx` (or `components/charts/PlayerFactionHeatmap.tsx` / `PlayerRoleHeatmap.tsx`) to prevent vertical scrolling. | | |

## 3. Alternatives

- **ALT-001**: For Game Duration, we could keep using Histogram series but style it differently. However, Area chart was explicitly requested.
- **ALT-002**: For Heatmap colors, we could use a completely new palette, but reusing Faction colors provides consistency.

## 4. Dependencies

- **DEP-001**: `highcharts` and `highcharts-react-official` for chart rendering.
- **DEP-002**: `config/factions.ts` for color definitions.

## 5. Files

- `components/charts/PlayerRadarChart.tsx` (Delete)
- `lib/data-transformers/player-radar.ts` (Delete)
- `components/dashboard/ChartGrid.tsx`
- `hooks/useGameAnalytics.ts`
- `lib/data-transformers/index.ts`
- `lib/data-transformers/types.ts`
- `lib/data-transformers/game-duration.ts`
- `components/charts/GameDurationChart.tsx`
- `lib/data-transformers/role-performance.ts`
- `components/charts/RolePerformanceChart.tsx`
- `components/charts/RoleWinRateChart.tsx`
- `components/charts/FactionWinRateChart.tsx`
- `lib/heatmap-colors.ts`
- `components/charts/PlayerFactionHeatmap.tsx`
- `components/charts/PlayerRoleHeatmap.tsx`

## 6. Testing

- **TEST-001**: Verify Player Radar is gone and no errors in console.
- **TEST-002**: Verify Game Duration chart is an Area chart showing correct distribution.
- **TEST-003**: Verify Role Performance shows Task Completion Rate %.
- **TEST-004**: Verify Role Win Rate has title and 100% label is visible.
- **TEST-005**: Verify Heatmap colors are vivid and match faction themes.
- **TEST-006**: Verify no vertical scroll in Heatmap cards.

## 7. Risks & Assumptions

- **RISK-001**: Task total might be 0 for some roles (Impostor), need to handle division by zero for Task Completion Rate.
- **ASSUMPTION-001**: `tasks_total` is available and reliable in the game logs.

## 8. Related Specifications / Further Reading

- `config/factions.ts` for color reference.
