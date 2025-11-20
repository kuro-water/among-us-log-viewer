# AGENTS.md

## Project Overview

Among Us Log Viewer は、Among Us の詳細ログ（JSONL）を読み込み、ゲームの進行状況と統計情報を可視化する Next.js（App Router）アプリケーションです。Highcharts と TypeScript を使って各種の可視化ダッシュボードを提供します。

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
- Chart components live under `components/charts/` and use `components/charts/BaseChart.tsx` as a helper wrapper for Highcharts.
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

## How to add a new chart (recommended steps)

1. Add a new transformer function in `lib/data-transformers/<name>.ts` that implements the desired aggregation and exported function that accepts `TransformerOptions`.
1. Export the transformer from `lib/data-transformers/index.ts` and add types to `lib/data-transformers/types.ts` if needed.
1. Add a chart component in `components/charts`, using `BaseChart.tsx` and the existing chart patterns.
1. Import the chart into `components/dashboard/ChartGrid.tsx` (or another appropriate container) and wire the transformer into `hooks/useGameAnalytics.ts`.
1. Add sample test(s) for the transformer and/or chart: transformer unit tests (`__tests__` or `*.test.ts` near `lib/data-transformers`) and chart rendering tests (`@testing-library/react` in `components/charts`).

1. Run `npm run test` and `npm run lint`, update documentation if necessary.


## Testing & Linting

- Unit & integration tests: `npm run test` (Jest + ts-jest + @testing-library). Test files are `*.test.ts` or `*.test.tsx`.
- Watch mode: `npm run test:watch`.
- Lint: `npm run lint`. The ESLint config is in `eslint.config.mjs`.

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
