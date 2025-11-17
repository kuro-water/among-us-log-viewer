import type { PlayerRadarData, PlayerRadarMetric, TransformerOptions } from "./types";
import { applyCommonFilters, buildPlayerAggregates, pickPrimaryPlayer } from "./utils";

export function buildPlayerRadarData(options: TransformerOptions): PlayerRadarData | null {
  const games = applyCommonFilters(options);
  const aggregates = buildPlayerAggregates(games, options.selectedPlayerIds);
  const player = pickPrimaryPlayer(aggregates, options.selectedPlayerIds);

  if (!player) {
    return null;
  }

  const totals = Array.from(aggregates.values());
  const playerPerGame = (value: number) => (player.appearances > 0 ? value / player.appearances : 0);
  const otherPerGame = (aggValue: number, appearances: number) =>
    appearances > 0 ? aggValue / appearances : 0;

  const maxTasks = Math.max(
    ...totals.map((agg) => otherPerGame(agg.tasksCompleted, agg.appearances)),
    1
  );
  const maxKills = Math.max(
    ...totals.map((agg) => otherPerGame(agg.kills, agg.appearances)),
    1
  );
  const maxMovement = Math.max(
    ...totals.map((agg) => otherPerGame(agg.movementDistance, agg.appearances)),
    1
  );
  const maxButtons = Math.max(
    ...totals.map((agg) => otherPerGame(agg.emergencyButtons, agg.appearances)),
    1
  );
  const maxAlive = Math.max(
    ...totals.map((agg) => otherPerGame(agg.timeAlive, agg.appearances)),
    1
  );

  const metrics: PlayerRadarMetric[] = [
    {
      label: "Win Rate",
      value: player.appearances > 0 ? (player.wins / player.appearances) * 100 : 0,
      max: 100,
    },
    {
      label: "Tasks / Game",
      value: playerPerGame(player.tasksCompleted),
      max: maxTasks,
    },
    {
      label: "Kills / Game",
      value: playerPerGame(player.kills),
      max: maxKills,
    },
    {
      label: "Movement",
      value: playerPerGame(player.movementDistance),
      max: maxMovement,
    },
    {
      label: "Emergency Uses",
      value: playerPerGame(player.emergencyButtons),
      max: maxButtons,
    },
    {
      label: "Time Alive",
      value: playerPerGame(player.timeAlive),
      max: maxAlive,
    },
  ];

  return {
    playerUuid: player.uuid,
    playerName: player.name,
    metrics,
  };
}
