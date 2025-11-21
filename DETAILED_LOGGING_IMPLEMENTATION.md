# 詳細ログ記録機能の実装

このドキュメントでは、ゲームの詳細な統計情報を記録する新しいログ機能の実装について説明します。

## 実装された機能

### 1. プレイヤー移動距離の追跡
- **実装場所**: `Modules/GameDataLogger.cs`, `Patches/PlayerContorols/FixedUpatePatch.cs`
- **機能**: 各プレイヤーの移動距離を継続的に追跡します
- **更新頻度**: 3フレームごと（パフォーマンス最適化のため）
- **異常値フィルタリング**: 10ユニット以上の移動（テレポート等）は除外

### 2. 会議ボタン使用率の記録
- **実装場所**: `Modules/GameDataLogger.cs`, `Patches/PlayerContorols/ReportDeadBodyPatch.cs`
- **機能**: 各プレイヤーの緊急会議ボタン使用回数を記録
- **追加情報**: 
  - プレイヤーごとの使用回数
  - 使用時刻
  - ゲーム全体の使用率（使用したプレイヤー数/総プレイヤー数）

### 3. タスク完了の追跡
- **実装場所**: `Modules/GameDataLogger.cs`, `Patches/PlayerContorols/CompleteTaskPatch.cs`
- **機能**: プレイヤーがタスクを完了するたびに記録
- **記録内容**: 完了時刻、プレイヤーID

### 4. サボタージュの記録
- **実装場所**: `Modules/GameDataLogger.cs`, `Patches/ShipStatusPatch.cs`
- **機能**: サボタージュの発動を記録
- **記録内容**: 発動者、サボタージュ種類、発動時刻
- **サボタージュ種類**:
  - `Reactor Meltdown` - 原子炉メルトダウン（The Skeld / Mira HQ）
  - `Reactor Meltdown (Laboratory)` - 原子炉メルトダウン（Polus）
  - `O2 Depletion` - 酸素枯渇
  - `Lights Sabotage` - 照明破壊
  - `Communications Sabotage` - 通信妨害
  - `Crash Course` - ヘリ墜落（Airship）
  - `Mushroom Mixup` - キノコミックスアップ（Fungle）
  - `Door Close (ID: X)` - ドア閉鎖（ドアID付き）

### 5. プレイヤー生存時間
- **実装場所**: `Modules/GameDataLogger.cs`, `Patches/PlayerContorols/FixedUpatePatch.cs`
- **機能**: 各プレイヤーの生存時間を秒単位で記録

### 6. プレイヤーアクションの詳細記録
- **実装場所**: `Modules/GameDataLogger.cs`
- **機能**: すべてのプレイヤーアクションをタイムスタンプ付きで記録
- **記録対象**:
  - 会議ボタン使用
  - タスク完了
  - サボタージュ発動
  - その他カスタムアクション

### 7. タイムラインイベントのカテゴリ化と詳細化
- **実装場所**: `Modules/GameDataLogger.cs`
- **機能**: すべてのイベントに `category` を付与し、Task / Sabotage / Combat / Meeting / MeetingControl などに分類
- **メリット**: ダッシュボードやBIツール側でフィルタリング・集計が容易に
- **付随機能**: 会議イベント・キルイベントを `events` セクションに集約し、プレイヤー行動との関連を追跡可能

### 8. 5秒スナップショット形式の移動タイムシリーズ
- **実装場所**: `Modules/GameDataLogger.cs`
- **機能**: `timeseries.movement_snapshots` に5秒間隔の移動距離スナップショットを格納
- **備考**: 各プレイヤーは `players[].timeseries_refs.movement_snapshots_key` で自分の系列を参照
- **用途**: エリア滞在時間、速度分布、ヒートマップなどの二次分析

### 9. スキーマバージョンとセクション分割
- **実装場所**: `Modules/GameDataLogger.cs`
- **機能**: `schema.version` を付与し、`match`/`settings`/`players`/`events`/`timeseries`/`analytics`/`outcome` に分割
- **メリット**: 後方互換性管理、ログパーサーの進化、機械学習向けETLの安定化

## データ構造

トップレベルは次のようなセクションで構成されています：

```json
{
  "schema": { /* バージョン・生成時刻・game_id */ },
  "match": { /* 試合メタデータ */ },
  "settings": { /* ルール・Mod設定 */ },
  "players": {
    "order": [0, 1, ...],
    "data": {
      "0": { /* Aliceの詳細 */ },
      "1": { /* Bobの詳細 */ }
    }
  },
  "events": { /* timeline / meetings / kills */ },
  "timeseries": { /* movement_snapshots 等 */ },
  "analytics": { /* 集計と派生指標 */ },
  "outcome": { /* 勝敗・終了理由 */ }
}
```

公式サンプル: `game_history_sample.jsonl`

**ファイル形式の詳細：**
- サンプルファイルはJSONL形式（JSON Lines）で保存されています
- 各行が1ゲームの完全なJSONデータを含んでいます
- 可読性のため、実際のログファイルよりも整形されていません（1行に圧縮）
- ファイルを開く際は、行ごとにJSONとしてパースする必要があります

### プレイヤーデータ
`players.data` の各要素は以下のブロックで構成されています：

| ブロック | 内容 |
| --- | --- |
| `identity` | プレイヤーID/名前/UUID/カラー/プラットフォーム |
| `role` | メインロールとサブロール（複数可） |
| `lifecycle` | 生存状態、死亡理由、経過時間、勝敗フラグ |
| `progression` | タスク進捗（完了数・総数・完了イベント数） |
| `counters` | 移動距離・ボタン使用・サボタージュ回数など数値指標 |
| `actions` | 重要アクションの履歴（TaskCompleted/EmergencyButton/Sabotageなど） |
| `timeseries_refs` | タイムシリーズデータへの参照キー |

### イベントセクション
- `events.timeline`: すべてのイベントを時系列順に並べ、`category` で種類を分類
- `events.meetings`: 会議単位の詳細（通報者、緊急ボタンかどうか、投票結果、追放者）
- `events.kills`: キルの単票化。タイムラインとの二重管理で解析しやすく

### タイムシリーズデータ
- `timeseries.movement_snapshots`: プレイヤーIDごとに5秒間隔で累積距離と区間距離を記録
- `timeseries.snapshot_interval_seconds`: 収集間隔（現在は5秒固定）

### アナリティクスセクション
- `analytics.overview`: ゲーム全体の主要指標（移動距離合計・平均、ボタン使用率、タスク数、会議数など）
- `analytics.per_player_*`: プレイヤー別の距離/生存時間/タスク/サボタージュ/ボタン回数
- 今後の拡張として、勝率トレンドや役職ごとの行動特徴などを追加しやすい構造

## ログファイルの場所と形式

すべてのゲームデータは以下の場所に保存されます：
- **ファイル**: `{ModDirectory}/GameLogs/game_history.jsonl`
- **形式**: JSONL（JSON Lines形式）

### JSONL形式について

JSONL（JSON Lines）は、1行につき1つの完全なJSONオブジェクトを記録する形式です。

**特徴：**
- 各行が独立したJSONオブジェクトで、1ゲームのデータを表す
- ストリーム処理に適しており、巨大なログファイルでも効率的に処理可能
- 行単位で追記できるため、ファイルロックの問題が少ない
- データ破損が発生しても、他の行には影響しない

**例：**
```jsonl
{"schema":{"version":"2.0.0","generated_at":"2025-11-10T05:15:31Z","game_id":"20251110050000_00001"},"match":{...},"players":{...}}
{"schema":{"version":"2.0.0","generated_at":"2025-11-10T06:20:45Z","game_id":"20251110060000_00002"},"match":{...},"players":{...}}
{"schema":{"version":"2.0.0","generated_at":"2025-11-10T07:08:30Z","game_id":"20251110070000_00003"},"match":{...},"players":{...}}
```

各行は完全に独立しているため、以下のような処理が簡単に行えます：

**読み込み例（Python）：**
```python
import json

with open('game_history.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        game_data = json.loads(line)
        # 1ゲームずつ処理
        print(f"Game ID: {game_data['schema']['game_id']}")
```

**フィルタリング例（Python）：**
```python
# インポスター勝利のゲームのみ抽出
impostor_wins = []
with open('game_history.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        game_data = json.loads(line)
        if game_data['outcome']['winner_team'] == 'Impostor':
            impostor_wins.append(game_data)
```

**ストリーム処理の利点：**
- メモリに全データを読み込む必要がない
- 大量のゲームログでもメモリ効率が良い
- リアルタイム分析に適している
- データベースへのインポートが容易

**注意事項：**
- 各行は改行文字（`\n`）で区切られている
- JSON内に改行を含めることはできない（すべて1行に圧縮）
- ファイル全体は有効なJSON配列ではない（各行が独立したJSON）
- 読み込む際は行ごとに`json.loads()`を実行する必要がある

## パフォーマンスへの配慮

1. **移動距離の更新**: 3フレームごとに実行（毎フレームではない）
2. **異常値フィルタリング**: テレポート等の極端な移動を除外
3. **効率的なデータ構造**: Dictionaryを使用した高速アクセス
4. **例外処理**: すべての記録メソッドにtry-catchを実装

## 使用方法

### 既存のコードとの統合
このシステムは既存のゲームフローに自動的に統合されています：

1. **ゲーム開始時**: `onGameStartedPatch.cs`で`GameDataLogger.OnGameStart()`が呼び出される
2. **ゲーム中**: 各種パッチで自動的にイベントが記録される
3. **ゲーム終了時**: `OutroPatch.cs`で`GameDataLogger.SaveGameData()`が呼び出される

### 新しいアクションの記録
カスタムアクションを記録する場合：
```csharp
Modules.GameDataLogger.LogPlayerAction(
    playerId, 
    "ActionType", 
    new Dictionary<string, object>
    {
        ["custom_data"] = "value",
        ["time"] = DateTime.UtcNow.ToString("O")
    }
);
```

## 実装されたメソッド

### GameDataLogger
- `UpdatePlayerMovement(byte playerId, Vector2 currentPosition)` - 移動距離更新
- `LogEmergencyButtonUse(byte playerId)` - 会議ボタン使用記録
- `LogPlayerAction(byte playerId, string actionType, Dictionary<string, object> actionData)` - アクション記録
- `UpdatePlayerTimeAlive(byte playerId, float deltaTime)` - 生存時間更新
- `LogTaskCompleted(byte playerId)` - タスク完了記録
- `LogSabotageTriggered(byte playerId, string sabotageType)` - サボタージュ記録
- `BuildStatisticsSummary()` - 統計サマリー生成

## 今後の拡張可能性

このシステムは以下のような追加機能に対応できます：
- ベント使用回数
- キル距離の分析
- 特定エリアでの滞在時間
- プレイヤー間の相互作用パターン
- ヒートマップ用の位置データ

## 注意事項

- ホストのみがデータを記録します（`AmongUsClient.Instance.AmHost`チェック）
- ログファイルは累積的に追記されます
- パフォーマンスへの影響を最小限に抑えるよう設計されています
