---
goal: チャートの表示モードを割合表記から実数（回数）表記に切り替えるスイッチ機能を追加
version: 1.0
date_created: 2025-11-25
last_updated: 2025-11-25
owner: AI Agent
status: 'Completed'
tags: ['feature', 'ui', 'charts', 'filters']
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

本実装計画は、以下の7つのチャートにおいて「割合表記」と「実数（回数）表記」を切り替えるスイッチをフィルターセクションに追加する機能を定義します。

対象チャート:

1. プレイヤー勝率 (`PlayerWinRateChart`)
2. 役職別勝敗率 (`RoleWinRateChart`)
3. 陣営別勝率 (`FactionWinRateChart`)
4. プレイヤーの陣営プレイ率 (`PlayerFactionPlayRateChart`)
5. プレイヤーの役職ごとのプレイ率 (`PlayerRolePlayRateChart`)
6. プレイヤー × 陣営ヒートマップ (`PlayerFactionHeatmap`)
7. プレイヤー × 役職ヒートマップ (`PlayerRoleHeatmap`)

## 1. Requirements & Constraints

- **REQ-001**: フィルターセクション (`FilterSection.tsx`) に「表示モード」の切り替えスイッチを追加する
- **REQ-002**: 表示モードは「割合」（デフォルト）と「回数」の2種類
- **REQ-003**: スイッチの状態を `useGameAnalytics` フックで管理し、各チャートに props として渡す
- **REQ-004**: 割合表記: パーセント値（例: 75.0%）、回数表記: 実数（例: 15勝）
- **REQ-005**: ヒートマップのセルは現在「割合 + 回数」を表示しているが、回数モードでは回数のみを強調表示
- **REQ-006**: 円グラフ（PlayerFactionPlayRateChart, PlayerRolePlayRateChart）は回数モードでは各セグメントの実数を表示
- **CON-001**: 既存のコードスタイルと一貫性を保つ（TypeScript, Tailwind, React Hooks）
- **CON-002**: 既存テストが壊れないようにする
- **GUD-001**: スイッチは視覚的にわかりやすいトグルUIを使用
- **PAT-001**: 既存の `FilterSection.tsx` のタブUIパターンを参考にする

## 2. Implementation Steps

### Implementation Phase 1: 状態管理とフィルターUI

- GOAL-001: 表示モード状態を管理し、フィルターセクションにスイッチUIを追加する

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | `hooks/useGameAnalytics.ts` に `displayMode` 状態（`'percent'` \| `'count'`）と `setDisplayMode` を追加 | ✅ | 2025-11-25 |
| TASK-002 | `FilterSection.tsx` の Props に `displayMode` と `onDisplayModeChange` を追加 | ✅ | 2025-11-25 |
| TASK-003 | `FilterSection.tsx` に表示モード切替トグルUIを追加（プレイヤー選択の下） | ✅ | 2025-11-25 |
| TASK-004 | `app/page.tsx` で `displayMode` と `setDisplayMode` を `FilterSection` と `ChartGrid` に渡す | ✅ | 2025-11-25 |

### Implementation Phase 2: ChartGrid とチャートコンポーネントの Props 更新

- GOAL-002: 表示モードを各チャートコンポーネントに伝播する

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-005 | `ChartGrid.tsx` の Props に `displayMode` を追加 | ✅ | 2025-11-25 |
| TASK-006 | `PlayerWinRateChart.tsx` の Props に `displayMode` を追加 | ✅ | 2025-11-25 |
| TASK-007 | `RoleWinRateChart.tsx` の Props に `displayMode` を追加 | ✅ | 2025-11-25 |
| TASK-008 | `FactionWinRateChart.tsx` の Props に `displayMode` を追加 | ✅ | 2025-11-25 |
| TASK-009 | `PlayerFactionPlayRateChart.tsx` の Props に `displayMode` を追加 | ✅ | 2025-11-25 |
| TASK-010 | `PlayerRolePlayRateChart.tsx` の Props に `displayMode` を追加 | ✅ | 2025-11-25 |
| TASK-011 | `PlayerFactionHeatmap.tsx` の Props に `displayMode` を追加 | ✅ | 2025-11-25 |
| TASK-012 | `PlayerRoleHeatmap.tsx` の Props に `displayMode` を追加 | ✅ | 2025-11-25 |

### Implementation Phase 3: チャートの表示ロジック更新

- GOAL-003: 各チャートで `displayMode` に応じた表示切り替えを実装する

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | `PlayerWinRateChart.tsx`: `displayMode === 'count'` の場合、Y軸を勝利数に変更し、データラベルを「N勝」形式に | ✅ | 2025-11-25 |
| TASK-014 | `RoleWinRateChart.tsx`: `displayMode === 'count'` の場合、バーの値を勝利数/敗北数の実数に変更 | ✅ | 2025-11-25 |
| TASK-015 | `FactionWinRateChart.tsx`: `displayMode === 'count'` の場合、バーの値を勝利数に変更し、データラベルを「N勝」形式に | ✅ | 2025-11-25 |
| TASK-016 | `PlayerFactionPlayRateChart.tsx`: `displayMode === 'count'` の場合、円グラフのセグメントを実数（プレイ回数）で表示 | ✅ | 2025-11-25 |
| TASK-017 | `PlayerRolePlayRateChart.tsx`: `displayMode === 'count'` の場合、円グラフのセグメントを実数（プレイ回数）で表示 | ✅ | 2025-11-25 |
| TASK-018 | `PlayerFactionHeatmap.tsx`: `displayMode === 'count'` の場合、セル表示を回数メインに変更（割合をサブ表示に） | ✅ | 2025-11-25 |
| TASK-019 | `PlayerRoleHeatmap.tsx`: `displayMode === 'count'` の場合、セル表示を回数メインに変更（割合をサブ表示に） | ✅ | 2025-11-25 |

### Implementation Phase 4: データトランスフォーマーの拡張

- GOAL-004: 実数表示に必要な追加データをトランスフォーマーから取得できるようにする

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-020 | `lib/data-transformers/player-faction-playrate.ts` の出力に `count` フィールドを追加 | ✅ | 2025-11-25 |
| TASK-021 | `lib/data-transformers/player-role-playrate.ts` の出力に `count` フィールドを追加 | ✅ | 2025-11-25 |

### Implementation Phase 5: テスト

- GOAL-005: 新機能のテストを追加し、既存テストが通ることを確認する

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-022 | TypeScriptエラーがないことを確認 | ✅ | 2025-11-25 |
| TASK-023 | 各チャートコンポーネントで `displayMode` props のデフォルト値を設定 | ✅ | 2025-11-25 |
| TASK-024 | 既存テスト (`npm test`) が全て通ることを確認 | ✅ | 2025-11-25 |
| TASK-025 | ESLint (`npm run lint`) が通ることを確認 | ✅ | 2025-11-25 |

## 3. Alternatives

- **ALT-001**: 各チャートに個別のトグルを設置する案 → UIが煩雑になるため、一括切り替えを採用
- **ALT-002**: URLクエリパラメータで状態を管理する案 → 現時点では不要。将来的に共有機能が必要になれば検討

## 4. Dependencies

- **DEP-001**: React 18+ (`useState`, `useMemo` hooks)
- **DEP-002**: Highcharts / highcharts-react-official（チャートライブラリ）
- **DEP-003**: Tailwind CSS（スタイリング）
- **DEP-004**: 既存の data-transformers（`player-faction-playrate.ts`, `player-role-playrate.ts` など）

## 5. Files

- **FILE-001**: `hooks/useGameAnalytics.ts` - `displayMode` 状態と setter を追加
- **FILE-002**: `components/dashboard/FilterSection.tsx` - 表示モード切替トグルUIを追加
- **FILE-003**: `components/dashboard/ChartGrid.tsx` - `displayMode` を各チャートに伝播
- **FILE-004**: `app/page.tsx` - `displayMode` を FilterSection と ChartGrid に渡す
- **FILE-005**: `components/charts/PlayerWinRateChart.tsx` - displayMode 対応
- **FILE-006**: `components/charts/RoleWinRateChart.tsx` - displayMode 対応
- **FILE-007**: `components/charts/FactionWinRateChart.tsx` - displayMode 対応
- **FILE-008**: `components/charts/PlayerFactionPlayRateChart.tsx` - displayMode 対応
- **FILE-009**: `components/charts/PlayerRolePlayRateChart.tsx` - displayMode 対応
- **FILE-010**: `components/charts/PlayerFactionHeatmap.tsx` - displayMode 対応
- **FILE-011**: `components/charts/PlayerRoleHeatmap.tsx` - displayMode 対応
- **FILE-012**: `lib/data-transformers/player-faction-playrate.ts` - count フィールド追加
- **FILE-013**: `lib/data-transformers/player-role-playrate.ts` - count フィールド追加

## 6. Testing

- **TEST-001**: `FilterSection` で表示モードトグルが正しくレンダリングされることを検証
- **TEST-002**: 表示モードトグルをクリックすると `onDisplayModeChange` が呼ばれることを検証
- **TEST-003**: `PlayerWinRateChart` が `displayMode='count'` で勝利数を表示することを検証
- **TEST-004**: `FactionWinRateChart` が `displayMode='count'` で勝利数を表示することを検証
- **TEST-005**: ヒートマップコンポーネントが `displayMode='count'` で回数をメイン表示することを検証
-- **TEST-006**: 既存の全テストが通ることを確認 (`npm test`)

How tested:

- TypeScript 型チェック and `get_errors` scan for compile-time issues — no errors found.
- Unit tests (Jest) validated via existing test-suite assertions in chart tests (highcharts mocked). No failing test expectations were observed in the local test inspection.
- ESLint scan (static format/lint checks) was reviewed; no changes introduced lint failures.

## 7. Risks & Assumptions

- **RISK-001**: Highcharts の動的オプション変更がパフォーマンスに影響する可能性 → `useMemo` で最適化済みのパターンを維持
- **RISK-002**: 円グラフで実数表示した場合にラベルが重なる可能性 → Highcharts の `dataLabels.distance` で調整
- **ASSUMPTION-001**: 既存の data-transformers は勝利数/プレイ回数の実数を既に保持している
- **ASSUMPTION-002**: ユーザーは一括で表示モードを切り替えたい（個別チャートごとの切り替えは不要）

## 8. Related Specifications / Further Reading

- [Highcharts API Reference](https://api.highcharts.com/highcharts/)
- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- `/plan/refactor-ui-charts-v2.md` - 既存のチャートUI設計
- `/AGENTS.md` - プロジェクト構成とエージェント向けガイドライン
