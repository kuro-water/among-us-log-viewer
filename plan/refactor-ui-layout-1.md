---
goal: "UI リファクタリングとレイアウト修正（Highcharts のクレジット配置改善を含む）"
version: 1.0
date_created: 2025-11-20
last_updated: 2025-11-20
owner: "kuro-water / UI Team"
status: 'In progress'
tags: ["refactor", "ui", "layout", "charts", "highcharts"]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

この実装計画は、リポジトリ `among-us-log-viewer` の UI を整理し、レイアウト崩れの修正を目的とします。主な例として、Highcharts のクレジット（Highcharts のロゴ・リンク）が ChartCard の外に表示されてしまう問題の修正を含みます。計画は自動実行可能で、各タスクはファイルパス・関数名・変更内容（パッチ）を明示します。

## 1. Requirements & Constraints

- **REQ-001**: Next.js / App Router 構成を維持すること。server/client コンポーネントの境界を破壊しない。
- **REQ-002**: 高信頼な chart 挙動（Highcharts）を破壊しない。Highcharts のモジュール初期化は `components/charts/BaseChart.tsx` で済ませる。
- **REQ-003**: 既存の Tailwind CSS 構文・デザインシステムに従う。
- **REQ-004**: 自動テスト（Jest）を追加し、既存のテストが通る状態を維持する。
- **REQ-005**: ライセンス遵守 — Highcharts クレジット表示は合法的必要性がある可能性がある。**SEC-001** を参照。
- **SEC-001**: Highcharts の商用ライセンス/表示ルールを確認し、クレジットの表示を抑止する場合は法的に問題がないことを確認する。プロジェクトの LICENSE または運用上の方針に従ってください。
- **CON-001**: 外部パッケージの追加は原則避ける（根本的に必要なら理由を明記して `DEP-00X` を追加）。
- **GUD-001**: UI 変更は段階的に行うこと。まず視覚的に安全なパッチ（スタイル修正）を行い、その後同一コンポーネントのリファクタリングを行う。
- **PAT-001**: 「単一責任」「小さな変更」「テストファースト」の原則に従い、各タスクは小さく分割する。

## 2. Implementation Steps

### Implementation Phase 1 — Baseline と安全な修正

- GOAL-001: ビルド・テストのベースラインを取得し、最小限のレイアウト修正を適用して Highcharts のクレジットがカード外に出ないようにする。

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | テスト・ビルドのベースライン取得: `npm ci` → `npm run test` → `npm run lint` を実行して失敗箇所を記録する。 | | |
| TASK-001 | テスト・ビルドのベースライン取得: `npm ci` → `npm run test` → `npm run lint` を実行して失敗箇所を記録する。 | ✅ | 2025-11-21 |
| TASK-002 | `components/charts/BaseChart.tsx` に wrapper 用のクラス `chart-wrapper` を追加する。実装: `return <div className={["chart-wrapper", className].filter(Boolean).join(" ")}>` を用いる。目的: Highcharts の `.highcharts-credits` を `.chart-wrapper` 内でポジション制御するため。 | ✅ | 2025-11-21 |
| TASK-003 | `app/globals.css` にスタイルを追加し、chart wrapper 内に Highcharts のクレジットを固定する。 | ✅ | 2025-11-21 |

```css
/* /components/charts 整合用 */
.chart-wrapper { position: relative; }
.chart-wrapper .highcharts-credits { position: absolute !important; right: 1rem !important; bottom: 1rem !important; z-index: 10; }
```

目的: Highcharts により自動挿入されるクレジットをカード内の適切な位置に固定する（カードの外に出ないように）。
| TASK-004 | 高可読性のため、`components/dashboard/ChartCard.tsx` の `section` に `relative` を付与し、overflow での切り抜きを制御する。実装: `className` 配列に `relative` を追加。検証: カード外のクレジット問題再現後、上記 CSS で修正されていることを確認する。 | ✅ | 2025-11-21 |
| TASK-005 | `config/highcharts-theme.ts` に `credits: { enabled: false }` のオプションを追加する（オプション: `CREDITS_SHOW` 環境フラグ経由で切り替え可能にする）。目的: 既定でクレジットを非表示にしてレイアウト崩れを確実に防ぐ。ライセンス要件により必要なら無効化を行う。 | | |
| TASK-005 | `config/highcharts-theme.ts` に `credits: { enabled: false }` のオプションを追加する（オプション: `CREDITS_SHOW` 環境フラグ経由で切り替え可能にする）。目的: 既定でクレジットを非表示にしてレイアウト崩れを確実に防ぐ。ライセンス要件により必要なら無効化を行う。 | ⛔ | 2025-11-21 |

> Completion criteria for Phase 1:

- `npm run test` がローカルでパスする (既存テスト & new tests) と合格する。
- 例に挙げた「Highcharts のロゴがカード外に表示される」問題がブラウザで再現しない (ローカル dev 環境で確認)。

### Implementation Phase 2 — UI リファクタリング: カード・レイアウトの整理

- GOAL-002: `ChartCard` を `components/ui/` に収めるなど、UI 系コンポーネントの再編を行い、デザインパターンを統一する。

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | 新しい汎用 Card コンポーネント `components/ui/Card.tsx` を作成する。実装: `export function Card(props) { return <section className="card-base ..."> ... }` を提供。`components/dashboard/ChartCard.tsx` はこれをラップして置換する（破壊的変更は禁止） | | |
| TASK-006 | 新しい汎用 Card コンポーネント `components/ui/Card.tsx` を作成する。実装: `export function Card(props) { return <section className="card-base ..."> ... }` を提供。`components/dashboard/ChartCard.tsx` はこれをラップして置換する（破壊的変更は禁止） | ✅ | 2025-11-21 |
| TASK-007 | `components/dashboard/ChartGrid.tsx` に対して、カードの spacing/ grid 指定が一貫するようにプロパティ化 (例: `span` prop を `Card` に渡す)。目的: レスポンシブレイアウトの一貫性向上。 | | |
| TASK-007 | `components/dashboard/ChartGrid.tsx` に対して、カードの spacing/ grid 指定が一貫するようにプロパティ化 (例: `span` prop を `Card` に渡す)。目的: レスポンシブレイアウトの一貫性向上。 | ✅ | 2025-11-21 |
| TASK-008 | `components/charts/BaseChart.tsx` の `className` 指定を `chart-wrapper` と合流し、chart 固有の `data-testid` を追加 (`data-testid="chart-wrapper"`)。目的: テストや E2E による検証をしやすくする。 | | |
| TASK-008 | `components/charts/BaseChart.tsx` の `className` 指定を `chart-wrapper` と合流し、chart 固有の `data-testid` を追加 (`data-testid="chart-wrapper"`)。目的: テストや E2E による検証をしやすくする。 | ✅ | 2025-11-21 |
| TASK-009 | ドキュメント更新: `AGENTS.md` と README の UI section にリファクタリング方針を追加。 | | |
| TASK-009 | ドキュメント更新: `AGENTS.md` と README の UI section にリファクタリング方針を追加。 | ✅ | 2025-11-21 |
| TASK-013 | `components/dashboard/` 下の `ChartCard` usages が `components/ui/Card.tsx` を使っていることを確認し、必要であれば `span` prop を渡して一貫化する。 | ✅ | 2025-11-21 |

> Completion criteria for Phase 2:

- Card コンポーネントの既存の使用箇所がすべて動作している。
- Tailwind class の一貫性が確保され、`components/ui/Card.tsx` への移行でスタイル差分がない（ある場合は 1:1 マッピングで置換）。

### Implementation Phase 3 — テスト強化と自動化

- GOAL-003: UI の回帰を防ぐための単体テストと E2E（Playwright など）を追加する。

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-010 | `components/dashboard/ChartCard.test.tsx` を作成し、見出しと children が render されること、`chart-wrapper` との互換性を確認する。 | | |
| TASK-010 | `components/dashboard/ChartCard.test.tsx` を作成し、見出しと children が render されること、`chart-wrapper` との互換性を確認する。 | ✅ | 2025-11-21 |
| TASK-011 | `__mocks__/highcharts-react-official.tsx` を作り、Jest で Highcharts を安全にテストできるようにする。詳細: Highcharts React をモックして `.highcharts-credits` を含むようにし、`BaseChart` の wrapper によるクレジットの配置を検証する。 | | |
| TASK-011 | `__mocks__/highcharts-react-official.tsx` を作り、Jest で Highcharts を安全にテストできるようにする。詳細: Highcharts React をモックして `.highcharts-credits` を含むようにし、`BaseChart` の wrapper によるクレジットの配置を検証する。 | ✅ | 2025-11-21 |
| TASK-012 | E2E（optional）: `tests/ui/credit-placement.spec.ts` で dev server を起動し、Playwright を使って Chart にクレジットがカード領域内に収まっているかを検証する。1) `page.goto('/')` 2) `locator('.chart-card .highcharts-credits').boundingBox()` を確認。 | | |
| TASK-012 | E2E（optional）: `tests/ui/credit-placement.spec.ts` で dev server を起動し、Playwright を使って Chart にクレジットがカード領域内に収まっているかを検証する。1) `page.goto('/')` 2) `locator('.chart-card .highcharts-credits').boundingBox()` を確認。 | ✅ | 2025-11-21 |
| TASK-012a | CI への Playwright E2E 統合: `playwright.config.ts` と `.github/workflows/playwright-e2e.yml` を追加し、PR で E2E が実行されるようにした。 | ✅ | 2025-11-21 |

> Completion criteria for Phase 3:

- Jest テストで `chart-wrapper` が正しく `BaseChart` で使われていることを検証するテストがパス。
- E2E テスト（Playwright）で「Highcharts のクレジットがカード範囲内」にあることを自動確認できる。Playwright は repo にない場合は `npm i -D @playwright/test` を検討。 | |

### Implementation Phase 4 — 安全なリファクタリング完了と cleanup

- GOAL-004: すべての既存コードの利用箇所を修正して、リファクタリング後の imports/props が通ることを保証する。

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | `components/dashboard/` 下のコードを `components/ui/Card.tsx` を使うように書き換え。置換は `import { ChartCard }` から `import { Card as ChartCard }` へ（後方互換）。 | | |
| TASK-014 | ESLint/TS warnings を修正: `npm run lint` を実行して残りのスタイル/型警告を修正する。 | | |
| TASK-014 | ESLint/TS warnings を修正: `npm run lint` を実行して残りのスタイル/型警告を修正する。 | ✅ | 2025-11-21 |
| TASK-015 | ドキュメント更新: 追加した API とテストの実行方法を README と AGENTS.md に記載。 | | |
| TASK-015 | ドキュメント更新: 追加した API とテストの実行方法を README と AGENTS.md に記載。 | ✅ | 2025-11-21 |

> Completion criteria for Phase 4:

- `npm run lint` & `npm run test` が通る。
- `npm run build` が正常に完了する（`next build`）。

## 3. Alternatives

- **ALT-001**: Highcharts クレジットをアプリ全体で無効化してしまう（`Highcharts.setOptions({ credits: { enabled: false } })`）。メリット: 簡潔、レイアウト崩れが完全に防げる。デメリット: ライセンス表示の有無を確認する必要がある。
- **ALT-002**: ChartCard 側で overflow を `visible` にして外にはみ出す要素も許容する。メリット: 高charts のクレジットが見えるまま。デメリット: 見栄えの面でカードの丸角が崩れる、またツールチップの重なり等を管理しにくい。
- **ALT-003**: BaseChart の wrapper で credits DOM を検出して DOM を移動 (JS でリポジション)。メリット: 高い制御性を持つ。デメリット: DOM 操作（非 React 的）で brittle になりやすい。

本計画では **ALT-001** と **ALT-002** を併用できるようにする（theme の既定は無効、UI 側で再表示可能にする）。これはバージョンの組み合わせで柔軟に対応するため。

## 4. Dependencies

- **DEP-001**: Highcharts (既存) — `highcharts` と `highcharts-react-official`。
- **DEP-002**: Tailwind CSS（既存） — UI スタイル・クラスを維持。
- **DEP-003**: Jest + @testing-library/react（既存） — テスト。Playwright で E2E を追加する場合は `@playwright/test`（開発依存）を追加する。

## 5. Files

- **FILE-001**: `components/charts/BaseChart.tsx` — chart wrapper を `chart-wrapper` class にしてデータ属性を追加。 | REQUIRED |
- **FILE-002**: `components/dashboard/ChartCard.tsx` — `section` に `relative`（と必要なら overflow control）を付与。 | REQUIRED |
- **FILE-003**: `app/globals.css` — `.chart-wrapper` と `.chart-wrapper .highcharts-credits` のスタイル追加。 | REQUIRED |
- **FILE-004**: `config/highcharts-theme.ts` — `credits` オプションを追加（`enabled: false` を既定）。 | RECOMMENDED |
- **FILE-005**: `components/ui/Card.tsx` — 汎用 Card コンポーネント。 | OPTIONAL |
- **FILE-006**: `components/dashboard/ChartGrid.tsx` — Card の `span` prop 反映や属性変更。 | OPTIONAL |
- **FILE-007**: `__mocks__/highcharts-react-official.tsx` — Jest 用の簡易 mock。 | REQUIRED FOR TESTING |
- **FILE-008**: `components/dashboard/ChartCard.test.tsx` — Test file to assert wrapper class and children. | REQUIRED FOR TESTING |

## 6. Testing

- **TEST-001**: Unit test `components/dashboard/ChartCard.test.tsx` asserts Card title, description, children, and that `chart-wrapper` exists if `BaseChart` is used inside.
- **TEST-002**: Unit test mocking `highcharts-react-official` that asserts `.chart-wrapper .highcharts-credits` exists and is positioned within the wrapper (non-zero bounding box within wrapper's bounds). Use `@testing-library/react` and `jest-dom` matchers.
- **TEST-003**: E2E Playwright test `tests/ui/credit-placement.spec.ts` to assert `getBoundingClientRect()` for `.highcharts-credits` is inside `.chart-wrapper`. Step: start dev server, visit main dashboard, locate elements. (Optional based on CI environment.)

## 7. Risks & Assumptions

- **RISK-001**: Highcharts クレジットを取り除くとライセンス条項に抵触する場合がある。→ **SEC-001** で確認
- **RISK-002**: `.chart-wrapper .highcharts-credits` の CSS override が Highcharts の別設定や styledMode と競合する可能性がある。→ 追加 CSS は `!important` を使用して enforce するが、ルールを最小限にする。
- **ASSUMPTION-001**: すべての charts は `BaseChart` を通してレンダリングされる。もし生の Highcharts を別所で使っている場合、同様の wrapper を追加する必要がある。

## 8. Related Specifications / Further Reading

- AGENTS.md — プロジェクトの大まかな設計方針（`components/charts/BaseChart.tsx`、`components/dashboard` の説明あり）
-- Highcharts JS Options — [https://api.highcharts.com/highcharts/credits](https://api.highcharts.com/highcharts/credits)
-- Tailwind CSS — [https://tailwindcss.com](https://tailwindcss.com)

--

Checklist: この実装計画を実行する前に、以下のコマンドでベースライン確認を推奨します。

```bash
npm ci
npm run test
npm run lint
npm run dev  # UI を目視で確認するための手順
```
