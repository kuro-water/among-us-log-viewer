import type { GameData } from '@/types/game-data.types';

export interface TaskTimelineData {
  time: number; // seconds from game start
  tasksCompleted: number;
  totalTasks: number;
  completionPercentage: number;
}

/**
 * Calculate task completion timeline for a single game
 */
export function calculateTaskTimeline(game: GameData): TaskTimelineData[] {
  const timeline: TaskTimelineData[] = [];
  
  // Calculate total tasks for crewmates
  const totalTasks = Object.values(game.players.data)
    .reduce((sum, player) => sum + player.progression.tasks_total, 0);

  // Collect all task completion events
  const taskEvents = game.events.timeline
    .filter((event) => event.event_type === 'TaskCompleted')
    .sort((a, b) => a.elapsed_time - b.elapsed_time);

  // Build timeline with cumulative task count
  let cumulativeTasks = 0;
  
  // Add initial point
  timeline.push({
    time: 0,
    tasksCompleted: 0,
    totalTasks,
    completionPercentage: 0,
  });

  // Add a point for each task completion
  taskEvents.forEach((event, index) => {
    cumulativeTasks = event.total_tasks_completed || (index + 1);
    timeline.push({
      time: event.elapsed_time,
      tasksCompleted: cumulativeTasks,
      totalTasks,
      completionPercentage: totalTasks > 0 ? (cumulativeTasks / totalTasks) * 100 : 0,
    });
  });

  // Add final point at game end
  if (timeline.length > 0) {
    const lastPoint = timeline[timeline.length - 1];
    if (lastPoint.time < game.match.duration_seconds) {
      timeline.push({
        time: game.match.duration_seconds,
        tasksCompleted: lastPoint.tasksCompleted,
        totalTasks,
        completionPercentage: lastPoint.completionPercentage,
      });
    }
  }

  return timeline;
}
