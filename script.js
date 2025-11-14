// ================== グローバル状態 ==================
let gameData = [];
let playerStats = {};
let charts = {};

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
        const lines = text.trim().split('\n').filter(line => line.length > 0);

        gameData = [];
        for (const line of lines) {
            try {
                gameData.push(JSON.parse(line));
            } catch (e) {
                console.error('行のパースエラー:', e);
            }
        }

        if (gameData.length === 0) {
            showToast('有効なゲームデータが見つかりません', 'danger');
            hideSpinner();
            return;
        }

        // データ分析
        analyzeData();

        // UIを更新
        document.getElementById('uploadCard').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';

        showToast(`${gameData.length}件のゲームデータを読み込みました`, 'success');
    } catch (error) {
        console.error('ファイル読み込みエラー:', error);
        showToast('ファイル読み込みエラー: ' + error.message, 'danger');
    } finally {
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
    const totalGames = gameData.length;
    let totalWins = 0;
    let playerCount = Object.keys(playerStats).length;

    Object.values(playerStats).forEach(player => {
        totalWins += player.wins;
    });

    // 注意: 複数チームの勝利があるため、全体勝率は個別プレイヤーの勝率平均
    const avgWinRate = playerCount > 0
        ? (Object.values(playerStats).reduce((sum, p) => sum + (p.wins / p.games), 0) / playerCount) * 100
        : 0;

    document.getElementById('totalGames').textContent = totalGames;
    document.getElementById('totalWins').textContent = totalWins;
    document.getElementById('overallWinRate').textContent = avgWinRate.toFixed(1) + '%';
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

    // 勝利と敗北を集計
    let totalWins = 0;
    let totalLosses = 0;

    Object.values(playerStats).forEach(player => {
        totalWins += player.wins;
        totalLosses += player.games - player.wins;
    });

    if (charts.winRate) {
        charts.winRate.destroy();
    }

    charts.winRate = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['勝利', '敗北'],
            datasets: [{
                data: [totalWins, totalLosses],
                backgroundColor: [
                    'rgba(0, 208, 132, 0.8)',
                    'rgba(255, 46, 99, 0.8)'
                ],
                borderColor: [
                    '#00d084',
                    '#ff2e63'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#b0b8c1',
                        font: { size: 13 }
                    },
                    position: 'bottom'
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
    tbody.innerHTML = '';

    const sortedPlayers = Object.values(playerStats)
        .sort((a, b) => b.games - a.games || b.wins - a.wins);

    sortedPlayers.forEach(player => {
        const winRate = percentageString(player.wins, player.games);
        const survivalRate = percentageString(player.games - player.deaths, player.games);

        const impostor = player.roleStats['Impostor'] || { games: 0, wins: 0 };
        const crewmate = player.roleStats['Crewmate'] || { games: 0, wins: 0 };
        const imposturWinRate = percentageString(impostor.wins, impostor.games);
        const crewmateWinRate = percentageString(crewmate.wins, crewmate.games);

        // その他ロール
        let otherWins = 0, otherGames = 0;
        Object.entries(player.roleStats).forEach(([role, stats]) => {
            if (role !== 'Impostor' && role !== 'Crewmate') {
                otherWins += stats.wins;
                otherGames += stats.games;
            }
        });
        const otherWinRate = percentageString(otherWins, otherGames);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${player.name}</strong></td>
            <td>${player.games}</td>
            <td>${player.wins}</td>
            <td><span class="badge badge-success">${winRate}</span></td>
            <td><span class="badge badge-info">${survivalRate}</span></td>
            <td><span class="role-color-impostor">${imposturWinRate}</span></td>
            <td><span class="role-color-crewmate">${crewmateWinRate}</span></td>
            <td><span class="role-color-other">${otherWinRate}</span></td>
        `;
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

        row.innerHTML = `
            <td>${formatDate(game.start_time)}</td>
            <td><strong>${game.map_name}</strong></td>
            <td>${game.player_count}</td>
            <td><span class="badge badge-success">${game.winner_team}</span></td>
            <td>${duration}</td>
            <td><small>${playerNames}</small></td>
        `;
        tbody.appendChild(row);
    });
}
