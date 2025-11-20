
# Among Us Log Viewer

![project icon](/file.svg)

Among Us の詳細ログ（JSONL）を読み込み、試合のタイムライン・イベント・プレイヤー統計を可視化する Next.js + TypeScript のシングルページアプリケーションです。

このプロジェクトは、高度な Mod やカスタムロールから出力された詳細ログを解析して、Highcharts ベースのダッシュボードで視覚化します。

---


## クイックスタート（ローカル開発）

ローンチ手順（推奨）:

```bash
# 依存インストール
npm ci

# 開発サーバー
npm run dev
```

ブラウザで `http://localhost:3000` を開くとダッシュボードにアクセスできます。デフォルトでは `public/game_history_sample.jsonl` のサンプルを読み込みます。

:::tip
デフォルトのサンプル JSONL は `public/game_history_sample.jsonl` です。独自のファイルを使う場合は `loadGameHistory({ path: '/your/path.jsonl' })` を指定してください。
:::
:::note
詳しいログのスキーマや記録している項目は `DETAILED_LOGGING_IMPLEMENTATION.md` を参照してください。役職名に関しては `ROLE_NAMES_IN_LOGS.md` を確認してください。
:::

---


## 主な機能

- JSONL（JSON Lines）形式のゲームログをストリーミングで読み込み
- 試合ごとのイベントタイムライン（タスク・サボタージュ・キル・会議など）
- プレイヤー別統計（勝率、移動量、タスク完了数）と役職／陣営別の分析
- タイムシリーズに基づくヒートマップ・移動軌跡の可視化
- 自動エラー検出（不正 JSONL 行を収集して UI へ報告）

---


## データフォーマット（JSONL）

各行が 1 試合分の JSON オブジェクトになっている JSONL（JSON Lines）形式を利用します。ファイルの例は `public/game_history_sample.jsonl` に含まれます。

主なフィールド（例）:

- `schema` — 実行時のスキーマ/バージョン。`game_id`, `generated_at` などを含みます。
- `match` — 試合メタ（開始時間、マップ、プレイヤー数など）
- `players` — プレイヤー配列／ディクショナリ（`identity`, `role`, `counters`, `timeseries_refs` など）
- `events` — タイムライン、キル、会議、サボタージュ等
- `timeseries` — 移動スナップショット等の時系列データ

パーサー: `lib/jsonl-parser.ts` がストリーミング読み込みを実装し、不正行を `JsonLineError` として収集します。UI はこれらを `hooks/useGameAnalytics.ts` 経由で表示可能です。

---


## 開発ガイド（概要）

### 主要ファイルの役割

- `lib/jsonl-parser.ts` — JSONL のストリーミング読み込みとパース。エラー行の収集を行います。
- `lib/data-transformers/` — 生ログをグラフ向けデータに変換する純粋関数群（TransformerOptions を受ける）
- `hooks/useGameAnalytics.ts` — データ読み込み、フィルタ、変換を行い、UI に渡すハブ
- `components/charts/BaseChart.tsx` — Highcharts 初期化やテーマ適用を行う共通ラッパー
- `components/ui/Card.tsx` — 汎用カードレイアウトコンポーネント（`ChartCard` のベースとして利用）
- `components/dashboard/ChartGrid.tsx` — 表示するチャート群のレイアウト

### 新しいチャートを追加するには

1. `lib/data-transformers` に新しい transformer を追加して必要な加工を実装します。
1. `lib/data-transformers/index.ts` にエクスポートを追加します。
1. `components/charts/` に新しいチャートコンポーネントを作成（`BaseChart.tsx` を再利用）。
1. `hooks/useGameAnalytics.ts` に transformer 出力を追加して、`ChartGrid` へ渡します。
1. 単体テスト（transformer）と UI テスト（チャートレンダリング）を追加します。

### コード品質とスタイル

- TypeScript を使用して型安全に実装してください。
- React の関数型コンポーネントと Hooks を推奨します。
- UI スタイルは Tailwind CSS を使用します。既存パターンに従ってください。
- ESLint 設定は `eslint.config.mjs` を参照してください。

---


## テスト & Lint

- 単体テスト: `npm run test`（Jest + ts-jest + @testing-library）
- ウォッチ: `npm run test:watch`
- Lint: `npm run lint`
- Lint 自動修正: `npm run lint:fix`  # ファイルを自動修正（可能な限り）
- CI 環境では警告をエラーにする: `npm run lint:ci`  # Pull Request ではこのコマンドが実行されます

### E2E (Playwright)

- Playwright E2E をローカルで実行するには dev サーバーやビルド済みサーバーが必要です。
- Dev サーバー起動してから試す: `npm run dev` → `npm run e2e` (別ターミナル)
- CI 実行: GitHub Actions `Playwright E2E` ワークフローが自動で `npm run build && npm run start` を行い、`npx playwright test` を実行します。

テストは `*.test.ts`, `*.test.tsx` の命名規則です。transformer などのビジネスロジックはユニットテストを追加してください。

---


## ビルド & デプロイ

```bash
# Production build
npm run build

# Static export (ex: GitHub Pages)
npx next export
```

`next.config.ts` の `output: 'export'` により静的エクスポートが可能です。GitHub Pages にデプロイする際は `basePath` の設定に注意してください。

---


## スクリプト（ローカル検査用）

このリポジトリにはかつてローカル検査用スクリプトがありましたが、現在は削除されています。
必要であれば簡単な Node スクリプトを作成して当地の `public/game_history_sample.jsonl` を解析してください。

---


## PR（簡易ガイド）

- ブランチ名: `feature/<short-desc>` / `fix/<short-desc>` を推奨
- PR タイトル: `[scope] <短 description>`（例: `[charts] Add movement chart`）
- 必ず `npm run lint` と `npm run test` を通してください
- ログスキーマに変更がある場合は `DETAILED_LOGGING_IMPLEMENTATION.md` の更新と型（`types/game-data.types.ts`）の更新を忘れないでください

---


## 参考（リポジトリ内）

- `DETAILED_LOGGING_IMPLEMENTATION.md` — ログスキーマとイベント設計
- `ROLE_NAMES_IN_LOGS.md` — ロール名の一覧
- `AGENTS.md` — エージェント（自動化ツール）向け作業ガイド（新規）
- `PLAN.md` — 今後の作業・TODO

---

ご不明点があれば issue を作成してください。

