# Among Us Log Viewer

Among Us のゲームログデータ (`.jsonl` 形式) を読み込み、詳細な統計情報やゲームの進行状況を可視化・分析するための Web アプリケーションです。
Next.js (App Router) と Highcharts を使用して構築されています。

## 主な機能

- **ゲーム履歴の可視化**: タイムライン、タスク完了状況、移動履歴などをグラフ化して表示します。
- **統計分析**: 陣営ごとの勝率、プレイヤーごとのパフォーマンス、役職別の統計などを分析できます。
- **詳細ログ対応**: 移動距離、会議ボタン使用率、サボタージュ記録など、Modによって出力された詳細なログデータをサポートしています。

## リポジトリ構造

プロジェクトの主要なディレクトリ構成は以下の通りです。

```text
.
├── app/                 # Next.js App Router のページ定義とレイアウト
│   ├── globals.css      # グローバルスタイル
│   ├── layout.tsx       # ルートレイアウト
│   └── page.tsx         # メインページ（ダッシュボード）
├── components/          # UI コンポーネント
│   ├── charts/          # Highcharts を使用した各種グラフコンポーネント
│   └── dashboard/       # ダッシュボード用のカードやレイアウトコンポーネント
├── config/              # アプリケーション全体の設定
│   ├── factions.ts      # 陣営（Faction）の定義とカラー設定
│   ├── roles.ts         # 役職（Role）のリスト定義
│   ├── role-translations.ts # 役職名の日本語翻訳マッピング
│   └── highcharts-theme.ts  # グラフのテーマ設定
├── hooks/               # カスタム React Hooks
│   └── useGameAnalytics.ts # ゲームデータの集計・分析ロジックを扱うフック
├── lib/                 # ユーティリティ関数、データ変換ロジック
│   ├── data-transformers/ # 生ログデータをグラフ用データに変換する処理群
│   ├── jsonl-parser.ts    # JSONL 形式のログパーサー
│   └── role-mapping.ts    # 役職と陣営のマッピングロジック
├── public/              # 静的ファイル (サンプルログなど)
└── types/               # TypeScript 型定義
    └── game-data.types.ts # ゲームログデータの型定義
```

## 開発の始め方

開発サーバーを起動して、ローカルでプレビューを確認できます。

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認してください。

## 技術スタック

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: HeroUI (NextUI)
- **Visualization**: Highcharts, Highcharts React
- **Icons**: Lucide React
