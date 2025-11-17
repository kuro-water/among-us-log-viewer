# Among Us試合アナリティクス静的Webアプリ構築プラン

## プロジェクト概要

JSONLファイルから複数試合のAmong Usデータを読み込み、Highchartsで10種類のチャートを表示する静的ダッシュボードを構築します。陣営別/役職別のプレイヤー勝率Heat mapを追加し、セルに勝率％とプレイ回数を表示します。

## 主要機能

### データ可視化（10種類のチャート）

1. **陣営別勝率円グラフ** - クルーメイト/インポスター/マッドメイト/第三陣営の勝利分布
2. **プレイヤー別勝率グラフ** - プレイヤーごとの勝敗統計（フィルタリング対応）
3. **移動距離+イベントタイムライン** - プレイヤーの移動量とイベント発生を時系列表示
4. **試合時間分布** - ゲーム時間のヒストグラム
5. **プレイヤーレーダーチャート** - 個人統計（キル/デス/タスク/移動距離）
6. **タスク進捗タイムライン** - ゲーム全体のタスク完了推移
7. **イベント密度** - 時間帯別のアクション頻度
8. **役職別パフォーマンス** - 役職ごとの平均タスク数/生存時間
9. **プレイヤー×陣営Heat map** ⭐ - プレイヤーごとの陣営別勝率とプレイ回数をマトリクス表示
10. **プレイヤー×役職Heat map** ⭐ - プレイヤーごとの役職別勝率とプレイ回数をマトリクス表示

### データ解析機能

- **複数試合の統合分析** - JSONLファイルから0～N試合を一括処理
- **陣営別集計** - クルーメイト/インポスター/マッドメイト/第三陣営/その他の分類
- **役職マッピング** - 150+のカスタム役職を陣営に自動分類
- **イベントアイコンマッピング** - サボタージ、キル、会議などをアイコンで表示
- **タイムシリーズ分析** - 5秒間隔の移動スナップショットデータを活用

### UI/UX機能

- **試合選択ドロップダウン** - 複数試合から選択して表示
- **プレイヤーフィルタリング** - 特定プレイヤーのみ表示/非表示
- **レスポンシブデザイン** - Tailwind CSS v4でモバイル/デスクトップ対応
- **ダークモード対応** - 自動/手動切り替え

### デプロイ機能

- **静的サイト生成** - Next.jsの静的エクスポート機能を利用
- **GitHub Pages対応** - 自動デプロイパイプライン
- **サーバー不要** - 完全静的なサイトとして動作

## 技術スタック

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Visualization**: Highcharts 12.4.0 + @highcharts/react
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Deployment**: GitHub Pages (静的エクスポート)
- **Data Format**: JSONL (スキーマバージョン 2.0.0)

## 実装ステップ

### 1. プロジェクト基盤とパッケージ追加

- [x] `npm install @highcharts/react highcharts lucide-react` 実行完了
- [x] `public/game_history_sample.jsonl` に配置完了
- [x] `next.config.ts` を静的エクスポート向けに更新完了
  ```typescript
  const nextConfig: NextConfig = {
    output: 'export',
    basePath: '/among-us-log-viewer',
    images: { unoptimized: true },
  }
  export default nextConfig
  ```

### 2. 型定義とJSONLパーサー（次の優先タスク）

- [ ] `types/game-data.types.ts` — 完全なデータスキーマ定義
  - `main_role`、`sub_roles` を含むプレイヤー役職型
  - イベント、タイムシリーズ、アナリティクス、結果データの型定義
  
- [ ] `lib/jsonl-parser.ts` — クライアント側データ取得
  - `fetch('/game_history_sample.jsonl')` によるデータ取得
  - **JSONL形式の行単位パース**（重要）
    - JSONL (JSON Lines) は1行につき1つの完全なJSONオブジェクトを含む形式
    - 各行が独立した1ゲームのデータを表す
    - ファイル全体は有効なJSON配列ではない
    - 実装例:
      ```typescript
      const response = await fetch('/game_history_sample.jsonl');
      const text = await response.text();
      const games = text.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
      ```
  - エラーハンドリング（不正な行をスキップ）
  - 大きなファイル対応（ストリーム処理または分割読み込み）

注: リポジトリ内に `game_history_sample.jsonl` は存在しますが `public/` 配下ではないため、クライアントから直接 fetch する用途にする場合は `public/` へ移動するか、ビルド時にコピーする必要があります。

### 3. 拡張可能な役職マッピング設計（未実装）

- [ ] `lib/role-mapping.ts` — ROLE_NAMES_IN_LOGS.md を基に実装
  - **定数配列定義**：
    - `CREWMATE_ROLES`: クルーメイト陣営の全役職（約50種類）
    - `IMPOSTOR_ROLES`: インポスター陣営の全役職（約50種類）
    - `MADMATE_ROLES`: マッドメイト陣営の全役職（約15種類）
    - `NEUTRAL_ROLES`: 第三陣営の全役職（約35種類）
    - `HIDE_AND_SEEK_ROLES`: かくれんぼモードの役職（2種類）
    - `OTHER_ROLES`: その他の役職（GM、Driver等）
  
  - **関数実装**：
    - `getRoleFaction(mainRole: string): 'Crewmate' | 'Impostor' | 'Madmate' | 'Neutral' | 'Other'`
    - 役職ごとのカラーマップ生成関数
  
  - **設計方針**：
    - 陣営判定は `main_role` のみを使用（`sub_roles` は無視）
    - 新役職追加時は該当する定数配列に追加するだけで対応可能
    - 未定義の役職は自動的に 'Other' に分類

### 4. イベントアイコンマッピング（未実装）

- [ ] `lib/event-icons.ts` — Lucide React アイコンマッピング
  - `Radiation` → Reactor Meltdown（原子炉メルトダウン）
  - `Droplets` → O2 Depletion（酸素枯渇）
  - `Zap` → Lights Sabotage（ライト妨害）
  - `Radio` → Communications Sabotage（通信妨害）
  - `Plane` → Crash Course（クラッシュコース）
  - `Mushroom` → Mushroom Mixup（マッシュルームミックスアップ）
  - `Lock` → Door Close（ドア閉鎖）
  - `Knife` → Kill（キル）
  - `CheckCircle` → Task Completed（タスク完了）
  - `MessageCircle` → Meeting（会議）
  - `Bell` → Emergency Button（緊急ボタン）

### 5. データ変換関数（10種類）（未実装）

`lib/data-transformers/` ディレクトリに以下を実装：

1. **`faction-win-rate.ts`** — 陣営別勝利数集計（Pie chart用）
   - 全試合から陣営ごとの勝利/敗北を集計
   - 出力: `[{faction: 'Crewmate', wins: N, losses: M, ...}]`

2. **`player-faction-heatmap.ts`** ⭐ NEW
   - プレイヤー × 陣営のマトリクスデータ生成
   - **横軸**: プレイヤー名（重複なし）
   - **縦軸**: 陣営（Crewmate, Impostor, Madmate, Neutral, Other）
   - **セル値**: `{win_rate_percent: number, play_count: number}`
   - プレイ回数0の場合: `{win_rate_percent: null, play_count: 0}`

3. **`player-role-heatmap.ts`** ⭐ NEW
   - プレイヤー × 役職のマトリクスデータ生成
   - **横軸**: プレイヤー名
   - **縦軸**: 頻出役職Top 10-15（例: Crewmate, Sheriff, Engineer, Impostor等）
   - **セル値**: `{win_rate_percent: number, play_count: number}`
   - プレイ回数0の場合: `{win_rate_percent: null, play_count: 0}`

4. **`player-win-rate.ts`** — プレイヤー別勝率（Stacked percentage column用）
   - `main_role` を使用してプレイヤーごとの勝率を集計

5. **`role-performance.ts`** — 役職別パフォーマンス
   - 平均タスク完了数、平均生存時間等

6. **`game-duration.ts`** — 試合時間分布（Histogram用）

7. **`player-radar.ts`** — 個別プレイヤー統計（Radar chart用）
   - キル数、デス数、タスク数、移動距離等

8. **`task-timeline.ts`** — タスク進捗（Area chart用）

9. **`event-density.ts`** — イベント密度（Line chart用）

10. **`movement-with-events.ts`** — 移動距離+イベントマーカー（Spline with symbols用）
    - `timeseries.movement_snapshots` と `events.timeline` を結合
    - イベント発生時にアイコンマーカーを配置

### 6. Highchartsコンポーネント（10種類）（未実装）

`components/charts/` ディレクトリに 'use client' コンポーネントを作成：

#### 基本チャート（8種類）

1. **`FactionWinRateChart.tsx`** — 陣営別勝率円グラフ
   - Type: `pie`
   - 固定カラー: Crewmate #00e272, Impostor #fe6a35, Madmate #9d4edd, Neutral #ffd60a, Other #6c757d

2. **`PlayerWinRateChart.tsx`** — プレイヤー別勝率
   - Type: `column`, stacking: `percent`
   - プレイヤーフィルタリング機能（チェックボックス）

3. **`MovementWithEventsChart.tsx`** — 移動距離+イベント
   - Type: `spline` with symbols
   - プレイヤーフィルタリング機能
   - イベント時にLucideアイコンをマーカーとして表示

4. **`GameDurationChart.tsx`** — 試合時間分布（Column histogram）

5. **`PlayerRadarChart.tsx`** — プレイヤーレーダー（Polar chart）

6. **`TaskTimelineChart.tsx`** — タスク進捗（Area stacked）

7. **`EventDensityChart.tsx`** — イベント密度（Line chart）

8. **`RolePerformanceChart.tsx`** — 役職別パフォーマンス（Bar chart）

#### Heat map（2種類）⭐ NEW

9. **`PlayerFactionHeatmap.tsx`** — プレイヤー×陣営Heat map
   - Type: `heatmap`
   - **横軸**: プレイヤー名（フィルタリング対応）
   - **縦軸**: 陣営（Crewmate, Impostor, Madmate, Neutral, Other）
   - **セル表示**: dataLabels で以下を表示
     - プレイ回数 > 0: `"XX%\nYY回"` （例: `"75%\n8回"`）
     - プレイ回数 = 0: `"-"`
   - **背景色グラデーション**:
     - 0% = 赤 (#ff0000)
     - 50% = 黄 (#ffff00)
     - 100% = 緑 (#00ff00)
     - プレイ回数0 = グレー (#cccccc)

10. **`PlayerRoleHeatmap.tsx`** — プレイヤー×役職Heat map
    - Type: `heatmap`
    - **横軸**: プレイヤー名
    - **縦軸**: 頻出役職Top 10-15（動的に決定）
    - **セル表示**: PlayerFactionHeatmap と同様
    - **背景色グラデーション**: PlayerFactionHeatmap と同様

### 7. ダッシュボードページとGitHub Actions（未実装）

#### ダッシュボード実装

- [ ] `app/page.tsx` — メインダッシュボード
  - クライアント側で `useEffect` によるデータ取得
  - 試合選択ドロップダウン（`components/GameSelector.tsx`）
  - Tailwind CSS グリッドレイアウト（4x3 または 3x4）
  - 全10チャートを配置

- [ ] `config/highcharts-theme.ts` — カラースキーム適用
  - Beyond Us カラーパレット設定
  - グローバルテーマ設定

#### デプロイ設定

- [ ] `.github/workflows/deploy.yml` — GitHub Actions
  - トリガー: `feature/ui-update` または `main` へのプッシュ
  - ステップ:
    1. Node.js 20 セットアップ
    2. `npm ci && npm run build`
    3. `out/` ディレクトリをアップロード
    4. `gh-pages` ブランチへデプロイ

## カラースキーム

### 陣営カラー

- **Crewmate**: `#00e272` （緑）
- **Impostor**: `#fe6a35` （オレンジ）
- **Madmate**: `#9d4edd` （紫）
- **Neutral**: `#ffd60a` （黄）
- **Other**: `#6c757d` （グレー）

### Heat map グラデーション

- **0%**: `#ff0000` （赤）
- **50%**: `#ffff00` （黄）
- **100%**: `#00ff00` （緑）
- **データなし**: `#cccccc` （グレー）

## 追加要件（Heat map仕様）

### Heat map レイアウト変更 ⭐ 重要

- **横軸**: プレイヤー名（複数プレイヤーを並べる）
- **縦軸**: 陣営または役職名
- **理由**: 表示の見やすさを考慮（プレイヤー数は変動するが、陣営/役職は固定）

### セル表示ルール

1. **プレイ回数 > 0**:
   - 勝率％とプレイ回数を表示: `"XX%\nYY回"`
   - 背景色は勝率に応じてグラデーション（0%赤→50%黄→100%緑）

2. **プレイ回数 = 0**:
   - テキスト: `"-"`
   - 背景色: グレー（`#cccccc`）

### データ構造

```typescript
// player-faction-heatmap.ts の出力例
{
  xAxis: ['Player1', 'Player2', 'Player3', ...],  // プレイヤー名
  yAxis: ['Crewmate', 'Impostor', 'Madmate', 'Neutral', 'Other'],  // 陣営
  data: [
    { x: 0, y: 0, value: 75, playCount: 8 },  // Player1 × Crewmate: 75%, 8回
    { x: 0, y: 1, value: null, playCount: 0 },  // Player1 × Impostor: データなし
    ...
  ]
}

// player-role-heatmap.ts の出力例
{
  xAxis: ['Player1', 'Player2', 'Player3', ...],  // プレイヤー名
  yAxis: ['Crewmate', 'Sheriff', 'Engineer', 'Impostor', ...],  // Top役職
  data: [
    { x: 0, y: 0, value: 60, playCount: 5 },  // Player1 × Crewmate: 60%, 5回
    ...
  ]
}
```

## デプロイURL

https://kuro-water.github.io/among-us-log-viewer/

## スキーマバージョン

- **JSONL データ**: バージョン 2.0.0
- **役職リスト**: ROLE_NAMES_IN_LOGS.md（2025年11月17日版）

## 実装優先順位

1. ✅ パッケージインストール（完了）
2. ✅ プロジェクト設定（next.config.ts、ファイル移動）完了
3. 型定義とパーサー
4. 役職マッピング（最重要：全チャートで使用）
5. データ変換関数（特にHeat map関連）
6. チャートコンポーネント（Heat mapを含む全10種類）
7. ダッシュボード統合
8. GitHub Actions設定

---

## JSONL 形式の理解（重要）

`game_history_sample.jsonl` は **JSONL (JSON Lines)** 形式で保存されています。

### 特徴
- **1行 = 1ゲームの完全なJSONオブジェクト**
- ファイル全体は有効なJSON配列ではない（各行が独立）
- 改行文字（`\n`）で区切られている
- ストリーム処理に適しており、大量データでもメモリ効率が良い

### パース方法
```typescript
// ❌ 間違い: JSON.parse(entireFile) は失敗する
// ✅ 正しい: 行ごとにパース
const lines = fileContent.split('\n');
const games = lines
  .filter(line => line.trim())  // 空行を除外
  .map(line => {
    try {
      return JSON.parse(line);
    } catch (e) {
      console.warn('Failed to parse line:', e);
      return null;
    }
  })
  .filter(game => game !== null);
```

### 利点
- 行単位で追記可能（ファイルロック問題が少ない）
- データ破損が発生しても他の行には影響しない
- メモリに全データを読み込まなくてもストリーム処理可能
- リアルタイム分析やデータベースインポートが容易

詳細は `DETAILED_LOGGING_IMPLEMENTATION.md` の「JSONL形式について」セクションを参照してください。

## Heatmap 実装メモ（PLAN に追記）

- Highcharts の dataLabels は HTML を使うと改行とスタイルが安定します（useHTML: true）。
- 勝率に応じた背景グラデーションは colorStops を使い、プレイ回数 0 のセルは明示的に灰色で塗る。
- 横軸にプレイヤー名を直接置くと重複や長さの問題があるため、内部キー（player_uuid）を主キーにし表示ラベルは player_name を使う設計を推奨。
- JSONL が大きい場合はクライアントで直接全件パースするのは避け、事前集計か Web Worker/バックエンド経由を検討。

---

## 次のステップ

以下の順で実装を進めます：

1. **型定義とパーサー** - `types/game-data.types.ts` と `lib/jsonl-parser.ts` を作成
2. **役職マッピング** - `lib/role-mapping.ts` を実装（全チャートで使用）
3. **Heat mapの実装** - `lib/data-transformers/player-faction-heatmap.ts` と `components/charts/PlayerFactionHeatmap.tsx` で動作検証
4. **残りのチャート** - 9種類のチャートとデータ変換関数を順次実装
5. **ダッシュボード統合** - `app/page.tsx` で全チャートを配置
6. **デプロイ設定** - `.github/workflows/deploy.yml` で自動デプロイ

最終更新日: 2025年11月17日
