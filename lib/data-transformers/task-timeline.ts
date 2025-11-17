import type { TaskTimelineData, TransformerOptions } from "./types";
import { applyCommonFilters, getPlayerKey } from "./utils";

export function buildTaskTimelineData(options: TransformerOptions): TaskTimelineData | null {
  const games = applyCommonFilters(options);
  const targetGame = games[0];

  if (!targetGame) {
    return null;
  }

  const playerFilter = options.selectedPlayerIds;
  const playerLookup = new Map<number, string>();
  Object.values(targetGame.players.data).forEach((record) => {
    playerLookup.set(record.identity.player_id, getPlayerKey(record));
  });

  const points = targetGame.events.timeline
    .filter((event) => event.event_type === "TaskCompleted")
    .filter((event) => {
      if (!playerFilter || playerFilter.size === 0 || event.player_id === undefined) {
        return true;
      }
      const uuid = playerLookup.get(event.player_id);
      return uuid ? playerFilter.has(uuid) : false;
    })
    .map((event) => ({
      elapsedSeconds: event.elapsed_time ?? 0,
      totalTasksCompleted: event.total_tasks_completed ?? 0,
      playerName: event.player_name ?? "",
    }));

  const taskTotal = Object.values(targetGame.players.data).reduce(
    (sum, record) => sum + (record.progression.tasks_total ?? 0),
    0
  );

  return {
    gameId: targetGame.schema.game_id,
    points,
    taskTotal,
  };
}
