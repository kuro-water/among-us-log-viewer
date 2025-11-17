# Among Us試合アナリティクス静的Webアプリ構築プラン

## プロジェクト概要

JSONLファイルから複数試合のAmong Usデータを読み込み、Highchartsで10種類のチャートを表示する静的ダッシュボードを構築します。陣営別/役職別のプレイヤー勝率Heat mapを追加し、セルに勝率％とプレイ回数を表示します。

## 主要機能

### データ可視化（10種類のチャート）

1. **陣営別勝率円グラフ** - クルーメイト/インポスター/マッドメイト/第三陣営の勝利分布
2. **プレイヤー別勝率グラフ** - プレイヤーごとの勝敗統計（フィルタリング対応）
3. **移動距離+イベントタイムライン** - プレイヤーの移動量とイベント発生を時系列表示
4. **試合時間分布** - ゲーム時間のヒストグラム
5. 個人統計（キル/デス/タスク/移動距離）
6. **タスク進捗タイムライン** - ゲーム全体のタスク完了推移
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
- **ライトテーマ固定** - ダークモードは提供せず、明示的にライトテーマ用スタイルを最適化

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

## デザイン指針（ライトテーマ専用）

### ビジュアルトーン

- **テーマ方針**: ライトテーマのみを提供し、暗い背景は使用しない。視認性とカード型レイアウトの明度コントラストを重視し、熱量の高い色（勝率ヒートマップなど）はチャート領域に集約する。
- **デザインキーワード**: 「モニタリングダッシュボード」「クリーン」「ゲーム要素のアクセント」。

### カラーパレット（Hex）

| カテゴリ | 色 / 用途 |
| --- | --- |
| **背景** | `#f4f5f7`（ページ全体）、`#ffffff`（カード/モーダル）|
| **ボーダー/枠線** | `#e2e8f0`、`#d4dae4` |
| **本文テキスト** | `#0f172a`（メイン）、`#475569`（サブ）|
| **アクション/リンク** | `#2563eb`（プライマリ）、`#0ea5e9`（ホバーハイライト）|
| **警告/強調** | `#f97316`（注意）、`#dc2626`（エラー）|
| **チャート背景** | `#f9fafb`（プロット背景）、`#ffffff`（カード内）|

陣営・ヒートマップ専用カラーは既存の `FACTION_COLORS` と、`#ff0000 → #ffff00 → #00ff00` グラデーションをそのまま利用し、データ可視化のアクセントとして扱う。

### タイポグラフィ & スペーシング

- フォント: `"Inter", "Noto Sans JP", system` を優先し、日本語/英語混在でもウエイト差を吸収。`font-weight` は 500/600 を見出し、400 を本文に使用。
- ベースライン: `4px` グリッド。カード間隔は `24px`、カード内パディング `20px`（モバイル時 `16px`）。
- コンポーネント共通角丸: `16px`（カード）、`9999px`（スイッチ/ピル型トグル）。

### レイアウト構成

1. **固定ヘッダー**
  - 左: ロゴ/タイトル（例: "Among Us Analytics"）。
  - 右: データソース表示 / Githubリンク / ライトテーマトグル（Disabled表示でライト固定を明示）。
2. **フィルターパネル**
  - カード化し、試合選択ドロップダウン、プレイヤーマルチセレクト、期間フィルタなどを 2 列レイアウトで配置。
3. **チャートグリッド**
  - Desktop: 12 カラム（`grid-cols-12`）ベース。大型チャート（タイムライン系）は 12 カラム、ヒートマップ/円グラフは 6 カラムなどブロックごとに比重を調整。
  - Tablet: 2 カラム、Mobile: 1 カラム。
4. **カード仕様**
  - タイトル + サブタイトル（試合数や期間）をヘッダーに配置。右上に情報アイコンまたはフィルタショートカットを並べる。
  - 下部余白を確保し、ツールバー（凡例トグル、CSV出力）が必要なチャートはカードフッターを追加。

### チャート共通スタイリング

- `config/highcharts-theme.ts` にて以下を徹底：
  - `chart.backgroundColor = "transparent"`、カード背景とのレイヤー差を最小限に。
  - `legend` は pill 型の `backgroundColor: "rgba(15,23,42,0.05)"`, `borderRadius: 9999`。
  - `tooltip` はライトテーマ向けに `backgroundColor: "#0f172a"`, `color: "white"`, `borderWidth: 0`, `borderRadius: 12px`。
  - `dataLabels` は `fontSize 12px`, `fontWeight 600`, `color #0f172a`（ヒートマップは `useHTML` で段組み）。
- Heatmap のセルは `borderWidth: 1`, `borderColor: #f8fafc`、`nullColor: #dfe3eb` を統一。
- Timeline/Movement 系は `xAxis.labels.formatter` で `mm:ss` 表記へ、`plotBands` で会議やインターバルを薄グレー帯表示。

### 追加 UI コンポーネント

- **KPI チップ**: カードタイトル直下に勝率や平均時間などを pill 表示（背景 `#eef2ff`、テキスト `#1d4ed8`）。
- **ステータスバッジ**: データ取得中/エラー時に使用。背景 `#fff7ed`（警告）、`#fee2e2`（エラー）。
- **空状態テンプレート**: データが無い場合、イラスト付きの `card` で "データがありません" を示し、フィルタ解除ボタンを提供。

このデザイン指針を `globals.css` とチャートコンポーネントで具体化し、ライトテーマのみで完結する UI を構築する。

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

### 2. 型定義とJSONLパーサー（完了）

- [x] `types/game-data.types.ts` — JSONLスキーマ2.0.0ベースで試合情報、イベント、タイムシリーズ、プレイヤー役職、リザルトまで型付け済み。
- [x] `lib/jsonl-parser.ts` — fetch + ストリーム読み込みに対応した行単位パーサーを実装。`JsonLineError` で不正行を収集しつつ `public/game_history_sample.jsonl` をクライアントのみで処理可能にした。

### 3. 拡張可能な役職マッピング設計（完了）

- [x] `lib/role-mapping.ts` — ROLE_NAMES_IN_LOGS.md に基づき陣営ごとの役職配列と `getRoleFaction`、`getFactionFromWinnerTeam` などのユーティリティを実装。新役職の追加も定数追記のみで対応可能。

### 4. イベントアイコンマッピング（完了）

- [x] `lib/event-icons.ts` — Lucide React を用いた各種サボタージ/イベントのアイコン割り当てを実装。移動タイムラインやイベントチャートで共通利用できる。

### 5. データ変換関数（10種類）（完了）

`lib/data-transformers/` に以下を実装済み：

1. **`faction-win-rate.ts`** — 陣営別勝率集計
2. **`player-faction-heatmap.ts`** — プレイヤー×陣営マトリクス
3. **`player-role-heatmap.ts`** — プレイヤー×役職マトリクス
4. **`player-win-rate.ts`** — スタックドカラム向け勝率データ
5. **`role-performance.ts`** — 役職別タスク/生存時間
6. **`game-duration.ts`** — 試合時間ヒストグラムデータ
7. **`player-radar.ts`** — 個人レーダー指標
8. **`task-timeline.ts`** — タスク進捗ポイント
9. **`event-density.ts`** — イベント密度ライン
10. **`movement-with-events.ts`** — 移動軸 + イベントマーカー

共通フィルタ適用ロジックは `lib/data-transformers/utils.ts` に集約し、`hooks/useGameAnalytics.ts` から一括呼び出し済み。

### 6. Highchartsコンポーネント（10種類）（完了）

`components/charts/` 配下に 'use client' コンポーネントを全て実装済み。`BaseChart` でテーマと共通オプションを注入し、`ChartEmptyState` でデータ欠損時のUIも統一。

- 円/カラム/ライン系: `FactionWinRateChart.tsx`、`PlayerWinRateChart.tsx`、`MovementWithEventsChart.tsx`、`GameDurationChart.tsx`、`TaskTimelineChart.tsx`、`EventDensityChart.tsx`、`RolePerformanceChart.tsx`
- Heatmap系: `PlayerFactionHeatmap.tsx`、`PlayerRoleHeatmap.tsx`
- その他: `PlayerRadarChart.tsx`

### 7. ダッシュボードページとGitHub Actions（一部完了）

#### ダッシュボード実装

- [x] `app/page.tsx` — `useGameAnalytics` と KPIカード/フィルタ/10チャートのレイアウトを実装。ライトテーマ専用デザインで、エラー/警告表示や再取得ボタンを備える。
- [x] `config/highcharts-theme.ts` — Beyond Us パレットを Highcharts グローバルテーマに適用済み。

#### デプロイ設定

- [ ] `.github/workflows/deploy.yml` — GitHub Pages 用の自動デプロイパイプラインは未作成。Node 20 セットアップ→`npm ci && npm run build`→`out/` デプロイのジョブを追加予定。

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
- **データなし**: `#cccccc` （グレー／`nullColor` として適用）

### ライトテーマ ネイトルプリセット

- **Surface**: `#ffffff`
- **Alt Surface**: `#f9fafb`
- **Muted Text**: `#64748b`
- **Divider**: `#e2e8f0`
- **Tooltip BG**: `#0f172a`

ダークテーマは提供せず、すべての UI パーツは上記ライトパレット内で完結させる。

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
