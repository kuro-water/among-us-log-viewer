// ================== グローバル状態管理 ==================
// すべての状態を AppState オブジェクトに集約
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
        this.charts = {};
        this.allRoles = [];
        this.filteredGameData = [];
        this.filterStartDate = null;
        this.filterEndDate = null;
    },

    destroyAllCharts() {
        Object.keys(this.charts).forEach(key => {
            try {
                if (this.charts[key] && typeof this.charts[key].destroy === 'function') {
                    this.charts[key].destroy();
                }
            } catch (e) {
                console.error(`チャート ${key} の破棄に失敗:`, e);
            }
        });
        this.charts = {};
    }
};

// ================== 定数 ==================
const CONSTANTS = {
    TOP_WINS: 10,
    TOP_WIN_RATE: 10,
    MIN_GAMES_FOR_RATE: 3,
    QUICK_FILTER_OPTIONS: [3, 6, 12, 24, 48, 72, 96, 120, 144, 168, 720],
    CHART_COLORS: {
        impostor: '#ff2e63',
        crewmate: '#00d084',
        other: '#08fdd8',
        palette: [
            '#ff2e63', '#08fdd8', '#ffd60a', '#4cc9f0', '#c8b6ff',
            '#f72585', '#00d9ff', '#ffbe0b', '#3a86ff', '#8338ec'
        ]
    },
    ROLE_COLORS: {
        'Impostor': 'rgba(255, 46, 99, 0.7)',
        'Crewmate': 'rgba(0, 208, 132, 0.7)',
        'Other': 'rgba(8, 253, 216, 0.7)'
    },
    ROLE_BORDERS: {
        'Impostor': '#ff2e63',
        'Crewmate': '#00d084',
        'Other': '#08fdd8'
    }
};

// ================== ヘルパー関数 ==================
function resetCanvasContext(elementId) {
    const canvas = document.getElementById(elementId);
    if (canvas) {
        canvas.width = canvas.width;
    }
}

function getRoleColor(role) {
    if (role === 'Impostor') return CONSTANTS.ROLE_COLORS['Impostor'];
    if (role === 'Crewmate') return CONSTANTS.ROLE_COLORS['Crewmate'];
    return CONSTANTS.ROLE_COLORS['Other'];
}

function getRoleBorderColor(role) {
    if (role === 'Impostor') return CONSTANTS.ROLE_BORDERS['Impostor'];
    if (role === 'Crewmate') return CONSTANTS.ROLE_BORDERS['Crewmate'];
    return CONSTANTS.ROLE_BORDERS['Other'];
}

// ================== Chart テンプレート ==================
function getDefaultChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#ffffff' }
            }
        }
    };
}

function createDoughnutChart(ctx, labels, data, backgroundColor, tooltipCallback) {
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColor
            }]
        },
        options: {
            ...getDefaultChartOptions(),
            maintainAspectRatio: true,
            plugins: {
                ...getDefaultChartOptions().plugins,
                tooltip: {
                    callbacks: {
                        label: tooltipCallback
                    }
                }
            }
        }
    });
}

// ================== ユーティリティ関数 ==================
function showSpinner() {
    document.getElementById('spinner').classList.add('show');
}

function hideSpinner() {
    document.getElementById('spinner').classList.remove('show');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toastHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    const toastDiv = document.createElement('div');
    toastDiv.innerHTML = toastHtml;
    container.appendChild(toastDiv);
    setTimeout(() => {
        toastDiv.remove();
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP');
}

function formatDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = (end - start) / 1000; // 秒単位
    const minutes = Math.floor(diff / 60);
    const seconds = Math.floor(diff % 60);
    return `${minutes}m ${seconds}s`;
}

function percentageString(value, total) {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
}

// ================== 起動時の自動読み込み ==================
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded イベント発火');
    console.log('ページのプロトコル:', window.location.protocol);

    // イベントリスナーの登録
    setupEventListeners();

    // file:// プロトコルの場合はfetchが使えないため、代替手段を使用
    if (window.location.protocol === 'file:') {
        console.log('file:// プロトコルで実行されています。自動読み込みはスキップします。');
        console.log('HTTPサーバーで実行してください (例: python -m http.server 8000)');
    } else {
        tryAutoLoadGameHistory();
    }
});

function setupEventListeners() {
    // ファイル選択ボタン
    const selectFileBtn = document.getElementById('selectFileBtn');
    if (selectFileBtn) {
        selectFileBtn.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
    }

    // フィルターボタン
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
}

async function tryAutoLoadGameHistory() {
    console.log('tryAutoLoadGameHistory() 実行開始');
    try {
        console.log('game_history.jsonl をフェッチ中...');
        const response = await fetch('game_history.jsonl');
        console.log('レスポンスステータス:', response.status, response.statusText);

        if (response.ok) {
            console.log('ファイルが見つかりました。テキスト読み込み中...');
            const text = await response.text();
            console.log('ファイルサイズ:', text.length, '文字');
            loadGameHistoryFromText(text);
        } else {
            console.log('ファイルが見つかりません。ステータス:', response.status);
        }
    } catch (error) {
        // ファイルが見つからない場合はファイル選択画面のままにする
        console.log('game_history.jsonlが見つかりません。エラー:', error.message);
    }
}

function loadGameHistoryFromText(text) {
    console.log('loadGameHistoryFromText() 実行開始');
    showSpinner();
    try {
        const lines = text.trim().split('\n').filter(line => line.length > 0);
        console.log('パースされた行数:', lines.length);

        AppState.gameData = [];
        let parseErrorCount = 0;
        for (const line of lines) {
            try {
                AppState.gameData.push(JSON.parse(line));
            } catch (e) {
                parseErrorCount++;
                console.error('行のパースエラー:', e);
            }
        }

        console.log('正常にパースされたゲーム数:', AppState.gameData.length);
        if (parseErrorCount > 0) {
            console.log('パースエラー数:', parseErrorCount);
        }

        if (AppState.gameData.length === 0) {
            console.log('有効なゲームデータがありません');
            showToast('有効なゲームデータが見つかりません', 'danger');
            hideSpinner();
            return;
        }

        console.log('データ分析開始');
        // データ分析
        analyzeData();

        console.log('UIを更新中');
        // UIを更新
        document.getElementById('uploadCard').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';

        console.log('読み込み完了');
        showToast(`${AppState.gameData.length}件のゲームデータを自動読み込みしました`, 'success');
    } catch (error) {
        console.error('ファイル読み込みエラー:', error);
        showToast('ファイル読み込みエラー: ' + error.message, 'danger');
    }
    hideSpinner();
}

// ================== ファイルアップロード ==================
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');

// ドラッグ&ドロップ
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

// ファイル入力
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

async function handleFileSelect(file) {
    if (!file.name.endsWith('.jsonl')) {
        showToast('game_history.jsonlファイルをアップロードしてください', 'danger');
        return;
    }

    showSpinner();
    try {
        const text = await file.text();
        loadGameHistoryFromText(text);
    } catch (error) {
        console.error('ファイル読み込みエラー:', error);
        showToast('ファイル読み込みエラー: ' + error.message, 'danger');
        hideSpinner();
    }
}

// ================== データ分析 ==================
function analyzeData() {
    AppState.playerStats = {};

    // プレイヤーごとの統計を集計
    AppState.gameData.forEach(game => {
        game.players.forEach(player => {
            const playerName = player.player_name;
            if (!AppState.playerStats[playerName]) {
                AppState.playerStats[playerName] = {
                    name: playerName,
                    uuid: player.player_uuid,
                    games: 0,
                    wins: 0,
                    deaths: 0,
                    roleStats: {}
                };
            }

            const stats = AppState.playerStats[playerName];
            stats.games++;

            if (player.is_winner) {
                stats.wins++;
            }

            if (player.is_dead) {
                stats.deaths++;
            }

            // ロール別統計
            const role = player.main_role;
            if (!stats.roleStats[role]) {
                stats.roleStats[role] = {
                    games: 0,
                    wins: 0
                };
            }
            stats.roleStats[role].games++;
            if (player.is_winner) {
                stats.roleStats[role].wins++;
            }
        });
    });

    // すべてのロール一覧を取得
    AppState.allRoles = [];
    Object.values(AppState.playerStats).forEach(player => {
        Object.keys(player.roleStats).forEach(role => {
            if (!AppState.allRoles.includes(role)) {
                AppState.allRoles.push(role);
            }
        });
    });
    AppState.allRoles.sort(); // アルファベット順にソート

    // フィルタリングを初期化
    AppState.filteredGameData = AppState.gameData;
    initializeFilters();

    // サマリー更新
    updateSummary();

    // 全チャート更新
    renderCharts();

    // テーブル更新
    updatePlayerStatsTable();

    // ランキング更新
    updateRankings();

    // ロール分析更新
    updateRoleAnalysis();

    // ゲーム一覧更新
    updateGamesList();
}

function updateSummary() {
    const totalGames = AppState.filteredGameData.length;
    let playerCount = Object.keys(AppState.playerStats).length;

    document.getElementById('totalGames').textContent = totalGames;
    document.getElementById('totalPlayers').textContent = playerCount;
}

function renderCharts() {
    // 既存チャートを AppState で管理する関数で破棄
    AppState.destroyAllCharts();
    renderRoleAnalysisChart();
}

function renderRoleAnalysisChart() {
    const ctx = document.getElementById('roleAnalysisChart').getContext('2d');

    // ロール別勝率を集計
    const roleStats = {};
    AppState.gameData.forEach(game => {
        game.players.forEach(player => {
            const role = player.main_role;
            if (!roleStats[role]) {
                roleStats[role] = { games: 0, wins: 0 };
            }
            roleStats[role].games++;
            if (player.is_winner) {
                roleStats[role].wins++;
            }
        });
    });

    const roles = Object.keys(roleStats);
    const winRates = roles.map(role =>
        ((roleStats[role].wins / roleStats[role].games) * 100).toFixed(1)
    );

    if (AppState.charts.roleAnalysis) {
        AppState.charts.roleAnalysis.destroy();
    }

    AppState.charts.roleAnalysis = createDoughnutChart(
        ctx,
        roles.map(role => `${role} (${roleStats[role].wins}/${roleStats[role].games})`),
        winRates,
        roles.map(role => getRoleColor(role)),
        (context) => context.label + ': 勝率 ' + context.parsed + '%'
    );

    // borderを追加（createDoughnutChartのオプション拡張）
    AppState.charts.roleAnalysis.data.datasets[0].borderColor = roles.map(role => getRoleBorderColor(role));
    AppState.charts.roleAnalysis.data.datasets[0].borderWidth = 2;
    AppState.charts.roleAnalysis.update();
}

// ================== テーブル更新 ==================
function updatePlayerStatsTable() {
    const tbody = document.getElementById('playerStatsBody');
    const thead = document.getElementById('playerStatsTable').getElementsByTagName('thead')[0];

    // テーブルヘッダーを動的に生成
    let headerHtml = `
        <tr>
            <th>プレイヤー名</th>
            <th>ゲーム数</th>
            <th>勝利数</th>
            <th>勝率</th>
            <th>生存率</th>
    `;

    // すべてのロール列を追加
    AppState.allRoles.forEach(role => {
        headerHtml += `<th>${role}勝率</th>`;
    });

    headerHtml += `</tr>`;
    thead.innerHTML = headerHtml;

    // テーブルボディを生成
    tbody.innerHTML = '';
    const sortedPlayers = Object.values(AppState.playerStats)
        .sort((a, b) => b.games - a.games || b.wins - a.wins);

    sortedPlayers.forEach(player => {
        const winRate = percentageString(player.wins, player.games);
        const survivalRate = percentageString(player.games - player.deaths, player.games);

        let rowHtml = `
            <tr>
                <td><strong>${player.name}</strong></td>
                <td>${player.games}</td>
                <td>${player.wins}</td>
                <td><span class="badge badge-success">${winRate}</span></td>
                <td><span class="badge badge-info">${survivalRate}</span></td>
        `;

        // 各ロール別勝率を表示
        AppState.allRoles.forEach(role => {
            const roleData = player.roleStats[role] || { games: 0, wins: 0 };
            const roleWinRate = percentageString(roleData.wins, roleData.games);

            let roleClass = 'role-color-other';
            if (role === 'Impostor') roleClass = 'role-color-impostor';
            if (role === 'Crewmate') roleClass = 'role-color-crewmate';

            rowHtml += `<td><span class="${roleClass}">${roleWinRate}</span></td>`;
        });

        rowHtml += `</tr>`;

        const row = document.createElement('tr');
        row.innerHTML = rowHtml.replace('<tr>', '').replace('</tr>', '');
        tbody.appendChild(row);
    });
}

function updateRankings() {
    console.log('updateRankings() 実行開始');

    // 勝利数ランキング
    const winsContainer = document.getElementById('winsRanking');
    winsContainer.innerHTML = '';

    const winsSorted = Object.values(AppState.playerStats)
        .sort((a, b) => b.wins - a.wins)
        .slice(0, CONSTANTS.TOP_WINS);

    winsSorted.forEach((player, idx) => {
        const li = document.createElement('li');
        li.className = 'player-badge';
        li.innerHTML = `
            <div style="padding: 0.75rem 0;">
                <strong style="color: var(--secondary-color);">${idx + 1}. ${player.name}</strong>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">${player.wins}勝 (${player.games}ゲーム)</div>
            </div>
        `;
        winsContainer.appendChild(li);
    });

    // 勝率ランキング（3ゲーム以上）
    const rateContainer = document.getElementById('winRateRanking');
    rateContainer.innerHTML = '';

    const rateSorted = Object.values(AppState.playerStats)
        .filter(p => p.games >= CONSTANTS.MIN_GAMES_FOR_RATE)
        .sort((a, b) => (b.wins / b.games) - (a.wins / a.games))
        .slice(0, CONSTANTS.TOP_WIN_RATE);

    rateSorted.forEach((player, idx) => {
        const winRate = ((player.wins / player.games) * 100).toFixed(1);
        const li = document.createElement('li');
        li.className = 'player-badge';
        li.innerHTML = `
            <div style="padding: 0.75rem 0;">
                <strong style="color: var(--secondary-color);">${idx + 1}. ${player.name}</strong>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">${winRate}% (${player.wins}/${player.games})</div>
            </div>
        `;
        rateContainer.appendChild(li);
    });

    // ランキング用チャート作成前に、既存のランキングチャートを破棄
    console.log('既存ランキングチャートの破棄を試みます');
    console.log('charts.winsChart:', AppState.charts.winsChart ? 'exists' : 'null');
    console.log('charts.winRateChart:', AppState.charts.winRateChart ? 'exists' : 'null');

    try {
        if (AppState.charts.winsChart && typeof AppState.charts.winsChart.destroy === 'function') {
            console.log('winsChart を破棄中...');
            AppState.charts.winsChart.destroy();
            AppState.charts.winsChart = null;
            console.log('winsChart を破棄しました');
        }
        if (AppState.charts.winRateChart && typeof AppState.charts.winRateChart.destroy === 'function') {
            console.log('winRateChart を破棄中...');
            AppState.charts.winRateChart.destroy();
            AppState.charts.winRateChart = null;
        }
    } catch (e) {
        console.error('ランキングチャートの破棄に失敗:', e);
    }

    // 勝利数ランキングの円グラフ
    console.log('winsChart 作成開始');
    const winsChartCtx = document.getElementById('winsRankingChart');
    if (winsChartCtx) {
        resetCanvasContext('winsRankingChart');
        try {
            console.log('winsChart を新規作成中...');
            AppState.charts.winsChart = createDoughnutChart(
                winsChartCtx.getContext('2d'),
                winsSorted.map(p => p.name),
                winsSorted.map(p => p.wins),
                CONSTANTS.CHART_COLORS.palette,
                function (context) {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const value = context.parsed;
                    const percentage = ((value / total) * 100).toFixed(1);
                    return context.label + ': ' + value + ' (' + percentage + '%)';
                }
            );
            console.log('winsChart 作成成功');
        } catch (e) {
            console.error('winsChart 作成エラー:', e);
        }
    }

    // 勝率ランキングの円グラフ
    console.log('winRateChart 作成開始');
    const winRateChartCtx = document.getElementById('winRateRankingChart');
    if (winRateChartCtx) {
        resetCanvasContext('winRateRankingChart');
        try {
            console.log('winRateChart を新規作成中...');
            AppState.charts.winRateChart = createDoughnutChart(
                winRateChartCtx.getContext('2d'),
                rateSorted.map(p => p.name),
                rateSorted.map(p => ((p.wins / p.games) * 100).toFixed(1)),
                CONSTANTS.CHART_COLORS.palette,
                function (context) {
                    const winRate = context.parsed;
                    return context.label + ': 勝率 ' + winRate + '%';
                }
            );
            console.log('winRateChart 作成成功');
        } catch (e) {
            console.error('winRateChart 作成エラー:', e);
        }
    }
    console.log('updateRankings() 実行完了');
}

function updateRoleAnalysis() {
    const roleStats = {};
    AppState.gameData.forEach(game => {
        game.players.forEach(player => {
            const role = player.main_role;
            if (!roleStats[role]) {
                roleStats[role] = { games: 0, wins: 0 };
            }
            roleStats[role].games++;
            if (player.is_winner) {
                roleStats[role].wins++;
            }
        });
    });

    const details = document.getElementById('roleStatsDetails');
    details.innerHTML = '';

    Object.entries(roleStats).forEach(([role, stats]) => {
        const winRate = ((stats.wins / stats.games) * 100).toFixed(1);
        const div = document.createElement('div');
        div.className = 'stat-box';
        let roleClass = 'role-color-other';
        if (role === 'Impostor') roleClass = 'role-color-impostor';
        if (role === 'Crewmate') roleClass = 'role-color-crewmate';

        div.innerHTML = `
            <div class="stat-label">${role}</div>
            <div class="${roleClass}" style="font-size: 1.5rem; margin-top: 0.5rem;">
                ${winRate}% (${stats.wins}/${stats.games})
            </div>
        `;
        details.appendChild(div);
    });
}

function updateGamesList() {
    const tbody = document.getElementById('gamesBody');
    tbody.innerHTML = '';

    // 逆順（最新から表示）
    AppState.gameData.slice().reverse().forEach(game => {
        const row = document.createElement('tr');
        const duration = formatDuration(game.start_time, game.end_time);
        const playerNames = game.players.map(p => p.player_name).join(', ');

        // 役職とサブロールを集計
        const roleMap = {}; // role -> set of sub_roles
        game.players.forEach(p => {
            const role = p.main_role;
            if (!roleMap[role]) {
                roleMap[role] = new Set();
            }
            // サブロールを追加
            if (p.sub_roles && p.sub_roles.length > 0) {
                p.sub_roles.forEach(subRole => roleMap[role].add(subRole));
            }
        });

        // ロール情報を「メインロール(サブロール1, ...): 人数」形式で表示
        // 表示順を統一するため、AppState.allRolesの順序に従う
        const roleInfo = AppState.allRoles
            .filter(role => roleMap[role])
            .map(role => {
                const count = game.players.filter(p => p.main_role === role).length;
                const subRoles = Array.from(roleMap[role]).sort().join(', ');
                if (subRoles) {
                    return `${role}(${subRoles}): ${count}`;
                } else {
                    return `${role}: ${count}`;
                }
            })
            .join(', ');

        // 勝利メンバーを取得
        const winners = game.players
            .filter(p => p.is_winner)
            .map(p => p.player_name)
            .join(', ');

        row.innerHTML = `
            <td><strong>${game.map_name}</strong></td>
            <td>${game.player_count}</td>
            <td><span class="badge badge-success">${game.winner_team}</span></td>
            <td><small>${winners}</small></td>
            <td>${duration}</td>
            <td><small>${playerNames}</small></td>
            <td><small>${roleInfo}</small></td>
            <td>${formatDate(game.start_time)}</td>
        `;
        tbody.appendChild(row);
    });
}

// ================== フィルタリング関数 ==================
function initializeFilters() {
    // ローカルタイムゾーンの日時文字列を生成
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // 日付入力のデフォルト値を設定（全データを表示）
    if (AppState.gameData.length > 0) {
        const minDate = new Date(AppState.gameData[0].start_time);
        const maxDate = new Date(AppState.gameData[AppState.gameData.length - 1].start_time);

        document.getElementById('filterStartDate').value = formatDateTime(minDate);
        document.getElementById('filterEndDate').value = formatDateTime(maxDate);
    }

    // クイックフィルタードロップダウンのデフォルト値を「直近24時間」に設定
    document.getElementById('quickFilterSelect').value = '24';

    // クイックフィルタードロップダウンのchange イベントリスナーを追加
    document.getElementById('quickFilterSelect').addEventListener('change', function () {
        const hours = this.value;
        if (hours) {
            filterByHours(parseInt(hours));
        }
    });
}

function filterByHours(hours) {
    // 現在時刻
    const now = new Date();
    // 指定時間前
    const past = new Date(now - hours * 60 * 60 * 1000);

    // ローカルタイムゾーンの日時文字列を生成
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // フィルター入力欄に値を設定
    document.getElementById('filterStartDate').value = formatDateTime(past);
    document.getElementById('filterEndDate').value = formatDateTime(now);

    // フィルターを即座に適用
    applyFilters();
}

function applyFilters() {
    const startDateInput = document.getElementById('filterStartDate').value;
    const endDateInput = document.getElementById('filterEndDate').value;

    // フィルタ条件を設定
    AppState.filterStartDate = startDateInput ? new Date(startDateInput) : null;
    AppState.filterEndDate = endDateInput ? new Date(endDateInput) : null;

    // ゲームデータをフィルタリング
    AppState.filteredGameData = AppState.gameData.filter(game => {
        const gameDate = new Date(game.start_time);

        // 日付フィルタ
        if (AppState.filterStartDate && gameDate < AppState.filterStartDate) return false;
        if (AppState.filterEndDate && gameDate > AppState.filterEndDate) return false;

        return true;
    });

    // フィルタ適用後、統計を再計算
    recalculateStats();
    showToast(`${AppState.filteredGameData.length}件のゲームでフィルタリングしました`, 'success');
}

function clearFilters() {
    // フィルター条件をリセット
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('quickFilterSelect').value = '';

    AppState.filterStartDate = null;
    AppState.filterEndDate = null;
    AppState.filteredGameData = AppState.gameData;

    // 統計を再計算
    recalculateStats();
    showToast('フィルターをリセットしました', 'success');
}

function recalculateStats() {
    // フィルター済みデータで統計を再計算
    AppState.playerStats = {};

    AppState.filteredGameData.forEach(game => {
        game.players.forEach(player => {
            const playerName = player.player_name;
            if (!AppState.playerStats[playerName]) {
                AppState.playerStats[playerName] = {
                    name: playerName,
                    uuid: player.player_uuid,
                    games: 0,
                    wins: 0,
                    deaths: 0,
                    roleStats: {}
                };
            }

            const stats = AppState.playerStats[playerName];
            stats.games++;

            if (player.is_winner) {
                stats.wins++;
            }

            if (player.is_dead) {
                stats.deaths++;
            }

            const role = player.main_role;
            if (!stats.roleStats[role]) {
                stats.roleStats[role] = { games: 0, wins: 0 };
            }
            stats.roleStats[role].games++;
            if (player.is_winner) {
                stats.roleStats[role].wins++;
            }
        });
    });

    // サマリー・チャート・テーブルを更新
    updateSummary();
    renderCharts();
    updatePlayerStatsTable();
    updateRankings();
    updateRoleAnalysis();
    updateGamesList();
}

