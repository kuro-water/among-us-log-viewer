---
goal: スキーマ v2.1.0 対応と後方互換性の維持
version: 1.0
date_created: 2025-11-28
last_updated: 2025-11-28
owner: AI Agent
status: Completed
tags: ['feature', 'schema', 'compatibility', 'data']
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

本実装計画は、ゲームログスキーマ v2.1.0 で追加された新しいフィールドへの対応と、v2.0.0 との後方互換性を維持するためのコード変更を定義します。同一の JSONL ファイル内に v2.0.0 と v2.1.0 のデータが混在する可能性があるため、各ゲームログのスキーマバージョンに応じた適切な処理が必要です。

## v2.1.0 で追加されたフィールド

### `players.data[*].counters` セクション

| フィールド | 型 | 説明 |
|------------|------|------|
| `sabotages_fixed` | int | サボタージュ修理回数 |
| `vent_moves` | int | ベント移動回数 |
| `door_closes` | int | ドア閉鎖回数 |
| `admin_use_seconds` | float | アドミン使用時間（秒） |
| `vital_use_seconds` | float | バイタル使用時間（秒） |
| `camera_use_seconds` | float | カメラ/ログ使用時間（秒） |

### `analytics` セクション

| フィールド | 型 | 説明 |
|------------|------|------|
| `per_player_vent_moves` | dict | プレイヤーごとのベント移動回数 |
| `per_player_door_closes` | dict | プレイヤーごとのドア閉鎖回数 |
| `per_player_sabotages_fixed` | dict | プレイヤーごとのサボタージュ修理回数 |
| `per_player_admin_use` | dict | プレイヤーごとのアドミン使用時間 |
| `per_player_vital_use` | dict | プレイヤーごとのバイタル使用時間 |
| `per_player_camera_use` | dict | プレイヤーごとのカメラ使用時間 |

### 新規タイムラインイベントタイプ

| イベントタイプ | カテゴリ | 説明 |
|----------------|----------|------|
| `VentMove` | `Movement` | ベント間移動イベント |
| `DoorClose` | `Sabotage` | ドア閉鎖イベント |
| `SabotageFix` | `Task` | サボタージュ修理完了イベント |

## 1. Requirements & Constraints

- **REQ-001**: `types/game-data.types.ts` に新しいフィールドをオプショナルとして追加
- **REQ-002**: `PlayerCounters` インターフェースに `sabotages_fixed`, `vent_moves`, `door_closes`, `admin_use_seconds`, `vital_use_seconds`, `camera_use_seconds` を追加
- **REQ-003**: `GameAnalytics` インターフェースに `per_player_vent_moves`, `per_player_door_closes`, `per_player_sabotages_fixed`, `per_player_admin_use`, `per_player_vital_use`, `per_player_camera_use` を追加
- **REQ-004**: v2.0.0 データでも正常に動作するようにデフォルト値（0）を使用
- **REQ-005**: `PlayerStatsTable` に新しい統計項目（サボタージュ修理、ベント移動、ドア閉鎖、監視機器使用時間）を追加
- **REQ-006**: 新しいタイムラインイベントタイプ（VentMove, DoorClose, SabotageFix）をイベント密度チャートで処理
- **REQ-007**: 移動×イベントチャートで新イベントタイプを可視化
- **CON-001**: 既存のテストが壊れないようにする（後方互換性）
- **CON-002**: 既存のコードスタイルと一貫性を保つ
- **GUD-001**: 新フィールドが存在しない場合は 0 として扱う（Nullish Coalescing）
- **PAT-001**: 既存の `PlayerAggregate` パターンを拡張

## 2. Implementation Steps

### Implementation Phase 1: 型定義の更新

- GOAL-001: スキーマ v2.1.0 の新フィールドを型定義に追加

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | `types/game-data.types.ts` の `PlayerCounters` に `sabotages_fixed?: number`, `vent_moves?: number`, `door_closes?: number`, `admin_use_seconds?: number`, `vital_use_seconds?: number`, `camera_use_seconds?: number` を追加 | | |
| TASK-002 | `types/game-data.types.ts` の `GameAnalytics` に `per_player_vent_moves?: Record<string, number>`, `per_player_door_closes?: Record<string, number>`, `per_player_sabotages_fixed?: Record<string, number>`, `per_player_admin_use?: Record<string, number>`, `per_player_vital_use?: Record<string, number>`, `per_player_camera_use?: Record<string, number>` を追加 | | |
| TASK-003 | `types/game-data.types.ts` の `EventTimelineEntry` に `from_vent_id?: number`, `to_vent_id?: number`, `room_type?: string` を追加 | | |

### Implementation Phase 2: データ変換層の更新

- GOAL-002: 新フィールドを集計ロジックに追加し、後方互換性を維持

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-004 | `lib/data-transformers/types.ts` の `PlayerAllStatsRow` に `sabotagesFix: number`, `ventMoves: number`, `doorCloses: number`, `adminUseSeconds: number`, `vitalUseSeconds: number`, `cameraUseSeconds: number` を追加 | | |
| TASK-005 | `lib/data-transformers/utils.ts` の `PlayerAggregate` に新フィールドを追加し、集計ロジックを更新（Nullish Coalescing で 0 をデフォルト値に） | | |
| TASK-006 | `lib/data-transformers/player-all-stats.ts` を更新し、新フィールドを `PlayerAllStatsRow` にマッピング | | |

### Implementation Phase 3: イベント処理の更新

- GOAL-003: 新しいタイムラインイベントタイプを処理

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | `lib/event-icons.ts` に `VentMove`, `DoorClose`, `SabotageFix` イベントのビジュアル設定を追加 | | |
| TASK-008 | `lib/data-transformers/event-density.ts` に新イベントタイプが含まれるように確認（既存のカテゴリベース処理で対応済みか確認） | | |
| TASK-009 | `lib/data-transformers/movement-with-events.ts` の `INTERESTING_EVENTS` に `VentMove`, `DoorClose`, `SabotageFix` を追加 | | |

### Implementation Phase 4: UI コンポーネントの更新

- GOAL-004: PlayerStatsTable に新しい統計列を追加

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-010 | `components/charts/PlayerStatsTable.tsx` の `METRICS` 配列に新しいメトリクスを追加（サボタージュ修理、ベント移動、ドア閉鎖、アドミン使用時間、バイタル使用時間、カメラ使用時間） | | |
| TASK-011 | `components/charts/PlayerStatsTable.tsx` のレンダリングロジックを更新し、新しい列を表示 | | |
| TASK-012 | 監視機器使用時間のフォーマッタを追加（`formatDuration` を使用） | | |

### Implementation Phase 5: サンプルデータの更新

- GOAL-005: サンプル JSONL に v2.1.0 形式のデータを追加

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | `public/game_history_sample.jsonl` に v2.1.0 スキーマの新しいゲームデータを追加（既存の v2.0.0 データは保持して後方互換性テスト用に使用） | | |

### Implementation Phase 6: テストの更新

- GOAL-006: 後方互換性と新機能のテストを追加

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-014 | `lib/data-transformers/utils.test.ts` に v2.0.0 データと v2.1.0 データの混在テストを追加 | | |
| TASK-015 | `components/charts/PlayerStatsTable.test.tsx` に新しい列のテストを追加 | | |
| TASK-016 | 既存テストが全て通ることを確認 | | |

## 3. Alternatives

- **ALT-001**: 型定義を完全に分離（v2.0 と v2.1 で別インターフェース）— 複雑になりすぎるため却下。オプショナルフィールドで後方互換性を維持する方が保守性が高い
- **ALT-002**: スキーマバージョンによる条件分岐 — 不要。Nullish Coalescing でデフォルト値を設定すれば、バージョンに関係なく動作する

## 4. Dependencies

- **DEP-001**: 既存の型定義（`types/game-data.types.ts`）
- **DEP-002**: 既存のデータ変換層（`lib/data-transformers/`）
- **DEP-003**: 既存のフォーマッタ（`lib/formatters.ts`）
- **DEP-004**: 既存のイベントアイコン設定（`lib/event-icons.ts`）

## 5. Files

- **FILE-001**: `types/game-data.types.ts` — 型定義の更新
- **FILE-002**: `lib/data-transformers/types.ts` — PlayerAllStatsRow の更新
- **FILE-003**: `lib/data-transformers/utils.ts` — PlayerAggregate の更新
- **FILE-004**: `lib/data-transformers/player-all-stats.ts` — 集計ロジックの更新
- **FILE-005**: `lib/event-icons.ts` — 新イベントタイプのビジュアル設定
- **FILE-006**: `lib/data-transformers/movement-with-events.ts` — INTERESTING_EVENTS の更新
- **FILE-007**: `components/charts/PlayerStatsTable.tsx` — 新しい列の追加
- **FILE-008**: `public/game_history_sample.jsonl` — サンプルデータの更新

## 6. Testing

- **TEST-001**: v2.0.0 のみのデータで正常動作することを確認（後方互換性）
- **TEST-002**: v2.1.0 のみのデータで新フィールドが正しく表示されることを確認
- **TEST-003**: v2.0.0 と v2.1.0 が混在するデータで正常動作することを確認
- **TEST-004**: 新しいタイムラインイベントがイベント密度チャートに表示されることを確認
- **TEST-005**: PlayerStatsTable に新しい列が表示され、ソートが機能することを確認

## 7. Risks & Assumptions

- **RISK-001**: サンプルデータの更新により既存テストが失敗する可能性 — 対策: テストデータは別途用意
- **RISK-002**: 新フィールドの型が実際のログと異なる可能性 — 対策: 型をゆるめに定義（number | undefined）
- **ASSUMPTION-001**: 新フィールドはすべてオプショナル（v2.0.0 データには存在しない）
- **ASSUMPTION-002**: 新フィールドの値は常に数値（0以上）

## 8. Related Specifications / Further Reading

- [SCHEMA_CHANGELOG.md](/docs/SCHEMA_CHANGELOG.md) — スキーマ変更履歴
- [GameLogs_README.md](/GameLogs_README.md) — ゲームログ機能の説明
- [DETAILED_LOGGING_IMPLEMENTATION.md](/DETAILED_LOGGING_IMPLEMENTATION.md) — 詳細ログ記録機能の実装
