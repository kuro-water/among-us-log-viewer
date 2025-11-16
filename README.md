# AMONG US ゲーム統計分析

AMONG USのゲーム履歴を可視化・分析するWebアプリケーションです。

## 機能

- **統計概要**: ゲーム数、プレイヤー数、役職数、平均ゲーム時間の表示
- **プレイヤー勝率ランキング**: プレイヤーごとの勝率をチャートで表示
- **ロール勝率ランキング**: 役職ごとの勝率をチャートで表示
- **勝利チーム分布**: チームごとの勝利数を円グラフで表示
- **プレイヤー×役職ヒートマップ**: プレイヤーと役職の組み合わせによるプレイ回数と勝率を色分けで表示
- **フィルター機能**: 日時範囲やゲーム数でデータを絞り込み
- **ソート機能**: テーブルの各列をクリックしてソート

## 使い方

1. `game_history.jsonl` にゲーム履歴データを配置
2. `index.html` をブラウザで開く
3. フィルターを使ってデータを絞り込み可能

## データ形式

`game_history.jsonl` は1行につき1ゲームのJSON形式です：

```json
{
  "start_time": "2025-01-15T20:30:00",
  "end_time": "2025-01-15T20:45:00",
  "winner_team": "Crewmate",
  "players": [
    {
      "player_name": "Player1",
      "main_role": "Crewmate",
      "is_winner": true,
      "tasks_completed": 10,
      "tasks_total": 10
    }
  ]
}
```

## 技術スタック

- HTML/CSS/JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [Chart.js](https://www.chartjs.org/) - グラフ描画
- [anime.js](https://animejs.com/) - アニメーション

## ファイル構成

```
among-us-log-viewer/
├── index.html          # メインHTML
├── styles.css          # カスタムスタイル
├── app.js              # アプリケーションロジック
├── game_history.jsonl  # ゲーム履歴データ
└── README.md           # このファイル
```

## ライセンス

MIT
