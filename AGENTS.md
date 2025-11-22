# AGENTS.md — Among Us Log Viewer（エージェント向け）

このリポジトリで自動化エージェントや開発者が効率よく作業するための機械向けドキュメントです。
README.md を補完する目的で、プロジェクト構成、開発フロー、テストと CI、よくあるトラブルシュート、そしてエージェントが自律的に安全に変更できるための具体的手順をまとめています。

更新日: 2025-11-22

---

## 要点（短く）

- Next.js (App Router), TypeScript, TailwindCSS ベースの SPA（フロントエンド可視化アプリ）です。Highcharts + React でブラウザに可視化を行います。
- サンプルログ: `public/game_history_sample.jsonl`（1 行 = 1 試合）。実データやシークレットを public に置かないでください。
- 静的エクスポート（GitHub Pages など）や basePath を使う環境では、fetch に絶対パス(`/...`)を使うと 404 が発生します。実装は相対パス優先で安全に設計されています。CI で E2E を回す際には `DISABLE_BASEPATH=true` の利用に注意してください。

---

## 最初に見るべき場所（エージェント向け即戦力）

- `app/page.tsx` — ダッシュボードのエントリポイント
- `hooks/useGameAnalytics.ts` — JSONL の読み込みと transformer の統括
- `lib/jsonl-parser.ts` — ストリーミング JSONL パーサ（loadGameHistory）
- `lib/data-transformers/` — ゲームデータ変換ロジック（純粋関数）
- `types/game-data.types.ts` — ログの型定義（変更時は必ず更新）
- `components/charts/`, `components/dashboard/`, `components/ui/` — UI / 可視化コンポーネント
- `__mocks__/highcharts-react-official.tsx` — Jest テストで Highcharts をモックする実装

---

## JSONL 読み込みの挙動（重要）

1. まず相対パス `game_history.jsonl` を参照（サイト管理者が提供する実データを優先）
2. 見つからない、あるいは games が 0 件なら `public/game_history_sample.jsonl` をフォールバック

理由: 静的 export や basePath のある環境で絶対パスをそのまま使うと 404 になるため、相対パス優先で安全に実装されています。

---

## 開発 / 実行（速攻コマンド）

前提: Node.js 18 以上（ローカルの Node バージョンに依存）。

依存のインストール:

```bash
npm ci
# または pnpm install / yarn install
```

開発サーバー:

```bash
npm run dev
# ローカル: http://localhost:3000
```

静的ビルド (GitHub Pages 用):

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

Jest のコンフィグ (`jest.config.ts`) と事前セットアップ (`jest.pre-setup.ts` / `jest.setup.ts`) を確認してください。Highcharts は `__mocks__/highcharts-react-official.tsx` を使ってモックされています。

### E2E（Playwright）

```bash
npm run e2e:setup   # 初回ブラウザをインストール
npm run e2e         # Playwright を直接実行
npm run e2e:dev     # dev サーバーに wait-on してから実行
npm run e2e:ci      # CI 流れ: export -> serve(out) -> run tests
```

備考: CI では basePath による 404 を防ぐため `DISABLE_BASEPATH=true` を用いるフローがあります（package.json のスクリプト参照）。Playwright テストは `playwright.config.ts` を確認してください。

---

## 変更作業時のガイドライン / コードスタイル

- TypeScript を活用し、型を必ず明示する（strict を想定）。
- React コンポーネントは基本的に Function Component + Hooks。クライアント専用ロジックは `'use client'` を明記。
- App Router (app/) を採用しているので Server Component と Client Component の責務を守ること。Server コンポーネントで client-only のライブラリを `next/dynamic` で { ssr: false } するのは非推奨（エラーの原因）。
- スタイルは Tailwind の既存パターンに従う。
- transformer / 変換ロジックは純粋関数にしてユニットテストを付けること。型の変更を伴う場合は `types/game-data.types.ts` を更新しテストを追加。
- Highcharts に関しては Jest 用のモックがあるため（`__mocks__/highcharts-react-official.tsx`）テストは壊れにくいですが、レンダリングや props に変更を加える場合はモックを見直してください。
- Lint: `npm run lint` / `npm run lint:ci`（CI では警告をエラーにしている）

PR チェックリスト（必須推奨）:

- ブランチ名: `feature/<short-desc>` / `fix/<short-desc>`
- PR タイトル: `[scope] Short description` 例: `[charts] Add movement chart`
- 必須チェック: `npm ci`、`npm run lint`、`npm test` がすべて通ること

---

## 新しいチャートを追加する（短縮レシピ）

1. `lib/data-transformers/<name>.ts` に transformer を実装しユニットテストを追加
2. `lib/data-transformers/index.ts` と types を更新
3. `components/charts/<Name>.tsx` を作成し `BaseChart.tsx` でラップ
4. `hooks/useGameAnalytics.ts` に統合し `components/dashboard/ChartGrid.tsx` に追加
5. 必要なテスト（変換ロジックとコンポーネント）を追加し全テストを通す

※ 変更は小さなコミットに分割し、型やインポートが壊れないことをローカルで確認してください。

---

## よくあるトラブルとデバッグ

- デプロイで `Failed to load game history (404 ...)` が出る場合: `basePath` と fetch の絶対/相対パスを確認してください。相対パスを優先する設計です。
- JSONL の不正な行は `JsonLineError` として収集され、UI に表示されます（`lib/jsonl-parser.ts` を参照）。パーサー仕様を変えたらパース・エラーのテストを追加してください。

追加のよくある原因:

- E2E が 404 になる: `basePath` の扱い、または静的エクスポート後の serve ポートが正しくない場合がある。CI 用スクリプトの `DISABLE_BASEPATH=true` を参照。
- Playwright が flakey: UI アニメーション (GSAP) や遅延処理が原因のことがある。`await expect(...)` 系の web-first アサーションを使い、アニメーションをオフにする（テスト中）かテスト側で十分待つ。
- TypeScript の型エラー/ESLint は CI で厳格にチェックされるため、リファクタ/移動時は `npm run lint` とタイプチェックを実行すること。

---

## セキュリティ / テストデータの注意

- `public/game_history_sample.jsonl` はサンプルです。実運用データやシークレットは置かないでください。

Secrets: リポジトリに秘密情報を置かないこと。CI のシークレットは GitHub Actions の Secrets を利用してください。

---

## エージェント向け注意（作業方針）

- 変更は小さく、テストカバレッジを追加してからマージしてください。
- サンプル JSON を壊すとテストや UI に影響するため、スキーマの変更は `types/game-data.types.ts` とパーサー／変換のテストを必ず更新してください。

エージェント向け短いガイドライン:

- まず `npm ci && npm test` ですべてのテストがパスするのを確認。
- 変更は小さく、単体テストと必要に応じて Playwright E2E を追加する。
- 重大な動作変更をする場合は README と `ROLE_NAMES_IN_LOGS.md`、`config/*`（特に `factions.ts`）を忘れずに更新する。
- 何か不明点があるときは `AGENTS.md` の該当セクションを更新して、次のエージェントが迷わないようにすること。

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

便利なワンライナー例:

```bash
# 個別テスト指定
npm test -- -t "PlayerFactionPlayRateChart"

# e2e をローカル dev サーバーで回す（デバッグ用）
npm run dev & npx wait-on http://localhost:3000 && npm run e2e:dev

# CI 風に静的 export -> serve -> e2e を実行
DISABLE_BASEPATH=true npm run e2e:ci
```

---

作業前はこのファイルと関連テストを必ず読み、既存のサンプル互換性を壊さないように注意してください。
