# リファクタリング報告書

**作成日**: 2025 年 11 月 14 日  
**プロジェクト**: Among Us ゲーム履歴ビューワー  
**現在のバージョン**: v1.4

---

## 📊 ファイル構成分析

| ファイル   | 行数         | 役割             |
| ---------- | ------------ | ---------------- |
| script.js  | 819 行       | ビジネスロジック |
| index.html | 250 行       | UI 構造          |
| style.css  | 330 行       | スタイリング     |
| **合計**   | **1,399 行** | -                |

---

## 🔍 リファクタリング候補

### **優先度 🔴 高** - 実装すべき改善

#### 1. **Chart 設定のモジュール化（script.js）**

**現状**: Chart.js の設定がチャートごとに繰り返されている

```javascript
// 160行以上にわたる繰り返しコード
charts.roleAnalysis = new Chart(ctx, {
    type: 'doughnut',
    data: { ... },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#ffffff' } },
            tooltip: { callbacks: { label: function() { ... } } }
        }
    }
});
```

**改善案**:

-   Chart 設定をテンプレート化する関数を作成
-   共通オプションを定数化
-   チャートタイプごとの設定を分離

**効果**: 行数削減（150 ～ 200 行）、保守性向上

---

#### 2. **グローバル状態管理の整理（script.js）**

**現状**: 9 個のグローバル変数が散在している

```javascript
let gameData = [];
let playerStats = {};
let charts = {};
let allRoles = [];
let filteredGameData = [];
let filterStartDate = null;
let filterEndDate = null;
const ChartClass = window.Chart || null; // 未使用
```

**改善案**:

-   グローバル変数を 1 つの`AppState`オブジェクトに統合
-   `ChartClass`は未使用のため削除
-   ゲッター・セッターで状態管理を一元化

**改善前**:

```javascript
let gameData = [];
let playerStats = {};
let charts = {};
// ... 他9個
```

**改善後**:

```javascript
const AppState = {
    gameData: [],
    playerStats: {},
    charts: {},
    allRoles: [],
    filteredGameData: [],
    filterStartDate: null,
    filterEndDate: null,

    reset() {
        this.gameData = [];
        this.playerStats = {};
        // ...
    },
};
```

**効果**: スコープ汚染の防止、状態管理の明確化

---

#### 3. **イベントリスナーの一元化（script.js）**

**現状**: インラインイベントハンドラが複数ある

```html
<!-- index.html 内のインラインハンドラ -->
<button class="btn btn-primary" onclick="applyFilters()">フィルターを適用</button>
<button class="btn btn-secondary" onclick="clearFilters()">リセット</button>
<button ... onclick="document.getElementById('fileInput').click()">ファイルを選択</button>
```

**改善案**:

-   すべてのイベントを script.js で管理（DOMContentLoaded 時）
-   インラインハンドラを削除
-   責任の分離

**改善前**: HTML に 9 行のインラインハンドラ  
**改善後**: script.js の `initializeEventListeners()` にまとめる

**効果**: セキュリティ向上、デバッグ容易化

---

#### 4. **重複コードの関数化（script.js）**

**現状**: キャンバス要素をリセットする処理が複数回登場

```javascript
// 3箇所で同じパターン
winsChartCtx.width = winsChartCtx.width;
winRateChartCtx.width = winRateChartCtx.width;
roleAnalysisCtx.width = roleAnalysisCtx.width;
```

**改善案**:

```javascript
function resetCanvasContext(elementId) {
    const canvas = document.getElementById(elementId);
    if (canvas) {
        canvas.width = canvas.width;
    }
}
```

**効果**: DRY 原則に従う、버그감소

---

### **優先度 🟡 中** - 望ましい改善

#### 5. **ユーティリティ関数の独立ファイル化**

**現状**: script.js に以下が混在している

-   ユーティリティ関数（formatDate, formatDuration など）
-   UI 更新関数（updatePlayerStatsTable など）
-   ビジネスロジック（analyzeData など）
-   イベントハンドラ

**改善案**: `utils.js` に分離

```javascript
// utils.js
export function formatDate(dateString) { ... }
export function formatDuration(startTime, endTime) { ... }
export function percentageString(value, total) { ... }
```

**効果**: ファイル構成の明確化、再利用性向上

---

#### 6. **HTML のインライン スタイル削除**

**現状**: HTML に 16 個のインラインスタイルがある

```html
<!-- 例 -->
<div style="display: flex; align-items: flex-end; gap: 10px">
    <button class="btn btn-primary" style="flex: 1">
        <div style="max-width: 300px; margin: 2rem auto">
            <ol id="winsRanking" style="list-style: none; padding: 0"></ol>
        </div>
    </button>
</div>
```

**改善案**: style.css に `.filter-controls`, `.chart-container-small` などクラスを追加

**効果**: HTML の簡潔化、保守性向上

---

#### 7. **関数の長さ削減（script.js）**

**長い関数**:

-   `updateGamesList()` - 70 行
-   `updateRankings()` - 170 行
-   `recalculateStats()` - 50 行

**改善案**: 単一責任の原則に従い、各関数を 20 ～ 30 行程度に分割

**例**: `updateRankings()` を以下に分割

-   `renderWinRanking()`
-   `renderWinRateRanking()`
-   `createWinRankingChart()`
-   `createWinRateRankingChart()`

**効果**: テスト容易性、デバッグ効率化

---

#### 8. **ハードコーディングの定数化**

**現状**: 魔法の数字が散在している

```javascript
.slice(0, 15)  // TOP 15
.slice(0, 10)  // TOP 10
.slice(0, 3)   // TOP 3
.filter(p => p.games >= 3)  // 3ゲーム以上
```

**改善案**: script.js の先頭に定数を定義

```javascript
const CONSTANTS = {
    TOP_PLAYERS: 15,
    TOP_RANKINGS: 10,
    TOP_TIMELINE: 3,
    MIN_GAMES_FOR_RATE: 3,
    QUICK_FILTER_OPTIONS: [3, 6, 12, 24, 48, 72, 96, 120, 144, 168, 720],
    CHART_COLORS: {
        impostor: "#ff2e63",
        crewmate: "#00d084",
        other: "#08fdd8",
    },
};
```

**効果**: 数値の意味明確化、保守性向上

---

### **優先度 🟢 低** - 将来の改善

#### 9. **TypeScript への移行**

**理由**:

-   型安全性確保
-   IDE 補完強化
-   大規模化時のバグ防止

**工数**: 高

---

#### 10. **ビルドツールの導入**

**現状**: ファイルを直接読み込み（CDN）

**改善案**: webpack / Vite でのバンドル

**効果**:

-   パフォーマンス向上
-   コード分割
-   ホットリロード

---

#### 11. **テストの追加**

**テスト対象**:

-   `analyzeData()` - ゲームデータ解析
-   `formatDate()` - 日時フォーマット
-   `filterByHours()` - フィルター処理

**フレームワーク**: Jest / Vitest

---

## 📈 優先実装順序

### **Phase 1 (すぐ実装)** - 1 ～ 2 時間

1. グローバル変数を `AppState` に統合
2. インラインハンドラを削除
3. キャンバスリセット処理を関数化
4. ハードコーディングを定数化

**効果**: コード品質向上、50 行削減

---

### **Phase 2 (短期)** - 3 ～ 4 時間

5. Chart 設定のモジュール化（80 行削減）
6. HTML のインラインスタイルをクラスに変換（20 行削減）
7. 長い関数を分割（適切な関数粒度に）

**効果**: 保守性大幅向上、可読性向上

---

### **Phase 3 (中期)** - 4 ～ 5 時間

8. ユーティリティ関数を utils.js に分離
9. テストコード追加（基本部分）

**効果**: 再利用性向上、品質確保

---

### **Phase 4 (将来)** - 実装時間は相談

10. TypeScript への段階的移行
11. ビルドツール導入

---

## 📋 具体的な改善例

### 例 1: グローバル状態管理

**現状**（散在）:

```javascript
let gameData = [];
let playerStats = {};
let charts = {};
// 他6個の変数...
```

**改善後**（集約）:

```javascript
const AppState = {
    gameData: [],
    playerStats: {},
    charts: {},
    allRoles: [],
    filteredGameData: [],
    filterStartDate: null,
    filterEndDate: null,

    reset() {
        /* 状態リセット */
    },
    updateGameData(data) {
        this.gameData = data;
    },
    getCharts() {
        return this.charts;
    },
};
```

---

### 例 2: Chart 設定の関数化

**現状**（繰り返し）- 160 行以上

```javascript
charts.roleAnalysis = new Chart(ctx, {
    type: 'doughnut',
    data: { ... },
    options: { ... }
});

charts.winsChart = new Chart(ctx, {
    type: 'doughnut',
    data: { ... },
    options: { ... }
});
// さらに繰り返し...
```

**改善後**（テンプレート化）:

```javascript
function createDoughnutChart(ctx, labels, data, colors) {
    return new Chart(ctx, {
        type: "doughnut",
        data: {labels, datasets: [{data, backgroundColor: colors}]},
        options: getDefaultChartOptions(),
    });
}

function getDefaultChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {position: "bottom", labels: {color: "#ffffff"}},
            tooltip: {callbacks: {label: (ctx) => formatTooltip(ctx)}},
        },
    };
}
```

---

## 🎯 期待効果

| 項目             | 改善前 | 改善後           | 効果                 |
| ---------------- | ------ | ---------------- | -------------------- |
| ファイルサイズ   | 819 行 | 650 ～ 700 行    | **20 ～ 25%削減**    |
| 関数の平均行数   | 35 行  | 25 行            | **可読性向上**       |
| グローバル変数   | 9 個   | 1 個（AppState） | **スコープ管理向上** |
| テストカバレッジ | 0%     | 60 ～ 70%        | **品質保証**         |

---

## 📌 まとめ

### 強み ✅

-   機能的で堅牢
-   UI が使いやすい
-   ダークテーマがしっかり実装

### 改善すべき点 ⚠️

-   グローバル変数が散在
-   インラインハンドラが混在
-   Chart 設定の重複が多い
-   ユーティリティと業務ロジックが混在

### 推奨アクション 🎯

1. **短期（Phase 1-2）**: グローバル状態管理の改善、重複の削減
2. **中期（Phase 3）**: ファイル分割、テスト追加
3. **長期（Phase 4）**: TypeScript 移行、ビルド環境整備

---

**報告日**: 2025 年 11 月 14 日
