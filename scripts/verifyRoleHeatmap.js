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

// RoleAxis: filter > 0, sort desc
const roleAxis = Array.from(roleTotals.entries())
  .filter(([, total]) => total > 0)
  .sort((a, b) => b[1] - a[1])
  .map(([role]) => role);

console.log("Role Axis:", roleAxis);

// Just show if any roles are excluded due to 0
const zeroRoles = [];
for (const [r, tot] of roleTotals.entries()) {
  if (tot === 0) zeroRoles.push(r);
}
console.log("Zero roles:", zeroRoles.length ? zeroRoles : "none");

// Check that no slicing was applied (simulate if the previous MAX_ROLES would slice the array)
const MAX_ROLES = 12;
const withSlice = roleAxis.slice(0, MAX_ROLES);
console.log("Role Count (without slice):", roleAxis.length);
console.log("Role Count (with slice):", withSlice.length);
