---
goal: 移動距離×イベントチャートを1試合ごとに表示し、試合切り替えボタンとAnime.jsによる並べ替えアニメーションを追加
version: 1.0
date_created: 2025-11-28
last_updated: 2025-11-28
owner: AI Agent
status: 'Completed'
tags: ['feature', 'ui', 'charts', 'animation', 'animejs']
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

本実装計画は「移動距離 × イベント」チャート (`MovementWithEventsChart`) を1試合ごとに表示する機能を実装します。現在は全試合を集約して表示していますが、これを個別試合ごとに切り替え可能にし、カード内に試合切り替えボタンを配置します。

また、テーブル（プレイヤー一覧や凡例など）の並べ替え時に [Anime.js](https://animejs.com/documentation/animatable/) を使用したスムーズなアニメーションを追加します。

## 主な変更点

1. **試合切り替え機能**: カード内に試合選択ボタンを配置し、1試合ずつ表示を切り替え可能にする
2. **データトランスフォーマーの拡張**: 全試合データを保持し、選択された試合のデータを返すように変更
3. **Anime.js 導入**: 並べ替えアニメーションのためにAnime.js (v4) を導入
4. **アニメーション実装**: プレイヤーリスト/凡例の並べ替え時にスムーズな位置遷移アニメーションを追加

## 1. Requirements & Constraints

- **REQ-001**: `MovementWithEventsChart` コンポーネント内に試合切り替えボタンを配置する
- **REQ-002**: 試合切り替えボタンは前後移動（◀ ▶）または試合一覧ドロップダウンで実装する
- **REQ-003**: 各試合のメタデータ（マップ名、開始時刻、プレイ人数）を表示する
- **REQ-004**: 試合がない場合は適切な空状態を表示する
- **REQ-005**: 選択中の試合インデックスをコンポーネントローカル状態で管理する
- **REQ-006**: Anime.js v4 を使用してプレイヤー凡例の並べ替えアニメーションを実装する
- **REQ-007**: アニメーションは300ms程度のイージング（easeOutExpo等）で実装する
- **CON-001**: 既存のコードスタイルと一貫性を保つ（TypeScript, Tailwind, React Hooks）
- **CON-002**: 既存テストが壊れないようにする
- **CON-003**: Anime.js はクライアントサイドのみで動作するため、`'use client'` ディレクティブを確認する
- **GUD-001**: 試合切り替えUIは直感的でレスポンシブなデザインにする
- **GUD-002**: アニメーションは過度に派手にせず、UXを向上させる程度に抑える
- **PAT-001**: 既存の `ChartCard` の `actions` スロットを使用してUIを配置する

## 2. Implementation Steps

### Implementation Phase 1: Anime.js のインストールと設定

- GOAL-001: Anime.js v4 をプロジェクトに導入する

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | `npm install animejs` でAnime.js v4をインストール | | |
| TASK-002 | `@types/animejs` がない場合は型定義ファイル `types/animejs.d.ts` を作成 | | |
| TASK-003 | Anime.js のインポートが正しく動作することを確認 | | |

### Implementation Phase 2: データトランスフォーマーの拡張

- GOAL-002: 全試合のデータを保持し、試合ごとにアクセスできるようにする

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-004 | `lib/data-transformers/types.ts` に `MovementWithEventsGameData` 型を追加（試合メタデータ + 既存データ） | | |
| TASK-005 | `lib/data-transformers/types.ts` に `MovementWithEventsAllGamesData` 型を追加（全試合配列） | | |
| TASK-006 | `lib/data-transformers/movement-with-events.ts` に `buildMovementWithEventsAllGamesData()` 関数を追加 | | |
| TASK-007 | 既存の `buildMovementWithEventsData()` は後方互換性のため維持（内部で新関数を呼び出す） | | |
| TASK-008 | `lib/data-transformers/index.ts` にエクスポートを追加 | | |

### Implementation Phase 3: Hooks とデータフローの更新

- GOAL-003: 全試合データをコンポーネントに渡すようにする

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-009 | `hooks/useGameAnalytics.ts` の `AnalyticsPayload` に `movementWithEventsAllGames` を追加 | | |
| TASK-010 | `hooks/useGameAnalytics.ts` で `buildMovementWithEventsAllGamesData()` を呼び出す | | |
| TASK-011 | `components/dashboard/ChartGrid.tsx` の `AnalyticsPayload` 型を更新 | | |
| TASK-012 | `MovementWithEventsChart` に `allGamesData` props を追加して渡す | | |

### Implementation Phase 4: MovementWithEventsChart の試合切り替えUI

- GOAL-004: コンポーネント内に試合切り替えボタンを実装する

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | `MovementWithEventsChart` に `currentGameIndex` ローカル状態を追加 | | |
| TASK-014 | 試合切り替えナビゲーション（◀ ▶ ボタン）を実装 | | |
| TASK-015 | 現在の試合情報（マップ名、開始時刻、プレイ人数、n/N形式）を表示 | | |
| TASK-016 | 試合がない場合の空状態ハンドリングを更新 | | |
| TASK-017 | 試合切り替え時にチャートデータを切り替える | | |

### Implementation Phase 5: Anime.js による並べ替えアニメーション

- GOAL-005: プレイヤー凡例の並べ替え時にアニメーションを追加する

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-018 | `components/charts/AnimatedLegend.tsx` コンポーネントを作成 | | |
| TASK-019 | Anime.js の `animate()` を使用して要素の位置遷移をアニメーション | | |
| TASK-020 | プレイヤー凡例を `AnimatedLegend` で実装（移動距離順でソート可能） | | |
| TASK-021 | 試合切り替え時のデータ遷移にフェードイン/アウトアニメーションを追加 | | |
| TASK-022 | アニメーションのイージングとdurationを調整（300ms, easeOutExpo） | | |

### Implementation Phase 6: ChartCard 統合とスタイリング

- GOAL-006: ChartCard の actions スロットを使用してUIを統合する

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-023 | `ChartGrid.tsx` で `MovementWithEventsChart` を含む `ChartCard` の `actions` に試合切り替えUIを配置 | | |
| TASK-024 | または `MovementWithEventsChart` 内部にナビゲーションUIを配置（自己完結型） | | |
| TASK-025 | レスポンシブデザインの調整（モバイル/デスクトップ） | | |
| TASK-026 | Tailwind を使用したスタイリング（ボタン、ラベル、スペーシング） | | |

### Implementation Phase 7: テストと品質保証

- GOAL-007: 新機能のテストを追加し、既存テストが通ることを確認する

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-027 | `MovementWithEventsChart` の新しいprops/状態に対するユニットテストを追加 | | |
| TASK-028 | `buildMovementWithEventsAllGamesData()` のユニットテストを追加 | | |
| TASK-029 | Anime.js モックを `__mocks__/animejs.ts` に作成（Jestテスト用） | | |
| TASK-030 | TypeScriptエラーがないことを確認 | | |
| TASK-031 | 既存テスト (`npm test`) が全て通ることを確認 | | |
| TASK-032 | ESLint (`npm run lint`) が通ることを確認 | | |

## 3. Alternatives

- **ALT-001**: 試合切り替えをドロップダウンで実装する案 → 試合数が多い場合に有効だが、少数の場合は◀▶ボタンの方が直感的
- **ALT-002**: GSAPを使用する案 → 既にGSAPがインストール済みだが、ユーザー指定によりAnime.jsを採用
- **ALT-003**: フィルターセクションで試合を選択する案 → 他のチャートにも影響するため、このチャート専用のローカル状態で管理
- **ALT-004**: CSS transitionsのみでアニメーション実装 → 複雑な並べ替えアニメーションには不十分

## 4. Dependencies

- **DEP-001**: `animejs` v4 (npm package) - 並べ替えアニメーション用
- **DEP-002**: React 19+ (`useState`, `useMemo`, `useRef`, `useEffect` hooks)
- **DEP-003**: Highcharts / highcharts-react-official（チャートライブラリ）
- **DEP-004**: Tailwind CSS（スタイリング）
- **DEP-005**: 既存の data-transformers infrastructure

## 5. Files

- **FILE-001**: `package.json` - `animejs` 依存関係を追加
- **FILE-002**: `types/animejs.d.ts` - Anime.js の型定義（必要な場合）
- **FILE-003**: `lib/data-transformers/types.ts` - `MovementWithEventsGameData`, `MovementWithEventsAllGamesData` 型を追加
- **FILE-004**: `lib/data-transformers/movement-with-events.ts` - `buildMovementWithEventsAllGamesData()` 関数を追加
- **FILE-005**: `lib/data-transformers/index.ts` - 新関数のエクスポート
- **FILE-006**: `hooks/useGameAnalytics.ts` - `movementWithEventsAllGames` を AnalyticsPayload に追加
- **FILE-007**: `components/dashboard/ChartGrid.tsx` - 新しいデータを `MovementWithEventsChart` に渡す
- **FILE-008**: `components/charts/MovementWithEventsChart.tsx` - 試合切り替えUI、ローカル状態、アニメーション実装
- **FILE-009**: `components/charts/AnimatedLegend.tsx` - Anime.js を使用した凡例アニメーションコンポーネント（新規）
- **FILE-010**: `__mocks__/animejs.ts` - Jest テスト用 Anime.js モック（新規）
- **FILE-011**: `components/charts/MovementWithEventsChart.test.tsx` - ユニットテスト（新規）
- **FILE-012**: `lib/data-transformers/movement-with-events.test.ts` - トランスフォーマーテスト（新規）

## 6. Testing

- **TEST-001**: `buildMovementWithEventsAllGamesData()` が全試合のデータを正しく返すことを検証
- **TEST-002**: `buildMovementWithEventsAllGamesData()` がフィルター適用時に正しく動作することを検証
- **TEST-003**: `MovementWithEventsChart` が試合切り替え時にデータを正しく更新することを検証
- **TEST-004**: 試合がない場合に空状態が表示されることを検証
- **TEST-005**: `AnimatedLegend` がソート変更時にアニメーションをトリガーすることを検証（モック使用）
- **TEST-006**: 既存の全テストが通ることを確認 (`npm test`)
- **TEST-007**: ESLint が通ることを確認 (`npm run lint`)

## 7. Risks & Assumptions

- **RISK-001**: Anime.js v4 が React 19 + Next.js 16 環境で正しく動作しない可能性 → 事前に小規模テストで確認
- **RISK-002**: 試合数が多い場合にナビゲーションが煩雑になる可能性 → 将来的にドロップダウンへの切り替えを検討
- **RISK-003**: アニメーションがパフォーマンスに影響する可能性 → `will-change` や `transform` を使用し、リペイントを最小化
- **RISK-004**: SSR 時に Anime.js がエラーを起こす可能性 → `'use client'` ディレクティブで回避済み
- **ASSUMPTION-001**: 試合データには必ずマップ名、開始時刻、プレイヤー数が含まれている
- **ASSUMPTION-002**: 1試合あたりのプレイヤー数は10人程度であり、凡例の並べ替えアニメーションは軽量
- **ASSUMPTION-003**: Anime.js の `animate()` API は安定しており、将来のバージョンでも互換性がある

## 8. Related Specifications / Further Reading

- [Anime.js Documentation](https://animejs.com/documentation/)
- [Anime.js Animatable API](https://animejs.com/documentation/animatable/)
- [Anime.js GitHub - Migration Guide v3 to v4](https://github.com/juliangarnier/anime/wiki/Migrating-from-v3-to-v4)
- [plan/feature-display-mode-switch-1.md](./feature-display-mode-switch-1.md) - 関連する表示モード切替機能の実装計画
