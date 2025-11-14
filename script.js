// ================== グローバル状態 ==================
let gameData = [];
let playerStats = {};
let charts = {};
let allRoles = []; // すべてのロール一覧
let filteredGameData = []; // フィルタリング済みゲームデータ
let filterStartDate = null;
let filterEndDate = null;

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

    // file:// プロトコルの場合はfetchが使えないため、代替手段を使用
    if (window.location.protocol === 'file:') {
        console.log('file:// プロトコルで実行されています。自動読み込みはスキップします。');
        console.log('HTTPサーバーで実行してください (例: python -m http.server 8000)');
    } else {
        tryAutoLoadGameHistory();
    }
});

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
} function loadGameHistoryFromText(text) {
    console.log('loadGameHistoryFromText() 実行開始');
    showSpinner();
    try {
        const lines = text.trim().split('\n').filter(line => line.length > 0);
        console.log('パースされた行数:', lines.length);

        gameData = [];
        let parseErrorCount = 0;
        for (const line of lines) {
            try {
                gameData.push(JSON.parse(line));
            } catch (e) {
                parseErrorCount++;
                console.error('行のパースエラー:', e);
            }
        }

        console.log('正常にパースされたゲーム数:', gameData.length);
        if (parseErrorCount > 0) {
            console.log('パースエラー数:', parseErrorCount);
        }

        if (gameData.length === 0) {
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
        showToast(`${gameData.length}件のゲームデータを自動読み込みしました`, 'success');
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
    playerStats = {};

    // プレイヤーごとの統計を集計
    gameData.forEach(game => {
        game.players.forEach(player => {
            const playerName = player.player_name;
            if (!playerStats[playerName]) {
                playerStats[playerName] = {
                    name: playerName,
                    uuid: player.player_uuid,
                    games: 0,
                    wins: 0,
                    deaths: 0,
                    roleStats: {}
                };
            }

            const stats = playerStats[playerName];
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
    allRoles = [];
    Object.values(playerStats).forEach(player => {
        Object.keys(player.roleStats).forEach(role => {
            if (!allRoles.includes(role)) {
                allRoles.push(role);
            }
        });
    });
    allRoles.sort(); // アルファベット順にソート

    // フィルタリングを初期化
    filteredGameData = gameData;
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
    const totalGames = filteredGameData.length;
    let playerCount = Object.keys(playerStats).length;

    document.getElementById('totalGames').textContent = totalGames;
    document.getElementById('totalPlayers').textContent = playerCount;
}

function renderCharts() {
    renderWinRateChart();
    renderMapStatsChart();
    renderTimelineChart();
    renderRoleAnalysisChart();
}

function renderWinRateChart() {
    const ctx = document.getElementById('winRateChart').getContext('2d');

    // プレイヤー別勝率を集計
    const playerData = Object.values(playerStats)
        .sort((a, b) => b.games - a.games || b.wins - a.wins)
        .slice(0, 15); // TOP 15プレイヤー

    const playerNames = playerData.map(p => p.name);
    const winRates = playerData.map(p => ((p.wins / p.games) * 100).toFixed(1));

    if (charts.winRate) {
        charts.winRate.destroy();
    }

    charts.winRate = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: playerNames,
            datasets: [{
                label: '勝率 (%)',
                data: winRates,
                backgroundColor: 'rgba(8, 253, 216, 0.6)',
                borderColor: '#08fdd8',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#b0b8c1' }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#b0b8c1' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    max: 100
                },
                x: {
                    ticks: { color: '#b0b8c1' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

function renderMapStatsChart() {
    const ctx = document.getElementById('mapStatsChart').getContext('2d');

    const mapStats = {};
    gameData.forEach(game => {
        if (!mapStats[game.map_name]) {
            mapStats[game.map_name] = 0;
        }
        mapStats[game.map_name]++;
    });

    const labels = Object.keys(mapStats);
    const data = Object.values(mapStats);

    if (charts.mapStats) {
        charts.mapStats.destroy();
    }

    charts.mapStats = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'ゲーム数',
                data: data,
                backgroundColor: 'rgba(8, 253, 216, 0.6)',
                borderColor: '#08fdd8',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#b0b8c1' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#b0b8c1' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: '#b0b8c1' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

function renderTimelineChart() {
    const ctx = document.getElementById('timelineChart').getContext('2d');

    // 時系列でゲーム結果を集計（チーム別勝者追跡）
    const timeSeries = [];
    const cumulativeWins = {};

    gameData.forEach(game => {
        const timestamp = new Date(game.start_time);
        game.players.forEach(player => {
            const playerName = player.player_name;
            if (!cumulativeWins[playerName]) {
                cumulativeWins[playerName] = 0;
            }
            if (player.is_winner) {
                cumulativeWins[playerName]++;
            }
        });

        // 最初の3プレイヤーで表示（オーバーヘッド回避）
        const topPlayers = Object.entries(cumulativeWins)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        timeSeries.push({
            timestamp,
            data: Object.fromEntries(topPlayers)
        });
    });

    const topPlayerNames = Object.keys(cumulativeWins)
        .sort((a, b) => cumulativeWins[b] - cumulativeWins[a])
        .slice(0, 3);

    const labels = timeSeries.map((_, i) => `Game ${i + 1}`);
    const datasets = topPlayerNames.map((playerName, idx) => {
        const colors = ['#00d084', '#08fdd8', '#ff2e63'];
        return {
            label: playerName,
            data: timeSeries.map(ts => ts.data[playerName] || 0),
            borderColor: colors[idx % colors.length],
            backgroundColor: colors[idx % colors.length] + '20',
            tension: 0.4,
            fill: false,
            borderWidth: 2
        };
    });

    if (charts.timeline) {
        charts.timeline.destroy();
    }

    charts.timeline = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#b0b8c1' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#b0b8c1' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: '#b0b8c1' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

function renderRoleAnalysisChart() {
    const ctx = document.getElementById('roleAnalysisChart').getContext('2d');

    // ロール別勝率を集計
    const roleStats = {};
    gameData.forEach(game => {
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

    if (charts.roleAnalysis) {
        charts.roleAnalysis.destroy();
    }

    charts.roleAnalysis = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: roles,
            datasets: [{
                label: '勝率 (%)',
                data: winRates,
                backgroundColor: roles.map((role, idx) => {
                    if (role === 'Impostor') return 'rgba(255, 46, 99, 0.7)';
                    if (role === 'Crewmate') return 'rgba(0, 208, 132, 0.7)';
                    return 'rgba(8, 253, 216, 0.7)';
                }),
                borderColor: roles.map((role, idx) => {
                    if (role === 'Impostor') return '#ff2e63';
                    if (role === 'Crewmate') return '#00d084';
                    return '#08fdd8';
                }),
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#b0b8c1' }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#b0b8c1' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    max: 100
                },
                x: {
                    ticks: { color: '#b0b8c1' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
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
    allRoles.forEach(role => {
        headerHtml += `<th>${role}勝率</th>`;
    });

    headerHtml += `</tr>`;
    thead.innerHTML = headerHtml;

    // テーブルボディを生成
    tbody.innerHTML = '';
    const sortedPlayers = Object.values(playerStats)
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
        allRoles.forEach(role => {
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
    // 勝利数ランキング
    const winsContainer = document.getElementById('winsRanking');
    winsContainer.innerHTML = '';

    const winsSorted = Object.values(playerStats)
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 10);

    winsSorted.forEach((player, idx) => {
        const li = document.createElement('li');
        li.className = 'player-badge';
        li.innerHTML = `
            <div style="padding: 0.75rem 0;">
                <strong>${idx + 1}. ${player.name}</strong>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">${player.wins}勝 (${player.games}ゲーム)</div>
            </div>
        `;
        winsContainer.appendChild(li);
    });

    // 勝率ランキング（3ゲーム以上）
    const rateContainer = document.getElementById('winRateRanking');
    rateContainer.innerHTML = '';

    const rateSorted = Object.values(playerStats)
        .filter(p => p.games >= 3)
        .sort((a, b) => (b.wins / b.games) - (a.wins / a.games))
        .slice(0, 10);

    rateSorted.forEach((player, idx) => {
        const winRate = ((player.wins / player.games) * 100).toFixed(1);
        const li = document.createElement('li');
        li.className = 'player-badge';
        li.innerHTML = `
            <div style="padding: 0.75rem 0;">
                <strong>${idx + 1}. ${player.name}</strong>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">${winRate}% (${player.wins}/${player.games})</div>
            </div>
        `;
        rateContainer.appendChild(li);
    });
}

function updateRoleAnalysis() {
    const roleStats = {};
    gameData.forEach(game => {
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
    gameData.slice().reverse().forEach(game => {
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
        // 表示順を統一するため、allRolesの順序に従う
        const roleInfo = allRoles
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

        row.innerHTML = `
            <td>${formatDate(game.start_time)}</td>
            <td><strong>${game.map_name}</strong></td>
            <td>${game.player_count}</td>
            <td><span class="badge badge-success">${game.winner_team}</span></td>
            <td>${duration}</td>
            <td><small>${playerNames}</small></td>
            <td><small>${roleInfo}</small></td>
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
    if (gameData.length > 0) {
        const minDate = new Date(gameData[0].start_time);
        const maxDate = new Date(gameData[gameData.length - 1].start_time);

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
    filterStartDate = startDateInput ? new Date(startDateInput) : null;
    filterEndDate = endDateInput ? new Date(endDateInput) : null;

    // ゲームデータをフィルタリング
    filteredGameData = gameData.filter(game => {
        const gameDate = new Date(game.start_time);

        // 日付フィルタ
        if (filterStartDate && gameDate < filterStartDate) return false;
        if (filterEndDate && gameDate > filterEndDate) return false;

        return true;
    });

    // フィルタ適用後、統計を再計算
    recalculateStats();
    showToast(`${filteredGameData.length}件のゲームでフィルタリングしました`, 'success');
}

function clearFilters() {
    // フィルター条件をリセット
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('quickFilterSelect').value = '';

    filterStartDate = null;
    filterEndDate = null;
    filteredGameData = gameData;

    // 統計を再計算
    recalculateStats();
    showToast('フィルターをリセットしました', 'success');
}

function recalculateStats() {
    // フィルター済みデータで統計を再計算
    playerStats = {};

    filteredGameData.forEach(game => {
        game.players.forEach(player => {
            const playerName = player.player_name;
            if (!playerStats[playerName]) {
                playerStats[playerName] = {
                    name: playerName,
                    uuid: player.player_uuid,
                    games: 0,
                    wins: 0,
                    deaths: 0,
                    roleStats: {}
                };
            }

            const stats = playerStats[playerName];
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

