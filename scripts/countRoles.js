const fs = require("fs");
const path = require("path");
const sample = fs.readFileSync(
  path.join(__dirname, "..", "public", "game_history_sample.jsonl"),
  "utf-8"
);
const lines = sample.trim().split("\n").filter(Boolean);
const roleTotals = new Map();

for (const line of lines) {
  const game = JSON.parse(line);
  const players = Object.values(game.players.data || {});
  for (const player of players) {
    const role = (player.role && player.role.main_role) || "Unknown";
    const current = roleTotals.get(role) || 0;
    roleTotals.set(role, current + 1);
  }
}

const sorted = Array.from(roleTotals.entries()).sort((a, b) => b[1] - a[1]);
console.log("Total roles found:", sorted.length);
console.log(sorted.map(([r, n]) => `${r}: ${n}`).join("\n"));

// Show roles with zero - just for completeness
const allRoles = new Set(sorted.map(([r]) => r));
console.log("\nRoles with zero play count (none expected):");
for (const r of allRoles) {
  const count = roleTotals.get(r) || 0;
  if (count === 0) {
    console.log(r);
  }
}
