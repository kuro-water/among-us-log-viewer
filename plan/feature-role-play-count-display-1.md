---
goal: 役職別勝敗率チャートの Y 軸ラベルに各役職のプレイ回数を表示する
version: 1.0
date_created: 2025-11-25
last_updated: 2025-11-25
owner: AI Agent
status: 'Completed'
tags: ['feature', 'ui', 'charts', 'role-win-rate']
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

本実装計画は、役職別勝敗率チャート (`RoleWinRateChart`) において、各役職が何回プレイされたかを Y 軸ラベルに表示する機能を追加します。

## 現状の問題

- 役職別勝敗率チャートでは、各役職の勝敗比率はバーで表示されている
- しかし、その役職が全体で何回プレイされたかは **ツールチップでしか確認できない**
- ユーザーは役職名と合わせてプレイ回数を一目で確認したい

## 解決策

Y 軸のカテゴリラベル（役職名）にプレイ回数を括弧付きで追加表示する。

例：

- 現在: `クルーメイト`

- 変更後: `クルーメイト (15)`

## 1. Requirements & Constraints

- **REQ-001**: 役職別勝敗率チャートの Y 軸ラベルに各役職のプレイ回数を表示する
- **REQ-002**: 表示形式は `役職名 (回数)` の形式
- **CON-001**: 既存の `displayMode` 切替機能に影響を与えない
- **CON-002**: チャートのレイアウトやスタイルの一貫性を保つ
- **GUD-001**: 回数は見やすいフォントサイズで表示する

## 2. Implementation Steps

### Implementation Phase 1: Y 軸ラベルの修正

- GOAL-001: Y 軸ラベルに役職のプレイ回数を追加する

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | `categories` の生成ロジックを修正し、役職名に加えてプレイ回数を含める | ✅ | 2025-11-25 |
| TASK-002 | 必要に応じて Y 軸ラベルの幅を調整 | ✅ (不要) | 2025-11-25 |
| TASK-003 | 変更が正しく表示されることを確認 | ✅ | 2025-11-25 |

## 3. Technical Details

### 変更対象ファイル

| File | Changes |
|------|---------|
| `components/charts/RoleWinRateChart.tsx` | `categories` の生成で役職名にプレイ回数を追加 |

### コード変更の詳細

現在の `categories` 生成:

```typescript
const categories = sorted.map((row) => getRoleDisplayName(row.role));
```

変更後:

```typescript
const categories = sorted.map((row) => `${getRoleDisplayName(row.role)} (${row.games})`);
```

## 4. Verification

- [x] ローカル開発サーバーで役職別勝敗率チャートを確認
- [x] Y 軸ラベルに役職名とプレイ回数が表示されていること
- [x] `npm run lint` がエラーなく通ること
- [x] `npm test` が通ること（既存テストに影響がないこと）

## 5. Rollback Plan

変更は `RoleWinRateChart.tsx` の 1 行のみであり、元の行に戻すだけでロールバック可能。

## Appendix

### 参考: RolePerformanceRow 型定義

```typescript
export interface RolePerformanceRow {
  role: string;
  faction: Faction;
  games: number;  // ← この値を使用
  wins?: number;
  winRate: number;
  taskCompletionRate: number;
  avgTimeAlive: number;
}
```
