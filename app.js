// グローバル変数
let allGames = [];
let filteredGames = [];
let playerStats = {};
let roleStats = {};
let playerRoleMatrix = {};
let charts = {};

// カラーパレット（グラフ用）
const colorPalette = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

// ヒートマップカラー生成（濃いめのパステルカラー版）
function getHeatmapColor(value, max, winRate) {
  if (value === 0) return "#fafafa";
  const intensity = value / max;

  // 勝率に応じて濃いめのパステルカラーを調整
  let color;
  if (winRate >= 70) {
    // 高勝率: 濃いめのパステルグリーン
    const lightness = 72 - intensity * 18;
    color = `hsl(135, 58%, ${lightness}%)`;
  } else if (winRate >= 55) {
    // やや高勝率: 濃いめのパステルライムグリーン
    const lightness = 74 - intensity * 18;
    color = `hsl(100, 55%, ${lightness}%)`;
  } else if (winRate >= 45) {
    // 中勝率: 濃いめのパステルブルー
    const lightness = 75 - intensity * 20;
    color = `hsl(200, 62%, ${lightness}%)`;
  } else if (winRate >= 30) {
    // やや低勝率: 濃いめのパステルアンバー
    const lightness = 72 - intensity * 17;
    color = `hsl(38, 78%, ${lightness}%)`;
  } else if (winRate > 0) {
    // 低勝率: 濃いめのパステルオレンジ
    const lightness = 70 - intensity * 16;
    color = `hsl(25, 82%, ${lightness}%)`;
  } else {
    // 勝率0%: 濃いめのパステルレッド
    const lightness = 72 - intensity * 16;
    color = `hsl(0, 72%, ${lightness}%)`;
  }

  return color;
}

// データ読み込み
async function loadData() {
  try {
    const response = await fetch("game_history.jsonl");
    const text = await response.text();
    const lines = text.trim().split("\n");
    allGames = lines.map((line) => JSON.parse(line));

    // 日時でソート（新しい順）
    allGames.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    filteredGames = [...allGames];
    processData();
    updateUI();
  } catch (error) {
    console.error("データ読み込みエラー:", error);
    document.body.innerHTML =
      '<div class="loading">データの読み込みに失敗しました</div>';
  }
}

// データ処理
function processData() {
  playerStats = {};
  roleStats = {};
  playerRoleMatrix = {};

  filteredGames.forEach((game) => {
    game.players.forEach((player) => {
      const playerName = player.player_name;
      const role = player.main_role;

      // プレイヤー統計
      if (!playerStats[playerName]) {
        playerStats[playerName] = {
          wins: 0,
          games: 0,
          tasksCompleted: 0,
          tasksTotal: 0,
        };
      }

      playerStats[playerName].games++;
      if (player.is_winner) playerStats[playerName].wins++;
      playerStats[playerName].tasksCompleted += player.tasks_completed;
      playerStats[playerName].tasksTotal += player.tasks_total;

      // ロール統計
      if (!roleStats[role]) {
        roleStats[role] = {
          wins: 0,
          games: 0,
        };
      }

      roleStats[role].games++;
      if (player.is_winner) roleStats[role].wins++;

      // プレイヤー-ロール マトリックス（勝率追加）
      if (!playerRoleMatrix[playerName]) {
        playerRoleMatrix[playerName] = {};
      }
      if (!playerRoleMatrix[playerName][role]) {
        playerRoleMatrix[playerName][role] = {
          count: 0,
          wins: 0,
        };
      }
      playerRoleMatrix[playerName][role].count++;
      if (player.is_winner) {
        playerRoleMatrix[playerName][role].wins++;
      }
    });
  });
}

// UI更新
function updateUI() {
  updateSummaryStats();
  updateCharts();
  updatePlayerStatsTable();
  updateRoleStatsTable();
  updateHeatmap();
}

// 統計概要更新
function updateSummaryStats() {
  document.getElementById("totalGames").textContent = filteredGames.length;
  document.getElementById("totalPlayers").textContent =
    Object.keys(playerStats).length;
  document.getElementById("totalRoles").textContent =
    Object.keys(roleStats).length;

  // 平均ゲーム時間計算
  const totalMinutes = filteredGames.reduce((sum, game) => {
    const start = new Date(game.start_time);
    const end = new Date(game.end_time);
    return sum + (end - start) / 60000;
  }, 0);
  const avgMinutes =
    filteredGames.length > 0
      ? (totalMinutes / filteredGames.length).toFixed(1)
      : 0;
  document.getElementById("avgGameLength").textContent = avgMinutes;
}

// チャート更新
function updateCharts() {
  updatePlayerWinRateChart();
  updateRoleWinRateChart();
  updateWinnerTeamChart();
}

// プレイヤー勝率チャート
function updatePlayerWinRateChart() {
  const ctx = document.getElementById("playerWinRateChart");

  if (charts.playerWinRate) {
    charts.playerWinRate.destroy();
  }

  const players = Object.entries(playerStats)
    .map(([name, stats]) => ({
      name,
      winRate: ((stats.wins / stats.games) * 100).toFixed(1),
    }))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 10);

  charts.playerWinRate = new Chart(ctx, {
    type: "bar",
    data: {
      labels: players.map((p) => p.name),
      datasets: [
        {
          label: "勝率 (%)",
          data: players.map((p) => p.winRate),
          backgroundColor: colorPalette.slice(0, players.length),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
    },
  });
}

// ロール勝率チャート
function updateRoleWinRateChart() {
  const ctx = document.getElementById("roleWinRateChart");

  if (charts.roleWinRate) {
    charts.roleWinRate.destroy();
  }

  const roles = Object.entries(roleStats)
    .map(([name, stats]) => ({
      name,
      winRate: ((stats.wins / stats.games) * 100).toFixed(1),
    }))
    .sort((a, b) => b.winRate - a.winRate);

  charts.roleWinRate = new Chart(ctx, {
    type: "bar",
    data: {
      labels: roles.map((r) => r.name),
      datasets: [
        {
          label: "勝率 (%)",
          data: roles.map((r) => r.winRate),
          backgroundColor: colorPalette.slice(0, roles.length),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
    },
  });
}

// 勝利チーム分布チャート
function updateWinnerTeamChart() {
  const ctx = document.getElementById("winnerTeamChart");

  if (charts.winnerTeam) {
    charts.winnerTeam.destroy();
  }

  // すべてのチームを取得（勝利数0も含む）
  const allTeams = new Set();
  allGames.forEach((game) => {
    allTeams.add(game.winner_team);
  });

  const teamCounts = {};
  allTeams.forEach((team) => {
    teamCounts[team] = 0;
  });

  filteredGames.forEach((game) => {
    const team = game.winner_team;
    teamCounts[team] = (teamCounts[team] || 0) + 1;
  });

  const teams = Object.entries(teamCounts).sort((a, b) => b[1] - a[1]);

  charts.winnerTeam = new Chart(ctx, {
    type: "pie",
    data: {
      labels: teams.map((t) => t[0]),
      datasets: [
        {
          data: teams.map((t) => t[1]),
          backgroundColor: colorPalette.slice(0, teams.length),
          borderWidth: 4,
          borderColor: "#ffffff",
          hoverBorderWidth: 6,
          hoverBorderColor: "#3b82f6",
          hoverOffset: 25,
          offset: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1200,
        easing: "easeInOutCubic",
        onComplete: function () {
          // 完了時にパルスアニメーション
          anime({
            targets: ctx.parentElement,
            scale: [1, 1.02, 1],
            duration: 400,
            easing: "easeInOutQuad",
          });
        },
      },
      plugins: {
        legend: {
          position: "right",
          labels: {
            padding: 15,
            font: {
              size: 13,
              weight: "500",
            },
            usePointStyle: true,
            pointStyle: "circle",
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const total = data.datasets[0].data.reduce(
                    (a, b) => a + b,
                    0
                  );
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i,
                    strokeStyle: data.datasets[0].borderColor,
                    lineWidth: 2,
                  };
                });
              }
              return [];
            },
          },
          onHover: function (event, legendItem, legend) {
            event.native.target.style.cursor = "pointer";
          },
          onLeave: function (event, legendItem, legend) {
            event.native.target.style.cursor = "default";
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          titleFont: {
            size: 15,
            weight: "bold",
          },
          bodyFont: {
            size: 14,
          },
          padding: 15,
          cornerRadius: 8,
          displayColors: true,
          borderColor: "#3b82f6",
          borderWidth: 2,
          callbacks: {
            title: function (context) {
              return context[0].label || "";
            },
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return [
                `勝利数: ${value}`,
                `割合: ${percentage}%`,
                `全体: ${total}ゲーム`,
              ];
            },
          },
          animation: {
            duration: 300,
            easing: "easeOutQuart",
          },
        },
      },
      interaction: {
        mode: "point",
        intersect: true,
      },
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        },
      },
    },
  });

  // セグメントホバー時のアニメーション強化
  ctx.onclick = function (evt) {
    const points = charts.winnerTeam.getElementsAtEventForMode(
      evt,
      "nearest",
      { intersect: true },
      true
    );

    if (points.length) {
      const firstPoint = points[0];

      // クリックされたセグメントをハイライト
      anime({
        targets: ctx.parentElement,
        scale: [1, 1.05, 1],
        rotate: [0, 2, -2, 0],
        duration: 500,
        easing: "easeInOutElastic(1, .6)",
      });
    }
  };
}

// プレイヤー統計テーブル更新
function updatePlayerStatsTable() {
  const tbody = document.getElementById("playerStatsBody");
  tbody.innerHTML = "";

  const players = Object.entries(playerStats)
    .map(([name, stats]) => ({
      name,
      winRate: ((stats.wins / stats.games) * 100).toFixed(1),
      taskRate:
        stats.tasksTotal > 0
          ? ((stats.tasksCompleted / stats.tasksTotal) * 100).toFixed(1)
          : 0,
      wins: stats.wins,
      games: stats.games,
    }))
    .sort((a, b) => b.winRate - a.winRate);

  players.forEach((player) => {
    const row = tbody.insertRow();
    row.innerHTML = `
            <td>${player.name}</td>
            <td>${player.winRate}</td>
            <td>${player.taskRate}</td>
            <td>${player.wins}</td>
            <td>${player.games}</td>
        `;
  });
}

// ロール統計テーブル更新
function updateRoleStatsTable() {
  const tbody = document.getElementById("roleStatsBody");
  tbody.innerHTML = "";

  const roles = Object.entries(roleStats)
    .map(([name, stats]) => ({
      name,
      winRate: ((stats.wins / stats.games) * 100).toFixed(1),
      wins: stats.wins,
      games: stats.games,
    }))
    .sort((a, b) => b.winRate - a.winRate);

  roles.forEach((role) => {
    const row = tbody.insertRow();
    row.innerHTML = `
            <td>${role.name}</td>
            <td>${role.winRate}</td>
            <td>${role.wins}</td>
            <td>${role.games}</td>
        `;
  });
}

// ヒートマップ更新
let currentSortedRole = null;
let currentSortDirection = "desc";

function updateHeatmap() {
  const container = document.getElementById("heatmapContainer");

  let players = Object.keys(playerRoleMatrix);
  const roles = [
    ...new Set(Object.values(playerRoleMatrix).flatMap((r) => Object.keys(r))),
  ].sort();

  if (players.length === 0 || roles.length === 0) {
    container.innerHTML = '<p class="text-gray-500">データがありません</p>';
    return;
  }

  // ソート適用
  if (currentSortedRole) {
    players = players.sort((a, b) => {
      const aData = playerRoleMatrix[a][currentSortedRole] || {
        count: 0,
        wins: 0,
      };
      const bData = playerRoleMatrix[b][currentSortedRole] || {
        count: 0,
        wins: 0,
      };
      const aValue = aData.count;
      const bValue = bData.count;
      return currentSortDirection === "desc"
        ? bValue - aValue
        : aValue - bValue;
    });
  } else {
    players = players.sort();
  }

  // 最大値を取得
  const maxValue = Math.max(
    ...Object.values(playerRoleMatrix).flatMap((r) =>
      Object.values(r).map((v) => v.count)
    )
  );

  let html = '<div class="heatmap-wrapper"><table class="heatmap-table">';

  // ヘッダー行
  html += '<thead><tr><th class="heatmap-header corner">プレイヤー / 役職</th>';
  roles.forEach((role) => {
    const sortedClass = currentSortedRole === role ? "sorted" : "";
    const sortIcon =
      currentSortedRole === role
        ? currentSortDirection === "desc"
          ? " ▼"
          : " ▲"
        : "";
    html += `<th class="heatmap-header ${sortedClass}" onclick="sortHeatmapByRole('${role}')" title="クリックで${role}の回数順にソート">${role}${sortIcon}</th>`;
  });
  html += "</tr></thead>";

  // データ行
  html += "<tbody>";
  players.forEach((player, playerIndex) => {
    html += `<tr><td class="heatmap-header player-header">${player}</td>`;
    roles.forEach((role, roleIndex) => {
      const data = (playerRoleMatrix[player] &&
        playerRoleMatrix[player][role]) || { count: 0, wins: 0 };
      const count = data.count;
      const winRate = count > 0 ? ((data.wins / count) * 100).toFixed(0) : 0;
      const color = getHeatmapColor(count, maxValue, parseFloat(winRate));
      const cellClass = count > 0 ? "heatmap-cell" : "heatmap-cell empty";
      const displayContent =
        count > 0
          ? `<div class="heatmap-cell-content"><span class="heatmap-play-count">${count}</span><span class="heatmap-win-rate">${winRate}%</span></div>`
          : '<div class="heatmap-cell-content"><span>−</span></div>';
      html += `<td class="${cellClass}" style="background-color: ${color};" data-player="${player}" data-role="${role}" data-count="${count}" data-wins="${data.wins}" data-winrate="${winRate}" title="${player} - ${role}: ${count}回プレイ / 勝率${winRate}%">${displayContent}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody>";

  html += "</table></div>";
  container.innerHTML = html;

  // ヒートマップセルにホバーアニメーション追加
  const cells = container.querySelectorAll(".heatmap-cell");
  cells.forEach((cell) => {
    cell.addEventListener("mouseenter", function () {
      const player = this.getAttribute("data-player");

      anime({
        targets: this,
        scale: 1.1,
        duration: 250,
        easing: "easeOutCubic",
      });

      // 同じプレイヤーの行をハイライト
      container.querySelectorAll(`[data-player="${player}"]`).forEach((c) => {
        if (c !== this) {
          c.style.opacity = "0.4";
        }
      });
    });

    cell.addEventListener("mouseleave", function () {
      anime({
        targets: this,
        scale: 1,
        duration: 250,
        easing: "easeOutCubic",
      });

      // 全セルの透明度を戻す
      container.querySelectorAll(".heatmap-cell").forEach((c) => {
        c.style.opacity = "1";
      });
    });

    // クリックで詳細情報表示
    cell.addEventListener("click", function () {
      const count = this.getAttribute("data-count");

      if (count > 0) {
        anime({
          targets: this,
          scale: [1, 1.15, 1],
          rotate: [0, 5, -5, 0],
          duration: 500,
          easing: "easeInOutQuad",
        });
      }
    });
  });

  // 初期表示アニメーション
  anime({
    targets: container.querySelectorAll(".heatmap-cell"),
    opacity: [0, 1],
    scale: [0.85, 1],
    duration: 600,
    delay: anime.stagger(8, { from: "center" }),
    easing: "easeOutCubic",
  });
}

// 役職ごとのソート
function sortHeatmapByRole(role) {
  if (currentSortedRole === role) {
    // 同じ列をクリックした場合、方向を切り替え
    currentSortDirection = currentSortDirection === "desc" ? "asc" : "desc";
  } else {
    // 新しい列をクリックした場合、降順でソート
    currentSortedRole = role;
    currentSortDirection = "desc";
  }

  // ヘッダーのパルスアニメーション
  const header = event.target;
  anime({
    targets: header,
    scale: [1, 1.08, 1],
    backgroundColor: ["#f1f5f9", "#dbeafe", "#f1f5f9"],
    duration: 400,
    easing: "easeOutCubic",
  });

  // 既存の行を取得
  const container = document.getElementById("heatmapContainer");
  const tbody = container.querySelector("tbody");
  const rows = tbody ? Array.from(tbody.querySelectorAll("tr")) : [];

  if (rows.length === 0) {
    updateHeatmap();
    return;
  }

  // 行を左にスライドアウト
  anime({
    targets: rows,
    translateX: [-30, -50],
    opacity: [1, 0],
    duration: 300,
    delay: anime.stagger(15),
    easing: "easeInCubic",
    complete: function () {
      // データを更新
      updateHeatmap();

      // 新しい行を取得してアニメーション
      setTimeout(() => {
        const newRows = container
          .querySelector("tbody")
          ?.querySelectorAll("tr");
        if (newRows) {
          // 右からスライドイン
          anime({
            targets: Array.from(newRows),
            translateX: [50, 0],
            opacity: [0, 1],
            scale: [0.95, 1],
            duration: 450,
            delay: anime.stagger(20),
            easing: "easeOutCubic",
          });
        }
      }, 50);
    },
  });
}

// テーブルソート
function sortTable(tableId, columnIndex) {
  const table = document.getElementById(tableId);
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const header = table.querySelectorAll("th")[columnIndex];

  // ソート方向の決定
  const isAscending = header.classList.contains("sorted-desc");

  // すべてのヘッダーからソートクラスを削除
  table.querySelectorAll("th").forEach((th) => {
    th.classList.remove("sorted-asc", "sorted-desc");
  });

  // 新しいソートクラスを追加
  header.classList.add(isAscending ? "sorted-asc" : "sorted-desc");

  // ヘッダーのパルスアニメーション
  anime({
    targets: header,
    scale: [1, 1.05, 1],
    duration: 300,
    easing: "easeInOutQuad",
  });

  // 既存の行をフェードアウト
  anime({
    targets: rows,
    opacity: [1, 0],
    translateX: [-10, -30],
    duration: 250,
    easing: "easeInQuad",
    complete: function () {
      // ソート実行
      rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();

        // 数値として比較
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return isAscending ? aNum - bNum : bNum - aNum;
        }

        // 文字列として比較
        return isAscending
          ? aValue.localeCompare(bValue, "ja")
          : bValue.localeCompare(aValue, "ja");
      });

      // 行を再配置
      tbody.innerHTML = "";
      rows.forEach((row) => tbody.appendChild(row));

      // 新しい順序でフェードイン
      rows.forEach((row, index) => {
        anime({
          targets: row,
          translateX: [30, 0],
          translateY: [-15, 0],
          opacity: [0, 1],
          scale: [0.95, 1],
          duration: 400,
          delay: index * 30,
          easing: "easeOutCubic",
        });
      });
    },
  });
}

// フィルター機能
function setRecentGames(count) {
  document.getElementById("customGameCount").value = count;
  document.querySelectorAll(".preset-buttons .btn-secondary").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");
}

function applyFilters() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const customCount = document.getElementById("customGameCount").value;

  filteredGames = [...allGames];

  // 日時フィルター
  if (startDate) {
    const start = new Date(startDate);
    filteredGames = filteredGames.filter(
      (game) => new Date(game.start_time) >= start
    );
  }

  if (endDate) {
    const end = new Date(endDate);
    filteredGames = filteredGames.filter(
      (game) => new Date(game.end_time) <= end
    );
  }

  // ゲーム数フィルター
  if (customCount && customCount > 0) {
    filteredGames = filteredGames.slice(0, parseInt(customCount));
  }

  processData();
  updateUI();

  // アニメーション
  anime({
    targets: ".card",
    scale: [0.98, 1],
    opacity: [0.7, 1],
    duration: 400,
    easing: "easeOutQuad",
  });
}

function resetFilters() {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("customGameCount").value = "";
  document.querySelectorAll(".preset-buttons .btn-secondary").forEach((btn) => {
    btn.classList.remove("active");
  });

  filteredGames = [...allGames];
  processData();
  updateUI();

  // アニメーション
  anime({
    targets: ".card",
    scale: [0.98, 1],
    opacity: [0.7, 1],
    duration: 400,
    easing: "easeOutQuad",
  });
}

// ページロード時の初期化
window.addEventListener("load", () => {
  // ローディングアニメーション
  anime({
    targets: ".card",
    translateY: [30, 0],
    opacity: [0, 1],
    duration: 600,
    delay: anime.stagger(100),
    easing: "easeOutQuad",
  });

  loadData();
});
