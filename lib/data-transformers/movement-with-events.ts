import type { GameData, GameEvent } from '@/types/game-data.types';

export interface MovementEventData {
  playerName: string;
  playerUuid: string;
  time: number;
  distance: number;
  events: GameEvent[];
}

/**
 * Calculate movement distance with event markers for a single game
 */
export function calculateMovementWithEvents(game: GameData): MovementEventData[] {
  const playerData: Record<string, MovementEventData> = {};

  // Initialize player data with movement snapshots
  Object.values(game.players.data).forEach((player) => {
    const uuid = player.identity.player_uuid;
    const name = player.identity.player_name;
    const snapshotKey = player.timeseries_refs.movement_snapshots_key;
    const snapshots = game.timeseries.movement_snapshots[snapshotKey] || [];

    if (!playerData[uuid]) {
      playerData[uuid] = {
        playerName: name,
        playerUuid: uuid,
        time: 0,
        distance: player.counters.movement_distance,
        events: [],
      };
    }

    // Calculate cumulative distance over time
    // This is simplified - in reality we'd need to calculate from snapshot positions
    playerData[uuid].distance = player.counters.movement_distance;
  });

  // Add events for each player
  game.events.timeline.forEach((event) => {
    if (event.player_id !== undefined) {
      const player = game.players.data[event.player_id.toString()];
      if (player) {
        const uuid = player.identity.player_uuid;
        if (playerData[uuid]) {
          playerData[uuid].events.push(event);
        }
      }
    }
  });

  return Object.values(playerData).sort((a, b) =>
    a.playerName.localeCompare(b.playerName)
  );
}

export interface MovementTimelinePoint {
  time: number;
  distance: number;
  event?: GameEvent;
}

/**
 * Calculate detailed movement timeline for a specific player
 */
export function calculatePlayerMovementTimeline(
  game: GameData,
  playerUuid: string
): MovementTimelinePoint[] {
  const player = Object.values(game.players.data).find(
    (p) => p.identity.player_uuid === playerUuid
  );

  if (!player) {
    return [];
  }

  const snapshotKey = player.timeseries_refs.movement_snapshots_key;
  const snapshots = game.timeseries.movement_snapshots[snapshotKey] || [];
  const timeline: MovementTimelinePoint[] = [];

  // Calculate cumulative distance from snapshots
  let cumulativeDistance = 0;
  for (let i = 0; i < snapshots.length; i++) {
    const snapshot = snapshots[i];
    
    if (i > 0) {
      const prev = snapshots[i - 1];
      const dx = snapshot.x - prev.x;
      const dy = snapshot.y - prev.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      cumulativeDistance += distance;
    }

    timeline.push({
      time: snapshot.t,
      distance: cumulativeDistance,
    });
  }

  // Add events to corresponding timeline points
  const playerEvents = game.events.timeline.filter(
    (event) => event.player_id === player.identity.player_id
  );

  playerEvents.forEach((event) => {
    // Find closest timeline point
    const closestPoint = timeline.reduce((closest, point) =>
      Math.abs(point.time - event.elapsed_time) < Math.abs(closest.time - event.elapsed_time)
        ? point
        : closest
    );

    if (closestPoint) {
      closestPoint.event = event;
    }
  });

  return timeline;
}
