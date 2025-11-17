import { GameData, TaskTimelineData } from '@/types/game-data.types';

/**
 * Generate task completion timeline for a single game
 */
export function generateTaskTimeline(game: GameData): TaskTimelineData[] {
  const taskEvents = game.events.timeline.filter(
    event => event.event_type === 'TaskCompleted' && event.total_tasks_completed !== undefined
  );

  return taskEvents.map(event => ({
    timestamp: event.timestamp,
    elapsed_time: event.elapsed_time,
    total_tasks_completed: event.total_tasks_completed!,
  }));
}
