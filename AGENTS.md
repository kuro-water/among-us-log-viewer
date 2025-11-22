# AGENTS.md — Among Us Log Viewer (agent 向け)

このファイルは自動化エージェントや開発者がこのリポジトリで作業する際に必要な技術的コンテキスト、実行コマンド、テスト／CI の注意点、よくある障害の対処法などをまとめたドキュメントです。README.md を補完し、エージェントが自律的に貢献できることを目指します。

更新日: 2025-11-22

---

## 要点（短く）

- このアプリは Next.js (App Router) で構築されたフロントエンドです。ブラウザ上で JSONL ログを読み込み、Highcharts による可視化（ヒートマップ、勝率、移動タイムライン等）を行います。
- サンプル JSONL: `public/game_history_sample.jsonl`（1 行 = 1 試合）。
- 重要: 静的エクスポート (GitHub Pages 等) では `basePath` が付与されるため、絶対パス(`/...`)を使うと 404 を招くことがあります。loader はこの問題を避けるため相対パスを優先する設計です（詳細は下記）。

---

## 最初に見るべき場所

- `app/page.tsx` — ダッシュボードのエントリ / UI 組み立て
- `hooks/useGameAnalytics.ts` — JSONL の読み込みと transformer のオーケストレーション
- `lib/jsonl-parser.ts` — ストリーミング JSONL パーサ (`loadGameHistory`)
- `lib/data-transformers/` — 全 transformer（純粋関数）
- `components/charts/`, `components/dashboard/`, `components/ui/` — UI / チャート実装

---

## JSONL 読み込みの挙動（重要）

1. まず相対パス `game_history.jsonl` を試します（サイト管理者が置いた実データを優先）
2. 見つからない、または games が 0 件なら `public/game_history_sample.jsonl` をフォールバック

理由: 静的 export + basePath の組み合わせで絶対パスを使うとドメインルートを参照して 404 になるため、相対パスの優先が安全です。

---

## 開発 / 実行（速攻コマンド）

Node.js 18+ を想定しています。

依存のインストール:

```bash
npm ci
# or pnpm install
# or yarn install
```

開発サーバー:

```bash
npm run dev
# http://localhost:3000
```

静的ビルド（GitHub Pages 用）:

```bash
npm run build && npx next export
```

---

## テスト

### ユニット / 統合（Jest + @testing-library）

```bash
npm test
npm run test:watch
```

### E2E（Playwright）

```bash
npm run e2e:setup   # 初回ブラウザをインストール
npm run e2e         # ローカルの dev サーバーに対して実行
npm run e2e:ci      # CI スタイル: build -> export -> serve -> run tests
```

CI の E2E は `DISABLE_BASEPATH` を切り替えるなどして basePath による失敗を防ぐ仕組みがあります。

---

## 変更作業時のガイドライン / コードスタイル

- TypeScript を活用し、型を明示してください。
- React: functional components + hooks。クライアント専用は `'use client'` を指定。
- スタイル: Tailwind の既存パターンに従う。
- 変換ロジックは純粋関数にして単体テストを追加。
- Highcharts は Jest テストで `__mocks__/highcharts-react-official.tsx` を利用。
- Lint: `npm run lint` / `npm run lint:ci`（CI は警告で fail）

PR チェックリスト（推奨）:

- ブランチ名: `feature/<short-desc>` / `fix/<short-desc>`
- タイトル: `[scope] Short description` 例: `[charts] Add movement chart`
- 必須チェック: `npm ci`, `npm run lint`, `npm test` が全て通ること

---

## 新しいチャートを追加する（短縮レシピ）

1. `lib/data-transformers/<name>.ts` に transformer を実装しユニットテストを追加
2. `lib/data-transformers/index.ts` と types を更新
3. `components/charts/<Name>.tsx` を作成し `BaseChart.tsx` でラップ
4. `hooks/useGameAnalytics.ts` に統合し `components/dashboard/ChartGrid.tsx` に追加
5. 必要なテスト（変換ロジックとコンポーネント）を追加し全テストを通す

---

## よくあるトラブルとデバッグ

- デプロイで `Failed to load game history (404 ...)` が出る場合: `basePath` と fetch の絶対/相対パスを確認してください。相対パスを優先する設計です。
- JSONL の不正な行は `JsonLineError` として収集され、UI に表示されます（`lib/jsonl-parser.ts` を参照）。パーサー仕様を変えたらパース・エラーのテストを追加してください。

---

## セキュリティ / テストデータの注意

- `public/game_history_sample.jsonl` はサンプルです。実運用データやシークレットは置かないでください。

---

## エージェント向け注意（作業方針）

- 変更は小さく、テストカバレッジを追加してからマージしてください。
- サンプル JSON を壊すとテストや UI に影響するため、スキーマの変更は `types/game-data.types.ts` とパーサー／変換のテストを必ず更新してください。

---

## 便利なショートコマンド

```bash
# Install
npm ci

# Dev
npm run dev

# Tests
npm test

# Playwright / E2E
npm run e2e:setup
npm run e2e

# Build / Static export
npm run build && npx next export

# Lint
npm run lint
npm run lint:ci
```

---

作業前はこのファイルと関連テストを読んでください。特にデータフォーマットや API へ影響する変更はテストを追加し、既存のサンプル互換性を壊さないようにしてください。
