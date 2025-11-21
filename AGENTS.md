# AGENTS.md

## Project Overview

Among Us Log Viewer は、Among Us の詳細ログ（JSONL）を読み込み、ゲームの進行状況と統計情報を可視化する Next.js（App Router）アプリケーションです。Highcharts と TypeScript を使って各種の可視化ダッシュボードを提供します。

最新情報 (2025-11-21):

- UI リファクタリング: `components/ui/Card.tsx` が導入され、UIのカード統一が行われました。`ChartCard` はこの `Card` をラップして `relative` レイアウトを付与します。
- Highcharts のクレジットをカード内に固定: `components/charts/BaseChart.tsx` に `chart-wrapper` が追加され、`app/globals.css` で `.chart-wrapper .highcharts-credits` の配置を制御します。これによりクレジットがカード外にぶら下がる問題を修正しました（`config/highcharts-theme.ts` の `credits` オプションで切り替え可能; ライセンス要件を確認してください）。
- テスト/CI: `components/dashboard/ChartCard.test.tsx` (Jest) と Playwright E2E `tests/ui/credit-placement.spec.ts` が追加され、`.github/workflows/playwright-e2e.yml` で E2E が PR でも実行されます。

主要な目的：

- クライアント（ブラウザ）で JSONL ファイルを読み込み、解析、集計、可視化する。
- カスタムロールや Mod による詳細ログに対応し、役職・プレイヤー・陣営単位での分析をサポートする。

- ## Quick facts

- Framework: Next.js (App Router)
- Language: TypeScript
- Charts: Highcharts (highcharts-react-official)
- Styling: Tailwind CSS
- Testing: Jest, @testing-library/react

## Required Setup (for developers / agents)

1. Install dependencies (pick a package manager):

```bash
npm ci
# or
pnpm install
# or
yarn install
```

1. Run dev server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

1. Build (production) & static export (optional for GitHub Pages):

```bash
npm run build  # builds the Next.js app
npx next export # export to `out/` (static export due to `output: "export"` in next.config.ts)
```


Notes:

- The app expects a default JSONL source at `/game_history_sample.jsonl`. A sample file is bundled in `public/game_history_sample.jsonl`.
- For static export, `next.config.ts` sets `basePath` when NODE_ENV=production: you may need to set `NODE_ENV=production` before building for GitHub Pages.

## Development workflow & conventions

- UI components are in `components/`.
  - `components/ui/` — shared presentational building blocks (e.g., `Card.tsx`) used across dashboards and pages.
-- Chart components live under `components/charts/` and use `components/charts/BaseChart.tsx` as a helper wrapper for Highcharts. `BaseChart` now wraps charts in a `div.chart-wrapper` and exposes `data-testid="chart-wrapper"` for tests. This wrapper is used to position `.highcharts-credits` inside cards for consistent layout.
- The main dashboard is in `components/dashboard/` and `app/page.tsx` composes the page.
- JSONL parsing is implemented in `lib/jsonl-parser.ts`. It uses streaming parsing and returns typed `GameLog` entries.
- Analytics transformations are implemented in `lib/data-transformers/*` and are pure functions taking `TransformerOptions` and returning chart-ready data.
- `hooks/useGameAnalytics.ts` loads the JSONL and orchestrates the transformations; update this to wire new transformer outputs into the UI.
- Types live under `types/` and `lib/data-transformers/types.ts`.

Code style & patterns:

- Use functional components and hooks in React.
- `use client` is used for client-side components; keep Next.js server/client boundaries in mind.
- Follow the TypeScript types and expand `types/game-data.types.ts` when adding new fields.
- Keep components small, re-usable, and testable.

UI: All presentational components use Tailwind CSS utility classes; follow existing style patterns.

Tip: When adding a new chart, prefer wrapping it in `ChartCard` (which itself uses `Card`) and pass `span` for responsive grid behavior, for example `span="lg:col-span-12"`.

## How to add a new chart (recommended steps)

1. Add a new transformer function in `lib/data-transformers/<name>.ts` that implements the desired aggregation and exported function that accepts `TransformerOptions`.
1. Export the transformer from `lib/data-transformers/index.ts` and add types to `lib/data-transformers/types.ts` if needed.
1. Add a chart component in `components/charts`, using `BaseChart.tsx` and the existing chart patterns. Wrap the chart in a `ChartCard` in `components/dashboard/ChartGrid.tsx` with the desired `span`. Make sure to use `className` for chart height (e.g., `className="h-96"`).
1. Import the chart into `components/dashboard/ChartGrid.tsx` (or another appropriate container) and wire the transformer into `hooks/useGameAnalytics.ts`.
1. Add sample test(s) for the transformer and/or chart: transformer unit tests (`__tests__` or `*.test.ts` near `lib/data-transformers`) and chart rendering tests (`@testing-library/react` in `components/charts`). Use `__mocks__/highcharts-react-official.tsx` to simulate the Highcharts DOM when writing unit tests for chart rendering.

1. Run `npm run test` and `npm run lint`, update documentation if necessary.


## Testing & Linting

- Unit & integration tests: `npm run test` (Jest + ts-jest + @testing-library). Test files are `*.test.ts` or `*.test.tsx`.
- Watch mode: `npm run test:watch`.
- Lint: `npm run lint`. The ESLint config is in `eslint.config.mjs`.
- E2E: Playwright を使った E2E は `npm run e2e` で実行します（dev server が起動している状態で実行）。CI では `Playwright E2E` ワークフローが `npm run build` → `npm run start` を行った後に `npm run e2e` を実行するようになっています。
  ローカル実行メモ:

  - Playwright はブラウザがローカルに必要です。初回は次を実行してください:

    ```bash
    npx playwright install --with-deps
    # or use script
    npm run e2e:setup
    ```

  - 既存の `npm run e2e` スクリプトは Playwright を走らせるのみです。ローカルで実行する際は Dev サーバーを別ターミナルで起動しておくか、CI 用の `e2e:ci` スクリプトを利用してください。

    - Dev server 起動後（別ターミナル）:`npm run dev` → `npm run e2e`（推奨、素早く走らせたいとき）
    - CI 相当の実行（build + serve + test）:`npm run e2e:ci` — こちらはローカルでも利用可能で、ビルドして静的出力を `out/` に作成し、`npx serve@latest out` でローカルファイルを配信、Playwright を実行してからサーバーを停止します。
    - サーバー起動を待つだけ:`npm run e2e:dev` — `npm run dev` でサーバーを立ち上げたまま Playwright を走らせるためのヘルパー（`npx wait-on` を利用）

  - CI 実行: GitHub Actions `Playwright E2E` ワークフローが自動で `npm run build && npm run start` を行い、`npx playwright test` を実行します。

  - ノート: デフォルトでは Next.js の `basePath` が有効な場合（例: GitHub Pages 用に `/among-us-log-viewer` を追加しているとき）、E2E 実行時はビルドに `DISABLE_BASEPATH=true` を設定して `basePath` をオフにする必要があります。`e2e:ci` はこの点を自動化しています。

  - Playwright テストでは、クレジットの位置がプラットフォーム差（フォント・レンダリング差）で微妙にずれることがあります。テストでは小さな誤差（TOLERANCE）を許容することでフレークを抑えています。予期せぬ大きなズレが出る場合は、Highcharts のテーマや CSS を確認してください。
  ローカル実行メモ:

  - Playwright はブラウザがローカルに必要です。初回は次を実行してください:

    ```bash
    npx playwright install --with-deps
    # or use script
    npm run e2e:setup
    ```

  - `npm run e2e` スクリプトは上の `npx playwright install` を実行してから `playwright test` を走らせます。`npm run e2e` を実行する前に `npm run dev` でアプリを起動しておく必要があります（CI は `npm run start` で起動します）。

Tips:

- Use `-t` to run specific tests with `jest -t "regex"`.
- For changes in data transformers, write unit tests with small sample GameLog objects.

## Build & Deployment

- `next.config.ts` uses `output: 'export'`, which indicates the app can be statically exported via `next export`. For GitHub Pages or static hosts, run `next build && next export`.
- For server deployment, use `next start` after `next build` (server side). `npm run start` currently runs `next start`.

## Files of interest

- `app/` - Next.js App Router pages and layout
- `components/` - React components and charts
- `hooks/useGameAnalytics.ts` - Data orchestration hook (loads, parses, transforms)
- `lib/jsonl-parser.ts` - Streaming JSONL reader
- `lib/data-transformers/` - All transformers used by charts
- `public/game_history_sample.jsonl` - Sample data used by the client by default
- `types/game-data.types.ts` - Global types for game data
- `config/highcharts-theme.ts` - global Highcharts theming
 (scripts: カスタムでデータを検査したい場合はローカルに簡易スクリプトを作成してください。以前は `countRoles` / `verifyRoleHeatmap` がありましたが、メンテナンスの都合で削除済みです。)

 実行方法: Node 18+ を想定（必要であればローカルスクリプトを追加して使ってください）。

## Useful commands summary

```bash
# Install
npm ci

# Development server
npm run dev

# Build / Static export
npm run build && npx next export

# Tests
npm run test
npm run test:watch

# Lint
npm run lint
```

## Pull Request guidelines / contribution checks (recommended)

- Branch name: `feature/<short-desc>` or `fix/<short-desc>`.
- PR title: `[<scope>] <short description>` (e.g., `[charts] Add movement chart`)
- Required checks: `npm ci`, `npm run lint`, `npm run test` should pass before merging.
- Add tests for any new business logic (data transformers) or UI components.
- Update `DETAILED_LOGGING_IMPLEMENTATION.md` / `ROLE_NAMES_IN_LOGS.md` / README if data or UX behavior changes.

## Debugging and troubleshooting

- If the app doesn't load the JSONL data, ensure `public/game_history_sample.jsonl` exists or the data path is correctly provided via `loadGameHistory({ path: '/your/path.jsonl' })`.
- Use `console.log()` for quick debugging in client code; for complex issues use the Next dev server which supports HMR and source maps.
- For invalid JSONL lines, `lib/jsonl-parser.ts` collects `JsonLineError` entries so UI can display parsing errors.

## Important notes for agents

- Avoid changing the public sample data structure unexpectedly; prefer backward-compatible changes in parsers/transformers.
- Keep `TransformerOptions` contract stable; transformers should accept `games`, `selectedGameIds?`, and `selectedPlayerIds?`.
- If adding breaking schema changes to the game logs, update `DETAILED_LOGGING_IMPLEMENTATION.md` and `types/game-data.types.ts`, and provide test fixtures.

## Additional resources / docs inside the repo

- `DETAILED_LOGGING_IMPLEMENTATION.md` — schema and logging details
- `ROLE_NAMES_IN_LOGS.md` — role name mapping and expected role values
- `PLAN.md` — roadmap and TODOs

---

If you are an agent contributing code, please read this file carefully before making changes and update it if you find missing or outdated instructions.


Agent checklist (what we changed):

- [x] Added `chart-wrapper` in `BaseChart.tsx` with `data-testid="chart-wrapper"` for tests.
- [x] Added `.chart-wrapper` CSS for `.highcharts-credits` placement in `app/globals.css`.
- [x] Introduced `components/ui/Card.tsx` and `ChartCard` wraps this with `relative` layout.
- [x] Added Jest unit test (`ChartCard.test.tsx`) and Playwright E2E (`tests/ui/credit-placement.spec.ts`).
 
- Notes / follow-ups:

- [ ] Optionally add default `credits` option in `config/highcharts-theme.ts` (check `SEC-001` Highcharts licensing before disabling credits by default).
- [ ] If you plan to hide credits by default, add a `NEXT_PUBLIC_HIGHCHARTS_CREDITS` environment flag in `.env.local` to allow toggling at runtime.
