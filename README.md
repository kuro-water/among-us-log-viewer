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

[![Coverage Status](https://codecov.io/gh/kuro-water/among-us-log-viewer/branch/main/graph/badge.svg)](https://codecov.io/gh/kuro-water/among-us-log-viewer)


### カバレッジ

```bash
npm run test:coverage
```

結果は `coverage/lcov-report/index.html` をブラウザで開いて確認できます。CI は coverage レポートをアーティファクトとして保存し、PR にコメントを投稿する仕組みがあります。

### カバレッジを外部サービスにアップロードする（トークン不要の選択肢）

外部のカバレッジサービスにアップロードすると PR コメントや差分のカバレッジ表示など便利な機能が使えます。注意点は "プライベートリポジトリ" では多くのサービスが token を要求することです。以下はトークンを設定せずに使えることが多い選択肢です（公開リポジトリ向け）。
 
- Codecov (公開リポジトリ): GitHub Actions の公式 `codecov/codecov-action` を使えば、公開リポジトリでは `CODECOV_TOKEN` を用意しなくてもアップロード可能です。

例 (GitHub Actions):

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4
        with:
          files: coverage/lcov.info
```


(プライベートリポジトリでは `secrets.CODECOV_TOKEN` などをセットする必要があります)

- Coveralls (公開リポジトリ): `coverallsapp/github-action` は GitHub Actions の `GITHUB_TOKEN` を利用して動作する場合があり、公開リポジトリでは別途シークレットが不要なケースもあります。プライベートの場合は Coveralls の repo token が必要です。


例 (GitHub Actions):

```yaml

- name: Upload coverage to Coveralls
  uses: coverallsapp/github-action@v2
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

- GitHub Pages に coverage を公開: 外部サービスにアップロードせず、`coverage/lcov-report` を HTML として GitHub Pages に公開する方法があります。これは追加のトークンを不要とし、GitHub Actions の `GITHUB_TOKEN` で完結します。

### PR に Coverage コメントを投稿する（自動）

プルリク作成 / 更新時に CI が coverage を計算して、PR に一覧のようなコメントを自動で投稿するワークフローを追加しました（`.github/workflows/pr-coverage-comment.yml`）。このワークフローの挙動:

- PR が open / update / reopened のときに実行
- `npm run test:coverage` を走らせて `coverage/coverage-summary.json` を生成
- JSON の `total` ブロックから Lines / Statements / Branches / Functions のパーセンテージを読み取り、PR のコメントに Markdown テーブルで投稿
- すでに coverage コメントが存在する場合は更新（複数コメントは増えません）

:::note
PR coverage コメントの改善点:

- キャッシュ: `npm ci` を早くするために `~/.npm` をキャッシュします（`actions/cache`）。
- 並列取消: 新しいコミットで古い実行をキャンセルして実行数を最小化します。
- パスフィルター: ドキュメントのみの変更では coverage ワークフローをスキップするため、`lib/`, `components/` などのパス変更時のみ実行します。
- アーティファクト: coverage の HTML レポートをアップロードして、失敗時でもダウンロード可能にします。
- フォールバック: `coverage/coverage-summary.json` が無い場合はフレンドリーなメッセージを PR に投稿します。
- 差分表示: PR と base のカバレッジ差分を比較してテーブルを表示します。

 
:::

このワークフローにより、レビュー時にカバレッジ概要が一目で見れるようになります。もしコメントのフォーマットを変えたい場合は PR コメントのテンプレートを編集してください（`.github/workflows/pr-coverage-comment.yml`）。

例: `peaceiris/actions-gh-pages` を使ったワークフロー

```yaml

- name: Publish coverage to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./coverage/lcov-report
```

これらの方法は、公開リポジトリなら外部トークンが不要で導入が簡単です。プライベートリポジトリや組織ポリシーの場合は、わずかなシークレット設定や課金が必要になる可能性があるので注意してください。


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

