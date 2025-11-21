<!-- PR coverage の改善点は README 下部の CI/PR セクションに統合しました -->

# Among Us Log Viewer

![project icon](/file.svg)

Among Us の詳細ログ（JSONL）を読み込み、試合のタイムライン、イベント、プレイヤー統計を可視化するオープンソースの Next.js アプリです。Highcharts と TypeScript を使い、Mod / カスタムロールで生成された詳細ログの解析とダッシュボード表示を行います。

主要ポイント

- 軽量な JSONL ストリーミングパーサーを備え、ロギングのエラー行を UI で確認できます。
- プレイヤー別勝率やタスク完了、移動ヒートマップ、イベント密度など複数のチャートをサポート。
- Highcharts のテーマとカード内でのクレジット表示を調整する共通ラッパーを提供。

最新の重要な変更（2025-11-21）

- UI: `components/ui/Card.tsx` を導入し、`ChartCard` で統一されたカードレイアウトを提供。
- Highcharts: `components/charts/BaseChart.tsx` に `chart-wrapper` を追加し、`.chart-wrapper .highcharts-credits` を `app/globals.css` で制御。
- テスト/CI: `components/dashboard/ChartCard.test.tsx`（Jest）と Playwright E2E（`tests/ui/credit-placement.spec.ts`）が追加され、カバレッジ自動コメントなど CI が拡張されました。

---


## クイックスタート（ローカル開発）

```bash
# 依存インストール
npm ci

# 開発サーバー
npm run dev
```

<http://localhost:3000> にアクセスしてください。デフォルトで `public/game_history_sample.jsonl` を読み込みます。

:::tip
独自の JSONL ファイルを使う場合: `loadGameHistory({ path: '/your/path.jsonl' })` を呼び出すか UI でアップロードしてください。
:::
:::note
詳しいログのスキーマや記録している項目は `DETAILED_LOGGING_IMPLEMENTATION.md` を参照してください。役職名に関しては `ROLE_NAMES_IN_LOGS.md` を確認してください。
:::

---


## 主な機能

- JSONL（JSON Lines）形式のストリーミング読み込みと堅牢なエラー報告
- 試合毎のイベントタイムライン（会議・キル・サボタージュ等）
- プレイヤー／役職／陣営単位の統計とランキング（勝率、タスク、移動量など）
- 移動ヒートマップ、イベント密度、タイムラインチャートなどの可視化
- モジュール化された transformer で新しいチャートを簡単に追加可能

---


## データフォーマット（JSONL）

各行が 1 試合分の JSON オブジェクトになっている JSONL を前提とします。サンプル: `public/game_history_sample.jsonl`。

主なフィールド:

- `schema`: スキーマ情報 (`game_id`, `generated_at` など)
- `match`: 試合メタ情報（開始時間、マップ、プレイヤー数）
- `players`: 各プレイヤー情報（ID、ロール、カウンタ、timeseries の参照など）
- `events`: キル・サボタージュ・会議など時間順のイベント配列
- `timeseries`: 移動スナップショットなどの時系列データ

JSONL パーサー: `lib/jsonl-parser.ts`（ストリーミング実装、`JsonLineError` を収集）

---


## 開発ガイド（概要）

主要ファイル:

- `lib/jsonl-parser.ts` — JSONL のストリーミング読み込みとエラー収集
- `lib/data-transformers/*` — 生ログ → グラフ用データに変換する純粋関数群
- `hooks/useGameAnalytics.ts` — データ読み込みと transformer の連携ポイント
- `components/charts/BaseChart.tsx` — Highcharts 初期化、ラッパー
- `components/ui/Card.tsx` — 汎用カードレイアウト（`ChartCard` がこれを利用）
- `components/dashboard/ChartGrid.tsx` — 描画するチャート群をレイアウト

新しいチャートを追加する手順:

1. `lib/data-transformers/` に transformer を追加
2. `lib/data-transformers/index.ts` にエクスポート
3. `components/charts/` にチャートコンポーネントを作成（`BaseChart.tsx` を再利用）
4. `hooks/useGameAnalytics.ts` に出力を追加し `ChartGrid` へ渡す
5. unit test（transformer）・UI test（チャート）を追加

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
- Lint 自動修正: `npm run lint:fix`
- CI: `npm run lint:ci`  # PR で実行されます


### カバレッジ

```bash
npm run test:coverage
```

結果は `coverage/lcov-report/index.html` をブラウザで開いて確認できます。CI は coverage レポートをアーティファクトとして保存し、PR にコメントを投稿する仕組みがあります。


### E2E (Playwright)

ローカル:

1. `npm run dev` を別ターミナルで起動
2. `npm run e2e`

便利なスクリプト:

- `npm run e2e:dev` — dev 環境向け（server を待ちます）
- `npm run e2e:ci` — CI と同じフローでビルドして検証

CI: GitHub Actions で `npm run build && npm run start` → `npx playwright test` を実行します。

テストは `*.test.ts`, `*.test.tsx` の命名規則です。transformer などのビジネスロジックはユニットテストを追加してください。

---


## ビルド & デプロイ

```bash
# Production build
npm run build

# Static export (ex: GitHub Pages)
npx next export
```

`next.config.ts` で `output: 'export'` が有効なので静的サイトとしてエクスポートできます。GitHub Pages などで公開する際は `basePath` の設定に注意してください。

---


## スクリプト（ローカル検査用）

このリポジトリにはかつてローカル検査用スクリプトがありましたが、現在は削除されています。
必要であれば簡単な Node スクリプトを作成して当地の `public/game_history_sample.jsonl` を解析してください。

---



## PR（簡易ガイド）

- ブランチ名: `feature/<short-desc>` / `fix/<short-desc>` を推奨
- PR タイトル: `[scope] <短 description>`（例: `[charts] Add movement chart`）
- 必ず `npm run lint` と `npm run test` を通してください
- ログスキーマに変更がある場合は `DETAILED_LOGGING_IMPLEMENTATION.md` と `types/game-data.types.ts` を更新してください

---



## 参考（リポジトリ内）

- `DETAILED_LOGGING_IMPLEMENTATION.md` — ログスキーマとイベント設計
- `ROLE_NAMES_IN_LOGS.md` — 役職名の一覧
- `AGENTS.md` — エージェント向け作業ガイド
- `PLAN.md` — ロードマップ

---

ご不明点は issue を作成してください。

